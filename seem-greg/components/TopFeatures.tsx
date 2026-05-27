const features = [
  {
    icon: "🎮",
    title: "HD GAMES",
    desc: "Smooth visuals and fast load times on modern devices.",
    color: "#e63946",
  },
  {
    icon: "🎧",
    title: "CUSTOMER SUPPORT 24/7",
    desc: "Support 24/7 on Facebook, Telegram & WhatsApp.",
    color: "#f9a825",
  },
  {
    icon: "🍀",
    title: "DAILY OFFERS AND REWARDS",
    desc: "Unlock bonuses, events, and loyalty perks.",
    color: "#2e7d32",
  },
  {
    icon: "🛡️",
    title: "VERIFIED AGENT PAYMENTS",
    desc: "Buy credits safely through verified agents.",
    color: "#00d4ff",
  },
  {
    icon: "🔒",
    title: "SECURE CREDIT SYSTEM",
    desc: "Transactions are protected and monitored.",
    color: "#6c3fc5",
  },
];

export default function TopFeatures() {
  return (
    <section
      className="py-16 md:py-20 relative"
      style={{ background: "linear-gradient(180deg, #06060f 0%, #0d0d2b 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2
            className="font-display font-black text-2xl md:text-3xl text-white"
            style={{ textShadow: "0 0 20px rgba(0,212,255,0.4)" }}
          >
            TOP FEATURES
          </h2>
          <div className="deco-line w-32 mx-auto mt-3" />
        </div>

        {/* First row — 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {features.slice(0, 3).map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>

        {/* Second row — 2 cards centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {features.slice(3).map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc, color }: {
  icon: string; title: string; desc: string; color: string;
}) {
  return (
    <div
      className="feature-card rounded-xl p-6 text-center"
      style={{ borderColor: `${color}22` }}
    >
      {/* Icon box */}
      <div
        className="w-20 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center text-4xl"
        style={{
          background: `linear-gradient(135deg, ${color}22, ${color}11)`,
          border: `1px solid ${color}44`,
          boxShadow: `0 0 20px ${color}22`,
        }}
      >
        {icon}
      </div>
      <h3
        className="font-display font-bold text-sm tracking-widest text-white mb-2"
        style={{ textShadow: `0 0 10px ${color}88` }}
      >
        {title}
      </h3>
      <p className="text-white/60 text-xs font-body leading-relaxed">{desc}</p>
    </div>
  );
}
