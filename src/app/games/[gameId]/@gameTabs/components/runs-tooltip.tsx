"use client";

import Image from "next/image";
import { useState } from "react";
import colors from "tailwindcss/colors";
import { getPlayerImageUrl, hexToBW } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/react";

export default function RunsTooltip({
  runs,
  playbyplay,
  homeTeamAbv,
  chartDimensions,
}: {
  runs: RouterOutputs["games"]["getGameRuns"];
  playbyplay: RouterOutputs["games"]["getPlayByPlay"];
  homeTeamAbv: string;
  awayTeamAbv: string;
  chartDimensions: {
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
  };
}) {
  const [activePlayIdx, setActivePlayIdx] = useState<number | null>(null);
  const [runStartPlayIdx, setRunStartPlayIdx] = useState<number | null>(null);
  const [runEndPlayIdx, setRunEndPlayIdx] = useState<number | null>(null);

  function handleMouseMove(e: React.MouseEvent) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const bound = e.currentTarget.getBoundingClientRect();
    const barWidth = bound.width / playbyplay.length;
    const actualX = mouseX - bound.left;
    const actualY = mouseY - bound.top;

    if (
      actualX < 0 ||
      actualX > bound.width ||
      actualY < 0 ||
      actualY > bound.height
    ) {
      setActivePlayIdx(null);
      setRunStartPlayIdx(null);
      setRunEndPlayIdx(null);
      return;
    }

    const playIndex = Math.floor(actualX / barWidth);
    const play = playbyplay[playIndex];

    if (!play) {
      setActivePlayIdx(null);
      setRunStartPlayIdx(null);
      setRunEndPlayIdx(null);
      return;
    }

    const hoveredRun = runs.find((run) =>
      hoveredPlay
        ? run.startEvent <= hoveredPlay?.EVENTNUM &&
          run.endEvent >= hoveredPlay?.EVENTNUM
        : false,
    );

    if (hoveredRun) {
      const startX = playbyplay.findIndex(
        (p) => p.EVENTNUM === hoveredRun.startEvent,
      );
      const endX = playbyplay.findIndex(
        (p) => p.EVENTNUM === hoveredRun.endEvent,
      );
      setRunStartPlayIdx(startX);
      setRunEndPlayIdx(endX);
    }

    setActivePlayIdx(playIndex);
  }

  const hoveredPlay = activePlayIdx !== null ? playbyplay[activePlayIdx] : null;
  const hoveredRun = runs.find((run) =>
    hoveredPlay
      ? run.startEvent <= hoveredPlay?.EVENTNUM &&
        run.endEvent >= hoveredPlay?.EVENTNUM
      : false,
  );

  const teamAbv = hoveredPlay?.PLAYER1_TEAM_ABBREVIATION;
  const scoreColor =
    teamAbv === homeTeamAbv ? colors.amber[600] : colors.sky[600];

  const playScore = hoveredPlay?.SCORE?.split(" - ").map(Number);
  const playDescription =
    hoveredPlay?.HOMEDESCRIPTION ??
    hoveredPlay?.VISITORDESCRIPTION ??
    hoveredPlay?.NEUTRALDESCRIPTION;
  const runColor =
    hoveredRun?.teamAbbr === homeTeamAbv ? colors.amber[600] : colors.sky[600];

  const highlightPlayers = (() => {
    if (!hoveredRun) return [];

    const players: Record<number, { name: string; points: number }> = {};
    for (const play of hoveredRun.plays) {
      if (players[play.playerId]) {
        players[play.playerId]!.points += play.points;
      } else {
        players[play.playerId] = {
          name: play.playerName,
          points: play.points,
        };
      }
    }

    return Object.entries(players)
      .flatMap(([id, { name, points }]) =>
        points > hoveredRun.runScore / 2
          ? {
              id: Number(id),
              name,
              points,
            }
          : [],
      )
      .sort((a, b) => b.points - a.points);
  })();

  return (
    <div
      className="absolute"
      style={{
        width: `calc(100% - ${chartDimensions.marginLeft}px - ${chartDimensions.marginRight}px)`,
        height: `calc(100% - ${chartDimensions.marginTop}px - ${chartDimensions.marginBottom}px)`,
        left: chartDimensions.marginLeft,
        top: chartDimensions.marginTop,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setActivePlayIdx(null)}
    >
      {hoveredPlay && activePlayIdx !== null && (
        <>
          {/* Greyed out bar hover */}
          <div
            className="absolute left-0 top-0 h-full bg-white/20"
            style={{
              width: `${100 / playbyplay.length}%`,
              transform: `translateX(calc(${activePlayIdx * 100}%))`,
            }}
          />
          {/* Tooltip */}
          <div
            className="absolute flex min-w-[200px] flex-col items-start gap-3 rounded-sm bg-neutral-800/90 p-4"
            style={{
              left:
                activePlayIdx < (4 * playbyplay.length) / 5
                  ? `${(activePlayIdx + 1) * (100 / playbyplay.length)}%`
                  : "auto",
              right:
                activePlayIdx < (4 * playbyplay.length) / 5
                  ? "auto"
                  : `${(playbyplay.length - activePlayIdx) * (100 / playbyplay.length)}%`,
              top: "50%",
              transform: "translate(0, -50%)",
            }}
          >
            <div className="flex w-full flex-row items-center justify-between gap-2">
              <span className="font-bold" style={{ color: scoreColor }}>
                {playScore?.[0] ?? 0} - {playScore?.[1] ?? 0}
              </span>
            </div>
            <div className="flex flex-1 flex-col items-start gap-1 text-sm">
              <div className="flex items-center gap-2">
                <Image
                  src={getPlayerImageUrl(hoveredPlay.PLAYER1_ID)}
                  alt={`${hoveredPlay.PLAYER1_NAME} headshot`}
                  width={48}
                  height={48}
                  priority
                />
                <span className="w-full overflow-hidden text-ellipsis font-semibold">
                  {hoveredPlay.PLAYER1_NAME}
                </span>
              </div>
              <span className="max-w-[200px] whitespace-normal text-neutral-400">
                {playDescription}
              </span>
            </div>
          </div>
        </>
      )}

      {hoveredRun && runStartPlayIdx && runEndPlayIdx && (
        <>
          {/* Greyed out bar hover */}
          <div
            className="absolute left-0 top-0 h-full overflow-visible"
            style={{
              transform: `translateX(${runStartPlayIdx * 100}%)`,
              width: `${100 / playbyplay.length}%`,
            }}
          >
            <div
              className="h-full bg-white/10"
              style={{
                width: `${(runEndPlayIdx - runStartPlayIdx + 1) * 100}%`,
              }}
            />
          </div>
          {/* Tooltip */}
          <div
            className="absolute flex min-w-[200px] flex-col items-start gap-3 rounded-sm bg-neutral-800/90 p-3"
            style={{
              left:
                runStartPlayIdx < (4 * playbyplay.length) / 5
                  ? `${(runEndPlayIdx + 1) * (100 / playbyplay.length)}%`
                  : "auto",
              right:
                runStartPlayIdx < (4 * playbyplay.length) / 5
                  ? "auto"
                  : `${(playbyplay.length - runStartPlayIdx) * (100 / playbyplay.length)}%`,
            }}
          >
            <div className="flex w-full flex-col items-start gap-2">
              <span className="font-semibold" style={{ color: runColor }}>
                {hoveredRun.runScore} - {hoveredRun.opponentScore}{" "}
                {hoveredRun.teamAbbr} run
              </span>

              {highlightPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between gap-2"
                  style={{ color: hexToBW(runColor) }}
                >
                  <span>
                    {player.name.split(" ")[0]![0]}. {player.name.split(" ")[1]}
                  </span>
                  <span>{player.points} points</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
