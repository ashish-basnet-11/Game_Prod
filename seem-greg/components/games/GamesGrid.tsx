import Link from "next/link";
import { getGames, Game } from "@/lib/api";

export default async function GamesGrid() {
  let games: Game[] = [];

  try {
    const all = await getGames();
    games = all.slice(0, 12); // Dynamically grab first 12 active games from DB
  } catch (error) {
    console.error("Homepage GamesGrid database fetch error:", error);
  }

  if (games.length === 0) return null;

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 px-4">
          {games.map((game) => {
            const gameColor = game.color || "#00d4ff";
            const hasUrl = !!game.gameUrl?.trim();

            return (
              <div
                key={game.id || game.name}
                className="game-card relative rounded-xl overflow-hidden group select-none"
                style={{
                  background: `linear-gradient(135deg, ${gameColor}28, ${gameColor}0d)`,
                  border: `1px solid ${gameColor}33`,
                  aspectRatio: "1 / 1",
                }}
              >
                {/* Badge indicator */}
                {game.badge && (
                  <span
                    className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-display font-bold rounded z-10"
                    style={{
                      background: game.badge === "HOT" ? "#e63946"
                        : game.badge === "NEW" ? "#00d4ff"
                          : "#ffd700",
                      color: game.badge === "NEW" ? "#07071a" : "#fff",
                    }}
                  >
                    {game.badge}
                  </span>
                )}

                {/* Game graphics/emojis (Fades slightly when card is hovered) */}
                <div className="w-full h-full flex flex-col items-center justify-center p-3 transition-all duration-300 group-hover:opacity-10 group-hover:scale-95">
                  <span
                    className="text-4xl md:text-5xl mb-2"
                    style={{ filter: `drop-shadow(0 0 12px ${gameColor})` }}
                  >
                    {game.emoji}
                  </span>
                  <p className="text-white text-xs font-display font-bold text-center leading-tight">
                    {game.name}
                  </p>
                </div>

                {/* Pure CSS Action Tray Overlay */}
                <div className="absolute inset-0 flex flex-col justify-center items-center gap-2 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 backdrop-blur-[1px]">
                  {/* Message Me button (Placeholder click/route behavior) */}
                  <button className="w-full text-[10px] md:text-xs font-display font-bold text-center text-white py-1.5 px-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 transition-colors">
                    💬 MESSAGE ME
                  </button>

                  {/* Download Link button */}
                  {hasUrl ? (
                    <a
                      href={game.gameUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-[10px] md:text-xs font-display font-bold text-center text-white py-1.5 px-2 rounded-lg transition-transform active:scale-95 block"
                      style={{ background: "linear-gradient(135deg, #e63946, #c1121f)" }}
                    >
                      📥 DOWNLOAD
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full text-[10px] md:text-xs font-display font-bold text-center py-1.5 px-2 rounded-lg cursor-not-allowed opacity-30 border border-white/5 text-white/40"
                    >
                      🔒 NO LINK
                    </button>
                  )}
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