/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { StatKeyToShortLabel } from "~/lib/consts";
import { cn } from "~/lib/utils";
import { type DBGame } from "~/server/db/types";
import { api } from "~/trpc/server";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";

const keysToIgnore = [
  "TEAM_NAME",
  "TEAM_ID",
  "MIN",
  "TEAM_ABBREVIATION",
  "TEAM_CITY",
  "GAME_ID",
] as const;

export default async function BoxScore({ game }: { game: DBGame }) {
  const gameStats = await api.games.getGameStats({ gameId: game.GAME_ID });

  const homeTeamAverages = await api.teams.getSeasonAveragesById({
    teamId: game.HOME_TEAM_ID.toString(),
  });
  const awayTeamAverages = await api.teams.getSeasonAveragesById({
    teamId: game.AWAY_TEAM_ID.toString(),
  });

  const homeTeam = gameStats.find((s) => s.TEAM_ID === game.HOME_TEAM_ID)!;
  const awayTeam = gameStats.find((s) => s.TEAM_ID === game.AWAY_TEAM_ID)!;

  const statKeys = Object.keys(homeTeam.teamStats).filter(
    (k) =>
      !keysToIgnore.includes(k as unknown as (typeof keysToIgnore)[number]),
  ) as Exclude<
    keyof typeof homeTeam.teamStats,
    (typeof keysToIgnore)[number]
  >[];

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
          {game.AWAY_TEAM_ABBREVIATION}
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

        <p className="flex items-center justify-center">
          {game.HOME_TEAM_ABBREVIATION}
        </p>

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
