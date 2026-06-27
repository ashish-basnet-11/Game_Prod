// ============================================================================
// 2. ARCHIVE FILTER GRID (Client Component Section)
// ============================================================================

// components/games/GamesGrid-page.tsx
"use client";

import { Game } from "@/lib/api";
import { useState, useMemo, useEffect } from "react";
import { Star } from "lucide-react";

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
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("favoriteGames");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch(e) {}
    }
  }, []);

  const toggleFavorite = (gameId: string) => {
    let newFavs;
    if (favorites.includes(gameId)) {
      newFavs = favorites.filter(id => id !== gameId);
    } else {
      newFavs = [...favorites, gameId];
    }
    setFavorites(newFavs);
    localStorage.setItem("favoriteGames", JSON.stringify(newFavs));
  };

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem("favoriteGames");
  };

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

  const favoriteGames = useMemo(() => {
    return games.filter(g => favorites.includes(g.id));
  }, [games, favorites]);

  return (
    <section className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      
      {/* ── Favorites Section ── */}
      {mounted && favoriteGames.length > 0 && (
        <div className="mb-12 p-6 rounded-2xl" style={{
          background: "rgba(20, 20, 40, 0.4)",
          border: "1px solid rgba(255,255,255,0.05)"
        }}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-purple-500 fill-purple-500" />
              <h2 className="text-xl font-display font-bold text-white">Your favorites</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white/70">
                {favoriteGames.length}
              </span>
            </div>
            <button 
              onClick={clearFavorites}
              className="text-xs text-white/50 hover:text-white/80 transition-colors flex items-center gap-1"
            >
              <span className="text-lg leading-none">&times;</span> Clear all
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {favoriteGames.map((game) => (
              <FavoriteGameCard 
                key={game.id} 
                game={game} 
                onToggle={() => toggleFavorite(game.id)} 
              />
            ))}
          </div>
        </div>
      )}

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
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-display font-bold text-white">Games</h2>
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white/70">
          {filtered.length}
        </span>
      </div>

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
        <div className="grid grid-cols-1 min-[500px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filtered.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={() => toggleFavorite(game.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FavoriteGameCard({ game, onToggle }: { game: Game, onToggle: () => void }) {
  const gameColor = game.color || "#00d4ff";

  return (
    <div 
      className="relative flex flex-col items-center justify-center p-4 rounded-xl shrink-0 w-48 group transition-transform hover:scale-105 cursor-pointer"
      style={{
        background: "rgba(26, 26, 46, 0.6)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="absolute top-2 right-2 p-1 text-purple-500 hover:scale-110 transition-transform"
      >
        <Star className="w-4 h-4 fill-purple-500" />
      </button>

      <div className="w-16 h-16 mb-3 rounded-xl overflow-hidden flex items-center justify-center">
        {game.imageUrl ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${game.imageUrl}`}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl" style={{ filter: `drop-shadow(0 0 8px ${gameColor})` }}>
            {game.emoji}
          </span>
        )}
      </div>
      <h3 className="text-sm font-display font-bold text-white text-center w-full truncate">
        {game.name}
      </h3>
      <p className="text-[10px] text-white/40 mt-1 truncate w-full text-center">
        {game.name.toLowerCase().replace(/\s+/g, '')}
      </p>
    </div>
  );
}

function GameCard({ game, isFavorite, onToggleFavorite }: { game: Game, isFavorite?: boolean, onToggleFavorite?: () => void }) {
  const hasUrl = !!game.gameUrl?.trim();
  const gameColor = game.color || "#00d4ff";

  const categoryLabel =
    game.category === "Fish Games" ? "FISH"
      : game.category === "Table Games" ? "TABLE"
        : "SLOT";

  return (
    <div
      className="game-card relative rounded-2xl overflow-hidden group select-none flex flex-col"
      style={{
        background: "#1A1A2E",
        border: `1px solid rgba(255,255,255,0.05)`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
      }}
    >
      {/* Image section */}
      <div className="w-full h-48 sm:h-40 relative overflow-hidden bg-black/40 flex items-center justify-center shrink-0">
        {game.imageUrl ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${game.imageUrl}`}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="text-6xl" style={{ filter: `drop-shadow(0 0 12px ${gameColor})` }}>
            {game.emoji}
          </span>
        )}
        
        {/* Badge */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {game.badge && (
            <span
              className="px-2 py-1 text-[10px] font-display font-bold tracking-wider rounded shadow-lg"
              style={{
                background: game.badge === "HOT" ? "#e63946" : game.badge === "NEW" ? "#00d4ff" : "#ffd700",
                color: game.badge === "NEW" ? "#07071a" : "#fff",
              }}
            >
              {game.badge}
            </span>
          )}
          <span
            className="px-2 py-1 text-[9px] font-display font-bold tracking-wider rounded shadow-lg opacity-80"
            style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.9)" }}
          >
            {categoryLabel}
          </span>
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(); }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10"
          >
            <Star className={`w-4 h-4 ${isFavorite ? "text-purple-500 fill-purple-500" : "text-white/70 hover:text-white"}`} />
          </button>
        )}
      </div>

      {/* Content section */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-1.5 sm:mb-2">
          {game.name}
        </h3>
        <p className="text-xs sm:text-sm font-body text-white/70 mb-5 sm:mb-6 line-clamp-2 leading-relaxed">
          {game.description || `Fast-paced arcade gameplay with futuristic visuals and immersive action.`}
        </p>
        
        <div className="mt-auto flex flex-col gap-2.5 sm:gap-3">
          <button className="w-full py-2.5 sm:py-3 px-2 rounded-xl font-display font-bold text-[10px] sm:text-xs text-white text-center transition-colors bg-[#0a0a0a] hover:bg-[#1a1a1a] border border-white/10 shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap">
            💬 MESSAGE ME
          </button>

          {hasUrl ? (
            <a
              href={game.gameUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 sm:py-3 px-2 rounded-xl font-display font-bold text-[10px] sm:text-xs text-white text-center transition-transform hover:-translate-y-0.5 active:scale-95 shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap"
              style={{ background: "linear-gradient(180deg, #e63946 0%, #a00b1a 100%)" }}
            >
              📥 DOWNLOAD GAME
            </a>
          ) : (
            <button
              disabled
              className="w-full py-2.5 sm:py-3 px-2 rounded-xl font-display font-bold text-[10px] sm:text-xs text-white/40 text-center cursor-not-allowed border border-white/10 bg-white/5 flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              🔒 NO LINK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}