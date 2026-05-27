export default function AboutHero() {
  return (
    <section
      className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28"
      style={{
        background: "linear-gradient(160deg, #07071a 0%, #10082e 55%, #07071a 100%)",
      }}
    >
      {/* Hex grid bg */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V17L28 1l28 16v33z' fill='none' stroke='%2300d4ff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "56px 100px",
        }}
      />

      {/* Orbs */}
      <div className="absolute top-10 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(108,63,197,0.2) 0%, transparent 70%)", filter: "blur(20px)" }} />
      <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(230,57,70,0.12) 0%, transparent 70%)", filter: "blur(20px)" }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, #e63946)" }} />
          <span className="font-display text-[10px] tracking-[0.4em] uppercase" style={{ color: "#e63946" }}>
            Our Story
          </span>
          <div className="h-px w-10" style={{ background: "linear-gradient(270deg, transparent, #e63946)" }} />
        </div>

        {/* Title */}
        <h1 className="font-display font-black leading-tight mb-6" style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)" }}>
          <span className="text-white">About </span>
          <span style={{ WebkitTextStroke: "2px #e63946", color: "transparent", textShadow: "0 0 40px rgba(230,57,70,0.4)" }}>
            Seem Greg
          </span>
        </h1>

        <p className="font-body text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          style={{ color: "rgba(255,255,255,0.52)" }}>
          Placeholder — We are a passionate team of gaming enthusiasts dedicated to delivering a world-class online gaming experience. Built on trust, powered by technology, and driven by our players.
        </p>

        {/* Deco line */}
        <div className="deco-line w-48 mx-auto mt-10" />
      </div>
    </section>
  );
}
