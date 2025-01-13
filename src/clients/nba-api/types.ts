export type NBA_API_Response<
  R extends string,
  P extends Record<string, string | undefined>,
  N extends readonly string[],
  H extends readonly (readonly string[])[] & { length: N["length"] },
  D,
> = {
  resource: R;
  parameters: P;
  resultSets: {
    [K in keyof N]: {
      name: N[K];
      headers: H[K & number];
      rowSet: Array<Array<D>>;
    };
  };
};

type LeagueID = "00"; // NBA
type SeasonType = "Regular Season" | "Pre Season";
type Season = string;
type GameSegment = "First Half" | "Overtime" | "Second Half";
type Location = "Home" | "Road";
type MeasureType =
  | "Base"
  | "Advanced"
  | "Misc"
  | "Four Factors"
  | "Scoring"
  | "Opponent"
  | "Usage"
  | "Defense";
type PerMode =
  | "Totals"
  | "PerGame"
  | "MinutesPer"
  | "Per48"
  | "Per40"
  | "Per36"
  | "PerMinute"
  | "PerPossession"
  | "PerPlay"
  | "Per100Possessions"
  | "Per100Plays";
type SeasonSegment = "Post All-Star" | "Pre All-Star";
type ShotClockRange =
  | "24-22"
  | "22-18 Very Early"
  | "18-15 Early"
  | "15-7 Average"
  | "7-4 Late"
  | "4-0 Very Late"
  | "ShotClock Off";
type Outcome = "W" | "L";
type Conference = "East" | "West";
type Division =
  | "Atlantic"
  | "Central"
  | "Southeast"
  | "Northwest"
  | "Pacific"
  | "Southwest";
type PlayerOrTeam = "P" | "T";
type Sorter =
  | "FGM"
  | "FGA"
  | "FG_PCT"
  | "FG3M"
  | "FG3A"
  | "FG3_PCT"
  | "FTM"
  | "FTA"
  | "FT_PCT"
  | "OREB"
  | "DREB"
  | "AST"
  | "STL"
  | "BLK"
  | "TOV"
  | "REB"
  | "PTS"
  | "DATE";
type Direction = "ASC" | "DESC";
type ContextMeasure =
  | "PTS"
  | "FGM"
  | "FGA"
  | "FG_PCT"
  | "FG3M"
  | "FG3A"
  | "FG3_PCT"
  | "PF"
  | "EFG_PCT"
  | "TS_PCT"
  | "PTS_FB"
  | "PTS_OFF_TOV"
  | "PTS_2ND_CHANCE";
type PlayerPositionNullable = "Guard" | "Forward" | "Center";
// type PlayerPosition = "F" | "C" | "G" | "C-F" | "F-C" | "F-G" | "G-F";
type ClutchTime =
  | "Last 5 Minutes"
  | "Last 4 Minutes"
  | "Last 3 Minutes"
  | "Last 2 Minutes"
  | "Last 1 Minute"
  | "Last 30 Seconds"
  | "Last 10 Seconds";
type AheadBehind = "Ahead or Behind" | "Behind or Tied" | "Ahead or Tied";

export type TeamInfoCommonParams = {
  TeamID: string;
  LeagueID: LeagueID;
  SeasonType?: SeasonType;
  Season?: Season;
};

export type TeamInfoCommonResponse = NBA_API_Response<
  "teaminfocommon",
  TeamInfoCommonParams,
  ["TeamInfoCommon", "TeamSeasonRanks", "AvailableSeasons"],
  [
    [
      "TEAM_ID",
      "SEASON_YEAR",
      "TEAM_CITY",
      "TEAM_NAME",
      "TEAM_ABBREVIATION",
      "TEAM_CONFERENCE",
      "TEAM_DIVISION",
      "TEAM_CODE",
      "W",
      "L",
      "PCT",
      "CONF_RANK",
      "DIV_RANK",
      "MIN_YEAR",
      "MAX_YEAR",
    ],
    [
      "LEAGUE_ID",
      "SEASON_ID",
      "TEAM_ID",
      "PTS_RANK",
      "PTS_PG",
      "REB_RANK",
      "REB_PG",
      "AST_RANK",
      "AST_PG",
      "OPP_PTS_RANK",
      "OPP_PTS_PG",
    ],
    ["SEASON_ID"],
  ],
  string | number
