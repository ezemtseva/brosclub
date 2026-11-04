import type React from "react"
import prisma from "../../lib/prisma"
import { updateFplData } from "../../lib/fplUtils"
import FplSeasonTabs from "../../components/FplSeasonTabs"
import AutoRefresh from "../../components/AutoRefresh"
import { PLAYER_COLORS } from "../../lib/teamColors"
import PlayerCell from "../../components/PlayerCell"


export const dynamic = "force-dynamic"

type TableDataItem = {
  position: number
  player: React.ReactNode
  games: number
  wins: number
  points: number
  difference: string
  winPercent: string
  /** The most points in a single gameweek */
  bestGw: number
  hoverColor: string
}

// Add these type definitions after the existing TableDataItem type
type FplEntry = {
  id?: number
  week: number
  player: string
  games: number
  points: number
  createdAt?: Date
}

type PlayerData = {
  name: string
  teamId: string
  color: string
  entries: FplEntry[]
}

const columns = [
  { header: "#", accessor: "position" },
  { header: "Bearo", accessor: "player" },
  { header: "GW", accessor: "games" },
  { header: "W", accessor: "wins" },
  { header: "P", accessor: "points" },
  { header: "PD", accessor: "difference" },
  { header: "W%", accessor: "winPercent" },
]

const players = [
  { name: "Vanilla", teamId: "1334964", color: PLAYER_COLORS.Vanilla },
  { name: "Choco", teamId: "530378", color: PLAYER_COLORS.Choco },
  { name: "Panda", teamId: "8724", color: PLAYER_COLORS.Panda },
]

function calculateWins(playersData: PlayerData[]): Record<string, number> {
  // Collect all weeks across all players
  const allWeeks = Array.from(new Set(playersData.flatMap((p) => p.entries.map((e) => e.week)))).sort((a, b) => a - b)

  const wins: Record<string, number> = {}
  for (const p of playersData) wins[p.name] = 0

  for (const week of allWeeks) {
    // Per-week points = cumulative[week] - cumulative[prev week]
    const weekPoints: Record<string, number> = {}
    for (const player of playersData) {
      const curr = player.entries.find((e) => e.week === week)
      if (!curr) continue
      const prevEntry = player.entries.filter((e) => e.week < week).at(-1)
      weekPoints[player.name] = curr.points - (prevEntry?.points ?? 0)
    }
    const max = Math.max(...Object.values(weekPoints))
    const winners = Object.entries(weekPoints).filter(([, pts]) => pts === max)
    if (winners.length === 1) wins[winners[0][0]]++
  }

  return wins
}

/** A player's best single gameweek: the biggest step between consecutive cumulative totals. */
function bestGameweek(entries: FplEntry[]): number {
  const sorted = [...entries].sort((a, b) => a.week - b.week)
  return sorted.reduce((best, entry, i) => Math.max(best, entry.points - (sorted[i - 1]?.points ?? 0)), 0)
}

// Helper function to process FPL data for display
function processFplData(playersData: PlayerData[]): TableDataItem[] {
  const wins = calculateWins(playersData)

  return playersData
    .map((player) => {
      const lastEntry = player.entries[player.entries.length - 1]
      return {
        player: player.name,
        games: lastEntry?.games ?? 0,
        points: lastEntry?.points ?? 0,
        color: player.color,
        wins: wins[player.name] ?? 0,
        bestGw: bestGameweek(player.entries),
      }
    })
    .sort((a, b) => b.points - a.points)
    .map((entry, index, sortedData) => ({
      position: index + 1,
      player: (
        <PlayerCell name={entry.player} color={entry.color} />
      ),
      games: entry.games,
      wins: entry.wins,
      points: entry.points,
      difference: index === 0 ? "-" : (sortedData[index - 1].points - entry.points).toString(),
      winPercent: entry.games > 0 ? `${((entry.wins / entry.games) * 100).toFixed(1)}%` : "0%",
      bestGw: entry.bestGw,
      hoverColor: entry.color,
    }))
}

// Helper function to create pie chart data (wins per player)
function createPieChartData(playersData: PlayerData[]) {
  const wins = calculateWins(playersData)
  return players.map((player) => ({
    name: player.name,
    value: wins[player.name] ?? 0,
    color: player.color,
  }))
}

