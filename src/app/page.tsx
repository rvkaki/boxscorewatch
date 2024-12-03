export const dynamic = "force-static";

import GamesList from "./components/games-list";

export default async function Home() {
  return (
    <main className="flex h-full w-full max-w-7xl flex-col items-start justify-center py-12 text-black">
      <GamesList />
    </main>
  );
}
