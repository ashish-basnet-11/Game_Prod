"use client";
import { useState, useEffect, FormEvent } from "react";
import { Game, adminCreateGame, adminUpdateGame } from "@/lib/api";

type Category = "Slots" | "Fish Games" | "Table Games";
type Badge = "HOT" | "NEW" | "TOP" | "";

interface GameFormModalProps {
    game: Game | null;
    onClose: () => void;
    onSaved: () => void;
}

const CATEGORIES: Category[] = ["Slots", "Fish Games", "Table Games"];
const BADGES: Badge[] = ["", "HOT", "NEW", "TOP"];
const EMOJI_SUGGESTIONS = ["🎰", "💎", "🌋", "🐉", "🦁", "🍓", "🧛", "🎅", "🍀", "🏺", "⚡", "🐠", "🦀", "🔱", "🦈", "🪸", "🚗", "🏁", "⚽", "🐯", "🃏", "🎡", "🎲", "🃟"];
const COLOR_PRESETS = ["#e63946", "#00d4ff", "#ff6b35", "#ffd700", "#6c3fc5", "#22c55e", "#f97316", "#0288d1", "#7b1fa2", "#2e7d32", "#b71c1c", "#00897b"];

const DEFAULT_FORM = {
    name: "",
    emoji: "🎮",
    color: "#e63946",
    badge: "" as Badge,
    category: "Slots" as Category,
    description: "",
    isNew: false,
    gameUrl: "",
    isActive: true, sortOrder: 0,
};

