import { add, differenceInDays, format } from "date-fns";
import { nbaApi } from "~/clients/nba-api";
import { CUR_SEASON } from "~/lib/consts";
import { sleep } from "~/lib/utils";
import client from "~/server/db";
import { processTeamSeasonAverages } from "./processTeamSeasonAverages";

export async function getBoxScore(gameId: string) {
  try {
    return await nbaApi.getGameBoxscore({
      GameID: gameId,
      EndPeriod: "0",
      StartPeriod: "0",
      EndRange: "0",
      StartRange: "0",
      RangeType: "0",
    });
  } catch (e) {
    console.error("Error fetching boxscore", gameId, e);
    return null;
  }
}

export async function getPlayByPlay(gameId: string) {
  try {
    return (
      await nbaApi.getPlayByPlay({
        GameID: gameId,
        StartPeriod: "0",
        EndPeriod: "0",
      })
    ).PlayByPlay;
  } catch (e) {
    console.error("Error fetching play by play", gameId, e);
    return null;
  }
}

export async function getGameRotation(gameId: string) {
  try {
    return await nbaApi.getGameRotation({
      LeagueID: "00",
      GameID: gameId,
    });
  } catch (e) {
    console.error("Error fetching rotations", gameId, e);
    return null;
  }
}

export async function getGameVideoDetails(gameId: string) {
  try {
    return await nbaApi.getGameVideoDetails({
      GameID: gameId,
      LastNGames: "0",
      Month: "0",
      OpponentTeamID: "0",
      Period: "0",
      PlayerID: "0",
      Season: CUR_SEASON,
      SeasonType: "Regular Season",
      TeamID: "0",
    });
  } catch (e) {
    console.error("Error fetching videos", gameId, e);
    return null;
  }
}

export async function getLeagueWideShotChart() {
  try {
    return await nbaApi.getLeagueWideShotChart({
      LeagueID: "00",
      Season: CUR_SEASON,
    });
  } catch (e) {
    console.error("Error fetching league wide shot chart", e);
    return null;
  }
}

export async function getShotCharts(gameId: string) {
  try {
    const { Shot_Chart_Detail } = await nbaApi.getShotChartDetail({
      ContextMeasure: "FGA",
      GameID: gameId,
      LastNGames: "0",
      LeagueID: "00",
      Month: "0",
      OpponentTeamID: "0",
      Period: "0",
      PlayerID: "0",
      Season: CUR_SEASON,
      SeasonType: "Regular Season",
      TeamID: "0",
    });

    const shotChartByTeam = Shot_Chart_Detail.reduce(
      (acc, shot) => {
        const teamId = shot.TEAM_ID;
        if (!acc[teamId]) {
          acc[teamId] = [];
        }

        acc[teamId].push(shot);
        return acc;
      },
      {} as Record<string, typeof Shot_Chart_Detail>,
    );

    return shotChartByTeam;
  } catch (e) {
    console.error("Error fetching shot chart", gameId, e);
    return null;
  }
}

async function processLeagueWideShotChart() {
  const shotChart = await getLeagueWideShotChart();

  if (shotChart) {
    await client
      .db(CUR_SEASON)
      .collection("leagueWideShotChart")
      .deleteMany({});

    await client
      .db(CUR_SEASON)
      .collection("leagueWideShotChart")
      .insertOne(shotChart);
  }
}

