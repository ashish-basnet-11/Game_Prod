import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCESS_TOKEN_EXPIRY = "15m";           // Short-lived access token
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const COOKIE_ACCESS_NAME = "sg_access";
const COOKIE_REFRESH_NAME = "sg_refresh";
const COOKIE_CSRF_NAME = "sg_csrf";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSecureCookieBase(maxAge: number) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,                     // not readable by JS
    secure: isProd,                     // HTTPS only in prod
    sameSite: isProd ? ("none" as const) : ("strict" as const), // none required for cross-site
    maxAge,
    path: "/",
  };
}

/**
 * Issue a short-lived access token + long-lived refresh token.
 * Sets three cookies:
 *  - sg_access   (httpOnly, 15m)   — JWT for API auth
 *  - sg_refresh  (httpOnly, 7d)    — opaque token for rotation
 *  - sg_csrf     (NOT httpOnly, 15m) — value frontend reads and sends back as header
 */
async function issueTokens(
  res: Response,
  user: { id: string; email: string; role: string },
  req?: Request
) {
  const jwtSecret = process.env.JWT_SECRET as string;

  // 1. Access token (JWT)
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  // 2. Refresh token — random opaque bytes, stored hashed in DB
  const rawRefresh = crypto.randomBytes(64).toString("hex");
  const hashedRefresh = crypto.createHash("sha256").update(rawRefresh).digest("hex");

  // Capture device info for session tracking
  const userAgent = req?.headers["user-agent"] || null;
  const ipAddress = req?.ip || req?.headers["x-forwarded-for"]?.toString() || null;

  await prisma.refreshToken.create({
    data: {
      token: hashedRefresh,
      userId: user.id,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    },
  });

  // 3. CSRF token — random value, set in a readable cookie so
  //    the frontend can echo it back in X-CSRF-Token header
  const csrfToken = crypto.randomBytes(32).toString("hex");

  const isProd = process.env.NODE_ENV === "production";

  // Access token cookie
  res.cookie(COOKIE_ACCESS_NAME, accessToken, {
    ...getSecureCookieBase(15 * 60 * 1000), // 15 min
  });

  // Refresh token cookie
  res.cookie(COOKIE_REFRESH_NAME, rawRefresh, {
    ...getSecureCookieBase(REFRESH_TOKEN_EXPIRY),
    path: "/auth", // only sent to /auth/* routes
  });

  // CSRF cookie — readable by JS so frontend can extract it
  res.cookie(COOKIE_CSRF_NAME, csrfToken, {
    httpOnly: false,                    // intentionally readable by JS
    secure: isProd,
    sameSite: isProd ? ("none" as const) : ("strict" as const),
    maxAge: REFRESH_TOKEN_EXPIRY,
    path: "/",
  });

  return { csrfToken };
}

function clearAuthCookies(res: Response) {
  res.clearCookie(COOKIE_ACCESS_NAME, { path: "/" });
  res.clearCookie(COOKIE_REFRESH_NAME, { path: "/auth" });
  res.clearCookie(COOKIE_CSRF_NAME, { path: "/" });
}

