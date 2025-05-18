"use client"

import type React from "react"

import { useState } from "react"
import DataTable from "./DataTable"
import ImageCarousel from "./ImageCarousel"
import dynamicImport from "next/dynamic"

const FplChart = dynamicImport(() => import("./FplChart"), { ssr: false })

// Define the seasons array with all the required seasons
const seasons = ["2024/25", "2023/24", "2022/23", "2021/22", "2020/21", "2019/20", "2018/19", "2017/18"] as const
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
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 38,
        points: 2511,
        difference: "-",
        hoverColor: "#4fcb90",
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Chocolate
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 38,
        points: 2339,
        difference: "172",
        hoverColor: "#4b98de",
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 38,
        points: 2217,
        difference: "122",
        hoverColor: "#ea7878",
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
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 38,
        points: 2422,
        difference: "-",
        hoverColor: "#4fcb90",
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 38,
        points: 2309,
        difference: "113",
        hoverColor: "#ea7878",
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Chocolate
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 38,
        points: 2209,
        difference: "100",
        hoverColor: "#4b98de",
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
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 38,
        points: 2187,
        difference: "-",
        hoverColor: "#ea7878",
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 38,
        points: 2164,
        difference: "23",
        hoverColor: "#4fcb90",
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Chocolate
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 38,
        points: 2150,
        difference: "14",
        hoverColor: "#4b98de",
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
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 38,
        points: 2332,
        difference: "-",
        hoverColor: "#4fcb90",
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 38,
        points: 2192,
        difference: "140",
        hoverColor: "#ea7878",
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Chocolate
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 38,
        points: 2192,
        difference: "0",
        hoverColor: "#4b98de",
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
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 38,
        points: 2232,
        difference: "-",
        hoverColor: "#ea7878",
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Chocolate
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 38,
        points: 2160,
        difference: "72",
        hoverColor: "#4b98de",
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 38,
        points: 1981,
        difference: "179",
        hoverColor: "#4fcb90",
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
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 38,
        points: 2017,
        difference: "-",
        hoverColor: "#4fcb90",
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 38,
        points: 1967,
        difference: "50",
        hoverColor: "#ea7878",
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Chocolate
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 38,
        points: 1907,
        difference: "60",
        hoverColor: "#4b98de",
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
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 38,
        points: 2177,
        difference: "-",
        hoverColor: "#ea7878",
      },
      {
        position: 2,
        player: (
          <span className="relative">
            Chocolate
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 38,
        points: 1921,
        difference: "256",
        hoverColor: "#4b98de",
      },
      {
        position: 3,
        player: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 38,
        points: 1902,
        difference: "19",
        hoverColor: "#4fcb90",
      },
    ],
  },
}

type FplSeasonTabsProps = {
  currentSeasonData: any[]
  currentSeasonChartData: any[]
  currentSeasonHighlights: any[]
  columns: any[]
}

export default function FplSeasonTabs({
  currentSeasonData,
  currentSeasonChartData,
  currentSeasonHighlights,
  columns,
}: FplSeasonTabsProps) {
  const [activeSeason, setActiveSeason] = useState<Season>("2024/25")

  // Render content based on active tab
  const renderContent = () => {
    if (activeSeason === "2024/25") {
      // For the current season, use the live data
      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <DataTable columns={columns} data={currentSeasonData} />

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Weekly progress</h2>
            <div className="w-full">
              <FplChart entries={currentSeasonChartData} />
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Highlights</h2>
            <div className="px-12">
              <ImageCarousel images={currentSeasonHighlights} />
            </div>
          </section>
        </>
      )
    } else if (pastSeasonsData[activeSeason]) {
      // For seasons with data, use the provided static data
      const seasonData = pastSeasonsData[activeSeason]!
      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <DataTable columns={columns} data={seasonData.standings} />

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Weekly progress</h2>
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <p className="text-gray-600">The weekly progress chart for {activeSeason} will be displayed here.</p>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Highlights</h2>
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <p className="text-gray-600">Highlight images from the {activeSeason} season will be displayed here.</p>
            </div>
          </section>
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
              This section will contain the standings, weekly progress chart, and highlights from the {activeSeason} FPL
              season.
            </p>
          </div>

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Weekly progress</h2>
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <p className="text-gray-600">The weekly progress chart for {activeSeason} will be displayed here.</p>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Highlights</h2>
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <p className="text-gray-600">Highlight images from the {activeSeason} season will be displayed here.</p>
            </div>
          </section>
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
