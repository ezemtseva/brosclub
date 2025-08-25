import prisma from "../../lib/prisma"
import Link from "next/link"
import SevenOkerSeasonTabs from "../../components/SevenOkerSeasonTab"

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

const playerColors = {
  Vanilla: "#ea7878",
  Choco: "#4b98de",
  Panda: "#4fcb90",
}

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

// Helper function to process data for display
function processSeasonData(latestEntries: SevenOkerEntry[]) {
  return latestEntries
    .sort((a: SevenOkerEntry, b: SevenOkerEntry) => b.points - a.points)
    .map((entry: SevenOkerEntry, index: number, arr: SevenOkerEntry[]) => ({
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

async function getHistoricalSeasonData() {
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
    console.error("Error fetching historical season 7oker data:", error)
    return { entries: [] as SevenOkerEntry[], latestEntries: [] as SevenOkerEntry[] }
  }
}

export default async function SevenOkerPage() {
  // Fetch current season data (2025/26)
  const { entries: currentEntries, latestEntries: currentLatestEntries } = await getCurrentSeasonData()

  // Fetch historical season data (2024/25)
  const { entries: historicalEntries, latestEntries: historicalLatestEntries } = await getHistoricalSeasonData()

  // Process current season data
  const currentSeasonData = processSeasonData(currentLatestEntries)
  const currentSeasonPieData = createPieChartData(currentLatestEntries)
  const currentSeasonChartData = serializeEntries(currentEntries)

  // Process historical season data
  const historicalSeasonData = processSeasonData(historicalLatestEntries)
  const historicalSeasonPieData = createPieChartData(historicalLatestEntries)
  const historicalSeasonChartData = serializeEntries(historicalEntries)

  // Current season highlights (update as new highlights happen)
  const currentSeasonHighlights = [
    { src: "/imgs/7oker/thumbnail.png", alt: "New season highlight", caption: "New season will be started in August!" },
    // Add more current season images as they happen
  ]

  // Historical season highlights (2024/25)
  const historicalSeasonHighlights = [
    { src: "/imgs/7oker/game61.png", alt: "7oker Season Highlight", caption: "Был туз крестовый на руке.." },
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">7oker Cup</h1>
      <p className="text-base text-gray-600 mb-8">
        II season of our local homemade game. The first to reach 100 points wins.{" "}
        <Link
          href="https://bearos-poker.vercel.app/"
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to play
        </Link>
        !
      </p>

      <SevenOkerSeasonTabs
        currentSeasonData={currentSeasonData}
        currentSeasonChartData={currentSeasonChartData}
        currentSeasonPieData={currentSeasonPieData}
        currentSeasonHighlights={currentSeasonHighlights}
        historicalSeasonData={historicalSeasonData}
        historicalSeasonChartData={historicalSeasonChartData}
        historicalSeasonPieData={historicalSeasonPieData}
        historicalSeasonHighlights={historicalSeasonHighlights}
        columns={columns}
      />
    </div>
  )
}
