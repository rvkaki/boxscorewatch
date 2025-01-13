import { format } from "date-fns";
import { api } from "~/trpc/server";
import GameCard from "./components/game-card";
import {
  BorderDashedIcon,
  DoubleArrowDownIcon,
  DoubleArrowUpIcon,
} from "@radix-ui/react-icons";
import TopPerformerCard from "./components/top-performer-card";
import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/utils";

export default async function Home() {
  const teams = await api.teams.getAll();

  const lastGames = await api.games.getLatest();
  const date = lastGames[0]!.GAME_DATE;

  const topPerformers = await api.games.getTopPerformers();

  const standings = await api.league.getStandings();
  const teamsById = teams.reduce(
    (acc, team) => {
      acc[team.TEAM_ID] = team;
      const conference = team.TEAM_CONFERENCE;
      const confStandings =
        standings[conference.toLocaleLowerCase() as "east" | "west"];

      const teamStandings = confStandings.find(
        (standing) => standing.TEAM_ID === team.TEAM_ID,
      );

      acc[team.TEAM_ID]!.W = teamStandings?.W ?? 0;
      acc[team.TEAM_ID]!.L = teamStandings?.L ?? 0;
      return acc;
    },
    {} as Record<string, (typeof teams)[0]>,
  );

  const latestNews = await api.league.getLatestNews();

  return (
    <main className="grid h-full w-full max-w-7xl flex-1 grid-cols-5 place-items-stretch gap-4 py-6 text-white lg:grid-rows-5 lg:py-12">
      {/* Latest games */}
      <div className="col-span-5 p-4 lg:col-span-3 lg:row-span-3">
        <div className="flex w-full flex-col gap-3">
          <p className="text-lg font-bold">{format(new Date(date), "E PP")}</p>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            {lastGames.map((game) => (
              <GameCard key={game.GAME_ID} game={game} teamsById={teamsById} />
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="col-span-5 p-4 lg:col-span-2 lg:col-start-4 lg:row-span-2">
        <div className="flex w-full flex-col gap-3">
          <p className="text-lg font-bold">Top Performers</p>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            {topPerformers.map(({ player }) => (
              <TopPerformerCard key={player.PLAYER_ID} player={player} />
            ))}
          </div>
        </div>
      </div>

      {/* Updated Standings */}
      <div className="col-span-5 p-4 lg:col-span-2 lg:col-start-4 lg:row-span-3 lg:row-start-3">
        <div className="flex w-full flex-col gap-3">
          <p className="text-lg font-bold">Standings</p>
          <div className="flex w-full gap-2">
            {Object.entries(standings).map(([conf, teams]) => {
              return (
                <div key={conf} className="flex flex-1 flex-col gap-2">
                  <p className="font-semibold capitalize">{conf}</p>
                  {teams.map((team, idx) => {
                    const streak = team.streak;

                    return (
                      <div key={team.TEAM_ID} className="w-full">
                        {(idx === 6 || idx === 10) && (
                          <div
                            key="play_in_cutoff"
                            className="mb-2 h-0 w-full border-t border-dashed bg-neutral-500"
                          ></div>
                        )}

                        <div className="grid w-full grid-cols-[24px_48px_1fr_32px_32px] rounded-md bg-neutral-900 px-3 py-2 text-sm">
                          <span className="text-neutral-500">{idx + 1}.</span>
                          <span>
                            {teamsById[team.TEAM_ID]?.TEAM_ABBREVIATION}
                          </span>
                          <span className="text-neutral-400">
                            {team.W} - {team.L}
                          </span>
                          <div>
                            {Math.abs(streak) > 3 ? (
                              <span
                                className={cn(
                                  "rounded-sm px-1.5 py-0.5 text-[10px]",
                                  streak > 0
                                    ? "bg-green-950 text-green-400"
                                    : "bg-red-950 text-red-400",
                                )}
                              >
                                {streak > 0 ? "W" : "L"}
                                {Math.abs(streak)}
                              </span>
                            ) : null}
                          </div>
                          <div className="self-center justify-self-end">
                            {team.change > 0 ? (
                              <span className="flex items-center gap-0.5 text-xs text-green-500">
                                {team.change}
                                <DoubleArrowUpIcon />
                              </span>
                            ) : team.change < 0 ? (
                              <span className="flex items-center gap-0.5 text-xs text-red-500">
                                {team.change}
                                <DoubleArrowDownIcon />
                              </span>
                            ) : (
                              <span className="text-neutral-500">
                                <BorderDashedIcon />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Latest News */}
      <div className="col-span-5 p-4 lg:col-span-3 lg:row-span-2 lg:row-start-4">
        <div className="flex w-full flex-col gap-3">
          <p className="text-lg font-bold">Latest News</p>
          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
            {latestNews
              .filter((n) => n.imageUrl !== null)
              .slice(0, 6)
              .map((news) => (
                <Link
                  key={news.title}
                  href={news.link}
                  target="_blank"
                  className="flex w-full flex-col overflow-hidden rounded-md border border-neutral-700 hover:brightness-125"
                >
                  <div className="relative aspect-video w-full">
                    <Image
                      src={news.imageUrl!}
                      alt={news.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  <div className="w-full flex-1 bg-neutral-900 px-4 py-3">
                    <p className="text-xs font-bold">{news.title}</p>
                    <p className="text-[10px] text-neutral-400">
                      {format(new Date(news.date), "PP")}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
