const securityPoints = [
  {
    icon: "📱",
    title: "TRUSTED MOBILE GAMING PLATFORM",
    desc: "Our platform is built on a secure and reliable infrastructure, ensuring a seamless and enjoyable gaming experience.",
    color: "#00d4ff",
  },
  {
    icon: "✅",
    title: "VERIFIED AGENT-ONLY TRANSACTIONS",
    desc: "All transactions are conducted through verified agents, ensuring a secure and reliable experience. Look for the Verified Agent badge.",
    color: "#4caf50",
  },
  {
    icon: "🔑",
    title: "SECURE CREDIT SYSTEM — PROTECTED FLOWS WITH VERIFIED AGENTS ONLY",
    desc: "Our secure credit system ensures that all transactions are protected and conducted through verified agents only.",
    color: "#ffd700",
  },
  {
    icon: "👥",
    title: "COMMUNITY OF THOUSANDS — REAL PLAYERS, REAL EXCITEMENT",
    desc: "We're more than just a gaming platform — a community of players who share the same passion for fun and winning.",
    color: "#e63946",
  },
];

export default function SecurityFairPlay() {
  return (
    <section
      className="py-16 md:py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0d0d2b 0%, #06060f 100%)" }}
    >
      {/* Decorative orb */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 rounded-full bg-brand-cyan/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-4">
          <h2
            className="font-display font-black text-2xl md:text-3xl text-white"
            style={{ textShadow: "0 0 20px rgba(0,212,255,0.4)" }}
          >
            SECURITY & FAIR PLAY
          </h2>
          <div className="deco-line w-40 mx-auto mt-3 mb-4" />
          <p className="text-white/50 text-sm font-body max-w-md mx-auto">
            At Seem Greg, we prioritize your safety and fairness above all else. Our secure platform and fair gaming practices ensure a trustworthy and enjoyable experience for all players.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
          {securityPoints.map((point) => (
            <div
              key={point.title}
              className="security-card rounded-xl p-5 flex gap-4"
            >
              {/* Icon circle */}
              <div
                className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-xl"
                style={{
                  background: `${point.color}18`,
                  border: `2px solid ${point.color}44`,
                  boxShadow: `0 0 15px ${point.color}22`,
                }}
              >
                {point.icon}
              </div>
              <div>
                <h3
                  className="font-display font-bold text-xs tracking-wider text-white mb-1.5"
                  style={{ textShadow: `0 0 8px ${point.color}66` }}
                >
                  {point.title}
                </h3>
                <p className="text-white/55 text-xs font-body leading-relaxed">
                  {point.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
