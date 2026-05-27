export default function KioskSection() {
  return (
    <section className="kiosk-gradient py-16 md:py-20 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-purple/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Machine illustration */}
          <div className="flex justify-center">
            <div
              className="relative w-48 md:w-64"
              style={{ filter: "drop-shadow(0 0 30px rgba(108,63,197,0.6))" }}
            >
              {/* Arcade machine mock */}
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "linear-gradient(160deg, #1a0a40, #0d0d2b)",
                  border: "2px solid rgba(108,63,197,0.6)",
                  boxShadow: "0 0 40px rgba(108,63,197,0.4), inset 0 0 30px rgba(0,0,0,0.5)",
                }}
              >
                <div className="text-xs font-display font-bold text-brand-cyan mb-3 tracking-widest">
                  SEEM GREG
                </div>
                <div
                  className="rounded-lg p-4 mb-4 text-4xl"
                  style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(0,212,255,0.3)" }}
                >
                  🎮
                </div>
                <div className="grid grid-cols-3 gap-1 mb-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-2 rounded-full"
                      style={{ background: i % 3 === 0 ? "#e63946" : i % 3 === 1 ? "#6c3fc5" : "#00d4ff" }}
                    />
                  ))}
                </div>
                <div className="text-xs text-white/40 font-body">KIOSK TERMINAL</div>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div>
            <h2
              className="font-display font-black text-2xl md:text-3xl lg:text-4xl text-white mb-4 leading-tight"
              style={{ textShadow: "0 0 20px rgba(108,63,197,0.5)" }}
            >
              INTEGRATE KIOSK OR CASINO MACHINE WITH SEEM GREG
            </h2>
            <p className="text-white/60 font-body text-base mb-6 leading-relaxed">
              Enhance your gaming services by integrating a kiosk or casino machine with Seem Greg. Increase player engagement and automated routine operations.
            </p>
            <button className="btn-outline px-7 py-3 text-sm rounded-lg font-display tracking-widest uppercase">
              LEARN MORE →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
