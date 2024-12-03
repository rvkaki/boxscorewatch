import { nbaApi } from "~/clients/nba-api";
import { CUR_SEASON } from "~/lib/consts";
import { sleep } from "~/lib/utils";
import client from "~/server/db";

export async function processTeamSeasonAverages() {
  const allTeams = await nbaApi.getAllTeams();
  const rowsToStore = [];
  for (const team of allTeams) {
    await sleep(10000);
    const teamId = team.id;
    console.log("Processing team", team.abbreviation);

    const { OverallTeamDashboard } =
      await nbaApi.getTeamDashboardByGeneralSplits({
        LastNGames: "0",
        MeasureType: "Base",
        Month: "0",
        OpponentTeamID: "0",
        PaceAdjust: "N",
        Period: "0",
        PerMode: "PerGame",
        PlusMinus: "N",
        Rank: "N",
        Season: CUR_SEASON,
        SeasonType: "Regular Season",
        TeamID: teamId,
      });

    const teamSeasonAverages = OverallTeamDashboard[0];
    if (teamSeasonAverages) {
      rowsToStore.push({ ...teamSeasonAverages, TEAM_ID: teamId });
    }
  }

  await client.db(CUR_SEASON).collection("teamSeasonAverages").deleteMany({});
  return await client
    .db(CUR_SEASON)
    .collection("teamSeasonAverages")
    .insertMany(rowsToStore);
}