>;

export type TeamDashboardByGeneralSplitsParams = {
  LastNGames: string;
  MeasureType: MeasureType;
  Month: string;
  OpponentTeamID: string;
  PaceAdjust: "Y" | "N";
  Period: string;
  PerMode: PerMode;
  PlusMinus: "Y" | "N";
  Rank: "Y" | "N";
  Season: Season;
  SeasonType: SeasonType;
  TeamID: string;
  DateFrom?: string;
  DateTo?: string;
  GameSegment?: GameSegment;
  LeagueID?: LeagueID;
  Location?: Location;
  Outcome?: Outcome;
  PORound?: string;
  SeasonSegment?: SeasonSegment;
  ShotClockRange?: ShotClockRange;
  VsConference?: Conference;
  VsDivision?: Division;
};

const teamBaseSplits = [
  "GROUP_SET",
  "GROUP_VALUE",
  "GP",
  "W",
  "L",
  "W_PCT",
  "MIN",
  "FGM",
  "FGA",
  "FG_PCT",
  "FG3M",
  "FG3A",
  "FG3_PCT",
  "FTM",
  "FTA",
  "FT_PCT",
  "OREB",
  "DREB",
  "REB",
  "AST",
  "TOV",
  "STL",
  "BLK",
  "BLKA",
  "PF",
  "PFD",
  "PTS",
  "PLUS_MINUS",
  "GP_RANK",
  "W_RANK",
  "L_RANK",
  "W_PCT_RANK",
  "MIN_RANK",
  "FGM_RANK",
  "FGA_RANK",
  "FG_PCT_RANK",
  "FG3M_RANK",
  "FG3A_RANK",
  "FG3_PCT_RANK",
  "FTM_RANK",
  "FTA_RANK",
  "FT_PCT_RANK",
  "OREB_RANK",
  "DREB_RANK",
  "REB_RANK",
  "AST_RANK",
  "TOV_RANK",
  "STL_RANK",
  "BLK_RANK",
  "BLKA_RANK",
  "PF_RANK",
  "PFD_RANK",
  "PTS_RANK",
  "PLUS_MINUS_RANK",
  "CFID",
  "CFPARAMS",
] as const;
export type TeamDashboardByGeneralSplitsResponse = NBA_API_Response<
  "teamdashboardbygeneralsplits",
  TeamDashboardByGeneralSplitsParams,
  [
    "DaysRestTeamDashboard",
    "LocationTeamDashboard",
    "MonthTeamDashboard",
    "OverallTeamDashboard",
    "PrePostAllStarTeamDashboard",
    "WinsLossesTeamDashboard",
  ],
  [
    [...typeof teamBaseSplits, "TEAM_DAYS_REST_RANGE"],
    [...typeof teamBaseSplits, "TEAM_GAME_LOCATION"],
    [...typeof teamBaseSplits, "SEASON_MONTH_NAME"],
    [...typeof teamBaseSplits, "SEASON_YEAR"],
    [...typeof teamBaseSplits, "SEASON_SEGMENT"],
    [...typeof teamBaseSplits, "GAME_RESULT"],
  ],
  string | number
>;

export type LeagueHustleStatsPlayerParams = {
  PerMode: "Totals" | "PerGame" | "Per48" | "Per40" | "Per36" | "PerMinute";
  SeasonType: SeasonType | "Playoffs" | "All Star";
  Season: Season;
  College?: string;
  Conference?: string;
  Country?: string;
  DateFrom?: string;
  DateTo?: string;
  Division?: string;
  DraftPick?: string;
  DraftYear?: string;
  Height?: string;
  LeagueID?: LeagueID;
  Location?: string;
  Month?: string;
  OpponentTeamID?: string;
  Outcome?: string;
  PORound?: string;
  PlayerExperience?: string;
  PlayerPosition?: string;
  SeasonSegment?: string;
  TeamID?: string;
  VsConference?: string;
  VsDivision?: string;
  Weight?: string;
};

