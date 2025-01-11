import Image from "next/image";
import Link from "next/link";
import { getTeamLogoUrl } from "~/lib/utils";
import { type DBGame } from "~/server/db/types";

export default function GameCard({
  game,
  teamsById,
}: {
  game: DBGame;
  teamsById: Record<number, { W: number; L: number }>;
}) {
  const gameDate = new Date(game.GAME_DATE);

  const isHomeWin = game.HOME_TEAM_PTS > game.AWAY_TEAM_PTS;

  const homeTeamId = game.HOME_TEAM_ID;
  const awayTeamId = game.AWAY_TEAM_ID;

  return (
    <Link
      key={game.GAME_ID}
      href={`/games/${game.GAME_ID}`}
      className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-neutral-500 p-4 hover:border-amber-500 hover:bg-amber-500 hover:bg-opacity-[0.03]"
      prefetch={false}
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
          <span className="font-semibold">{game.AWAY_TEAM_ABBREVIATION}</span>
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
          <span className="font-semibold">{game.HOME_TEAM_ABBREVIATION}</span>
          <span className="text-xs text-neutral-400">
            {teamsById[homeTeamId]?.W} - {teamsById[homeTeamId]?.L}
          </span>
        </div>
      </div>
    </Link>
  );
}
