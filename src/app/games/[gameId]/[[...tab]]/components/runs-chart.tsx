import * as d3 from "d3";
import { TeamTricodeToColor } from "~/lib/consts";
import { api } from "~/trpc/server";
import RunsTooltip from "./runs-tooltip";
import { hexToBW } from "~/lib/utils";

const minWidth = 928;
const minHeight = 500;
const marginTop = 30;
const marginRight = 0;
const marginBottom = 30;
const marginLeft = 40;

export default async function RunsChart({
  gameId,
  homeTeamAbv,
  awayTeamAbv,
}: {
  gameId: string;
  homeTeamAbv: string;
  awayTeamAbv: string;
}) {
  const homeColor = TeamTricodeToColor[homeTeamAbv]!;
  const awayColor = TeamTricodeToColor[awayTeamAbv]!;

  const runs = await api.games.getGameRuns({ gameId });
  const playbyplay = await api.games.getPlayByPlay({ gameId });

  const playbyplayData = playbyplay.flatMap((play) => {
    // Filter out non-scoring plays
    if (![1, 3].includes(play.EVENTMSGTYPE)) {
      return [];
    }

    if (!play.SCORE) {
      return [];
    }

    const score = play.SCORE.split(" - ").map((score) => parseInt(score, 10));

    return [
      {
        ...play,
        scoreDiff: score[1]! - score[0]!, // Home shows on top
      },
    ];
  });

  // Declare the x (horizontal position) scale.
  const xScale = d3
    .scaleLinear()
    .domain([0, playbyplayData.length])
    .range([0, 100]);

  // Declare the y (vertical position) scale.
  const maxScoreDiff = d3.max(playbyplayData, (d) => d.scoreDiff)!;
  const minScoreDiff = d3.min(playbyplayData, (d) => d.scoreDiff)!;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const range = Math.max(Math.abs(maxScoreDiff), Math.abs(minScoreDiff));

  const yScale = d3.scaleLinear().domain([-range, range]).range([100, 0]);

  const quarterLimits = playbyplayData.reduce(
    (acc, play, i) => {
      if (play.PERIOD !== acc.period) {
        acc.period = play.PERIOD;
        acc.limits.push(i);
      }

      return acc;
    },
    { period: 0, limits: [] as number[] },
  ).limits;

  return (
    <div
      className="relative h-full w-full"
      style={{
        minWidth,
        minHeight,
      }}
    >
      {/* X axis */}
      <svg
        className="absolute inset-0 overflow-visible"
        style={{
          height: `calc(100% - ${marginTop}px)`,
          width: `calc(100% - ${marginLeft}px - ${marginRight}px)`,
          transform: `translate(${marginLeft}px, ${marginTop}px)`,
        }}
      >
        {/* TODO: Show quarter separation ? */}
        {quarterLimits.map((l, i) => (
          <g key={i} className="overflow-visible font-medium text-gray-500">
            <line
              x1={`${xScale(l)}%`}
              x2={`${xScale(l)}%`}
              y1="0"
              y2="100%"
              stroke="currentColor"
              strokeWidth="1"
            />
            <text
              x={`${xScale(l)}%`}
              y="102%"
              alignmentBaseline="hanging"
              textAnchor="middle"
              className="text-xs"
              fill="currentColor"
            >
              Q{Math.floor(playbyplayData[l]?.PERIOD ?? 0)}
            </text>
          </g>
        ))}
      </svg>

      {/* Y axis */}
      <svg
        className="absolute inset-0 overflow-visible"
        style={{
          height: `calc(100% - ${marginTop}px - ${marginBottom}px)`,
          width: `calc(100% - ${marginLeft}px)`,
          transform: `translateY(${marginTop}px)`,
        }}
      >
        <g className="translate-x-4">
          {yScale.ticks(8).map((value, i) => (
            <text
              key={i}
              y={`${yScale(value)}%`}
              alignmentBaseline="middle"
              textAnchor="end"
              className="text-xs tabular-nums text-gray-600"
              fill="currentColor"
            >
              {value}
            </text>
          ))}
        </g>
      </svg>

      {/* Bar Chart */}
      <svg
        className="absolute inset-0 overflow-visible"
        style={{
          height: `calc(100% - ${marginTop}px - ${marginBottom}px)`,
          width: `calc(100% - ${marginLeft}px - ${marginRight}px)`,
          transform: `translate(${marginLeft}px, ${marginTop}px)`,
        }}
      >
        <svg
          className="overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {playbyplayData.map((day, i) => {
            const barHeight = Math.abs(50 - yScale(day.scoreDiff));
            const barY = 50 + (day.scoreDiff < 0 ? 0 : -barHeight);
            const barWidth = 100 / playbyplayData.length;

            return (
              <g key={i}>
                <rect
                  x={`${xScale(i)}%`}
                  y={`${barY}%`}
                  width={`${barWidth}%`}
                  height={`${barHeight}%`}
                  fill={barY < 50 ? homeColor : awayColor}
                />
              </g>
            );
          })}
        </svg>
      </svg>

      {/* Runs areas */}
      <svg
        className="absolute inset-0 overflow-visible"
        style={{
          height: `calc(100% - ${marginTop}px - ${marginBottom}px)`,
          width: `calc(100% - ${marginLeft}px - ${marginRight}px)`,
          transform: `translate(${marginLeft}px, ${marginTop}px)`,
        }}
      >
        {runs.map((run) => {
          const start = playbyplayData.find(
            (play) => play.EVENTNUM === run.startEvent,
          );
          const end = playbyplayData.find(
            (play) => play.EVENTNUM === run.endEvent,
          );

          if (!start || !end) {
            return null;
          }

          const startX = xScale(playbyplayData.indexOf(start));
          const endX = xScale(playbyplayData.indexOf(end) + 1);
          const width = endX - startX;

          const runColor = run.teamAbbr === homeTeamAbv ? homeColor : awayColor;

          return (
            <g key={run.startEvent} className="relative">
              <defs>
                <filter x="-0.25" y="-0.1" width="1.5" height="1.2" id="home">
                  <feFlood floodColor={homeColor} result="bg" />
                  <feMerge>
                    <feMergeNode in="bg" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter x="-0.25" y="-0.1" width="1.5" height="1.2" id="away">
                  <feFlood floodColor={awayColor} result="bg" />
                  <feMerge>
                    <feMergeNode in="bg" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect
                x={`${startX}%`}
                y="0"
                width={`${width}%`}
                height="100%"
                fill={runColor}
                opacity={0.15}
              />

              <text
                filter={`url(#${runColor === homeColor ? "home" : "away"})`}
                x={`${startX + width / 2}%`}
                y="95%"
                alignmentBaseline="middle"
                textAnchor="middle"
                className="tabular-nums"
                fill="currentColor"
                fontSize="11"
                color={hexToBW(runColor)}
              >
                {run.runScore} - {run.opponentScore}
              </text>
            </g>
          );
        })}
      </svg>

      <RunsTooltip
        runs={runs}
        playbyplay={playbyplayData}
        chartDimensions={{
          marginTop,
          marginRight,
          marginBottom,
          marginLeft,
        }}
      />
    </div>
  );
}