export type LeagueHustleStatsPlayerResponse = NBA_API_Response<
  "leaguehustlestatsplayer",
  LeagueHustleStatsPlayerParams,
  ["HustleStatsPlayer"],
  [
    [
      "PLAYER_ID",
      "PLAYER_NAME",
      "TEAM_ID",
      "TEAM_ABBREVIATION",
      "AGE",
      "G",
      "MIN",
      "CONTESTED_SHOTS",
      "CONTESTED_SHOTS_2PT",
      "CONTESTED_SHOTS_3PT",
      "DEFLECTIONS",
      "CHARGES_DRAWN",
      "SCREEN_ASSISTS",
      "SCREEN_AST_PTS",
      "OFF_LOOSE_BALLS_RECOVERED",
      "DEF_LOOSE_BALLS_RECOVERED",
      "LOOSE_BALLS_RECOVERED",
      "PCT_LOOSE_BALLS_RECOVERED_OFF",
      "PCT_LOOSE_BALLS_RECOVERED_DEF",
      "OFF_BOXOUTS",
      "DEF_BOXOUTS",
      "BOX_OUT_PLAYER_TEAM_REBS",
      "BOX_OUT_PLAYER_REBS",
      "BOX_OUTS",
      "PCT_BOX_OUTS_OFF",
      "PCT_BOX_OUTS_DEF",
      "PCT_BOX_OUTS_TEAM_REB",
      "PCT_BOX_OUTS_REB",
    ],
  ],
  string | number
>;

export type PlayerIndexParams = {
  LeagueID: LeagueID;
  Season: Season;
  Active?: string;
  AllStar?: string;
  College?: string;
  Country?: string;
  DraftPick?: string;
  DraftRound?: string;
  DraftYear?: string;
  Height?: string;
  Historical?: string;
  TeamID?: string;
  Weigh?: string;
};

export type PlayerIndexResponse = NBA_API_Response<
  "commonallplayers",
  PlayerIndexParams,
  ["PlayerIndex"],
  [
    [
      "PERSON_ID",
      "PLAYER_LAST_NAME",
      "PLAYER_FIRST_NAME",
      "PLAYER_SLUG",
      "TEAM_ID",
      "TEAM_SLUG",
      "IS_DEFUNCT",
      "TEAM_CITY",
      "TEAM_NAME",
      "TEAM_ABBREVIATION",
      "JERSEY_NUMBER",
      "POSITION",
      "HEIGHT",
      "WEIGHT",
      "COLLEGE",
      "COUNTRY",
      "DRAFT_YEAR",
      "DRAFT_ROUND",
      "DRAFT_NUMBER",
      "ROSTER_STATUS",
      "PTS",
      "REB",
      "AST",
      "STATS_TIMEFRAME",
      "FROM_YEAR",
      "TO_YEAR",
    ],
  ],
  string | number
>;

export type PlayerIndex = {
  PERSON_ID: number;
  PLAYER_LAST_NAME: string;
  PLAYER_FIRST_NAME: string;
  PLAYER_SLUG: string;
  TEAM_ID: number;
  TEAM_SLUG: string;
  IS_DEFUNCT: 0 | 1;
  TEAM_CITY: string;
  TEAM_NAME: string;
  TEAM_ABBREVIATION: string;
  JERSEY_NUMBER: string;
  POSITION: string;
  HEIGHT: string;
  WEIGHT: string;
  COLLEGE: string;
  COUNTRY: string;
  DRAFT_YEAR: number | null;
  DRAFT_ROUND: number | null;
  DRAFT_NUMBER: number | null;
  ROSTER_STATUS: number;
  FROM_YEAR: string;
  TO_YEAR: string;
  PTS: number;
  REB: number;
  AST: number;
  STATS_TIMEFRAME: string;
};

