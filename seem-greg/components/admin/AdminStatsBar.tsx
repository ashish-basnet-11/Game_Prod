import { Game } from "@/lib/api";

export default function AdminStatsBar({ games }: { games: Game[] }) {
    const total = games.length;
    const active = games.filter(g => g.isActive).length;
    const hidden = total - active;
    const hotCount = games.filter(g => g.badge === "HOT").length;
    const newCount = games.filter(g => g.isNew).length;

    const stats = [
        { label: "Total Games", value: total, color: "#00d4ff", icon: "🎮" },
        { label: "Live", value: active, color: "#22c55e", icon: "✅" },
        { label: "Hidden", value: hidden, color: "#e63946", icon: "🚫" },
        { label: "Hot", value: hotCount, color: "#f97316", icon: "🔥" },
        { label: "New", value: newCount, color: "#a855f7", icon: "⭐" },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {stats.map(s => (
                <div
                    key={s.label}
                    className="rounded-xl p-4"
                    style={{
                        background: `${s.color}0a`,
                        border: `1px solid ${s.color}22`,
                    }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">{s.icon}</span>
                        <span
                            className="font-display font-black text-2xl"
                            style={{ color: s.color }}
                        >
                            {s.value}
                        </span>
                    </div>
                    <p className="font-display text-[10px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {s.label}
                    </p>
                </div>
            ))}
        </div>
    );
}