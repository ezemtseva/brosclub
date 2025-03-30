"use client"

import { useState } from "react"
import DataTable from "../../components/DataTable"
import dynamic from "next/dynamic"
import ImageCarousel from "../../components/ImageCarousel"
import Link from "next/link"

const SevenOkerChart = dynamic(() => import("../../components/SevenOkerChart"), { ssr: false })
const PieChart = dynamic(() => import("../../components/PieChart"), { ssr: false })

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

// This is a client component, so we can't use Prisma directly
// Instead, we'll use hardcoded sample data
const sampleData: SevenOkerEntry[] = [
  { week: 1, bearo: "Vanilla", games: 5, wins: 2, points: 10, gamepoints: 25 },
  { week: 1, bearo: "Choco", games: 5, wins: 1, points: 5, gamepoints: 18 },
  { week: 1, bearo: "Panda", games: 5, wins: 2, points: 12, gamepoints: 30 },
  { week: 2, bearo: "Vanilla", games: 10, wins: 4, points: 20, gamepoints: 45 },
  { week: 2, bearo: "Choco", games: 10, wins: 3, points: 15, gamepoints: 35 },
  { week: 2, bearo: "Panda", games: 10, wins: 3, points: 18, gamepoints: 40 },
]

export default function SevenOkerPage() {
  const [chartView, setChartView] = useState<"points" | "gamepoints">("points")

  // Use the sample data
  const entries = sampleData
  const latestWeek = Math.max(...entries.map((entry) => entry.week))
  const latestEntries = entries.filter((entry) => entry.week === latestWeek)

  const tableData = latestEntries
    .sort((a, b) => b.points - a.points)
    .map((entry, index, arr) => ({
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

  const pieChartData = latestEntries.map((entry) => ({
    name: entry.bearo,
    value: entry.wins,
    color: playerColors[entry.bearo as keyof typeof playerColors],
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
        <div className="flex items-center mb-6">
          <h2 className="text-title font-bold mr-4">Weekly progress</h2>
          <div className="flex space-x-2 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                chartView === "points" ? "bg-gray-100" : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setChartView("points")}
            >
              Points per Win
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                chartView === "gamepoints" ? "bg-gray-100" : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setChartView("gamepoints")}
            >
              Points per Game
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <SevenOkerChart entries={entries} dataKey={chartView} />
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

