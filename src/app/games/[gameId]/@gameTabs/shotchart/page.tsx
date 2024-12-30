import dynamic from "next/dynamic";
import { EventTypes } from "~/lib/consts";
import { type DBGameShotChart, type PlayByPlay } from "~/server/db/types";
import { api } from "~/trpc/server";
const ShotsChart = dynamic(() => import("./components/shots-chart"));

export default async function ShotChartPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const game = await api.games.getById({ gameId });
  const shots = await api.games.getGameShotChart({ gameId });
  const playbyplay = await api.games.getPlayByPlay({ gameId });

  if (!game || !shots || !playbyplay) {
    return null;
  }

  async function getPlayByPlayWithLocation() {
    const res: Record<
      number,
      (PlayByPlay & { shot: DBGameShotChart["shotCharts"][number][number] })[]
    > = {};
    for (const play of playbyplay) {
      if (
        play.EVENTMSGTYPE !== EventTypes.FIELD_GOAL_MADE &&
        play.EVENTMSGTYPE !== EventTypes.FIELD_GOAL_MISSED
      ) {
        continue;
      }
      const teamId = play.PLAYER1_TEAM_ID!;

      const shot = shots!.shotCharts[teamId]?.find(
        (s) => s.GAME_EVENT_ID === play.EVENTNUM,
      );

      if (!shot) {
        console.log("No shot found for play", play);
        continue;
      }

      if (!res[teamId]) {
        res[teamId] = [];
      }

      res[teamId].push({
        ...play,
        shot,
      });
    }

    return res;
  }

  const playByPlayWithLocation = await getPlayByPlayWithLocation();

  return (
    <div className="flex w-full flex-col items-start gap-12">
      {Object.entries(playByPlayWithLocation).map(([teamId, plays]) => {
        return (
          <ShotsChart
            key={teamId}
            teamId={teamId}
            shots={plays}
            homeTeamId={game.HOME_TEAM_ID}
            homeTeamAbv={game.HOME_TEAM_ABBREVIATION}
            awayTeamId={game.AWAY_TEAM_ID}
            awayTeamAbv={game.AWAY_TEAM_ABBREVIATION}
          />
        );
      })}
    </div>
  );
}
