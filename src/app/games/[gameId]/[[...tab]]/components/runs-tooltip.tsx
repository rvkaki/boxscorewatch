"use client";

import Image from "next/image";
import { useState } from "react";
import { TeamTricodeToColor } from "~/lib/consts";
import { getPlayerImageUrl, hexToBW } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/react";

export default function RunsTooltip({
  runs,
  playbyplay,
  chartDimensions,
}: {
  runs: RouterOutputs["games"]["getGameRuns"];
  playbyplay: RouterOutputs["games"]["getPlayByPlay"];
  chartDimensions: {
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
  };
}) {
  const [activePlayIdx, setActivePlayIdx] = useState<number | null>(null);

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
      return;
    }

    const playIndex = Math.floor(actualX / barWidth);
    const play = playbyplay[playIndex];

    if (!play) {
      setActivePlayIdx(null);
      return;
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
  const scoreColor = teamAbv ? TeamTricodeToColor[teamAbv] : "#000";

  const playScore = hoveredPlay?.SCORE?.split(" - ").map(Number);
  const playDescription =
    hoveredPlay?.HOMEDESCRIPTION ??
    hoveredPlay?.VISITORDESCRIPTION ??
    hoveredPlay?.NEUTRALDESCRIPTION;
  const runColor = hoveredRun
    ? TeamTricodeToColor[hoveredRun.teamAbbr]!
    : "#000";

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
            className="h-full bg-white/20"
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
              {hoveredRun ? (
                <span
                  className="rounded-sm px-2 py-1 text-sm font-semibold text-white"
                  style={{ background: runColor, color: hexToBW(runColor) }}
                >
                  {hoveredRun.runScore} - {hoveredRun.opponentScore} run
                </span>
              ) : null}
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
    </div>
  );
}
