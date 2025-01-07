export const dynamic = "force-static";
export const revalidate = 43200; // 12 hours

import GamesList from "./components/games-list";

export default async function Home() {
  return (
    <main className="flex h-full w-full max-w-7xl flex-col items-start justify-center py-6 text-black md:py-12">
      <GamesList />
    </main>
  );
}
