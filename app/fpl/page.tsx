import type React from "react"
import prisma from "../../lib/prisma"
import { updateFplData } from "../../lib/fplUtils"
import FplSeasonTabs from "../../components/FplSeasonTabs"
import AutoRefresh from "../../components/AutoRefresh"
import { PLAYER_COLORS } from "../../lib/teamColors"


export const dynamic = "force-dynamic"

type TableDataItem = {
  position: number
  player: React.ReactNode
  games: number
  wins: number
  points: number
  difference: string
  winPercent: string
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
  { name: "Vanilla", teamId: "1546526", color: PLAYER_COLORS.Vanilla },
  { name: "Choco", teamId: "3214199", color: PLAYER_COLORS.Choco },
  { name: "Panda", teamId: "5663", color: PLAYER_COLORS.Panda },
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
      wins: entry.wins,
      points: entry.points,
      difference: index === 0 ? "-" : (sortedData[index - 1].points - entry.points).toString(),
      winPercent: entry.games > 0 ? `${((entry.wins / entry.games) * 100).toFixed(1)}%` : "0%",
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

    // Current season highlights (2026/27) — add as new highlights happen
    const currentSeasonHighlights: { src: string; alt: string; caption: string }[] = []

    // 2024/25 highlights
    const season2425Highlights = [
      { src: "/imgs/fpl/fpl38.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 38 - Panda" },
      { src: "/imgs/fpl/fpl37.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 37 - Panda" },
      { src: "/imgs/fpl/fpl36.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 36 - Choco" },
      { src: "/imgs/fpl/fpl35.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 35 - Vanilla" },
      { src: "/imgs/fpl/fpl34.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 34 - Panda" },
      { src: "/imgs/fpl/fpl33.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 33 - Vanilla" },
      { src: "/imgs/fpl/fpl32.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 32 - Vanilla" },
      { src: "/imgs/fpl/fpl31.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 31 - Vanilla" },
      { src: "/imgs/fpl/fpl30.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 30 - Panda" },
      { src: "/imgs/fpl/fpl29.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 29 - Panda" },
      { src: "/imgs/fpl/fpl28.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 28 - Vanilla" },
      { src: "/imgs/fpl/fpl27.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 27 - Panda" },
      { src: "/imgs/fpl/fpl26.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 26 - Vanilla" },
      { src: "/imgs/fpl/fpl25.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 25 - Vanilla" },
      { src: "/imgs/fpl/fpl24.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 24 - Panda" },
      { src: "/imgs/fpl/fpl23.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 23 - Choco" },
      { src: "/imgs/fpl/fpl22.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 22 - Panda" },
      { src: "/imgs/fpl/fpl21.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 21 - Panda" },
      { src: "/imgs/fpl/fpl20.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 20 - Choco" },
      { src: "/imgs/fpl/fpl19.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 19 - Panda" },
      { src: "/imgs/fpl/fpl18.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 18 - Panda" },
      { src: "/imgs/fpl/fpl17.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 17 - Panda with 110 points!" },
      { src: "/imgs/fpl/fpl16.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 16 - Panda" },
      { src: "/imgs/fpl/fpl15.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 15 - Choco" },
      { src: "/imgs/fpl/fpl14.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 14 - Vanilla" },
      { src: "/imgs/fpl/fpl13.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 13 - Choco" },
      { src: "/imgs/fpl/fpl12.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 12 - Vanilla" },
      { src: "/imgs/fpl/fpl11.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 11 - Choco" },
      { src: "/imgs/fpl/fpl10.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 10 - Choco" },
      { src: "/imgs/fpl/fpl4.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 9 - Vanilla" },
      { src: "/imgs/fpl/fpl2.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 8 - Vanilla" },
      { src: "/imgs/fpl/fpl1.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 7 - Vanilla" },
      { src: "/imgs/fpl/fpl3.png", alt: "FPL 2024/25 Highlight", caption: "Team of the week 6 - Vanilla" },
    ]

    // 2025/26 highlights
    const historicalSeasonHighlights = [
      { src: "/imgs/fpl/fpl2526-38.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 38 - Choco" },
      { src: "/imgs/fpl/fpl2526-37.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 37 - Choco" },
      { src: "/imgs/fpl/fpl2526-36.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 36 - Choco" },
      { src: "/imgs/fpl/fpl2526-35.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 35 - Choco" },
      { src: "/imgs/fpl/fpl2526-34.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 34 - Panda" },
      { src: "/imgs/fpl/fpl2526-33.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 33 - Panda" },
      { src: "/imgs/fpl/fpl2526-32.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 32 - Vanilla" },
      { src: "/imgs/fpl/fpl2526-31.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 31 - Vanilla" },
      { src: "/imgs/fpl/fpl2526-30.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 30 - Choco" },
      { src: "/imgs/fpl/fpl2526-29.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 29 - Vanilla" },
      { src: "/imgs/fpl/fpl2526-28.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 28 - Choco" },
      { src: "/imgs/fpl/fpl2526-27.png", alt: "FPL 2025/26 Highlight", caption: "✯ Teams of the week 27 - Choco & Panda" },
      { src: "/imgs/fpl/fpl2526-26.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 26 - Vanilla" },
      { src: "/imgs/fpl/fpl2526-25.png", alt: "FPL 2025/26 Highlight", caption: "✯ Teams of the week 25 - Choco & Panda" },
      { src: "/imgs/fpl/fpl2526-24.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 24 - Vanilla" },
      { src: "/imgs/fpl/fpl2526-23.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 23 - Panda" },
      { src: "/imgs/fpl/fpl2526-22.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 22 - Vanilla" },
      { src: "/imgs/fpl/fpl2526-21.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 21 - Choco" },
      { src: "/imgs/fpl/fpl2526-20.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 20 - Choco" },
      { src: "/imgs/fpl/fpl2526-19.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 19 - Choco" },
      { src: "/imgs/fpl/fpl2526-18.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 18 - Panda" },
      { src: "/imgs/fpl/fpl2526-17.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 17 - Vanilla" },
      { src: "/imgs/fpl/fpl2526-16.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 16 - Panda" },
      { src: "/imgs/fpl/fpl2526-15.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 15 - Choco" },
      { src: "/imgs/fpl/fpl2526-14.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 14 - Choco" },
      { src: "/imgs/fpl/fpl2526-13.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 13 - Panda" },
      { src: "/imgs/fpl/fpl2526-12.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 12 - Vanilla" },
      { src: "/imgs/fpl/fpl2526-11.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 11 - Vanilla" },
      { src: "/imgs/fpl/fpl2526-10.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 10 - Vanilla" },
      { src: "/imgs/fpl/fpl2526-9.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 9 - Vanilla" },
      { src: "/imgs/fpl/fpl2526-8.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 8 - Panda" },
      { src: "/imgs/fpl/fpl2526-7.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 7 - Choco" },
      { src: "/imgs/fpl/fpl2526-6.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 6 - Choco" },
      { src: "/imgs/fpl/fpl2526-5.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 5 - Panda" },
      { src: "/imgs/fpl/fpl2526-4.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 4 - Choco" },
      { src: "/imgs/fpl/fpl2526-3.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 3 - Vanilla" },
      { src: "/imgs/fpl/fpl2526-2.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 2 - Vanilla" },
      { src: "/imgs/fpl/fpl2526-1.png", alt: "FPL 2025/26 Highlight", caption: "Team of the week 1 - Panda" },
    ]

    return (
      <div className="container mx-auto px-3 py-2 md:px-4 md:py-4">
        <AutoRefresh intervalMs={30000} />

        <FplSeasonTabs
          title="Fantasy Premier League Cup"
          description="X anniversary season of no-names turning our teams into a shit joke."
          currentSeasonData={currentSeasonData}
          currentSeasonChartData={currentSeasonChartData}
          currentSeasonPieData={currentSeasonPieData}
          currentSeasonHighlights={currentSeasonHighlights}
          historicalSeasonData={historicalSeasonData}
          historicalSeasonChartData={historicalSeasonChartData}
          historicalSeasonPieData={historicalSeasonPieData}
          historicalSeasonHighlights={historicalSeasonHighlights}
          season2425Data={season2425Data}
          season2425ChartData={season2425ChartData}
          season2425PieData={season2425PieData}
          season2425Highlights={season2425Highlights}
          columns={columns}
        />
      </div>
    )
  } catch (error) {
    console.error("Error in FPLPage:", error)
    return (
      <div className="container mx-auto px-3 py-2 md:px-4 md:py-4">
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
