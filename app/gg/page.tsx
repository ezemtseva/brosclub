import prisma from "../../lib/prisma"
import dynamic from "next/dynamic"
import GGSeasonTabs from "../../components/GGSeasonTabs"

const GGChart = dynamic(() => import("../../components/GGChart"), { ssr: false })
const PieChart = dynamic(() => import("../../components/PieChart"), { ssr: false })

const columns = [
  { header: "#", accessor: "position" },
  { header: "Bearo", accessor: "player" },
  { header: "Games", accessor: "games" },
  { header: "Wins", accessor: "wins" },
  { header: "5K", accessor: "fiveK" },
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
      fiveK: entry.fiveK,
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
  const entries = await prisma.ggEntry.findMany({
    orderBy: [{ week: "asc" }, { player: "asc" }],
  })

  const latestWeek = entries.length > 0 ? Math.max(...entries.map((entry: any) => entry.week)) : 0
  const latestEntries = entries.filter((entry: any) => entry.week === latestWeek)

  return { entries, latestEntries }
}

async function getHistoricalSeasonData() {
  try {
    // Use dynamic access to the model
    const entries = await (prisma as any).ggEntry2024.findMany({
      orderBy: [{ week: "asc" }, { player: "asc" }],
    })

    const latestWeek = entries.length > 0 ? Math.max(...entries.map((entry: any) => entry.week)) : 0
    const latestEntries = entries.filter((entry: any) => entry.week === latestWeek)

    return { entries, latestEntries }
  } catch (error) {
    console.error("Error fetching historical data:", error)
    // Return empty data if table doesn't exist or has issues
    return { entries: [], latestEntries: [] }
  }
}

export default async function GGPage() {
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

  // Current season highlights (update as new highlights happen)
  const currentSeasonHighlights = [
    { src: "/imgs/gg/thumbnail.png", alt: "New season highlight", caption: "New season will be started in August!" },
    // Add more current season images as they happen
  ]

  // Historical season highlights (2024/25)
  const historicalSeasonHighlights = [
    { src: "/imgs/gg/5k11.jpg", alt: "Third 5K of the season", caption: "One more 5k for Vanilla - Qatar" },
    { src: "/imgs/gg/5k10.jpg", alt: "Third 5K of the season", caption: "10th 5k in the season for Vanilla - Malta" },
    {
      src: "/imgs/gg/5k9.jpg",
      alt: "Third 5K of the season",
      caption: "When you're really proud of your 5k in Pompei",
    },
    { src: "/imgs/gg/5k8.jpg", alt: "Third 5K of the season", caption: "5k in Jordan for Vanilla" },
    { src: "/imgs/gg/5k7.jpg", alt: "Third 5K of the season", caption: "Boring 5k in Monaco" },
    { src: "/imgs/gg/5k6.jpg", alt: "Third 5K of the season", caption: "Last min win by 5k in Arequipa!" },
    { src: "/imgs/gg/5k5.jpg", alt: "Third 5K of the season", caption: "Double 5k in a game, both in San Marino.." },
    { src: "/imgs/gg/5k3.jpg", alt: "Third 5K of the season", caption: "Almost double 5K hit in Zermatt" },
    { src: "/imgs/gg/5k2.jpg", alt: "Second 5K of the season", caption: "5K for Vanilla in San Marino" },
    { src: "/imgs/gg/gg1.jpg", alt: "New GeoGuessr Season Highlight", caption: "And that was frozen round" },
    { src: "/imgs/gg/5k1.jpg", alt: "First 5K of the season", caption: "First 5K of the season in Belgrade" },
    { src: "/imgs/gg/gg.jpg", alt: "First 5K of the season", caption: "And the journey began!" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">GeoGuessr Cup</h1>
      <p className="text-base text-gray-600 mb-8">
        II season of the GeoGuessr. The tournament includes five rounds for every game: move, no move and panorama. The player
        that hits 5K gets an additional point.
      </p>

      <GGSeasonTabs
        currentSeasonData={currentSeasonData}
        currentSeasonChartData={currentEntries}
        currentSeasonPieData={currentSeasonPieData}
        currentSeasonHighlights={currentSeasonHighlights}
        historicalSeasonData={historicalSeasonData}
        historicalSeasonChartData={historicalEntries}
        historicalSeasonPieData={historicalSeasonPieData}
        historicalSeasonHighlights={historicalSeasonHighlights}
        columns={columns}
      />
    </div>
  )
}
