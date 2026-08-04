"use client"

import type React from "react"

import { useState } from "react"
import DataTable from "./DataTable"
import ImageCarousel from "./ImageCarousel"
import dynamicImport from "next/dynamic"
import { PLAYER_COLORS } from "../lib/teamColors"
import Image from "next/image"

const PLAYER_AVATARS: Record<keyof typeof PLAYER_COLORS, string> = {
  Vanilla: "/imgs/vanilla.png",
  Choco: "/imgs/choco.png",
  Panda: "/imgs/panda.png",
}

const FplChart = dynamicImport(() => import("./FplChart"), { ssr: false })
const PieChart = dynamicImport(() => import("./PieChart"), { ssr: false })

const seasons = [
  "2026/27",
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

const pageTabs = ["Standings", "Insights", "Brecords"] as const
type PageTab = (typeof pageTabs)[number]

type StatCard = {
  value?: string
  player?: keyof typeof PLAYER_COLORS
  description: string
}

const fplRecordCards: StatCard[] = [
  { value: "2.511", player: "Panda", description: "Panda holds the record for the most points in a season (2023/24)" },
  { value: "25", player: "Panda", description: "Panda held first place for 25 consecutive rounds (2022/23)" },
  { value: "141", player: "Choco", description: "Choco scored the most points in a round with a boost (2021/22)" },
  { value: "131", player: "Vanilla", description: "Vanilla scored the most points in a round without any boost (2022/23)" },
]

// Season-specific highlights, shown on the Insights tab for the selected season
const seasonHighlightCards: Partial<Record<Season, StatCard[]>> = {
  "2025/26": [
    { player: "Choco", description: "Choco has won the first FPL title" },
  ],
  "2023/24": [
    { value: "2.511", player: "Panda", description: "Panda set the new points record for a season" },
  ],
  "2022/23": [
    { value: "25", player: "Panda", description: "Panda held first place for 25 consecutive rounds" },
    { value: "131", player: "Vanilla", description: "Vanilla scored the most points in a round without any boosts" },
  ],
  "2021/22": [
    { value: "141", player: "Choco", description: "Choco scored the most points in a round with a boost" },
    { value: "23", description: "Smallest gap between 1st and 2nd place this season" },
  ],
  "2017/18": [
    { value: "256", description: "Largest gap between 1st and 2nd place this season" },
  ],
}

function StatCardTile({ card }: { card: StatCard }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col gap-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
      <div className="h-14 flex items-center">
        {card.value ? (
          <div className="text-3xl font-bold leading-none" style={{ color: card.player ? PLAYER_COLORS[card.player] : "#1f2937" }}>{card.value}</div>
        ) : card.player ? (
          <Image src={PLAYER_AVATARS[card.player]} alt={card.player} width={56} height={56} className="rounded-full object-cover w-14 h-14" />
        ) : null}
      </div>
      <p className="text-sm text-gray-600">{card.description}</p>
    </div>
  )
}

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
  },
}

