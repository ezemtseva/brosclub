"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { PLAYER_COLORS } from "../lib/teamColors"

const PLAYERS = ["Vanilla", "Choco", "Panda"] as const
type Player = (typeof PLAYERS)[number]

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
  initialMatches: PlMatch[]
}

function isLocked(kickoff: string): boolean {
  return new Date() > new Date(new Date(kickoff).getTime() + 10 * 60 * 1000)
}

function formatKickoff(kickoff: string): string {
  const d = new Date(kickoff)
  // Formatted in two calls on purpose: asking for date and time together makes
  // newer browsers insert a connector ("21 Aug at 21:00").
  const date = d.toLocaleString("en-GB", { day: "numeric", month: "short" })
  const time = d.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })
  return `${date}, ${time}`
}


/** Live and Half Time share a colour — one is a pause inside the other. */
const STATUS_STYLES: Record<string, string> = {
  Open: "pill-open",
  Finished: "bg-surface-3 text-ink-2",
  Live: "pill-live",
  "Half Time": "pill-live",
  Postponed: "bg-[rgba(255,181,71,0.14)] text-warning",
  Locked: "bg-surface-3 text-ink-dim",
}

function StatusLabel({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-xs uppercase tracking-[0.08em] ${
        STATUS_STYLES[status] ?? "bg-surface-3 text-ink-dim"
      }`}
    >
      {(status === "Live" || status === "Half Time") && (
        <span aria-hidden="true" className="dot blink h-1.5 w-1.5 rounded-full" />
      )}
      {status}
    </span>
  )
}

/** Settled bet: an exact score is a lime chip, a right outcome a grey one,
 *  and a miss is struck through. */
const BET_PILL = "inline-block min-w-[40px] rounded-lg px-2 py-1 font-mono text-sm font-medium"

function betStyle(points: number | null): string {
  if (points === null) return "font-mono text-sm"
  if (points >= 3) return `${BET_PILL} bg-accent text-accent-foreground`
  if (points === 1) return `${BET_PILL} bg-chip text-ink`
  return `${BET_PILL} text-ink-dim line-through`
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
      onSaved()
    }
  }

  // Locked or finished: read-only
  if (finished || locked) {
    return (
      <div className="flex items-center justify-center px-2 py-1">
        {bet && (
          <span className={finished ? betStyle(bet.points) : "font-mono text-sm"}>
            {bet.scoreHome}:{bet.scoreAway}
          </span>
        )}
      </div>
    )
  }

  // Saved and not editing: show score + Edit button
  if (bet && !editing) {
    return (
      <div className="group relative mx-auto flex w-[76px] items-center justify-center">
        <span className="font-mono text-sm">{bet.scoreHome}:{bet.scoreAway}</span>
        <button
          onClick={() => setEditing(true)}
          className="absolute left-full ml-1 text-ink-dim opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
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
  const showSave = home !== "" || away !== "" || bet !== undefined
  const betInput =
    "w-9 rounded-md border border-hairline-strong bg-surface-2 px-1 py-0.5 text-center font-mono text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
  return (
    <div className="relative mx-auto flex w-[76px] items-center justify-center gap-1">
      <input
        type="number"
        min="0"
        max="20"
        value={home}
        onChange={(e) => setHome(e.target.value.slice(0, 2))}
        // A focused number input changes value on wheel by default — drop focus instead
        onWheel={(e) => e.currentTarget.blur()}
        placeholder=""
        className={betInput}
      />
      <span className="text-xs text-ink-dim">:</span>
      <input
        type="number"
        min="0"
        max="20"
        value={away}
        onChange={(e) => setAway(e.target.value.slice(0, 2))}
        onWheel={(e) => e.currentTarget.blur()}
        placeholder=""
        className={betInput}
      />
      <div className="absolute left-full ml-1 flex items-center gap-0.5">
        <button
          onClick={handleSave}
          disabled={saving || (home !== "" && away === "") || (home === "" && away !== "")}
          className={`text-[color:var(--accent-text)] transition-colors hover:text-ink disabled:opacity-30 ${showSave ? "" : "invisible"}`}
        >
          {saving ? "…" : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" ry="3"/>
              <polyline points="6 12 10 16 18 8"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default function PlBetsGameweek({ initialGameweek, initialMatches }: PlBetsGameweekProps) {
  const [gameweek, setGameweek] = useState(initialGameweek)
  const [matches, setMatches] = useState<PlMatch[]>(initialMatches)
  const [refreshing, setRefreshing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const initialLoad = useRef(true)
  const matchesRef = useRef(matches)
  matchesRef.current = matches
  const [toast, setToast] = useState("")

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  const fetchMatches = useCallback(async () => {
    if (initialLoad.current) {
      initialLoad.current = false
      return
    }
    setRefreshing(true)
    const res = await fetch(`/api/pl-bets?gameweek=${gameweek}`)
    const data = await res.json()
    setMatches(Array.isArray(data) ? data : [])
    setRefreshing(false)
  }, [gameweek])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  // Live score polling — interval always runs, checks inside using ref for fresh data
  useEffect(() => {
    const liveRefresh = async () => {
      const now = Date.now()
      const shouldPoll = matchesRef.current.some((m) => {
        const kickoff = new Date(m.kickoff).getTime()
        return kickoff <= now + 2 * 60 * 60 * 1000
          && m.status !== "FINISHED"
          && m.status !== "POSTPONED"
      })
      if (!shouldPoll) return
      await fetch("/api/pl-live")
      const res = await fetch(`/api/pl-bets?gameweek=${gameweek}`)
      const data = await res.json()
      if (Array.isArray(data)) setMatches(data)
    }
    liveRefresh()
    const interval = setInterval(liveRefresh, 60 * 1000)
    return () => clearInterval(interval)
  }, [gameweek])

  const handleSync = async () => {
    setSyncing(true)
    const res = await fetch("/api/pl-sync?full=true")
    const data = await res.json()
    setSyncing(false)
    if (data.ok) { await fetchMatches(); showToast(`Synced ${data.synced} fixtures`) }
    else showToast(`Sync failed: ${data.error}`)
  }


  const navButton =
    "inline-flex min-h-[44px] items-center justify-center rounded-full border border-hairline-strong px-4 text-sm text-ink transition-colors hover:border-ink disabled:opacity-30"

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Phones: "Bets" with the gameweek on the right, set like the GW beside
            "Standings" above; wider screens keep "Gameweek N" */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 font-display text-2xl font-bold">
            <span className="md:hidden">Bets</span>
            <span className="hidden md:inline">Gameweek {gameweek}</span>
          </h2>
          <p className="m-0 font-display text-xl font-bold leading-none md:hidden">
            GW <span className="text-[color:var(--accent-text)]">{gameweek}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setGameweek(1)} disabled={gameweek === 1} className={navButton}>
            «
          </button>
          <button
            onClick={() => setGameweek((g) => Math.max(1, g - 1))}
            disabled={gameweek === 1}
            className={navButton}
          >
            ← Prev
          </button>
          <button
            onClick={() => setGameweek(initialGameweek)}
            disabled={gameweek === initialGameweek}
            className={`${navButton} border-ink bg-ink font-semibold text-night hover:border-ink`}
          >
            Current
          </button>
          <button
            onClick={() => setGameweek((g) => Math.min(38, g + 1))}
            disabled={gameweek === 38}
            className={navButton}
          >
            Next →
          </button>
          <button onClick={() => setGameweek(38)} disabled={gameweek === 38} className={navButton}>
            »
          </button>
          <button onClick={handleSync} disabled={syncing} className={`hidden ${navButton}`}>
            {syncing ? "Syncing..." : "Sync"}
          </button>
        </div>
      </div>

      {toast && <p className="mb-3 font-mono text-sm text-[color:var(--accent-text)]">{toast}</p>}

      {matches.length === 0 ? (
        <p className="text-sm text-ink-muted">No fixtures for GW{gameweek}.</p>
      ) : (
        <div
          className={`bets-gameweek-table overflow-x-auto rounded-[20px] border border-hairline bg-surface transition-opacity duration-150 ${
            refreshing ? "opacity-50" : "opacity-100"
          }`}
        >
          <table className="w-full min-w-max">
            <thead className="table-head">
              <tr className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
                <th className="w-[130px] border-b border-hairline px-5 py-3.5 text-left font-medium">Kick-off</th>
                <th className="w-[170px] whitespace-nowrap border-b border-hairline px-3 py-3.5 text-left font-medium">Home</th>
                <th className="w-px whitespace-nowrap border-b border-hairline px-2 py-3.5 text-center font-medium">Score</th>
                <th className="w-[170px] whitespace-nowrap border-b border-hairline px-3 py-3.5 text-right font-medium">Away</th>
                <th className="w-[170px] whitespace-nowrap border-b border-hairline px-4 py-3.5 text-center font-medium">Status</th>
                {PLAYERS.map((p) => (
                  <th key={p} className="w-[170px] whitespace-nowrap border-b border-hairline px-4 py-3.5 text-center font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: PLAYER_COLORS[p] }}
                      />
                      {p}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-base text-ink-2">
              {matches.map((match) => {
                const locked = isLocked(match.kickoff)
                const finished = match.status === "FINISHED"
                const postponed = match.status === "POSTPONED"
                const inPlay = match.status === "IN_PLAY" || match.status === "PAUSED"
                const showScore = (finished || inPlay) && match.scoreHome !== null && match.scoreAway !== null
                return (
                  <tr key={match.matchId} className="h-[52px]">
                    <td className="w-[130px] whitespace-nowrap border-b border-hairline-row px-5 py-3 font-mono text-[13px] text-ink-muted">
                      {formatKickoff(match.kickoff)}
                    </td>
                    <td className="whitespace-nowrap border-b border-hairline-row px-3 py-3">
                      <span className="flex items-center justify-start gap-2">
                        {match.homeCrest && <Image src={match.homeCrest} alt={match.homeTeam} width={18} height={18} className="h-[18px] w-[18px] shrink-0 object-contain" />}
                        <span className={finished && match.scoreHome! > match.scoreAway! ? "font-semibold text-ink" : ""}>{match.homeTeam}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap border-b border-hairline-row px-2 py-3 text-center">
                      {showScore ? (
                        <span
                          className={`inline-block rounded-lg px-2.5 py-1 font-mono text-[15px] font-medium ${
                            inPlay ? "pill-live" : "bg-surface-3 text-ink"
                          }`}
                        >
                          {match.scoreHome}:{match.scoreAway}
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-ink-dim">vs</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap border-b border-hairline-row px-3 py-3">
                      <span className="flex items-center justify-end gap-2">
                        <span className={finished && match.scoreAway! > match.scoreHome! ? "font-semibold text-ink" : ""}>{match.awayTeam}</span>
                        {match.awayCrest && <Image src={match.awayCrest} alt={match.awayTeam} width={18} height={18} className="h-[18px] w-[18px] shrink-0 object-contain" />}
                      </span>
                    </td>
                    <td className="whitespace-nowrap border-b border-hairline-row px-4 py-3 text-center">
                      <StatusLabel
                        status={
                          finished
                            ? "Finished"
                            : postponed
                              ? "Postponed"
                              : match.status === "PAUSED" &&
                                  Date.now() - new Date(match.kickoff).getTime() < 63 * 60 * 1000
                                ? "Half Time"
                                : inPlay
                                  ? "Live"
                                  : locked
                                    ? "Locked"
                                    : "Open"
                        }
                      />
                    </td>
                    {PLAYERS.map((player) => (
                      <td key={player} className="border-b border-hairline-row px-4 py-3 text-center">
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
