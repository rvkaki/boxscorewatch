type PlayVideo = {
  url: string;
  thumb: string;
  duration: number;
  subtitle: string;
};

export type PlayByPlay = {
  GAME_ID: string;
  EVENTNUM: number;
  EVENTMSGTYPE: number;
  EVENTMSGACTIONTYPE: number;
  PERIOD: number;
  WCTIMESTRING: string;
  PCTIMESTRING: string;
  HOMEDESCRIPTION: string | null;
  NEUTRALDESCRIPTION: string | null;
  VISITORDESCRIPTION: string | null;
  SCORE: string | null;
  SCOREMARGIN: string | null;
  PERSON1TYPE: number;
  PLAYER1_ID: number;
  PLAYER1_NAME: string | null;
  PLAYER1_TEAM_ID: number | null;
  PLAYER1_TEAM_CITY: string | null;
  PLAYER1_TEAM_NICKNAME: string | null;
  PLAYER1_TEAM_ABBREVIATION: string | null;
  PERSON2TYPE: number;
  PLAYER2_ID: number;
  PLAYER2_NAME: string | null;
  PLAYER2_TEAM_ID: number | null;
  PLAYER2_TEAM_CITY: string | null;
  PLAYER2_TEAM_NICKNAME: string | null;
  PLAYER2_TEAM_ABBREVIATION: string | null;
  PERSON3TYPE: number;
  PLAYER3_ID: number;
  PLAYER3_NAME: string | null;
  PLAYER3_TEAM_ID: number | null;
  PLAYER3_TEAM_CITY: string | null;
  PLAYER3_TEAM_NICKNAME: string | null;
  PLAYER3_TEAM_ABBREVIATION: string | null;
  VIDEO_AVAILABLE_FLAG: boolean;
  video: PlayVideo | null;
};

type GameTeamStats = {
  GAME_ID: string;
  TEAM_ID: number;
  TEAM_NAME: string;
  TEAM_ABBREVIATION: string;
  TEAM_CITY: string;
  MIN: string;
  FGM: number;
  FGA: number;
  FG_PCT: number;
  FG3M: number;
  FG3A: number;
  FG3_PCT: number;
  FTM: number;
  FTA: number;
  FT_PCT: number;
  OREB: number;
  DREB: number;
  REB: number;
  AST: number;
  STL: number;
  BLK: number;
  TO: number;
  PF: number;
  PTS: number;
  PLUS_MINUS: number;
  FB_PTS: number;
  PITP: number;
  SECOND_CHANCE_PTS: number;
  PTS_OFF_TO: number;
};

type GamePlayerStats = {
  GAME_ID: string;
  TEAM_ID: number;
  TEAM_ABBREVIATION: string;
  TEAM_CITY: string;
  PLAYER_ID: number;
  PLAYER_NAME: string;
  NICKNAME: string;
  START_POSITION: string;
  COMMENT: string;
  MIN: string | null;
  FGM: number | null;
  FGA: number | null;
  FG_PCT: number | null;
  FG3M: number | null;
  FG3A: number | null;
  FG3_PCT: number | null;
  FTM: number | null;
  FTA: number | null;
  FT_PCT: number | null;
  OREB: number | null;
  DREB: number | null;
  REB: number | null;
  AST: number | null;
  STL: number | null;
  BLK: number | null;
  TO: number | null;
  PF: number | null;
  PTS: number | null;
  PLUS_MINUS: number | null;
};

type GameStarterBenchStats<T extends "Starters" | "Bench"> = {
  GAME_ID: string;
  TEAM_ID: number;
  TEAM_NAME: string;
  TEAM_ABBREVIATION: string;
  TEAM_CITY: string;
  STARTERS_BENCH: T;
  MIN: string;
  FGM: number;
  FGA: number;
  FG_PCT: number;
  FG3M: number;
  FG3A: number;
  FG3_PCT: number;
  FTM: number;
  FTA: number;
  FT_PCT: number;
  OREB: number;
  DREB: number;
  REB: number;
  AST: number;
  STL: number;
  BLK: number;
  TO: number;
  PF: number;
  PTS: number;
};

type GameRotation = {
  GAME_ID: string;
  TEAM_ID: number;
  TEAM_CITY: string;
  TEAM_NAME: string;
  PERSON_ID: number;
  PLAYER_FIRST: string;
  PLAYER_LAST: string;
  IN_TIME_REAL: number;
  OUT_TIME_REAL: number;
  PLAYER_PTS: number;
  PT_DIFF: number;
  USG_PCT: number;
};

export type DBPlayByPlay = {
  GAME_ID: string;
  playbyplay: PlayByPlay[];
};

export type DBGameStats = {
  GAME_ID: string;
  TEAM_ID: number;
  teamStats: GameTeamStats;
  playerStats: GamePlayerStats[];
  startersStats: GameStarterBenchStats<"Starters">;
  benchStats: GameStarterBenchStats<"Bench">;
};

export type DBGameRotations = {
  GAME_ID: string;
  TEAM_ID: number;
  rotations: GameRotation[];
};

