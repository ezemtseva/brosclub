import type React from "react"
import prisma from "../../lib/prisma"
import { updateFplData } from "../../lib/fplUtils"
import dynamicImport from "next/dynamic"
import FplSeasonTabs from "../../components/FplSeasonTabs"

const FplChart = dynamicImport(() => import("../../components/FplChart"), { ssr: false })

export const dynamic = "force-dynamic"

type TableDataItem = {
  position: number
  player: React.ReactNode
  games: number
  points: number
  difference: string
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
  { header: "Games", accessor: "games" },
  { header: "Points", accessor: "points" },
  { header: "Difference", accessor: "difference" },
]

const players = [
  { name: "Vanilla", teamId: "1546526", color: "#ea7878" },
  { name: "Choco", teamId: "3214199", color: "#4b98de" },
  { name: "Panda", teamId: "5663", color: "#4fcb90" },
]

// Helper function to process FPL data for display
function processFplData(playersData: PlayerData[]): TableDataItem[] {
  return playersData
    .map((player) => {
      const lastEntry = player.entries[player.entries.length - 1]
      return {
        player: player.name,
        games: lastEntry.games,
        points: lastEntry.points,
        color: player.color,
      }
    })
    .sort((a, b) => b.points - a.points)
    .map((entry, index, sortedData) => ({
      position: index + 1,
      player: (
        <span className="relative">
          {entry.player}
          <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: entry.color }} />
        </span>
      ),
      games: entry.games,
      points: entry.points,
      difference: index === 0 ? "-" : (sortedData[index - 1].points - entry.points).toString(),
      hoverColor: entry.color,
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

async function getHistoricalSeasonData(): Promise<PlayerData[]> {
  try {
    // Use dynamic access to the model
    const fplEntries = await (prisma as any).fplEntry2024.findMany({
      orderBy: [{ player: "asc" }, { week: "asc" }],
    })

    const playerData: PlayerData[] = players.map((player) => ({
      ...player,
      entries: fplEntries.filter((entry: any) => entry.player === player.name),
    }))

    return playerData
  } catch (error) {
    console.error("Error fetching historical FPL data from database:", error)
    return players.map((player) => ({ ...player, entries: [] }))
  }
}

export default async function FPLPage() {
  try {
    console.log("Starting FPL data update...")
    // Update FPL data from the official API
    await updateFplData()
    console.log("FPL data update completed")

    // Fetch current season data (2025/26)
    console.log("Fetching current season data from database...")
    const currentPlayersData = await getCurrentSeasonData()
    console.log("Current season data fetched:", currentPlayersData)

    // Fetch historical season data (2024/25)
    console.log("Fetching historical season data from database...")
    const historicalPlayersData = await getHistoricalSeasonData()
    console.log("Historical season data fetched:", historicalPlayersData)

    // Process current season data
    const currentSeasonData = processFplData(currentPlayersData)
    const currentSeasonChartData = createChartData(currentPlayersData)

    // Process historical season data
    const historicalSeasonData = processFplData(historicalPlayersData)
    const historicalSeasonChartData = createChartData(historicalPlayersData)

    // Current season highlights (update as new highlights happen)
    const currentSeasonHighlights = [
      { src: "/imgs/fpl/fpl2526-1.png", alt: "New FPL Season Highlight", caption: "Team of the week 1 - Panda" },
      { src: "/imgs/fpl/fpl2526-2.png", alt: "New FPL Season Highlight", caption: "Team of the week 2 - Vanilla" },
      // Add more current season images as they happen
    ]

    // Historical season highlights (2024/25)
    const historicalSeasonHighlights = [
      { src: "/imgs/fpl/fpl38.png", alt: "New FPL Season Highlight", caption: "Team of the week 38 - Panda" },
      { src: "/imgs/fpl/fpl37.png", alt: "New FPL Season Highlight", caption: "Team of the week 37 - Panda" },
      { src: "/imgs/fpl/fpl36.png", alt: "New FPL Season Highlight", caption: "Team of the week 36 - Choco" },
      { src: "/imgs/fpl/fpl35.png", alt: "New FPL Season Highlight", caption: "Team of the week 35 - Vanilla" },
      { src: "/imgs/fpl/fpl34.png", alt: "New FPL Season Highlight", caption: "Team of the week 34 - Panda" },
      { src: "/imgs/fpl/fpl33.png", alt: "New FPL Season Highlight", caption: "Team of the week 33 - Vanilla" },
      { src: "/imgs/fpl/fpl32.png", alt: "New FPL Season Highlight", caption: "Team of the week 32 - Vanilla" },
      { src: "/imgs/fpl/fpl31.png", alt: "New FPL Season Highlight", caption: "Team of the week 31 - Vanilla" },
      { src: "/imgs/fpl/fpl30.png", alt: "New FPL Season Highlight", caption: "Team of the week 30 - Panda" },
      { src: "/imgs/fpl/fpl29.png", alt: "New FPL Season Highlight", caption: "Team of the week 29 - Panda" },
      { src: "/imgs/fpl/fpl28.png", alt: "New FPL Season Highlight", caption: "Team of the week 28 - Vanilla" },
      { src: "/imgs/fpl/fpl27.png", alt: "New FPL Season Highlight", caption: "Team of the week 27 - Panda" },
      { src: "/imgs/fpl/fpl26.png", alt: "New FPL Season Highlight", caption: "Team of the week 26 - Vanilla" },
      { src: "/imgs/fpl/fpl25.png", alt: "New FPL Season Highlight", caption: "Team of the week 25 - Vanilla" },
      { src: "/imgs/fpl/fpl24.png", alt: "New FPL Season Highlight", caption: "Team of the week 24 - Panda" },
      { src: "/imgs/fpl/fpl23.png", alt: "New FPL Season Highlight", caption: "Team of the week 23 - Choco" },
      { src: "/imgs/fpl/fpl22.png", alt: "New FPL Season Highlight", caption: "Team of the week 22 - Panda" },
      { src: "/imgs/fpl/fpl21.png", alt: "New FPL Season Highlight", caption: "Team of the week 21 - Panda" },
      { src: "/imgs/fpl/fpl20.png", alt: "New FPL Season Highlight", caption: "Team of the week 20 - Choco" },
      { src: "/imgs/fpl/fpl19.png", alt: "New FPL Season Highlight", caption: "Team of the week 19 - Panda" },
      { src: "/imgs/fpl/fpl18.png", alt: "New FPL Season Highlight", caption: "Team of the week 18 - Panda" },
      {
        src: "/imgs/fpl/fpl17.png",
        alt: "New FPL Season Highlight",
        caption: "Team of the week 17 - Panda with 110 points!",
      },
      { src: "/imgs/fpl/fpl16.png", alt: "New FPL Season Highlight", caption: "Team of the week 16 - Panda" },
      { src: "/imgs/fpl/fpl15.png", alt: "New FPL Season Highlight", caption: "Team of the week 15 - Choco" },
      { src: "/imgs/fpl/fpl14.png", alt: "New FPL Season Highlight", caption: "Team of the week 14 - Vanilla" },
      { src: "/imgs/fpl/fpl13.png", alt: "New FPL Season Highlight", caption: "Team of the week 13 - Choco" },
      { src: "/imgs/fpl/fpl12.png", alt: "New FPL Season Highlight", caption: "Team of the week 12 - Vanilla" },
      { src: "/imgs/fpl/fpl11.png", alt: "New FPL Season Highlight", caption: "Team of the week 11 - Choco" },
      { src: "/imgs/fpl/fpl10.png", alt: "New FPL Season Highlight", caption: "Team of the week 10 - Choco" },
      { src: "/imgs/fpl/fpl4.png", alt: "New FPL Season Highlight", caption: "Team of the week 9 - Vanilla" },
      { src: "/imgs/fpl/fpl2.png", alt: "New FPL Season Highlight", caption: "Team of the week 8 - Vanilla" },
      { src: "/imgs/fpl/fpl1.png", alt: "Top team of the week", caption: "Team of the week 7 - Vanilla" },
      { src: "/imgs/fpl/fpl3.png", alt: "FPL Placeholder", caption: "Team of the week 6 - Vanilla" },
    ]

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-title font-bold mb-4">Fantasy Premier League Cup</h1>
        <p className="text-base text-gray-600 mb-8">
          X anniversary season of the online game where bearos manage their own virtual team of real-life Premier League players.
        </p>

        <FplSeasonTabs
          currentSeasonData={currentSeasonData}
          currentSeasonChartData={currentSeasonChartData}
          currentSeasonHighlights={currentSeasonHighlights}
          historicalSeasonData={historicalSeasonData}
          historicalSeasonChartData={historicalSeasonChartData}
          historicalSeasonHighlights={historicalSeasonHighlights}
          columns={columns}
        />
      </div>
    )
  } catch (error) {
    console.error("Error in FPLPage:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-title font-bold mb-4">Fantasy Premier League Cup</h1>
        <p className="text-base text-gray-600 mb-8">Fantasy Premier League seasons.</p>
        <h2 className="text-title font-bold mb-4">Standings</h2>
        <p className="text-red-500">Error loading FPL data. Please try again later.</p>
        {process.env.NODE_ENV === "development" && (
          <p className="text-sm text-gray-500 mt-2">Error details: {(error as Error).message}</p>
        )}
      </div>
    )
  }
}
