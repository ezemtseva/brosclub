"use client"

import { useState, useRef } from "react"
import { PLAYER_COLORS } from "../lib/teamColors"

const PLAYERS = [
  { name: "Vanilla", color: PLAYER_COLORS.Vanilla },
  { name: "Choco",   color: PLAYER_COLORS.Choco },
  { name: "Panda",   color: PLAYER_COLORS.Panda },
] as const

type PlayerName = "Vanilla" | "Choco" | "Panda"
type PlayerTeams = Record<PlayerName, string[]>

const ROUNDS = ["Round 1", "Round 2"] as const
type Round = (typeof ROUNDS)[number]

interface FifaSeasonConfigProps {
  season: string
  initialPlayerTeams: PlayerTeams
  initialRound2Teams: PlayerTeams
  allTeams: string[]           // existing FifaEntry teams
  onClose: () => void
  onSaved: () => void
}

export default function FifaSeasonConfig({
  season,
  initialPlayerTeams,
  initialRound2Teams,
  allTeams,
  onClose,
  onSaved,
}: FifaSeasonConfigProps) {
  const [playerTeams, setPlayerTeams] = useState<PlayerTeams>(initialPlayerTeams)
  const [round2Teams, setRound2Teams] = useState<PlayerTeams>(initialRound2Teams)
  const [activeRound, setActiveRound] = useState<Round>("Round 1")
  const [queries, setQueries]         = useState<Record<PlayerName, string>>({ Vanilla: "", Choco: "", Panda: "" })
  const [opens, setOpens]             = useState<Record<PlayerName, boolean>>({ Vanilla: false, Choco: false, Panda: false })
  const containerRefs = useRef<Record<PlayerName, HTMLDivElement | null>>({ Vanilla: null, Choco: null, Panda: null })

  // All teams already assigned (to prevent double-assignment)
  const assignedTeams = new Set([...playerTeams.Vanilla, ...playerTeams.Choco, ...playerTeams.Panda])

  const getAvailableTeams = (player: PlayerName, query: string) => {
    const base = allTeams.filter((t) => !assignedTeams.has(t) || playerTeams[player].includes(t))
    const filtered = query ? base.filter((t) => t.toLowerCase().includes(query.toLowerCase())) : base
    // If query doesn't match existing teams, show it as a "new team" option
    const isNew = query.trim() && !allTeams.some((t) => t.toLowerCase() === query.toLowerCase())
    return { filtered, isNew }
  }

  const addTeam = async (player: PlayerName, team: string) => {
    const res = await fetch("/api/fifa-season-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season, player, team, action: "add" }),
    })
    if (res.ok) {
      setPlayerTeams((prev) => ({
        ...prev,
        [player]: [...prev[player].filter((t) => t !== team), team],
      }))
      // Remove from other players if was there
      const others = (["Vanilla", "Choco", "Panda"] as PlayerName[]).filter((p) => p !== player)
      for (const other of others) {
        setPlayerTeams((prev) => ({
          ...prev,
          [other]: prev[other].filter((t) => t !== team),
        }))
      }
    }
    setQueries((prev) => ({ ...prev, [player]: "" }))
    setOpens((prev) => ({ ...prev, [player]: false }))
  }

  const removeTeam = async (player: PlayerName, team: string) => {
    const res = await fetch("/api/fifa-season-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season, player, team, action: "remove" }),
    })
    if (res.ok) {
      setPlayerTeams((prev) => ({ ...prev, [player]: prev[player].filter((t) => t !== team) }))
      // Dropping a team from round 1 drops it from round 2 as well
      setRound2Teams((prev) => ({ ...prev, [player]: prev[player].filter((t) => t !== team) }))
    }
  }

  const toggleRound2 = async (player: PlayerName, team: string) => {
    const include = !round2Teams[player].includes(team)
    const res = await fetch("/api/fifa-season-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season, team, action: "round2", include }),
    })
    if (res.ok) {
      setRound2Teams((prev) => ({
        ...prev,
        [player]: include ? [...prev[player], team] : prev[player].filter((t) => t !== team),
      }))
    }
  }

  const handleBlur = (player: PlayerName, e: React.FocusEvent) => {
    if (!containerRefs.current[player]?.contains(e.relatedTarget as Node)) {
      setOpens((prev) => ({ ...prev, [player]: false }))
      setQueries((prev) => ({ ...prev, [player]: "" }))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Season {season} — Configuration</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Round tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {ROUNDS.map((round) => (
              <button
                key={round}
                onClick={() => setActiveRound(round)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeRound === round
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {round}
              </button>
            ))}
          </nav>
        </div>

        {activeRound === "Round 2" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {PLAYERS.map(({ name, color }) => {
                const player = name as PlayerName
                // Teams that went through are listed first
                const orderedTeams = [
                  ...playerTeams[player].filter((t) => round2Teams[player].includes(t)),
                  ...playerTeams[player].filter((t) => !round2Teams[player].includes(t)),
                ]
                return (
                  <div key={player} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-none" style={{ backgroundColor: color }} />
                      <span className="font-semibold text-[14px]">{player}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {round2Teams[player].length}/{playerTeams[player].length} teams
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 min-h-[120px]">
                      {playerTeams[player].length === 0 && (
                        <p className="text-xs text-gray-400 italic">No round 1 teams yet.</p>
                      )}
                      {orderedTeams.map((team) => {
                        const included = round2Teams[player].includes(team)
                        return (
                          <button
                            key={team}
                            onClick={() => toggleRound2(player, team)}
                            className="flex items-center gap-2 px-2 py-1 rounded-lg text-sm text-left"
                            style={
                              included
                                ? { backgroundColor: `${color}20`, borderLeft: `3px solid ${color}` }
                                : { backgroundColor: "#f9fafb", borderLeft: "3px solid #e5e7eb" }
                            }
                          >
                            <span
                              className="w-4 h-4 rounded flex-none flex items-center justify-center text-[10px] text-white"
                              style={{ backgroundColor: included ? color : "#d1d5db" }}
                            >
                              {included ? "✓" : ""}
                            </span>
                            <span className={included ? "" : "text-gray-400"}>{team}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PLAYERS.map(({ name, color }) => {
            const player = name as PlayerName
            const { filtered, isNew } = getAvailableTeams(player, queries[player])

            return (
              <div key={player} className="flex flex-col gap-3">
                {/* Player header */}
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-none" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-[14px]">{player}</span>
                  <span className="text-xs text-gray-400 ml-auto">{playerTeams[player].length} teams</span>
                </div>

                {/* Team list */}
                <div className="flex flex-col gap-1 min-h-[120px]">
                  {playerTeams[player].map((team) => (
                    <div
                      key={team}
                      className="flex items-center justify-between px-2 py-1 rounded-lg text-sm"
                      style={{ backgroundColor: `${color}20`, borderLeft: `3px solid ${color}` }}
                    >
                      <span>{team}</span>
                      <button
                        onClick={() => removeTeam(player, team)}
                        className="text-gray-400 hover:text-red-500 ml-2 text-xs leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add team input */}
                <div
                  ref={(el) => { containerRefs.current[player] = el }}
                  className="relative"
                  onBlur={(e) => handleBlur(player, e)}
                >
                  <input
                    type="text"
                    placeholder="Add team..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    value={queries[player]}
                    onFocus={() => setOpens((prev) => ({ ...prev, [player]: true }))}
                    onChange={(e) => setQueries((prev) => ({ ...prev, [player]: e.target.value }))}
                  />
                  {opens[player] && (filtered.length > 0 || isNew) && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filtered.map((team) => (
                        <li
                          key={team}
                          onMouseDown={() => addTeam(player, team)}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                        >
                          {team}
                        </li>
                      ))}
                      {isNew && (
                        <li
                          onMouseDown={() => addTeam(player, queries[player].trim())}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 text-blue-600 border-t border-gray-100"
                        >
                          + Add &quot;{queries[player].trim()}&quot; as new team
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={() => { onSaved(); onClose() }}
            className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
