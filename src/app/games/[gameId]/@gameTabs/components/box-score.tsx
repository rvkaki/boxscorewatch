import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { StatKeyToShortLabel } from "~/lib/consts";
import { cn, getTeamLogoUrl } from "~/lib/utils";
import { type DBGame, type DBGameStats } from "~/server/db/types";
import { api } from "~/trpc/server";

const teamKeysToIgnore = [
  "TEAM_NAME",
  "TEAM_ID",
  "MIN",
  "TEAM_ABBREVIATION",
  "TEAM_CITY",
  "GAME_ID",
] as const;

const playerKeysToIgnore = [
  "COMMENT",
  "GAME_ID",
  "PLAYER_ID",
  "PLAYER_NAME",
  "TEAM_ID",
  "NICKNAME",
  "START_POSITION",
  "TEAM_ABBREVIATION",
  "TEAM_CITY",
] as const;

async function TeamBoxScore({
  homeTeamId,
  awayTeamId,
  homeTeamAbv,
  awayTeamAbv,
  gameStats,
  statKeys,
}: {
  homeTeamId: number;
  awayTeamId: number;
  homeTeamAbv: string;
  awayTeamAbv: string;
  gameStats: DBGameStats[];
  statKeys: Exclude<
    keyof (typeof gameStats)[number]["teamStats"],
    (typeof teamKeysToIgnore)[number]
  >[];
}) {
  const homeTeamAverages = await api.teams.getSeasonAveragesById({
    teamId: homeTeamId.toString(),
  });
  const awayTeamAverages = await api.teams.getSeasonAveragesById({
    teamId: awayTeamId.toString(),
  });

  const homeTeam = gameStats.find((s) => s.TEAM_ID === homeTeamId)!;
  const awayTeam = gameStats.find((s) => s.TEAM_ID === awayTeamId)!;

  return (
    <div className="flex w-full flex-col items-end gap-4 py-8">
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <QuestionMarkCircledIcon
              width={18}
              height={18}
              className="cursor-pointer text-neutral-400"
            />
          </TooltipTrigger>
          <TooltipContent align="end" side="bottom">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-sm bg-red-400 bg-opacity-25" />
                <p className="text-sm text-neutral-400">Well below average</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-sm bg-red-400 bg-opacity-10" />
                <p className="text-sm text-neutral-400">Below average</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-sm border border-neutral-700 bg-neutral-950" />
                <p className="text-sm text-neutral-400">Close to average</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-sm bg-green-400 bg-opacity-10" />
                <p className="text-sm text-neutral-400">Above average</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-sm bg-green-400 bg-opacity-25" />
                <p className="text-sm text-neutral-400">Well above average</p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div
        className="grid w-full grid-rows-3 place-items-stretch justify-items-stretch rounded-sm border border-neutral-800 text-center text-neutral-400"
        style={{
          gridTemplateColumns: `repeat(${statKeys.length + 1}, minmax(52px, 1fr))`,
          gridTemplateRows: "repeat(3, minmax(52px, 1fr)",
        }}
      >
        <div className="w-full border-b border-neutral-800"></div>
        {statKeys.map((key, i) => (
          <p
            key={key}
            className={cn(
              "flex items-center justify-center border border-t-0 border-neutral-800",
              i === statKeys.length - 1 ? "border-r-0" : "",
            )}
          >
            {StatKeyToShortLabel[key]}
          </p>
        ))}

        <p className="flex items-center justify-center border-b border-neutral-800">
          {awayTeamAbv}
        </p>

        {statKeys.map((key, i) => {
          const value = awayTeam.teamStats[key];
          let strValue: string | number = value;
          const betterThanOpponent = value > homeTeam.teamStats[key];
          if (key === "FG_PCT" || key === "FG3_PCT" || key === "FT_PCT") {
            strValue = (value * 100).toFixed(1) + "%";
          }

          let avgComparisonClassName = "";
          const stdDev = awayTeamAverages?.standardDeviations?.[key]?.value;
          const average = awayTeamAverages?.[key === "TO" ? "TOV" : key];
          if (stdDev && average) {
            // TO and PF are better when lower
            const diff = ["TO", "PF"].includes(key)
              ? average - value
              : value - average;
            const cmp = diff / stdDev;
            if (cmp > 2) {
              avgComparisonClassName = "bg-green-400 bg-opacity-25";
            } else if (cmp > 1) {
              avgComparisonClassName = "bg-green-400 bg-opacity-10";
            } else if (cmp < -2) {
              avgComparisonClassName = "bg-red-400 bg-opacity-25";
            } else if (cmp < -1) {
              avgComparisonClassName = "bg-red-400 bg-opacity-10";
            }
          }

          return (
            <p
              key={key}
              className={cn(
                "flex items-center justify-center border border-t-0 border-neutral-800",
                i === statKeys.length - 1 ? "border-r-0" : "",
                betterThanOpponent
                  ? "font-bold text-neutral-200 text-opacity-90"
                  : "",
                avgComparisonClassName,
              )}
            >
              {strValue}
            </p>
          );
        })}

        <p className="flex items-center justify-center">{homeTeamAbv}</p>

        {statKeys.map((key, i) => {
          const value: string | number = homeTeam.teamStats[key];
          let strValue: string | number = value;
          const betterThanOpponent = value > awayTeam.teamStats[key];
          if (key === "FG_PCT" || key === "FG3_PCT" || key === "FT_PCT") {
            strValue = (value * 100).toFixed(1) + "%";
          }

          let avgComparisonClassName = "";
          const stdDev = homeTeamAverages?.standardDeviations?.[key]?.value;
          const average = homeTeamAverages?.[key === "TO" ? "TOV" : key];
          if (stdDev && average) {
            // TO and PF are better when lower
            const diff = ["TO", "PF"].includes(key)
              ? average - value
              : value - average;
            const cmp = diff / stdDev;
            if (cmp > 2) {
              avgComparisonClassName = "bg-green-400 bg-opacity-25";
            } else if (cmp > 1) {
              avgComparisonClassName = "bg-green-400 bg-opacity-10";
            } else if (cmp < -2) {
              avgComparisonClassName = "bg-red-400 bg-opacity-25";
            } else if (cmp < -1) {
              avgComparisonClassName = "bg-red-400 bg-opacity-10";
            }
          }

          return (
            <p
              key={key}
              className={cn(
                "flex items-center justify-center border border-b-0 border-t-0 border-neutral-800",
                i === statKeys.length - 1 ? "border-r-0" : "",
                betterThanOpponent
                  ? "font-bold text-neutral-200 text-opacity-90"
                  : "",
                avgComparisonClassName,
              )}
            >
              {strValue}
            </p>
          );
        })}
      </div>
    </div>
  );
}

