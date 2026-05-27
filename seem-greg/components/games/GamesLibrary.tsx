import GamesGrid from "./GamesGrid";

export default function GamesLibrary() {
  return (
    <section
      className="py-14 md:py-20 relative"
      style={{
        background:
          "linear-gradient(180deg, #0d0d2b 0%, #06060f 50%, #0d0d2b 100%)",
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <GamesGrid />
      </div>
    </section>
  );
}