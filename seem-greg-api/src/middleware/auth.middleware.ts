import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

/**
 * Reads the access token from the httpOnly cookie (not Authorization header).
 * Also validates the CSRF token to prevent cross-site request forgery.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies["sg_access"];

  if (!token) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }

  // ── CSRF check ──────────────────────────────────────────────────────────────
  // GET requests are safe (read-only), so only check on state-changing methods.
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const csrfFromCookie = req.cookies["sg_csrf"];
    const csrfFromHeader = req.headers["x-csrf-token"] as string;

    if (!csrfFromCookie || !csrfFromHeader) {
      res.status(403).json({ success: false, message: "CSRF token missing" });
      return;
    }

    // Constant-time comparison — prevents timing attacks on the CSRF token
    const cookieBuf = Buffer.from(csrfFromCookie);
    const headerBuf = Buffer.from(csrfFromHeader);

    if (
      cookieBuf.length !== headerBuf.length ||
      !crypto.timingSafeEqual(cookieBuf, headerBuf)
    ) {
      res.status(403).json({ success: false, message: "CSRF token invalid" });
      return;
    }
  }

  // ── JWT verification ────────────────────────────────────────────────────────
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      // Tell the frontend to attempt a refresh
      res.status(401).json({ success: false, message: "Access token expired", code: "TOKEN_EXPIRED" });
    } else {
      res.status(401).json({ success: false, message: "Invalid token" });
    }
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin" && req.user?.role !== "superadmin") {
      res.status(403).json({ success: false, message: "Admin access required" });
      return;
    }
    next();
  });
}