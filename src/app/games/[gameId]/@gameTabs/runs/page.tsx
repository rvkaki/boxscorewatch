import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import RunsChart from "../components/runs-chart";

export default async function RunsPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const game = await api.games.getById({ gameId });
  if (!game) {
    return notFound();
  }

  return (
    <>
      <RunsChart
        gameId={gameId}
        homeTeamAbv={game.HOME_TEAM_ABBREVIATION}
        awayTeamAbv={game.AWAY_TEAM_ABBREVIATION}
      />
    </>
  );
}
