import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { getTeamLogoUrl } from "~/lib/utils";
import { api } from "~/trpc/server";

export default async function GamesList() {
  const teams = await api.teams.getAll();
  const teamsById = teams.reduce(
    (acc, team) => {
      acc[team.TEAM_ID] = team;
      return acc;
    },
    {} as Record<string, (typeof teams)[0]>,
  );

  const grouppedGames = await api.games.getGrouppedByDate();

  return (
    <div className="flex w-full flex-col items-start gap-12 text-neutral-100">
      {grouppedGames.map(({ _id: date, games }) => (
        <div key={date} className="flex w-full flex-col gap-2">
          <p className="text-lg font-bold">{format(new Date(date), "E PP")}</p>
          <div className="grid w-full grid-cols-4 gap-4">
            {games.map((game) => {
              const gameDate = new Date(game.GAME_DATE);

              const isHomeWin = game.HOME_TEAM_PTS > game.AWAY_TEAM_PTS;

              const homeTeamId = game.HOME_TEAM_ID;
              const awayTeamId = game.AWAY_TEAM_ID;

              return (
                <Link
                  key={game.GAME_ID}
                  href={`/games/${game.GAME_ID}`}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-neutral-500 p-4 hover:border-amber-500 hover:bg-amber-500 hover:bg-opacity-[0.03]"
                >
                  <span className="text-sm">{gameDate.toDateString()}</span>
                  <div className="flex flex-row items-center gap-6">
                    <div className="flex flex-col items-center">
                      <Image
                        src={getTeamLogoUrl(awayTeamId)}
                        alt={game.AWAY_TEAM_NAME ?? "Team Logo"}
                        width={36}
                        height={36}
                      />
                      <span className="font-semibold">
                        {game.AWAY_TEAM_ABBREVIATION}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {teamsById[awayTeamId]?.W} - {teamsById[awayTeamId]?.L}
                      </span>
                    </div>
                    <div className="flex flex-row gap-2 text-lg font-semibold">
                      <span
                        className={`${isHomeWin ? "text-neutral-400" : "text-current"}`}
                      >
                        {game.AWAY_TEAM_PTS}
                      </span>
                      <span>-</span>
                      <span
                        className={`${isHomeWin ? "text-current" : "text-neutral-400"}`}
                      >
                        {game.HOME_TEAM_PTS}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Image
                        src={getTeamLogoUrl(homeTeamId)}
                        alt={game.HOME_TEAM_NAME ?? "Team Logo"}
                        width={36}
                        height={36}
                      />
                      <span className="font-semibold">
                        {game.HOME_TEAM_ABBREVIATION}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {teamsById[homeTeamId]?.W} - {teamsById[homeTeamId]?.L}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
