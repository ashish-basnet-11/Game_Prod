"use client";
import { useState } from "react";

const faqs = [
  {
    q: "Q1. CAN I PLAY WITHOUT DOWNLOADING THE APP?",
    a: "Yes, you can access Seem Greg through our mobile browser. However, for the best gaming experience with faster load times and smoother gameplay, we recommend downloading our app.",
  },
  {
    q: "Q2. HOW CAN I CREATE AN ACCOUNT AND LOAD CREDITS?",
    a: "To create an account, contact one of our verified agents through Facebook, Telegram, or WhatsApp. They will guide you through the registration process and help you load credits securely.",
  },
  {
    q: "Q3. HOW DO I DOWNLOAD THE APP?",
    a: "The Seem Greg app is available on both iOS and Android. You can find the download links on our official website or ask your verified agent for direct installation instructions.",
  },
  {
    q: "Q4. I HAVE A PROBLEM WITH MY AGENT OR CASH-OUT. CAN YOU HELP?",
    a: "Absolutely! Our 24/7 customer support team is available on Facebook, Telegram, and WhatsApp. Contact us directly and we'll resolve any issues with your agent or cash-out as quickly as possible.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="py-16 md:py-20 relative"
      style={{ background: "linear-gradient(180deg, #06060f 0%, #0d0d2b 100%)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2
            className="font-display font-black text-2xl md:text-3xl text-white"
            style={{ textShadow: "0 0 20px rgba(230,57,70,0.4)" }}
          >
            FREQUENTLY ASK QUESTION
          </h2>
          <div className="deco-line w-40 mx-auto mt-3 mb-4" />
          <p className="text-white/50 text-sm font-body">
            Explore answers to the most common questions about playing, account setup, and support to enhance your gaming experience.
          </p>
        </div>

        <div className="space-y-3 relative">
          {/* Wizard character decoration */}
          <div className="absolute -right-4 bottom-0 text-6xl opacity-70 pointer-events-none hidden md:block">
            🧙
          </div>

          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq-item rounded-xl overflow-hidden cursor-pointer ${openIndex === i ? "open" : ""}`}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <div className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <span className="font-display font-bold text-xs tracking-wider text-white/90">
                  {faq.q}
                </span>
                <span
                  className="text-brand-red font-bold text-lg ml-4 shrink-0 transition-transform"
                  style={{ transform: openIndex === i ? "rotate(45deg)" : "rotate(0)" }}
                >
                  +
                </span>
              </div>
              {openIndex === i && (
                <div className="px-4 pb-4 pt-1 bg-white/[0.01]">
                  <p className="text-white/60 text-sm font-body leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
