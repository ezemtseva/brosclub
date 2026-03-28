"use client"

import { useState, useRef } from "react"

interface PlayerTeams {
  Vanilla: string[]
  Choco: string[]
  Panda: string[]
}

interface MatchRecord {
  teamA: string
  teamB: string
}

interface AddMatchDialogProps {
  teams: string[]
  playerTeams: PlayerTeams
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

const PLAYER_COLORS: Record<string, string> = {
  Vanilla: "#ea7878",
  Choco:   "#4b98de",
  Panda:   "#4fcb90",
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
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors ${colorClass}`}
        placeholder="Select team"
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
  playedMatches,
  onSuccess,
  onClose,
}: AddMatchDialogProps) {
  const [teamA, setTeamA] = useState("")
  const [teamB, setTeamB] = useState("")
  const [scoreA, setScoreA] = useState("")
  const [scoreB, setScoreB] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const configured = Object.values(playerTeams).some((arr) => arr.length > 0)

  // Build available options for team A: all teams (or just configured ones)
  const teamsForA: { team: string; matchCount: number }[] = (
    configured
      ? Object.values(playerTeams).flat()
      : teams.filter((t) => t !== teamB)
  )
    .filter((t) => t !== teamB)
    .map((t) => ({ team: t, matchCount: 0 }))

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
      .filter((o) => o.matchCount < 2) // hide pairs that played twice
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
            className="w-14 shrink-0 text-center border border-gray-200 rounded-lg px-2 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value.slice(0, 2))}
          />

          <span className="text-gray-400 font-bold shrink-0">:</span>

          <input
            type="number"
            min="0"
            max="99"
            placeholder="0"
            className="w-14 shrink-0 text-center border border-gray-200 rounded-lg px-2 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
