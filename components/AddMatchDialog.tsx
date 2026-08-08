"use client"

import { useState, useRef } from "react"
import { PLAYER_COLORS } from "../lib/teamColors"
import { useScrollLock } from "../lib/useScrollLock"

interface PlayerTeams {
  Vanilla: string[]
  Choco: string[]
  Panda: string[]
}

interface MatchRecord {
  id?: number
  teamA: string
  scoreA: number
  teamB: string
  scoreB: number
  prediction?: string | null
  createdAt?: string
}

interface AddMatchDialogProps {
  teams: string[]
  playerTeams: PlayerTeams
  /** Teams that went through to round 2 (Season Configuration). Round 2 fixtures
      are only offered between these; round 1 still uses the full list. */
  round2Teams?: PlayerTeams
  playedMatches: MatchRecord[]
  onSuccess: () => void
  onClose: () => void
}

interface TeamSelectProps {
  options: { team: string; matchCount: number }[]
  value: string
  onChange: (val: string) => void
  colorClass: string
  playerTeams: PlayerTeams
}


function getTeamColor(team: string, playerTeams: PlayerTeams): string {
  for (const [player, teams] of Object.entries(playerTeams)) {
    if (teams.includes(team)) return PLAYER_COLORS[player] ?? ""
  }
  return ""
}

