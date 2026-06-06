const stats = [
  { value: "2018", label: "Year Founded" },
  { value: "100+", label: "Active Players" },
  { value: "200+", label: "Games Available" },
  { value: "15+", label: "Countries Served" },
];

export default function AboutStats() {
  return (
    <section style={{ background: "#06060f", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="py-10 px-6 text-center"
              style={{
                background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              <div
                className="font-display font-black text-3xl md:text-4xl mb-2"
                style={{ color: "#00d4ff", textShadow: "0 0 20px rgba(0,212,255,0.45)" }}
              >
                {s.value}
              </div>
              <div className="font-body text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
