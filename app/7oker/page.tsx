import prisma from "../../lib/prisma"
import Link from "next/link"
import SevenOkerSeasonTabs from "../../components/SevenOkerSeasonTab"
import AutoRefresh from "../../components/AutoRefresh"
import { PLAYER_COLORS } from "../../lib/teamColors"
import PlayerCell from "../../components/PlayerCell"

export const dynamic = 'force-dynamic'

const columns = [
  { header: "#", accessor: "position" },
  { header: "Bearo", accessor: "bearo" },
  { header: "G", accessor: "games" },
  { header: "W", accessor: "wins" },
  { header: "P", accessor: "points" },
  { header: "PD", accessor: "pointsDifference" },
  { header: "GP", accessor: "gamepoints" },
  { header: "GPD", accessor: "gamepointsDifference" },
  { header: "W%", accessor: "winPercentage" },
]

const playerColors: Record<string, string> = PLAYER_COLORS

// Define types for the entries
type SevenOkerEntry = {
  id?: number
  week: number
  bearo: string
  games: number
  wins: number
  points: number
  gamepoints?: number
  createdAt?: Date
}

// Placeholder entries for a season that has not had its first game yet
function emptySeasonEntries(): SevenOkerEntry[] {
  return ["Vanilla", "Choco", "Panda"].map((bearo) => ({
    week: 0,
    bearo,
    games: 0,
    wins: 0,
    points: 0,
    gamepoints: 0,
  }))
}

// Helper function to process data for display
function processSeasonData(latestEntries: SevenOkerEntry[]) {
  return latestEntries
    .sort((a: SevenOkerEntry, b: SevenOkerEntry) => b.points - a.points)
    .map((entry: SevenOkerEntry, index: number, arr: SevenOkerEntry[]) => ({
      position: index + 1,
      bearo: (
        <PlayerCell name={entry.bearo} color={playerColors[entry.bearo as keyof typeof playerColors]} />
      ),
      games: entry.games,
      wins: entry.wins,
      points: entry.points,
      pointsDifference: index === 0 ? "-" : (arr[index - 1].points - entry.points).toString(),
      gamepoints: entry.gamepoints || 0,
      gamepointsDifference: index === 0 ? "-" : ((arr[index - 1].gamepoints || 0) - (entry.gamepoints || 0)).toString(),
      winPercentage: entry.games > 0 ? `${((entry.wins / entry.games) * 100).toFixed(1)}%` : "0%",
      hoverColor: playerColors[entry.bearo as keyof typeof playerColors],
    }))
}

// Helper function to create pie chart data
function createPieChartData(latestEntries: SevenOkerEntry[]) {
  return latestEntries.map((entry: SevenOkerEntry) => ({
    name: entry.bearo,
    value: entry.wins,
    color: playerColors[entry.bearo as keyof typeof playerColors],
  }))
}

// Helper function to serialize entries for client components
function serializeEntries(entries: SevenOkerEntry[]) {
  return entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt ? entry.createdAt.toISOString() : null,
  }))
}

async function getCurrentSeasonData() {
  try {
    const modelName = "sevenOkerEntry"

    if (!(prisma as any)[modelName]) {
      console.error("Database model not found. Check your schema.prisma file.")
      return { entries: [] as SevenOkerEntry[], latestEntries: [] as SevenOkerEntry[] }
    }

    const entries = (await (prisma as any)[modelName].findMany({
      orderBy: [{ week: "asc" }, { bearo: "asc" }],
    })) as SevenOkerEntry[]

    if (entries.length === 0) {
      return { entries: [] as SevenOkerEntry[], latestEntries: [] as SevenOkerEntry[] }
    }

    const latestWeek = Math.max(...entries.map((entry) => entry.week))
    const latestEntries = entries.filter((entry: SevenOkerEntry) => entry.week === latestWeek)

    return { entries, latestEntries }
  } catch (error) {
    console.error("Error fetching current season 7oker data:", error)
    return { entries: [] as SevenOkerEntry[], latestEntries: [] as SevenOkerEntry[] }
  }
}

async function getSeason2526Data() {
  try {
    const entries = (await (prisma as any).sevenOkerEntry2526.findMany({
      orderBy: [{ week: "asc" }, { bearo: "asc" }],
    })) as SevenOkerEntry[]

    if (entries.length === 0) {
      return { entries: [] as SevenOkerEntry[], latestEntries: [] as SevenOkerEntry[] }
    }

    const latestWeek = Math.max(...entries.map((entry) => entry.week))
    const latestEntries = entries.filter((entry: SevenOkerEntry) => entry.week === latestWeek)

    return { entries, latestEntries }
  } catch (error) {
    console.error("Error fetching 2025/26 season 7oker data:", error)
    return { entries: [] as SevenOkerEntry[], latestEntries: [] as SevenOkerEntry[] }
  }
}

