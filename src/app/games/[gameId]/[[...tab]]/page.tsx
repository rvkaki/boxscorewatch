export const dynamic = "force-static";

import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getTeamLogoUrl } from "~/lib/utils";
import { type GameData } from "~/server/db/types";
import { api } from "~/trpc/server";
import BoxScore from "./components/box-score";

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string; tab?: string[] }>;
}) {
  const { gameId, tab } = await params;
  const game = (await api.games.getById({ gameId })) as GameData | null;
  if (!game) {
    return notFound();
  }

  const activeTab = tab?.[0] ?? "box-score";

  const { awayTeam, homeTeam, GAME_DATE } = game;

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col items-center gap-12 py-12 text-neutral-200">
      <div className="flex flex-row items-center gap-16">
        <div
          className="flex flex-row items-center gap-4"
          style={{
            opacity: awayTeam.stats.PTS > homeTeam.stats.PTS ? 1 : 0.5,
          }}
        >
          <Image
            src={getTeamLogoUrl(awayTeam.stats.TEAM_ID)}
            alt={`${awayTeam.stats.TEAM_NAME} logo`}
            width={100}
            height={100}
            className="cursor-pointer"
          />
          <p className="text-3xl font-bold">{awayTeam.stats.PTS}</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-md text-neutral-400">Finished</p>{" "}
          <p className="text-lg font-bold">
            {format(new Date(GAME_DATE), "E PP")}
          </p>
        </div>
        <div
          className="flex flex-row items-center gap-4"
          style={{
            opacity: homeTeam.stats.PTS > awayTeam.stats.PTS ? 1 : 0.5,
          }}
        >
          <p className="text-3xl font-bold">{homeTeam.stats.PTS}</p>
          <Image
            src={getTeamLogoUrl(homeTeam.stats.TEAM_ID)}
            alt={`${homeTeam.stats.TEAM_NAME} logo`}
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
        </TabsList>

        <TabsContent value="box-score">
          <BoxScore game={game} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