export type PlayerDashboardByGeneralSplitsParams = {
  LastNGames: string;
  MeasureType: MeasureType;
  Month: string;
  OpponentTeamID: string;
  PaceAdjust: "Y" | "N";
  Period: string;
  PerMode: PerMode;
  PlayerID: string;
  PlusMinus: "Y" | "N";
  Rank: "Y" | "N";
  Season: Season;
  SeasonType: SeasonType;
  DateFrom?: string;
  DateTo?: string;
  GameSegment?: GameSegment;
  LeagueID?: LeagueID;
  Location?: Location;
  Outcome?: Outcome;
  PORound?: string;
  SeasonSegment?: SeasonSegment;
  ShotClockRange?: ShotClockRange;
  VsConference?: Conference;
  VsDivision?: Division;
};

export const playerBaseSplits = [
  ...teamBaseSplits,
  "NBA_FANTASY_PTS",
  "DD2",
  "TD3",
  "NBA_FANTASY_PTS_RANK",
  "DD2_RANK",
  "TD3_RANK",
] as const;
export type PlayerDashboardByGeneralSplitsResponse = NBA_API_Response<
  "playerdashboardbygeneralsplits",
  PlayerDashboardByGeneralSplitsParams,
  [
    "DaysRestPlayerDashboard",
    "LocationPlayerDashboard",
    "MonthPlayerDashboard",
    "OverallPlayerDashboard",
    "PrePostAllStarPlayerDashboard",
    "StartingPostition",
    "WinsLossesPlayerDashboard",
  ],
  [
    typeof playerBaseSplits,
    typeof playerBaseSplits,
    typeof playerBaseSplits,
    typeof playerBaseSplits,
    typeof playerBaseSplits,
    typeof playerBaseSplits,
    typeof playerBaseSplits,
  ],
  string | number
>;

export type TeamGameLogsParams = {
  DateFrom?: string;
  DateTo?: string;
  GameSegment?: GameSegment;
  LastNGames?: string;
  LeagueID?: LeagueID;
  Location?: Location;
  MeasureType?: MeasureType;
  Month?: string;
  OppTeamID?: string;
  Outcome?: Outcome;
  PORound?: string;
  PerMode?: PerMode;
  Period?: string;
  PlayerID?: string;
  Season?: Season;
  SeasonSegment?: SeasonSegment;
  SeasonType?: SeasonType;
  ShotClockRange?: ShotClockRange;
  TeamID?: string;
  VsConference?: Conference;
  VsDivision?: Division;
};

export const teamGameLogsKeys = [
  "SEASON_YEAR",
  "TEAM_ID",
  "TEAM_ABBREVIATION",
  "TEAM_NAME",
  "GAME_ID",
  "GAME_DATE",
  "MATCHUP",
  "WL",
  "MIN",
  "FGM",
  "FGA",
  "FG_PCT",
  "FG3M",
  "FG3A",
  "FG3_PCT",
  "FTM",
  "FTA",
  "FT_PCT",
  "OREB",
  "DREB",
  "REB",
  "AST",
  "TOV",
  "STL",
  "BLK",
  "BLKA",
  "PF",
  "PFD",
  "PTS",
  "PLUS_MINUS",
  "GP_RANK",
  "W_RANK",
  "L_RANK",
  "W_PCT_RANK",
  "MIN_RANK",
  "FGM_RANK",
  "FGA_RANK",
  "FG_PCT_RANK",
  "FG3M_RANK",
  "FG3A_RANK",
  "FG3_PCT_RANK",
  "FTM_RANK",
  "FTA_RANK",
  "FT_PCT_RANK",
  "OREB_RANK",
  "DREB_RANK",
  "REB_RANK",
  "AST_RANK",
  "TOV_RANK",
  "STL_RANK",
  "BLK_RANK",
  "BLKA_RANK",
  "PF_RANK",
  "PFD_RANK",
  "PTS_RANK",
  "PLUS_MINUS_RANK",
] as const;

export type TeamGameLogsResponse = NBA_API_Response<
  "teamgamelogs",
  TeamGameLogsParams,
  ["TeamGameLogs"],
  [typeof teamGameLogsKeys],
  string | number
>;

export type GameBoxScoreParams = {
  EndPeriod: string;
  EndRange: string;
  GameID: string;
  RangeType: string;
  StartPeriod: string;
  StartRange: string;
};

