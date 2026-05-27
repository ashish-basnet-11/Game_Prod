import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GamesHero from "@/components/games/GamesHero";
import GamesLibrary from "@/components/games/GamesLibrary";
import GamesArchive from "@/components/games/GamesArchive";

export default function GamesPage() {
    return (
        <main className="min-h-screen">
            <Navbar activePage="Games" />
            <GamesHero />
            <GamesArchive />
            <Footer />
        </main>
    );
}