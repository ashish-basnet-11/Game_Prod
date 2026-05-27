// Server component — fetches games from the API at request time.
// Passes data down to GamesGrid (client) for filtering/search UI.
import { getGames, Game } from "@/lib/api";
import GamesGrid from "./GamesGrid";

export default async function GamesLibrary() {
  let games: Game[] = [];
  let error: string | null = null;

  try {
    games = await getGames();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load games";
    console.error("GamesLibrary fetch error:", err);
  }

  return (
    <section
      className="py-14 md:py-20 relative"
      style={{ background: "linear-gradient(180deg, #0d0d2b 0%, #06060f 50%, #0d0d2b 100%)" }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {error ? (
          <ErrorState message={error} />
        ) : games.length === 0 ? (
          <EmptyState />
        ) : (
          <GamesGrid games={games} />
        )}
      </div>
    </section>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">⚠️</p>
      <p className="font-display font-bold text-white text-lg mb-2">
        Could not load games
      </p>
      <p className="font-body text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
        {message}
      </p>
      <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
        Make sure the API server is running at{" "}
        <code className="text-brand-cyan">
          {process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}
        </code>
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">🎲</p>
      <p className="font-display font-bold text-white text-lg mb-2">No games yet</p>
      <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
        Add games through the admin panel to see them here.
      </p>
    </div>
  );
}