export const baseBoxScoreStats = [
  "GAME_ID",
  "TEAM_ID",
  "TEAM_ABBREVIATION",
  "TEAM_CITY",
  "MIN",
  "FGM",
  "FGA",
  "FG_PCT",
  "FG3M",
  "FG3A",
  "FG3_PCT",
  "FTM",
  "FTA",
  "FT_PCT",
  "OREB",
  "DREB",
  "REB",
  "AST",
  "STL",
  "BLK",
  "TO",
  "PF",
  "PTS",
  "PLUS_MINUS",
] as const;

export type GameBoxScoreResponse = NBA_API_Response<
  "boxscoretraditionalv2",
  GameBoxScoreParams,
  ["PlayerStats", "TeamStarterBenchStats", "TeamStats"],
  [
    [
      ...typeof baseBoxScoreStats,
      "PLAYER_ID",
      "PLAYER_NAME",
      "START_POSITION",
      "COMMENT",
    ],
    [...typeof baseBoxScoreStats, "TEAM_NAME", "STARTERS_BENCH"],
    [...typeof baseBoxScoreStats, "TEAM_NAME"],
  ],
  string | number
>;

export type LeagueGameLogParams = {
  DateFrom?: string;
  DateTo?: string;
  LeagueID: LeagueID;
  PlayerOrTeam: PlayerOrTeam;
  Season: Season;
  SeasonType: SeasonType;
  Sorter: Sorter;
  Direction: Direction;
};

export type LeagueGameLogResponse = NBA_API_Response<
  "leaguegamelog",
  LeagueGameLogParams,
  ["LeagueGameLog"],
  [
    [
      "SEASON_ID",
      "TEAM_ID",
      "TEAM_ABBREVIATION",
      "TEAM_NAME",
      "GAME_ID",
      "GAME_DATE",
      "MATCHUP",
      "WL",
      "MIN",
      "FGM",
      "FGA",
      "FG_PCT",
      "FG3M",
      "FG3A",
      "FG3_PCT",
      "FTM",
      "FTA",
      "FT_PCT",
      "OREB",
      "DREB",
      "REB",
      "AST",
      "STL",
      "BLK",
      "TOV",
      "PF",
      "PTS",
      "PLUS_MINUS",
      "VIDEO_AVAILABLE",
    ],
  ],
  string | number
>;

export type ShotChartDetailParams = {
  LeagueID: LeagueID;
  Season: Season;
  SeasonType: SeasonType;
  TeamID: string;
  PlayerID: string;
  GameID: string;
  Month: string;
  OpponentTeamID: string;
  Period: string;
  LastNGames: string;
  ContextMeasure: ContextMeasure;
  ContextFilter?: string;
  Outcome?: Outcome;
  Location?: Location;
  SeasonSegment?: SeasonSegment;
  DateFrom?: string;
  DateTo?: string;
  VsConference?: Conference;
  VsDivision?: Division;
  Position?: PlayerPositionNullable;
  RookieYear?: Season;
  GameSegment?: GameSegment;
  ClutchTime?: ClutchTime;
  AheadBehind?: AheadBehind;
  PointDiff?: string;
  RangeType?: string;
  StartPeriod?: string;
  EndPeriod?: string;
  StartRange?: string;
  EndRange?: string;
};

export type ShotChartDetailResponse = NBA_API_Response<
  "shotchartdetail",
  ShotChartDetailParams,
  ["LeagueAverages", "Shot_Chart_Detail"],
  [
    [
      "GRID_TYPE",
      "SHOT_ZONE_BASIC",
      "SHOT_ZONE_AREA",
      "SHOT_ZONE_RANGE",
      "FGA",
      "FGM",
      "FG_PCT",
    ],
    [
      "GRID_TYPE",
      "GAME_ID",
      "GAME_EVENT_ID",
      "PLAYER_ID",
      "PLAYER_NAME",
      "TEAM_ID",
      "TEAM_NAME",
      "PERIOD",
      "MINUTES_REMAINING",
      "SECONDS_REMAINING",
      "EVENT_TYPE",
      "ACTION_TYPE",
      "SHOT_TYPE",
      "SHOT_ZONE_BASIC",
      "SHOT_ZONE_AREA",
      "SHOT_ZONE_RANGE",
      "SHOT_DISTANCE",
      "LOC_X",
      "LOC_Y",
      "SHOT_ATTEMPTED_FLAG",
      "SHOT_MADE_FLAG",
      "GAME_DATE",
      "HTM",
      "VTM",
    ],
  ],
  string | number
