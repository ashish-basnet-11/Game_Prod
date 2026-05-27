'use client'

const team = [
  {
    initials: "SG",
    name: "Placeholder Name",
    role: "Founder & CEO",
    desc: "Placeholder — Visionary leader with 10+ years in the online gaming industry. Built Seem Greg from the ground up with a mission to make gaming fair and fun for everyone.",
    color: "#e63946",
  },
  {
    initials: "MR",
    name: "Placeholder Name",
    role: "Head of Operations",
    desc: "Placeholder — Oversees our verified agent network and ensures every player transaction is processed smoothly, securely, and on time.",
    color: "#00d4ff",
  },
  {
    initials: "JL",
    name: "Placeholder Name",
    role: "Lead Game Curator",
    desc: "Placeholder — Handpicks every title in our 200+ game library. Passionate about finding the perfect mix of slots, fish games, and live table experiences.",
    color: "#6c3fc5",
  },
  {
    initials: "AT",
    name: "Placeholder Name",
    role: "Customer Success Lead",
    desc: "Placeholder — Heads our 24/7 support team across Facebook, Telegram, and WhatsApp. Committed to making sure every player feels heard and helped.",
    color: "#ffd700",
  },
];

export default function AboutTeam() {
  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #06060f 0%, #0d0d2b 100%)" }}
    >
      {/* Orb */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(108,63,197,0.08) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-display font-black text-2xl md:text-3xl text-white mb-3"
            style={{ textShadow: "0 0 20px rgba(0,212,255,0.3)" }}>
            MEET THE TEAM
          </h2>
          <p className="font-body text-sm max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
            Placeholder — The people behind Seem Greg are gamers, operators, and customer experience specialists united by one goal.
          </p>
          <div className="deco-line w-32 mx-auto mt-4" />
        </div>

        {/* Team grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((member) => (
            <div
              key={member.role}
              className="rounded-2xl p-6 text-center"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${member.color}44`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${member.color}18`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center font-display font-black text-xl mx-auto mb-5"
                style={{
                  background: `linear-gradient(135deg, ${member.color}33, ${member.color}11)`,
                  border: `2px solid ${member.color}55`,
                  boxShadow: `0 0 20px ${member.color}22`,
                  color: member.color,
                }}
              >
                {member.initials}
              </div>

              {/* Name & role */}
              <h3 className="font-display font-bold text-sm text-white mb-1 tracking-wide">
                {member.name}
              </h3>
              <span
                className="inline-block px-3 py-1 rounded-full font-display font-bold text-[10px] tracking-widest mb-4"
                style={{
                  background: `${member.color}15`,
                  border: `1px solid ${member.color}33`,
                  color: member.color,
                }}
              >
                {member.role}
              </span>

              <p className="font-body text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                {member.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div
          className="mt-16 rounded-2xl p-8 md:p-12 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(108,63,197,0.15), rgba(230,57,70,0.1))",
            border: "1px solid rgba(108,63,197,0.25)",
          }}
        >
          <h3 className="font-display font-black text-xl md:text-2xl text-white mb-3">
            WANT TO JOIN OUR TEAM?
          </h3>
          <p className="font-body text-sm mb-6 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
            Placeholder — We are always looking for passionate, driven individuals to help us build the future of online gaming. Reach out and let's talk.
          </p>
          <a
            href="/contact"
            className="inline-block btn-outline px-8 py-3 text-sm rounded-xl font-display tracking-widest uppercase"
          >
            Get In Touch →
          </a>
        </div>
      </div>
    </section>
  );
}