export type DBGame = {
  GAME_ID: string;
  GAME_DATE: string;
  AWAY_TEAM_ID: number;
  AWAY_TEAM_NAME: string;
  AWAY_TEAM_CITY: string;
  AWAY_TEAM_ABBREVIATION: string;
  AWAY_TEAM_PTS: number;
  HOME_TEAM_ID: number;
  HOME_TEAM_NAME: string;
  HOME_TEAM_CITY: string;
  HOME_TEAM_ABBREVIATION: string;
  HOME_TEAM_PTS: number;
};

export type TeamSeasonAverages = {
  GROUP_SET: string;
  GROUP_VALUE: string;
  SEASON_YEAR: string;
  GP: number;
  W: number;
  L: number;
  W_PCT: number;
  MIN: number;
  FGM: number;
  FGA: number;
  FG_PCT: number;
  FG3M: number;
  FG3A: number;
  FG3_PCT: number;
  FTM: number;
  FTA: number;
  FT_PCT: number;
  OREB: number;
  DREB: number;
  REB: number;
  AST: number;
  TOV: number;
  STL: number;
  BLK: number;
  BLKA: number;
  PF: number;
  PFD: number;
  PTS: number;
  PLUS_MINUS: number;
  GP_RANK: number;
  W_RANK: number;
  L_RANK: number;
  W_PCT_RANK: number;
  MIN_RANK: number;
  FGM_RANK: number;
  FGA_RANK: number;
  FG_PCT_RANK: number;
  FG3M_RANK: number;
  FG3A_RANK: number;
  FG3_PCT_RANK: number;
  FTM_RANK: number;
  FTA_RANK: number;
  FT_PCT_RANK: number;
  OREB_RANK: number;
  DREB_RANK: number;
  REB_RANK: number;
  AST_RANK: number;
  TOV_RANK: number;
  STL_RANK: number;
  BLK_RANK: number;
  BLKA_RANK: number;
  PF_RANK: number;
  PFD_RANK: number;
  PTS_RANK: number;
  PLUS_MINUS_RANK: number;
  TEAM_ID: string;
  standardDeviations: Record<string, { value: number; sq_sum: number }>;
};

export type ShotZone =
  | "Restricted Area"
  | "In The Paint (Non-RA)"
  | "Mid-Range"
  | "Left Corner 3"
  | "Right Corner 3"
  | "Above the Break 3";

type TeamShotChart = {
  GRID_TYPE: "Shot Chart Detail";
  GAME_ID: number;
  GAME_EVENT_ID: number;
  PLAYER_ID: number;
  PLAYER_NAME: string;
  TEAM_ID: number;
  TEAM_NAME: string;
  PERIOD: number;
  MINUTES_REMAINING: number;
  SECONDS_REMAINING: number;
  EVENT_TYPE: string;
  ACTION_TYPE: string;
  SHOT_TYPE: string;
  SHOT_ZONE_BASIC: ShotZone;
  SHOT_ZONE_AREA: string;
  SHOT_ZONE_RANGE: string;
  SHOT_DISTANCE: number;
  LOC_X: number;
  LOC_Y: number;
  SHOT_ATTEMPTED_FLAG: 0 | 1;
  SHOT_MADE_FLAG: 0 | 1;
  GAME_DATE: number;
  HTM: string;
  VTM: string;
};

export type DBGameShotChart = {
  GAME_ID: string;
  shotCharts: Record<string, TeamShotChart[]>;
};

type LeagueWideShotChart = {
  GRID_TYPE: "League Averages";
  SHOT_ZONE_BASIC: ShotZone;
  SHOT_ZONE_AREA: string;
  SHOT_ZONE_RANGE: string;
  FGA: number;
  FGM: number;
  FG_PCT: number;
};

export type DBLeagueWideShotChart = {
  League_Wide: LeagueWideShotChart[];
};

type StandingsItem<T extends "East" | "West"> = {
  TEAM_ID: number;
  LEAGUE_ID: "00";
  SEASON_ID: string;
  STANDINGSDATE: string;
  CONFERENCE: T;
  TEAM: string;
  G: number;
  W: number;
  L: number;
  W_PCT: number;
  HOME_RECORD: string;
  ROAD_RECORD: string;
  change: number;
  streak: number;
};
export type DBStandings = {
  east: StandingsItem<"East">[];
  west: StandingsItem<"West">[];
};

export type DBTeam = {
  TEAM_ID: number;
  SEASON_YEAR: string;
  TEAM_CITY: string;
  TEAM_NAME: string;
  TEAM_ABBREVIATION: string;
  TEAM_CONFERENCE: "East" | "West";
  TEAM_DIVISION: string;
  TEAM_CODE: string;
  TEAM_SLUG: string;
  MIN_YEAR: string;
  MAX_YEAR: string;
  W: number;
  L: number;
  W_PCT: number;
};

export type DBNews = {
  date: string;
  title: string;
  imageUrl: string | null;
  link: string;
};
