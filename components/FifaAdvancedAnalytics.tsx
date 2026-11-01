"use client"

import React from "react"
import { PLAYER_COLORS, shortenTeamName } from "../lib/teamColors"
import { BearAvatar } from "./Bear"
import { ARCHIVO_CONDENSED, CARD_STRIPES, cardClip } from "../lib/cardFrame"

// ── Types ────────────────────────────────────────────────────────────────────

interface MatchRecord {
  id: number
  teamA: string
  scoreA: number
  teamB: string
  scoreB: number
  prediction?: string | null
  createdAt: string
}

interface PlayerTeams {
  Vanilla: string[]
  Choco: string[]
  Panda: string[]
}

interface FifaAdvancedAnalyticsProps {
  matches: MatchRecord[]
  playerTeams: PlayerTeams
  teamLogos: Record<string, string>
}

type PlayerName = "Vanilla" | "Choco" | "Panda"

interface PlayerStats {
  player: PlayerName
  color: string
  played: number
  wins: number
  draws: number
  losses: number
  gf: number
  ga: number
  gd: number
  pts: number
  cleanSheets: number
  avgScored: number
  avgConceded: number
  form: { result: "W" | "D" | "L"; scored: number; conceded: number; opponent: string }[]
  longestWinStreak: number
  matchResults: { result: "W" | "D" | "L"; createdAt: string }[]
}

interface H2HRecord {
  wins: number
  draws: number
  losses: number
  gf: number
  ga: number
}

type H2HMatrix = Record<PlayerName, Record<PlayerName, H2HRecord>>

interface RecordsData {
  biggestWin: { match: MatchRecord; winner: string; margin: number } | null
  highestScoring: { match: MatchRecord; total: number } | null
  bestAttack: { team: string; gf: number } | null
  bestDefense: { team: string; ga: number } | null
  bestWinRate: { team: string; winRate: number; wins: number; games: number } | null
  longestWinStreak: { player: PlayerName; length: number } | null
  mostCleanSheets: { player: PlayerName; count: number } | null
  longestUnbeaten: { player: PlayerName; length: number } | null
  bestWinRatePlayer: { player: PlayerName; winRate: number; wins: number; games: number } | null
  bestFormPlayer: { player: PlayerName; formPPG: number } | null
}

interface PredictionEntry {
  pair: [PlayerName, PlayerName]
  probA: number
  probDraw: number
  probB: number
}

interface TeamProjection {
  team: string
  player: PlayerName
  color: string
  currentPoints: number
  currentGames: number
  formPPG: number
  overallPPG: number
  projectedPoints: number
  form: { result: "W" | "D" | "L"; scored: number; conceded: number; opponent: string }[]
  trend: "up" | "down" | "stable"
  avgOpponentStrength: number | null
}

// ── Constants ────────────────────────────────────────────────────────────────

const PLAYERS: PlayerName[] = ["Vanilla", "Choco", "Panda"]


const GAMES_PER_PAIR = 2 // each team plays each opponent twice

// ── Pure computation functions ───────────────────────────────────────────────

function getPlayerForTeam(team: string, playerTeams: PlayerTeams): PlayerName | null {
  for (const p of PLAYERS) {
    if (playerTeams[p].includes(team)) return p
  }
  return null
}

