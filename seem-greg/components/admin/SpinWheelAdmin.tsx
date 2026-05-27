"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  SpinReward,
  getSpinRewards,
  saveSpinRewards,
  getSpinLogs,
  SpinLog,
} from "@/lib/api";

// ── Default colour palette for new segments ──────────────────────────────────
const PALETTE = [
  "#e63946", "#00d4ff", "#ffd700", "#4caf50", "#ff6b35",
  "#a855f7", "#06b6d4", "#ec4899", "#14b8a6", "#f97316",
];

export default function SpinWheelAdmin() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rewards, setRewards] = useState<Partial<SpinReward>[]>([]);
  const [logs, setLogs] = useState<SpinLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLogs, setShowLogs] = useState(false);

  // ── Fetch rewards ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await getSpinRewards();
        setRewards(data.length > 0 ? data : getDefaultRewards());
      } catch {
        setRewards(getDefaultRewards());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function getDefaultRewards(): Partial<SpinReward>[] {
    return [
      { label: "$5 Bonus", color: "#e63946", weight: 3, isActive: true },
      { label: "Free Spin", color: "#00d4ff", weight: 5, isActive: true },
      { label: "50 Credits", color: "#ffd700", weight: 2, isActive: true },
      { label: "Better Luck", color: "#4caf50", weight: 8, isActive: true },
      { label: "$10 Bonus", color: "#ff6b35", weight: 1, isActive: true },
      { label: "Mystery Box", color: "#a855f7", weight: 2, isActive: true },
    ];
  }

  // ── Draw preview wheel ────────────────────────────────────────────────────
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const active = rewards.filter((r) => r.isActive !== false);
    if (!canvas || active.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 8;
    const segAngle = (2 * Math.PI) / active.length;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < active.length; i++) {
      const startAngle = i * segAngle;
      const endAngle = startAngle + segAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = (active[i].color || PALETTE[i % PALETTE.length]) + "cc";
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + segAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${active.length > 8 ? 9 : 11}px 'Orbitron', sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 4;
      const label = active[i].label || "?";
      const maxChars = active.length > 8 ? 10 : 14;
      ctx.fillText(label.length > maxChars ? label.slice(0, maxChars - 1) + "…" : label, radius - 14, 4);
      ctx.restore();
    }

    // Hub
    const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
    hubGrad.addColorStop(0, "#1a1a3e");
    hubGrad.addColorStop(1, "#0d0d2b");
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,212,255,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#00d4ff";
    ctx.font = "bold 8px 'Orbitron', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", cx, cy);

    // Outer glow
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 3, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(0,212,255,0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [rewards]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function addReward() {
    setRewards((prev) => [
      ...prev,
      {
        label: "",
        color: PALETTE[prev.length % PALETTE.length],
        weight: 1,
        isActive: true,
      },
    ]);
  }

  function removeReward(index: number) {
    setRewards((prev) => prev.filter((_, i) => i !== index));
  }

  function updateReward(index: number, field: string, value: string | number | boolean) {
    setRewards((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  }

  async function handleSave() {
    setError("");
    setSuccess("");
    const valid = rewards.filter((r) => r.label && r.label.trim().length > 0);
    if (valid.length < 2) {
      setError("You need at least 2 reward items.");
      return;
    }

    setSaving(true);
    try {
      const data = await saveSpinRewards(
        rewards.map((r, i) => ({
          ...r,
          sortOrder: i,
          weight: r.weight && r.weight >= 1 ? r.weight : 1,
        }))
      );
      setRewards(data);
      setSuccess("Spin wheel saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLoadLogs() {
    try {
      const data = await getSpinLogs();
      setLogs(data);
      setShowLogs(true);
    } catch {
      setError("Failed to load spin logs.");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-white/30 text-xs font-body">Loading spin config...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-black text-lg text-white tracking-wide">
            🎡 Spin Wheel Config
          </h3>
          <p className="font-body text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            Configure reward segments displayed on the public spin wheel
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLoadLogs}
            className="px-4 py-2 rounded-lg font-display font-bold text-[10px] tracking-widest uppercase transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            📋 Spin Logs
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg font-display font-bold text-[10px] tracking-widest uppercase transition-all disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #e63946, #c1121f)",
              color: "#fff",
              boxShadow: "0 2px 12px rgba(230,57,70,0.3)",
            }}
          >
            {saving ? "SAVING..." : "💾 SAVE"}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm font-body"
          style={{ background: "rgba(230,57,70,0.1)", border: "1px solid rgba(230,57,70,0.3)", color: "#e63946" }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl text-sm font-body"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}>
          ✅ {success}
        </div>
      )}

      {/* Layout: Editor + Preview */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Rewards Editor */}
        <div className="flex-1 space-y-3">
          {rewards.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Color picker */}
              <input
                type="color"
                value={r.color || PALETTE[i % PALETTE.length]}
                onChange={(e) => updateReward(i, "color", e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                title="Segment color"
              />

              {/* Label */}
              <input
                type="text"
                value={r.label || ""}
                onChange={(e) => updateReward(i, "label", e.target.value)}
                placeholder="Reward label..."
                className="flex-1 px-3 py-2 rounded-lg font-body text-sm text-white placeholder-white/20 outline-none min-w-0"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />

              {/* Weight */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[9px] font-display text-white/30 tracking-wider">WT</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={r.weight || 1}
                  onChange={(e) => updateReward(i, "weight", parseInt(e.target.value) || 1)}
                  className="w-14 px-2 py-2 rounded-lg font-body text-sm text-white text-center outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>

              {/* Active toggle */}
              <button
                onClick={() => updateReward(i, "isActive", !r.isActive)}
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all"
                style={{
                  background: r.isActive !== false ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                  border: r.isActive !== false ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  color: r.isActive !== false ? "#22c55e" : "rgba(255,255,255,0.2)",
                }}
                title={r.isActive !== false ? "Active" : "Inactive"}
              >
                {r.isActive !== false ? "✓" : "—"}
              </button>

              {/* Delete */}
              <button
                onClick={() => removeReward(i)}
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all"
                style={{
                  background: "rgba(230,57,70,0.08)",
                  border: "1px solid rgba(230,57,70,0.2)",
                  color: "#e63946",
                }}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={addReward}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs tracking-widest uppercase transition-all"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px dashed rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            + ADD REWARD
          </button>
        </div>

        {/* Live Preview */}
        <div className="flex flex-col items-center gap-4 lg:w-80 shrink-0">
          <p className="text-[10px] font-display tracking-widest uppercase text-white/30">
            LIVE PREVIEW
          </p>
          <div className="relative">
            {/* Pointer */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: "16px solid #e63946",
                  filter: "drop-shadow(0 0 6px rgba(230,57,70,0.5))",
                }}
              />
            </div>
            <canvas
              ref={canvasRef}
              className="rounded-full"
              style={{ filter: "drop-shadow(0 0 12px rgba(0,212,255,0.12))" }}
            />
          </div>
          <p className="text-[10px] font-body text-white/25 text-center">
            {rewards.filter((r) => r.isActive !== false).length} active segments
          </p>
        </div>
      </div>

      {/* Spin Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogs(false); }}
        >
          <div className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #0d0d2b, #07071a)",
              border: "1px solid rgba(255,255,255,0.1)",
              maxHeight: "80vh",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="font-display font-bold text-white">📋 Recent Spin Logs</h3>
              <button onClick={() => setShowLogs(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/5">
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2" style={{ maxHeight: "60vh" }}>
              {logs.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-8">No spin logs yet.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <p className="text-white text-xs font-display font-bold">{log.reward}</p>
                      <p className="text-[10px] font-body text-white/25 mt-0.5">
                        {log.fingerprint.slice(0, 16)}…
                      </p>
                    </div>
                    <p className="text-[10px] font-body text-white/30">
                      {new Date(log.lastSpunAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