>;

export type LeagueWideShotChartParams = {
  LeagueID: LeagueID;
  Season: Season;
};

export type LeagueWideShotChartResponse = NBA_API_Response<
  "shotchartleaguewide",
  LeagueWideShotChartParams,
  ["League_Wide"],
  [
    [
      "GRID_TYPE",
      "SHOT_ZONE_BASIC",
      "SHOT_ZONE_AREA",
      "SHOT_ZONE_RANGE",
      "FGA",
      "FGM",
      "FG_PCT",
    ],
  ],
  string | number
>;

export type PlayByBlayParams = {
  GameID: string;
  StartPeriod: string;
  EndPeriod: string;
};

export type PlayByPlayResponse = NBA_API_Response<
  "playbyplay",
  PlayByBlayParams,
  ["AvailableVideo", "PlayByPlay"],
  [
    ["VIDEO_AVAILABLE_FLAG"],
    [
      "GAME_ID",
      "EVENTNUM",
      "EVENTMSGTYPE",
      "EVENTMSGACTIONTYPE",
      "PERIOD",
      "WCTIMESTRING",
      "PCTIMESTRING",
      "HOMEDESCRIPTION",
      "NEUTRALDESCRIPTION",
      "VISITORDESCRIPTION",
      "SCORE",
      "SCOREMARGIN",
      "PERSON1TYPE",
      "PLAYER1_ID",
      "PLAYER1_NAME",
      "PLAYER1_TEAM_ID",
      "PLAYER1_TEAM_CITY",
      "PLAYER1_TEAM_NICKNAME",
      "PLAYER1_TEAM_ABBREVIATION",
      "PERSON2TYPE",
      "PLAYER2_ID",
      "PLAYER2_NAME",
      "PLAYER2_TEAM_ID",
      "PLAYER2_TEAM_CITY",
      "PLAYER2_TEAM_NICKNAME",
      "PLAYER2_TEAM_ABBREVIATION",
      "PERSON3TYPE",
      "PLAYER3_ID",
      "PLAYER3_NAME",
      "PLAYER3_TEAM_ID",
      "PLAYER3_TEAM_CITY",
      "PLAYER3_TEAM_NICKNAME",
      "PLAYER3_TEAM_ABBREVIATION",
      "VIDEO_AVAILABLE_FLAG",
    ],
  ],
  string | number
>;

export type GameRotationParams = {
  GameID: string;
  LeagueID: LeagueID;
};

export const TeamRotationKeys = [
  "GAME_ID",
  "TEAM_ID",
  "TEAM_CITY",
  "TEAM_NAME",
  "PERSON_ID",
  "PLAYER_FIRST",
  "PLAYER_LAST",
  "IN_TIME_REAL",
  "OUT_TIME_REAL",
  "PLAYER_PTS",
  "PT_DIFF",
  "USG_PCT",
] as const;

export type GameRotationResponse = NBA_API_Response<
  "gamerotation",
  GameRotationParams,
  ["AwayTeam", "HomeTeam"],
  [typeof TeamRotationKeys, typeof TeamRotationKeys],
  string | number
>;

export type GameVideoDetailsParams = {
  ContextMeasure?: ContextMeasure;
  LastNGames: string;
  Month: string;
  OpponentTeamID: string;
  Period: string;
  PlayerID: string;
  Season: Season;
  SeasonType: SeasonType;
  TeamID: string;
  AheadBehind?: AheadBehind;
  ClutchTime?: ClutchTime;
  ContextFilter?: string;
  DateFrom?: string;
  DateTo?: string;
  EndPeriod?: string;
  EndRange?: string;
  GameID?: string;
  GameSegment?: GameSegment;
  LeagueID?: LeagueID;
  Location?: Location;
  Outcome?: Outcome;
  PointDiff?: string;
  Position?: PlayerPositionNullable;
  RangeType?: string;
  RookieYear?: Season;
  SeasonSegment?: SeasonSegment;
  StartPeriod?: string;
  StartRange?: string;
  VsConference?: Conference;
  VsDivision?: Division;
};

