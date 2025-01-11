import { z } from "zod";
import { CUR_SEASON } from "~/lib/consts";
import client from "~/server/db";
import { type DBTeam, type TeamSeasonAverages } from "~/server/db/types";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const teamsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return (await client
      .db(CUR_SEASON)
      .collection("teams")
      .find()
      .toArray()) as unknown as DBTeam[];
  }),
  getAllSeasonAverages: publicProcedure.query(async () => {
    return await client
      .db(CUR_SEASON)
      .collection("teamSeasonAverages")
      .find()
      .toArray();
  }),
  getSeasonAveragesById: publicProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ input }) => {
      const { teamId } = input;
      const res = await client
        .db(CUR_SEASON)
        .collection("teamSeasonAverages")
        .findOne({ TEAM_ID: teamId });

      return res as TeamSeasonAverages | null;
    }),
});
