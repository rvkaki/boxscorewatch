import { CUR_SEASON } from "~/lib/consts";
import client from "~/server/db";
import { type DBNews, type DBStandings } from "~/server/db/types";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const leagueRouter = createTRPCRouter({
  getStandings: publicProcedure.query(async () => {
    const standings = await client
      .db(CUR_SEASON)
      .collection("standings")
      .findOne();

    if (!standings) {
      throw new Error("Standings not found");
    }

    const { _id, ...withoutId } = standings;

    return withoutId as unknown as DBStandings;
  }),
  getLatestNews: publicProcedure.query(async () => {
    const news = await client
      .db(CUR_SEASON)
      .collection("latestNews")
      .find()
      .sort({ date: -1 })
      .toArray();

    return news as unknown as DBNews[];
  }),
});
