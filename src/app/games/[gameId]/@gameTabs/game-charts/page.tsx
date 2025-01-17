import { api } from "~/trpc/server";
import SmallBarChart from "../components/small-bar-chart";
import colors from "tailwindcss/colors";

export default async function GameChartsPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const homeColor = colors.amber[600];
  const awayColor = colors.sky[600];

  const { gameId } = await params;
  const game = await api.games.getById({ gameId });
  const gameStats = await api.games.getGameStats({ gameId });

  if (!game || !gameStats) {
    return null;
  }

  const pitpData = gameStats
    .map((t) => ({
      label: t.teamStats.TEAM_ABBREVIATION,
      value: t.teamStats.PITP,
      color: t.teamStats.TEAM_ID === game.HOME_TEAM_ID ? homeColor : awayColor,
    }))
    .reverse();

  const secondChanceData = gameStats
    .map((t) => ({
      label: t.teamStats.TEAM_ABBREVIATION,
      value: t.teamStats.SECOND_CHANCE_PTS,
      color: t.teamStats.TEAM_ID === game.HOME_TEAM_ID ? homeColor : awayColor,
    }))
    .reverse();

  const fastBreakData = gameStats
    .map((t) => ({
      label: t.teamStats.TEAM_ABBREVIATION,
      value: t.teamStats.FB_PTS,
      color: t.teamStats.TEAM_ID === game.HOME_TEAM_ID ? homeColor : awayColor,
    }))
    .reverse();

  const ptsOffTurnoversData = gameStats
    .map((t) => ({
      label: t.teamStats.TEAM_ABBREVIATION,
      value: t.teamStats.PTS_OFF_TO,
      color: t.teamStats.TEAM_ID === game.HOME_TEAM_ID ? homeColor : awayColor,
    }))
    .reverse();

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-12 px-6">
      {/* PITP Chart */}
      <SmallBarChart title="Points in the Paint" data={pitpData} />
      {/* Second Chance Points Chart */}
      <SmallBarChart title="Second Chance Points" data={secondChanceData} />
      {/* Fast Break Points Chart */}
      <SmallBarChart title="Fast Break Points" data={fastBreakData} />
      {/* Points off Turnovers Chart */}
      <SmallBarChart title="Points off Turnovers" data={ptsOffTurnoversData} />
    </div>
  );
}
