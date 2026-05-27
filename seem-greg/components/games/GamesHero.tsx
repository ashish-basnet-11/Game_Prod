export default function GamesHero() {
    return (
        <section
            className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20"
            style={{ background: "linear-gradient(160deg, #07071a 0%, #10082e 55%, #07071a 100%)" }}
        >
            {/* Hex grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V17L28 1l28 16v33z' fill='none' stroke='%2300d4ff' stroke-width='0.5'/%3E%3C/svg%3E")`,
                    backgroundSize: "56px 100px",
                }}
            />
            {/* Orbs */}
            <div className="absolute top-10 right-0 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(108,63,197,0.2) 0%, transparent 70%)", filter: "blur(20px)" }} />
            <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(230,57,70,0.12) 0%, transparent 70%)", filter: "blur(20px)" }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative">
                {/* Eyebrow */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, #e63946)" }} />
                    <span className="font-display text-[10px] tracking-[0.4em] uppercase" style={{ color: "#e63946" }}>
                        Full Game Library
                    </span>
                    <div className="h-px w-10" style={{ background: "linear-gradient(270deg, transparent, #e63946)" }} />
                </div>

                <h1 className="font-display font-black leading-tight mb-5" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
                    <span className="text-white">Browse All </span>
                    <span style={{ WebkitTextStroke: "2px #e63946", color: "transparent", textShadow: "0 0 40px rgba(230,57,70,0.4)" }}>
                        Games
                    </span>
                </h1>

                <p className="font-body text-base max-w-xl mx-auto mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
                    200+ titles across slots, fish games, table games and more. Filter by category or search for your favourite.
                </p>

                {/* Quick stat pills */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {[
                        { icon: "🎰", label: "Slots", count: "120+" },
                        { icon: "🐟", label: "Fish Games", count: "40+" },
                        { icon: "♠️", label: "Table Games", count: "30+" },
                        { icon: "🔥", label: "New Arrivals", count: "10+" },
                    ].map((cat) => (
                        <div
                            key={cat.label}
                            className="flex items-center gap-2 px-4 py-2 rounded-full"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                        >
                            <span className="text-sm">{cat.icon}</span>
                            <span className="font-body text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{cat.label}</span>
                            <span className="font-display font-bold text-xs" style={{ color: "#00d4ff" }}>{cat.count}</span>
                        </div>
                    ))}
                </div>

                <div className="deco-line w-48 mx-auto mt-10" />
            </div>
        </section>
    );
}