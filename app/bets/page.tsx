import prisma from "../../lib/prisma"
import dynamic from "next/dynamic"
import BetsSeasonTabs from "../../components/BetsSeasonTabs"

const BetsChart = dynamic(() => import("../../components/BetsChart"), { ssr: false })
const PieChart = dynamic(() => import("../../components/PieChart"), { ssr: false })

const columns = [
  { header: "#", accessor: "position" },
  { header: "Bearo", accessor: "player" },
  { header: "Games", accessor: "games" },
  { header: "Wins", accessor: "wins" },
  { header: "Points", accessor: "points" },
  { header: "Difference", accessor: "difference" },
  { header: "W%", accessor: "winPercentage" },
]

const playerColors = {
  Vanilla: "#ea7878",
  Choco: "#4b98de",
  Panda: "#4fcb90",
}

// Helper function to process data for display
function processSeasonData(latestEntries: any[]) {
  const totalWins = latestEntries.reduce((sum: number, entry: any) => sum + entry.wins, 0)

  return latestEntries
    .sort((a: any, b: any) => b.points - a.points)
    .map((entry: any, index: number) => ({
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
      hoverColor: playerColors[entry.player as keyof typeof playerColors],
    }))
}

// Helper function to create pie chart data
function createPieChartData(latestEntries: any[]) {
  return latestEntries.map((entry: any) => ({
    name: entry.player,
    value: entry.wins,
    color: playerColors[entry.player as keyof typeof playerColors],
  }))
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

export default async function BetsPage() {
  // Fetch current season data (2025/26)
  const { entries: currentEntries, latestEntries: currentLatestEntries } = await getCurrentSeasonData()

  // Fetch historical season data (2024/25)
  const { entries: historicalEntries, latestEntries: historicalLatestEntries } = await getHistoricalSeasonData()

  // Process current season data
  const currentSeasonData = processSeasonData(currentLatestEntries)
  const currentSeasonPieData = createPieChartData(currentLatestEntries)

  // Process historical season data
  const historicalSeasonData = processSeasonData(historicalLatestEntries)
  const historicalSeasonPieData = createPieChartData(historicalLatestEntries)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">Bets Cup</h1>
      <p className="text-base text-gray-600 mb-8">
        XIV season of boring betting on top football leagues. Currently only English Premier League matches.
      </p>

      <BetsSeasonTabs
        currentSeasonData={currentSeasonData}
        currentSeasonChartData={currentEntries}
        currentSeasonPieData={currentSeasonPieData}
        historicalSeasonData={historicalSeasonData}
        historicalSeasonChartData={historicalEntries}
        historicalSeasonPieData={historicalSeasonPieData}
        columns={columns}
      />
    </div>
  )
}
