import prisma from "../../lib/prisma"
import dynamicImport from "next/dynamic"
import HoldemSeasonTabs from "../../components/HoldemSeasonTabs"
import AutoRefresh from "../../components/AutoRefresh"
import { PLAYER_COLORS } from "../../lib/teamColors"
import PlayerCell from "../../components/PlayerCell"

export const dynamic = 'force-dynamic'

const PokerChart = dynamicImport(() => import("../../components/PokerChart"), { ssr: false })
const PieChart = dynamicImport(() => import("../../components/PieChart"), { ssr: false })

const columns = [
  { header: "#", accessor: "position" },
  { header: "Bearo", accessor: "bearo" },
  { header: "G", accessor: "games" },
  { header: "W", accessor: "wins" },
  { header: "P", accessor: "points" },
  { header: "PD", accessor: "pointsDifference" },
  { header: "W%", accessor: "winPercentage" },
]

const playerColors: Record<string, string> = PLAYER_COLORS

// Helper function to process data for display
function processSeasonData(latestEntries: any[]) {
  return latestEntries
    .sort((a: any, b: any) => b.points - a.points)
    .map((entry: any, index: number, arr: any[]) => ({
      position: index + 1,
      bearo: (
        <PlayerCell name={entry.bearo} color={playerColors[entry.bearo as keyof typeof playerColors]} />
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
    { src: "/imgs/poker/thumbnail.jpg", alt: "New season highlight", caption: "New season is currently suspended!" },
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
    <div className="container mx-auto px-3 py-2 md:px-4 md:py-4">
      <AutoRefresh intervalMs={30000} />

      <HoldemSeasonTabs
        title={
          <>
            <span className="sm:hidden text-title">Holdem Cup</span>
            <span className="hidden sm:inline text-title">Texas Holdem Cup</span>
          </>
        }
        description="XI season is currently suspended - we have all had enough of Vladimir Vladimirovich reign..."
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
