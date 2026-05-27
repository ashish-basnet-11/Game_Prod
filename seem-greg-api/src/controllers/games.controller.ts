import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

// ── Validation schemas ──────────────────────────────────────────────────────

export const createGameSchema = z.object({
  name:        z.string().min(1, "Name is required").max(100),
  emoji:       z.string().min(1, "Emoji is required").max(10),
  color:       z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex code"),
  badge:       z.enum(["HOT", "NEW", "TOP", ""]).default(""),
  category:    z.enum(["Slots", "Fish Games", "Table Games"]),
  description: z.string().min(1, "Description is required").max(300),
  isNew:       z.boolean().default(false),
  isActive:    z.boolean().default(true),
  sortOrder:   z.number().int().min(0).default(0),
});

export const updateGameSchema = createGameSchema.partial();

// ── Public controllers ──────────────────────────────────────────────────────

/**
 * GET /games
 * Returns all active games, sorted by sortOrder then name.
 * Supports optional ?category= and ?search= query params.
 */
export async function getGames(req: Request, res: Response) {
  const { category, search } = req.query;

  try {
    const games = await prisma.game.findMany({
      where: {
        isActive: true,
        ...(category ? { category: String(category) } : {}),
        ...(search
          ? { name: { contains: String(search), mode: "insensitive" } }
          : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    res.json({ success: true, data: games, total: games.length });
  } catch (err) {
    console.error("getGames error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch games" });
  }
}

/**
 * GET /games/:id
 * Returns a single active game by ID.
 */
export async function getGameById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const game = await prisma.game.findFirst({
      where: { id, isActive: true },
    });

    if (!game) {
      res.status(404).json({ success: false, message: "Game not found" });
      return;
    }

    res.json({ success: true, data: game });
  } catch (err) {
    console.error("getGameById error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch game" });
  }
}

// ── Admin controllers ───────────────────────────────────────────────────────

/**
 * GET /admin/games
 * Returns ALL games including inactive (admin only).
 */
export async function adminGetGames(req: Request, res: Response) {
  const { category, search, isActive } = req.query;

  try {
    const games = await prisma.game.findMany({
      where: {
        ...(category ? { category: String(category) } : {}),
        ...(search ? { name: { contains: String(search), mode: "insensitive" } } : {}),
        ...(isActive !== undefined ? { isActive: isActive === "true" } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    res.json({ success: true, data: games, total: games.length });
  } catch (err) {
    console.error("adminGetGames error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch games" });
  }
}

/**
 * POST /admin/games
 * Create a new game.
 */
export async function createGame(req: Request, res: Response) {
  const data = req.body as z.infer<typeof createGameSchema>;

  try {
    const game = await prisma.game.create({ data });
    res.status(201).json({ success: true, data: game });
  } catch (err) {
    console.error("createGame error:", err);
    res.status(500).json({ success: false, message: "Failed to create game" });
  }
}

/**
 * PUT /admin/games/:id
 * Update an existing game.
 */
export async function updateGame(req: Request, res: Response) {
  const { id } = req.params;
  const data = req.body as z.infer<typeof updateGameSchema>;

  try {
    const exists = await prisma.game.findUnique({ where: { id } });
    if (!exists) {
      res.status(404).json({ success: false, message: "Game not found" });
      return;
    }

    const game = await prisma.game.update({ where: { id }, data });
    res.json({ success: true, data: game });
  } catch (err) {
    console.error("updateGame error:", err);
    res.status(500).json({ success: false, message: "Failed to update game" });
  }
}

/**
 * PATCH /admin/games/:id/toggle
 * Toggle a game's isActive status.
 */
export async function toggleGame(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const game = await prisma.game.findUnique({ where: { id } });
    if (!game) {
      res.status(404).json({ success: false, message: "Game not found" });
      return;
    }

    const updated = await prisma.game.update({
      where: { id },
      data: { isActive: !game.isActive },
    });

    res.json({
      success: true,
      data: updated,
      message: `Game ${updated.isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (err) {
    console.error("toggleGame error:", err);
    res.status(500).json({ success: false, message: "Failed to toggle game" });
  }
}

/**
 * DELETE /admin/games/:id
 * Permanently delete a game.
 */
export async function deleteGame(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const exists = await prisma.game.findUnique({ where: { id } });
    if (!exists) {
      res.status(404).json({ success: false, message: "Game not found" });
      return;
    }

    await prisma.game.delete({ where: { id } });
    res.json({ success: true, message: "Game deleted successfully" });
  } catch (err) {
    console.error("deleteGame error:", err);
    res.status(500).json({ success: false, message: "Failed to delete game" });
  }
}

/**
 * PATCH /admin/games/reorder
 * Update sort order for multiple games at once.
 * Body: { games: [{ id: string, sortOrder: number }] }
 */
export async function reorderGames(req: Request, res: Response) {
  const { games } = req.body as { games: { id: string; sortOrder: number }[] };

  if (!Array.isArray(games)) {
    res.status(400).json({ success: false, message: "games must be an array" });
    return;
  }

  try {
    await prisma.$transaction(
      games.map(({ id, sortOrder }) =>
        prisma.game.update({ where: { id }, data: { sortOrder } })
      )
    );

    res.json({ success: true, message: "Games reordered successfully" });
  } catch (err) {
    console.error("reorderGames error:", err);
    res.status(500).json({ success: false, message: "Failed to reorder games" });
  }
}
