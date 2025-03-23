import DataTable from "../../components/DataTable"
import prisma from "../../lib/prisma"
import dynamic from "next/dynamic"
import ImageCarousel from "../../components/ImageCarousel"

const SevenOkerChart = dynamic(() => import("../../components/SevenOkerChart"), { ssr: false })
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

// Define types for the entries
type SevenOkerEntry = {
  id?: number
  week: number
  bearo: string
  games: number
  wins: number
  points: number
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

    // If no entries exist yet, create some sample data
    if (entries.length === 0) {
      const sampleData: SevenOkerEntry[] = [
        { week: 1, bearo: "Vanilla", games: 5, wins: 2, points: 10 },
        { week: 1, bearo: "Choco", games: 5, wins: 1, points: 5 },
        { week: 1, bearo: "Panda", games: 5, wins: 2, points: 12 },
        { week: 2, bearo: "Vanilla", games: 10, wins: 4, points: 20 },
        { week: 2, bearo: "Choco", games: 10, wins: 3, points: 15 },
        { week: 2, bearo: "Panda", games: 10, wins: 3, points: 18 },
      ]

      await prisma.$transaction(
        sampleData.map((entry: SevenOkerEntry) =>
          (prisma as any)[modelName].create({
            data: entry,
          }),
        ),
      )

      return {
        entries: sampleData,
        latestEntries: sampleData.filter((entry: SevenOkerEntry) => entry.week === 2),
      }
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

  const data = latestEntries
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
      winPercentage: entry.games > 0 ? `${((entry.wins / entry.games) * 100).toFixed(1)}%` : "0%",
      hoverColor: playerColors[entry.bearo as keyof typeof playerColors],
    }))

  const pieChartData = latestEntries.map((entry: SevenOkerEntry) => ({
    name: entry.bearo,
    value: entry.wins,
    color: playerColors[entry.bearo as keyof typeof playerColors],
  }))

  const images = [
    { src: "/imgs/poker/poker15.jpg", alt: "7oker Season Highlight", caption: "First 7oker tournament" },
    { src: "/imgs/poker/poker14.jpg", alt: "7oker Season Highlight", caption: "Amazing hand in 7oker" },
    { src: "/imgs/poker/poker13.jpg", alt: "7oker Season Highlight", caption: "7oker championship finals" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">7oker Cup</h1>
      <p className="text-base text-gray-600 mb-8">First season of 7-card poker variant with special rules.</p>
      <h2 className="text-title font-bold mb-6">Standings</h2>
      <DataTable columns={columns} data={data} />

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Weekly progress</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            {/* @ts-ignore - Ignore type checking for this component */}
            <SevenOkerChart entries={entries} />
          </div>
          <div className="w-full md:w-1/3">
            <PieChart data={pieChartData} />
          </div>
        </div>
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

