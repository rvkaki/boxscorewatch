import { type Response, fetch as undiciFetch } from "undici";
import { env } from "~/env";
import { getProxyAgent } from "./proxy";
import allTeams from "./teams.json";
import {
  type GameBoxScoreParams,
  type GameBoxScoreResponse,
  type GameRotationParams,
  type GameRotationResponse,
  type GameVideoDetailsParams,
  type GameVideoDetailsResponse,
  type LeagueGameLogParams,
  type LeagueGameLogResponse,
  type LeagueHustleStatsPlayerParams,
  type LeagueHustleStatsPlayerResponse,
  type LeagueWideShotChartParams,
  type LeagueWideShotChartResponse,
  type NBA_API_Response,
  type PlayByBlayParams,
  type PlayByPlayResponse,
  type PlayerDashboardByGeneralSplitsParams,
  type PlayerDashboardByGeneralSplitsResponse,
  type PlayerIndexParams,
  type PlayerIndexResponse,
  type ScoreboardV2Params,
  type ScoreboardV2Response,
  type ShotChartDetailParams,
  type ShotChartDetailResponse,
  type TeamDashboardByGeneralSplitsParams,
  type TeamDashboardByGeneralSplitsResponse,
  type TeamGameLogsParams,
  type TeamGameLogsResponse,
  type TeamInfoCommonParams,
  type TeamInfoCommonResponse,
} from "./types";

