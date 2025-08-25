import prisma from "../../lib/prisma"
import dynamic from "next/dynamic"
import HoldemSeasonTabs from "../../components/HoldemSeasonTabs"

const PokerChart = dynamic(() => import("../../components/PokerChart"), { ssr: false })
const PieChart = dynamic(() => import("../../components/PieChart"), { ssr: false })

const columns = [
  { header: "#", accessor: "position" },
  { header: "Bearo", accessor: "bearo" },
  { header: "G", accessor: "games" },
  { header: "W", accessor: "wins" },
  { header: "P", accessor: "points" },
  { header: "PD", accessor: "pointsDifference" },
  { header: "W%", accessor: "winPercentage" },
]

const playerColors = {
  Vanilla: "#ea7878",
  Choco: "#4b98de",
  Panda: "#4fcb90",
}

// Helper function to process data for display
function processSeasonData(latestEntries: any[]) {
  return latestEntries
    .sort((a: any, b: any) => b.points - a.points)
    .map((entry: any, index: number, arr: any[]) => ({
      position: index + 1,
      bearo: (
        <span className="relative">
          {entry.bearo}
          <span
            className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]"
            style={{ backgroundColor: playerColors[entry.bearo as keyof typeof playerColors] }}
          />
        </span>
      ),
      games: entry.games,
      wins: entry.wins,
      points: entry.points,
      pointsDifference: index === 0 ? "-" : (arr[index - 1].points - entry.points).toString(),
      winPercentage: entry.games > 0 ? `${((entry.wins / entry.games) * 100).toFixed(1)}%` : "0%",
      hoverColor: playerColors[entry.bearo as keyof typeof playerColors],
    }))
}

// Helper function to create pie chart data
function createPieChartData(latestEntries: any[]) {
  return latestEntries.map((entry: any) => ({
    name: entry.bearo,
    value: entry.wins,
    color: playerColors[entry.bearo as keyof typeof playerColors],
  }))
}

async function getCurrentSeasonData() {
  const entries = await prisma.pokerEntry.findMany({
    orderBy: [{ week: "asc" }, { bearo: "asc" }],
  })

  const latestWeek = entries.length > 0 ? Math.max(...entries.map((entry: any) => entry.week)) : 0
  const latestEntries = entries.filter((entry: any) => entry.week === latestWeek)

  return { entries, latestEntries }
}

async function getHistoricalSeasonData() {
  try {
    // Use dynamic access to the model
    const entries = await (prisma as any).pokerEntry2024.findMany({
      orderBy: [{ week: "asc" }, { bearo: "asc" }],
    })

    const latestWeek = entries.length > 0 ? Math.max(...entries.map((entry: any) => entry.week)) : 0
    const latestEntries = entries.filter((entry: any) => entry.week === latestWeek)

    return { entries, latestEntries }
  } catch (error) {
    console.error("Error fetching historical poker data:", error)
    return { entries: [], latestEntries: [] }
  }
}

export default async function PokerPage() {
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
    { src: "/imgs/poker/thumbnail.jpg", alt: "New season highlight", caption: "New season will be started in August!" },
    // Add more current season images as they happen
  ]

  // Historical season highlights (2024/25)
  const historicalSeasonHighlights = [
    {
      src: "/imgs/poker/poker16.jpg",
      alt: "Poker Season Highlight - Full House",
      caption: "Девятка - это для меня (c)",
    },
    {
      src: "/imgs/poker/poker15.jpg",
      alt: "Poker Season Highlight - Full House",
      caption: "Straight Flush in the next round - just wow!",
    },
    {
      src: "/imgs/poker/poker14.jpg",
      alt: "Poker Season Highlight - Full House",
      caption: "✯ First Royal Flush in the new era for Panda ✯",
    },
    { src: "/imgs/poker/poker13.jpg", alt: "Poker Season Highlight - Full House", caption: "Never mess with Panda!" },
    { src: "/imgs/poker/poker12.jpg", alt: "Poker Season Highlight - Full House", caption: "Classic Vanilla.." },
    { src: "/imgs/poker/poker11.jpg", alt: "Poker Season Highlight - Full House", caption: "Kneel before the King!" },
    { src: "/imgs/poker/poker10.jpg", alt: "Poker Season Highlight - Full House", caption: "Panda King is back!" },
    { src: "/imgs/poker/poker9.jpg", alt: "Poker Season Highlight - Full House", caption: "Лох это и правда судьба.." },
    {
      src: "/imgs/poker/poker8.jpg",
      alt: "Poker Season Highlight - Full House",
      caption: "That was epic - double knock out by aces",
    },
    {
      src: "/imgs/poker/poker7.jpg",
      alt: "Poker Season Highlight - Full House",
      caption: "Some people just don't ever learn their lessons..",
    },
    {
      src: "/imgs/poker/poker5.jpg",
      alt: "Poker Season Highlight - Full House",
      caption: "The King and his luck are back",
    },
    { src: "/imgs/poker/poker4.jpg", alt: "Poker Season Highlight - Full House", caption: "Straights fight" },
    { src: "/imgs/poker/poker3.jpg", alt: "Poker Season Highlight - Full House", caption: "Never fold to early" },
    { src: "/imgs/poker/poker2.jpg", alt: "New Poker Season Highlight", caption: "Last call survivor" },
    {
      src: "/imgs/poker/poker1.jpg",
      alt: "Poker Season Highlight - Full House",
      caption: "Full house, triple seven and two pairs",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">Texas Holdem Cup</h1>
      <p className="text-base text-gray-600 mb-8">
        XI season of Texas Holdem poker. Currently in Poker Now.
      </p>

      <HoldemSeasonTabs
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