export type GameVideoDetailsResponse = {
  resource: "videodetails";
  parameters: GameVideoDetailsParams;
  resultSets: {
    Meta: {
      videoUrls: {
        uuid: string;
        sdur: number;
        surl: string;
        sth: string;
        mdur: number;
        murl: string;
        mth: string;
        ldur: number;
        lurl: string;
        lth: string;
        vtt: string;
        scc: string;
        srt: string;
      }[];
    };
    playlist: {
      gi: string; // Game ID
      ei: number; // Event ID
      y: number; // Year
      m: string; // Month
      d: string; // Day
      gc: string; // {date}/{va}{ha}
      p: number; // Period
      dsc: string; // Description
      ha: string; // Home Team Abbreviation
      hid: number; // Home Team ID
      va: string; // Visitor Team Abbreviation
      vid: number; // Visitor Team ID
      hpb: number; // Home Team Points Before
      hpa: number; // Home Team Points After
      vpb: number; // Visitor Team Points Before
      vpa: number; // Visitor Team Points After
      pta: number;
    }[];
  };
};

export type ScoreboardV2Params = {
  DayOffset: string;
  GameDate: string;
  LeagueID: LeagueID;
};

export type ScoreboardV2Response = NBA_API_Response<
  "scoreboardv2",
  ScoreboardV2Params,
  [
    "GameHeader",
    "LineScore",
    "SeriesStandings",
    "LastMeeting",
    "EastConfStandingsByDay",
    "WestConfStandingsByDay",
    "Available",
    "TeamLeaders",
    "TicketLinks",
  ],
  [
    [
      "GAME_DATE_EST",
      "GAME_SEQUENCE",
      "GAME_ID",
      "GAME_STATUS_ID",
      "GAME_STATUS_TEXT",
      "GAMECODE",
      "HOME_TEAM_ID",
      "VISITOR_TEAM_ID",
      "SEASON",
      "LIVE_PERIOD",
      "LIVE_PC_TIME",
      "NATL_TV_BROADCASTER_ABBREVIATION",
      "HOME_TV_BROADCASTER_ABBREVIATION",
      "AWAY_TV_BROADCASTER_ABBREVIATION",
      "LIVE_PERIOD_TIME_BCAST",
      "ARENA_NAME",
      "WH_STATUS",
      "WNBA_COMMISSIONER_FLAG",
    ],
    [
      "GAME_DATE_EST",
      "GAME_SEQUENCE",
      "GAME_ID",
      "TEAM_ID",
      "TEAM_ABBREVIATION",
      "TEAM_CITY_NAME",
      "TEAM_NAME",
      "TEAM_WINS_LOSSES",
      "PTS_QTR1",
      "PTS_QTR2",
      "PTS_QTR3",
      "PTS_QTR4",
      "PTS_OT1",
      "PTS_OT2",
      "PTS_OT3",
      "PTS_OT4",
      "PTS_OT5",
      "PTS_OT6",
      "PTS_OT7",
      "PTS_OT8",
      "PTS_OT9",
      "PTS_OT10",
      "PTS",
      "FG_PCT",
      "FT_PCT",
      "FG3_PCT",
      "AST",
      "REB",
      "TOV",
    ],
    [
      "GAME_ID",
      "HOME_TEAM_ID",
      "VISITOR_TEAM_ID",
      "GAME_DATE_EST",
      "HOME_TEAM_WINS",
      "HOME_TEAM_LOSSES",
      "SERIES_LEADER",
    ],
    [
      "GAME_ID",
      "LAST_GAME_ID",
      "LAST_GAME_DATE_EST",
      "LAST_GAME_HOME_TEAM_ID",
      "LAST_GAME_HOME_TEAM_CITY",
      "LAST_GAME_HOME_TEAM_NAME",
      "LAST_GAME_HOME_TEAM_ABBREVIATION",
      "LAST_GAME_HOME_TEAM_POINTS",
      "LAST_GAME_VISITOR_TEAM_ID",
      "LAST_GAME_VISITOR_TEAM_CITY",
      "LAST_GAME_VISITOR_TEAM_NAME",
      "LAST_GAME_VISITOR_TEAM_CITY1",
      "LAST_GAME_VISITOR_TEAM_POINTS",
    ],
    [
      "TEAM_ID",
      "LEAGUE_ID",
      "SEASON_ID",
      "STANDINGSDATE",
      "CONFERENCE",
      "TEAM",
      "G",
      "W",
      "L",
      "W_PCT",
      "HOME_RECORD",
      "ROAD_RECORD",
    ],
    [
      "TEAM_ID",
      "LEAGUE_ID",
      "SEASON_ID",
      "STANDINGSDATE",
      "CONFERENCE",
      "TEAM",
      "G",
      "W",
      "L",
      "W_PCT",
      "HOME_RECORD",
      "ROAD_RECORD",
    ],
    ["GAME_ID", "PT_AVAILABLE"],
    [
      "GAME_ID",
      "TEAM_ID",
      "TEAM_CITY",
      "TEAM_NICKNAME",
      "TEAM_ABBREVIATION",
      "PTS_PLAYER_ID",
      "PTS_PLAYER_NAME",
      "PTS",
      "REB_PLAYER_ID",
      "REB_PLAYER_NAME",
      "REB",
      "AST_PLAYER_ID",
      "AST_PLAYER_NAME",
      "AST",
    ],
    ["GAME_ID", "LEAG_TIX"],
  ],
  string | number
