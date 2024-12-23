import { type PlayByPlay } from "~/server/db/types";

// Helper to determine if a play is a scoring play
function isScorePlay(play: PlayByPlay): boolean {
  // These event types typically represent scoring events
  const scoringEventTypes = [1, 3]; // Made field goal, free throw
  return scoringEventTypes.includes(play.EVENTMSGTYPE) && play.SCORE !== null;
}

interface Run {
  startEvent: number;
  endEvent: number;
  period: number;
  teamId: number;
  teamAbbr: string;
  runScore: number;
  opponentScore: number;
}

interface ScoringPlay {
  teamId: number;
  teamAbbr: string;
  points: number;
  eventNum: number;
  period: number;
  isFreeThrow: boolean;
  previousEventNum: number | null; // To link consecutive free throws
}

function findRuns(plays: PlayByPlay[]): Run[] {
  const runs: Run[] = [];
  let currentRun: Run | null = null;
  let lastTwoScores: ScoringPlay[] = [];
  let consecutiveFreeThrows: ScoringPlay[] = [];

  function getPoints(play: PlayByPlay): number {
    if (play.EVENTMSGTYPE === 3) return 1; // Free throw
    return play.HOMEDESCRIPTION?.includes("3PT") ||
      play.VISITORDESCRIPTION?.includes("3PT")
      ? 3
      : 2;
  }

  function addScoringPlay(play: PlayByPlay) {
    const scoringPlay: ScoringPlay = {
      teamId: play.PLAYER1_TEAM_ID!,
      teamAbbr: play.PLAYER1_TEAM_ABBREVIATION!,
      points: getPoints(play),
      eventNum: play.EVENTNUM,
      period: play.PERIOD,
      isFreeThrow: play.EVENTMSGTYPE === 2,
      previousEventNum: null,
    };

    // Handle free throws
    if (scoringPlay.isFreeThrow) {
      const lastFT = consecutiveFreeThrows[consecutiveFreeThrows.length - 1];

      // Check if this is part of the same free throw sequence
      if (
        lastFT &&
        lastFT.teamId === scoringPlay.teamId &&
        lastFT.period === scoringPlay.period &&
        scoringPlay.eventNum - lastFT.eventNum <= 2
      ) {
        // Allow for one potential play in between (like a timeout)

        consecutiveFreeThrows.push(scoringPlay);
        return; // Don't add individual free throws to lastTwoScores
      } else {
        // If we had previous free throws, add them as one play
        if (consecutiveFreeThrows.length > 0) {
          const combinedFT: ScoringPlay = {
            ...consecutiveFreeThrows[0]!,
            points: consecutiveFreeThrows.reduce(
              (sum, ft) => sum + ft.points,
              0,
            ),
          };
          lastTwoScores.push(combinedFT);
          if (lastTwoScores.length > 2) lastTwoScores.shift();
        }
        // Start new free throw sequence
        consecutiveFreeThrows = [scoringPlay];
        return;
      }
    } else {
      // If we had free throws before this shot, add them as one play
      if (consecutiveFreeThrows.length > 0) {
        const combinedFT: ScoringPlay = {
          ...consecutiveFreeThrows[0]!,
          points: consecutiveFreeThrows.reduce((sum, ft) => sum + ft.points, 0),
        };
        lastTwoScores.push(combinedFT);
        if (lastTwoScores.length > 2) lastTwoScores.shift();
        consecutiveFreeThrows = [];
      }
    }

    // Add non-free-throw plays normally
    if (!scoringPlay.isFreeThrow) {
      lastTwoScores.push(scoringPlay);
      if (lastTwoScores.length > 2) lastTwoScores.shift();
    }
  }

  for (const play of plays) {
    // Skip non-scoring plays
    if (!isScorePlay(play)) continue;

    // If period changed, reset tracking arrays
    if (
      lastTwoScores.length > 0 &&
      play.PERIOD !== lastTwoScores.at(-1)!.period
    ) {
      if (currentRun) {
        // Remove opponent scores from current run
        if (
          lastTwoScores.length > 0 &&
          lastTwoScores.at(-1)?.teamId !== currentRun.teamId
        ) {
          currentRun.opponentScore -= lastTwoScores.at(-1)!.points;
        }

        if (
          lastTwoScores.length > 1 &&
          lastTwoScores[0]!.teamId !== currentRun.teamId
        ) {
          currentRun.opponentScore -= lastTwoScores[0]!.points;
        }

        runs.push(currentRun);
        currentRun = null;
      }
      lastTwoScores = [];
      consecutiveFreeThrows = [];
    }

    addScoringPlay(play);

    // Check for two straight scores from same team to start a run
    if (!currentRun && lastTwoScores.length === 2) {
      if (lastTwoScores[0]!.teamId === lastTwoScores[1]!.teamId) {
        currentRun = {
          startEvent: lastTwoScores[0]!.eventNum,
          endEvent: play.EVENTNUM,
          period: play.PERIOD,
          teamId: lastTwoScores[0]!.teamId,
          teamAbbr: lastTwoScores[0]!.teamAbbr,
          runScore: lastTwoScores[0]!.points + lastTwoScores[1]!.points,
          opponentScore: 0,
        };
      }
      continue;
    }

    const points = getPoints(play);

    // If we have an active run
    if (currentRun) {
      // Add points to appropriate team
      if (play.PLAYER1_TEAM_ID === currentRun.teamId) {
        currentRun.runScore += points;
        currentRun.endEvent = play.EVENTNUM;
      } else {
        currentRun.opponentScore += points;
      }

      // Check if opponent scored on two straight possessions
      if (
        lastTwoScores.length === 2 &&
        lastTwoScores[0]!.teamId !== currentRun.teamId &&
        lastTwoScores[1]!.teamId !== currentRun.teamId
      ) {
        // Maximize differential by removing both opponent scores
        currentRun.opponentScore -= lastTwoScores[0]!.points;
        currentRun.opponentScore -= lastTwoScores[1]!.points;
        runs.push(currentRun);
        currentRun = null;

        // Start opponent run
        currentRun = {
          startEvent: lastTwoScores[0]!.eventNum,
          endEvent: play.EVENTNUM,
          period: play.PERIOD,
          teamId: lastTwoScores[0]!.teamId,
          teamAbbr: lastTwoScores[0]!.teamAbbr,
          runScore: lastTwoScores[0]!.points + lastTwoScores[1]!.points,
          opponentScore: 0,
        };
      }
    }
  }

  // Handle any remaining free throws and current run
  if (consecutiveFreeThrows.length > 0) {
    const combinedFT: ScoringPlay = {
      ...consecutiveFreeThrows[0]!,
      points: consecutiveFreeThrows.reduce((sum, ft) => sum + ft.points, 0),
    };
    lastTwoScores.push(combinedFT);
  }

  if (currentRun) {
    runs.push(currentRun);
  }

  return runs.filter((run) => run.runScore - run.opponentScore > 4);
}

export default findRuns;
