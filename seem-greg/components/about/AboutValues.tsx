'use client'

const values = [
  {
    icon: "🛡️",
    title: "Trust & Transparency",
    desc: "Placeholder — Every transaction runs through verified agents only. We publish our payout rates and maintain open communication with our community at all times.",
    color: "#00d4ff",
  },
  {
    icon: "⚡",
    title: "Speed & Reliability",
    desc: "Placeholder — From instant game loading to fast withdrawals, we engineer our platform to perform at its best so you never miss a moment of the action.",
    color: "#ffd700",
  },
  {
    icon: "🎮",
    title: "Player-First Design",
    desc: "Placeholder — Every feature we build starts with one question: does this make the player experience better? Our community shapes every decision we make.",
    color: "#e63946",
  },
  {
    icon: "🤝",
    title: "Community & Support",
    desc: "Placeholder — We are more than a platform — we are a family. Our agents, support team, and players form a tight-knit community built on shared passion for gaming.",
    color: "#6c3fc5",
  },
  {
    icon: "🔒",
    title: "Security First",
    desc: "Placeholder — Your data and funds are protected by enterprise-grade security. We monitor every transaction 24/7 to ensure a safe and fair environment for all.",
    color: "#4caf50",
  },
  {
    icon: "🌏",
    title: "Always Accessible",
    desc: "Placeholder — Available on iOS, Android, and browser — wherever you are, whatever device you use, Seem Greg is ready. Our support team is online around the clock.",
    color: "#ff9800",
  },
];

export default function AboutValues() {
  return (
    <section
      className="py-20 md:py-28 relative"
      style={{ background: "linear-gradient(180deg, #0d0d2b 0%, #06060f 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-display font-black text-2xl md:text-3xl text-white mb-3"
            style={{ textShadow: "0 0 20px rgba(230,57,70,0.35)" }}>
            WHAT WE STAND FOR
          </h2>
          <p className="font-body text-sm max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
            Placeholder — Six core values guide every decision we make, every game we add, and every player we serve.
          </p>
          <div className="deco-line w-40 mx-auto mt-4" />
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl p-6 group"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: `1px solid rgba(255,255,255,0.07)`,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${v.color}44`;
                (e.currentTarget as HTMLElement).style.background = `${v.color}0a`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5"
                style={{
                  background: `${v.color}14`,
                  border: `1px solid ${v.color}33`,
                  boxShadow: `0 0 16px ${v.color}18`,
                }}
              >
                {v.icon}
              </div>

              <h3
                className="font-display font-bold text-sm tracking-wider text-white mb-3"
                style={{ textShadow: `0 0 10px ${v.color}55` }}
              >
                {v.title}
              </h3>
              <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.48)" }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
