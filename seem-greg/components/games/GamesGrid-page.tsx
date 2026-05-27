// ============================================================================
// 2. ARCHIVE FILTER GRID (Client Component Section)
// ============================================================================

// components/games/GamesGrid-page.tsx
"use client";

import { Game } from "@/lib/api";
import { useState, useMemo } from "react";

type FilterCategory = "All" | "Slots" | "Fish Games" | "Table Games" | "New";

const categories: FilterCategory[] = ["All", "Slots", "Fish Games", "Table Games", "New"];

const sortOptions = [
  { value: "default", label: "Featured" },
  { value: "name", label: "A – Z" },
  { value: "hot", label: "Hot First" },
  { value: "new", label: "New First" },
];

interface ArchiveGamesGridProps {
  games: Game[];
}

// Renamed from default to explicit named export to prevent layout crashes
export function ArchiveGamesGrid({ games }: ArchiveGamesGridProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  const filtered = useMemo(() => {
    let list = [...games];

    if (activeCategory === "New") {
      list = list.filter((g) => g.isNew);
    } else if (activeCategory !== "All") {
      list = list.filter((g) => g.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q));
    }

    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "hot") list.sort((a, b) => (b.badge === "HOT" ? 1 : 0) - (a.badge === "HOT" ? 1 : 0));
    else if (sort === "new") list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    else list.sort((a, b) => a.sortOrder - b.sortOrder);

    return list;
  }, [games, activeCategory, search, sort]);

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-start md:items-center justify-between">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-lg font-display font-bold text-xs tracking-widest uppercase transition-all duration-200"
              style={{
                background: activeCategory === cat
                  ? "linear-gradient(135deg, #e63946, #c1121f)"
                  : "rgba(255,255,255,0.04)",
                border: activeCategory === cat
                  ? "1px solid #e63946"
                  : "1px solid rgba(255,255,255,0.08)",
                color: activeCategory === cat ? "#fff" : "rgba(255,255,255,0.45)",
                boxShadow: activeCategory === cat ? "0 0 16px rgba(230,57,70,0.35)" : "none",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-52">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg font-body text-sm text-white placeholder-white/30 outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,212,255,0.4)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-lg font-display text-xs tracking-wider text-white outline-none cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value} style={{ background: "#0d0d2b" }}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result count */}
      <p className="font-body text-xs mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>
        Showing{" "}
        <span style={{ color: "#00d4ff" }}>{filtered.length}</span>{" "}
        game{filtered.length !== 1 ? "s" : ""}
        {activeCategory !== "All" && (
          <> in <span style={{ color: "#e63946" }}>{activeCategory}</span></>
        )}
      </p>

      {/* ── Game Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🎲</p>
          <p className="font-display font-bold text-white text-lg mb-2">No games found</p>
          <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Try a different search term or category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </>
  );
}

function GameCard({ game }: { game: Game }) {
  const [hovered, setHovered] = useState(false);
  const hasUrl = !!game.gameUrl?.trim();
  const gameColor = game.color || "#00d4ff";

  const categoryLabel =
    game.category === "Fish Games" ? "FISH"
      : game.category === "Table Games" ? "TABLE"
        : "SLOT";

  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-default select-none animate-fade-in"
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${gameColor}44, ${gameColor}1a)`
          : `linear-gradient(135deg, ${gameColor}28, ${gameColor}0d)`,
        border: `1px solid ${hovered ? gameColor + "88" : gameColor + "33"}`,
        aspectRatio: "3 / 4",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 12px 24px ${gameColor}22, 0 0 15px ${gameColor}11`
          : "none",
        transition: "all 0.25s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card Background Image (if exists) */}
      {game.imageUrl && (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${game.imageUrl}`}
            alt={game.name}
            className="w-full h-full object-cover"
            style={{
              transform: hovered ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
          />
          <div 
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: "linear-gradient(to top, rgba(7, 7, 26, 0.95) 0%, rgba(7, 7, 26, 0.4) 60%, rgba(7, 7, 26, 0.2) 100%)",
              opacity: hovered ? 0.85 : 1,
            }}
          />
        </div>
      )}

      {/* Badge */}
      {game.badge && (
        <span
          className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-display font-bold rounded z-10"
          style={{
            background:
              game.badge === "HOT" ? "#e63946"
                : game.badge === "NEW" ? "#00d4ff"
                  : "#ffd700",
            color: game.badge === "NEW" ? "#07071a" : "#fff",
          }}
        >
          {game.badge}
        </span>
      )}

      {/* Category chip */}
      <span
        className="absolute top-2 right-2 px-1.5 py-0.5 text-[8px] font-display font-bold rounded opacity-60 z-10"
        style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.7)" }}
      >
        {categoryLabel}
      </span>

      {/* Main Content Info (Sliding up naturally on hover) */}
      <div
        className="w-full h-full flex flex-col items-center justify-between p-3 pb-4 transition-transform duration-300 z-10 relative"
        style={{ transform: hovered ? "translateY(-20px)" : "translateY(0)" }}
      >
        {game.imageUrl ? (
          // Spacing element to push title to bottom
          <div className="flex-1" />
        ) : (
          // Emoji fallback
          <div className="flex-1 flex items-center justify-center">
            <span
              className="text-4xl md:text-5xl mb-2"
              style={{
                filter: `drop-shadow(0 0 ${hovered ? "16px" : "6px"} ${gameColor})`,
                transition: "filter 0.25s ease",
              }}
            >
              {game.emoji}
            </span>
          </div>
        )}

        <div className="w-full mt-auto">
          <p className="text-white text-[11px] font-display font-bold text-center leading-tight mb-1">
            {game.name}
          </p>
          <p
            className="text-[9px] font-body text-center leading-tight px-1 transition-opacity duration-200"
            style={{ color: "rgba(255,255,255,0.38)", opacity: hovered ? 0.1 : 1 }}
          >
            {game.description}
          </p>
        </div>
      </div>

      {/* Dual action drawer shelf container */}
      <div
        className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1.5 bg-gradient-to-t from-black/95 via-black/80 to-transparent z-20"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.25s ease",
        }}
      >
        {/* Message Contact Button */}
        <button className="w-full py-1 text-[9px] font-display font-bold text-white tracking-wider rounded bg-white/5 border border-white/10 hover:bg-white/15 transition-colors">
          💬 MESSAGE ME
        </button>

        {/* Validated game URL execution */}
        {hasUrl ? (
          <a
            href={game.gameUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1 text-[9px] font-display font-bold text-white text-center tracking-wider rounded transition-transform active:scale-95 block"
            style={{
              background: "linear-gradient(135deg, #e63946, #c1121f)",
              boxShadow: "0 4px 10px rgba(230,57,70,0.3)",
            }}
          >
            📥 DOWNLOAD
          </a>
        ) : (
          <button
            disabled
            className="w-full py-1 text-[9px] font-display font-bold text-center tracking-wider rounded border border-white/5 text-white/30 cursor-not-allowed bg-transparent opacity-40"
          >
            🔒 NO LINK
          </button>
        )}
      </div>

      {/* Subtle hover accent shimmer */}
      {hovered && (
        <div
          className="absolute top-0 left-0 right-0 h-px z-10"
          style={{
            background: `linear-gradient(90deg, transparent, ${gameColor}, transparent)`,
          }}
        />
      )}
    </div>
  );
}