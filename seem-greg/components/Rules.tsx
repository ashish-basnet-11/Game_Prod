export default function RulesAndRegulations() {
  return (
    <section
      className="py-16 md:py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0d0d2b 0%, #06060f 100%)" }}
    >
      {/* Decorative orb */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 rounded-full bg-brand-cyan/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header Block */}
        <div className="text-center mb-4">
          <h2
            className="font-display font-black text-2xl md:text-3xl text-white"
            style={{ textShadow: "0 0 20px rgba(0,212,255,0.4)" }}
          >
            RULES & REGULATIONS
          </h2>
          <div className="deco-line w-40 mx-auto mt-3 mb-4" />
          <p className="text-white/50 text-sm font-body max-w-md mx-auto">
            Review the essential guidelines designed to ensure a fair, secure, and enjoyable experience for all participants on our platform.
          </p>
        </div>

        {/* Poster Image Container */}
        <div className="max-w-md mx-auto mt-10 mb-16 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50">
          <img
            src="/rules-poster.png"
            alt="Rules and Regulations Poster"
            className="w-full h-auto object-cover display-block"
          />
        </div>
      </div>
    </section>
  );
}