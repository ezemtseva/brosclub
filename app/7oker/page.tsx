import DataTable from "../../components/DataTable"
import prisma from "../../lib/prisma"
import ImageCarousel from "../../components/ImageCarousel"
import Link from "next/link"
import SevenOkerChartToggle from "../../components/SevenOkerChartToggle"

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

async function get7okerData() {
  try {
    // Use the exact model name from your schema.prisma file
    const modelName = "sevenOkerEntry" // Change this to match your schema

    // Check if the model exists using dynamic property access
    if (!(prisma as any)[modelName]) {
      console.error("Database model not found. Check your schema.prisma file.")
      return { entries: [] as SevenOkerEntry[], latestEntries: [] as SevenOkerEntry[] }
    }

    const entries = (await (prisma as any)[modelName].findMany({
      orderBy: [{ week: "asc" }, { bearo: "asc" }],
    })) as SevenOkerEntry[]

    // If no entries exist yet, return empty arrays
    if (entries.length === 0) {
      return { entries: [] as SevenOkerEntry[], latestEntries: [] as SevenOkerEntry[] }
    }

    const latestWeek = Math.max(...entries.map((entry) => entry.week))
    const latestEntries = entries.filter((entry: SevenOkerEntry) => entry.week === latestWeek)

    return { entries, latestEntries }
  } catch (error) {
    console.error("Error fetching 7oker data:", error)
    return { entries: [] as SevenOkerEntry[], latestEntries: [] as SevenOkerEntry[] }
  }
}

export default async function SevenOkerPage() {
  const { entries, latestEntries } = await get7okerData()

  const tableData = latestEntries
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

  const pieChartData = latestEntries.map((entry: SevenOkerEntry) => ({
    name: entry.bearo,
    value: entry.wins,
    color: playerColors[entry.bearo as keyof typeof playerColors],
  }))

  // Serialize the entries for the client component
  const serializedEntries = entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt ? entry.createdAt.toISOString() : null,
  }))

  const images = [
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
        The first ever season of our local homemade game. 7oker is a strategic trick-taking card game with trick-betting
        system, open and blind rounds, unique rules and special cards power.{" "}
        <Link
          href="https://bearos-poker.vercel.app/"
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Try it now here
        </Link>
        !
      </p>
      <h2 className="text-title font-bold mb-6">Standings</h2>
      <DataTable columns={columns} data={tableData} />

      <section className="mt-12">
        <SevenOkerChartToggle entries={serializedEntries} pieChartData={pieChartData} />
      </section>

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Highlights</h2>
        <div className="px-12">
          <ImageCarousel images={images} />
        </div>
      </section>
    </div>
  )
}

