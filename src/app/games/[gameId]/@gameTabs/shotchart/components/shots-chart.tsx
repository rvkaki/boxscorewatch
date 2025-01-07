"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import colors from "tailwindcss/colors";
import Court from "~/components/Court";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  EventTypes,
  type ShotActionTypes,
  ShotActionTypeToLabel,
} from "~/lib/consts";
import {
  COURT_HEIGHT,
  COURT_WIDTH,
  getPlayerImageUrl,
  getTeamLogoUrl,
  numberToOrdinal,
} from "~/lib/utils";
import { type DBGameShotChart, type PlayByPlay } from "~/server/db/types";

export default function ShotsChart({
  teamId,
  shots,
  homeTeamId,
  homeTeamAbv,
  awayTeamId,
  awayTeamAbv,
}: {
  teamId: string;
  shots: (PlayByPlay & {
    shot: DBGameShotChart["shotCharts"][number][number];
  })[];
  homeTeamId: number;
  homeTeamAbv: string;
  awayTeamId: number;
  awayTeamAbv: string;
}) {
  const teamAbv = teamId === homeTeamId.toString() ? homeTeamAbv : awayTeamAbv;

  const availablePlayers = useMemo(
    () =>
      shots.reduce(
        (acc, shot) => {
          const { PLAYER1_ID, PLAYER1_NAME } = shot;
          if (!PLAYER1_NAME) {
            return acc;
          }

          if (!acc[PLAYER1_ID]) {
            acc[PLAYER1_ID] = PLAYER1_NAME;
          }
          return acc;
        },
        {} as Record<string, string>,
      ),
    [shots],
  );
  const availableShotTypes = useMemo(
    () =>
      shots.reduce(
        (acc, shot) => {
          const { EVENTMSGACTIONTYPE } = shot;
          if (!acc[EVENTMSGACTIONTYPE]) {
            acc[EVENTMSGACTIONTYPE] =
              ShotActionTypeToLabel[
                EVENTMSGACTIONTYPE as keyof typeof ShotActionTypes
              ];
          }
          return acc;
        },
        {} as Record<string, string>,
      ),
    [shots],
  );

  const [selectedPlayer, setSelectedPlayer] = useState<string>("all");
  const [selectedShotType, setSelectedShotType] = useState<string>("all");
  const [selectedShotId, setSelectedShotId] = useState<number | null>(null);
  const [hoveredShotId, setHoveredShotId] = useState<number | null>(null);

  const filteredShots = useMemo(
    () =>
      shots.filter((shot) => {
        const selectedPlayerId = Number(selectedPlayer);
        const selectedShotTypeId = Number(selectedShotType);

        if (selectedPlayer !== "all" && shot.PLAYER1_ID !== selectedPlayerId) {
          return false;
        }

        if (
          selectedShotType !== "all" &&
          shot.EVENTMSGACTIONTYPE !== selectedShotTypeId
        ) {
          return false;
        }

        return true;
      }),
    [shots, selectedPlayer, selectedShotType],
  );

  const selectedShot = filteredShots.find((s) => s.EVENTNUM === selectedShotId);

  const madeShots = filteredShots.filter(
    (shot) => shot.EVENTMSGTYPE === EventTypes.FIELD_GOAL_MADE,
  );

  return (
    <div className="flex h-full w-full flex-col-reverse items-stretch justify-between gap-4 lg:max-h-[800px] lg:flex-row">
      <div className="flex flex-[5] flex-col items-start gap-4">
        {/* Selected play video */}
        <div className="grid aspect-video w-full place-items-center rounded-lg bg-neutral-900">
          {selectedShot?.video ? (
            <video
              className="h-full w-full"
              controls
              src={selectedShot.video.url}
            />
          ) : (
            <p className="text-lg font-semibold text-neutral-400">
              Select a shot to watch the video
            </p>
          )}
        </div>

        <div className="flex max-h-[400px] w-full flex-1 flex-col items-start overflow-y-auto rounded-md border border-neutral-600 lg:max-h-[auto]">
          {filteredShots.length === 0 && (
            <div className="flex h-full w-full items-center justify-center p-4">
              <p className="max-w-[30ch] text-center text-neutral-400">
                No shots match the selected filters. Try changing the player or
                shot type.
              </p>
            </div>
          )}
          {filteredShots.map((shot, idx) => {
            const description =
              shot.PLAYER1_TEAM_ID === homeTeamId
                ? shot.HOMEDESCRIPTION
                : shot.PLAYER1_TEAM_ID === awayTeamId
                  ? shot.VISITORDESCRIPTION
                  : shot.NEUTRALDESCRIPTION;

            // Returning an array because with <></> it throws a key error
            return [
              ...(idx === 0 || filteredShots[idx - 1]?.PERIOD !== shot.PERIOD
                ? [
                    <div
                      key={`${teamId}_${shot.PERIOD}qtr`}
                      className="flex w-full items-center gap-1 py-3"
                    >
                      <div className="h-[2px] flex-1 bg-neutral-600" />
                      <p className="text-sm font-semibold text-neutral-400">
                        {shot.PERIOD > 4
                          ? `${numberToOrdinal(shot.PERIOD - 4)} Overtime`
                          : `${numberToOrdinal(shot.PERIOD)} Quarter`}
                      </p>
                      <div className="h-[2px] flex-1 bg-neutral-600" />
                    </div>,
                  ]
                : []),
              <div
                key={`${teamId}_${shot.EVENTNUM}_shot`}
                className={`grid w-full cursor-pointer grid-cols-[40px,40px,1fr] items-center gap-4 px-4 py-2 hover:bg-neutral-800 ${
                  selectedShotId === shot.EVENTNUM ? "bg-neutral-800" : ""
                }`}
                onClick={() => setSelectedShotId(shot.EVENTNUM)}
                onMouseEnter={() => setHoveredShotId(shot.EVENTNUM)}
                onMouseLeave={() => setHoveredShotId(null)}
              >
                <Image
                  src={getTeamLogoUrl(shot.PLAYER1_TEAM_ID!)}
                  alt="Team logo"
                  width={32}
                  height={32}
                />

                <span className="text-sm">{shot.PCTIMESTRING}</span>
                <span className="text-sm">{description}</span>
              </div>,
            ];
          })}
        </div>
      </div>

      <div className="flex flex-[4] flex-col items-start gap-6">
        <div className="flex w-full items-center gap-4">
          <Select
            value={selectedPlayer}
            onValueChange={(value) => {
              setSelectedPlayer(value);
              setSelectedShotId(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Player" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All players</SelectItem>
              {Object.entries(availablePlayers).map(([id, name]) => (
                <SelectItem key={`${teamId}_${id}_player`} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedShotType}
            onValueChange={(value) => {
              setSelectedShotType(value);
              setSelectedShotId(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Shot Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All shot types</SelectItem>
              {Object.entries(availableShotTypes).map(([id, name]) => (
                <SelectItem key={`${teamId}_${id}_shot_type`} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative w-full text-neutral-500">
          <Court />

          <svg
            className="absolute inset-0 overflow-visible"
            width="100%"
            height="100%"
          >
            {filteredShots.map((shot) => {
              const { shot: shotData } = shot;

              const x = (shotData.LOC_X / COURT_WIDTH + 0.5) * 100;
              const y =
                Math.min(
                  1,
                  shotData.LOC_Y / COURT_HEIGHT + 47.5 / COURT_HEIGHT,
                ) * 100;

              const isMade = shot.EVENTMSGTYPE === EventTypes.FIELD_GOAL_MADE;

              let opacity = 1;
              let madeRadius = 5;
              let missedSizePct = 1;

              if (hoveredShotId || selectedShotId) {
                if (
                  shot.EVENTNUM === hoveredShotId ||
                  shot.EVENTNUM === selectedShotId
                ) {
                  madeRadius = 7;
                  missedSizePct = 1.5;
                } else {
                  opacity = 0.1;
                }
              }

              if (isMade) {
                return (
                  <circle
                    key={`${teamId}_${shot.EVENTNUM}_made`}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r={madeRadius}
                    fill={colors.amber[600]}
                    opacity={opacity}
                  />
                );
              }

              // Missed shot represented by an X
              return (
                <g key={`${teamId}_${shot.EVENTNUM}_missed`} opacity={opacity}>
                  <line
                    x1={`${x - missedSizePct}%`}
                    y1={`${y - missedSizePct}%`}
                    x2={`${x + missedSizePct}%`}
                    y2={`${y + missedSizePct}%`}
                    stroke={colors.red[600]}
                    strokeWidth={2}
                  />
                  <line
                    x1={`${x + missedSizePct}%`}
                    y1={`${y - missedSizePct}%`}
                    x2={`${x - missedSizePct}%`}
                    y2={`${y + missedSizePct}%`}
                    stroke={colors.red[600]}
                    strokeWidth={2}
                  />
                </g>
              );
            })}
          </svg>

          {selectedShotId && (
            <div className="absolute bottom-2 right-2">
              <button
                className="rounded-sm bg-neutral-800 px-2 py-1 text-xs text-neutral-300"
                onClick={() => setSelectedShotId(null)}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="flex max-h-[120px] w-full flex-1 items-center justify-between gap-6 px-8">
          <div className="relative aspect-square min-w-[90px] max-w-[120px] flex-1">
            <Image
              src={
                selectedPlayer === "all"
                  ? getTeamLogoUrl(teamId)
                  : getPlayerImageUrl(selectedPlayer)
              }
              alt={selectedPlayer === "all" ? "Team logo" : "Player image"}
              fill
              priority
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className="flex flex-[2] flex-col items-start gap-2">
            <p className="text-lg font-semibold text-neutral-400">
              {selectedPlayer === "all"
                ? teamAbv
                : availablePlayers[selectedPlayer]}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold">
                {madeShots.length} / {filteredShots.length}
              </p>
              <p className="text-xl text-neutral-200">
                (
                {filteredShots.length === 0
                  ? 0
                  : Math.round((madeShots.length / filteredShots.length) * 100)}
                %)
              </p>
            </div>
            <span className="text-sm text-neutral-400">
              {selectedShotType === "all"
                ? "All shots"
                : availableShotTypes[selectedShotType]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
