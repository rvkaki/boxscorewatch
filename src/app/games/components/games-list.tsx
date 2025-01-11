import { format } from "date-fns";
import GameCard from "~/app/components/game-card";
import { api } from "~/trpc/server";

export default async function GamesList() {
  const teams = await api.teams.getAll();
  const seasonAverages = await api.teams.getAllSeasonAverages();
  const teamsById = teams.reduce(
    (acc, team) => {
      acc[team.TEAM_ID] = team;
      const teamAvg = seasonAverages.find(
        (avg) => avg.TEAM_ID === team.TEAM_ID.toString(),
      );
      acc[team.TEAM_ID]!.W = teamAvg?.W;
      acc[team.TEAM_ID]!.L = teamAvg?.L;
      return acc;
    },
    {} as Record<string, (typeof teams)[0]>,
  );

  const grouppedGames = await api.games.getGrouppedByDate();

  return (
    <div className="flex w-full flex-col items-start gap-12 px-4 text-neutral-100">
      {grouppedGames.map(({ _id: date, games }) => (
        <div key={date} className="flex w-full flex-col gap-2">
          <p className="text-lg font-bold">{format(new Date(date), "E PP")}</p>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {games.map((game) => (
              <GameCard
                key={game.GAME_ID}
                game={game}
                teamsById={
                  teamsById as unknown as Record<
                    number,
                    { W: number; L: number }
                  >
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
