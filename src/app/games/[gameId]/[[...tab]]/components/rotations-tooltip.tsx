"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { getPlayerImageUrl } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/react";

export default function RotationsTooltip({
  playbyplay,
  rotations,
  homeTeamId,
  awayTeamId,
  homeTeamAbv,
  awayTeamAbv,
  chartDimensions,
}: {
  playbyplay: RouterOutputs["games"]["getPlayByPlay"];
  rotations: RouterOutputs["games"]["getGameRotations"];
  homeTeamId: number;
  awayTeamId: number;
  homeTeamAbv: string;
  awayTeamAbv: string;
  chartDimensions: {
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
  };
}) {
  const chartRef = useRef({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  const [timeframePct, setTimeframePct] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const rotationsMap = useMemo(
    () => ({
      home: rotations.find((r) => r.TEAM_ID === homeTeamId)!,
      away: rotations.find((r) => r.TEAM_ID === awayTeamId)!,
    }),
    [rotations, homeTeamId, awayTeamId],
  );

  function handleMouseMove(e: React.MouseEvent) {
    const target = e.currentTarget;
    if (!target) return;

    // Only update dimensions when they change
    const bound = target.getBoundingClientRect();
    if (bound.width !== chartRef.current.width) {
      chartRef.current = {
        width: bound.width,
        height: bound.height,
        left: bound.left,
        top: bound.top,
      };
    }

    const actualX = e.clientX - chartRef.current.left;
    const actualY = e.clientY - chartRef.current.top;

    // Early exit for out of bounds
    if (
      actualX < 0 ||
      actualX > chartRef.current.width ||
      actualY < 0 ||
      actualY > chartRef.current.height
    ) {
      setTimeframePct(null);
      return;
    }

    const startTime = (actualX / chartRef.current.width) * 48 * 60 * 10;

    const homeLineup = rotationsMap.home.rotations
      .filter(
        (r) => r.IN_TIME_REAL <= startTime && r.OUT_TIME_REAL >= startTime,
      )
      .sort((a, b) => a.IN_TIME_REAL - b.IN_TIME_REAL)
      .slice(0, 5);
    const awayLineup = rotationsMap.away.rotations
      .filter(
        (r) => r.IN_TIME_REAL <= startTime && r.OUT_TIME_REAL >= startTime,
      )
      .sort((a, b) => a.IN_TIME_REAL - b.IN_TIME_REAL)
      .slice(0, 5);

    const actualStartTime = Math.max(
      ...[...homeLineup, ...awayLineup].map((r) => r.IN_TIME_REAL),
    );
    const endTime = Math.min(
      ...[...homeLineup, ...awayLineup].map((r) => r.OUT_TIME_REAL),
    );

    const endXPct = endTime / (48 * 60 * 10);
    const startXPct = actualStartTime / (48 * 60 * 10);
    setTimeframePct({ start: startXPct, end: endXPct });
  }

  const tooltipInfo = (() => {
    if (!timeframePct) {
      return null;
    }

    const startTime = timeframePct.start * 48 * 60 * 10 + 1;
    const endTime = timeframePct.end * 48 * 60 * 10;
    const homeRotations = rotations.find((r) => r.TEAM_ID === homeTeamId)!;
    const awayRotations = rotations.find((r) => r.TEAM_ID === awayTeamId)!;

    const homeLineup = homeRotations.rotations
      .filter(
        (r) => r.IN_TIME_REAL <= startTime && r.OUT_TIME_REAL >= startTime,
      )
      .sort((a, b) => a.IN_TIME_REAL - b.IN_TIME_REAL)
      .slice(0, 5);

    const awayLineup = awayRotations.rotations
      .filter(
        (r) => r.IN_TIME_REAL <= startTime && r.OUT_TIME_REAL >= startTime,
      )
      .sort((a, b) => a.IN_TIME_REAL - b.IN_TIME_REAL)
      .slice(0, 5);

    const relevantPlays = playbyplay.filter((play) => {
      const [minutes, seconds] = play.PCTIMESTRING.split(":").map(Number) as [
        number,
        number,
      ];
      const qtrTime = 12 * 60 * 10 - (minutes * 60 * 10 + seconds * 10);
      const elapsedTime = (play.PERIOD - 1) * 12 * 60 * 10 + qtrTime;

      return elapsedTime >= startTime && elapsedTime <= endTime;
    });

    const firstScore = relevantPlays.find((play) => play.SCORE);
    const lastScore = relevantPlays.reverse().find((play) => play.SCORE);

    const ptDiff = (() => {
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

    return {
      homeLineup,
      awayLineup,
      relevantPlays,
      ptDiff,
    };
  })();

  return (
    <div
      className="absolute"
      style={{
        width: `calc(100% - ${chartDimensions.marginLeft}px - ${chartDimensions.marginRight}px)`,
        height: `calc(100% - ${chartDimensions.marginTop}px)`,
        left: chartDimensions.marginLeft,
        top: chartDimensions.marginTop,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setTimeframePct(null);
      }}
    >
      {timeframePct && (
        <>
          <div
            className="absolute h-full bg-white/20"
            style={{
              width: `calc(${timeframePct.end * 100}% - ${timeframePct.start * 100}%)`,
              left: `${timeframePct.start * 100}%`,
            }}
          />
          {tooltipInfo && (
            <div
              className="absolute flex min-w-[200px] flex-col items-start gap-5 rounded-sm bg-neutral-800/90 p-4"
              style={{
                left:
                  timeframePct.end * 100 < 75
                    ? `${timeframePct.end * 100 + 1}%`
                    : "auto",
                right:
                  timeframePct.end * 100 >= 75
                    ? `${100 - timeframePct.start * 100 + 1}%`
                    : "auto",
                top: "50%",
                transform: "translate(0, -50%)",
              }}
            >
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{awayTeamAbv}</p>
                  <span>
                    (
                    {tooltipInfo.ptDiff < 0
                      ? `+${-tooltipInfo.ptDiff}`
                      : -tooltipInfo.ptDiff}
                    )
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {tooltipInfo.awayLineup.map((r) => (
                    <div
                      key={r.PERSON_ID}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Image
                        src={getPlayerImageUrl(r.PERSON_ID)}
                        alt={`${r.PLAYER_FIRST} headshot`}
                        width={32}
                        height={32}
                        priority
                      />
                      <span className="w-full overflow-hidden text-ellipsis">
                        {r.PLAYER_FIRST} {r.PLAYER_LAST}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{homeTeamAbv}</p>
                  <span>
                    (
                    {tooltipInfo.ptDiff > 0
                      ? `+${tooltipInfo.ptDiff}`
                      : tooltipInfo.ptDiff}
                    )
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {tooltipInfo.homeLineup.map((r) => (
                    <div
                      key={r.PERSON_ID}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Image
                        src={getPlayerImageUrl(r.PERSON_ID)}
                        alt={`${r.PLAYER_FIRST} headshot`}
                        width={32}
                        height={32}
                        priority
                      />
                      <span className="w-full overflow-hidden text-ellipsis">
                        {r.PLAYER_FIRST} {r.PLAYER_LAST}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
