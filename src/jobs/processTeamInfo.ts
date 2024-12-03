import { nbaApi } from "~/clients/nba-api";
import { CUR_SEASON } from "~/lib/consts";
import { sleep } from "~/lib/utils";
import client from "~/server/db";

async function processTeamInfo() {
  const allTeams = await nbaApi.getAllTeams();

  const rowsToStore = [];
  for (const team of allTeams) {
    await sleep(5000);
    const teamId = team.id;
    console.log("Processing team", team.abbreviation);
    const { TeamInfoCommon } = await nbaApi.getTeamInfoCommon({
      LeagueID: "00",
      TeamID: teamId,
    });

    const teamInfo = TeamInfoCommon[0];

    if (teamInfo) {
      rowsToStore.push(teamInfo);
    }
  }

  await client.db(CUR_SEASON).collection("teams").deleteMany({});
  return await client
    .db(CUR_SEASON)
    .collection("teams")
    .insertMany(rowsToStore);
}

async function run() {
  await processTeamInfo();
  process.exit(0);
}

await run();
