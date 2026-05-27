import { Router } from "express";
import {
  getGames,
  getGameById,
  adminGetGames,
  createGame,
  updateGame,
  toggleGame,
  deleteGame,
  reorderGames,
  createGameSchema,
  updateGameSchema,
} from "../controllers/games.controller";
import { requireAdmin } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { publicLimiter, adminLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// ── Public routes ──────────────────────────────────────────────
// GET /games?category=Slots&search=lion
router.get("/", publicLimiter, getGames);

// GET /games/:id
router.get("/:id", publicLimiter, getGameById);

// ── Admin routes (all require valid JWT with admin role) ────────
// GET /games/admin/all
router.get("/admin/all", adminLimiter, requireAdmin, adminGetGames);

// POST /games/admin  — create
router.post("/admin", adminLimiter, requireAdmin, validate(createGameSchema), createGame);

// PATCH /games/admin/reorder  — must be before /:id routes
router.patch("/admin/reorder", adminLimiter, requireAdmin, reorderGames);

// PUT /games/admin/:id  — update
router.put("/admin/:id", adminLimiter, requireAdmin, validate(updateGameSchema), updateGame);

// PATCH /games/admin/:id/toggle  — toggle active
router.patch("/admin/:id/toggle", adminLimiter, requireAdmin, toggleGame);

// DELETE /games/admin/:id  — delete
router.delete("/admin/:id", adminLimiter, requireAdmin, deleteGame);

export default router;
