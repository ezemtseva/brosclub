"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DataTable from "./DataTable"
import dynamic from "next/dynamic"
import AddGameDialog from "./AddGameDialog"
import PlBetsGameweek from "./PlBetsGameweek"
import { PLAYER_COLORS } from "../lib/teamColors"

const BetsChart = dynamic(() => import("./BetsChart"), { ssr: false })
const PieChart = dynamic(() => import("./PieChart"), { ssr: false })

// Define the seasons array with all the required seasons - added 2025/26 as first tabs
const seasons = [
  "2026/27",
  "2025/26",
  "2024/25",
  "2023/24",
  "2022/23",
  "2021/22",
  "2020/21",
  "2019/20",
  "2017",
  "2016",
  "2015",
  "2014",
  "2013",
  "2012",
  "All Time",
] as const
type Season = (typeof seasons)[number]

const pageTabs = ["Standings", "Insights", "Brecords"] as const
type PageTab = (typeof pageTabs)[number]

type StatCard = {
  value: string
  player?: keyof typeof PLAYER_COLORS
  description: string
}

const betsRecordCards: StatCard[] = [
  { value: "240", description: "Choco and Panda scored the same number of points in a season (2025/26)" },
  { value: "299", player: "Choco", description: "Choco scored the most points in a season (2023/24)" },
  { value: "38", player: "Panda", description: "Panda held first place for 38 consecutive rounds (2022/23)" },
  { value: "x3", description: "Panda and Vanilla have won the cup three times in a row (2012–14, 2020–23, 2015–18)" },
  { value: "56.67%", player: "Vanilla", description: "Vanilla scored the most points in a round — 17/30 (2021)" },
  { value: "4/5", player: "Vanilla", description: "Vanilla holds the record for most correctly predicted scores in a day (2016)" },
]

// Season-specific highlights, shown on the Insights tab for the selected season
const seasonHighlightCards: Partial<Record<Season, StatCard[]>> = {
  "2025/26": [
    { value: "240", description: "Choco and Panda tied for the season with the same points total" },
    { value: "0", player: "Vanilla", description: "Vanilla guessed 0 correct match results in an EPL game week" },
  ],
  "2023/24": [
    { value: "299", player: "Choco", description: "Choco scored the most points in a season" },
  ],
  "2022/23": [
    { value: "38", player: "Panda", description: "Panda held first place for 38 consecutive rounds (whole season)" },
    { value: "x3", player: "Panda", description: "Panda won his 3rd cup in a row — his second three-peat" },
  ],
  "2020/21": [
    { value: "17/30", player: "Vanilla", description: "Vanilla scored the most points in a round" },
  ],
  "2019/20": [
    { value: "4", description: "Smallest gap between 1st and 2nd place this season" },
  ],
  "2016": [
    { value: "4/5", player: "Vanilla", description: "Vanilla set the record for most correctly predicted scores in a day" },
  ],
  "2015": [
    { value: "68", description: "Largest gap between 1st and 2nd place this season" },
  ],
  "2014": [
    { value: "x3", player: "Panda", description: "Panda won his 3rd cup in a row" },
  ],
}

function StatCardTile({ card }: { card: StatCard }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col gap-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
      <div className="h-14 flex items-center">
        <div className="text-3xl font-bold leading-none" style={{ color: card.player ? PLAYER_COLORS[card.player] : "#1f2937" }}>{card.value}</div>
      </div>
      <p className="text-sm text-gray-600">{card.description}</p>
    </div>
  )
}

// Define types for the standings data
type StandingsData = {
  position: number
  player: React.ReactNode
  games?: number | string
  wins?: number
  points: number
  difference: string
  winPercentage?: string
  hoverColor: string
}

// Define type for pie chart data
type PieChartData = {
  name: string
  value: number
  color: string
}

// Define type for season data
type SeasonData = {
  standings: StandingsData[]
  pieChartData?: PieChartData[]
  highlights?: string[]
}

// Define type for past seasons data
type PastSeasonsData = {
  [key in Season]?: SeasonData
}

