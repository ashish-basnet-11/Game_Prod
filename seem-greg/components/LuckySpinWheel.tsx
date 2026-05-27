"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { executeSpin, getPublicSpinRewardsApi, SpinReward } from "@/lib/api";

const TG_USERNAME = "YOUR_TG_USERNAME"; // Replace with your actual Telegram handle

// ── Wheel Component ──────────────────────────────────────────────────────────

export default function LuckySpinWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [rewards, setRewards] = useState<SpinReward[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ reward: string; fingerprint: string } | null>(null);
  const [cooldown, setCooldown] = useState<number | null>(null); // ms remaining
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  // ── Load FingerprintJS ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const FingerprintJS = (await import("@fingerprintjs/fingerprintjs")).default;
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        if (!cancelled) setFingerprint(result.visitorId);
      } catch {
        if (!cancelled) setError("Could not verify your device. Please try again.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch active rewards for wheel rendering ────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const active = await getPublicSpinRewardsApi();
        setRewards(active);
      } catch {
        setRewards([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Draw the wheel ──────────────────────────────────────────────────────────
  const drawWheel = useCallback((rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas || rewards.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 340;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 8;
    const segAngle = (2 * Math.PI) / rewards.length;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    // Draw segments
    for (let i = 0; i < rewards.length; i++) {
      const startAngle = i * segAngle;
      const endAngle = startAngle + segAngle;

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = rewards[i].color + "cc";
      ctx.fill();

      // Segment border
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label text
      ctx.save();
      ctx.rotate(startAngle + segAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${rewards.length > 8 ? 10 : 13}px 'Orbitron', sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 4;

      const label = rewards[i].label;
      const maxChars = rewards.length > 8 ? 10 : 14;
      const displayLabel = label.length > maxChars ? label.slice(0, maxChars - 1) + "…" : label;
      ctx.fillText(displayLabel, radius - 18, 4);
      ctx.restore();
    }

    ctx.restore();

    // Centre hub
    const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
    hubGrad.addColorStop(0, "#1a1a3e");
    hubGrad.addColorStop(1, "#0d0d2b");
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,212,255,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hub text
    ctx.fillStyle = "#00d4ff";
    ctx.font = "bold 10px 'Orbitron', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", cx, cy);

    // Outer ring glow
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 3, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(0,212,255,0.25)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [rewards]);

  // Initial draw
  useEffect(() => {
    if (rewards.length > 0) drawWheel(0);
  }, [rewards, drawWheel]);

  // ── Cooldown timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (cooldown === null || cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev === null || prev <= 1000) {
          clearInterval(interval);
          return null;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // ── Format cooldown display ─────────────────────────────────────────────────
  function formatCooldown(ms: number) {
    const totalSecs = Math.ceil(ms / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // ── Handle Spin ─────────────────────────────────────────────────────────────
  async function handleSpin() {
    if (!fingerprint || spinning || rewards.length === 0) return;
    setError("");
    setResult(null);
    setSpinning(true);

    try {
      const data = await executeSpin(fingerprint);

      if (!data.success) {
        if (data.msRemaining) {
          setCooldown(data.msRemaining);
        }
        setError(data.message || "Spin failed.");
        setSpinning(false);
        return;
      }

      // Animate to the winning segment
      const winIndex = data.winningIndex ?? 0;
      const segAngle = 360 / rewards.length;
      // Target: align winning segment with the pointer (top-right, at ~0 degrees)
      // We spin multiple full rotations + offset to land on the winning segment
      const targetAngle = 360 * 6 + (360 - winIndex * segAngle - segAngle / 2);
      const startRotation = rotationRef.current;
      const totalRotation = targetAngle;
      const duration = 5000; // 5 seconds
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        // Cubic ease-out for natural deceleration
        const eased = 1 - Math.pow(1 - t, 3);
        const currentAngle = startRotation + totalRotation * eased;
        const radians = (currentAngle * Math.PI) / 180;

        drawWheel(radians);
        rotationRef.current = currentAngle;

        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Spin complete!
          setSpinning(false);
          setResult({
            reward: data.reward || "Unknown Prize",
            fingerprint: fingerprint!,
          });
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    } catch {
      setError("Something went wrong. Please try again.");
      setSpinning(false);
    }
  }

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ── Telegram claim URL ──────────────────────────────────────────────────────
  function getClaimUrl() {
    if (!result) return "#";
    const text = encodeURIComponent(
      `Hi! I just won "${result.reward}" on the Lucky Spin! 🎉\nVerification Code: ${result.fingerprint}`
    );
    return `https://t.me/${TG_USERNAME}?text=${text}`;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return null; // Don't flash content
  if (rewards.length === 0) return null; // No wheel configured

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-display tracking-[0.3em] uppercase mb-2"
            style={{ color: "rgba(0,212,255,0.6)" }}>
            — DAILY LUCKY DRAW —
          </p>
          <h2 className="font-display font-black text-3xl md:text-4xl text-white">
            SPIN & <span style={{ color: "#e63946" }}>WIN</span>
          </h2>
          <div className="deco-line w-40 mx-auto mt-3 mb-4" />
          <p className="text-white/50 text-sm font-body max-w-md mx-auto">
            Spin the wheel once every 24 hours for a chance to win exclusive bonuses and rewards!
          </p>
        </div>

        {/* Wheel + Controls Layout */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">

          {/* Wheel Container */}
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute -inset-4 rounded-full opacity-30 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(0,212,255,0.15), transparent 70%)",
              }}
            />

            {/* Pointer triangle (top center) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "12px solid transparent",
                  borderRight: "12px solid transparent",
                  borderTop: "20px solid #e63946",
                  filter: "drop-shadow(0 0 8px rgba(230,57,70,0.6))",
                }}
              />
            </div>

            <canvas
              ref={canvasRef}
              className="rounded-full"
              style={{
                filter: spinning
                  ? "drop-shadow(0 0 30px rgba(0,212,255,0.3))"
                  : "drop-shadow(0 0 15px rgba(0,212,255,0.15))",
                transition: "filter 0.3s",
              }}
            />
          </div>

          {/* Right side: actions + info */}
          <div className="flex flex-col items-center md:items-start gap-4 max-w-xs text-center md:text-left">

            {/* Error message */}
            {error && !cooldown && (
              <div className="w-full px-4 py-3 rounded-xl text-sm font-body"
                style={{
                  background: "rgba(230,57,70,0.1)",
                  border: "1px solid rgba(230,57,70,0.3)",
                  color: "#e63946",
                }}>
                {error}
              </div>
            )}

            {/* Cooldown state */}
            {cooldown && cooldown > 0 ? (
              <div className="w-full">
                <div className="rounded-xl p-5 text-center"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                  <p className="text-xs font-display tracking-widest uppercase text-white/40 mb-2">
                    NEXT SPIN IN
                  </p>
                  <p className="font-display font-black text-3xl tracking-wider"
                    style={{ color: "#00d4ff" }}>
                    {formatCooldown(cooldown)}
                  </p>
                  <p className="text-[10px] font-body text-white/30 mt-2">
                    Come back later for another spin!
                  </p>
                </div>
              </div>
            ) : result ? (
              /* Prize result */
              <div className="w-full">
                <div className="rounded-xl p-5 text-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(230,57,70,0.12), rgba(0,212,255,0.08))",
                    border: "1px solid rgba(230,57,70,0.25)",
                    boxShadow: "0 0 30px rgba(230,57,70,0.1)",
                  }}>
                  <p className="text-4xl mb-2">🎉</p>
                  <p className="text-xs font-display tracking-widest uppercase text-white/50 mb-1">
                    YOU WON
                  </p>
                  <p className="font-display font-black text-xl text-white mb-4">
                    {result.reward}
                  </p>
                  <a
                    href={getClaimUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold text-sm tracking-widest text-white transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #0088cc, #00aadd)",
                      boxShadow: "0 4px 20px rgba(0,136,204,0.4)",
                    }}
                  >
                    💬 Claim Bonus on Telegram
                  </a>
                  <p className="text-[10px] font-body text-white/25 mt-3">
                    Code: {result.fingerprint.slice(0, 12)}…
                  </p>
                </div>
              </div>
            ) : (
              /* Default: Spin button */
              <>
                <button
                  onClick={handleSpin}
                  disabled={spinning || !fingerprint}
                  className="w-full md:w-auto px-10 py-4 rounded-xl font-display font-black text-lg tracking-widest uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  style={{
                    background: spinning
                      ? "rgba(255,255,255,0.05)"
                      : "linear-gradient(135deg, #e63946, #c1121f)",
                    boxShadow: spinning
                      ? "none"
                      : "0 4px 30px rgba(230,57,70,0.4)",
                    color: "#fff",
                    border: spinning ? "1px solid rgba(255,255,255,0.1)" : "none",
                  }}
                >
                  {spinning ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      SPINNING...
                    </span>
                  ) : "🎰 SPIN NOW"}
                </button>

                <p className="text-[11px] font-body text-white/30">
                  One free spin every 24 hours. No login required.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
