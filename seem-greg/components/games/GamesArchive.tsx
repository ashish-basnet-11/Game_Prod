// components/games/GamesArchive.tsx

import { getGames } from "@/lib/api";
import { ArchiveGamesGrid } from "./GamesGrid-page";

export default async function GamesArchive() {
    const games = await getGames();

    return <ArchiveGamesGrid games={games} />;
}