// Player colors for consistent styling
const playerColors: Record<string, string> = {
  ...PLAYER_COLORS,
  Chocolate: PLAYER_COLORS.Choco, // Same as Choco
}

// Helper function to create player element with consistent styling
const createPlayerElement = (name: string) => {
  const color = playerColors[name as keyof typeof playerColors] || "#cccccc"
  return (
    <span className="relative">
      {name}
      <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: color }} />
    </span>
  )
}

// Static data for past seasons
const pastSeasonsData: PastSeasonsData = {
  "2023/24": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Choco"),
        games: 38,
        points: 299,
        difference: "-",
        hoverColor: playerColors.Chocolate,
      },
      {
        position: 2,
        player: createPlayerElement("Panda"),
        games: 38,
        points: 275,
        difference: "24",
        hoverColor: playerColors.Panda,
      },
      {
        position: 3,
        player: createPlayerElement("Vanilla"),
        games: 38,
        points: 270,
        difference: "5",
        hoverColor: playerColors.Vanilla,
      },
    ],
  },
  "2022/23": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Panda"),
        games: 38,
        points: 265,
        difference: "-",
        hoverColor: playerColors.Panda,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: 38,
        points: 249,
        difference: "16",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: 38,
        points: 234,
        difference: "15",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2021/22": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Panda"),
        games: 38,
        points: 269,
        difference: "-",
        hoverColor: playerColors.Panda,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: 38,
        points: 261,
        difference: "8",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: 38,
        points: 240,
        difference: "21",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2020/21": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Panda"),
        games: 38,
        points: 262,
        difference: "-",
        hoverColor: playerColors.Panda,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: 38,
        points: 253,
        difference: "9",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: 38,
        points: 244,
        difference: "9",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2019/20": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Choco"),
        games: 38,
        points: 269,
        difference: "-",
        hoverColor: playerColors.Chocolate,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: 38,
        points: 265,
        difference: "4",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Panda"),
        games: 38,
        points: 263,
        difference: "2",
        hoverColor: playerColors.Panda,
      },
    ],
  },
  "2017": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Vanilla"),
        games: "?",
        points: 460,
        difference: "-",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 2,
        player: createPlayerElement("Panda"),
        games: "?",
        points: 453,
        difference: "7",
        hoverColor: playerColors.Panda,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: "?",
        points: 389,
        difference: "64",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2016": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Vanilla"),
        games: "?",
        points: 526,
        difference: "-",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 2,
        player: createPlayerElement("Panda"),
        games: "?",
        points: 502,
        difference: "24",
        hoverColor: playerColors.Panda,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: "?",
        points: 443,
        difference: "59",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2015": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Vanilla"),
        games: "?",
        points: 560,
        difference: "-",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 2,
        player: createPlayerElement("Panda"),
        games: "?",
        points: 492,
        difference: "68",
        hoverColor: playerColors.Panda,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: "?",
        points: 490,
        difference: "2",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2014": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Panda"),
        games: "?",
        points: 623,
        difference: "-",
        hoverColor: playerColors.Panda,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: "?",
        points: 592,
        difference: "31",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: "?",
        points: 535,
        difference: "57",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2013": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Panda"),
        games: "?",
        points: 584,
        difference: "-",
        hoverColor: playerColors.Panda,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: "?",
        points: 579,
        difference: "5",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: "?",
        points: 538,
        difference: "41",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2012": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Panda"),
        games: "?",
        points: 220,
        difference: "-",
        hoverColor: playerColors.Panda,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: "?",
        points: 206,
        difference: "14",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: "?",
        points: 194,
        difference: "12",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
}

type BetsSeasonTabsProps = {
  title: string
  description: string
  currentSeasonData: any[]
  currentSeasonChartData: any[]
  currentSeasonPieData: any[]
  season2526Data: any[]
  season2526ChartData: any[]
  season2526PieData: any[]
  historicalSeasonData: any[]
  historicalSeasonChartData: any[]
  historicalSeasonPieData: any[]
  columns: any[]
  initialGameweek: number
  initialMatches: any[]
}