// Helper function to create chart data
function createChartData(playersData: PlayerData[]) {
  return playersData.flatMap((player) =>
    player.entries.map((entry: FplEntry) => ({
      player: player.name,
      week: entry.week,
      games: entry.games,
      points: entry.points,
    })),
  )
}

async function getCurrentSeasonData(): Promise<PlayerData[]> {
  try {
    const fplEntries = await prisma.fplEntry.findMany({
      orderBy: [{ player: "asc" }, { week: "asc" }],
    })

    const playerData: PlayerData[] = players.map((player) => ({
      ...player,
      entries: fplEntries.filter((entry) => entry.player === player.name),
    }))

    return playerData
  } catch (error) {
    console.error("Error fetching current FPL data from database:", error)
    throw error
  }
}

async function getSeason2526Data(): Promise<PlayerData[]> {
  try {
    const fplEntries = await (prisma as any).fplEntry2526.findMany({
      orderBy: [{ player: "asc" }, { week: "asc" }],
    })

    const playerData: PlayerData[] = players.map((player) => ({
      ...player,
      entries: fplEntries.filter((entry: any) => entry.player === player.name),
    }))

    return playerData
  } catch (error) {
    console.error("Error fetching 2025/26 FPL data from database:", error)
    return players.map((player) => ({ ...player, entries: [] }))
  }
}

async function getSeason2425Data(): Promise<PlayerData[]> {
  try {
    const fplEntries = await (prisma as any).fplEntry2024.findMany({
      orderBy: [{ player: "asc" }, { week: "asc" }],
    })

    const playerData: PlayerData[] = players.map((player) => ({
      ...player,
      entries: fplEntries.filter((entry: any) => entry.player === player.name),
    }))

    return playerData
  } catch (error) {
    console.error("Error fetching 2024/25 FPL data from database:", error)
    return players.map((player) => ({ ...player, entries: [] }))
  }
}

export default async function FPLPage() {
  try {
    // Only sync after 2026/27 season starts — update this date when GW1 is known
    const FPL_NEW_SEASON_START = new Date("2026-08-14")
    if (new Date() >= FPL_NEW_SEASON_START) {
      await updateFplData()
    }

    const currentPlayersData = await getCurrentSeasonData()
    const season2526PlayersData = await getSeason2526Data()
    const season2425PlayersData = await getSeason2425Data()

    const currentSeasonData = processFplData(currentPlayersData)
    const currentSeasonChartData = createChartData(currentPlayersData)
    const currentSeasonPieData = createPieChartData(currentPlayersData)

    const historicalSeasonData = processFplData(season2526PlayersData)
    const historicalSeasonChartData = createChartData(season2526PlayersData)
    const historicalSeasonPieData = createPieChartData(season2526PlayersData)

    const season2425Data = processFplData(season2425PlayersData)
    const season2425ChartData = createChartData(season2425PlayersData)
    const season2425PieData = createPieChartData(season2425PlayersData)

    return (
      <>
        <AutoRefresh intervalMs={30000} />

        <FplSeasonTabs
          // Phones get the short name
          title={
            <>
              <span className="md:hidden">FPL</span>
              <span className="hidden md:inline">Fantasy PL</span>
            </>
          }
          description="X anniversary season of no-names turning our teams into a shit joke."
          currentSeasonData={currentSeasonData}
          currentSeasonChartData={currentSeasonChartData}
          currentSeasonPieData={currentSeasonPieData}
          historicalSeasonData={historicalSeasonData}
          historicalSeasonChartData={historicalSeasonChartData}
          historicalSeasonPieData={historicalSeasonPieData}
          season2425Data={season2425Data}
          season2425ChartData={season2425ChartData}
          season2425PieData={season2425PieData}
          columns={columns}
        />
      </>
    )
  } catch (error) {
    console.error("Error in FPLPage:", error)
    return (
      <div className="mx-auto max-w-page px-8 py-16">
        <h1 className="mb-4 font-display text-[clamp(44px,6vw,84px)] font-extrabold leading-[0.95] tracking-[-0.03em]">
          Fantasy PL
        </h1>
        <p className="text-[18px] text-vanilla">Error loading FPL data. Please try again later.</p>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-2 font-mono text-sm text-ink-muted">Error details: {(error as Error).message}</p>
        )}
      </div>
    )
  }
}
