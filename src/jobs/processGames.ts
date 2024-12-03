import { add, differenceInDays } from "date-fns";
import { nbaApi } from "~/clients/nba-api";
import client from "~/server/db";
import { CUR_SEASON } from "~/lib/consts";

async function processGames({
  season,
  dateFrom,
}: {
  season: string;
  dateFrom: Date | null;
}) {
  console.log("Processing games for", season, dateFrom);

  const res = await nbaApi.getLeagueGameLogs({
    Direction: "DESC",
    LeagueID: "00",
    PlayerOrTeam: "T",
    Season: season,
    SeasonType: "Regular Season",
    Sorter: "DATE",
    ...((dateFrom && { DateFrom: dateFrom.toISOString() }) ?? {}),
  });

  const allGames = res.LeagueGameLog;
  type Game = (typeof allGames)[0];

  const games = allGames.reduce(
    (acc, game) => {
      const gameKey = game.GAME_ID as string;

      if (!acc[gameKey]) {
        acc[gameKey] = {
          home: game, // This is because typescript
          away: game, // This is because typescript
        };
      }

      if ((game.MATCHUP as string).includes("vs")) {
        acc[gameKey].home = game;
      } else {
        acc[gameKey].away = game;
      }

      return acc;
    },
    {} as Record<string, { home: Game; away: Game }>,
  );

  const sorted = Object.values(games).sort((a, b) => {
    return (
      new Date(a.home.GAME_DATE).getTime() -
      new Date(b.home.GAME_DATE).getTime()
    );
  });

  // Store the games in the database
  return await client.db(season).collection("games").insertMany(sorted);
}

async function run() {
  const lastGame = await client
    .db(CUR_SEASON)
    .collection("games")
    .findOne(
      {},
      {
        sort: { "home.GAME_DATE": -1 },
      },
    );

  let dateFrom: Date | null = null;
  if (lastGame) {
    const diffInDays = differenceInDays(
      new Date(),
      new Date(lastGame.home.GAME_DATE as string),
    );

    if (diffInDays <= 1) {
      console.log("Games are up to date");
      process.exit(0);
    }

    console.log("Games are not up to date");
    dateFrom = add(new Date(lastGame.home.GAME_DATE as string), { days: 1 });
  }

  await processGames({ season: CUR_SEASON, dateFrom });
  process.exit(0);
}

await run();
