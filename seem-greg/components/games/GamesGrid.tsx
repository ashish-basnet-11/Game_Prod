// Home page games preview — server component, shows first 12 active games.
import Link from "next/link";
import { getGames, Game } from "@/lib/api";

export default async function GamesGrid() {
  let games: Game[] = [];

  try {
    const all = await getGames();
    games = all.slice(0, 12); // show first 12 on homepage
  } catch {
    // Silently fall back to empty — full error shown on /games page
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

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="game-card relative rounded-xl overflow-hidden cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${game.color}33, ${game.color}11)`,
                border: `1px solid ${game.color}44`,
                aspectRatio: "1 / 1",
              }}
            >
              {game.badge && (
                <span
                  className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-display font-bold rounded"
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
              <div className="w-full h-full flex flex-col items-center justify-center p-3">
                <span
                  className="text-4xl md:text-5xl mb-2"
                  style={{ filter: `drop-shadow(0 0 12px ${game.color})` }}
                >
                  {game.emoji}
                </span>
                <p className="text-white text-xs font-display font-bold text-center leading-tight">
                  {game.name}
                </p>
              </div>
              <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors flex items-end justify-center pb-2 opacity-0 hover:opacity-100">
                <span className="text-xs font-display font-bold text-white bg-brand-red px-3 py-1 rounded-full">
                  PLAY NOW
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Browse all */}
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
