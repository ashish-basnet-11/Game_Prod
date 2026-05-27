"use client";
import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Games", href: "/games" },
  { label: "Contact", href: "/#contact" },
];

interface NavbarProps {
  activePage?: string;
}

export default function Navbar({ activePage = "Home" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 md:h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-brand-red rounded flex items-center justify-center glow-red">
            <span className="text-white text-xs font-bold font-display">SG</span>
          </div>
          <span
            className="font-display font-bold text-brand-red tracking-widest text-sm md:text-base"
            style={{ textShadow: "0 0 15px rgba(230,57,70,0.7)" }}
          >
            SEEM GREG
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ label, href }) => {
            const isActive = activePage === label;
            return (
              <Link
                key={label}
                href={href}
                className={`px-3 py-1.5 text-xs font-body font-semibold tracking-widest uppercase transition-all duration-200 rounded
                  ${isActive
                    ? "text-brand-red border-b-2 border-brand-red"
                    : "text-gray-300 hover:text-brand-cyan"
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right icons + hamburger */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            {(["💬", "🔔", "👤", "🌐"] as const).map((icon, i) => (
              <button
                key={i}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm"
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Hamburger */}
          <button
            className="lg:hidden text-white p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-brand-navy border-t border-white/10 px-4 py-4 flex flex-col gap-1">
          {navLinks.map(({ label, href }) => {
            const isActive = activePage === label;
            return (
              <Link
                key={label}
                href={href}
                className={`py-2.5 px-3 text-sm font-semibold tracking-widest uppercase border-b border-white/5 transition-colors
                  ${isActive ? "text-brand-red" : "text-gray-300 hover:text-brand-red"}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}