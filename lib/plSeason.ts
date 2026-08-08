/**
 * The Premier League season the Bets cup is currently running.
 *
 * Everything that reads `PlMatch` / `PlBet` must use this — the season used to
 * be hardcoded in several files, which silently left the gameweek block showing
 * last season's fixtures. Bump this once when a new season starts.
 *
 * Writes go through /api/pl-sync, which derives the season from the FPL feed,
 * so after a rollover the two must agree for the new fixtures to show up.
 */
export const CURRENT_PL_SEASON = "2026/27"
