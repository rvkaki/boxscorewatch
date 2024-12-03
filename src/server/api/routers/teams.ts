import client from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { CUR_SEASON } from "~/lib/consts";
import { z } from "zod";
import { type TeamSeasonAverages } from "~/server/db/types";

export const teamsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await client.db(CUR_SEASON).collection("teams").find().toArray();
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
