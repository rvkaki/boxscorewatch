import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import BoxScore from "../components/box-score";
import GameCharts from "../components/game-charts";

export default async function GamePage({
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
      <BoxScore game={game} />
      <GameCharts
        gameId={gameId}
        homeTeamId={game.HOME_TEAM_ID.toString()}
        awayTeamId={game.AWAY_TEAM_ID.toString()}
      />
    </>
  );
}
