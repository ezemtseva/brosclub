"use client"

import { useState, useEffect, useCallback } from "react"

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
  return new Date(kickoff).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function toDateKey(kickoff: string): string {
  return new Date(kickoff).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

function PointsBadge({ points }: { points: number }) {
  const style =
    points === 3
      ? "bg-green-100 text-green-700"
      : points === 1
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-400"
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${style}`}>
      {points}pt
    </span>
  )
}

function BetRow({
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
  const [home, setHome] = useState(bet !== undefined ? String(bet.scoreHome) : "")
  const [away, setAway] = useState(bet !== undefined ? String(bet.scoreAway) : "")
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!dirty && bet !== undefined) {
      setHome(String(bet.scoreHome))
      setAway(String(bet.scoreAway))
    }
  }, [bet, dirty])

  const handleSave = async () => {
    if (home === "" || away === "") return
    setSaving(true)
    setError("")
    const res = await fetch("/api/pl-bets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: match.matchId,
        player,
        scoreHome: parseInt(home),
        scoreAway: parseInt(away),
      }),
    })
    setSaving(false)
    if (res.ok) {
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved()
    } else {
      const data = await res.json()
      setError(data.error || "Error")
    }
  }

  const color = PLAYER_COLORS[player]

  const label = (
    <span className="relative text-sm w-16 shrink-0 inline-block">
      {player}
      <span
        className="absolute bottom-[-2px] left-0 w-[0.85em] h-[2px]"
        style={{ backgroundColor: color }}
      />
    </span>
  )

  if (finished) {
    return (
      <div className="flex items-center gap-3 h-8">
        {label}
        {bet ? (
          <div className="flex items-center gap-2">
            <span className="text-sm tabular-nums">
              {bet.scoreHome} : {bet.scoreAway}
            </span>
            {bet.points !== null && <PointsBadge points={bet.points} />}
          </div>
        ) : (
          <span className="text-sm text-gray-300">—</span>
        )}
      </div>
    )
  }

  if (locked) {
    return (
      <div className="flex items-center gap-3 h-8">
        {label}
        {bet ? (
          <span className="text-sm tabular-nums">
            {bet.scoreHome} : {bet.scoreAway}
          </span>
        ) : (
          <span className="text-sm text-gray-300">—</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 h-8">
      {label}
      <input
        type="number"
        min="0"
        max="20"
        value={home}
        onChange={(e) => {
          setHome(e.target.value.slice(0, 2))
          setDirty(true)
        }}
        placeholder="—"
        className="w-10 text-center border border-gray-200 rounded px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="text-gray-300 text-xs">:</span>
      <input
        type="number"
        min="0"
        max="20"
        value={away}
        onChange={(e) => {
          setAway(e.target.value.slice(0, 2))
          setDirty(true)
        }}
        placeholder="—"
        className="w-10 text-center border border-gray-200 rounded px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {home !== "" && away !== "" && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-2 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "..." : saved ? "✓" : "Save"}
        </button>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export default function PlBetsGameweek({ initialGameweek }: PlBetsGameweekProps) {
  const [gameweek, setGameweek] = useState(initialGameweek)
  const [matches, setMatches] = useState<PlMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [settling, setSettling] = useState(false)
  const [toast, setToast] = useState("")

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/pl-bets?gameweek=${gameweek}`)
    const data = await res.json()
    setMatches(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [gameweek])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  const handleSync = async () => {
    setSyncing(true)
    const res = await fetch("/api/pl-sync")
    const data = await res.json()
    setSyncing(false)
    if (data.ok) {
      await fetchMatches()
      showToast(`Synced ${data.synced} fixtures`)
    } else {
      showToast(`Sync failed: ${data.error}`)
    }
  }

  const handleSettle = async () => {
    setSettling(true)
    const res = await fetch("/api/pl-settle")
    const data = await res.json()
    setSettling(false)
    if (data.ok) {
      await fetchMatches()
      showToast(data.settled > 0 ? `Settled ${data.settled} bets` : "Nothing to settle")
    } else {
      showToast(`Error: ${data.error}`)
    }
  }

  // Group matches by date
  const dateGroups: [string, PlMatch[]][] = []
  for (const match of matches) {
    const key = toDateKey(match.kickoff)
    const last = dateGroups[dateGroups.length - 1]
    if (last && last[0] === key) {
      last[1].push(match)
    } else {
      dateGroups.push([key, [match]])
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGameweek((g) => Math.max(1, g - 1))}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
          >
            ←
          </button>
          <span className="font-semibold text-sm w-28 text-center">Gameweek {gameweek}</span>
          <button
            onClick={() => setGameweek((g) => Math.min(38, g + 1))}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
          >
            →
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {syncing ? "Syncing..." : "Sync"}
          </button>
          <button
            onClick={handleSettle}
            disabled={settling}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {settling ? "Settling..." : "Settle"}
          </button>
        </div>
      </div>

      {toast && <p className="text-sm text-green-600 mb-4">{toast}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : matches.length === 0 ? (
        <p className="text-sm text-gray-400">
          No fixtures for GW{gameweek}. Click <strong>Sync</strong> to fetch from football-data.org.
        </p>
      ) : (
        <div className="space-y-8">
          {dateGroups.map(([date, dayMatches]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {date}
              </p>
              <div className="space-y-3">
                {dayMatches.map((match) => {
                  const locked = isLocked(match.kickoff)
                  const finished = match.status === "FINISHED"
                  return (
                    <div key={match.matchId} className="border border-gray-200 rounded-xl p-4">
                      {/* Match info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{match.homeTeam}</span>
                          {finished ? (
                            <span className="font-bold text-sm tabular-nums px-1">
                              {match.scoreHome} : {match.scoreAway}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-sm px-1">vs</span>
                          )}
                          <span className="font-medium text-sm">{match.awayTeam}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                          <span>{formatKickoff(match.kickoff)}</span>
                          {finished ? (
                            <span className="text-green-600 font-medium">Final</span>
                          ) : locked ? (
                            <span className="text-red-400 font-medium">Locked</span>
                          ) : (
                            <span className="text-green-500 font-medium">Open</span>
                          )}
                        </div>
                      </div>

                      {/* Player bet rows */}
                      <div className="space-y-1 pt-1 border-t border-gray-100">
                        {PLAYERS.map((player) => (
                          <BetRow
                            key={player}
                            match={match}
                            player={player}
                            bet={match.bets.find((b) => b.player === player)}
                            locked={locked}
                            finished={finished}
                            onSaved={fetchMatches}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
