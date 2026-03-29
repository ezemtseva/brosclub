"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"

const PLAYERS = ["Vanilla", "Choco", "Panda"] as const
type Player = (typeof PLAYERS)[number]

const PLAYER_COLORS: Record<Player, string> = {
  Vanilla: "#ea7878",
  Choco: "#4b98de",
  Panda: "#4fcb90",
}

interface PlBet {
  id: number
  matchId: number
  player: string
  scoreHome: number
  scoreAway: number
  points: number | null
}

interface PlMatch {
  id: number
  matchId: number
  gameweek: number
  homeTeam: string
  awayTeam: string
  homeCrest: string | null
  awayCrest: string | null
  kickoff: string
  status: string
  scoreHome: number | null
  scoreAway: number | null
  bets: PlBet[]
}

interface PlBetsGameweekProps {
  initialGameweek: number
}

function isLocked(kickoff: string): boolean {
  return new Date() > new Date(new Date(kickoff).getTime() + 10 * 60 * 1000)
}

function formatKickoff(kickoff: string): string {
  const d = new Date(kickoff)
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function betBg(points: number | null): string {
  if (points === 3) return "bg-green-100"
  if (points === 1) return "bg-yellow-100"
  return ""
}

function BetCell({
  match,
  player,
  bet,
  locked,
  finished,
  onSaved,
}: {
  match: PlMatch
  player: Player
  bet: PlBet | undefined
  locked: boolean
  finished: boolean
  onSaved: () => void
}) {
  const [editing, setEditing] = useState(!bet)
  const [home, setHome] = useState(bet !== undefined ? String(bet.scoreHome) : "")
  const [away, setAway] = useState(bet !== undefined ? String(bet.scoreAway) : "")
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (bet !== undefined) {
      setHome(String(bet.scoreHome))
      setAway(String(bet.scoreAway))
      setEditing(false)
    }
  }, [bet])

  const handleSave = async () => {
    setSaving(true)
    const isEmpty = home === "" && away === ""

    const res = await fetch("/api/pl-bets", {
      method: isEmpty ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isEmpty
          ? { matchId: match.matchId, player }
          : { matchId: match.matchId, player, scoreHome: parseInt(home), scoreAway: parseInt(away) }
      ),
    })
    setSaving(false)
    if (res.ok) {
      if (isEmpty) { setHome(""); setAway("") }
      setEditing(isEmpty)
      setDirty(false)
      onSaved()
    }
  }

  // Locked or finished: read-only
  if (finished || locked) {
    return (
      <div className={`flex items-center justify-center rounded px-2 py-1 ${finished && bet ? betBg(bet.points) : ""}`}>
        {bet ? (
          <span className="text-xs md:text-sm tabular-nums">{bet.scoreHome}:{bet.scoreAway}</span>
        ) : (
          <span className="text-xs md:text-sm text-gray-300">—</span>
        )}
      </div>
    )
  }

  // Saved and not editing: show score + Edit button
  if (bet && !editing) {
    return (
      <div className="relative flex items-center justify-center group">
        <span className="text-xs md:text-sm tabular-nums">{bet.scoreHome}:{bet.scoreAway}</span>
        <button
          onClick={() => setEditing(true)}
          className="absolute -right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>
    )
  }

  // Editing or no bet yet: show inputs + Save
  return (
    <div className="flex items-center gap-1 justify-center">
      <input
        type="number"
        min="0"
        max="20"
        value={home}
        onChange={(e) => { setHome(e.target.value.slice(0, 2)); setDirty(true) }}
        placeholder="—"
        className="w-9 text-center border border-gray-200 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="text-gray-300 text-xs">:</span>
      <input
        type="number"
        min="0"
        max="20"
        value={away}
        onChange={(e) => { setAway(e.target.value.slice(0, 2)); setDirty(true) }}
        placeholder="—"
        className="w-9 text-center border border-gray-200 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {dirty && (
        <button
          onClick={handleSave}
          disabled={saving || (home !== "" && away === "") || (home === "" && away !== "")}
          className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
        >
          {saving ? "…" : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" ry="3"/>
              <polyline points="6 12 10 16 18 8"/>
            </svg>
          )}
        </button>
      )}
      {bet && (
        <button onClick={() => { setHome(String(bet.scoreHome)); setAway(String(bet.scoreAway)); setEditing(false); setDirty(false) }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ✕
        </button>
      )}
    </div>
  )
}