async function PlayersBoxScore({
  homeTeamId,
  awayTeamId,
  gameStats,
  statKeys,
}: {
  homeTeamId: number;
  awayTeamId: number;
  gameStats: DBGameStats[];
  statKeys: Exclude<
    keyof (typeof gameStats)[number]["playerStats"][number],
    (typeof playerKeysToIgnore)[number]
  >[];
}) {
  const homeTeam = gameStats.find((s) => s.TEAM_ID === homeTeamId)!;
  const awayTeam = gameStats.find((s) => s.TEAM_ID === awayTeamId)!;

  return (
    <div className="flex w-full flex-col items-stretch gap-8">
      <div className="flex flex-1 flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <Image
            src={getTeamLogoUrl(awayTeam.TEAM_ID)}
            width={42}
            height={42}
            alt={awayTeam.teamStats.TEAM_NAME}
          />
          <p>{awayTeam.teamStats.TEAM_NAME}</p>
        </div>

        <div className="flex w-full flex-col items-start rounded-sm border border-neutral-800 pb-2">
          <div
            className="grid w-full place-items-center bg-neutral-900 px-4 py-2 text-xs"
            style={{
              gridTemplateColumns: `1fr repeat(${statKeys.length},40px)`,
            }}
          >
            <p className="place-self-start">Name</p>
            {statKeys.map((key) => (
              <p key={key}>{StatKeyToShortLabel[key]}</p>
            ))}
          </div>

          {awayTeam.playerStats.map((player) => (
            <div
              key={player.PLAYER_ID}
              className="grid w-full place-items-center px-4 py-1 text-xs hover:bg-neutral-700"
              style={{
                gridTemplateColumns: `1fr repeat(${statKeys.length},40px)`,
              }}
            >
              <p className="place-self-start">
                {player.PLAYER_NAME}
                <span className="ml-2 text-[10px] font-semibold text-neutral-400">
                  {player.START_POSITION}
                </span>
              </p>
              {player.MIN === null ? (
                <div className="col-start-2 -col-end-1">
                  <p>{player.COMMENT}</p>
                </div>
              ) : (
                statKeys.map((key) => {
                  const value = player[key];
                  let strValue = value?.toString() ?? "-";
                  if (
                    key === "FG_PCT" ||
                    key === "FG3_PCT" ||
                    key === "FT_PCT"
                  ) {
                    strValue = ((value as number) * 100).toFixed(1) + "%";
                  }
                  if (key === "MIN") {
                    const [min, sec] = (value as string).split(":") as [
                      string,
                      string,
                    ];
                    const actualMin = min.split(".")[0]!;
                    strValue = `${actualMin}:${sec}`;
                  }

                  return (
                    <p
                      key={key}
                      className={cn("flex items-center justify-center")}
                    >
                      {strValue}
                    </p>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <Image
            src={getTeamLogoUrl(homeTeam.TEAM_ID)}
            width={42}
            height={42}
            alt={homeTeam.teamStats.TEAM_NAME}
          />
          <p>{homeTeam.teamStats.TEAM_NAME}</p>
        </div>

        <div className="flex w-full flex-col items-start rounded-sm border border-neutral-800 pb-2">
          <div
            className="grid w-full place-items-center bg-neutral-900 px-4 py-2 text-xs"
            style={{
              gridTemplateColumns: `1fr repeat(${statKeys.length},40px)`,
            }}
          >
            <p className="place-self-start">Name</p>
            {statKeys.map((key) => (
              <p key={key}>{StatKeyToShortLabel[key]}</p>
            ))}
          </div>

          {homeTeam.playerStats.map((player) => (
            <div
              key={player.PLAYER_ID}
              className="grid w-full place-items-center px-4 py-1 text-xs hover:bg-neutral-700"
              style={{
                gridTemplateColumns: `1fr repeat(${statKeys.length},40px)`,
              }}
            >
              <p className="place-self-start">
                {player.PLAYER_NAME}
                <span className="ml-2 text-[10px] font-semibold text-neutral-400">
                  {player.START_POSITION}
                </span>
              </p>
              {player.MIN === null ? (
                <div className="col-start-2 -col-end-1">
                  <p>{player.COMMENT}</p>
                </div>
              ) : (
                statKeys.map((key) => {
                  const value = player[key];
                  let strValue = value?.toString() ?? "-";
                  if (
                    key === "FG_PCT" ||
                    key === "FG3_PCT" ||
                    key === "FT_PCT"
                  ) {
                    strValue = ((value as number) * 100).toFixed(1) + "%";
                  }
                  if (key === "MIN") {
                    const [min, sec] = (value as string).split(":") as [
                      string,
                      string,
                    ];
                    const actualMin = min.split(".")[0]!;
                    strValue = `${actualMin}:${sec}`;
                  }

                  return (
                    <p
                      key={key}
                      className={cn("flex items-center justify-center")}
                    >
                      {strValue}
                    </p>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function BoxScore({ game }: { game: DBGame }) {
  const gameStats = await api.games.getGameStats({ gameId: game.GAME_ID });

  const teamStatKeys = Object.keys(gameStats[0]!.teamStats).filter(
    (k) =>
      !teamKeysToIgnore.includes(
        k as unknown as (typeof teamKeysToIgnore)[number],
      ),
  ) as Exclude<
    keyof (typeof gameStats)[number]["teamStats"],
    (typeof teamKeysToIgnore)[number]
  >[];

  const playerStatKeys = Object.keys(gameStats[0]!.playerStats[0]!).filter(
    (k) =>
      !playerKeysToIgnore.includes(
        k as unknown as (typeof playerKeysToIgnore)[number],
      ),
  ) as Exclude<
    keyof (typeof gameStats)[number]["playerStats"][number],
    (typeof playerKeysToIgnore)[number]
  >[];

  return (
    <div className="flex w-full flex-col items-start gap-12">
      <TeamBoxScore
        gameStats={gameStats}
        statKeys={teamStatKeys}
        homeTeamAbv={game.HOME_TEAM_ABBREVIATION}
        homeTeamId={game.HOME_TEAM_ID}
        awayTeamAbv={game.AWAY_TEAM_ABBREVIATION}
        awayTeamId={game.AWAY_TEAM_ID}
      />

      <PlayersBoxScore
        homeTeamId={game.HOME_TEAM_ID}
        awayTeamId={game.AWAY_TEAM_ID}
        gameStats={gameStats}
        statKeys={playerStatKeys}
      />
    </div>
  );
}
