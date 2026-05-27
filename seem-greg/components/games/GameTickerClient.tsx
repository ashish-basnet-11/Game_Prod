// GameTickerClient.tsx
"use client";

import { useEffect, useState } from "react";

interface GameTickerProps {
    scrollingGames: string[];
}

export default function GameTickerClient({ scrollingGames }: GameTickerProps) {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (scrollingGames.length === 0) return;
        const id = setInterval(() => setTick((t) => t + 1), 40);
        return () => clearInterval(id);
    }, [scrollingGames]);

    // Adjust item offset calculation safely if games library length changes dynamically
    const offset = scrollingGames.length > 0
        ? (tick * 0.4) % (scrollingGames.length * 160)
        : 0;

    if (scrollingGames.length === 0) return null;

    return (
        <div
            className="relative overflow-hidden py-2 mb-8"
            style={{ borderBottom: "1px solid rgba(0,212,255,0.12)", background: "rgba(0,0,0,0.3)" }}
        >
            <div
                className="flex gap-10 whitespace-nowrap will-change-transform"
                style={{ transform: `translateX(-${offset}px)`, width: "max-content" }}
            >
                {/* Tripled the list array length to ensure continuous looping without visual gaps */}
                {[...scrollingGames, ...scrollingGames, ...scrollingGames].map((g, i) => (
                    <span
                        key={i}
                        className="text-xs font-display tracking-widest uppercase"
                        style={{ color: i % 2 === 0 ? "rgba(0,212,255,0.6)" : "rgba(255,255,255,0.25)" }}
                    >
                        {g}
                    </span>
                ))}
            </div>
        </div>
    );
}