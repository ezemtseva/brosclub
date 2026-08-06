"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import DataTable from "./DataTable"
import ImageCarousel from "./ImageCarousel"
import SevenOkerChartToggle from "./SevenOkerChartToggle"
import AddGameDialog from "./AddGameDialog"
import { PLAYER_COLORS } from "../lib/teamColors"

// Define the seasons array
const seasons = ["2026/27", "2025/26", "2024/25", "All Time"] as const
type Season = (typeof seasons)[number]

// Player colors for consistent styling
const playerColors = PLAYER_COLORS

// Helper to reverse-map player color -> player name
function playerNameFromColor(color: string): string {
  return Object.entries(playerColors).find(([, c]) => c === color)?.[0] ?? ""
}

const pageTabs = ["Summary", "Insights", "Brecords"] as const
type PageTab = (typeof pageTabs)[number]

const PLAYER_AVATARS: Record<string, string> = {
  Vanilla: "/imgs/vanilla.png",
  Choco: "/imgs/choco.png",
  Panda: "/imgs/panda.png",
}

type StatCard = {
  value?: string
  player?: keyof typeof PLAYER_COLORS
  description: string
}

const sevenOkerRecordCards: StatCard[] = [
  { player: "Vanilla", description: "Vanilla won the first ever 7oker game (29.03.2025)" },
  { value: "71", player: "Panda", description: "Panda won the first season — took him 71 games to reach 100 points" },
  { player: "Choco", description: "Choco was the first to win a game by golden round against Panda (2024/25)" },
  { value: "5", description: "Vanilla and Choco share the longest winning streak — 5 games (2024/25 and 2025/26)" },
  { value: "298", player: "Panda", description: "Panda scored the biggest amount of points in a single game (2025/26)" },
  { value: "10.645", player: "Panda", description: "Panda holds the record for the most gamepoints in a season (2025/26)" },
]

// Season-specific highlights, shown on the Insights tab for the selected season
const seasonHighlightCards: Partial<Record<Season, StatCard[]>> = {
  "2025/26": [
    { value: "298", player: "Panda", description: "Panda set the new record for the most points in a single game" },
    { value: "5", player: "Vanilla", description: "Vanilla matched Choco's record with 5 consecutive wins" },
    { value: "10.645", player: "Panda", description: "Panda broke his own record for the most gamepoints in a season" },
  ],
  "2024/25": [
    { player: "Vanilla", description: "Vanilla won the first ever game" },
    { player: "Panda", description: "Panda won the first cup" },
    { player: "Choco", description: "Choco was the first one to win the game by golden round against Panda" },
    { value: "5", player: "Choco", description: "Choco set the longest winning streak — 5 games in a row" },
    { value: "294", player: "Vanilla", description: "Vanilla scored the biggest amount of points in a single game" },
    { value: "10.422", player: "Panda", description: "Panda scored the biggest amount of gamepoints in a season" },
  ],
}

function StatCardTile({ card }: { card: StatCard }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col gap-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
      <div className="h-14 flex items-center">
        {card.value ? (
          <div className="text-3xl font-bold leading-none" style={{ color: card.player ? PLAYER_COLORS[card.player] : "#1f2937" }}>{card.value}</div>
        ) : card.player ? (
          <Image
            src={PLAYER_AVATARS[card.player]}
            alt={card.player}
            width={56}
            height={56}
            className="rounded-full object-cover w-14 h-14"
          />
        ) : null}
      </div>
      <p className="text-sm text-gray-600">{card.description}</p>
    </div>
  )
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
  title: string
  description: React.ReactNode
  currentSeasonData: any[]
  currentSeasonChartData: any[]
  currentSeasonPieData: any[]
  currentSeasonHighlights: any[]
  historicalSeasonData: any[]
  historicalSeasonChartData: any[]
  historicalSeasonPieData: any[]
  historicalSeasonHighlights: any[]
  season2425Data: any[]
  season2425ChartData: any[]
  season2425PieData: any[]
  season2425Highlights: any[]
  columns: any[]
}

