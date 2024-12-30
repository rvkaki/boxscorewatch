export const dynamic = "force-static";

import { format } from "date-fns";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTeamLogoUrl } from "~/lib/utils";
import { api } from "~/trpc/server";
import GameTabsList from "./@gameTabs/components/tab-list";

export default async function Layout({
  params,
  gameTabs,
}: {
  params: Promise<{ gameId: string }>;
  gameTabs: React.ReactNode;
}) {
  const { gameId } = await params;
  const game = await api.games.getById({ gameId });

  if (!game) {
    return notFound();
  }

  return (
    <div className="flex w-full max-w-[1200px] flex-1 flex-col items-center gap-12 px-12 py-12 text-neutral-200">
      <div className="flex flex-row items-center gap-16">
        <div
          className="flex flex-row items-center gap-4"
          style={{
            opacity: game.AWAY_TEAM_PTS > game.HOME_TEAM_PTS ? 1 : 0.5,
          }}
        >
          <Image
            src={getTeamLogoUrl(game.AWAY_TEAM_ID)}
            alt={`${game.AWAY_TEAM_NAME} logo`}
            width={100}
            height={100}
            className="cursor-pointer"
          />
          <p className="text-3xl font-bold">{game.AWAY_TEAM_PTS}</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-md text-neutral-400">Finished</p>{" "}
          <p className="text-lg font-bold">
            {format(new Date(game.GAME_DATE), "E PP")}
          </p>
        </div>
        <div
          className="flex flex-row items-center gap-4"
          style={{
            opacity: game.HOME_TEAM_PTS > game.AWAY_TEAM_PTS ? 1 : 0.5,
          }}
        >
          <p className="text-3xl font-bold">{game.HOME_TEAM_PTS}</p>
          <Image
            src={getTeamLogoUrl(game.HOME_TEAM_ID)}
            alt={`${game.HOME_TEAM_NAME} logo`}
            width={100}
            height={100}
            className="cursor-pointer"
          />
        </div>
      </div>

      <GameTabsList gameId={gameId} />
      <div className="w-full">{gameTabs}</div>
    </div>
  );
}
