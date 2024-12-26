import { CUR_SEASON, StatKeyToShortLabel } from "~/lib/consts";
import client from "~/server/db";
import { type DBGameStats, type TeamSeasonAverages } from "~/server/db/types";

async function test() {
  const teams = await client
    .db(CUR_SEASON)
    .collection("teams")
    .find()
    .toArray();

  for (const team of teams) {
    console.log(`Processing team: ${team.TEAM_ABBREVIATION}`);
    const games = (await client
      .db(CUR_SEASON)
      .collection("gameStats")
      .find({
        TEAM_ID: team.TEAM_ID,
      })
      .toArray()) as unknown as DBGameStats[];

    const teamAverages = (await client
      .db(CUR_SEASON)
      .collection("teamSeasonAverages")
      .findOne({
        TEAM_ID: team.TEAM_ID.toString(),
      })) as TeamSeasonAverages | null;

    if (!teamAverages) {
      console.log("No team averages found for", team.TEAM_ID);
      continue;
    }

    const statKeys = (
      Object.keys(StatKeyToShortLabel) as (keyof typeof StatKeyToShortLabel)[]
    ).filter((k) => k !== "MIN");

    const numGames = games.length;
    // Calculate standard deviation for each stat
    const standardDeviations = statKeys.reduce(
      (acc, key) => {
        const actualKey = key === "TO" ? "TOV" : key;
        const mean = teamAverages[actualKey];

        const sumOfSquares = games.reduce((sum, game) => {
          const stats = game.teamStats;
          const gameStat = stats[key];
          return sum + Math.pow(gameStat - mean, 2);
        }, 0);

        const variance = sumOfSquares / numGames;
        acc[key] = {
          value: Math.sqrt(variance),
          sq_sum: sumOfSquares,
        };
        return acc;
      },
      {} as Record<
        (typeof statKeys)[number],
        { value: number; sq_sum: number }
      >,
    );

    console.log("Standard deviations for", team.TEAM_ID, standardDeviations);

    // Update team averages with standard deviation values
    await client.db(CUR_SEASON).collection("teamSeasonAverages").updateOne(
      {
        TEAM_ID: team.TEAM_ID.toString(),
      },
      {
        $set: {
          standardDeviations,
        },
      },
    );
  }
}

await test();
process.exit(0);