export default function GameFormModal({ game, onClose, onSaved }: GameFormModalProps) {
    const isEdit = !!game;
    const [form, setForm] = useState({ ...DEFAULT_FORM });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (game) {
            setForm({
                name: game.name, emoji: game.emoji, color: game.color,
                badge: game.badge as Badge, category: game.category as Category,
                description: game.description, isNew: game.isNew,
                gameUrl: game.gameUrl || "",
                isActive: game.isActive, sortOrder: game.sortOrder,
            });
        } else {
            setForm({ ...DEFAULT_FORM });
        }
    }, [game]);

    const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");



        setSaving(true);
        try {
            if (isEdit && game) {
                await adminUpdateGame(game.id, form);
            } else {
                await adminCreateGame(form);
            }
            onSaved();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-xl rounded-2xl overflow-hidden flex flex-col"
                style={{
                    background: "linear-gradient(160deg, #0d0d2b, #07071a)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
                    maxHeight: "90vh",
                }}
            >
                {/* Modal header */}
                <div
                    className="flex items-center justify-between px-6 py-4 shrink-0"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                >
                    <div>
                        <h2 className="font-display font-black text-white tracking-wide">
                            {isEdit ? "Edit Game" : "Add New Game"}
                        </h2>
                        <p className="font-body text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {isEdit ? `Editing: ${game?.name}` : "Fill in the details below"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                        ✕
                    </button>
                </div>

                {/* Form body — scrollable */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
                    <div className="p-6 space-y-5">
                        {error && (
                            <div
                                className="px-4 py-3 rounded-xl text-sm font-body"
                                style={{ background: "rgba(230,57,70,0.1)", border: "1px solid rgba(230,57,70,0.3)", color: "#e63946" }}
                            >
                                {error}
                            </div>
                        )}

                        {/* Preview */}
                        <div
                            className="rounded-xl p-4 flex items-center gap-4"
                            style={{ background: `${form.color}12`, border: `1px solid ${form.color}30` }}
                        >
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                                style={{ background: `${form.color}20`, border: `1px solid ${form.color}40` }}
                            >
                                {form.emoji}
                            </div>
                            <div>
                                <p className="font-display font-bold text-white text-sm">
                                    {form.name || "Game Name"}
                                </p>
                                <p className="font-body text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                                    {form.category} {form.badge && `· ${form.badge}`}
                                </p>
                            </div>
                        </div>

                        {/* Name */}
                        <Field label="Game Name">
                            <input
                                type="text" required maxLength={100}
                                value={form.name} onChange={e => set("name", e.target.value)}
                                placeholder="e.g. Blazing Tiki"
                                className="input-field"
                            />
                        </Field>

                        {/* Emoji picker */}
                        <Field label="Emoji Icon">
                            <div className="flex gap-2 items-center flex-wrap">
                                <input
                                    type="text" maxLength={4}
                                    value={form.emoji} onChange={e => set("emoji", e.target.value)}
                                    className="input-field w-20 text-2xl text-center"
                                />
                                <div className="flex flex-wrap gap-1">
                                    {EMOJI_SUGGESTIONS.map(em => (
                                        <button
                                            key={em} type="button"
                                            onClick={() => set("emoji", em)}
                                            className="w-8 h-8 rounded-lg text-lg transition-all hover:scale-110"
                                            style={{
                                                background: form.emoji === em ? "rgba(230,57,70,0.2)" : "rgba(255,255,255,0.05)",
                                                border: form.emoji === em ? "1px solid rgba(230,57,70,0.5)" : "1px solid rgba(255,255,255,0.08)",
                                            }}
                                        >
                                            {em}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Field>

                        {/* Color */}
                        <Field label="Accent Color">
                            <div className="flex gap-2 items-center flex-wrap">
                                <input
                                    type="color" value={form.color}
                                    onChange={e => set("color", e.target.value)}
                                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                                />
                                <input
                                    type="text" maxLength={7}
                                    value={form.color} onChange={e => set("color", e.target.value)}
                                    className="input-field w-28 font-mono text-sm"
                                    placeholder="#e63946"
                                />
                                <div className="flex gap-1 flex-wrap">
                                    {COLOR_PRESETS.map(c => (
                                        <button
                                            key={c} type="button"
                                            onClick={() => set("color", c)}
                                            className="w-6 h-6 rounded-md transition-all hover:scale-110"
                                            style={{
                                                background: c,
                                                border: form.color === c ? "2px solid white" : "2px solid transparent",
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </Field>

                        {/* Category + Badge row */}
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Category">
                                <select
                                    value={form.category}
                                    onChange={e => set("category", e.target.value)}
                                    className="input-field"
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c} style={{ background: "#0d0d2b" }}>{c}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Badge">
                                <select
                                    value={form.badge}
                                    onChange={e => set("badge", e.target.value)}
                                    className="input-field"
                                >
                                    {BADGES.map(b => (
                                        <option key={b} value={b} style={{ background: "#0d0d2b" }}>
                                            {b || "No badge"}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        {/* Description */}
                        <Field label="Description">
                            <textarea
                                required maxLength={300}
                                value={form.description}
                                onChange={e => set("description", e.target.value)}
                                placeholder="Short description shown on the game card..."
                                rows={2}
                                className="input-field resize-none"
                            />
                            <p className="text-right text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                                {form.description.length}/300
                            </p>
                        </Field>

                        {/* ── Game / Download Link Input ── */}
                        <Field label="Game Link / Download URL">
                            <input
                                type="url"
                                value={form.gameUrl}
                                onChange={e => set("gameUrl", e.target.value)}
                                placeholder="https://example.com/download-or-play-link"
                                className="input-field"
                            />
                            <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                                Optional link for direct app downloads or internal game routing
                            </p>
                        </Field>

                        {/* Sort order */}
                        <Field label="Sort Order">
                            <input
                                type="number" min={0}
                                value={form.sortOrder}
                                onChange={e => set("sortOrder", parseInt(e.target.value) || 0)}
                                className="input-field w-28"
                            />
                            <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                                Lower = appears first
                            </p>
                        </Field>

                        {/* Toggles */}
                        <div className="grid grid-cols-2 gap-4">
                            <Toggle
                                label="Mark as New"
                                value={form.isNew}
                                onChange={v => set("isNew", v)}
                                color="#a855f7"
                            />
                            <Toggle
                                label="Active (visible)"
                                value={form.isActive}
                                onChange={v => set("isActive", v)}
                                color="#22c55e"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        className="px-6 py-4 flex justify-end gap-3 shrink-0"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                    >
                        <button
                            type="button" onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-display font-bold text-sm tracking-wider transition-all"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={saving}
                            className="px-6 py-2.5 rounded-xl font-display font-bold text-sm tracking-wider transition-all"
                            style={{
                                background: saving ? "rgba(230,57,70,0.4)" : "linear-gradient(135deg, #e63946, #c1121f)",
                                boxShadow: saving ? "none" : "0 4px 16px rgba(230,57,70,0.35)",
                                color: "white",
                            }}
                        >
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : isEdit ? "Save Changes" : "Create Game"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Input field styles injected inline */}
            <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: rgba(0,212,255,0.5); }
        .input-field option { background: #0d0d2b; }
      `}</style>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block font-display text-[10px] tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                {label}
            </label>
            {children}
        </div>
    );
}

function Toggle({ label, value, onChange, color }: { label: string; value: boolean; onChange: (v: boolean) => void; color: string }) {
    return (
        <div
            className="rounded-xl p-4 cursor-pointer transition-all select-none"
            style={{
                background: value ? `${color}10` : "rgba(255,255,255,0.03)",
                border: `1px solid ${value ? color + "33" : "rgba(255,255,255,0.08)"}`,
            }}
            onClick={() => onChange(!value)}
        >
            <div className="flex items-center justify-between mb-1">
                <span className="font-display text-[10px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {label}
                </span>
                {/* Toggle pill */}
                <div
                    className="w-9 h-5 rounded-full relative transition-all"
                    style={{ background: value ? color : "rgba(255,255,255,0.1)" }}
                >
                    <div
                        className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all"
                        style={{ left: value ? "calc(100% - 18px)" : "2px" }}
                    />
                </div>
            </div>
            <p className="font-body text-sm font-semibold" style={{ color: value ? color : "rgba(255,255,255,0.35)" }}>
                {value ? "Yes" : "No"}
            </p>
        </div>
    );
}