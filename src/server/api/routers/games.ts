import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import client from "~/server/db";
import { CUR_SEASON } from "~/lib/consts";
import { z } from "zod";

export const gamesRouter = createTRPCRouter({
  getGrouppedByDate: publicProcedure.query(async () => {
    const games = await client
      .db(CUR_SEASON)
      .collection("games")
      .find()
      .toArray();

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
      return await client
        .db(CUR_SEASON)
        .collection("games")
        .findOne({ GAME_ID: input.gameId });
    }),
});