async function processGames() {
  const lastGame = await client
    .db(CUR_SEASON)
    .collection("games")
    .findOne(
      {},
      {
        sort: { GAME_DATE: -1 },
      },
    );

  let dateFrom: Date | null = null;
  if (lastGame) {
    const diffInDays = differenceInDays(
      new Date(),
      new Date(lastGame.GAME_DATE as string),
    );

    if (diffInDays <= 1) {
      console.log("Games are up to date");
      return;
    }

    console.log(
      `Games are not up to date. Last game was ${diffInDays} days ago at ${lastGame.GAME_DATE}`,
    );
    dateFrom = add(new Date(lastGame.GAME_DATE as string), { days: 1 });
    console.log("Fetching games from", dateFrom);
  }

  const { LeagueGameLog } = await nbaApi.getLeagueGameLogs({
    Direction: "DESC",
    LeagueID: "00",
    PlayerOrTeam: "T",
    Season: CUR_SEASON,
    SeasonType: "Regular Season",
    Sorter: "DATE",
    ...((dateFrom && { DateFrom: format(dateFrom, "yyyy-MM-dd") }) ?? {}),
  });

  console.log("Processing", LeagueGameLog.length, "games");

  const processedIds = new Set<string>();

  for (const game of LeagueGameLog) {
    const gameId = game.GAME_ID as string;
    console.log("Processing game", game.MATCHUP);
    const gameExists = await client
      .db(CUR_SEASON)
      .collection("games")
      .findOne({ GAME_ID: gameId });

    if (processedIds.has(gameId) || gameExists) {
      console.log("Skipping game", game.MATCHUP);
      continue;
    }

    // Get boxscore
    const boxScore = await getBoxScore(gameId);

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

    // Get shot charts
    const shotCharts = await getShotCharts(gameId);

    if (shotCharts) {
      await client
        .db(CUR_SEASON)
        .collection("shotCharts")
        .insertOne({ GAME_ID: gameId, shotCharts });
    }

    // Get rotations
    const rotations = await getGameRotation(gameId);

    if (rotations) {
      await client
        .db(CUR_SEASON)
        .collection("gameRotations")
        .insertMany([
          {
            GAME_ID: gameId,
            TEAM_ID: rotations.HomeTeam[0]!.TEAM_ID,
            rotations: rotations.HomeTeam,
          },
          {
            GAME_ID: gameId,
            TEAM_ID: rotations.AwayTeam[0]!.TEAM_ID,
            rotations: rotations.AwayTeam,
          },
        ]);
    }

    const isHomeTeam = (game.MATCHUP as string).includes("vs");
    const teamId = game.TEAM_ID as string;

    const homeTeamStats = boxScore?.TeamStats.find((s) =>
      isHomeTeam ? s.TEAM_ID === teamId : s.TEAM_ID !== teamId,
    );
    const homeTeamPlayerStats = boxScore?.PlayerStats.filter((s) =>
      isHomeTeam ? s.TEAM_ID === teamId : s.TEAM_ID !== teamId,
    );
    const homeTeamStartersStats = boxScore?.TeamStarterBenchStats.find(
      (s) =>
        (isHomeTeam ? s.TEAM_ID === teamId : s.TEAM_ID !== teamId) &&
        s.STARTERS_BENCH === "Starters",
    );
    const homeTeamBenchStats = boxScore?.TeamStarterBenchStats.find(
      (s) =>
        (isHomeTeam ? s.TEAM_ID === teamId : s.TEAM_ID !== teamId) &&
        s.STARTERS_BENCH === "Bench",
    );

    const awayTeamStats = boxScore?.TeamStats.find((s) =>
      isHomeTeam ? s.TEAM_ID !== teamId : s.TEAM_ID === teamId,
    );
    const awayTeamPlayerStats = boxScore?.PlayerStats.filter((s) =>
      isHomeTeam ? s.TEAM_ID !== teamId : s.TEAM_ID === teamId,
    );
    const awayTeamStartersStats = boxScore?.TeamStarterBenchStats.find(
      (s) =>
        (isHomeTeam ? s.TEAM_ID !== teamId : s.TEAM_ID === teamId) &&
        s.STARTERS_BENCH === "Starters",
    );
    const awayTeamBenchStats = boxScore?.TeamStarterBenchStats.find(
      (s) =>
        (isHomeTeam ? s.TEAM_ID !== teamId : s.TEAM_ID === teamId) &&
        s.STARTERS_BENCH === "Bench",
    );

    await client
      .db(CUR_SEASON)
      .collection("gameStats")
      .insertMany([
        {
          GAME_ID: gameId,
          TEAM_ID: homeTeamStats!.TEAM_ID,
          teamStats: homeTeamStats!,
          playerStats: homeTeamPlayerStats!,
          startersStats: homeTeamStartersStats!,
          benchStats: homeTeamBenchStats!,
        },
        {
          GAME_ID: gameId,
          TEAM_ID: awayTeamStats!.TEAM_ID,
          teamStats: awayTeamStats!,
          playerStats: awayTeamPlayerStats!,
          startersStats: awayTeamStartersStats!,
          benchStats: awayTeamBenchStats!,
        },
      ]);

    const gameData = {
      GAME_ID: gameId,
      GAME_DATE: game.GAME_DATE as string,
      AWAY_TEAM_ID: awayTeamStats!.TEAM_ID,
      AWAY_TEAM_NAME: awayTeamStats!.TEAM_NAME,
      AWAY_TEAM_CITY: awayTeamStats!.TEAM_CITY,
      AWAY_TEAM_ABBREVIATION: awayTeamStats!.TEAM_ABBREVIATION,
      AWAY_TEAM_PTS: awayTeamStats!.PTS,
      HOME_TEAM_ID: homeTeamStats!.TEAM_ID,
      HOME_TEAM_NAME: homeTeamStats!.TEAM_NAME,
      HOME_TEAM_CITY: homeTeamStats!.TEAM_CITY,
      HOME_TEAM_ABBREVIATION: homeTeamStats!.TEAM_ABBREVIATION,
      HOME_TEAM_PTS: homeTeamStats!.PTS,
    };

    // Store the game in the database
    await client.db(CUR_SEASON).collection("games").insertOne(gameData);

    processedIds.add(gameId);

    // Wait to avoid rate limiting
    await sleep(20000);
  }
}

async function run() {
  await processGames();
  await processTeamSeasonAverages();
  await processLeagueWideShotChart();
  process.exit(0);
}

await run();
