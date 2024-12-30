import { writeFileSync } from "fs";
import { CUR_SEASON, StatKeyToShortLabel } from "~/lib/consts";
import client from "~/server/db";
import {
  DBPlayByPlay,
  type DBGameStats,
  type TeamSeasonAverages
} from "~/server/db/types";
import { getGameVideoDetails, getPlayByPlay } from "./dailyCron";

async function calculateStandardDeviations() {
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

async function getMissingInfo() {
  const missingGames = {
    "0022400436": {
      playbyplay: true,
    },
  };

  for (const gameId in missingGames) {
    const missing = missingGames[gameId as keyof typeof missingGames];
    if (missing.playbyplay) {
      // Get play by play
      const PlayByPlay = (await getPlayByPlay(gameId)) ?? [];

      // Get videos
      const videos = (await getGameVideoDetails(gameId)) ?? [];

      const playsWithVideo = PlayByPlay.map((play) => {
        const video = videos.find((video) => video.ei === play.EVENTNUM);
        if (!video?.video) {
          return { ...play, VIDEO_AVAILABLE_FLAG: false, video: null };
        }

        const { lurl, lth, ldur, srt } = video.video;

        return {
          ...play,
          VIDEO_AVAILABLE_FLAG: true,
          video: {
            url: lurl,
            thumb: lth,
            duration: ldur,
            subtitle: srt,
          },
        };
      });

      if (playsWithVideo.length > 0) {
        await client.db(CUR_SEASON).collection("playbyplay").insertOne({
          GAME_ID: gameId,
          playbyplay: playsWithVideo,
        });
      }
    }
  }
}

async function test() {
  const playbyplayEntries = (await client
    .db(CUR_SEASON)
    .collection("playbyplay")
    .find()
    .toArray()) as unknown as DBPlayByPlay[];

  const actionTypeToDescription: Record<string, string[]> = {};

  const allPlays = playbyplayEntries.flatMap((entry) => entry.playbyplay);

  for (const play of allPlays) {
    const eventType = play.EVENTMSGTYPE.toString();
    const actionType = play.EVENTMSGACTIONTYPE.toString();
    const key = `${eventType}-${actionType}`;
    if (!actionTypeToDescription[key]) {
      actionTypeToDescription[key] = [];
    }

    let description =
      play.HOMEDESCRIPTION ??
      play.VISITORDESCRIPTION ??
      play.NEUTRALDESCRIPTION ??
      "";

    description = description.replace(/\(.+\)$/g, "");

    actionTypeToDescription[key].push(description);
  }

  // Sort descriptions array and remove duplicates
  for (const actionType in actionTypeToDescription) {
    actionTypeToDescription[actionType] = Array.from(
      new Set(actionTypeToDescription[actionType]),
    ).sort();
  }

  // Pretty print the object
  for (const actionType in actionTypeToDescription) {
    console.log("Action Type:", actionType);
    console.table(actionTypeToDescription[actionType]);
    console.log();
    console.log();
  }

  // Write to file
  const json = JSON.stringify(actionTypeToDescription, null, 2);
  writeFileSync("actionTypeToDescription.json", json);
}

// await getMissingInfo();
// process.exit(0);