>;

export type LeagueStandingsParams = {
  LeagueID: LeagueID;
  Season: Season;
  SeasonType: SeasonType;
  SeasonYear?: Season;
};

export type LeagueStandingsResponse = NBA_API_Response<
  "leaguestandings",
  LeagueStandingsParams,
  ["Standings"],
  [
    [
      "LeagueID",
      "SeasonID",
      "TeamID",
      "TeamCity",
      "TeamName",
      "Conference",
      "ConferenceRecord",
      "PlayoffRank",
      "ClinchIndicator",
      "Division",
      "DivisionRecord",
      "DivisionRank",
      "WINS",
      "LOSSES",
      "WinPCT",
      "LeagueRank",
      "Record",
      "HOME",
      "ROAD",
      "L10",
      "Last10Home",
      "Last10Road",
      "OT",
      "ThreePTSOrLess",
      "TenPTSOrMore",
      "LongHomeStreak",
      "strLongHomeStreak",
      "LongRoadStreak",
      "strLongRoadStreak",
      "LongWinStreak",
      "LongLossStreak",
      "CurrentHomeStreak",
      "strCurrentHomeStreak",
      "CurrentRoadStreak",
      "strCurrentRoadStreak",
      "CurrentStreak",
      "strCurrentStreak",
      "ConferenceGamesBack",
      "DivisionGamesBack",
      "ClinchedConferenceTitle",
      "ClinchedDivisionTitle",
      "ClinchedPlayoffBirth",
      "EliminatedConference",
      "EliminatedDivision",
      "AheadAtHalf",
      "BehindAtHalf",
      "TiedAtHalf",
      "AheadAtThird",
      "BehindAtThird",
      "TiedAtThird",
      "Score100PTS",
      "OppScore100PTS",
      "OppOver500",
      "LeadInFGPCT",
      "LeadInReb",
      "FewerTurnovers",
      "PointsPG",
      "OppPointsPG",
      "DiffPointsPG",
      "vsEast",
      "vsAtlantic",
      "vsCentral",
      "vsSoutheast",
      "vsWest",
      "vsNorthwest",
      "vsPacific",
      "vsSouthwest",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "PreAS",
      "PostAS",
    ],
  ],
  string | number
>;