// Helper to reverse-map PLAYER_COLORS color -> player name
function playerNameFromColor(color: string): string {
  return Object.entries(playerColors).find(([, c]) => c === color)?.[0] ?? ""
}

// All Time columns
const allTimeColumns = [
  { header: "#", accessor: "position" },
  { header: "Player", accessor: "player" },
  { header: "G", accessor: "games" },
  { header: "P", accessor: "points" },
  { header: "PD", accessor: "difference" },
]

// Helper to create player element for All Time table
const createAllTimePlayerElement = (name: string) => {
  const color = playerColors[name as keyof typeof playerColors] || "#cccccc"
  return (
    <span className="relative">
      {name}
      <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: color }} />
    </span>
  )
}

export default function BetsSeasonTabs({
  title,
  description,
  currentSeasonData,
  currentSeasonChartData,
  currentSeasonPieData,
  season2526Data,
  season2526ChartData,
  season2526PieData,
  historicalSeasonData,
  historicalSeasonChartData,
  historicalSeasonPieData,
  columns,
  initialGameweek,
  initialMatches,
}: BetsSeasonTabsProps) {
  const [activeSeason, setActiveSeason] = useState<Season>("2026/27")
  const [activeTab, setActiveTab] = useState<PageTab>("Standings")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const router = useRouter()

  // Compute All Time standings
  const computeAllTimeStandings = () => {
    const totals: Record<string, { games: number; wins: number; points: number; hoverColor: string }> = {}

    const ensurePlayer = (name: string) => {
      if (!totals[name]) {
        totals[name] = { games: 0, wins: 0, points: 0, hoverColor: playerColors[name] ?? "#cccccc" }
      }
    }

    // From DB seasons: max games/points per player from chart data, wins from standings
    const dbSets = [
      { chartData: currentSeasonChartData, standings: currentSeasonData },
      { chartData: season2526ChartData, standings: season2526Data },
      { chartData: historicalSeasonChartData, standings: historicalSeasonData },
    ]
    for (const { chartData, standings } of dbSets) {
      const maxGames: Record<string, number> = {}
      const maxPoints: Record<string, number> = {}
      for (const row of chartData) {
        const p = row.player as string
        if (maxGames[p] === undefined || row.games > maxGames[p]) maxGames[p] = row.games
        if (maxPoints[p] === undefined || row.points > maxPoints[p]) maxPoints[p] = row.points
      }
      const winsMap: Record<string, number> = {}
      for (const row of standings) {
        const name = playerNameFromColor(row.hoverColor)
        if (name) winsMap[name] = row.wins ?? 0
      }
      for (const [player, g] of Object.entries(maxGames)) {
        ensurePlayer(player)
        totals[player].games += g
        totals[player].points += maxPoints[player] ?? 0
        totals[player].wins += winsMap[player] ?? 0
      }
    }

    // From static pastSeasonsData
    for (const seasonKey of Object.keys(pastSeasonsData)) {
      const sd = pastSeasonsData[seasonKey as keyof typeof pastSeasonsData]
      if (!sd) continue
      for (const entry of sd.standings) {
        const name = playerNameFromColor(entry.hoverColor)
        if (!name) continue
        ensurePlayer(name)
        totals[name].games += typeof entry.games === "number" ? entry.games : 0
        totals[name].points += entry.points
        totals[name].wins += entry.wins ?? 0
      }
    }

    const sorted = Object.entries(totals).sort(([, a], [, b]) => b.points - a.points)
    const leaderPoints = sorted[0]?.[1].points ?? 0
    return sorted.map(([name, data], index) => ({
        position: index + 1,
        player: createAllTimePlayerElement(name),
        games: data.games,
        wins: data.wins,
        points: data.points,
        difference: index === 0 ? "-" : String(data.points - leaderPoints),
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
      if (currentSeasonData.length === 0 || currentSeasonData.every(r => r.games === 0)) {
        return (
          <p className="text-gray-500 text-center italic mt-32">The new season kicks off on August 21</p>
        )
      }
      return (
        <>
          <div className="mb-6">
            <h2 className="text-title font-bold">Standings</h2>
          </div>
          <DataTable columns={columns} data={currentSeasonData} />

          <section className="mt-12">
            <PlBetsGameweek initialGameweek={initialGameweek} initialMatches={initialMatches} />
          </section>

          <section className="mt-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <h2 className="text-title font-bold mb-6">Season Progress</h2>
                <BetsChart entries={currentSeasonChartData} />
              </div>
              <div className="w-full md:w-1/3">
                <h2 className="text-title font-bold mb-6">Wins Distribution</h2>
                <PieChart data={currentSeasonPieData} />
              </div>
            </div>
          </section>
        </>
      )
    } else if (activeSeason === "2025/26") {
      const columns2526 = columns.filter((col) => col.accessor !== "outcomePercent" && col.accessor !== "exactPercent")
      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <DataTable columns={columns2526} data={season2526Data} />

          <section className="mt-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <h2 className="text-title font-bold mb-6">Season Progress</h2>
                <BetsChart entries={season2526ChartData} />
              </div>
              <div className="w-full md:w-1/3">
                <h2 className="text-title font-bold mb-6">Wins Distribution</h2>
                <PieChart data={season2526PieData} />
              </div>
            </div>
          </section>
        </>
      )
    } else if (activeSeason === "2024/25") {
      const historicalColumns = columns.filter((col) => col.accessor !== "outcomePercent" && col.accessor !== "exactPercent")
      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <DataTable columns={historicalColumns} data={historicalSeasonData} />

          <section className="mt-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <h2 className="text-title font-bold mb-6">Season Progress</h2>
                <BetsChart entries={historicalSeasonChartData} />
              </div>
              <div className="w-full md:w-1/3">
                <h2 className="text-title font-bold mb-6">Wins Distribution</h2>
                <PieChart data={historicalSeasonPieData} />
              </div>
            </div>
          </section>
        </>
      )
    } else if (pastSeasonsData[activeSeason]) {
      // For seasons with static data, use the provided static data
      const seasonData = pastSeasonsData[activeSeason]!

      // Create modified columns for past seasons without wins and winPercentage
      let seasonColumns = columns.filter((col) => col.accessor !== "wins" && col.accessor !== "winPercentage" && col.accessor !== "outcomePercent" && col.accessor !== "exactPercent")

      // For 2012-2017 seasons, also remove the games column
      const oldSeasons = ["2012", "2013", "2014", "2015", "2016", "2017"]
      if (oldSeasons.includes(activeSeason)) {
        seasonColumns = seasonColumns.filter((col) => col.accessor !== "games")
      }

      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <DataTable columns={seasonColumns} data={seasonData.standings} />
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
    } else {
      // For other past seasons, show placeholder content that will be replaced with static data later
      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <p className="text-gray-500 italic mb-8">Historical data for the {activeSeason} season will be added soon.</p>

          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Season {activeSeason} Archive</h3>
            <p className="text-gray-600">
              This section will contain the standings from the {activeSeason} betting season.
            </p>
          </div>
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
      {betsRecordCards.map((card, i) => <StatCardTile key={i} card={card} />)}
    </div>
  )

  return (
    <>
      {/* Page header + season dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-title font-bold mb-4">{title}</h1>
          <p className="text-basic text-gray-600">{description}</p>
        </div>
        <select
          value={activeSeason}
          onChange={(e) => {
            const season = e.target.value as Season
            setActiveSeason(season)
            if (season === "All Time" && activeTab === "Insights") setActiveTab("Standings")
          }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 self-start"
        >
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>
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
          apiEndpoint="/api/bets-game"
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
      {activeTab === "Standings" && renderStandingsContent()}
      {activeTab === "Insights" && renderInsightsContent()}
      {activeTab === "Brecords" && renderBrecordsContent()}
    </>
  )
}
