/**
 * routes/games.routes.ts
 */

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
} from "../controllers/games.controller";
import { requireAdmin } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { publicLimiter, adminLimiter } from "../middleware/rateLimit.middleware";
import { uploadGameImage } from "../middleware/upload.middleware";

// Note: validate middleware is no longer used for create/update because
// validation is now done inside the controller (after file upload runs).
// It's still importable for other routes that don't involve multipart data.

const router = Router();

// ── Public routes ────────────────────────────────────────────────────────────

// GET /games?category=Slots&search=lion
router.get("/", publicLimiter, getGames);

// GET /games/:id
router.get("/:id", publicLimiter, getGameById);

// ── Admin routes (all require valid JWT with admin role) ─────────────────────

// GET /games/admin/all
router.get("/admin/all", adminLimiter, requireAdmin, adminGetGames);

// POST /games/admin — create (multipart/form-data or JSON)
// uploadGameImage runs multer + magic-byte check; req.file is set if an image was sent
router.post(
  "/admin",
  adminLimiter,
  requireAdmin,
  uploadGameImage,
  createGame
);

// PATCH /games/admin/reorder — must be BEFORE /:id routes to avoid param collision
router.patch("/admin/reorder", adminLimiter, requireAdmin, reorderGames);

// PUT /games/admin/:id — update (multipart/form-data or JSON)
router.put(
  "/admin/:id",
  adminLimiter,
  requireAdmin,
  uploadGameImage,
  updateGame
);

// PATCH /games/admin/:id/toggle — toggle active status
router.patch("/admin/:id/toggle", adminLimiter, requireAdmin, toggleGame);

// DELETE /games/admin/:id — delete game + image cleanup
router.delete("/admin/:id", adminLimiter, requireAdmin, deleteGame);

export default router;