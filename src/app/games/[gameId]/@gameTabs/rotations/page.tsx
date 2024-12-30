import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import RotationsChart from "../components/rotations-chart";

export default async function RotationsPage({
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
      <RotationsChart
        gameId={gameId}
        homeTeamId={game.HOME_TEAM_ID}
        awayTeamId={game.AWAY_TEAM_ID}
        homeTeamAbv={game.HOME_TEAM_ABBREVIATION}
        awayTeamAbv={game.AWAY_TEAM_ABBREVIATION}
      />
    </>
  );
}
