"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DataTable from "./DataTable"
import ImageCarousel from "./ImageCarousel"
import dynamic from "next/dynamic"
import AddGGGameDialog from "./AddGGGameDialog"
import { PLAYER_COLORS } from "../lib/teamColors"

const GGChart = dynamic(() => import("./GGChart"), { ssr: false })
const PieChart = dynamic(() => import("./PieChart"), { ssr: false })

// Define the seasons array
const seasons = ["2025/26", "2024/25", "All Time"] as const
type Season = (typeof seasons)[number]

// Player colors for consistent styling
const playerColors = PLAYER_COLORS

// Helper to reverse-map player color -> player name
function playerNameFromColor(color: string): string {
  return Object.entries(playerColors).find(([, c]) => c === color)?.[0] ?? ""
}

// All Time columns
const allTimeColumns = [
  { header: "#", accessor: "position" },
  { header: "Bearo", accessor: "player" },
  { header: "Games", accessor: "games" },
  { header: "Wins", accessor: "wins" },
  { header: "5K", accessor: "fiveK" },
  { header: "Points", accessor: "points" },
  { header: "PD", accessor: "difference" },
  { header: "W%", accessor: "winPercentage" },
]

type GGSeasonTabsProps = {
  currentSeasonData: any[]
  currentSeasonChartData: any[]
  currentSeasonPieData: any[]
  currentSeasonHighlights: any[]
  historicalSeasonData: any[]
  historicalSeasonChartData: any[]
  historicalSeasonPieData: any[]
  historicalSeasonHighlights: any[]
  columns: any[]
}

export default function GGSeasonTabs({
  currentSeasonData,
  currentSeasonChartData,
  currentSeasonPieData,
  currentSeasonHighlights,
  historicalSeasonData,
  historicalSeasonChartData,
  historicalSeasonPieData,
  historicalSeasonHighlights,
  columns,
}: GGSeasonTabsProps) {
  const [activeSeason, setActiveSeason] = useState<Season>("2025/26")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const router = useRouter()

  // Compute All Time standings
  const computeAllTimeStandings = () => {
    const totals: Record<string, { games: number; wins: number; fiveK: number; points: number; hoverColor: string }> = {}

    const ensurePlayer = (name: string) => {
      if (!totals[name]) {
        totals[name] = { games: 0, wins: 0, fiveK: 0, points: 0, hoverColor: playerColors[name] ?? "#cccccc" }
      }
    }

    for (const chartData of [currentSeasonChartData, historicalSeasonChartData]) {
      const maxGames: Record<string, number> = {}
      const maxPoints: Record<string, number> = {}
      const maxWins: Record<string, number> = {}
      const maxFiveK: Record<string, number> = {}
      for (const row of chartData) {
        const p = row.player as string
        if (maxGames[p] === undefined || row.games > maxGames[p]) maxGames[p] = row.games
        if (maxPoints[p] === undefined || row.points > maxPoints[p]) maxPoints[p] = row.points
        if (maxWins[p] === undefined || row.wins > maxWins[p]) maxWins[p] = row.wins
        if (maxFiveK[p] === undefined || row.fiveK > maxFiveK[p]) maxFiveK[p] = row.fiveK
      }
      for (const player of Object.keys(maxGames)) {
        ensurePlayer(player)
        totals[player].games += maxGames[player] ?? 0
        totals[player].points += maxPoints[player] ?? 0
        totals[player].wins += maxWins[player] ?? 0
        totals[player].fiveK += maxFiveK[player] ?? 0
      }
    }

    const sorted = Object.entries(totals).sort(([, a], [, b]) => b.points - a.points)
    const leaderPoints = sorted[0]?.[1].points ?? 0
    const totalWins = Object.values(totals).reduce((sum, d) => sum + d.wins, 0)
    return sorted.map(([name, data], index) => ({
        position: index + 1,
        player: (
          <span className="relative">
            {name}
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: data.hoverColor }} />
          </span>
        ),
        games: data.games,
        wins: data.wins,
        fiveK: data.fiveK,
        points: data.points,
        difference: index === 0 ? "-" : String(data.points - leaderPoints),
        winPercentage: totalWins > 0 ? `${((data.wins / totalWins) * 100).toFixed(1)}%` : "0%",
        hoverColor: data.hoverColor,
      }))
  }

  const handleGameSuccess = () => {
    router.refresh()
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Render content based on active tab
  const renderContent = () => {
    if (activeSeason === "2025/26") {
      // For the current season, use the live data from ggEntry
      return (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-title font-bold">Standings</h2>
            <button
              onClick={() => setDialogOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-base leading-none">+</span> Add Game
            </button>
          </div>
          <DataTable columns={columns} data={currentSeasonData} />

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Weekly progress</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <GGChart entries={currentSeasonChartData} />
              </div>
              <div className="w-full md:w-1/3">
                <PieChart data={currentSeasonPieData} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Highlights</h2>
            <div className="">
              <ImageCarousel images={currentSeasonHighlights} />
            </div>
          </section>
        </>
      )
    } else if (activeSeason === "2024/25") {
      // For the 2024/25 season, use the historical data from ggEntry2024
      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <DataTable columns={columns} data={historicalSeasonData} />

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Weekly progress</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <GGChart entries={historicalSeasonChartData} />
              </div>
              <div className="w-full md:w-1/3">
                <PieChart data={historicalSeasonPieData} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Highlights</h2>
            <div className="">
              <ImageCarousel images={historicalSeasonHighlights} />
            </div>
          </section>
        </>
      )
    } else if (activeSeason === "All Time") {
      const allTimeData = computeAllTimeStandings()
      return (
        <>
          <h2 className="text-title font-bold mb-6">All Time Standings</h2>
          <DataTable columns={allTimeColumns} data={allTimeData} />
        </>
      )
    }
  }

  return (
    <>
      {/* Season tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {seasons.map((season) => (
              <button
                key={season}
                onClick={() => setActiveSeason(season)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSeason === season
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {season}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {dialogOpen && (
        <AddGGGameDialog
          onSuccess={handleGameSuccess}
          onClose={() => setDialogOpen(false)}
        />
      )}

      {showToast && (
        <div className="fixed top-16 right-4 z-50 bg-green-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
          Game added ✓
        </div>
      )}

      {/* Render content based on active tab */}
      {renderContent()}
    </>
  )
}