export default function PlBetsGameweek({ initialGameweek }: PlBetsGameweekProps) {
  const [gameweek, setGameweek] = useState(initialGameweek)
  const [matches, setMatches] = useState<PlMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const initialLoad = useRef(true)
  const [toast, setToast] = useState("")

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  const fetchMatches = useCallback(async () => {
    if (initialLoad.current) {
      setLoading(true)
      initialLoad.current = false
    } else {
      setRefreshing(true)
    }
    const res = await fetch(`/api/pl-bets?gameweek=${gameweek}`)
    const data = await res.json()
    setMatches(Array.isArray(data) ? data : [])
    setLoading(false)
    setRefreshing(false)
  }, [gameweek])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  const handleSync = async () => {
    setSyncing(true)
    const res = await fetch("/api/pl-sync?full=true")
    const data = await res.json()
    setSyncing(false)
    if (data.ok) { await fetchMatches(); showToast(`Synced ${data.synced} fixtures`) }
    else showToast(`Sync failed: ${data.error}`)
  }


  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGameweek(1)}
            disabled={gameweek === 1}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors text-[1.75rem] font-thin leading-none"
          >
            «
          </button>
          <button
            onClick={() => setGameweek((g) => Math.max(1, g - 1))}
            disabled={gameweek === 1}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors text-[1.75rem] font-thin leading-none"
          >
            ‹
          </button>
          <h2 className="text-title font-bold leading-none m-0">Gameweek {gameweek}</h2>
          <button
            onClick={() => setGameweek((g) => Math.min(38, g + 1))}
            disabled={gameweek === 38}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors text-[1.75rem] font-thin leading-none"
          >
            ›
          </button>
          <button
            onClick={() => setGameweek(38)}
            disabled={gameweek === 38}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors text-[1.75rem] font-thin leading-none"
          >
            »
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSync} disabled={syncing} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            {syncing ? "Syncing..." : "Full Sync"}
          </button>
        </div>
      </div>

      {toast && <p className="text-sm text-green-600 mb-3">{toast}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : matches.length === 0 ? (
        <p className="text-sm text-gray-400">No fixtures for GW{gameweek}. Click <strong>Sync</strong> to fetch.</p>
      ) : (
        <div className={`overflow-x-auto transition-opacity duration-150 ${refreshing ? "opacity-50" : "opacity-100"}`}>
          <table className="w-full bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-xs md:text-sm leading-normal h-[45px]">
                <th className="py-2 px-4 text-left whitespace-nowrap">Date</th>
                <th className="py-2 px-4 text-left whitespace-nowrap">Match</th>
                <th className="py-2 px-4 text-center whitespace-nowrap">Status</th>
                {PLAYERS.map((p) => (
                  <th key={p} className="py-2 px-4 text-center whitespace-nowrap">
                    <span className="relative inline-block text-xs md:text-sm">
                      {p}
                      <span className="absolute bottom-[-2px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS[p] }} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-600 text-xs md:text-sm font-light">
              {matches.map((match) => {
                const locked = isLocked(match.kickoff)
                const finished = match.status === "FINISHED"
                const postponed = match.status === "POSTPONED"
                return (
                  <tr key={match.matchId} className="border-b border-gray-200 h-[45px]">
                    <td className="py-2 px-4 whitespace-nowrap">{formatKickoff(match.kickoff)}</td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`flex items-center gap-1.5 rounded px-1 ${finished && match.scoreHome! > match.scoreAway! ? "bg-green-50" : ""}`}>
                          {match.homeCrest && <Image src={match.homeCrest} alt={match.homeTeam} width={18} height={18} className="shrink-0 object-contain" />}
                          <span className="font-medium text-xs md:text-sm">{match.homeTeam}</span>
                        </span>
                        {finished ? (
                          <span className="mx-1 tabular-nums text-xs md:text-sm">
                            <span className={match.scoreHome! > match.scoreAway! ? "font-bold" : "font-normal"}>{match.scoreHome}</span>
                            <span className="text-gray-300">:</span>
                            <span className={match.scoreAway! > match.scoreHome! ? "font-bold" : "font-normal"}>{match.scoreAway}</span>
                          </span>
                        ) : (
                          <span className="mx-1 text-gray-300 text-xs md:text-sm">vs</span>
                        )}
                        <span className={`flex items-center gap-1.5 rounded px-1 ${finished && match.scoreAway! > match.scoreHome! ? "bg-green-50" : ""}`}>
                          <span className="font-medium text-xs md:text-sm">{match.awayTeam}</span>
                          {match.awayCrest && <Image src={match.awayCrest} alt={match.awayTeam} width={18} height={18} className="shrink-0 object-contain" />}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-center whitespace-nowrap">
                      {finished ? (
                        <span className="text-xs md:text-sm font-medium text-green-600">Finished</span>
                      ) : postponed ? (
                        <span className="text-xs md:text-sm font-medium text-gray-400">Postponed</span>
                      ) : locked ? (
                        <span className="text-xs md:text-sm font-medium text-red-400">Locked</span>
                      ) : (
                        <span className="text-xs md:text-sm font-medium text-green-500">Open</span>
                      )}
                    </td>
                    {PLAYERS.map((player) => (
                      <td key={player} className="py-2 px-4">
                        <BetCell
                          match={match}
                          player={player}
                          bet={match.bets.find((b) => b.player === player)}
                          locked={postponed ? false : locked}
                          finished={finished}
                          onSaved={fetchMatches}
                        />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
