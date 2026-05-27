import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutHero from "@/components/about/AboutHero";
import AboutStory from "@/components/about/AboutStory";
import AboutValues from "@/components/about/AboutValues";
import AboutTeam from "@/components/about/AboutTeam";
import AboutStats from "@/components/about/AboutStats";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar activePage="About" />
      <AboutHero />
      <AboutStats />
      <AboutStory />
      <AboutValues />
      <AboutTeam />
      <Footer />
    </main>
  );
}