function computePlayerStats(matches: MatchRecord[], playerTeams: PlayerTeams): PlayerStats[] {
  const acc: Record<PlayerName, {
    played: number; wins: number; draws: number; losses: number
    gf: number; ga: number; cleanSheets: number
    matchResults: { result: "W" | "D" | "L"; createdAt: string; scored: number; conceded: number; opponent: string }[]
  }> = {
    Vanilla: { played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, cleanSheets: 0, matchResults: [] },
    Choco:   { played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, cleanSheets: 0, matchResults: [] },
    Panda:   { played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, cleanSheets: 0, matchResults: [] },
  }

  for (const m of matches) {
    const pA = getPlayerForTeam(m.teamA, playerTeams)
    const pB = getPlayerForTeam(m.teamB, playerTeams)
    if (!pA || !pB || pA === pB) continue

    const resultA: "W" | "D" | "L" = m.scoreA > m.scoreB ? "W" : m.scoreA === m.scoreB ? "D" : "L"
    const resultB: "W" | "D" | "L" = resultA === "W" ? "L" : resultA === "L" ? "W" : "D"

    acc[pA].played++; acc[pB].played++
    acc[pA].gf += m.scoreA; acc[pA].ga += m.scoreB
    acc[pB].gf += m.scoreB; acc[pB].ga += m.scoreA
    if (resultA === "W") acc[pA].wins++; else if (resultA === "D") acc[pA].draws++; else acc[pA].losses++
    if (resultB === "W") acc[pB].wins++; else if (resultB === "D") acc[pB].draws++; else acc[pB].losses++
    if (m.scoreB === 0) acc[pA].cleanSheets++
    if (m.scoreA === 0) acc[pB].cleanSheets++
    acc[pA].matchResults.push({ result: resultA, createdAt: m.createdAt, scored: m.scoreA, conceded: m.scoreB, opponent: m.teamB })
    acc[pB].matchResults.push({ result: resultB, createdAt: m.createdAt, scored: m.scoreB, conceded: m.scoreA, opponent: m.teamA })
  }

  return PLAYERS.map((p) => {
    const a = acc[p]
    const sorted = [...a.matchResults].sort((x, y) => x.createdAt.localeCompare(y.createdAt))
    const form = sorted.slice(-10).reverse().map((r) => ({ result: r.result, scored: r.scored, conceded: r.conceded, opponent: r.opponent }))

    let longestWinStreak = 0; let cur = 0
    for (const { result } of sorted) {
      if (result === "W") { cur++; longestWinStreak = Math.max(longestWinStreak, cur) } else cur = 0
    }

    return {
      player: p,
      color: PLAYER_COLORS[p],
      played: a.played,
      wins: a.wins,
      draws: a.draws,
      losses: a.losses,
      gf: a.gf,
      ga: a.ga,
      gd: a.gf - a.ga,
      pts: 3 * a.wins + a.draws,
      cleanSheets: a.cleanSheets,
      avgScored: a.played > 0 ? a.gf / a.played : 0,
      avgConceded: a.played > 0 ? a.ga / a.played : 0,
      form,
      longestWinStreak,
      matchResults: sorted.map((r) => ({ result: r.result, createdAt: r.createdAt })),
    }
  })
}

function computeH2HMatrix(matches: MatchRecord[], playerTeams: PlayerTeams): H2HMatrix {
  const empty = (): H2HRecord => ({ wins: 0, draws: 0, losses: 0, gf: 0, ga: 0 })
  const matrix: H2HMatrix = {
    Vanilla: { Vanilla: empty(), Choco: empty(), Panda: empty() },
    Choco:   { Vanilla: empty(), Choco: empty(), Panda: empty() },
    Panda:   { Vanilla: empty(), Choco: empty(), Panda: empty() },
  }

  for (const m of matches) {
    const pA = getPlayerForTeam(m.teamA, playerTeams)
    const pB = getPlayerForTeam(m.teamB, playerTeams)
    if (!pA || !pB || pA === pB) continue

    const r = matrix[pA][pB]
    const rOpp = matrix[pB][pA]
    r.gf += m.scoreA; r.ga += m.scoreB
    rOpp.gf += m.scoreB; rOpp.ga += m.scoreA
    if (m.scoreA > m.scoreB) { r.wins++; rOpp.losses++ }
    else if (m.scoreA === m.scoreB) { r.draws++; rOpp.draws++ }
    else { r.losses++; rOpp.wins++ }
  }

  return matrix
}