class NBA_API_Client {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = "https://stats.nba.com";
    this.headers = {
      Host: "stats.nba.com",
      Connection: "keep-alive",
      "Cache-Control": "max-age=0",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9",
      "x-nba-stats-origin": "stats",
      "x-nba-stats-token": "true",
      Referer: "https://stats.nba.com/",
    };
  }

  private async fetch(endpoint: string) {
    if (env.NODE_ENV === "production") {
      let proxy = getProxyAgent();
      let res: Response;
      while (true) {
        try {
          res = await undiciFetch(`${this.baseUrl}${endpoint}`, {
            headers: this.headers,
            dispatcher: proxy,
          });
          break;
        } catch (e) {
          console.error(e);
          proxy = getProxyAgent();
          continue;
        }
      }
      const data = await res.json();
      return data;
    } else {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: this.headers,
      });

      const data = await res.json();
      return data;
    }
  }

  private parseResponse<
    R extends string,
    P extends Record<string, string>,
    N extends readonly string[],
    H extends Array<readonly string[]>,
    D,
  >(response: NBA_API_Response<R, P, N, H, D>) {
    const result = response.resultSets.reduce(
      (acc1, resultSet) => {
        acc1[resultSet.name as N[number]] = resultSet.rowSet.map((row) =>
          resultSet.headers.reduce(
            (acc2, header, index) => {
              acc2[header as H[keyof N & number][number]] = row[index]!;
              return acc2;
            },
            {} as Record<H[keyof N & number][number], D>,
          ),
        );
        return acc1;
      },
      {} as Record<N[number], Record<H[keyof N & number][number], D>[]>,
    );

    return result;
  }

  /** TEAMS */
  async getAllTeams() {
    return allTeams;
  }

  async getTeamByAbbreviation(abv: string) {
    return allTeams.find((team) => team.abbreviation === abv);
  }

  async getTeamInfoCommon(params: TeamInfoCommonParams) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/teaminfocommon?${queryString}`,
    )) as TeamInfoCommonResponse;
    return this.parseResponse<
      TeamInfoCommonResponse["resource"],
      TeamInfoCommonResponse["parameters"],
      Array<TeamInfoCommonResponse["resultSets"][number]["name"]>,
      Array<TeamInfoCommonResponse["resultSets"][number]["headers"]>,
      TeamInfoCommonResponse["resultSets"][number]["rowSet"][number][number]
    >(data);
  }

  async getTeamDashboardByGeneralSplits(
    params: TeamDashboardByGeneralSplitsParams,
  ) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/teamdashboardbygeneralsplits?${queryString}`,
    )) as TeamDashboardByGeneralSplitsResponse;
    return this.parseResponse<
      TeamDashboardByGeneralSplitsResponse["resource"],
      TeamDashboardByGeneralSplitsResponse["parameters"],
      Array<TeamDashboardByGeneralSplitsResponse["resultSets"][number]["name"]>,
      Array<
        TeamDashboardByGeneralSplitsResponse["resultSets"][number]["headers"]
      >,
      TeamDashboardByGeneralSplitsResponse["resultSets"][number]["rowSet"][number][number]
    >(data);
  }

  async getLeagueHustleStatsPlayer(params: LeagueHustleStatsPlayerParams) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/leaguehustlestatsplayer?${queryString}`,
    )) as LeagueHustleStatsPlayerResponse;
    // Return in object format
    return this.parseResponse<
      LeagueHustleStatsPlayerResponse["resource"],
      LeagueHustleStatsPlayerResponse["parameters"],
      Array<LeagueHustleStatsPlayerResponse["resultSets"][number]["name"]>,
      Array<LeagueHustleStatsPlayerResponse["resultSets"][number]["headers"]>,
      LeagueHustleStatsPlayerResponse["resultSets"][number]["rowSet"][number][number]
    >(data);
  }

  async getPlayerIndex(params: PlayerIndexParams) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/playerindex?${queryString}`,
    )) as PlayerIndexResponse;
    return this.parseResponse<
      PlayerIndexResponse["resource"],
      PlayerIndexResponse["parameters"],
      Array<PlayerIndexResponse["resultSets"][number]["name"]>,
      Array<PlayerIndexResponse["resultSets"][number]["headers"]>,
      PlayerIndexResponse["resultSets"][number]["rowSet"][number][number]
    >(data);
  }

  async getPlayerDashboardByGeneralSplits(
    params: PlayerDashboardByGeneralSplitsParams,
  ) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/playerdashboardbygeneralsplits?${queryString}`,
    )) as PlayerDashboardByGeneralSplitsResponse;
    return this.parseResponse<
      PlayerDashboardByGeneralSplitsResponse["resource"],
      PlayerDashboardByGeneralSplitsResponse["parameters"],
      Array<
        PlayerDashboardByGeneralSplitsResponse["resultSets"][number]["name"]
      >,
      Array<
        PlayerDashboardByGeneralSplitsResponse["resultSets"][number]["headers"]
      >,
      PlayerDashboardByGeneralSplitsResponse["resultSets"][number]["rowSet"][number][number]
    >(data);
  }

  async getTeamGameLogs(params: TeamGameLogsParams) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/teamgamelogs?${queryString}`,
    )) as TeamGameLogsResponse;
    return this.parseResponse<
      TeamGameLogsResponse["resource"],
      TeamGameLogsResponse["parameters"],
      Array<TeamGameLogsResponse["resultSets"][number]["name"]>,
      Array<TeamGameLogsResponse["resultSets"][number]["headers"]>,
      TeamGameLogsResponse["resultSets"][number]["rowSet"][number][number]
    >(data);
  }

  async getGameBoxscore(params: GameBoxScoreParams) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/boxscoretraditionalv2?${queryString}`,
    )) as GameBoxScoreResponse;
    return this.parseResponse<
      GameBoxScoreResponse["resource"],
      GameBoxScoreResponse["parameters"],
      Array<GameBoxScoreResponse["resultSets"][number]["name"]>,
      Array<GameBoxScoreResponse["resultSets"][number]["headers"]>,
      GameBoxScoreResponse["resultSets"][number]["rowSet"][number][number]
    >(data);
  }

  async getLeagueGameLogs(params: LeagueGameLogParams) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/leaguegamelog?${queryString}`,
    )) as LeagueGameLogResponse;
    return this.parseResponse<
      LeagueGameLogResponse["resource"],
      LeagueGameLogResponse["parameters"],
      Array<LeagueGameLogResponse["resultSets"][number]["name"]>,
      Array<LeagueGameLogResponse["resultSets"][number]["headers"]>,
      LeagueGameLogResponse["resultSets"][number]["rowSet"][number][number]
    >(data);
  }

  async getShotChartDetail(params: ShotChartDetailParams) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/shotchartdetail?${queryString}`,
    )) as ShotChartDetailResponse;
    return this.parseResponse<
      ShotChartDetailResponse["resource"],
      ShotChartDetailResponse["parameters"],
      Array<ShotChartDetailResponse["resultSets"][number]["name"]>,
      Array<ShotChartDetailResponse["resultSets"][number]["headers"]>,
      ShotChartDetailResponse["resultSets"][number]["rowSet"][number][number]
    >(data);
  }

  async getLeagueWideShotChart(params: LeagueWideShotChartParams) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/shotchartleaguewide?${queryString}`,
    )) as LeagueWideShotChartResponse;
    return this.parseResponse<
      LeagueWideShotChartResponse["resource"],
      LeagueWideShotChartResponse["parameters"],
      Array<LeagueWideShotChartResponse["resultSets"][number]["name"]>,
      Array<LeagueWideShotChartResponse["resultSets"][number]["headers"]>,
      LeagueWideShotChartResponse["resultSets"][number]["rowSet"][number][number]
    >(data);
  }

  async getPlayByPlay(params: PlayByBlayParams) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/playbyplayv2?${queryString}`,
    )) as PlayByPlayResponse;
    return this.parseResponse<
      PlayByPlayResponse["resource"],
      PlayByPlayResponse["parameters"],
      Array<PlayByPlayResponse["resultSets"][number]["name"]>,
      Array<PlayByPlayResponse["resultSets"][number]["headers"]>,
      PlayByPlayResponse["resultSets"][number]["rowSet"][number][number]
    >(data);
  }

  async getGameRotation(params: GameRotationParams) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/gamerotation?${queryString}`,
    )) as GameRotationResponse;
    return this.parseResponse<
      GameRotationResponse["resource"],
      GameRotationResponse["parameters"],
      Array<GameRotationResponse["resultSets"][number]["name"]>,
      Array<GameRotationResponse["resultSets"][number]["headers"]>,
      GameRotationResponse["resultSets"][number]["rowSet"][number][number]
    >(data);
  }

  async getGameVideoDetails(params: GameVideoDetailsParams) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/videodetailsasset?${queryString}`,
    )) as GameVideoDetailsResponse;

    const res = [];
    const {
      Meta: { videoUrls },
      playlist,
    } = data.resultSets;

    for (const [index, play] of playlist.entries()) {
      res.push({
        ...play,
        video: videoUrls[index],
      });
    }

    return res;
  }

  async getScoreboard(params: ScoreboardV2Params) {
    const queryString = new URLSearchParams(params).toString();
    const data = (await this.fetch(
      `/stats/scoreboardV2?${queryString}`,
    )) as ScoreboardV2Response;
    return this.parseResponse<
      ScoreboardV2Response["resource"],
      ScoreboardV2Response["parameters"],
      Array<ScoreboardV2Response["resultSets"][number]["name"]>,
      Array<ScoreboardV2Response["resultSets"][number]["headers"]>,
      ScoreboardV2Response["resultSets"][number]["rowSet"][number][number]
    >(data);
  }
}

export const nbaApi = new NBA_API_Client();
