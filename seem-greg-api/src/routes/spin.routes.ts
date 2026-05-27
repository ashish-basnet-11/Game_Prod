/**
 * routes/spin.routes.ts
 */

import { Router } from "express";
import {
  executeSpin,
  checkSpinStatus,
  getPublicSpinRewards,
  getSpinRewards,
  saveSpinRewards,
  getSpinLogs,
} from "../controllers/spin.controller";
import { requireAdmin } from "../middleware/auth.middleware";
import { publicLimiter, adminLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// ── Public ───────────────────────────────────────────────────────────────────

// GET /spin/status — check if a fingerprint is currently on cooldown
router.get("/status", publicLimiter, checkSpinStatus);

// GET /spin/rewards — list all active rewards for public UI
router.get("/rewards", publicLimiter, getPublicSpinRewards);

// POST /spin/execute — anonymous user spins the wheel
router.post("/execute", publicLimiter, executeSpin);

// ── Admin (protected) ────────────────────────────────────────────────────────

// GET /spin/admin/rewards — list all configurable rewards
router.get("/admin/rewards", adminLimiter, requireAdmin, getSpinRewards);

// POST /spin/admin/rewards — bulk-save rewards (create/update/delete)
router.post("/admin/rewards", adminLimiter, requireAdmin, saveSpinRewards);

// GET /spin/admin/logs — recent spin activity
router.get("/admin/logs", adminLimiter, requireAdmin, getSpinLogs);

export default router;
