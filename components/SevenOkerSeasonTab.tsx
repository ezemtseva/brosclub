"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DataTable from "./DataTable"
import ImageCarousel from "./ImageCarousel"
import SevenOkerChartToggle from "./SevenOkerChartToggle"
import AddGameDialog from "./AddGameDialog"
import { PLAYER_COLORS } from "../lib/teamColors"

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
  { header: "Bearo", accessor: "bearo" },
  { header: "G", accessor: "games" },
  { header: "W", accessor: "wins" },
  { header: "P", accessor: "points" },
  { header: "PD", accessor: "difference" },
  { header: "GP", accessor: "gamepoints" },
  { header: "GPD", accessor: "gamepointsDifference" },
  { header: "W%", accessor: "winPercentage" },
]

type SevenOkerSeasonTabsProps = {
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

export default function SevenOkerSeasonTabs({
  currentSeasonData,
  currentSeasonChartData,
  currentSeasonPieData,
  currentSeasonHighlights,
  historicalSeasonData,
  historicalSeasonChartData,
  historicalSeasonPieData,
  historicalSeasonHighlights,
  columns,
}: SevenOkerSeasonTabsProps) {
  const [activeSeason, setActiveSeason] = useState<Season>("2025/26")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const router = useRouter()

  // Compute All Time standings
  const computeAllTimeStandings = () => {
    const totals: Record<string, { games: number; wins: number; points: number; gamepoints: number; hoverColor: string }> = {}

    const ensurePlayer = (name: string) => {
      if (!totals[name]) {
        totals[name] = { games: 0, wins: 0, points: 0, gamepoints: 0, hoverColor: playerColors[name] ?? "#cccccc" }
      }
    }

    for (const chartData of [currentSeasonChartData, historicalSeasonChartData]) {
      const maxGames: Record<string, number> = {}
      const maxPoints: Record<string, number> = {}
      const maxWins: Record<string, number> = {}
      const maxGamepoints: Record<string, number> = {}
      for (const row of chartData) {
        const p = (row.bearo ?? row.player) as string
        if (maxGames[p] === undefined || row.games > maxGames[p]) maxGames[p] = row.games
        if (maxPoints[p] === undefined || row.points > maxPoints[p]) maxPoints[p] = row.points
        if (maxWins[p] === undefined || row.wins > maxWins[p]) maxWins[p] = row.wins
        const gp = row.gamepoints ?? 0
        if (maxGamepoints[p] === undefined || gp > maxGamepoints[p]) maxGamepoints[p] = gp
      }
      for (const player of Object.keys(maxGames)) {
        ensurePlayer(player)
        totals[player].games += maxGames[player] ?? 0
        totals[player].points += maxPoints[player] ?? 0
        totals[player].wins += maxWins[player] ?? 0
        totals[player].gamepoints += maxGamepoints[player] ?? 0
      }
    }

    const sorted = Object.entries(totals).sort(([, a], [, b]) => b.points - a.points)
    const leaderPoints = sorted[0]?.[1].points ?? 0
    const leaderGamepoints = sorted[0]?.[1].gamepoints ?? 0
    return sorted.map(([name, data], index) => ({
        position: index + 1,
        bearo: (
          <span className="relative">
            {name}
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: data.hoverColor }} />
          </span>
        ),
        games: data.games,
        wins: data.wins,
        points: data.points,
        difference: index === 0 ? "-" : String(data.points - leaderPoints),
        gamepoints: data.gamepoints,
        gamepointsDifference: index === 0 ? "-" : String(data.gamepoints - leaderGamepoints),
        winPercentage: data.games > 0 ? `${((data.wins / data.games) * 100).toFixed(1)}%` : "0%",
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
      // For the current season, use the live data from sevenOkerEntry
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
            <SevenOkerChartToggle entries={currentSeasonChartData} pieChartData={currentSeasonPieData} />
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
      // For the 2024/25 season, use the historical data from sevenOkerEntry2024
      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <DataTable columns={columns} data={historicalSeasonData} />

          <section className="mt-12">
            <SevenOkerChartToggle entries={historicalSeasonChartData} pieChartData={historicalSeasonPieData} />
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
        <AddGameDialog
          apiEndpoint="/api/7oker-game"
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
