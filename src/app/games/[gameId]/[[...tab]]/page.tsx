export const dynamic = "force-static";

import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getTeamLogoUrl } from "~/lib/utils";
import { api } from "~/trpc/server";
import BoxScore from "./components/box-score";
import GameCharts from "./components/game-charts";
import RunsChart from "./components/runs-chart";
import RotationsChart from "./components/rotations-chart";

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string; tab?: string[] }>;
}) {
  const { gameId, tab } = await params;
  const game = await api.games.getById({ gameId });
  if (!game) {
    return notFound();
  }

  const activeTab = tab?.[0] ?? "box-score";

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col items-center gap-12 py-12 text-neutral-200">
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

      <Tabs value={activeTab} defaultValue="box-score" className="w-full">
        <TabsList>
          <TabsTrigger value="box-score" asChild>
            <Link href={`/games/${gameId}`}>Box Score</Link>
          </TabsTrigger>
          <TabsTrigger value="play-by-play" asChild>
            <Link href={`/games/${gameId}/play-by-play`}>Play by Play</Link>
          </TabsTrigger>
          <TabsTrigger value="runs" asChild>
            <Link href={`/games/${gameId}/runs`}>Runs</Link>
          </TabsTrigger>
          <TabsTrigger value="rotations" asChild>
            <Link href={`/games/${gameId}/rotations`}>Rotations</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="box-score">
          <BoxScore game={game} />
          <GameCharts
            gameId={gameId}
            homeTeamId={game.HOME_TEAM_ID.toString()}
            awayTeamId={game.AWAY_TEAM_ID.toString()}
          />
        </TabsContent>
        <TabsContent value="runs">
          <RunsChart
            gameId={gameId}
            homeTeamAbv={game.HOME_TEAM_ABBREVIATION}
            awayTeamAbv={game.AWAY_TEAM_ABBREVIATION}
          />
        </TabsContent>
        <TabsContent value="rotations">
          <RotationsChart
            gameId={gameId}
            homeTeamId={game.HOME_TEAM_ID}
            awayTeamId={game.AWAY_TEAM_ID}
            homeTeamAbv={game.HOME_TEAM_ABBREVIATION}
            awayTeamAbv={game.AWAY_TEAM_ABBREVIATION}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
