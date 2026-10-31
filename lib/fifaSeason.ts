/**
 * Single source of truth for the running EA FC season. Bump it here when a new
 * season starts — the API routes and the season tabs all read this value, so
 * nothing silently keeps writing into the season that just ended.
 */
export const CURRENT_FIFA_SEASON = "2026/27"
