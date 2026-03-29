import prisma from "../../lib/prisma"
import dynamicImport from "next/dynamic"
import BetsSeasonTabs from "../../components/BetsSeasonTabs"
import { settleAndRecalculate } from "../../lib/pl-settle"

export const dynamic = 'force-dynamic'

const BetsChart = dynamicImport(() => import("../../components/BetsChart"), { ssr: false })
const PieChart = dynamicImport(() => import("../../components/PieChart"), { ssr: false })

const columns = [
  { header: "#", accessor: "position" },
  { header: "Bearo", accessor: "player" },
  { header: "Games", accessor: "games" },
  { header: "Wins", accessor: "wins" },
  { header: "Points", accessor: "points" },
  { header: "PD", accessor: "difference" },
  { header: "GW%", accessor: "winPercentage" },
  { header: "PS%", accessor: "outcomePercent" },
  { header: "EPS%", accessor: "exactPercent" },
]

const playerColors = {
  Vanilla: "#ea7878",
  Choco: "#4b98de",
  Panda: "#4fcb90",
}

// Helper function to process data for display
function processSeasonData(latestEntries: any[], betStats?: Record<string, { total: number; outcome: number; exact: number }>) {
  const totalWins = latestEntries.reduce((sum: number, entry: any) => sum + entry.wins, 0)

  return latestEntries
    .sort((a: any, b: any) => b.points - a.points)
    .map((entry: any, index: number) => {
      const stats = betStats?.[entry.player]
      return {
        position: index + 1,
        player: (
          <span className="relative">
            {entry.player}
            <span
              className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]"
              style={{ backgroundColor: playerColors[entry.player as keyof typeof playerColors] }}
            />
          </span>
        ),
        games: entry.games,
        wins: entry.wins,
        points: entry.points,
        difference: index === 0 ? "-" : (latestEntries[index - 1].points - entry.points).toString(),
        winPercentage: totalWins > 0 ? `${((entry.wins / totalWins) * 100).toFixed(1)}%` : "0%",
        outcomePercent: stats && stats.total > 0 ? `${((stats.outcome / stats.total) * 100).toFixed(1)}%` : "—",
        exactPercent: stats && stats.total > 0 ? `${((stats.exact / stats.total) * 100).toFixed(1)}%` : "—",
        hoverColor: playerColors[entry.player as keyof typeof playerColors],
      }
    })
}

// Helper function to create pie chart data
function createPieChartData(latestEntries: any[]) {
  return latestEntries.map((entry: any) => ({
    name: entry.player,
    value: entry.wins,
    color: playerColors[entry.player as keyof typeof playerColors],
  }))
}

async function getBetStats() {
  const bets = await prisma.plBet.findMany({
    where: { points: { not: null } },
    select: { player: true, points: true },
  })
  const stats: Record<string, { total: number; outcome: number; exact: number }> = {}
  for (const bet of bets) {
    if (!stats[bet.player]) stats[bet.player] = { total: 0, outcome: 0, exact: 0 }
    stats[bet.player].total++
    if ((bet.points ?? 0) >= 1) stats[bet.player].outcome++
    if ((bet.points ?? 0) >= 3) stats[bet.player].exact++
  }
  return stats
}

async function getCurrentSeasonData() {
  const entries = await prisma.betsEntry.findMany({
    orderBy: [{ week: "asc" }, { player: "asc" }],
  })

  const latestWeek = entries.length > 0 ? Math.max(...entries.map((entry: any) => entry.week)) : 0
  const latestEntries = entries.filter((entry: any) => entry.week === latestWeek)

  return { entries, latestEntries }
}

async function getHistoricalSeasonData() {
  try {
    // Use dynamic access to the model
    const entries = await (prisma as any).betsEntry2024.findMany({
      orderBy: [{ week: "asc" }, { player: "asc" }],
    })

    const latestWeek = entries.length > 0 ? Math.max(...entries.map((entry: any) => entry.week)) : 0
    const latestEntries = entries.filter((entry: any) => entry.week === latestWeek)

    return { entries, latestEntries }
  } catch (error) {
    console.error("Error fetching historical bets data:", error)
    return { entries: [], latestEntries: [] }
  }
}

async function getInitialGameweek(): Promise<number> {
  // Find the lowest gameweek with active/upcoming matches (ignore POSTPONED)
  const next = await prisma.plMatch.findFirst({
    where: { season: "2025/26", status: { notIn: ["FINISHED", "POSTPONED"] } },
    orderBy: { gameweek: "asc" },
    select: { gameweek: true },
  })
  if (next) return next.gameweek

  // All finished — return the latest
  const last = await prisma.plMatch.findFirst({
    where: { season: "2025/26" },
    orderBy: { gameweek: "desc" },
    select: { gameweek: true },
  })
  return last?.gameweek ?? 1
}

export default async function BetsPage() {
  // Fetch current season data (2025/26)
  const { entries: currentEntries, latestEntries: currentLatestEntries } = await getCurrentSeasonData()

  // Fetch historical season data (2024/25)
  const { entries: historicalEntries, latestEntries: historicalLatestEntries } = await getHistoricalSeasonData()

  // Fetch bet stats for 2025/26
  const betStats = await getBetStats()

  // Process current season data
  const currentSeasonData = processSeasonData(currentLatestEntries, betStats)
  const currentSeasonPieData = createPieChartData(currentLatestEntries)

  // Process historical season data
  const historicalSeasonData = processSeasonData(historicalLatestEntries)
  const historicalSeasonPieData = createPieChartData(historicalLatestEntries)

  const initialGameweek = await getInitialGameweek()

  // Auto-settle finished matches on every page load
  await settleAndRecalculate().catch(console.error)

  return (
    <div className="container mx-auto px-3 py-4 md:px-4 md:py-8">
      <h1 className="text-title font-bold mb-4">Bets Cup</h1>
      <p className="text-base text-gray-600 mb-8">
        XIII season of boring betting on top football leagues. Currently only English Premier League matches.
      </p>

      <BetsSeasonTabs
        currentSeasonData={currentSeasonData}
        currentSeasonChartData={currentEntries}
        currentSeasonPieData={currentSeasonPieData}
        historicalSeasonData={historicalSeasonData}
        historicalSeasonChartData={historicalEntries}
        historicalSeasonPieData={historicalSeasonPieData}
        columns={columns}
        initialGameweek={initialGameweek}
      />
    </div>
  )
}
