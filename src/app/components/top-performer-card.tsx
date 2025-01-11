import Image from "next/image";
import { getPlayerImageUrl } from "~/lib/utils";
import { type DBGameStats } from "~/server/db/types";

function getStatsToDisplay(player: DBGameStats["playerStats"][number]) {
  const statsToDisplay = [
    { label: "PTS", value: player.PTS!, priority: 0 },
    {
      label: "FG%",
      value: ((player.FG_PCT ?? 0) * 100).toFixed(1) + "%",
      priority: 0,
    },
  ]; // This should always be displayed

  // Add stats based on thresholds, with progressively lower thresholds if we need more stats
  const remainingStats = [];

  // First priority - exceptional performances
  if (player.AST && player.AST > 8)
    remainingStats.push({ label: "AST", value: player.AST, priority: 1 });
  if (player.REB && player.REB > 12)
    remainingStats.push({ label: "REB", value: player.REB, priority: 1 });
  if (player.STL && player.STL > 3)
    remainingStats.push({ label: "STL", value: player.STL, priority: 1 });
  if (player.BLK && player.BLK > 3)
    remainingStats.push({ label: "BLK", value: player.BLK, priority: 1 });
  if (player.OREB && player.OREB > 5)
    remainingStats.push({ label: "OREB", value: player.OREB, priority: 1 });
  if (player.FG3M && player.FG3M > 5)
    remainingStats.push({ label: "3PM", value: player.FG3M, priority: 1 });
  if (player.FG3_PCT && player.FG3_PCT > 0.5 && player.FG3A && player.FG3A > 3)
    remainingStats.push({
      label: "3P%",
      value: ((player.FG3_PCT ?? 0) * 100).toFixed(1) + "%",
      priority: 1,
    });

  // Second priority - good performances
  if (player.AST && player.AST > 5)
    remainingStats.push({ label: "AST", value: player.AST, priority: 2 });
  if (player.REB && player.REB > 8)
    remainingStats.push({ label: "REB", value: player.REB, priority: 2 });
  if (player.STL && player.STL > 2)
    remainingStats.push({ label: "STL", value: player.STL, priority: 2 });
  if (player.BLK && player.BLK > 2)
    remainingStats.push({ label: "BLK", value: player.BLK, priority: 2 });
  if (player.OREB && player.OREB > 3)
    remainingStats.push({ label: "OREB", value: player.OREB, priority: 2 });
  if (player.FG3M && player.FG3M > 3)
    remainingStats.push({ label: "3PM", value: player.FG3M, priority: 2 });
  if (player.FG3_PCT && player.FG3_PCT > 0.4 && player.FG3A && player.FG3A > 2)
    remainingStats.push({
      label: "3P%",
      value: ((player.FG3_PCT ?? 0) * 100).toFixed(1) + "%",
      priority: 2,
    });

  // Third priority - any non-zero stats
  if (player.AST && player.AST > 0)
    remainingStats.push({ label: "AST", value: player.AST, priority: 3 });
  if (player.REB && player.REB > 0)
    remainingStats.push({ label: "REB", value: player.REB, priority: 3 });
  if (player.STL && player.STL > 0)
    remainingStats.push({ label: "STL", value: player.STL, priority: 3 });
  if (player.BLK && player.BLK > 0)
    remainingStats.push({ label: "BLK", value: player.BLK, priority: 3 });
  if (player.FG3M && player.FG3M > 0)
    remainingStats.push({ label: "3PM", value: player.FG3M, priority: 3 });

  // Sort by priority (lower number = higher priority)
  remainingStats.sort((a, b) => a.priority - b.priority);

  // Remove duplicates (keep the highest priority version of each stat)
  const uniqueStats = remainingStats.filter(
    (stat, index, self) =>
      index === self.findIndex((s) => s.label === stat.label),
  );

  // Add the top 3 remaining stats to reach our total of 5
  statsToDisplay.push(...uniqueStats.slice(0, 3));

  // Sort according to the following array
  const displayOrder = [
    "PTS",
    "AST",
    "REB",
    "STL",
    "BLK",
    "OREB",
    "3PM",
    "FG%",
    "3P%",
  ];
  statsToDisplay.sort(
    (a, b) => displayOrder.indexOf(a.label) - displayOrder.indexOf(b.label),
  );

  return statsToDisplay;
}

export default function TopPerformerCard({
  player,
}: {
  player: DBGameStats["playerStats"][number];
}) {
  const statsToDisplay = getStatsToDisplay(player);

  return (
    <div className="grid w-full grid-cols-3 gap-y-2 rounded-md border border-neutral-500 p-2">
      <div className="flex flex-col items-center gap-1">
        <Image
          src={getPlayerImageUrl(player.PLAYER_ID)}
          alt={player.PLAYER_NAME}
          width={36}
          height={36}
        />
        <span className="text-xs">
          {player.PLAYER_NAME.split(" ")[0]![0]}.{" "}
          {player.PLAYER_NAME.split(" ")[1]}
        </span>
      </div>

      {statsToDisplay.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center">
          <span>{stat.value}</span>
          <span className="text-xs text-gray-500">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
