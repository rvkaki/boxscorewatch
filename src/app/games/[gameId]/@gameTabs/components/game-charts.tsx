import Court from "~/components/Court";
import { type ShotZone } from "~/server/db/types";
import { api } from "~/trpc/server";

export default async function GameCharts({
  gameId,
  homeTeamId,
  awayTeamId,
}: {
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
}) {
  const shotchart = await api.games.getGameShotChart({ gameId });
  const leagueShotchart = await api.games.getLeagueShotChart();

  if (!shotchart || !leagueShotchart) {
    return null;
  }

  const teamsZones = Object.keys(shotchart.shotCharts).map((teamId) => {
    const zones = shotchart.shotCharts[teamId]!.reduce(
      (acc, shot) => {
        const zone = shot.SHOT_ZONE_BASIC as unknown as ShotZone;
        if (!acc[zone]) {
          acc[zone] = {
            made: 0,
            attempted: 0,
          };
        }

        acc[zone].made += shot.SHOT_MADE_FLAG;
        acc[zone].attempted += shot.SHOT_ATTEMPTED_FLAG;

        return acc;
      },
      {} as Record<
        ShotZone,
        {
          made: number;
          attempted: number;
        }
      >,
    );

    return {
      teamId,
      ...Object.entries(zones).reduce(
        (acc, [zone, { made, attempted }]) => {
          const zoneInfo = leagueShotchart.League_Wide.filter(
            (s) => s.SHOT_ZONE_BASIC === zone,
          ).reduce(
            (acc, shot) => {
              acc.made += shot.FGM;
              acc.attempted += shot.FGA;
              return acc;
            },
            { made: 0, attempted: 0 },
          );

          acc[zone as ShotZone] = {
            made,
            attempted,
            pct: Number(((made / attempted) * 100).toFixed(2)),
            avg: Number(
              ((zoneInfo.made / zoneInfo.attempted) * 100).toFixed(2),
            ),
          };
          return acc;
        },
        {} as Record<
          ShotZone,
          { made: number; attempted: number; pct: number; avg: number }
        >,
      ),
    };
  });

  return (
    <div className="flex w-full items-center justify-between gap-6">
      {teamsZones
        .sort((a, _b) => {
          return a.teamId === awayTeamId ? -1 : 1;
        })
        .map((team) => (
          <Court key={team.teamId} zonesData={team} />
        ))}
    </div>
  );
}
