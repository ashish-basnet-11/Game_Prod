"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    Game, ApiError,
    adminGetGames,
    adminToggleGame,
    adminDeleteGame,
} from "@/lib/api";
import GameFormModal from "@/components/admin/GameFormModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminStatsBar from "@/components/admin/AdminStatsBar";

export default function AdminGamesPage() {
    const router = useRouter();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchGames = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await adminGetGames();
            setGames(data);
        } catch (err) {
            if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
                router.replace("/admin/login");
            } else {
                setError("Failed to load games. Is the API running?");
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => { fetchGames(); }, [fetchGames]);

    const handleToggle = async (game: Game) => {
        // Optimistic update
        setGames(prev => prev.map(g => g.id === game.id ? { ...g, isActive: !g.isActive } : g));
        try {
            await toast.promise(adminToggleGame(game.id), {
                loading: "Updating status...",
                success: "Status updated!",
                error: "Failed to update status."
            });
        } catch {
            // Revert on failure
            setGames(prev => prev.map(g => g.id === game.id ? { ...g, isActive: game.isActive } : g));
        }
    };

    const handleDelete = async (game: Game) => {
        setIsDeleting(true);
        try {
            await toast.promise(adminDeleteGame(game.id), {
                loading: "Deleting game...",
                success: "Game deleted!",
                error: "Failed to delete game."
            });
            setGames(prev => prev.filter(g => g.id !== game.id));
            setDeleteTarget(null);
        } catch (err) {
            // Handled by toast
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = games.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.category.toLowerCase().includes(search.toLowerCase())
    );

    const badgeColor = (badge: string) =>
        badge === "HOT" ? "#e63946"
            : badge === "NEW" ? "#00d4ff"
                : badge === "TOP" ? "#ffd700"
                    : "transparent";

    return (
        <div className="p-6 md:p-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display font-black text-2xl text-white tracking-wide">Game Management</h1>
                    <p className="font-body text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Add, edit, or remove games from the platform
                    </p>
                </div>
                <button
                    onClick={() => { setEditingGame(null); setFormOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-sm tracking-widest uppercase transition-all whitespace-nowrap"
                    style={{
                        background: "linear-gradient(135deg, #e63946, #c1121f)",
                        boxShadow: "0 4px 20px rgba(230,57,70,0.4)",
                        color: "white",
                    }}
                >
                    <span className="text-lg leading-none">+</span> Add Game
                </button>
            </div>

            <AdminStatsBar games={games} />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 mt-8">
                <div className="relative flex-1 max-w-sm">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name or category..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg font-body text-sm text-white placeholder-white/25 outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,212,255,0.4)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                </div>
                <p className="font-body text-sm self-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {filtered.length} of {games.length} games
                </p>
            </div>

            {/* Error */}
            {error && (
                <div
                    className="mb-6 px-4 py-3 rounded-xl font-body text-sm flex items-center gap-3"
                    style={{ background: "rgba(230,57,70,0.1)", border: "1px solid rgba(230,57,70,0.3)", color: "#e63946" }}
                >
                    <span>⚠️</span> {error}
                    <button onClick={fetchGames} className="ml-auto underline text-xs">Retry</button>
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                {/* Table header */}
                <div
                    className="grid items-center gap-4 px-5 py-3 text-[10px] font-display font-bold tracking-widest uppercase"
                    style={{
                        gridTemplateColumns: "40px 1fr 120px 60px 90px 80px",
                        background: "rgba(255,255,255,0.03)",
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        color: "rgba(255,255,255,0.35)",
                    }}
                >
                    <span>Icon</span>
                    <span>Name / Description</span>
                    <span>Category</span>
                    <span>Badge</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Loading games...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-4xl mb-3">🎲</p>
                        <p className="font-display font-bold text-white mb-1">No games found</p>
                        <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {search ? "Try a different search term" : `Click "Add Game" to get started`}
                        </p>
                    </div>
                ) : (
                    filtered.map((game, i) => (
                        <div
                            key={game.id}
                            className="grid items-center gap-4 px-5 py-4 transition-colors"
                            style={{
                                gridTemplateColumns: "40px 1fr 120px 60px 90px 80px",
                                borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                                background: game.isActive ? "transparent" : "rgba(0,0,0,0.18)",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                            onMouseLeave={e => (e.currentTarget.style.background = game.isActive ? "transparent" : "rgba(0,0,0,0.18)")}
                        >
                            {/* Icon / Image */}
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 overflow-hidden"
                                style={{
                                    background: `${game.color}18`,
                                    border: `1px solid ${game.color}33`,
                                    opacity: game.isActive ? 1 : 0.4,
                                }}
                            >
                                {game.imageUrl ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${game.imageUrl}`}
                                        alt={game.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    game.emoji
                                )}
                            </div>

                            {/* Name + desc */}
                            <div style={{ opacity: game.isActive ? 1 : 0.5 }}>
                                <p className="font-display font-bold text-sm text-white">{game.name}</p>
                                <p className="font-body text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.38)" }}>
                                    {game.description}
                                </p>
                            </div>

                            {/* Category */}
                            <span
                                className="px-2.5 py-1 rounded-lg font-display font-bold text-[10px] tracking-wider truncate"
                                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
                            >
                                {game.category}
                            </span>

                            {/* Badge */}
                            <span
                                className="px-2.5 py-1 rounded-lg font-display font-bold text-[10px] tracking-wider text-center"
                                style={{
                                    background: game.badge ? `${badgeColor(game.badge)}18` : "rgba(255,255,255,0.03)",
                                    color: game.badge ? badgeColor(game.badge) : "rgba(255,255,255,0.2)",
                                    border: game.badge ? `1px solid ${badgeColor(game.badge)}33` : "1px solid rgba(255,255,255,0.06)",
                                }}
                            >
                                {game.badge || "—"}
                            </span>

                            {/* Live toggle */}
                            <button
                                onClick={() => handleToggle(game)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display font-bold text-[10px] tracking-wider transition-all"
                                style={{
                                    background: game.isActive ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
                                    border: game.isActive ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,255,255,0.08)",
                                    color: game.isActive ? "#22c55e" : "rgba(255,255,255,0.3)",
                                }}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${game.isActive ? "bg-green-400" : "bg-white/20"}`} />
                                {game.isActive ? "LIVE" : "HIDDEN"}
                            </button>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setEditingGame(game); setFormOpen(true); }}
                                    title="Edit"
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
                                    style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,212,255,0.18)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,212,255,0.08)")}
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(game)}
                                    title="Delete"
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
                                    style={{ background: "rgba(230,57,70,0.08)", border: "1px solid rgba(230,57,70,0.2)", color: "#e63946" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(230,57,70,0.18)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(230,57,70,0.08)")}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            {formOpen && (
                <GameFormModal
                    game={editingGame}
                    onClose={() => { setFormOpen(false); setEditingGame(null); }}
                    onSaved={() => { setFormOpen(false); setEditingGame(null); fetchGames(); }}
                />
            )}
            {deleteTarget && (
                <DeleteConfirmModal
                    game={deleteTarget}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={() => handleDelete(deleteTarget)}
                    deleting={isDeleting}
                />
            )}
        </div>
    );
}