/**
 * controllers/games.controller.ts
 */

import path from "path";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { UPLOAD_DIR, deleteUploadedFile } from "../middleware/upload.middleware";

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converts a stored filename (e.g. "abc-123.jpg") to the public URL path
 * that the static file middleware serves (e.g. "/uploads/games/abc-123.jpg").
 * Returns null if no filename is provided.
 */
function filenameToUrl(filename: string | undefined): string | null {
  if (!filename) return null;
  return `/uploads/games/${filename}`;
}

/**
 * Given an existing imageUrl stored in the DB (e.g. "/uploads/games/abc.jpg"),
 * resolves the absolute filesystem path so we can delete the old file.
 */
function imageUrlToFilePath(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  const filename = path.basename(imageUrl);
  return path.join(UPLOAD_DIR, filename);
}

// ── Validation schemas ───────────────────────────────────────────────────────

export const createGameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  emoji: z.string().min(1, "Emoji is required").max(10),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex code"),
  badge: z.enum(["HOT", "NEW", "TOP", ""]).default(""),
  category: z.enum(["Slots", "Fish Games", "Table Games"]),
  description: z.string().min(1, "Description is required").max(300),
  gameUrl: z.string().max(500).optional().or(z.literal("")),
  isNew: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateGameSchema = createGameSchema.partial();

// ── Public controllers ───────────────────────────────────────────────────────

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

// ── Admin controllers ────────────────────────────────────────────────────────

/**
 * GET /games/admin/all
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
 * POST /games/admin
 * Create a new game. Accepts multipart/form-data OR application/json.
 *
 * When sending multipart/form-data (with an image), boolean/number fields
 * arrive as strings — we coerce them here before Zod validation.
 */
export async function createGame(req: Request, res: Response) {
  // Coerce multipart string values to their proper types
  const body = coerceFormFields(req.body);

  const parsed = createGameSchema.safeParse(body);
  if (!parsed.success) {
    // Clean up any uploaded file if validation fails
    if (req.file) deleteUploadedFile(req.file.path);
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const imageUrl = filenameToUrl(req.file?.filename);

  try {
    const game = await prisma.game.create({
      data: {
        ...parsed.data,
        ...(imageUrl ? { imageUrl } : {}),
      },
    });
    res.status(201).json({ success: true, data: game });
  } catch (err) {
    // If DB write fails, don't leave orphaned files on disk
    if (req.file) deleteUploadedFile(req.file.path);
    console.error("createGame error:", err);
    res.status(500).json({ success: false, message: "Failed to create game" });
  }
}

/**
 * PUT /games/admin/:id
 * Update an existing game. Image is optional.
 * If a new image is uploaded, the old one is deleted from disk.
 * To explicitly remove the existing image without replacing it,
 * send removeImage=true in the body.
 */
export async function updateGame(req: Request, res: Response) {
  const { id } = req.params;
  const body = coerceFormFields(req.body);

  const parsed = updateGameSchema.safeParse(body);
  if (!parsed.success) {
    if (req.file) deleteUploadedFile(req.file.path);
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const existing = await prisma.game.findUnique({ where: { id } });
    if (!existing) {
      if (req.file) deleteUploadedFile(req.file.path);
      res.status(404).json({ success: false, message: "Game not found" });
      return;
    }

    // Determine the new imageUrl value:
    //   • New file uploaded       → use it, delete old file
    //   • removeImage=true sent   → set null, delete old file
    //   • Neither                 → keep existing value (undefined = no change)
    let imageUrlUpdate: { imageUrl: string | null } | undefined;

    if (req.file) {
      // Replace image
      imageUrlUpdate = { imageUrl: filenameToUrl(req.file.filename)! };
      if (existing.imageUrl) {
        deleteUploadedFile(imageUrlToFilePath(existing.imageUrl)!);
      }
    } else if (body.removeImage === true) {
      // Explicit removal
      imageUrlUpdate = { imageUrl: null };
      if (existing.imageUrl) {
        deleteUploadedFile(imageUrlToFilePath(existing.imageUrl)!);
      }
    }

    const game = await prisma.game.update({
      where: { id },
      data: {
        ...parsed.data,
        ...imageUrlUpdate,
      },
    });

    res.json({ success: true, data: game });
  } catch (err) {
    if (req.file) deleteUploadedFile(req.file.path);
    console.error("updateGame error:", err);
    res.status(500).json({ success: false, message: "Failed to update game" });
  }
}

/**
 * PATCH /games/admin/:id/toggle
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
 * DELETE /games/admin/:id
 * Permanently delete a game and its associated image file (if any).
 */
export async function deleteGame(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const existing = await prisma.game.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Game not found" });
      return;
    }

    await prisma.game.delete({ where: { id } });

    // Clean up image after successful DB deletion
    if (existing.imageUrl) {
      deleteUploadedFile(imageUrlToFilePath(existing.imageUrl)!);
    }

    res.json({ success: true, message: "Game deleted successfully" });
  } catch (err) {
    console.error("deleteGame error:", err);
    res.status(500).json({ success: false, message: "Failed to delete game" });
  }
}

/**
 * PATCH /games/admin/reorder
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

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Coerces multipart/form-data string values into the types Zod expects.
 * When a form is submitted as multipart, all fields arrive as strings.
 */
function coerceFormFields(body: Record<string, unknown>): Record<string, unknown> {
  const result = { ...body };

  // Booleans
  for (const key of ["isNew", "isActive", "removeImage"] as const) {
    if (key in result) {
      if (result[key] === "true") result[key] = true;
      else if (result[key] === "false") result[key] = false;
    }
  }

  // Numbers
  if ("sortOrder" in result && typeof result.sortOrder === "string") {
    const n = parseInt(result.sortOrder, 10);
    result.sortOrder = isNaN(n) ? 0 : n;
  }

  return result;
}