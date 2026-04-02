"use client"

import type React from "react"

import { useState } from "react"
import DataTable from "./DataTable"
import ImageCarousel from "./ImageCarousel"
import dynamicImport from "next/dynamic"
import { PLAYER_COLORS } from "../lib/teamColors"

const FplChart = dynamicImport(() => import("./FplChart"), { ssr: false })
const PieChart = dynamicImport(() => import("./PieChart"), { ssr: false })

// Define the seasons array with all the required seasons - added 2025/26 as first tab
const seasons = [
  "2025/26",
  "2024/25",
  "2023/24",
  "2022/23",
  "2021/22",
  "2020/21",
  "2019/20",
  "2018/19",
  "2017/18",
  "All Time",
] as const
type Season = (typeof seasons)[number]

// Define types for the standings data
type StandingsData = {
  position: number
  player: React.ReactNode
  games: number
  points: number
  difference: string
  hoverColor: string
}

// Define type for season data
type SeasonData = {
  standings: StandingsData[]
  highlights?: string[]
}

// Define type for past seasons data
type PastSeasonsData = {
  [key in Season]?: SeasonData
}

// Static data for past seasons
const pastSeasonsData: PastSeasonsData = {
  "2023/24": {
    standings: [
      {
        position: 1,
        player: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Panda }} />
          </span>
        ),
        games: 38,
        points: 2511,
        difference: "-",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Choco }} />
          </span>
        ),
        games: 38,
        points: 2339,
        difference: "172",
        hoverColor: PLAYER_COLORS.Choco,
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Vanilla }} />
          </span>
        ),
        games: 38,
        points: 2217,
        difference: "122",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
    ],
    highlights: ["Panda set the new record - the most points in a season!"],
  },
  "2022/23": {
    standings: [
      {
        position: 1,
        player: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Panda }} />
          </span>
        ),
        games: 38,
        points: 2422,
        difference: "-",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Vanilla }} />
          </span>
        ),
        games: 38,
        points: 2309,
        difference: "113",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Choco }} />
          </span>
        ),
        games: 38,
        points: 2209,
        difference: "100",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
    highlights: [
      "Panda held first place for 25 consecutive rounds",
      "Vanilla scored the most points in a round without boosts - 131",
    ],
  },
  "2021/22": {
    standings: [
      {
        position: 1,
        player: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Vanilla }} />
          </span>
        ),
        games: 38,
        points: 2187,
        difference: "-",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Panda }} />
          </span>
        ),
        games: 38,
        points: 2164,
        difference: "23",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Choco }} />
          </span>
        ),
        games: 38,
        points: 2150,
        difference: "14",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
    highlights: [
      "Choco scored the most points in a round with a boost - 141",
      "The smallest gap between 1st and 2nd place ever",
    ],
  },
  "2020/21": {
    standings: [
      {
        position: 1,
        player: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Panda }} />
          </span>
        ),
        games: 38,
        points: 2332,
        difference: "-",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Vanilla }} />
          </span>
        ),
        games: 38,
        points: 2192,
        difference: "140",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Choco }} />
          </span>
        ),
        games: 38,
        points: 2192,
        difference: "0",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
  },
  "2019/20": {
    standings: [
      {
        position: 1,
        player: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Vanilla }} />
          </span>
        ),
        games: 38,
        points: 2232,
        difference: "-",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Choco }} />
          </span>
        ),
        games: 38,
        points: 2160,
        difference: "72",
        hoverColor: PLAYER_COLORS.Choco,
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Panda }} />
          </span>
        ),
        games: 38,
        points: 1981,
        difference: "179",
        hoverColor: PLAYER_COLORS.Panda,
      },
    ],
  },
  "2018/19": {
    standings: [
      {
        position: 1,
        player: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Panda }} />
          </span>
        ),
        games: 38,
        points: 2017,
        difference: "-",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Vanilla }} />
          </span>
        ),
        games: 38,
        points: 1967,
        difference: "50",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Choco }} />
          </span>
        ),
        games: 38,
        points: 1907,
        difference: "60",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
  },
  "2017/18": {
    standings: [
      {
        position: 1,
        player: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Vanilla }} />
          </span>
        ),
        games: 38,
        points: 2177,
        difference: "-",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Choco }} />
          </span>
        ),
        games: 38,
        points: 1921,
        difference: "256",
        hoverColor: PLAYER_COLORS.Choco,
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: PLAYER_COLORS.Panda }} />
          </span>
        ),
        games: 38,
        points: 1902,
        difference: "19",
        hoverColor: PLAYER_COLORS.Panda,
      },
    ],
    highlights: ["The largest gap between 1st and 2nd place ever"],
  },
}

