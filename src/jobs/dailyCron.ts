import { add, differenceInDays, format } from "date-fns";
import { nbaApi } from "~/clients/nba-api";
import { CUR_SEASON, StatKeyToShortLabel } from "~/lib/consts";
import { sleep } from "~/lib/utils";
import client from "~/server/db";
import { type DBGameStats, type TeamSeasonAverages } from "~/server/db/types";
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

async function getScoreboard(date: Date) {
  try {
    return await nbaApi.getScoreboard({
      GameDate: format(date, "yyyy-MM-dd"),
      LeagueID: "00",
      DayOffset: "0",
    });
  } catch (e) {
    console.error("Error fetching scoreboard", date, e);
    return null;
  }
}

async function getLeagueStandings() {
  try {
    return await nbaApi.getLeagueStandings({
      LeagueID: "00",
      Season: CUR_SEASON,
      SeasonType: "Regular Season",
    });
  } catch (e) {
    console.error("Error fetching standings", e);
    return null;
  }
}

async function getGameBoxscoreMisc(gameId: string) {
  try {
    return await nbaApi.getGameBoxscoreMisc({
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

async function recalculateStandardDeviations(
  teamId: number | string,
  gameStats: DBGameStats["teamStats"],
) {
  const teamAverages = (await client
    .db(CUR_SEASON)
    .collection("teamSeasonAverages")
    .findOne({
      TEAM_ID: teamId.toString(),
    })) as TeamSeasonAverages | null;

  if (!teamAverages) {
    console.log("No team averages found for", teamId);
    return;
  }

  const statKeys = (
    Object.keys(StatKeyToShortLabel) as (keyof typeof StatKeyToShortLabel)[]
  ).filter((k) => k !== "MIN");

  const numGames = teamAverages.GP + 1;
  const updatedStandardDeviations: Record<
    string,
    { value: number; sq_sum: number }
  > = {};

  for (const key of statKeys) {
    const gameStat = gameStats[key];
    const teamAvg = teamAverages[key === "TO" ? "TOV" : key];
    const sq_sum = teamAverages.standardDeviations[key]!.sq_sum;

    const delta = gameStat - teamAvg;
    const updatedAvg = teamAvg + delta / numGames;
    const delta2 = gameStat - updatedAvg;
    const updatedSqSum = sq_sum + delta * delta2;
    const updatedStdDev = Math.sqrt(updatedSqSum / numGames);

    updatedStandardDeviations[key] = {
      value: updatedStdDev,
      sq_sum: updatedSqSum,
    };
  }

  await client
    .db(CUR_SEASON)
    .collection("teamSeasonAverages")
    .updateOne(
      { TEAM_ID: teamId.toString() },
      {
        $set: {
          standardDeviations: updatedStandardDeviations,
        },
      },
    );
}

async function processStandingsUpdate() {
  const lastGame = await client
    .db(CUR_SEASON)
    .collection("games")
    .findOne(
      {},
      {
        sort: { GAME_DATE: -1 },
      },
    );

  const today = new Date(lastGame?.GAME_DATE as string);
  const yesterday = add(today, { days: -1 });
  const todayScoreboard = await getScoreboard(today);
  const yesterdayScoreboard = await getScoreboard(yesterday);

  if (!todayScoreboard || !yesterdayScoreboard) {
    console.error("Error fetching scoreboard");
    return;
  }

  const todayStandings = {
    east: todayScoreboard.EastConfStandingsByDay,
    west: todayScoreboard.WestConfStandingsByDay,
  };

  const yesterdayStandings = {
    east: yesterdayScoreboard.EastConfStandingsByDay,
    west: yesterdayScoreboard.WestConfStandingsByDay,
  };

  const leagueStandings = await getLeagueStandings();
  const activeStreaksByTeam = leagueStandings?.Standings.reduce(
    (acc, row) => {
      acc[row.TeamID as number] = row.CurrentStreak as number;
      return acc;
    },
    {} as Record<number, number>,
  );

  const standingsWithChanges = {
    east: todayStandings.east.map((team, todayPos) => {
      const yesterdayPos = yesterdayStandings.east.findIndex(
        (t) => t.TEAM_ID === team.TEAM_ID,
      );

      return {
        ...team,
        change: yesterdayPos - todayPos,
        streak: activeStreaksByTeam?.[team.TEAM_ID as number] ?? 0,
      };
    }),
    west: todayStandings.west.map((team, todayPos) => {
      const yesterdayPos = yesterdayStandings.west.findIndex(
        (t) => t.TEAM_ID === team.TEAM_ID,
      );

      return {
        ...team,
        change: yesterdayPos - todayPos,
        streak: activeStreaksByTeam?.[team.TEAM_ID as number] ?? 0,
      };
    }),
  };

  await client.db(CUR_SEASON).collection("standings").deleteMany({});

  await client
    .db(CUR_SEASON)
    .collection("standings")
    .insertOne(standingsWithChanges);
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

    // Get boxscore misc
    const boxScoreMisc = await getGameBoxscoreMisc(gameId);

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
    const homeTeamStatsMisc = boxScoreMisc?.sqlTeamsMisc.find(
      (s) => s.TEAM_ID === teamId,
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
    const awayTeamStatsMisc = boxScoreMisc?.sqlTeamsMisc.find(
      (s) => s.TEAM_ID !== teamId,
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
          teamStats: {
            ...homeTeamStats!,
            FB_PTS: (homeTeamStatsMisc?.PTS_FB as unknown as number[])[0],
            PITP: (homeTeamStatsMisc?.PTS_PAINT as unknown as number[])[0],
            SECOND_CHANCE_PTS: (
              homeTeamStatsMisc?.PTS_2ND_CHANCE as unknown as number[]
            )[0],
            PTS_OFF_TO: (
              homeTeamStatsMisc?.PTS_OFF_TOV as unknown as number[]
            )[0],
          },
          playerStats: homeTeamPlayerStats!,
          startersStats: homeTeamStartersStats!,
          benchStats: homeTeamBenchStats!,
        },
        {
          GAME_ID: gameId,
          TEAM_ID: awayTeamStats!.TEAM_ID,
          teamStats: {
            ...awayTeamStats!,
            FB_PTS: (awayTeamStatsMisc?.PTS_FB as unknown as number[])[0],
            PITP: (awayTeamStatsMisc?.PTS_PAINT as unknown as number[])[0],
            SECOND_CHANCE_PTS: (
              awayTeamStatsMisc?.PTS_2ND_CHANCE as unknown as number[]
            )[0],
            PTS_OFF_TO: (
              awayTeamStatsMisc?.PTS_OFF_TOV as unknown as number[]
            )[0],
          },
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

    await recalculateStandardDeviations(
      homeTeamStats!.TEAM_ID,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      homeTeamStats! as any,
    );

    await recalculateStandardDeviations(
      awayTeamStats!.TEAM_ID,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      awayTeamStats! as any,
    );

    // Store the game in the database
    await client.db(CUR_SEASON).collection("games").insertOne(gameData);

    processedIds.add(gameId);

    // Wait to avoid rate limiting
    await sleep(20000);
  }
}

export async function run() {
  console.time("dailyCron");
  await processGames();
  await processTeamSeasonAverages();
  await processLeagueWideShotChart();
  await processStandingsUpdate();
  console.timeEnd("dailyCron");
}
