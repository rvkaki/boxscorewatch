import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import client from "~/server/db";
import { CUR_SEASON } from "~/lib/consts";
import { z } from "zod";
import {
  DBGameStats,
  DBLeagueWideShotChart,
  type DBGame,
  type DBGameShotChart,
} from "~/server/db/types";

export const gamesRouter = createTRPCRouter({
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
});
