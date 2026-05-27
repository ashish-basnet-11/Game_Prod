// Hero.tsx (Server Component)
import { getGames } from "@/lib/api";
import GameTickerClient from "./games/GameTickerClient"; // We'll extract the ticker logic here

const stats = [
  { value: "500+", label: "Active Players" },
  { value: "200+", label: "Games Available" },
  { value: "24/7", label: "Live Support" },
  { value: "100%", label: "Payout Rate" },
];

export default async function Hero() {
  let scrollingGames: string[] = [];

  try {
    const allGames = await getGames();
    // Dynamically format strings (e.g., "🎰 Blazing Tiki") from your DB entries
    scrollingGames = allGames.map(game => `${game.emoji} ${game.name}`);
  } catch (error) {
    console.error("Hero dynamic fetch error:", error);
    // Fallback static array if the database/API is down
    // scrollingGames = [
    //   "🎰 Blazing Tiki", "💎 Brilliant Diamonds", "🦁 5 Lions Megaways",
    //   "🧛 Vampire's Rite", "⚽ Knockout Football", "🍀 Clovers of Fortune",
    // ];
  }

  return (
    <section
      className="relative overflow-hidden pt-16 md:pt-20"
      style={{
        background: "linear-gradient(160deg, #07071a 0%, #10082e 50%, #07071a 100%)",
        minHeight: "100vh",
      }}
    >
      {/* ── Background layer: hex grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V17L28 1l28 16v33z' fill='none' stroke='%2300d4ff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "56px 100px",
        }}
      />

      {/* ── Glowing orbs ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "10%", right: "-5%",
          width: 420, height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,63,197,0.22) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "5%", left: "-8%",
          width: 340, height: 340,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,57,70,0.15) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* ── Dynamic Scrolling game ticker (Client Component injected here) ── */}
      <GameTickerClient scrollingGames={scrollingGames} />

      {/* ── Main hero content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid lg:grid-cols-5 gap-10 items-center">

          {/* LEFT copy — 3 cols */}
          <div className="lg:col-span-3 animate-section">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="h-px flex-1 max-w-[40px]"
                style={{ background: "linear-gradient(90deg, transparent, #e63946)" }}
              />
              <span
                className="text-[10px] font-display tracking-[0.4em] uppercase"
                style={{ color: "#e63946" }}
              >
                Premium Gaming Platform
              </span>
            </div>

            {/* Main title */}
            <h1
              className="font-display font-black leading-[0.9] mb-5"
              style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)" }}
            >
              <span
                className="block text-white"
                style={{ textShadow: "0 2px 30px rgba(255,255,255,0.1)" }}
              >
                SEEM
              </span>
              <span
                className="block"
                style={{
                  WebkitTextStroke: "2px #e63946",
                  color: "transparent",
                  textShadow: "0 0 40px rgba(230,57,70,0.5)",
                }}
              >
                GREG
              </span>
            </h1>

            {/* Tagline */}
            <div
              className="font-body text-base md:text-lg mb-8 max-w-md leading-relaxed space-y-4"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              <p>
                Unfortunately, our Facebook page keeps getting closed and we're not sure why.
              </p>
              <p>
                We sincerely apologize for any inconvenience this may have caused. Your
                trust and connection with us matter greatly.
              </p>
              <p>
                To stay connected and ensure uninterrupted communication, we've set up a
                dedicated Telegram channel where we can serve you better.
              </p>
            </div>

            {/* Feature rows */}
            <div className="space-y-3 mb-8">
              {[
                { icon: "⚡", label: "Instant withdrawals processed within minutes" },
                { icon: "🛡️", label: "Daily Freeplay and Bonuses" },
                { icon: "🎮", label: "200+ games across slots, fish & table games" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                    style={{
                      background: "rgba(230,57,70,0.12)",
                      border: "1px solid rgba(230,57,70,0.3)",
                    }}
                  >
                    {f.icon}
                  </div>
                  <span className="text-sm font-body" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Badge pills */}
            <div className="flex flex-wrap gap-2">
              {["Available 24/7", "Verified Agent", "Instant Withdrawal", "Free Play"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-[10px] font-display font-bold tracking-[0.15em] uppercase rounded"
                  style={{
                    background: "rgba(0,212,255,0.06)",
                    border: "1px solid rgba(0,212,255,0.25)",
                    color: "#00d4ff",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT panel — 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Reward card */}
            <div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(108,63,197,0.18), rgba(10,10,30,0.9))",
                border: "1px solid rgba(108,63,197,0.35)",
                boxShadow: "0 8px 32px rgba(108,63,197,0.15)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at top right, rgba(108,63,197,0.3), transparent 70%)",
                }}
              />
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-4 text-[10px] font-display font-bold tracking-widest"
                style={{ background: "rgba(230,57,70,0.15)", border: "1px solid rgba(230,57,70,0.3)", color: "#e63946" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red pulse-badge inline-block" />
                LIVE NOW
              </div>

              <h2 className="font-display font-bold text-white text-base md:text-lg mb-1 tracking-wide">
                Play & Win Real Rewards
              </h2>
              <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Register through a verified agent and start earning today.
              </p>

              {/* Mini stat row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { n: "500+", l: "Players Online" },
                  { n: "₱10M+", l: "Paid Out Today" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-xl p-3 text-center"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="font-display font-black text-lg"
                      style={{ color: "#ffd700", textShadow: "0 0 12px rgba(255,215,0,0.5)" }}
                    >
                      {s.n}
                    </div>
                    <div className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support card */}
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(0,212,255,0.15)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-2xl"
                style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}
              >
                💬
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm tracking-wide">
                  Agent Support 24/7
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Facebook · Telegram
                </p>
              </div>
              <div className="ml-auto text-xl" style={{ color: "rgba(0,212,255,0.4)" }}>
                ›
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="py-5 px-4 text-center"
              style={{
                background: i % 2 === 0
                  ? "rgba(255,255,255,0.025)"
                  : "rgba(255,255,255,0.015)",
              }}
            >
              <div
                className="font-display font-black text-2xl md:text-3xl"
                style={{ color: "#00d4ff", textShadow: "0 0 20px rgba(0,212,255,0.5)" }}
              >
                {s.value}
              </div>
              <div
                className="text-xs font-body tracking-widest uppercase mt-1"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}