import * as d3 from "d3";
import colors from "tailwindcss/colors";
import { hexToBW } from "~/lib/utils";
import { api } from "~/trpc/server";
import RotationsTooltip from "./rotations-tooltip";

const minWidth = 928;
const minHeight = 500;
const marginTop = 30;
const marginRight = 0;
const marginBottom = 30;
const marginLeft = 40;

export default async function RotationsChart({
  gameId,
  homeTeamId,
  awayTeamId,
  homeTeamAbv,
  awayTeamAbv,
}: {
  gameId: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamAbv: string;
  awayTeamAbv: string;
}) {
  const homeColor = colors.amber[600];
  const awayColor = colors.sky[600];

  const playbyplay = await api.games.getPlayByPlay({ gameId });
  const rotations = await api.games.getGameRotations({ gameId });
  const homeRotations = rotations.find((r) => r.TEAM_ID === homeTeamId)!;
  const awayRotations = rotations.find((r) => r.TEAM_ID === awayTeamId)!;

  let maxTime = 48 * 60 * 10;
  const lastPeriod = playbyplay.at(-1)!.PERIOD;
  if (lastPeriod > 4) {
    maxTime += (lastPeriod - 4) * 5 * 60 * 10;
  }

  const playerNames = [
    ...new Set(
      awayRotations.rotations
        .sort((a, b) => a.IN_TIME_REAL - b.IN_TIME_REAL)
        .map((p) => `${p.PLAYER_FIRST} ${p.PLAYER_LAST}`),
    ),
    ...new Set(
      homeRotations.rotations
        .sort((a, b) => a.IN_TIME_REAL - b.IN_TIME_REAL)
        .map((p) => `${p.PLAYER_FIRST} ${p.PLAYER_LAST}`),
    ),
  ];

  const xScale = d3.scaleLinear().domain([0, maxTime]).range([0, 100]);

  const yScale = d3.scaleBand().domain(playerNames).range([0, 100]);

  const timeouts = playbyplay.filter((play) => play.EVENTMSGTYPE === 9);

  function findLineups() {
    // First, find lineups by grouping players that are on the court at the same time
    const lineups: {
      players: (typeof rotations)[number]["rotations"];
      start: number;
      end: number;
      ptDiff: number;
      teamId: number;
    }[] = [];

    for (const rotations of [homeRotations, awayRotations]) {
      const sortedRotations = rotations.rotations.sort(
        (a, b) =>
          a.IN_TIME_REAL - b.IN_TIME_REAL || a.OUT_TIME_REAL - b.OUT_TIME_REAL,
      );

      let currentTime = 0;
      while (currentTime < maxTime) {
        const players = sortedRotations
          .filter(
            (r) =>
              r.IN_TIME_REAL <= currentTime && r.OUT_TIME_REAL >= currentTime,
          )
          .slice(0, 5);

        const endTime = Math.min(...players.map((p) => p.OUT_TIME_REAL));

        const relevantPlays = playbyplay.filter((play) => {
          const [minutes, seconds] = play.PCTIMESTRING.split(":").map(
            Number,
          ) as [number, number];
          let qtrTime = 12 * 60 * 10 - (minutes * 60 * 10 + seconds * 10);
          if (play.PERIOD > 4) {
            qtrTime = 5 * 60 * 10 - (minutes * 60 * 10 + seconds * 10);
          }
          let elapsedTime = (play.PERIOD - 1) * 12 * 60 * 10 + qtrTime;
          if (play.PERIOD > 4) {
            elapsedTime =
              48 * 60 * 10 + (play.PERIOD - 5) * 5 * 60 * 10 + qtrTime;
          }

          return elapsedTime >= currentTime && elapsedTime <= endTime;
        });

        const firstScore = relevantPlays.find((play) => play.SCORE);
        const lastScore = relevantPlays.reverse().find((play) => play.SCORE);

        let ptDiff = (() => {
          if (!firstScore || !lastScore) {
            return 0;
          }

          const [firstAway, firstHome] = firstScore
            .SCORE!.split(" - ")
            .map(Number) as [number, number];
          const [lastAway, lastHome] = lastScore
            .SCORE!.split(" - ")
            .map(Number) as [number, number];

          return lastHome - firstHome - (lastAway - firstAway);
        })();

        if (rotations.TEAM_ID === awayTeamId) {
          ptDiff *= -1;
        }

        lineups.push({
          players: players,
          start: currentTime,
          end: endTime,
          ptDiff,
          teamId: rotations.TEAM_ID,
        });

        currentTime = endTime + 1;
      }
    }

    // Group lineups by players
    const playerLineupsByTotalPtDiff: Record<
      string,
      {
        ptDiff: number;
        teamAbv: string;
        players: { id: number; name: string }[];
      }
    > = {};
    for (const lineup of lineups) {
      const key = lineup.players
        .map((p) => p.PERSON_ID)
        .sort((a, b) => a - b)
        .join(", ");

      if (!playerLineupsByTotalPtDiff[key]) {
        playerLineupsByTotalPtDiff[key] = {
          ptDiff: 0,
          teamAbv: lineup.teamId === homeTeamId ? homeTeamAbv : awayTeamAbv,
          players: lineup.players.map((p) => ({
            id: p.PERSON_ID,
            name: `${p.PLAYER_FIRST.slice(0, 1)}. ${p.PLAYER_LAST}`,
          })),
        };
      }

      playerLineupsByTotalPtDiff[key].ptDiff += lineup.ptDiff;
    }

    return Object.values(playerLineupsByTotalPtDiff).sort(
      (a, b) => b.ptDiff - a.ptDiff,
    );
  }

  const lineups = findLineups();

  return (
    <div className="flex h-full w-full flex-col items-start gap-12">
      <div
        className="relative h-full w-full"
        style={{
          minWidth,
          minHeight,
        }}
      >
        {/* X Axis */}
        <svg
          className="absolute inset-0 overflow-visible"
          style={{
            height: `calc(100% - ${marginTop}px)`,
            width: `calc(100% - ${marginLeft}px - ${marginRight}px)`,
            transform: `translate(${marginLeft}px, ${marginTop}px)`,
          }}
        >
          {[
            0,
            12,
            24,
            36,
            48,
            ...(playbyplay.at(-1)!.PERIOD > 4
              ? new Array(playbyplay.at(-1)!.PERIOD - 4)
                  .fill(0)
                  .map((_, i) => 48 + (i + 1) * 5)
              : []),
          ].map((m) => (
            <g key={m} className="overflow-visible font-medium text-gray-500">
              <line
                x1={`${xScale(m * 60 * 10)}%`}
                x2={`${xScale(m * 60 * 10)}%`}
                y1="0"
                y2="100%"
                stroke="currentColor"
                strokeWidth="1"
              />
              <text
                x={`${xScale(m * 60 * 10)}%`}
                y="102%"
                alignmentBaseline="hanging"
                textAnchor="middle"
                className="text-xs"
                fill="currentColor"
              >
                {m}:00
              </text>
            </g>
          ))}
        </svg>

        {/* Y Axis */}
        <svg
          className="absolute inset-0 overflow-visible"
          style={{
            height: `calc(100% - ${marginTop}px - ${marginBottom}px)`,
            width: `calc(100% - ${marginLeft}px)`,
            transform: `translate(${marginLeft}px, ${marginTop}px)`,
          }}
        >
          {playerNames.map((name, i) => (
            <g
              key={name}
              className="overflow-visible font-medium text-neutral-400"
            >
              {i === 0 && (
                <line
                  x1="0"
                  x2="100%"
                  y1={`${yScale(name)! - 0.5}%`}
                  y2={`${yScale(name)! - 0.5}%`}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="3"
                  opacity={0.3}
                />
              )}
              <line
                x1="0"
                x2="100%"
                y1={`${yScale(name)! + yScale.bandwidth() - 0.5}%`}
                y2={`${yScale(name)! + yScale.bandwidth() - 0.5}%`}
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="3"
                opacity={0.3}
              />
              <text
                x="-2%"
                y={`${yScale(name)! + yScale.bandwidth() / 2}%`}
                alignmentBaseline="middle"
                textAnchor="end"
                className="text-xs"
                fill="currentColor"
              >
                {name}
              </text>
            </g>
          ))}
        </svg>

        {/* Add gridlines and timeout markers */}
        <svg
          className="absolute inset-0 overflow-visible"
          style={{
            height: `calc(100% - ${marginTop}px - ${marginBottom}px)`,
            width: `calc(100% - ${marginLeft}px - ${marginRight}px)`,
            transform: `translate(${marginLeft}px, ${marginTop}px)`,
          }}
        >
          {[...Array(maxTime / 10 / 60)].map((_, i) => (
            <g
              key={i}
              className="overflow-visible font-medium text-neutral-400"
            >
              <line
                x1={`${xScale(i * 60 * 10)}%`}
                x2={`${xScale(i * 60 * 10)}%`}
                y1="0"
                y2="100%"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="3"
                opacity={i % 12 === 0 ? 0 : 0.3}
              />
            </g>
          ))}
          {timeouts.map((timeout, i) => {
            const [minutes, seconds] = timeout.PCTIMESTRING.split(":").map(
              Number,
            ) as [number, number];
            let qtrTime = 12 * 60 * 10 - (minutes * 60 * 10 + seconds * 10);
            if (timeout.PERIOD > 4) {
              qtrTime = 5 * 60 * 10 - (minutes * 60 * 10 + seconds * 10);
            }
            let x = xScale((timeout.PERIOD - 1) * 12 * 60 * 10 + qtrTime);
            if (timeout.PERIOD > 4) {
              x = xScale(
                48 * 60 * 10 + (timeout.PERIOD - 5) * 5 * 60 * 10 + qtrTime,
              );
            }

            const teamAbv =
              timeout.HOMEDESCRIPTION !== null
                ? homeTeamAbv
                : timeout.VISITORDESCRIPTION !== null
                  ? awayTeamAbv
                  : null;

            return (
              <g
                key={i}
                className="overflow-visible font-medium"
                style={{
                  color:
                    teamAbv === homeTeamAbv
                      ? homeColor
                      : teamAbv === awayTeamAbv
                        ? awayColor
                        : "currentColor",
                }}
              >
                <line
                  x1={`${x}%`}
                  x2={`${x}%`}
                  y1="0"
                  y2="100%"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeDasharray="2"
                />
                <text
                  x={`${x}%`}
                  y="102%"
                  alignmentBaseline="hanging"
                  textAnchor="middle"
                  className="text-xs"
                  fill="currentColor"
                >
                  TO
                </text>
              </g>
            );
          })}
        </svg>

        {/* Data */}
        <svg
          className="absolute inset-0 overflow-visible"
          style={{
            height: `calc(100% - ${marginTop}px - ${marginBottom}px)`,
            width: `calc(100% - ${marginLeft}px - ${marginRight}px)`,
            transform: `translate(${marginLeft}px, ${marginTop}px)`,
          }}
        >
          {[...awayRotations.rotations, ...homeRotations.rotations].map(
            (r, i) => {
              const {
                IN_TIME_REAL,
                OUT_TIME_REAL,
                PERSON_ID,
                PLAYER_FIRST,
                PLAYER_LAST,
                PT_DIFF,
                TEAM_ID,
              } = r;

              const x = xScale(IN_TIME_REAL);
              const y = yScale(`${PLAYER_FIRST} ${PLAYER_LAST}`)!;
              const width = xScale(OUT_TIME_REAL - IN_TIME_REAL);
              const height = yScale.bandwidth() - 1;
              const teamColor = TEAM_ID === homeTeamId ? homeColor : awayColor;

              return (
                <g key={`${TEAM_ID}-${PERSON_ID}-${i}`}>
                  <rect
                    x={`${x}%`}
                    y={`${y}%`}
                    height={`${height}%`}
                    width={`${width}%`}
                    fill={teamColor}
                    opacity={0.8}
                    // opacity={Math.min(Math.max(0.3, 0.3 + PT_DIFF * 0.1), 1)}
                  />

                  <text
                    x={`${x + width / 2}%`}
                    y={`${y + height / 2 + 0.25}%`}
                    alignmentBaseline="middle"
                    textAnchor="middle"
                    className="tabular-nums"
                    fontSize=".9em"
                    fill={hexToBW(teamColor)}
                  >
                    {PT_DIFF > 0 ? `+${PT_DIFF}` : PT_DIFF}
                  </text>
                </g>
              );
            },
          )}
        </svg>

        <RotationsTooltip
          playbyplay={playbyplay}
          rotations={rotations}
          homeTeamId={homeTeamId}
          awayTeamId={awayTeamId}
          homeTeamAbv={homeTeamAbv}
          awayTeamAbv={awayTeamAbv}
          chartDimensions={{ marginTop, marginRight, marginBottom, marginLeft }}
        />
      </div>

      {/* Lineups */}
      <div className="flex w-full justify-between gap-12">
        {/* Best */}
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold">Best Lineups</p>
          {lineups.slice(0, 3).map((lineup, i) => (
            <div key={`best_${i}`} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <p
                  className="text-lg font-semibold"
                  style={{
                    color:
                      lineup.teamAbv === homeTeamAbv ? homeColor : awayColor,
                  }}
                >
                  {lineup.teamAbv}
                </p>
                <span>
                  ({lineup.ptDiff > 0 ? `+${lineup.ptDiff}` : lineup.ptDiff})
                </span>
              </div>
              <p className="text-sm">
                {lineup.players.map((p) => p.name).join(", ")}
              </p>
            </div>
          ))}
        </div>
        {/* Worst */}
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold">Worst Lineups</p>
          {lineups
            .slice(-3)
            .reverse()
            .map((lineup, i) => (
              <div key={`worst_${i}`} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <p
                    className="text-lg font-semibold"
                    style={{
                      color:
                        lineup.teamAbv === homeTeamAbv ? homeColor : awayColor,
                    }}
                  >
                    {lineup.teamAbv}
                  </p>
                  <span>
                    ({lineup.ptDiff > 0 ? `+${lineup.ptDiff}` : lineup.ptDiff})
                  </span>
                </div>
                <p className="text-sm">
                  {lineup.players.map((p) => p.name).join(", ")}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