function computeRecords(matches: MatchRecord[], playerTeams: PlayerTeams, stats: PlayerStats[]): RecordsData {
  let biggestWin: RecordsData["biggestWin"] = null
  let highestScoring: RecordsData["highestScoring"] = null

  // Per-team goals
  const teamGF: Record<string, number> = {}
  const teamGA: Record<string, number> = {}

  for (const m of matches) {
    const margin = Math.abs(m.scoreA - m.scoreB)
    const total = m.scoreA + m.scoreB
    if (!biggestWin || margin > biggestWin.margin) {
      const winner = m.scoreA > m.scoreB ? m.teamA : m.scoreB > m.scoreA ? m.teamB : "Draw"
      biggestWin = { match: m, winner, margin }
    }
    if (!highestScoring || total > highestScoring.total) {
      highestScoring = { match: m, total }
    }
    teamGF[m.teamA] = (teamGF[m.teamA] ?? 0) + m.scoreA
    teamGF[m.teamB] = (teamGF[m.teamB] ?? 0) + m.scoreB
    teamGA[m.teamA] = (teamGA[m.teamA] ?? 0) + m.scoreB
    teamGA[m.teamB] = (teamGA[m.teamB] ?? 0) + m.scoreA
  }

  // Per-team win rate
  const teamWins: Record<string, number> = {}
  const teamGames: Record<string, number> = {}
  for (const m of matches) {
    teamGames[m.teamA] = (teamGames[m.teamA] ?? 0) + 1
    teamGames[m.teamB] = (teamGames[m.teamB] ?? 0) + 1
    if (m.scoreA > m.scoreB) teamWins[m.teamA] = (teamWins[m.teamA] ?? 0) + 1
    else if (m.scoreB > m.scoreA) teamWins[m.teamB] = (teamWins[m.teamB] ?? 0) + 1
  }

  const allTeams = Object.keys(teamGF)
  const bestAttackTeam = allTeams.sort((a, b) => (teamGF[b] ?? 0) - (teamGF[a] ?? 0))[0]
  const bestDefenseTeam = [...allTeams].sort((a, b) => (teamGA[a] ?? 0) - (teamGA[b] ?? 0))[0]
  const bestWinRateTeam = [...allTeams]
    .filter((t) => (teamGames[t] ?? 0) >= 3)
    .sort((a, b) => ((teamWins[b] ?? 0) / (teamGames[b] ?? 1)) - ((teamWins[a] ?? 0) / (teamGames[a] ?? 1)))[0]

  const byStreak = [...stats].sort((a, b) => b.longestWinStreak - a.longestWinStreak)[0]
  const byCS = [...stats].sort((a, b) => b.cleanSheets - a.cleanSheets)[0]

  // Longest unbeaten streak per player (W or D only) — over all matches
  const byUnbeaten = stats.map((s) => {
    const sorted = [...s.matchResults].sort((x, y) => x.createdAt.localeCompare(y.createdAt))
    let longest = 0, cur = 0
    for (const { result } of sorted) {
      if (result !== "L") { cur++; longest = Math.max(longest, cur) } else cur = 0
    }
    return { player: s.player, length: longest }
  }).sort((a, b) => b.length - a.length)[0]

  const byWinRate = [...stats].filter((s) => s.played >= 3).sort((a, b) => (b.wins / b.played) - (a.wins / a.played))[0]
  const byFormPPG = [...stats].map((s) => {
    const last5 = s.form.slice(0, 5)
    const pts = last5.reduce((acc, f) => acc + (f.result === "W" ? 3 : f.result === "D" ? 1 : 0), 0)
    return { player: s.player, formPPG: last5.length > 0 ? pts / last5.length : 0 }
  }).sort((a, b) => b.formPPG - a.formPPG)[0]

  return {
    biggestWin,
    highestScoring,
    bestAttack: bestAttackTeam ? { team: bestAttackTeam, gf: teamGF[bestAttackTeam] } : null,
    bestDefense: bestDefenseTeam ? { team: bestDefenseTeam, ga: teamGA[bestDefenseTeam] } : null,
    bestWinRate: bestWinRateTeam ? { team: bestWinRateTeam, winRate: (teamWins[bestWinRateTeam] ?? 0) / (teamGames[bestWinRateTeam] ?? 1), wins: teamWins[bestWinRateTeam] ?? 0, games: teamGames[bestWinRateTeam] ?? 0 } : null,
    longestWinStreak: byStreak?.longestWinStreak > 0 ? { player: byStreak.player, length: byStreak.longestWinStreak } : null,
    mostCleanSheets: byCS?.cleanSheets > 0 ? { player: byCS.player, count: byCS.cleanSheets } : null,
    longestUnbeaten: byUnbeaten?.length > 0 ? { player: byUnbeaten.player, length: byUnbeaten.length } : null,
    bestWinRatePlayer: byWinRate ? { player: byWinRate.player, winRate: byWinRate.wins / byWinRate.played, wins: byWinRate.wins, games: byWinRate.played } : null,
    bestFormPlayer: byFormPPG?.formPPG > 0 ? { player: byFormPPG.player, formPPG: byFormPPG.formPPG } : null,
  }
}