type FplSeasonTabsProps = {
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

// Helper to reverse-map PLAYER_COLORS color -> player name
function playerNameFromColor(color: string): string {
  return Object.entries(PLAYER_COLORS).find(([, c]) => c === color)?.[0] ?? ""
}

// All Time columns
const allTimeColumns = [
  { header: "#", accessor: "position" },
  { header: "Player", accessor: "player" },
  { header: "GW", accessor: "games" },
  { header: "Wins", accessor: "wins" },
  { header: "Points", accessor: "points" },
  { header: "PD", accessor: "difference" },
]

export default function FplSeasonTabs({
  currentSeasonData,
  currentSeasonChartData,
  currentSeasonPieData,
  currentSeasonHighlights,
  historicalSeasonData,
  historicalSeasonChartData,
  historicalSeasonPieData,
  historicalSeasonHighlights,
  columns,
}: FplSeasonTabsProps) {
  const [activeSeason, setActiveSeason] = useState<Season>("2025/26")

  // Compute All Time standings
  const computeAllTimeStandings = () => {
    const totals: Record<string, { games: number; wins: number; points: number; hoverColor: string }> = {}

    const ensurePlayer = (name: string) => {
      if (!totals[name]) {
        totals[name] = { games: 0, wins: 0, points: 0, hoverColor: PLAYER_COLORS[name] ?? "#cccccc" }
      }
    }

    // From DB seasons: get max games and max points per player (cumulative charts)
    const dbChartSets = [
      { chartData: currentSeasonChartData, standings: currentSeasonData },
      { chartData: historicalSeasonChartData, standings: historicalSeasonData },
    ]
    for (const { chartData, standings } of dbChartSets) {
      const maxGames: Record<string, number> = {}
      const maxPoints: Record<string, number> = {}
      for (const row of chartData) {
        const p = row.player as string
        if (maxGames[p] === undefined || row.games > maxGames[p]) maxGames[p] = row.games
        if (maxPoints[p] === undefined || row.points > maxPoints[p]) maxPoints[p] = row.points
      }
      // wins from processed standings
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
      }
    }

    const sorted = Object.entries(totals).sort(([, a], [, b]) => b.points - a.points)
    const leaderPoints = sorted[0]?.[1].points ?? 0
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
        points: data.points,
        difference: index === 0 ? "-" : String(data.points - leaderPoints),
        hoverColor: data.hoverColor,
      }))
  }

  // Render content based on active tab
  const renderContent = () => {
    if (activeSeason === "2025/26") {
      // For the current season (2025/26), use the live data from fplEntry
      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <DataTable columns={columns} data={currentSeasonData} />

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Weekly progress</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <FplChart entries={currentSeasonChartData} />
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
      // For the 2024/25 season, use the historical data from fplEntry2024
      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <DataTable columns={columns} data={historicalSeasonData} />

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Weekly progress</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <FplChart entries={historicalSeasonChartData} />
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
    } else if (pastSeasonsData[activeSeason]) {
      // For seasons with static data, use the provided static data
      const seasonData = pastSeasonsData[activeSeason]!
      const pastColumns = columns.filter((col) => col.accessor !== "wins" && col.accessor !== "winPercent")
      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <DataTable columns={pastColumns} data={seasonData.standings} />

          {seasonData.highlights && seasonData.highlights.length > 0 && (
            <section className="mt-12">
              <h2 className="text-title font-bold mb-6">Highlights</h2>
              <div className="flex flex-wrap gap-3">
                {seasonData.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="inline-block bg-amber-200 text-black-800 px-4 py-2 rounded-full text-sm font-small border border-amber-100"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
            </section>
          )}
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
            <p className="text-gray-600">This section will contain the standings from the {activeSeason} FPL season.</p>
          </div>
        </>
      )
    }
  }

  return (
    <>
      {/* Season tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
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

      {/* Render content based on active tab */}
      {renderContent()}
    </>
  )
}
