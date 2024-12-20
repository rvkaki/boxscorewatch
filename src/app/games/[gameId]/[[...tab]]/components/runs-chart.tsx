import { api } from "~/trpc/server";

export default async function RunsChart({ gameId }: { gameId: string }) {
  const runs = await api.games.getGameRuns({ gameId });

  console.log(runs);

  return null;
}
