import path from "path";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { prisma } from "./lib/prisma";
import { UPLOAD_DIR } from "./middleware/upload.middleware";

import authRoutes from "./routes/auth.routes";
import gamesRoutes from "./routes/games.routes";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Validate required env vars on startup ────────────────────────────────────
const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET", "ALLOWED_ORIGIN"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
}
if ((process.env.JWT_SECRET as string).length < 32) {
  console.error("❌ JWT_SECRET must be at least 32 characters");
  process.exit(1);
}

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  noSniff: true,
  hidePoweredBy: true,
  hsts: process.env.NODE_ENV === "production"
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
}));

// ── CORS — strict origin whitelist ───────────────────────────────────────────
const allowedOrigins = process.env.NODE_ENV === "production"
  ? [process.env.ALLOWED_ORIGIN as string]
  : [process.env.ALLOWED_ORIGIN as string, "http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      if (process.env.NODE_ENV === "production") {
        return callback(new Error("Origin required in production"));
      }
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: ${origin} not allowed`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-CSRF-Token"],
  credentials: true,
  maxAge: 600,
}));

// ── Cookie parser ─────────────────────────────────────────────────────────────
app.use(cookieParser(process.env.COOKIE_SECRET || process.env.JWT_SECRET));

// ── Body parsing — strict size limit ─────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// ── Trust proxy ───────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ── Static file serving for uploaded game images ─────────────────────────────
// Serves files from the uploads/games directory at /uploads/games/*
// - dotfiles (e.g. .htaccess) are never served
// - no directory listing
// - Cache-Control: 30 days in production, no-cache in dev
//
// NOTE: If you put a CDN or Nginx in front of this server in production,
// you should serve /uploads/* directly from Nginx for better performance
// and move this Express static handler to a fallback. Example nginx snippet:
//
//   location /uploads/ {
//     alias /data/uploads/;
//     expires 30d;
//     add_header Cache-Control "public, immutable";
//   }
//
app.use(
  "/uploads/games",
  express.static(UPLOAD_DIR, {
    dotfiles: "deny",
    index: false,
    maxAge: process.env.NODE_ENV === "production" ? "30d" : 0,
    immutable: process.env.NODE_ENV === "production",
    // Only serve known image extensions — belt-and-suspenders against
    // any file that might have been placed in the directory by other means
    setHeaders(res, filePath) {
      const ext = path.extname(filePath).toLowerCase();
      const allowed: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
      };
      const contentType = allowed[ext];
      if (!contentType) {
        // Decline to serve — respond with 403 by ending the response early
        res.status(403).end();
        return;
      }
      res.setHeader("Content-Type", contentType);
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/games", gamesRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const isProd = process.env.NODE_ENV === "production";
  console.error("Unhandled error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(isProd ? {} : { detail: err.message }),
  });
});

// ── Expired refresh token cleanup job ─────────────────────────────────────────
async function cleanupExpiredTokens() {
  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { count } = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: cutoff } },
          { revokedAt: { lt: cutoff } },
        ],
      },
    });
    if (count > 0) console.log(`🧹 Cleaned up ${count} expired refresh tokens`);
  } catch (err) {
    console.error("Token cleanup error:", err);
  }
}

const SIX_HOURS = 6 * 60 * 60 * 1000;
setInterval(cleanupExpiredTokens, SIX_HOURS);

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Seem Greg API running on http://localhost:${PORT}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Allowed origin: ${allowedOrigins.join(", ")}`);
  console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
});