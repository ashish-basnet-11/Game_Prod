import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import GamesGrid from "@/components/games/GamesGrid";
import KioskSection from "@/components/KioskSection";
import TopFeatures from "@/components/TopFeatures";
import SecurityFairPlay from "@/components/Rules";
import LuckySpinWheel from "@/components/LuckySpinWheel";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar activePage="Home" />
      <Hero />
      <GamesGrid />
      {/* <KioskSection /> */}
      <SecurityFairPlay />
      <LuckySpinWheel />
      <TopFeatures />
      <FAQ />
      <Footer />
    </main>
  );
}
