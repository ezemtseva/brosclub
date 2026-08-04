"use client"

import React from "react"
import Image from "next/image"
import { PLAYER_COLORS, shortenTeamName } from "../lib/teamColors"

const PLAYER_AVATARS: Record<string, string> = {
  Vanilla: "/imgs/vanilla.png",
  Choco: "/imgs/choco.png",
  Panda: "/imgs/panda.png",
}

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

function FormBadge({ result, scored, conceded, opponent }: { result: "W" | "D" | "L"; scored?: number; conceded?: number; opponent?: string }) {
  const cls = result === "W" ? "bg-green-500" : result === "D" ? "bg-gray-400" : "bg-red-400"
  const hasTooltip = scored !== undefined && conceded !== undefined && opponent
  return (
    <span className="relative group">
      <span className={`w-6 h-6 text-[11px] font-bold inline-flex items-center justify-center rounded text-white leading-none ${cls}`}>
        {result}
      </span>
      {hasTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
          <span className="bg-gray-900 text-white text-[10px] font-medium rounded px-2 py-1 whitespace-nowrap">
            {scored}–{conceded} vs {opponent}
          </span>
          <span className="w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-1" />
        </span>
      )}
    </span>
  )
}

function PlayerStatsCard({ s }: { s: PlayerStats }) {
  const winRate = s.played > 0 ? s.wins / s.played : 0
  const drawRate = s.played > 0 ? s.draws / s.played : 0
  const goalShare = s.gf + s.ga > 0 ? s.gf / (s.gf + s.ga) : 0
  const last5 = s.form.slice(0, 5)
  const last5Pts = last5.reduce((acc, f) => acc + (f.result === "W" ? 3 : f.result === "D" ? 1 : 0), 0)
  const formPPG = last5.length > 0 ? (last5Pts / last5.length).toFixed(2) : "0.00"

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 shadow-sm border bg-gray-50 border-gray-100 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={PLAYER_AVATARS[s.player]}
            alt={s.player}
            width={56}
            height={56}
            className="rounded-full object-cover w-14 h-14"
          />
          <div>
            <div className="font-bold text-xl text-gray-900">{s.player}</div>
            <div className="text-xs text-gray-500 mt-1">{formPPG} PPG</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold leading-none" style={{ color: s.color }}>{s.pts}</div>
          <div className="text-[11px] text-gray-400 uppercase mt-1.5">Points in {s.played} games</div>
        </div>
      </div>

      <div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden flex">
          <div className="h-full" style={{ width: `${winRate * 100}%`, backgroundColor: s.color }} />
          <div className="h-full bg-gray-400" style={{ width: `${drawRate * 100}%` }} />
        </div>
        <div className="relative text-xs mt-1 h-4">
          <span className="absolute left-0" style={{ color: s.color }}>{s.wins}W</span>
          <span
            className="absolute -translate-x-1/2 text-gray-400"
            style={{ left: `${(winRate + drawRate / 2) * 100}%` }}
          >
            {s.draws}D
          </span>
          <span className="absolute right-0 text-gray-700">{s.losses}L</span>
        </div>
      </div>

      <div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${goalShare * 100}%`, backgroundColor: s.color }} />
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span style={{ color: s.color }}>{s.gf}GS</span>
          <span className="text-gray-700">{s.ga}GC</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {s.form.map((f, i) => <FormBadge key={i} result={f.result} scored={f.scored} conceded={f.conceded} opponent={f.opponent} />)}
        {Array.from({ length: 10 - s.form.length }).map((_, i) => (
          <span key={"pad" + i} className="w-6 h-6 rounded bg-gray-100" />
        ))}
      </div>
    </div>
  )
}

function H2HCards({ matrix }: { matrix: H2HMatrix }) {
  const pairs: [PlayerName, PlayerName][] = [["Vanilla", "Choco"], ["Vanilla", "Panda"], ["Choco", "Panda"]]

  return (
    <div className="grid grid-cols-1 gap-3">
      {pairs.map(([pA, pB]) => {
        const r = matrix[pA][pB]
        const total = r.wins + r.draws + r.losses
        return (
          <div key={pA + pB} className="bg-gray-50 rounded-lg p-4 shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image src={PLAYER_AVATARS[pA]} alt={pA} width={28} height={28} className="rounded-full object-cover w-7 h-7" />
                <span className="font-bold text-base text-gray-900">{pA}</span>
              </div>
              <span className="text-gray-400">{total} games</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-gray-900">{pB}</span>
                <Image src={PLAYER_AVATARS[pB]} alt={pB} width={28} height={28} className="rounded-full object-cover w-7 h-7" />
              </div>
            </div>

            {total > 0 && (
              <>
                <div className="flex text-lg mb-1">
                  <div className="text-left" style={{ width: `${(r.wins / total) * 100}%`, color: PLAYER_COLORS[pA] }}>{r.wins}W</div>
                  <div className="text-center text-gray-400" style={{ width: `${(r.draws / total) * 100}%` }}>{r.draws}D</div>
                  <div className="text-right" style={{ width: `${(r.losses / total) * 100}%`, color: PLAYER_COLORS[pB] }}>{r.losses}W</div>
                </div>
                <div className="flex rounded-full overflow-hidden h-2 mb-2">
                  <div style={{ width: `${(r.wins / total) * 100}%`, backgroundColor: PLAYER_COLORS[pA] }} />
                  <div style={{ width: `${(r.draws / total) * 100}%` }} className="bg-gray-200" />
                  <div style={{ width: `${(r.losses / total) * 100}%`, backgroundColor: PLAYER_COLORS[pB] }} />
                </div>
              </>
            )}

            <div className="flex justify-between text-[10px]">
              <span style={{ color: PLAYER_COLORS[pA] }}>{r.gf}GS</span>
              <span style={{ color: PLAYER_COLORS[pB] }}>{r.ga}GS</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const RANK_COLORS = ["#F59E0B", "#9CA3AF", "#B45309"]

function TopTeamsProjection({ projections, teamLogos }: { projections: TeamProjection[]; teamLogos: Record<string, string> }) {
  const trendIcon = (t: TeamProjection["trend"]) =>
    t === "up" ? <span className="text-green-500 text-sm font-bold">↑</span>
    : t === "down" ? <span className="text-red-400 text-sm font-bold">↓</span>
    : null

  return (
    <div className="flex flex-col gap-3">
      {projections.map((t, i) => (
        <div key={t.team} className="bg-gray-50 rounded-lg p-4 shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 flex flex-col gap-2">
          {/* Row 1: team + points */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[2.25rem] font-bold leading-none text-center w-9 shrink-0" style={{ color: RANK_COLORS[i] }}>{i + 1}</span>
              <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={teamLogos[t.team] || "/placeholder.svg"}
                  alt={t.team}
                  width={36}
                  height={36}
                  className={`object-contain ${t.team === "Atletico Madrid" ? "w-7 h-7" : "w-9 h-9"}`}
                />
              </div>
              <span className="relative text-xl font-light text-gray-600">
                {t.team}
                <span
                  className="absolute bottom-0 left-0 h-[2px]"
                  style={{ width: "0.85em", backgroundColor: t.color }}
                />
              </span>
            </div>
            <div className="flex items-center gap-1">
              {trendIcon(t.trend)}
              <span className="text-[2.25rem] font-bold leading-none text-gray-800">{Math.round(t.projectedPoints)}</span>
            </div>
          </div>

          {/* Row 2: stats */}
          <div className="flex items-center justify-between text-[9px] md:text-xs text-gray-500 md:pl-[44px]">
            <span>
              <span className="md:hidden">Now: {t.currentPoints} pts</span>
              <span className="hidden md:inline">Now: <span className="font-semibold text-gray-700">{t.currentPoints} pts</span> in {t.currentGames} games</span>
            </span>
            {t.avgOpponentStrength !== null && (
              <span>Opp: <span className="font-semibold text-gray-700">{t.avgOpponentStrength.toFixed(2)}</span></span>
            )}
            <span>
              <span className="md:hidden">PPG: {t.formPPG.toFixed(2)}</span>
              <span className="hidden md:inline">Form PPG: <span className="font-semibold text-gray-700">{t.formPPG.toFixed(2)}</span></span>
            </span>
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
        Predicted final points = current points + expected points from remaining fixtures. Each remaining match is simulated using opponent strength (60% recent form PPG + 40% season PPG). Win/draw/loss probabilities are calculated proportionally, with draw likelihood increasing when teams are evenly matched.
      </p>
    </div>
  )
}

function StatCard({
  value,
  valueColor,
  description,
}: {
  value: React.ReactNode
  valueColor?: string
  description: React.ReactNode
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-row-reverse items-center justify-between gap-3 sm:flex-col sm:items-start sm:justify-start sm:gap-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
      <div className="text-3xl font-bold leading-none shrink-0" style={{ color: valueColor ?? "#1f2937" }}>{value}</div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

function TeamNameUnderlined({ team, playerTeams, className }: { team: string; playerTeams: PlayerTeams; className?: string }) {
  const player = getPlayerForTeam(team, playerTeams)
  const color = player ? PLAYER_COLORS[player] : undefined
  return (
    <span className={`relative whitespace-nowrap text-sm ${className ?? ""}`}>
      {shortenTeamName(team)}
      {color && <span className="absolute bottom-0 left-0 h-[2px] w-[0.85em]" style={{ backgroundColor: color }} />}
    </span>
  )
}

function RecordsSection({ records, playerTeams }: { records: RecordsData; playerTeams: PlayerTeams }) {
  const cards: React.ReactNode[] = []

  if (records.highestScoring) {
    const { match, total } = records.highestScoring
    cards.push(
      <StatCard
        key="highestScoring"
        value={total}
        description={
          <>
            <span className="block text-sm">Highest-scoring game</span>
            <span className="block text-sm"><TeamNameUnderlined team={match.teamA} playerTeams={playerTeams} /> {match.scoreA}:{match.scoreB} <TeamNameUnderlined team={match.teamB} playerTeams={playerTeams} /></span>
          </>
        }
      />
    )
  }

  if (records.biggestWin) {
    const { match, margin } = records.biggestWin
    cards.push(
      <StatCard
        key="biggestWin"
        value={margin}
        description={
          <>
            <span className="block text-sm">Biggest win</span>
            <span className="block text-sm"><TeamNameUnderlined team={match.teamA} playerTeams={playerTeams} /> {match.scoreA}:{match.scoreB} <TeamNameUnderlined team={match.teamB} playerTeams={playerTeams} /></span>
          </>
        }
      />
    )
  }

  if (records.bestAttack) {
    const player = getPlayerForTeam(records.bestAttack.team, playerTeams)
    cards.push(
      <StatCard
        key="bestAttack"
        value={records.bestAttack.gf}
        valueColor={player ? PLAYER_COLORS[player] : undefined}
        description={<>{shortenTeamName(records.bestAttack.team)} have scored the most goals</>}
      />
    )
  }

  if (records.bestDefense) {
    const player = getPlayerForTeam(records.bestDefense.team, playerTeams)
    cards.push(
      <StatCard
        key="bestDefense"
        value={records.bestDefense.ga}
        valueColor={player ? PLAYER_COLORS[player] : undefined}
        description={<>{shortenTeamName(records.bestDefense.team)} have conceded the fewest goals</>}
      />
    )
  }

  if (records.bestWinRate) {
    const player = getPlayerForTeam(records.bestWinRate.team, playerTeams)
    cards.push(
      <StatCard
        key="bestWinRateTeam"
        value={`${Math.round(records.bestWinRate.winRate * 100)}%`}
        valueColor={player ? PLAYER_COLORS[player] : undefined}
        description={<>{shortenTeamName(records.bestWinRate.team)} have the best win rate</>}
      />
    )
  }

  if (records.longestWinStreak) {
    const { player, length } = records.longestWinStreak
    cards.push(
      <StatCard
        key="winStreak"
        value={length}
        valueColor={PLAYER_COLORS[player]}
        description={<>{player}&apos;s longest winning streak</>}
      />
    )
  }

  if (records.mostCleanSheets) {
    const { player, count } = records.mostCleanSheets
    cards.push(
      <StatCard
        key="cleanSheets"
        value={count}
        valueColor={PLAYER_COLORS[player]}
        description={<>{player} has kept the most clean sheets</>}
      />
    )
  }

  if (records.longestUnbeaten) {
    const { player, length } = records.longestUnbeaten
    cards.push(
      <StatCard
        key="unbeaten"
        value={length}
        valueColor={PLAYER_COLORS[player]}
        description={<>{player}&apos;s longest unbeaten run</>}
      />
    )
  }

  if (records.bestWinRatePlayer) {
    const { player, winRate } = records.bestWinRatePlayer
    cards.push(
      <StatCard
        key="winRatePlayer"
        value={`${Math.round(winRate * 100)}%`}
        valueColor={PLAYER_COLORS[player]}
        description={<>{player} has the best win rate</>}
      />
    )
  }

  if (records.bestFormPlayer) {
    const { player, formPPG } = records.bestFormPlayer
    cards.push(
      <StatCard
        key="bestForm"
        value={formPPG.toFixed(2)}
        valueColor={PLAYER_COLORS[player]}
        description={<>{player} is in the best current form</>}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {cards}
    </div>
  )
}

function PredictionSection({ predictions }: { predictions: PredictionEntry[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {predictions.map(({ pair, probA, probDraw, probB }) => (
        <div key={pair.join("v")} className="bg-gray-50 rounded-lg p-4 shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-base" style={{ color: PLAYER_COLORS[pair[0]] }}>{pair[0]}</span>
            <span className="text-[10px] text-gray-200">·</span>
            <span className="font-bold text-base" style={{ color: PLAYER_COLORS[pair[1]] }}>{pair[1]}</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden">
            <div style={{ width: `${probA}%`, backgroundColor: PLAYER_COLORS[pair[0]] }} />
            <div style={{ width: `${probDraw}%` }} className="bg-gray-300" />
            <div style={{ width: `${probB}%`, backgroundColor: PLAYER_COLORS[pair[1]] }} />
          </div>
          <div className="relative flex justify-between mt-1.5 text-xs">
            <span className="font-medium" style={{ color: PLAYER_COLORS[pair[0]] }}>{probA}%</span>
            <span
              className="absolute -translate-x-1/2 text-gray-400"
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

export default function FifaAdvancedAnalytics({ matches, playerTeams, teamLogos }: FifaAdvancedAnalyticsProps) {
  if (matches.length === 0) {
    return <p className="text-sm text-gray-400">No matches played yet — analytics will appear here.</p>
  }

  const stats = computePlayerStats(matches, playerTeams)
  const matrix = computeH2HMatrix(matches, playerTeams)
  const records = computeRecords(matches, playerTeams, stats)
  const predictions = computePredictions(matrix, stats)
  const topTeams = computeTeamProjections(matches, playerTeams)

  return (
    <div className="flex flex-col gap-10">
      {/* Player Stats */}
      <section>
        <h3 className="text-[16px] font-bold mb-4">Player Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...stats].sort((a, b) => b.pts - a.pts).map((s) => <PlayerStatsCard key={s.player} s={s} />)}
        </div>
      </section>

      {/* H2H | Top 3 Predicted */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h3 className="text-[16px] font-bold mb-4">Head-to-Head</h3>
          <H2HCards matrix={matrix} />
        </section>
        <section>
          <h3 className="text-[16px] font-bold mb-4">Top 3 Predicted</h3>
          <TopTeamsProjection projections={topTeams} teamLogos={teamLogos} />
        </section>
      </div>

      {/* Records */}
      <section>
        <h3 className="text-[16px] font-bold mb-4">Records</h3>
        <RecordsSection records={records} playerTeams={playerTeams} />
      </section>

      {/* Predictions */}
      {false && <section>
        <h3 className="text-[16px] font-bold mb-2">Predictions</h3>
        <div className="flex items-baseline gap-3 mb-4">
          <p className="text-xs text-gray-400">Based on H2H record (60%) and last 5 games form (40%)</p>
          {(() => {
            const withPred = matches.filter((m) => m.prediction != null && m.prediction !== "")
            if (withPred.length === 0) return null
            const correct = withPred.filter((m) => {
              const actual = m.scoreA > m.scoreB ? "A" : m.scoreB > m.scoreA ? "B" : "Draw"
              return m.prediction === actual
            }).length
            return (
              <span className="text-xs text-gray-400 whitespace-nowrap">
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