function TeamSelect({ options, value, onChange, colorClass, playerTeams }: TeamSelectProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = query
    ? options.filter((o) => o.team.toLowerCase().includes(query.toLowerCase()))
    : options

  const handleSelect = (team: string) => {
    onChange(team)
    setQuery("")
    setOpen(false)
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false)
      setQuery("")
    }
  }

  // Round 1 = 0 matches played, Round 2 = 1 match played
  const round1 = filtered.filter((o) => o.matchCount === 0)
  const round2 = filtered.filter((o) => o.matchCount === 1)

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0" onBlur={handleBlur}>
      <input
        type="text"
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${colorClass}`}
        placeholder={open ? "" : "Select team"}
        value={open ? query : value}
        onFocus={() => { setOpen(true); setQuery("") }}
        onChange={(e) => setQuery(e.target.value)}
      />
      {open && (round1.length > 0 || round2.length > 0) && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {round1.length > 0 && (
            <>
              <li className="px-3 py-1 text-xs text-gray-400 bg-gray-50 font-medium select-none">Round 1</li>
              {round1.map((o) => {
                const color = getTeamColor(o.team, playerTeams)
                return (
                  <li key={o.team} onMouseDown={() => handleSelect(o.team)} className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center gap-1.5">
                    {color && <span className="w-2 h-2 rounded-full flex-none" style={{ backgroundColor: color }} />}
                    {o.team}
                  </li>
                )
              })}
            </>
          )}
          {round2.length > 0 && (
            <>
              <li className="px-3 py-1 text-xs text-gray-400 bg-gray-50 border-t border-gray-100 font-medium select-none">Round 2</li>
              {round2.map((o) => {
                const color = getTeamColor(o.team, playerTeams)
                return (
                  <li key={o.team} onMouseDown={() => handleSelect(o.team)} className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center gap-1.5">
                    {color && <span className="w-2 h-2 rounded-full flex-none" style={{ backgroundColor: color }} />}
                    {o.team}
                  </li>
                )
              })}
            </>
          )}
        </ul>
      )}
    </div>
  )
}

// Weights for blending the two form signals
const TEAM_FORM_WEIGHT = 0.6
const PLAYER_FORM_WEIGHT = 0.4

/** Points from the last 5 of the given matches, newest first. */
function formPoints(relevant: MatchRecord[], pointsFor: (m: MatchRecord) => number) {
  const lastFive = relevant
    .slice()
    // The caller's order is not guaranteed, so sort explicitly — reading the
    // wrong end of this array used to score teams on their oldest games.
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5)
  if (lastFive.length === 0) return null
  return lastFive.reduce((sum, m) => sum + pointsFor(m), 0)
}

function resultPoints(scored: number, conceded: number) {
  return scored > conceded ? 3 : scored === conceded ? 1 : 0
}

// Compute win/draw/loss probabilities from recent team form and recent form of
// the player who owns the team.
function computeOdds(
  teamA: string,
  teamB: string,
  matches: MatchRecord[],
  playerTeams: PlayerTeams
): { probA: number; probDraw: number; probB: number } | null {
  const teamForm = (team: string) =>
    formPoints(
      matches.filter((m) => m.teamA === team || m.teamB === team),
      (m) => (m.teamA === team ? resultPoints(m.scoreA, m.scoreB) : resultPoints(m.scoreB, m.scoreA))
    )

  const playerForm = (team: string) => {
    const player = getPlayer(team, playerTeams)
    if (!player) return null
    const owned = playerTeams[player as keyof PlayerTeams]
    return formPoints(
      matches.filter((m) => owned.includes(m.teamA) || owned.includes(m.teamB)),
      (m) => (owned.includes(m.teamA) ? resultPoints(m.scoreA, m.scoreB) : resultPoints(m.scoreB, m.scoreA))
    )
  }

  const teamA_form = teamForm(teamA)
  const teamB_form = teamForm(teamB)
  if (teamA_form === null || teamB_form === null) return null

  // Fall back to team form alone when a player has no history yet
  const playerA_form = playerForm(teamA) ?? teamA_form
  const playerB_form = playerForm(teamB) ?? teamB_form

  const ptsA = TEAM_FORM_WEIGHT * teamA_form + PLAYER_FORM_WEIGHT * playerA_form
  const ptsB = TEAM_FORM_WEIGHT * teamB_form + PLAYER_FORM_WEIGHT * playerB_form
  const total = ptsA + ptsB || 1

  const rawA = ptsA / total
  const rawB = ptsB / total
  // draw tendency: teams with similar form → more draw probability
  const diff = Math.abs(rawA - rawB)
  const drawBoost = Math.max(0, 0.25 - diff)
  const rawDraw = 0.15 + drawBoost

  const scale = 1 + rawDraw
  const probA    = Math.round((rawA    / scale) * 100)
  const probB    = Math.round((rawB    / scale) * 100)
  const probDraw = 100 - probA - probB

  return { probA, probDraw, probB }
}

// Compute prediction accuracy from past matches that have predictions stored
function computePredictionAccuracy(matches: MatchRecord[]): { correct: number; total: number } | null {
  const withPrediction = matches.filter((m) => m.prediction != null && m.prediction !== "")
  if (withPrediction.length === 0) return null
  let correct = 0
  for (const m of withPrediction) {
    const actual = m.scoreA > m.scoreB ? "A" : m.scoreB > m.scoreA ? "B" : "Draw"
    if (m.prediction === actual) correct++
  }
  return { correct, total: withPrediction.length }
}

// Count matches between two specific teams
function matchCount(teamA: string, teamB: string, matches: MatchRecord[]): number {
  return matches.filter(
    (m) => (m.teamA === teamA && m.teamB === teamB) || (m.teamA === teamB && m.teamB === teamA)
  ).length
}

// Get the player for a team
function getPlayer(team: string, playerTeams: PlayerTeams): string | null {
  for (const [player, teams] of Object.entries(playerTeams)) {
    if (teams.includes(team)) return player
  }
  return null
}

export default function AddMatchDialog({
  teams,
  playerTeams,
  round2Teams,
  playedMatches,
  onSuccess,
  onClose,
}: AddMatchDialogProps) {
  useScrollLock(true)
  const [teamA, setTeamA] = useState("")
  const [teamB, setTeamB] = useState("")
  const [scoreA, setScoreA] = useState("")
  const [scoreB, setScoreB] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const configured = Object.values(playerTeams).some((arr) => arr.length > 0)

  // Round 2 only exists for the teams picked in Season Configuration — while
  // nothing is picked there, no return fixtures are offered at all.
  const inRound2 = (team: string) =>
    !!round2Teams && Object.values(round2Teams).some((ts) => ts.includes(team))
  const odds = teamA && teamB ? computeOdds(teamA, teamB, playedMatches, playerTeams) : null
  const accuracy = computePredictionAccuracy(playedMatches)

  // Predicted outcome based on highest probability
  const predictedOutcome = odds
    ? odds.probA > odds.probB && odds.probA > odds.probDraw
      ? "A"
      : odds.probB > odds.probA && odds.probB > odds.probDraw
      ? "B"
      : "Draw"
    : null

  // How many fixtures a team still has left against the other players' teams
  const remainingFor = (team: string) => {
    const player = getPlayer(team, playerTeams)
    const opponents = configured
      ? Object.entries(playerTeams)
          .filter(([p]) => p !== player)
          .flatMap(([, ts]) => ts)
      : teams.filter((t) => t !== team)

    let unplayed = 0
    let once = 0
    for (const opponent of opponents) {
      const played = matchCount(team, opponent, playedMatches)
      if (played === 0) unplayed++
      else if (played === 1 && inRound2(team) && inRound2(opponent)) once++
    }
    return { unplayed, once }
  }

  // Team A options: a team is listed under every round where it still has
  // fixtures left, so it can appear in both groups at once. No fixtures left in
  // either round means it drops out.
  const teamsForA: { team: string; matchCount: number }[] = (
    configured ? Object.values(playerTeams).flat() : teams
  )
    .filter((t) => t !== teamB)
    .flatMap((t) => {
      const { unplayed, once } = remainingFor(t)
      const entries: { team: string; matchCount: number }[] = []
      if (unplayed > 0) entries.push({ team: t, matchCount: 0 })
      if (once > 0) entries.push({ team: t, matchCount: 1 })
      return entries
    })

  // Build available options for team B given team A selection
  const getTeamsForB = (): { team: string; matchCount: number }[] => {
    if (!teamA) return []
    const playerA = getPlayer(teamA, playerTeams)

    const candidates = configured
      ? Object.entries(playerTeams)
          .filter(([player]) => player !== playerA)
          .flatMap(([, ts]) => ts)
      : teams.filter((t) => t !== teamA)

    return candidates
      .map((t) => ({ team: t, matchCount: matchCount(teamA, t, playedMatches) }))
      .filter(
        (o) =>
          o.matchCount === 0 ||
          // the return fixture is only allowed between round 2 teams
          (o.matchCount === 1 && inRound2(teamA) && inRound2(o.team))
      )
  }

  const teamsForB = getTeamsForB()

  const isValid =
    teamA &&
    teamB &&
    teamA !== teamB &&
    scoreA !== "" &&
    scoreB !== "" &&
    !isNaN(Number(scoreA)) &&
    !isNaN(Number(scoreB)) &&
    Number(scoreA) >= 0 &&
    Number(scoreB) >= 0

  const aScore = Number(scoreA)
  const bScore = Number(scoreB)
  const scoresEntered = scoreA !== "" && scoreB !== ""

  const selectAClass = !scoresEntered
    ? "border-gray-200"
    : aScore > bScore
    ? "border-green-300 bg-green-50"
    : aScore < bScore
    ? "border-red-300 bg-red-50"
    : "border-gray-300 bg-gray-50"

  const selectBClass = !scoresEntered
    ? "border-gray-200"
    : bScore > aScore
    ? "border-green-300 bg-green-50"
    : bScore < aScore
    ? "border-red-300 bg-red-50"
    : "border-gray-300 bg-gray-50"

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    setError("")

    const res = await fetch("/api/fifa-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamA,
        scoreA: Number(scoreA),
        teamB,
        scoreB: Number(scoreB),
        prediction: predictedOutcome,
      }),
    })

    setIsSubmitting(false)

    if (res.ok) {
      onSuccess()
      onClose()
    } else {
      const data = await res.json()
      setError(data.error || "Something went wrong")
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-6">Add Game Result</h2>

        {/* Match row */}
        <div className="flex items-center gap-3 mb-6">
          <TeamSelect
            options={teamsForA}
            value={teamA}
            onChange={(val) => { setTeamA(val); setTeamB("") }}
            colorClass={selectAClass}
            playerTeams={playerTeams}
          />

          <input
            type="number"
            min="0"
            max="99"
            placeholder="0"
            className="w-14 shrink-0 text-center border border-gray-200 rounded-lg px-2 py-2 text-sm font-bold focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value.slice(0, 2))}
          />

          <span className="text-gray-400 font-bold shrink-0">:</span>

          <input
            type="number"
            min="0"
            max="99"
            placeholder="0"
            className="w-14 shrink-0 text-center border border-gray-200 rounded-lg px-2 py-2 text-sm font-bold focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value.slice(0, 2))}
          />

          <TeamSelect
            options={teamsForB}
            value={teamB}
            onChange={setTeamB}
            colorClass={selectBClass}
            playerTeams={playerTeams}
          />
        </div>

        {odds && (
          <div className="mb-5">
            <div className="flex h-2 rounded-full overflow-hidden mb-1.5">
              <div style={{ width: `${odds.probA}%`, backgroundColor: getTeamColor(teamA, playerTeams) || "#9ca3af" }} />
              <div style={{ width: `${odds.probDraw}%` }} className="bg-gray-200" />
              <div style={{ width: `${odds.probB}%`, backgroundColor: getTeamColor(teamB, playerTeams) || "#9ca3af" }} />
            </div>
            <div className="relative flex justify-between text-xs">
              <span className="font-semibold" style={{ color: getTeamColor(teamA, playerTeams) || "#374151" }}>{odds.probA}%</span>
              <span
                className="absolute -translate-x-1/2 text-gray-400"
                style={{ left: `${odds.probA + odds.probDraw / 2}%` }}
              >
                {odds.probDraw}%
              </span>
              <span className="font-semibold" style={{ color: getTeamColor(teamB, playerTeams) || "#374151" }}>{odds.probB}%</span>
            </div>
            {accuracy && (
              <p className="text-sm text-gray-500 text-center mt-1">
                Prediction accuracy: {Math.round((accuracy.correct / accuracy.total) * 100)}%
              </p>
            )}
          </div>
        )}

        {!configured && (
          <p className="text-xs text-amber-600 mb-4 text-center">
            Player setup not configured — showing all teams without filtering
          </p>
        )}

        {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg disabled:opacity-40 hover:bg-gray-700 transition-colors"
          >
            {isSubmitting ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  )
}
