/**
 * controllers/spin.controller.ts
 *
 * Handles the Lucky Spin Wheel logic:
 *  - POST /execute   — public spin (fingerprint-gated, 24-hour cooldown)
 *  - GET  /admin/rewards — list all rewards
 *  - POST /admin/rewards — bulk-save rewards
 *  - GET  /admin/logs    — recent spin activity
 */

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const isProd = process.env.NODE_ENV === "production";
const COOLDOWN_MS = isProd ? 24 * 60 * 60 * 1000 : 60 * 1000; // 24h in prod, 1m in dev

// ── Public: Check spin status ───────────────────────────────────────────────

export async function checkSpinStatus(req: Request, res: Response) {
  try {
    const { fingerprint } = req.query;
    if (!fingerprint || typeof fingerprint !== "string") {
      return res.status(400).json({ success: false, message: "Missing fingerprint" });
    }

    const existing = await prisma.anonymousSpin.findUnique({
      where: { fingerprint },
    });

    if (existing) {
      const isProd = process.env.NODE_ENV === "production";
      const COOLDOWN_MS = isProd ? 24 * 60 * 60 * 1000 : 60 * 1000;
      const elapsed = Date.now() - existing.lastSpunAt.getTime();

      if (elapsed < COOLDOWN_MS) {
        return res.json({
          success: true,
          canSpin: false,
          msRemaining: COOLDOWN_MS - elapsed,
        });
      }
    }

    return res.json({ success: true, canSpin: true });
  } catch (err) {
    console.error("Check spin status error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// ── Public: Get active rewards ──────────────────────────────────────────────

export async function getPublicSpinRewards(_req: Request, res: Response) {
  try {
    const rewards = await prisma.spinReward.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return res.json({ success: true, data: rewards });
  } catch (err) {
    console.error("Get public spin rewards error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// ── Public: Execute a spin ──────────────────────────────────────────────────

export async function executeSpin(req: Request, res: Response) {
  try {
    const { fingerprint } = req.body;

    if (!fingerprint || typeof fingerprint !== "string" || fingerprint.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing fingerprint.",
      });
    }

    // 1. Check cooldown
    const existing = await prisma.anonymousSpin.findUnique({
      where: { fingerprint },
    });

    if (existing) {
      const elapsed = Date.now() - existing.lastSpunAt.getTime();
      if (elapsed < COOLDOWN_MS) {
        return res.status(400).json({
          success: false,
          message: "You have already spun today. Come back later!",
          msRemaining: COOLDOWN_MS - elapsed,
        });
      }
    }

    // 2. Fetch active rewards from DB
    const rewards = await prisma.spinReward.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (rewards.length === 0) {
      return res.status(503).json({
        success: false,
        message: "The spin wheel is not configured yet. Please try again later.",
      });
    }

    // 3. Weighted random selection
    const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    let winningIndex = 0;

    for (let i = 0; i < rewards.length; i++) {
      random -= rewards[i].weight;
      if (random <= 0) {
        winningIndex = i;
        break;
      }
    }

    const reward = rewards[winningIndex];

    // 4. Upsert the anonymous spin record
    await prisma.anonymousSpin.upsert({
      where: { fingerprint },
      update: { reward: reward.label, lastSpunAt: new Date() },
      create: { fingerprint, reward: reward.label },
    });

    return res.json({
      success: true,
      winningIndex,
      reward: reward.label,
    });
  } catch (err) {
    console.error("Spin execute error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// ── Admin: Get all rewards ──────────────────────────────────────────────────

export async function getSpinRewards(_req: Request, res: Response) {
  try {
    const rewards = await prisma.spinReward.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return res.json({ success: true, data: rewards });
  } catch (err) {
    console.error("Get spin rewards error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// ── Admin: Bulk save rewards ────────────────────────────────────────────────
// Expects { rewards: Array<{ id?, label, color, weight, sortOrder, isActive }> }
// Items with an id are updated; items without an id are created.
// Items present in the DB but not in the array are deleted.

export async function saveSpinRewards(req: Request, res: Response) {
  try {
    const { rewards } = req.body;

    if (!Array.isArray(rewards)) {
      return res.status(400).json({ success: false, message: "rewards must be an array." });
    }

    // Validate each item
    for (const r of rewards) {
      if (!r.label || typeof r.label !== "string" || r.label.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Each reward must have a label." });
      }
      if (typeof r.weight !== "number" || r.weight < 1) {
        return res.status(400).json({ success: false, message: "Weight must be at least 1." });
      }
    }

    // Get existing IDs to determine deletions
    const existingRewards = await prisma.spinReward.findMany({ select: { id: true } });
    const incomingIds = rewards.filter((r: { id?: string }) => r.id).map((r: { id: string }) => r.id);
    const toDelete = existingRewards.filter((e) => !incomingIds.includes(e.id)).map((e) => e.id);

    // Transaction: delete removed, upsert the rest
    await prisma.$transaction(async (tx) => {
      if (toDelete.length > 0) {
        await tx.spinReward.deleteMany({ where: { id: { in: toDelete } } });
      }

      for (let i = 0; i < rewards.length; i++) {
        const r = rewards[i];
        const data = {
          label: r.label.trim(),
          color: r.color || "#00d4ff",
          weight: r.weight,
          sortOrder: i,
          isActive: r.isActive !== false,
        };

        if (r.id) {
          await tx.spinReward.update({ where: { id: r.id }, data });
        } else {
          await tx.spinReward.create({ data });
        }
      }
    });

    // Return updated list
    const updated = await prisma.spinReward.findMany({ orderBy: { sortOrder: "asc" } });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Save spin rewards error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// ── Admin: Get spin logs ────────────────────────────────────────────────────

export async function getSpinLogs(_req: Request, res: Response) {
  try {
    const logs = await prisma.anonymousSpin.findMany({
      orderBy: { lastSpunAt: "desc" },
      take: 200,
    });
    return res.json({ success: true, data: logs });
  } catch (err) {
    console.error("Get spin logs error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// ── Cleanup helper (called from the scheduled interval in index.ts) ─────────

export async function cleanupExpiredSpins() {
  try {
    const cutoff = new Date(Date.now() - COOLDOWN_MS);
    const { count } = await prisma.anonymousSpin.deleteMany({
      where: { lastSpunAt: { lt: cutoff } },
    });
    if (count > 0) console.log(`🎡 Cleaned up ${count} expired spin records`);
  } catch (err) {
    console.error("Spin cleanup error:", err);
  }
}
