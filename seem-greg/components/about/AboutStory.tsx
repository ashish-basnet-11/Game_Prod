'use client'

const milestones = [
  {
    year: "2018",
    title: "The Beginning",
    desc: "Placeholder — Seem Greg was founded by a small team of gaming enthusiasts who believed that online gaming could be better — fairer, faster, and more rewarding for everyone involved.",
  },
  {
    year: "2020",
    title: "Growing the Community",
    desc: "Placeholder — We expanded our game library to over 100 titles and launched our verified agent network, ensuring every player had a trusted point of contact for deposits and withdrawals.",
  },
  {
    year: "2022",
    title: "Going Regional",
    desc: "Placeholder — Seem Greg crossed borders, bringing our platform to players across Southeast Asia. Our 24/7 support channels were established on Facebook, Telegram, and WhatsApp.",
  },
  {
    year: "2024",
    title: "Today & Beyond",
    desc: "Placeholder — With 50,000+ active players and 200+ games, we continue to grow. Our mission remains the same: deliver a secure, thrilling, and rewarding experience for every single player.",
  },
];

export default function AboutStory() {
  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #06060f 0%, #0d0d2b 100%)" }}
    >
      {/* Faint orb */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(108,63,197,0.08) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display font-black text-2xl md:text-3xl text-white mb-3"
            style={{ textShadow: "0 0 20px rgba(0,212,255,0.3)" }}>
            OUR JOURNEY
          </h2>
          <div className="deco-line w-32 mx-auto" />
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical spine */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px hidden md:block"
            style={{ background: "linear-gradient(180deg, transparent, rgba(230,57,70,0.5), rgba(0,212,255,0.5), transparent)" }}
          />

          <div className="flex flex-col gap-12">
            {milestones.map((m, i) => (
              <div
                key={m.year}
                className={`grid md:grid-cols-2 gap-6 md:gap-16 items-center ${i % 2 !== 0 ? "md:[direction:rtl]" : ""}`}
              >
                {/* Content card */}
                <div
                  className={`rounded-2xl p-6 md:p-8 ${i % 2 !== 0 ? "md:[direction:ltr]" : ""}`}
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    transition: "border-color 0.3s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(230,57,70,0.35)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                >
                  <span
                    className="font-display font-black text-4xl md:text-5xl block mb-3"
                    style={{ color: "rgba(230,57,70,0.18)", lineHeight: 1 }}
                  >
                    {m.year}
                  </span>
                  <h3 className="font-display font-bold text-base tracking-wider text-white mb-3">
                    {m.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {m.desc}
                  </p>
                </div>

                {/* Year badge — centered on spine */}
                <div className={`hidden md:flex items-center ${i % 2 === 0 ? "justify-start md:[direction:ltr]" : "justify-end md:[direction:ltr]"}`}>
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center font-display font-black text-sm relative z-10"
                    style={{
                      background: "linear-gradient(135deg, #e63946, #6c3fc5)",
                      boxShadow: "0 0 24px rgba(230,57,70,0.4)",
                      color: "white",
                    }}
                  >
                    {m.year}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
