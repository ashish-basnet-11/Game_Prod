export default function Footer() {
  return (
    <footer
      className="py-10 border-t"
      style={{
        background: "#06060f",
        borderColor: "rgba(230,57,70,0.2)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-brand-red rounded flex items-center justify-center glow-red">
                <span className="text-white text-xs font-bold font-display">SG</span>
              </div>
              <span
                className="font-display font-bold text-brand-red tracking-widest"
                style={{ textShadow: "0 0 10px rgba(230,57,70,0.6)" }}
              >
                SEEM GREG
              </span>
            </div>
            <p className="text-white/40 text-xs font-body leading-relaxed">
              Where The Fun Never Stops! Trusted by 18 million players worldwide.
            </p>
          </div>

          {/* Links */}
          {[
            {
              title: "Navigation",
              links: ["Home", "About", "Games", "Agents"],
            },
            {
              title: "Support",
              links: ["Players", "Kiosk", "Contact", "FAQ"],
            },
            {
              title: "Connect",
              links: ["Facebook", "Telegram", "WhatsApp", "Instagram"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-bold text-xs tracking-widest text-white/70 mb-3 uppercase">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/40 text-xs font-body hover:text-brand-red transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="deco-line mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30 font-body">
          <span>© 2025 Seem Greg. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