export default function SevenOkerSeasonTabs({
  title,
  description,
  currentSeasonData,
  currentSeasonChartData,
  currentSeasonPieData,
  currentSeasonHighlights,
  historicalSeasonData,
  historicalSeasonChartData,
  historicalSeasonPieData,
  historicalSeasonHighlights,
  season2425Data,
  season2425ChartData,
  season2425PieData,
  season2425Highlights,
  columns,
}: SevenOkerSeasonTabsProps) {
  const [activeSeason, setActiveSeason] = useState<Season>("2026/27")
  const [activeTab, setActiveTab] = useState<PageTab>("Summary")
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

    for (const chartData of [currentSeasonChartData, historicalSeasonChartData, season2425ChartData]) {
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
  const renderStandingsContent = () => {
    if (activeSeason === "2026/27") {
      // Current season — live data from sevenOkerEntry
      if (currentSeasonData.length === 0) {
        return (
          <p className="text-gray-500 text-center italic mt-32">The new season kicks off on August</p>
        )
      }
      return (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-bold">Standings</h2>
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

          {currentSeasonHighlights.length > 0 && (
            <section className="mt-12">
              <h2 className="text-[16px] font-bold mb-6">Highlights</h2>
              <div className="">
                <ImageCarousel images={currentSeasonHighlights} />
              </div>
            </section>
          )}
        </>
      )
    } else if (activeSeason === "2025/26") {
      // 2025/26 season — archived data from sevenOkerEntry2526
      return (
        <>
          <h2 className="text-[16px] font-bold mb-6">Standings</h2>
          <DataTable columns={columns} data={historicalSeasonData} />

          <section className="mt-12">
            <SevenOkerChartToggle entries={historicalSeasonChartData} pieChartData={historicalSeasonPieData} />
          </section>

          <section className="mt-12">
            <h2 className="text-[16px] font-bold mb-6">Highlights</h2>
            <div className="">
              <ImageCarousel images={historicalSeasonHighlights} />
            </div>
          </section>
        </>
      )
    } else if (activeSeason === "2024/25") {
      // For the 2024/25 season, use the archived data from sevenOkerEntry2024
      return (
        <>
          <h2 className="text-[16px] font-bold mb-6">Standings</h2>
          <DataTable columns={columns} data={season2425Data} />

          <section className="mt-12">
            <SevenOkerChartToggle entries={season2425ChartData} pieChartData={season2425PieData} />
          </section>

          <section className="mt-12">
            <h2 className="text-[16px] font-bold mb-6">Highlights</h2>
            <div className="">
              <ImageCarousel images={season2425Highlights} />
            </div>
          </section>
        </>
      )
    } else if (activeSeason === "All Time") {
      const allTimeData = computeAllTimeStandings()
      return (
        <>
          <h2 className="text-[16px] font-bold mb-6">All Time Standings</h2>
          <DataTable columns={allTimeColumns} data={allTimeData} />
        </>
      )
    }
  }

  const renderInsightsContent = () => {
    const highlights = seasonHighlightCards[activeSeason]
    if (highlights && highlights.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {highlights.map((card, i) => <StatCardTile key={i} card={card} />)}
        </div>
      )
    }
    return <p className="text-gray-500 text-center italic mt-32">No insights available for this season.</p>
  }

  const renderBrecordsContent = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {sevenOkerRecordCards.map((card, i) => <StatCardTile key={i} card={card} />)}
    </div>
  )

  return (
    <>
      {/* Page header + season dropdown */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-title font-bold">{title}</h1>
          <select
            value={activeSeason}
            onChange={(e) => {
              const season = e.target.value as Season
              setActiveSeason(season)
              if (season === "All Time" && activeTab === "Insights") setActiveTab("Summary")
            }}
            className="season-select border border-gray-200 rounded-lg px-3 pr-7 py-1.5 text-sm h-[30px] bg-white focus:outline-none shrink-0 w-[99px] sm:w-auto"
          >
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>
        <p className="text-basic text-gray-600 mt-4">{description}</p>
      </div>

      {/* Page tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {pageTabs.filter((tab) => !(tab === "Insights" && activeSeason === "All Time")).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-base whitespace-nowrap ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
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

      {/* Render content based on active page tab */}
      {activeTab === "Summary" && renderStandingsContent()}
      {activeTab === "Insights" && renderInsightsContent()}
      {activeTab === "Brecords" && renderBrecordsContent()}
    </>
  )
}