function computePredictions(matrix: H2HMatrix, stats: PlayerStats[]): PredictionEntry[] {
  const pairs: [PlayerName, PlayerName][] = [["Vanilla", "Choco"], ["Vanilla", "Panda"], ["Choco", "Panda"]]

  return pairs.map(([pA, pB]) => {
    const h2h = matrix[pA][pB]
    const total = h2h.wins + h2h.draws + h2h.losses

    const h2hWinA  = total > 0 ? h2h.wins   / total : 1 / 3
    const h2hDraw  = total > 0 ? h2h.draws  / total : 1 / 3
    const h2hWinB  = total > 0 ? h2h.losses / total : 1 / 3

    const sA = stats.find((s) => s.player === pA)!
    const sB = stats.find((s) => s.player === pB)!
    const formPts = (form: { result: "W" | "D" | "L" }[]) =>
      form.reduce((s, r) => s + (r.result === "W" ? 3 : r.result === "D" ? 1 : 0), 0)
    const fA = formPts(sA.form)
    const fB = formPts(sB.form)
    const fTotal = fA + fB || 1
    const formWinA = fA / fTotal
    const formWinB = fB / fTotal
    const formDraw = Math.max(0, 1 - formWinA - formWinB)

    const rawA    = 0.6 * h2hWinA + 0.4 * formWinA
    const rawDraw = 0.6 * h2hDraw  + 0.4 * formDraw
    const rawB    = 0.6 * h2hWinB  + 0.4 * formWinB
    const rawTotal = rawA + rawDraw + rawB || 1

    const probA    = Math.round((rawA    / rawTotal) * 100)
    const probB    = Math.round((rawB    / rawTotal) * 100)
    const probDraw = 100 - probA - probB

    return { pair: [pA, pB], probA, probDraw, probB }
  })
}

function computeTeamProjections(matches: MatchRecord[], playerTeams: PlayerTeams): TeamProjection[] {
  const allTeams = [...playerTeams.Vanilla, ...playerTeams.Choco, ...playerTeams.Panda]
  const pairKey = (a: string, b: string) => [a, b].sort().join("|||")

  // Step 1: current stats per team
  const teamData: Record<string, {
    player: PlayerName; games: number; points: number
    formPPG: number; overallPPG: number; strength: number
    form: { result: "W" | "D" | "L"; scored: number; conceded: number; opponent: string }[]; trend: "up" | "down" | "stable"
  }> = {}

  for (const team of allTeams) {
    const player = getPlayerForTeam(team, playerTeams)
    if (!player) continue

    const teamMatches = matches.filter((m) => m.teamA === team || m.teamB === team)
    const games = teamMatches.length

    let wins = 0, draws = 0, losses = 0
    for (const m of teamMatches) {
      const scored = m.teamA === team ? m.scoreA : m.scoreB
      const conceded = m.teamA === team ? m.scoreB : m.scoreA
      if (scored > conceded) wins++
      else if (scored === conceded) draws++
      else losses++
    }

    const points = wins * 3 + draws
    const overallPPG = games > 0 ? points / games : 0

    // Form: last 5 games (matches are desc ordered)
    const last5 = matches
      .filter((m) => m.teamA === team || m.teamB === team)
      .slice(0, 5)
      .reverse()
      .map((m) => {
        const scored = m.teamA === team ? m.scoreA : m.scoreB
        const conceded = m.teamA === team ? m.scoreB : m.scoreA
        const opponent = m.teamA === team ? m.teamB : m.teamA
        const result = (scored > conceded ? "W" : scored === conceded ? "D" : "L") as "W" | "D" | "L"
        return { result, scored, conceded, opponent }
      })

    const formPts = last5.reduce((s, r) => s + (r.result === "W" ? 3 : r.result === "D" ? 1 : 0), 0)
    const formPPG = last5.length > 0 ? formPts / last5.length : overallPPG
    const strength = last5.length >= 3 ? 0.6 * formPPG + 0.4 * overallPPG : overallPPG
    const trend: "up" | "down" | "stable" =
      formPPG > overallPPG + 0.25 ? "up" : formPPG < overallPPG - 0.25 ? "down" : "stable"

    teamData[team] = { player, games, points, formPPG, overallPPG, strength, form: last5, trend }
  }

  // Average strength fallback for teams with no games yet
  const teamsWithData = allTeams.filter((t) => teamData[t]?.games > 0)
  const avgStrength = teamsWithData.length > 0
    ? teamsWithData.reduce((s, t) => s + teamData[t].strength, 0) / teamsWithData.length
    : 1.5
  for (const team of allTeams) {
    if (teamData[team] && teamData[team].games === 0) teamData[team].strength = avgStrength
  }

  // Step 2: count how many times each pair has played
  const pairCount: Record<string, number> = {}
  for (const m of matches) {
    const key = pairKey(m.teamA, m.teamB)
    pairCount[key] = (pairCount[key] ?? 0) + 1
  }

  // Step 3: expected points from remaining matches
  const expectedPts: Record<string, number> = {}
  for (const team of allTeams) expectedPts[team] = 0

  for (let i = 0; i < allTeams.length; i++) {
    for (let j = i + 1; j < allTeams.length; j++) {
      const tA = allTeams[i]
      const tB = allTeams[j]
      if (!teamData[tA] || !teamData[tB]) continue
      if (teamData[tA].player === teamData[tB].player) continue // only cross-player matches

      const played = pairCount[pairKey(tA, tB)] ?? 0
      const remaining = Math.max(0, GAMES_PER_PAIR - played)
      if (remaining === 0) continue

      const sA = teamData[tA].strength || avgStrength
      const sB = teamData[tB].strength || avgStrength
      const rA = (sA + sB) > 0 ? sA / (sA + sB) : 0.5

      // Draw probability: higher when teams are evenly matched
      const evenness = 1 - Math.abs(rA - 0.5) * 2
      const drawProb = 0.15 + 0.15 * evenness
      const winProbA = (1 - drawProb) * rA
      const winProbB = (1 - drawProb) * (1 - rA)

      expectedPts[tA] += (winProbA * 3 + drawProb) * remaining
      expectedPts[tB] += (winProbB * 3 + drawProb) * remaining
    }
  }

  // Step 4: avg opponent strength for remaining fixtures per team
  const avgOppStrength: Record<string, number | null> = {}
  for (const team of allTeams) {
    if (!teamData[team]) continue
    let totalStr = 0, count = 0
    for (const other of allTeams) {
      if (!teamData[other] || teamData[other].player === teamData[team].player) continue
      const remaining = Math.max(0, GAMES_PER_PAIR - (pairCount[pairKey(team, other)] ?? 0))
      totalStr += (teamData[other].strength || avgStrength) * remaining
      count += remaining
    }
    avgOppStrength[team] = count > 0 ? totalStr / count : null
  }

  // Step 5: projected = current + expected from remaining schedule
  return allTeams
    .filter((team) => teamData[team])
    .map((team) => {
      const d = teamData[team]
      return {
        team, player: d.player, color: PLAYER_COLORS[d.player],
        currentPoints: d.points, currentGames: d.games,
        formPPG: d.formPPG, overallPPG: d.overallPPG,
        projectedPoints: d.points + expectedPts[team],
        form: d.form, trend: d.trend,
        avgOpponentStrength: avgOppStrength[team],
      }
    })
    .sort((a, b) => b.projectedPoints - a.projectedPoints)
    .slice(0, 3)
}

