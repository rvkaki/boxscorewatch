import { z } from "zod";
import { CUR_SEASON } from "~/lib/consts";
import findRuns from "~/lib/findRuns";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import client from "~/server/db";
import {
  type DBGame,
  type DBGameRotations,
  type DBGameShotChart,
  type DBGameStats,
  type DBLeagueWideShotChart,
  type DBPlayByPlay,
} from "~/server/db/types";

// Get game top performer based on gameScore
// the formula is PTS + 0.4 * FG - 0.7 * FGA - 0.4*(FTA - FT) + 0.7 * ORB + 0.3 * DRB + STL + 0.7 * AST + 0.7 * BLK - 0.4 * PF - TOV.
function getPlayerGameScore(player: DBGameStats["playerStats"][0]) {
  const {
    PTS = 0,
    FGM = 0,
    FGA = 0,
    FTA = 0,
    FTM = 0,
    OREB = 0,
    DREB = 0,
    STL = 0,
    AST = 0,
    BLK = 0,
    PF = 0,
    TO = 0,
  } = player;

  return (
    PTS! +
    0.4 * FGM! -
    0.7 * FGA! -
    0.4 * (FTA! - FTM!) +
    0.7 * OREB! +
    0.3 * DREB! +
    STL! +
    0.7 * AST! +
    0.7 * BLK! -
    0.4 * PF! -
    TO!
  );
}

async function getLatestGames() {
  const lastDate = (await client
    .db(CUR_SEASON)
    .collection("games")
    .find()
    .sort({ GAME_DATE: -1 })
    .project({ GAME_DATE: 1 })
    .limit(1)
    .next()) as { GAME_DATE: string };

  const games = (await client
    .db(CUR_SEASON)
    .collection("games")
    .find({ GAME_DATE: lastDate.GAME_DATE })
    .toArray()) as unknown as DBGame[];

  return games;
}

export const gamesRouter = createTRPCRouter({
  getLatest: publicProcedure.query(async () => {
    return getLatestGames();
  }),
  getTopPerformers: publicProcedure.query(async () => {
    const latestGames = await getLatestGames();

    const gameStats = (await client
      .db(CUR_SEASON)
      .collection("gameStats")
      .find({ GAME_ID: { $in: latestGames.map((game) => game.GAME_ID) } })
      .toArray()) as unknown as DBGameStats[];

    const topPerformers = gameStats
      .flatMap((game) => {
        return game.playerStats.flatMap((player) => {
          const gameScore = getPlayerGameScore(player);
          if (gameScore === 0) {
            return [];
          }

          return {
            gameScore,
            player,
            gameId: game.GAME_ID,
          };
        });
      })
      .sort((a, b) => {
        return b.gameScore - a.gameScore;
      });

    return topPerformers.slice(0, 6);
  }),
  getGrouppedByDate: publicProcedure.query(async () => {
    const games = (await client
      .db(CUR_SEASON)
      .collection("games")
      .find()
      .toArray()) as unknown as DBGame[];

    const groupped = games.reduce(
      (acc, game) => {
        const date = game.GAME_DATE;
        if (!acc[date]) {
          acc[date] = [];
        }

        acc[date].push(game);
        return acc;
      },
      {} as Record<string, typeof games>,
    );

    return Object.entries(groupped)
      .map(([date, games]) => ({
        _id: date,
        games,
      }))
      .sort((a, b) => {
        return new Date(b._id).getTime() - new Date(a._id).getTime();
      });
  }),
  getById: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      return (await client
        .db(CUR_SEASON)
        .collection("games")
        .findOne({ GAME_ID: input.gameId })) as DBGame | null;
    }),
  getGameShotChart: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      return (await client
        .db(CUR_SEASON)
        .collection("shotCharts")
        .findOne({ GAME_ID: input.gameId })) as DBGameShotChart | null;
    }),
  getGameStats: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      return (await client
        .db(CUR_SEASON)
        .collection("gameStats")
        .find({ GAME_ID: input.gameId })
        .toArray()) as unknown as DBGameStats[];
    }),
  getLeagueShotChart: publicProcedure.query(async () => {
    return (await client
      .db(CUR_SEASON)
      .collection("leagueWideShotChart")
      .findOne()) as DBLeagueWideShotChart | null;
  }),
  getGameRuns: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      const playbyplay = (await client
        .db(CUR_SEASON)
        .collection("playbyplay")
        .findOne({
          GAME_ID: input.gameId,
        })) as DBPlayByPlay | null;

      if (!playbyplay) {
        return [];
      }

      return findRuns(playbyplay.playbyplay);
    }),
  getPlayByPlay: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      const res = (await client
        .db(CUR_SEASON)
        .collection("playbyplay")
        .findOne({
          GAME_ID: input.gameId,
        })) as DBPlayByPlay | null;

      return res?.playbyplay ?? [];
    }),
  getGameRotations: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      return (await client
        .db(CUR_SEASON)
        .collection("gameRotations")
        .find({ GAME_ID: input.gameId })
        .project({ _id: 0 })
        .toArray()) as unknown as [DBGameRotations, DBGameRotations];
    }),
});
