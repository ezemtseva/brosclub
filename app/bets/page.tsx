import prisma from "../../lib/prisma"
import dynamicImport from "next/dynamic"
import BetsSeasonTabs from "../../components/BetsSeasonTabs"
import AutoRefresh from "../../components/AutoRefresh"
import { settleAndRecalculate } from "../../lib/pl-settle"
import { PLAYER_COLORS } from "../../lib/teamColors"

export const dynamic = 'force-dynamic'

const BetsChart = dynamicImport(() => import("../../components/BetsChart"), { ssr: false })
const PieChart = dynamicImport(() => import("../../components/PieChart"), { ssr: false })

const columns = [
  { header: "#", accessor: "position" },
  { header: "Bearo", accessor: "player" },
  { header: "G", accessor: "games" },
  { header: "W", accessor: "wins" },
  { header: "P", accessor: "points" },
  { header: "PD", accessor: "difference" },
  { header: "GW%", accessor: "winPercentage" },
  { header: "PS%", accessor: "outcomePercent" },
  { header: "EPS%", accessor: "exactPercent" },
]

const playerColors: Record<string, string> = PLAYER_COLORS

// Helper function to process data for display
function processSeasonData(latestEntries: any[], betStats?: Record<string, { total: number; outcome: number; exact: number }>) {
  const totalWins = latestEntries.reduce((sum: number, entry: any) => sum + entry.wins, 0)

  const sorted = [...latestEntries].sort((a: any, b: any) => b.points - a.points)
  const topPoints = sorted[0]?.points ?? 0

  return sorted.map((entry: any, index: number) => {
      const stats = betStats?.[entry.player]
      const tied = entry.points === topPoints
      const rank = tied ? 1 : sorted.filter((e: any) => e.points > entry.points).length + 1
      return {
        position: rank,
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
        difference: tied ? "-" : (topPoints - entry.points).toString(),
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

async function getSeason2526Data() {
  try {
    const entries = await (prisma as any).betsEntry2526.findMany({
      orderBy: [{ week: "asc" }, { player: "asc" }],
    })
    const latestWeek = entries.length > 0 ? Math.max(...entries.map((entry: any) => entry.week)) : 0
    const latestEntries = entries.filter((entry: any) => entry.week === latestWeek)
    return { entries, latestEntries }
  } catch (error) {
    console.error("Error fetching 2025/26 bets data:", error)
    return { entries: [], latestEntries: [] }
  }
}

async function getHistoricalSeasonData() {
  try {
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
  const grouped = await prisma.plMatch.groupBy({
    by: ["gameweek"],
    where: { season: "2026/27", status: { notIn: ["FINISHED", "POSTPONED"] } },
    _count: { id: true },
  })

  const active = grouped.filter(g => g._count.id >= 2).sort((a, b) => a.gameweek - b.gameweek)
  if (active.length > 0) return active[0].gameweek

  const last = await prisma.plMatch.findFirst({
    where: { season: "2026/27" },
    orderBy: { gameweek: "desc" },
    select: { gameweek: true },
  })
  return last?.gameweek ?? 1
}

export default async function BetsPage() {
  const { entries: currentEntries, latestEntries: currentLatestEntries } = await getCurrentSeasonData()
  const { entries: season2526Entries, latestEntries: season2526LatestEntries } = await getSeason2526Data()
  const { entries: historicalEntries, latestEntries: historicalLatestEntries } = await getHistoricalSeasonData()

  const betStats = await getBetStats()

  const currentSeasonData = processSeasonData(currentLatestEntries, betStats)
  const currentSeasonPieData = createPieChartData(currentLatestEntries)

  const season2526Data = processSeasonData(season2526LatestEntries)
  const season2526PieData = createPieChartData(season2526LatestEntries)

  const historicalSeasonData = processSeasonData(historicalLatestEntries)
  const historicalSeasonPieData = createPieChartData(historicalLatestEntries)

  const initialGameweek = await getInitialGameweek()

  const initialMatches = await prisma.plMatch.findMany({
    where: { season: "2026/27", gameweek: initialGameweek },
    include: { bets: true },
    orderBy: { kickoff: "asc" },
  })

  // Auto-settle finished matches on every page load
  await settleAndRecalculate().catch(console.error)

  return (
    <div className="container mx-auto px-3 py-2 md:px-4 md:py-4">
      <AutoRefresh intervalMs={30000} />

      <BetsSeasonTabs
        title="Bets Cup"
        description="XIV season of boring betting on top football leagues. Only English Premier League matches since 2019."
        currentSeasonData={currentSeasonData}
        currentSeasonChartData={currentEntries}
        currentSeasonPieData={currentSeasonPieData}
        season2526Data={season2526Data}
        season2526ChartData={season2526Entries}
        season2526PieData={season2526PieData}
        historicalSeasonData={historicalSeasonData}
        historicalSeasonChartData={historicalEntries}
        historicalSeasonPieData={historicalSeasonPieData}
        columns={columns}
        initialGameweek={initialGameweek}
        initialMatches={initialMatches.map((m: any) => ({ ...m, kickoff: m.kickoff instanceof Date ? m.kickoff.toISOString() : m.kickoff }))}
      />
    </div>
  )
}