async function getSeason2425Data() {
  try {
    // Use dynamic access to the model
    const entries = (await (prisma as any).sevenOkerEntry2024.findMany({
      orderBy: [{ week: "asc" }, { bearo: "asc" }],
    })) as SevenOkerEntry[]

    if (entries.length === 0) {
      return { entries: [] as SevenOkerEntry[], latestEntries: [] as SevenOkerEntry[] }
    }

    const latestWeek = Math.max(...entries.map((entry) => entry.week))
    const latestEntries = entries.filter((entry: SevenOkerEntry) => entry.week === latestWeek)

    return { entries, latestEntries }
  } catch (error) {
    console.error("Error fetching 2024/25 season 7oker data:", error)
    return { entries: [] as SevenOkerEntry[], latestEntries: [] as SevenOkerEntry[] }
  }
}

export default async function SevenOkerPage() {
  // Fetch current season data (2026/27)
  const { entries: currentEntries, latestEntries: currentLatestEntries } = await getCurrentSeasonData()

  // Fetch archived season data (2025/26)
  const { entries: season2526Entries, latestEntries: season2526LatestEntries } = await getSeason2526Data()

  // Fetch archived season data (2024/25)
  const { entries: season2425Entries, latestEntries: season2425LatestEntries } = await getSeason2425Data()

  // Process current season data. Before the first game of a season there are no
  // entries yet — show the three bearos on zeros instead of an empty table.
  const currentSeasonData = processSeasonData(
    currentLatestEntries.length > 0 ? currentLatestEntries : emptySeasonEntries()
  )
  const currentSeasonPieData = createPieChartData(currentLatestEntries)
  const currentSeasonChartData = serializeEntries(currentEntries)

  // Process 2025/26 season data
  const historicalSeasonData = processSeasonData(season2526LatestEntries)
  const historicalSeasonPieData = createPieChartData(season2526LatestEntries)
  const historicalSeasonChartData = serializeEntries(season2526Entries)

  // Process 2024/25 season data
  const season2425Data = processSeasonData(season2425LatestEntries)
  const season2425PieData = createPieChartData(season2425LatestEntries)
  const season2425ChartData = serializeEntries(season2425Entries)

  // Current season highlights (2026/27) — add as new highlights happen
  const currentSeasonHighlights: { src: string; alt: string; caption: string }[] = []

  // 2025/26 highlights
  const historicalSeasonHighlights = [
    { src: "/imgs/7oker/2526game72.png", alt: "7oker Season Highlight", caption: "What an end of the season!" },
    { src: "/imgs/7oker/2526game65.png", alt: "7oker Season Highlight", caption: "Crazy last round win for Choco" },
    { src: "/imgs/7oker/2526game4.png", alt: "7oker Season Highlight", caption: "Brand-new game, same old pain" },
  ]

  // 2024/25 highlights
  const season2425Highlights = [
    { src: "/imgs/7oker/game61.png", alt: "7oker Season Highlight", caption: "Был туз крестовый на руке..." },
    { src: "/imgs/7oker/game51.png", alt: "7oker Season Highlight", caption: "Close call win by Choco!" },
    { src: "/imgs/7oker/game42.png", alt: "7oker Season Highlight", caption: "The ultimate setup for Andrei Bubin 2!" },
    {
      src: "/imgs/7oker/game37.png",
      alt: "7oker Season Highlight",
      caption: "Everyone could have won in the last round!",
    },
    { src: "/imgs/7oker/game29.png", alt: "7oker Season Highlight", caption: "What a comeback from Vanilla!" },
    {
      src: "/imgs/7oker/game14.jpeg",
      alt: "7oker Season Highlight",
      caption: "Ottima battaglia tra Trallalelo Tralalala e Spioniro Golubiro",
    },
    { src: "/imgs/7oker/game13.jpeg", alt: "7oker Season Highlight", caption: "Jebeni golub odnosi pobedu" },
    {
      src: "/imgs/7oker/game12.jpeg",
      alt: "7oker Season Highlight",
      caption: "Last round win for Choco, with a little help from Panda",
    },
    {
      src: "/imgs/7oker/game9.jpeg",
      alt: "7oker Season Highlight",
      caption: "Panda snatches victory in the final round!",
    },
    {
      src: "/imgs/7oker/first_official_game.jpeg",
      alt: "7oker Season Highlight",
      caption: "The first season has begun!",
    },
    { src: "/imgs/7oker/first_game.jpeg", alt: "7oker Season Highlight", caption: "First ever game!" },
  ]

  return (
    <div className="container mx-auto px-3 py-2 md:px-4 md:py-4">
      <AutoRefresh intervalMs={30000} />

      <SevenOkerSeasonTabs
        title="7oker Cup"
        description={
          <>
            III season of loosing solid games in the last round. {" "}
            <Link
              href="https://bearos-poker.vercel.app/"
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              You should try it
            </Link>
            .
          </>
        }
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
}
