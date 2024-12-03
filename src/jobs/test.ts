import { CUR_SEASON } from "~/lib/consts";
import client from "~/server/db";
import {
  getBoxScore,
  getGameRotation,
  getGameVideoDetails,
  getPlayByPlay,
} from "./dailyCron";
import { sleep } from "~/lib/utils";

const gamesMissingInfo = {};

async function test() {
  const gameIds = Object.keys(gamesMissingInfo);
  console.log("Fetching games", gameIds);

  const res = await client
    .db(CUR_SEASON)
    .collection("games")
    .find({
      GAME_ID: { $in: gameIds },
    })
    .toArray();

  for (const game of res) {
    await sleep(5000);
    const gameId = game.GAME_ID as keyof typeof gamesMissingInfo;
    const missingInfo = gamesMissingInfo[gameId];

    for (const info of missingInfo) {
      switch (info) {
        case "playbyplay":
          const playbyplay = await getPlayByPlay(gameId);
          const videos = await getGameVideoDetails(gameId);

          if (!playbyplay || !videos) {
            console.log("Error fetching playbyplay or videos for", gameId);
            break;
          }

          const playsWithVideo = playbyplay.map((play) => {
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

          await client
            .db(CUR_SEASON)
            .collection("games")
            .updateOne(
              { GAME_ID: gameId },
              { $set: { playbyplay: playsWithVideo } },
            );

          break;
        case "boxscore":
          const boxScore = await getBoxScore(gameId);
          if (!boxScore) {
            console.log("Error fetching boxscore for", gameId);
            break;
          }

          const homeTeamStats = boxScore.TeamStats[1]!;
          const awayTeamStats = boxScore.TeamStats[0]!;
          const homeTeamId = homeTeamStats.TEAM_ID as string;
          const awayTeamId = awayTeamStats.TEAM_ID as string;

          const homeTeamPlayerStats = boxScore?.PlayerStats.filter(
            (s) => s.TEAM_ID === homeTeamId,
          );
          const homeTeamStartersStats = boxScore?.TeamStarterBenchStats.find(
            (s) => s.TEAM_ID === homeTeamId && s.STARTERS_BENCH === "Starters",
          );
          const homeTeamBenchStats = boxScore?.TeamStarterBenchStats.find(
            (s) => s.TEAM_ID === homeTeamId && s.STARTERS_BENCH === "Bench",
          );

          const awayTeamPlayerStats = boxScore?.PlayerStats.filter(
            (s) => s.TEAM_ID === awayTeamId,
          );
          const awayTeamStartersStats = boxScore?.TeamStarterBenchStats.find(
            (s) => s.TEAM_ID === awayTeamId && s.STARTERS_BENCH === "Starters",
          );
          const awayTeamBenchStats = boxScore?.TeamStarterBenchStats.find(
            (s) => s.TEAM_ID !== awayTeamId && s.STARTERS_BENCH === "Bench",
          );

          await client
            .db(CUR_SEASON)
            .collection("games")
            .updateOne(
              { GAME_ID: gameId },
              {
                $set: {
                  "homeTeam.stats": homeTeamStats,
                  "homeTeam.playerStats": homeTeamPlayerStats,
                  "homeTeam.startersStats": homeTeamStartersStats,
                  "homeTeam.benchStats": homeTeamBenchStats,
                  "awayTeam.stats": awayTeamStats,
                  "awayTeam.playerStats": awayTeamPlayerStats,
                  "awayTeam.startersStats": awayTeamStartersStats,
                  "awayTeam.benchStats": awayTeamBenchStats,
                },
              },
            );
          break;
        case "rotation":
          const rotations = await getGameRotation(gameId);

          if (!rotations) {
            console.log("Error fetching rotations for", gameId);
            break;
          }

          await client
            .db(CUR_SEASON)
            .collection("games")
            .updateOne(
              { GAME_ID: gameId },
              {
                $set: {
                  "homeTeam.rotations": rotations.HomeTeam,
                  "awayTeam.rotations": rotations.AwayTeam,
                },
              },
            );
          break;
        case "videodetails": {
          const videos = await getGameVideoDetails(gameId);

          if (!videos) {
            console.log("Error fetching videos for", gameId);
            break;
          }

          const playbyplay = await client
            .db(CUR_SEASON)
            .collection("games")
            .findOne(
              { GAME_ID: gameId },
              { projection: { _id: 0, playbyplay: 1 } },
            );

          if (!playbyplay) {
            console.log("No playbyplay in DB for", gameId);
            break;
          }

          const res = playbyplay.playbyplay.map((play) => {
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

          await client
            .db(CUR_SEASON)
            .collection("games")
            .updateOne(
              { GAME_ID: gameId },
              {
                $set: {
                  playbyplay: res,
                },
              },
            );
          break;
        }
        default:
          console.log("Unknown info type:", info);
          break;
      }
    }
  }
}

await test();
process.exit(0);
