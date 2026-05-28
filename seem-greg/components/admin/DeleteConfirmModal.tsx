import { Game } from "@/lib/api";

interface DeleteConfirmModalProps {
    game: Game;
    onCancel: () => void;
    onConfirm: () => void;
    deleting?: boolean;
}

export default function DeleteConfirmModal({ game, onCancel, onConfirm, deleting }: DeleteConfirmModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
            onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div
                className="w-full max-w-sm rounded-2xl p-6"
                style={{
                    background: "linear-gradient(160deg, #0d0d2b, #07071a)",
                    border: "1px solid rgba(230,57,70,0.25)",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
                }}
            >
                {/* Icon */}
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
                    style={{ background: "rgba(230,57,70,0.1)", border: "1px solid rgba(230,57,70,0.25)" }}
                >
                    🗑️
                </div>

                <h2 className="font-display font-black text-white text-lg text-center mb-2 tracking-wide">
                    Delete Game?
                </h2>
                <p className="font-body text-sm text-center mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                    You are about to permanently delete:
                </p>
                <p className="font-display font-bold text-white text-center mb-1">
                    {game.emoji} {game.name}
                </p>
                <p className="font-body text-xs text-center mb-6" style={{ color: "rgba(230,57,70,0.7)" }}>
                    This action cannot be undone.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl font-display font-bold text-sm tracking-wider transition-all"
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.6)",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl font-display font-bold text-sm tracking-wider transition-all"
                        style={{
                            background: deleting ? "rgba(230,57,70,0.4)" : "linear-gradient(135deg, #e63946, #c1121f)",
                            boxShadow: deleting ? "none" : "0 4px 16px rgba(230,57,70,0.4)",
                            color: "white",
                        }}
                    >
                        {deleting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Deleting...
                            </span>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}