// ── Schemas ───────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateEmailSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newEmail: z.string().email("Invalid email address"),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /auth/login
 * Validates credentials, issues httpOnly cookies.
 * Never returns the token in the body — only sets cookies.
 */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always run bcrypt even on missing user — prevents timing attacks
    // that would let an attacker enumerate valid email addresses
    const DUMMY_HASH = "$2a$12$LDvOmGLCk5hRBzf0YvnOneVGCIz.M6JQ7uEWS9R.XxpaSRWYDmJPi";
    const isValid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : (await bcrypt.compare(password, DUMMY_HASH), false);

    if (!user || !isValid) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const { csrfToken } = await issueTokens(res, { id: user.id, email: user.email, role: user.role }, req);

    // Only send non-sensitive user info in body — no token
    res.json({
      success: true,
      data: { user: { id: user.id, email: user.email, role: user.role }, csrfToken },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * POST /auth/refresh
 * Rotates refresh token. Issues a new access + refresh token pair.
 * Old refresh token is revoked in DB (rotation prevents replay attacks).
 */
export async function refresh(req: Request, res: Response) {
  const rawRefresh = req.cookies[COOKIE_REFRESH_NAME];

  if (!rawRefresh) {
    res.status(401).json({ success: false, message: "No refresh token" });
    return;
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(rawRefresh).digest("hex");

    const stored = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    // Reject if not found, revoked, or expired
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      clearAuthCookies(res);
      res.status(401).json({ success: false, message: "Refresh token invalid or expired" });
      return;
    }

    // Revoke old token (rotation — can't reuse)
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    // Issue fresh pair
    const { csrfToken } = await issueTokens(res, {
      id: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    }, req);

    res.json({
      success: true,
      data: { user: { id: stored.user.id, email: stored.user.email, role: stored.user.role }, csrfToken },
    });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * POST /auth/logout
 * Revokes refresh token in DB, clears all cookies.
 */
export async function logout(req: Request, res: Response) {
  const rawRefresh = req.cookies[COOKIE_REFRESH_NAME];

  if (rawRefresh) {
    try {
      const hashedToken = crypto.createHash("sha256").update(rawRefresh).digest("hex");
      await prisma.refreshToken.updateMany({
        where: { token: hashedToken, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Best-effort — still clear cookies
    }
  }

  clearAuthCookies(res);
  res.json({ success: true, message: "Logged out" });
}

/**
 * GET /auth/me
 * Returns current user from the validated JWT (set by middleware).
 * Used by the frontend to check if the session is still valid.
 */
export async function me(req: Request, res: Response) {
  const user = (req as any).user;
  const csrfToken = req.cookies["sg_csrf"] || "";
  res.json({ success: true, data: { user, csrfToken } });
}

/**
 * DELETE /auth/sessions
 * Admin action — revoke ALL refresh tokens for the current user.
 * Use this if you suspect a token has been compromised.
 */
export async function revokeAllSessions(req: Request, res: Response) {
  const user = (req as any).user;

  try {
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    clearAuthCookies(res);
    res.json({ success: true, message: "All sessions revoked" });
  } catch (err) {
    console.error("Revoke sessions error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * PUT /auth/profile
 * Update the current user's email. Requires current password for verification.
 * Superadmin only.
 */
export async function updateEmail(req: Request, res: Response) {
  const user = (req as any).user;
  const { currentPassword, newEmail } = req.body as z.infer<typeof updateEmailSchema>;

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (dbUser.role !== "superadmin") {
      res.status(403).json({ success: false, message: "Superadmin access required" });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, message: "Current password is incorrect" });
      return;
    }

    // Check if email is already taken
    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing && existing.id !== user.id) {
      res.status(409).json({ success: false, message: "Email already in use" });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail },
    });

    // Re-issue tokens with the new email
    const { csrfToken } = await issueTokens(res, { id: updated.id, email: updated.email, role: updated.role }, req);

    res.json({
      success: true,
      data: { user: { id: updated.id, email: updated.email, role: updated.role }, csrfToken },
      message: "Email updated successfully",
    });
  } catch (err) {
    console.error("Update email error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * PUT /auth/password
 * Change the current user's password. Revokes all other sessions.
 * Superadmin only.
 */
export async function updatePassword(req: Request, res: Response) {
  const user = (req as any).user;
  const { currentPassword, newPassword } = req.body as z.infer<typeof updatePasswordSchema>;

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (dbUser.role !== "superadmin") {
      res.status(403).json({ success: false, message: "Superadmin access required" });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, message: "Current password is incorrect" });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    // Revoke all existing sessions for security
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Issue fresh tokens for this session
    const { csrfToken } = await issueTokens(res, { id: dbUser.id, email: dbUser.email, role: dbUser.role }, req);

    res.json({
      success: true,
      data: { csrfToken },
      message: "Password changed successfully. All other sessions have been revoked.",
    });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * GET /auth/sessions
 * List all active (non-revoked, non-expired) sessions for the current user.
 * Returns device info, IP, and creation date.
 * Superadmin only.
 */
export async function getSessions(req: Request, res: Response) {
  const user = (req as any).user;

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "superadmin") {
      res.status(403).json({ success: false, message: "Superadmin access required" });
      return;
    }

    const sessions = await prisma.refreshToken.findMany({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Mark the current session
    const currentRefresh = req.cookies["sg_refresh"];
    let currentSessionHash: string | null = null;
    if (currentRefresh) {
      currentSessionHash = crypto.createHash("sha256").update(currentRefresh).digest("hex");
    }

    // To detect current session, we need to check against the hash
    let currentSessionId: string | null = null;
    if (currentSessionHash) {
      const currentToken = await prisma.refreshToken.findUnique({
        where: { token: currentSessionHash },
        select: { id: true },
      });
      currentSessionId = currentToken?.id || null;
    }

    const sessionsWithCurrent = sessions.map(s => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));

    res.json({ success: true, data: sessionsWithCurrent });
  } catch (err) {
    console.error("Get sessions error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * DELETE /auth/sessions/:id
 * Revoke a specific session by its ID.
 * Superadmin only.
 */
export async function revokeSession(req: Request, res: Response) {
  const user = (req as any).user;
  const { id } = req.params;

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "superadmin") {
      res.status(403).json({ success: false, message: "Superadmin access required" });
      return;
    }

    // Only allow revoking own sessions
    const token = await prisma.refreshToken.findFirst({
      where: { id, userId: user.id, revokedAt: null },
    });

    if (!token) {
      res.status(404).json({ success: false, message: "Session not found" });
      return;
    }

    await prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    res.json({ success: true, message: "Session revoked" });
  } catch (err) {
    console.error("Revoke session error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}