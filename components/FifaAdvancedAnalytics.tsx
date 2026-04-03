"use client"

import React from "react"
import { PLAYER_COLORS } from "../lib/teamColors"

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

  // Longest unbeaten streak per player (W or D only)
  const byUnbeaten = stats.map((s) => {
    // re-derive from sorted match results
    const sorted = [...s.form].reverse() // form is newest-first, reverse to oldest-first
    let longest = 0, cur = 0
    for (const f of sorted) {
      if (f.result !== "L") { cur++; longest = Math.max(longest, cur) } else cur = 0
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
      <span className={`w-6 h-6 inline-flex items-center justify-center rounded text-white text-[11px] font-bold leading-none ${cls}`}>
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
  return (
    <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-3 shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
      <div className="flex items-center justify-center">
        <span className="font-bold" style={{ color: s.color }}>{s.player}</span>
      </div>

      <div className="grid grid-cols-5 gap-1 text-center">
        {[
          ["GP", s.played],
          ["W", s.wins],
          ["D", s.draws],
          ["L", s.losses],
          ["PTS", s.pts],
        ].map(([label, val]) => (
          <div key={label as string}>
            <div className="text-lg font-bold text-gray-800 leading-tight">{val}</div>
            <div className="text-[10px] text-gray-400 uppercase">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-1 text-center">
        {[
          ["GS", s.gf],
          ["GSA", s.avgScored.toFixed(2)],
          ["GC", s.ga],
          ["GCA", s.avgConceded.toFixed(2)],
          ["GD", (s.gd > 0 ? "+" : "") + s.gd],
        ].map(([label, val]) => (
          <div key={label as string}>
            <div className="text-lg font-bold text-gray-800 leading-tight">{val}</div>
            <div className="text-[10px] text-gray-400 uppercase">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 justify-center">
        {s.form.map((f, i) => <FormBadge key={i} result={f.result} scored={f.scored} conceded={f.conceded} opponent={f.opponent} />)}
        {Array.from({ length: 10 - s.form.length }).map((_, i) => (
          <span key={"pad" + i} className="w-6 h-6 rounded bg-gray-100" />
        ))}
        <span className="text-[10px] text-gray-400 self-center ml-1">last 10</span>
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
              <span className="font-bold text-base" style={{ color: PLAYER_COLORS[pA] }}>{pA}</span>
              <span className="text-gray-400">{total} games</span>
              <span className="font-bold text-base" style={{ color: PLAYER_COLORS[pB] }}>{pB}</span>
            </div>

            {total > 0 && (
              <>
                <div className="flex text-lg font-bold mb-1">
                  <div className="text-left" style={{ width: `${(r.wins / total) * 100}%`, color: PLAYER_COLORS[pA] }}>{r.wins}</div>
                  <div className="text-center text-gray-400" style={{ width: `${(r.draws / total) * 100}%` }}>{r.draws}</div>
                  <div className="text-right" style={{ width: `${(r.losses / total) * 100}%`, color: PLAYER_COLORS[pB] }}>{r.losses}</div>
                </div>
                <div className="flex rounded-full overflow-hidden h-1.5 mb-2">
                  <div style={{ width: `${(r.wins / total) * 100}%`, backgroundColor: PLAYER_COLORS[pA] }} />
                  <div style={{ width: `${(r.draws / total) * 100}%` }} className="bg-gray-200" />
                  <div style={{ width: `${(r.losses / total) * 100}%`, backgroundColor: PLAYER_COLORS[pB] }} />
                </div>
              </>
            )}

            <div className="flex justify-between text-[10px] text-gray-400">
              <span>{r.gf} goals</span>
              <span>{r.ga} goals</span>
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
    : <span className="text-gray-400 text-sm">→</span>

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

function RecordCard({ label, content, className = "" }: { label: string; content: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-gray-50 rounded-lg p-3 shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 ${className}`}>
      <div className="text-[10px] text-gray-400 uppercase font-medium mb-2">{label}</div>
      {content}
    </div>
  )
}

function TeamLogoSmall({ team, teamLogos }: { team: string; teamLogos: Record<string, string> }) {
  return (
    <div className="w-6 h-6 shrink-0 flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={teamLogos[team] || "/placeholder.svg"}
        alt={team}
        width={24}
        height={24}
        className={`object-contain ${team === "Atletico Madrid" ? "w-5 h-5" : "w-6 h-6"}`}
      />
    </div>
  )
}

function RecordsSection({ records, playerTeams, teamLogos }: { records: RecordsData; playerTeams: PlayerTeams; teamLogos: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: team records */}
      <div className="grid records-row-1 gap-3">
        <RecordCard
          className="col-span-2 md:col-span-1"
          label="Biggest Win"
          content={records.biggestWin
            ? <>
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <TeamLogoSmall team={records.biggestWin.match.teamA} teamLogos={teamLogos} />
                  <span className="text-gray-800">{records.biggestWin.match.teamA}</span>
                  <span className="font-bold text-gray-700">{records.biggestWin.match.scoreA}:{records.biggestWin.match.scoreB}</span>
                  <TeamLogoSmall team={records.biggestWin.match.teamB} teamLogos={teamLogos} />
                  <span className="text-gray-800">{records.biggestWin.match.teamB}</span>
                </div>
                <div className="text-[10px] text-gray-400 text-right">+{records.biggestWin.margin} goal margin</div>
              </>
            : <div className="text-gray-400 text-sm">No data</div>}
        />
        <RecordCard
          className="col-span-2 md:col-span-1"
          label="Highest Scoring"
          content={records.highestScoring
            ? <>
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <TeamLogoSmall team={records.highestScoring.match.teamA} teamLogos={teamLogos} />
                  <span className="text-gray-800">{records.highestScoring.match.teamA}</span>
                  <span className="font-bold text-gray-700">{records.highestScoring.match.scoreA}:{records.highestScoring.match.scoreB}</span>
                  <TeamLogoSmall team={records.highestScoring.match.teamB} teamLogos={teamLogos} />
                  <span className="text-gray-800">{records.highestScoring.match.teamB}</span>
                </div>
                <div className="text-[10px] text-gray-400 text-right">{records.highestScoring.total} goals total</div>
              </>
            : <div className="text-gray-400 text-sm">No data</div>}
        />
        <RecordCard
          className="col-span-2 md:col-span-1"
          label="Best Attack"
          content={records.bestAttack
            ? <>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <TeamLogoSmall team={records.bestAttack.team} teamLogos={teamLogos} />
                    <span className="text-gray-800 truncate">{records.bestAttack.team}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 leading-none shrink-0">{records.bestAttack.gf}</div>
                </div>
                <div className="text-[10px] text-gray-400 text-right mt-0.5">goals scored</div>
              </>
            : <div className="text-gray-400 text-sm">No data</div>}
        />
        <RecordCard
          className="col-span-2 md:col-span-1"
          label="Best Defense"
          content={records.bestDefense
            ? <>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <TeamLogoSmall team={records.bestDefense.team} teamLogos={teamLogos} />
                    <span className="text-gray-800 truncate">{records.bestDefense.team}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 leading-none shrink-0">{records.bestDefense.ga}</div>
                </div>
                <div className="text-[10px] text-gray-400 text-right mt-0.5">goals conceded</div>
              </>
            : <div className="text-gray-400 text-sm">No data</div>}
        />
        <RecordCard
          className="col-span-2 md:col-span-1"
          label="Best Win Rate"
          content={records.bestWinRate
            ? <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <TeamLogoSmall team={records.bestWinRate.team} teamLogos={teamLogos} />
                  <span className="text-gray-800 truncate">{records.bestWinRate.team}</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 leading-none shrink-0">{Math.round(records.bestWinRate.winRate * 100)}%</div>
              </div>
            : <div className="text-gray-400 text-sm">No data</div>}
        />
      </div>
      {/* Row 2: player records */}
      <div className="grid records-row-2 gap-3">
        <RecordCard
          label="Win Streak"
          content={records.longestWinStreak
            ? <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-base" style={{ color: PLAYER_COLORS[records.longestWinStreak.player] }}>{records.longestWinStreak.player}</div>
                <div className="text-2xl font-bold text-gray-800 leading-none shrink-0">{records.longestWinStreak.length}</div>
              </div>
            : <div className="text-gray-400 text-sm">No data</div>}
        />
        <RecordCard
          label="Clean Sheets"
          content={records.mostCleanSheets
            ? <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-base" style={{ color: PLAYER_COLORS[records.mostCleanSheets.player] }}>{records.mostCleanSheets.player}</div>
                <div className="text-2xl font-bold text-gray-800 leading-none shrink-0">{records.mostCleanSheets.count}</div>
              </div>
            : <div className="text-gray-400 text-sm">No data</div>}
        />
        <RecordCard
          label="Unbeaten Streak"
          content={records.longestUnbeaten
            ? <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-base" style={{ color: PLAYER_COLORS[records.longestUnbeaten.player] }}>{records.longestUnbeaten.player}</div>
                <div className="text-2xl font-bold text-gray-800 leading-none shrink-0">{records.longestUnbeaten.length}</div>
              </div>
            : <div className="text-gray-400 text-sm">No data</div>}
        />
        <RecordCard
          label="Win Rate"
          content={records.bestWinRatePlayer
            ? <>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-base" style={{ color: PLAYER_COLORS[records.bestWinRatePlayer.player] }}>{records.bestWinRatePlayer.player}</div>
                  <div className="text-2xl font-bold text-gray-800 leading-none shrink-0">{Math.round(records.bestWinRatePlayer.winRate * 100)}%</div>
                </div>
                <div className="text-[10px] text-gray-400 text-right mt-0.5">{records.bestWinRatePlayer.wins}W in {records.bestWinRatePlayer.games} games</div>
              </>
            : <div className="text-gray-400 text-sm">No data</div>}
        />
        <RecordCard
          label="Best Form"
          content={records.bestFormPlayer
            ? <>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-base" style={{ color: PLAYER_COLORS[records.bestFormPlayer.player] }}>{records.bestFormPlayer.player}</div>
                  <div className="text-2xl font-bold text-gray-800 leading-none shrink-0">{records.bestFormPlayer.formPPG.toFixed(2)}</div>
                </div>
                <div className="text-[10px] text-gray-400 text-right mt-0.5">PPG last 5</div>
              </>
            : <div className="text-gray-400 text-sm">No data</div>}
        />
      </div>
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
        <RecordsSection records={records} playerTeams={playerTeams} teamLogos={teamLogos} />
      </section>

      {/* Predictions */}
      <section>
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
      </section>
    </div>
  )
}