// ── Sub-components ───────────────────────────────────────────────────────────

const RANKS = ["1ST", "2ND", "3RD"]

/** Big condensed figure; stat-number turns it to plain ink in the light theme. */
function BigNumber({ size, color, className, children }: { size: number; color?: string; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={`font-archivo font-black leading-[0.8] ${color ? "stat-number" : ""} ${className ?? ""}`}
      style={{ fontSize: size, color, fontVariationSettings: ARCHIVO_CONDENSED }}
    >
      {children}
    </span>
  )
}

/** The small mono caption under a figure. */
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted ${className ?? ""}`}>
      {children}
    </span>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 font-display text-2xl font-bold">{children}</h2>
}

/** "+4", "−4" with a real minus, "0" */
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0")

const formPoints = (form: { result: "W" | "D" | "L" }[]) =>
  form.reduce((acc, f) => acc + (f.result === "W" ? 3 : f.result === "D" ? 1 : 0), 0)

function FormBadge({ result, color, scored, conceded, opponent }: { result: "W" | "D" | "L"; color: string; scored?: number; conceded?: number; opponent?: string }) {
  // A win takes the bear's colour, a draw a neutral fill, a loss only an outline
  const cls = result === "W" ? "text-[#0B0C0F]" : result === "D" ? "bg-surface-3 text-ink-2" : "border border-hairline-strong text-ink-muted"
  const hasTooltip = scored !== undefined && conceded !== undefined && opponent
  return (
    <span className="relative group">
      <span
        className={`font-archivo inline-flex h-[26px] w-[26px] items-center justify-center rounded-md text-[15px] font-black leading-none ${cls}`}
        style={{ background: result === "W" ? color : undefined, fontVariationSettings: ARCHIVO_CONDENSED }}
      >
        {result}
      </span>
      {hasTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
          <span className="bg-accent text-accent-foreground text-[10px] font-medium rounded px-2 py-1 whitespace-nowrap">
            {scored}–{conceded} vs {opponent}
          </span>
          <span className="w-1.5 h-1.5 bg-accent rotate-45 -mt-1" />
        </span>
      )}
    </span>
  )
}

/** A bear's season, framed in their colour like the standings cards. */
function PlayerStatsCard({ s, rank }: { s: PlayerStats; rank: number }) {
  const last5 = s.form.slice(0, 5)
  const formPPG = last5.length > 0 ? (formPoints(last5) / last5.length).toFixed(2) : "0.00"
  const isLeader = rank === 0

  return (
    <article
      aria-label={`${RANKS[rank]?.toLowerCase() ?? rank + 1} ${s.player}, ${s.pts} points in ${s.played} games`}
      className="rounded-[16px] p-[3px]"
      style={{ clipPath: cardClip(28), background: s.color }}
    >
      <div
        className="flex h-full flex-col gap-[18px] rounded-[13px] bg-surface px-6 pb-6 pt-[22px] text-ink"
        style={{ clipPath: cardClip(27), backgroundImage: CARD_STRIPES }}
      >
        <div className="flex items-center gap-3">
          <BearAvatar name={s.player} size={44} />
          <span className="font-display text-xl font-bold">{s.player}</span>
          <span
            className={`font-archivo ml-auto rounded-full px-3 py-1 text-[18px] font-black leading-none ${
              isLeader ? "bg-accent text-accent-foreground" : "bg-surface-3 text-ink-2"
            }`}
            style={{ fontVariationSettings: ARCHIVO_CONDENSED }}
          >
            {RANKS[rank] ?? `${rank + 1}TH`}
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-2.5">
            <BigNumber size={112} color={s.color}>{s.pts}</BigNumber>
            <Label>Pts in {s.played} games</Label>
          </div>
          <div className="flex flex-col items-end gap-2">
            <BigNumber size={30}>{formPPG}</BigNumber>
            <Label>Form PPG</Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {s.form.map((f, i) => (
            <FormBadge key={i} result={f.result} color={s.color} scored={f.scored} conceded={f.conceded} opponent={f.opponent} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-[var(--card-rule)] pt-4">
          {[
            { label: "W-D-L", value: `${s.wins}-${s.draws}-${s.losses}` },
            { label: "Goals", value: `${s.gf}:${s.ga}` },
            { label: "Goal diff", value: signed(s.gd) },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1.5">
              <BigNumber size={30}>{stat.value}</BigNumber>
              <Label>{stat.label}</Label>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

function H2HCards({ matrix }: { matrix: H2HMatrix }) {
  const pairs: [PlayerName, PlayerName][] = [["Vanilla", "Choco"], ["Vanilla", "Panda"], ["Choco", "Panda"]]

  return (
    <div className="flex flex-col gap-3">
      {pairs.map(([pA, pB]) => {
        const r = matrix[pA][pB]
        const total = r.wins + r.draws + r.losses
        // Empty segments are left out so their 3px gaps don't pile up
        const segments = [
          { key: "a", n: r.wins, color: PLAYER_COLORS[pA] },
          { key: "d", n: r.draws, color: "var(--ghost)" },
          { key: "b", n: r.losses, color: PLAYER_COLORS[pB] },
        ].filter((segment) => segment.n > 0)
        return (
          <div
            key={pA + pB}
            role="img"
            aria-label={`${pA} ${r.wins}, ${pB} ${r.losses}, ${r.draws} draws in ${total} games`}
            className="rounded-[20px] border border-hairline bg-surface px-[22px] py-5"
          >
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <BearAvatar name={pA} size={36} />
                <span className="truncate font-semibold">{pA}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-baseline gap-2">
                  <BigNumber size={64} color={PLAYER_COLORS[pA]}>{r.wins}</BigNumber>
                  <BigNumber size={64} className="text-[color:var(--ghost)]">–</BigNumber>
                  <BigNumber size={64} color={PLAYER_COLORS[pB]}>{r.losses}</BigNumber>
                </div>
                <Label className="whitespace-nowrap">
                  {r.draws} draws · {total} games
                </Label>
              </div>
              <div className="flex min-w-0 items-center justify-end gap-2.5">
                <span className="truncate font-semibold">{pB}</span>
                <BearAvatar name={pB} size={36} />
              </div>
            </div>

            <div aria-hidden="true" className="mt-4 flex h-1.5 gap-[3px]">
              {segments.length > 0 ? (
                segments.map((segment) => (
                  <div
                    key={segment.key}
                    className="rounded-full"
                    style={{ flexGrow: segment.n, flexBasis: 0, background: segment.color }}
                  />
                ))
              ) : (
                <div className="flex-1 rounded-full bg-track" />
              )}
            </div>
            <div className="mt-2 flex justify-between">
              <Label>{r.gf} goals</Label>
              <Label>{r.ga} goals</Label>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TopTeamsProjection({ projections }: { projections: TeamProjection[] }) {
  return (
    <div className="flex flex-col gap-3">
      {projections.map((t, i) => (
        <div
          key={t.team}
          className="flex items-center gap-5 rounded-[20px] border border-hairline bg-surface px-[22px] py-5"
        >
          {/* The favourite's numeral in the accent; olive in light, where lime can't be read */}
          <BigNumber
            size={56}
            className={`w-8 shrink-0 text-center ${i === 0 ? "text-[color:var(--accent-text)]" : "text-[color:var(--ghost)]"}`}
          >
            {i + 1}
          </BigNumber>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: t.color }} />
              <span className="text-[17px] font-semibold">{t.team}</span>
              <span className="text-[13px] text-ink-muted">{t.player}</span>
            </div>
            <Label>
              Now {t.currentPoints} pts
              {t.avgOpponentStrength !== null && <> · Opp {t.avgOpponentStrength.toFixed(2)}</>} · Form{" "}
              {t.formPPG.toFixed(2)}
            </Label>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <BigNumber size={64}>{Math.round(t.projectedPoints)}</BigNumber>
            <Label>Predicted</Label>
          </div>
        </div>
      ))}
      <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
        Predicted final points = current points + expected points from remaining fixtures. Each remaining match is simulated using opponent strength (60% recent form PPG + 40% season PPG). Win/draw/loss probabilities are calculated proportionally, with draw likelihood increasing when teams are evenly matched.
      </p>
    </div>
  )
}

type SeasonRecord = {
  key: string
  value: React.ReactNode
  title: string
  subtitle: string
  /** The bear who holds it; a record shared by two sides keeps a neutral bar */
  holder?: PlayerName | null
}

/** Tile with a 4px bar on top in the holder's colour. */
function RecordTile({ record }: { record: SeasonRecord }) {
  const color = record.holder ? PLAYER_COLORS[record.holder] : undefined
  return (
    <div className="relative flex flex-col gap-2.5 overflow-hidden rounded-[16px] border border-hairline bg-surface px-5 pb-5 pt-6">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: color ?? "var(--track)" }} />
      <BigNumber size={64} color={color}>{record.value}</BigNumber>
      <div className="mt-1 text-sm font-medium">{record.title}</div>
      <Label>{record.subtitle}</Label>
    </div>
  )
}

function RecordsSection({ records, playerTeams }: { records: RecordsData; playerTeams: PlayerTeams }) {
  const owner = (team: string) => getPlayerForTeam(team, playerTeams)
  const scoreline = (m: MatchRecord) => `${shortenTeamName(m.teamA)} ${m.scoreA}:${m.scoreB} ${shortenTeamName(m.teamB)}`
  const list: SeasonRecord[] = []

  if (records.highestScoring) {
    const { match, total } = records.highestScoring
    list.push({ key: "highestScoring", value: total, title: "Highest-scoring game", subtitle: scoreline(match) })
  }
  if (records.biggestWin) {
    const { match, margin, winner } = records.biggestWin
    list.push({ key: "biggestWin", value: margin, title: "Biggest win", subtitle: scoreline(match), holder: owner(winner) })
  }
  if (records.bestAttack) {
    const { team, gf } = records.bestAttack
    list.push({ key: "bestAttack", value: gf, title: "Most goals scored", subtitle: shortenTeamName(team), holder: owner(team) })
  }
  if (records.bestDefense) {
    const { team, ga } = records.bestDefense
    list.push({ key: "bestDefense", value: ga, title: "Fewest goals conceded", subtitle: shortenTeamName(team), holder: owner(team) })
  }
  if (records.bestWinRate) {
    const { team, winRate, wins, games } = records.bestWinRate
    list.push({
      key: "bestWinRateTeam",
      value: `${Math.round(winRate * 100)}%`,
      title: "Best team win rate",
      subtitle: `${shortenTeamName(team)} · ${wins} of ${games}`,
      holder: owner(team),
    })
  }
  if (records.longestWinStreak) {
    const { player, length } = records.longestWinStreak
    list.push({ key: "winStreak", value: length, title: "Longest winning streak", subtitle: player, holder: player })
  }
  if (records.mostCleanSheets) {
    const { player, count } = records.mostCleanSheets
    list.push({ key: "cleanSheets", value: count, title: "Most clean sheets", subtitle: player, holder: player })
  }
  if (records.longestUnbeaten) {
    const { player, length } = records.longestUnbeaten
    list.push({ key: "unbeaten", value: length, title: "Longest unbeaten run", subtitle: player, holder: player })
  }
  if (records.bestWinRatePlayer) {
    const { player, winRate, wins, games } = records.bestWinRatePlayer
    list.push({
      key: "winRatePlayer",
      value: `${Math.round(winRate * 100)}%`,
      title: "Best win rate",
      subtitle: `${player} · ${wins} of ${games}`,
      holder: player,
    })
  }
  if (records.bestFormPlayer) {
    const { player, formPPG } = records.bestFormPlayer
    list.push({ key: "bestForm", value: formPPG.toFixed(2), title: "Best current form", subtitle: `${player} · PPG, last 5`, holder: player })
  }

  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
      {list.map((record) => (
        <RecordTile key={record.key} record={record} />
      ))}
    </div>
  )
}

function PredictionSection({ predictions }: { predictions: PredictionEntry[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {predictions.map(({ pair, probA, probDraw, probB }) => (
        <div key={pair.join("v")} className="bg-surface-2 rounded-lg p-4 shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-base" style={{ color: PLAYER_COLORS[pair[0]] }}>{pair[0]}</span>
            <span className="text-[10px] text-ink-dim">·</span>
            <span className="font-bold text-base" style={{ color: PLAYER_COLORS[pair[1]] }}>{pair[1]}</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden">
            <div style={{ width: `${probA}%`, backgroundColor: PLAYER_COLORS[pair[0]] }} />
            <div style={{ width: `${probDraw}%` }} className="bg-surface-3" />
            <div style={{ width: `${probB}%`, backgroundColor: PLAYER_COLORS[pair[1]] }} />
          </div>
          <div className="relative flex justify-between mt-1.5 text-xs">
            <span className="font-medium" style={{ color: PLAYER_COLORS[pair[0]] }}>{probA}%</span>
            <span
              className="absolute -translate-x-1/2 text-ink-dim"
              style={{ left: `${probA + probDraw / 2}%` }}
            >
              {probDraw}%
            </span>
            <span className="font-medium" style={{ color: PLAYER_COLORS[pair[1]] }}>{probB}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Root component ───────────────────────────────────────────────────────────

export default function FifaAdvancedAnalytics({ matches, playerTeams }: FifaAdvancedAnalyticsProps) {
  if (matches.length === 0) {
    return <p className="text-ink-muted text-center italic mt-32">No insights yet</p>
  }

  const stats = computePlayerStats(matches, playerTeams)
  const matrix = computeH2HMatrix(matches, playerTeams)
  const records = computeRecords(matches, playerTeams, stats)
  const predictions = computePredictions(matrix, stats)
  const topTeams = computeTeamProjections(matches, playerTeams)

  return (
    <div className="flex flex-col gap-10">
      <section>
        <SectionTitle>Player stats</SectionTitle>
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {[...stats]
            .sort((a, b) => b.pts - a.pts || b.gd - a.gd)
            .map((s, rank) => (
              <PlayerStatsCard key={s.player} s={s} rank={rank} />
            ))}
        </div>
      </section>

      <div className="flex flex-wrap items-start gap-6">
        <section className="min-w-0 flex-[1_1_420px]">
          <SectionTitle>Head-to-head</SectionTitle>
          <H2HCards matrix={matrix} />
        </section>
        <section className="min-w-0 flex-[1_1_420px]">
          <SectionTitle>Top 3 predicted</SectionTitle>
          <TopTeamsProjection projections={topTeams} />
        </section>
      </div>

      <section>
        <SectionTitle>Season records</SectionTitle>
        <RecordsSection records={records} playerTeams={playerTeams} />
      </section>

      {/* Predictions */}
      {false && <section>
        <h3 className="text-[16px] font-bold mb-2">Predictions</h3>
        <div className="flex items-baseline gap-3 mb-4">
          <p className="text-xs text-ink-dim">Based on H2H record (60%) and last 5 games form (40%)</p>
          {(() => {
            const withPred = matches.filter((m) => m.prediction != null && m.prediction !== "")
            if (withPred.length === 0) return null
            const correct = withPred.filter((m) => {
              const actual = m.scoreA > m.scoreB ? "A" : m.scoreB > m.scoreA ? "B" : "Draw"
              return m.prediction === actual
            }).length
            return (
              <span className="text-xs text-ink-dim whitespace-nowrap">
                · Prediction accuracy: {Math.round((correct / withPred.length) * 100)}%
              </span>
            )
          })()}
        </div>
        <PredictionSection predictions={predictions} />
      </section>}
    </div>
  )
}
