// components/games/GamesGrid.tsx
import Link from "next/link";
import { getGames, Game } from "@/lib/api";

export default async function GamesGrid() {
  let games: Game[] = [];
  let hasError = false;

  try {
    const all = await getGames();
    games = all.slice(0, 12); // Dynamically grab first 12 active games from DB
  } catch (error) {
    hasError = true;
    console.error("Homepage GamesGrid database fetch error:", error);
  }

  if (hasError) return null;

  if (games.length === 0) {
    return (
      <div className="text-center py-16 text-white/50">
        No games available yet.
      </div>
    );
  }

  return (
    <section
      className="py-16 md:py-20 relative"
      style={{ background: "linear-gradient(180deg, #0d0d2b 0%, #06060f 100%)" }}
    >
      <div className="absolute inset-0 grid-overlay opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="text-white/50 text-xs font-display tracking-[0.3em] uppercase mb-2">
            Discover the latest games
          </p>
          <h2
            className="font-display font-black text-2xl md:text-3xl text-white mb-2"
            style={{ textShadow: "0 0 30px rgba(0,212,255,0.5)" }}
          >
            LET THE SEEM GREG EXPERIENCE BEGIN!
          </h2>
          <p className="text-white/50 text-sm font-body max-w-lg mx-auto">
            From captivating slots to action-packed fish games — with a seamless, world-class experience.
          </p>
          <div className="deco-line w-40 mx-auto mt-4" />
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 min-[500px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-4">
          {games.map((game) => {
            const gameColor = game.color || "#00d4ff";
            const hasUrl = !!game.gameUrl?.trim();

            return (
              <div
                key={game.id || game.name}
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
                  {game.badge && (
                    <span
                      className="absolute top-3 left-3 px-2 py-1 text-[10px] font-display font-bold tracking-wider rounded z-10 shadow-lg"
                      style={{
                        background: game.badge === "HOT" ? "#e63946" : game.badge === "NEW" ? "#00d4ff" : "#ffd700",
                        color: game.badge === "NEW" ? "#07071a" : "#fff",
                      }}
                    >
                      {game.badge}
                    </span>
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
          })}
        </div>

        {/* Navigation redirection */}
        <div className="text-center mt-10">
          <Link
            href="/games"
            className="btn-outline px-8 py-3 text-sm rounded-lg font-display tracking-widest uppercase inline-block"
          >
            BROWSE ALL GAMES →
          </Link>
        </div>
      </div>
    </section>
  );
}