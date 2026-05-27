import { Router } from "express";
import {
    login,
    logout,
    refresh,
    me,
    revokeAllSessions,
    loginSchema,
} from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// POST /auth/login — rate limited strictly
router.post("/login", authLimiter, validate(loginSchema), login);

// POST /auth/logout — requires valid session
router.post("/logout", requireAuth, logout);

// POST /auth/refresh — uses refresh token cookie to issue new access token
// Note: no requireAuth here since the access token may already be expired
router.post("/refresh", authLimiter, refresh);

// GET /auth/me — validate current session
router.get("/me", requireAuth, me);

// DELETE /auth/sessions — revoke all refresh tokens (nuclear option)
router.delete("/sessions", requireAuth, revokeAllSessions);

export default router;