type FplSeasonTabsProps = {
  title: React.ReactNode
  description: string
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

// Helper to reverse-map PLAYER_COLORS color -> player name
function playerNameFromColor(color: string): string {
  return Object.entries(PLAYER_COLORS).find(([, c]) => c === color)?.[0] ?? ""
}

// All Time columns
const allTimeColumns = [
  { header: "#", accessor: "position" },
  { header: "Player", accessor: "player" },
  { header: "GW", accessor: "games" },
  { header: "P", accessor: "points" },
  { header: "PD", accessor: "difference" },
]

export default function FplSeasonTabs({
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
}: FplSeasonTabsProps) {
  const [activeSeason, setActiveSeason] = useState<Season>("2026/27")
  const [activeTab, setActiveTab] = useState<PageTab>("Standings")

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
      { chartData: season2425ChartData, standings: season2425Data },
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
  const renderStandingsContent = () => {
    if (activeSeason === "2026/27") {
      if (currentSeasonData.length === 0 || currentSeasonData.every(r => r.games === 0)) {
        return (
          <p className="text-gray-500 text-center italic mt-32">The new season kicks off on August 21</p>
        )
      }
      return (
        <>
          <h2 className="text-[16px] font-bold mb-6">Standings</h2>
          <DataTable columns={columns} data={currentSeasonData} />

          {currentSeasonChartData.length > 0 && (
            <section className="mt-12">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-2/3">
                  <h2 className="text-[16px] font-bold mb-6">Season Progress</h2>
                  <FplChart entries={currentSeasonChartData} />
                </div>
                <div className="w-full md:w-1/3">
                  <h2 className="text-[16px] font-bold mb-6">Wins Distribution</h2>
                  <PieChart data={currentSeasonPieData} />
                </div>
              </div>
            </section>
          )}

          {currentSeasonHighlights.length > 0 && (
            <section className="mt-12">
              <h2 className="text-[16px] font-bold mb-6">Highlights</h2>
              <ImageCarousel images={currentSeasonHighlights} />
            </section>
          )}
        </>
      )
    } else if (activeSeason === "2025/26") {
      // 2025/26 season — archived data from fplEntry2526
      return (
        <>
          <h2 className="text-[16px] font-bold mb-6">Standings</h2>
          <DataTable columns={columns} data={historicalSeasonData} />

          <section className="mt-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <h2 className="text-[16px] font-bold mb-6">Season Progress</h2>
                <FplChart entries={historicalSeasonChartData} />
              </div>
              <div className="w-full md:w-1/3">
                <h2 className="text-[16px] font-bold mb-6">Wins Distribution</h2>
                <PieChart data={historicalSeasonPieData} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-[16px] font-bold mb-6">Highlights</h2>
            <ImageCarousel images={historicalSeasonHighlights} />
          </section>
        </>
      )
    } else if (activeSeason === "2024/25") {
      return (
        <>
          <h2 className="text-[16px] font-bold mb-6">Standings</h2>
          <DataTable columns={columns} data={season2425Data} />

          <section className="mt-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <h2 className="text-[16px] font-bold mb-6">Season Progress</h2>
                <FplChart entries={season2425ChartData} />
              </div>
              <div className="w-full md:w-1/3">
                <h2 className="text-[16px] font-bold mb-6">Wins Distribution</h2>
                <PieChart data={season2425PieData} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-[16px] font-bold mb-6">Highlights</h2>
            <ImageCarousel images={season2425Highlights} />
          </section>
        </>
      )
    } else if (pastSeasonsData[activeSeason]) {
      // For seasons with static data, use the provided static data
      const seasonData = pastSeasonsData[activeSeason]!
      const pastColumns = columns.filter((col) => col.accessor !== "wins" && col.accessor !== "winPercent")
      return (
        <>
          <h2 className="text-[16px] font-bold mb-6">Standings</h2>
          <DataTable columns={pastColumns} data={seasonData.standings} />
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
    } else {
      // For other past seasons, show placeholder content that will be replaced with static data later
      return (
        <>
          <h2 className="text-[16px] font-bold mb-6">Standings</h2>
          <p className="text-gray-500 italic mb-8">Historical data for the {activeSeason} season will be added soon.</p>

          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Season {activeSeason} Archive</h3>
            <p className="text-gray-600">This section will contain the standings from the {activeSeason} FPL season.</p>
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
      {fplRecordCards.map((record, i) => <StatCardTile key={i} card={record} />)}
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
              if (season === "All Time" && activeTab === "Insights") setActiveTab("Standings")
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

      {/* Render content based on active page tab */}
      {activeTab === "Standings" && renderStandingsContent()}
      {activeTab === "Insights" && renderInsightsContent()}
      {activeTab === "Brecords" && renderBrecordsContent()}
    </>
  )
}
