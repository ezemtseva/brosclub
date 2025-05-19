"use client"

import type React from "react"

import { useState } from "react"
import DataTable from "./DataTable"
import dynamic from "next/dynamic"

const BetsChart = dynamic(() => import("./BetsChart"), { ssr: false })
const PieChart = dynamic(() => import("./PieChart"), { ssr: false })

// Define the seasons array with all the required seasons
const seasons = [
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
] as const
type Season = (typeof seasons)[number]

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
const playerColors = {
  Vanilla: "#ea7878",
  Choco: "#4b98de",
  Chocolate: "#4b98de", // Same as Choco
  Panda: "#4fcb90",
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
        player: createPlayerElement("Chocolate"),
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
    highlights: ["Choco scored the most points in a season"],
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
        player: createPlayerElement("Chocolate"),
        games: 38,
        points: 234,
        difference: "15",
        hoverColor: playerColors.Chocolate,
      },
    ],
    highlights: [
      "Panda held first place for 38 consecutive rounds (whole season)",
      "Pand won his 3rd cup in a row.. for the second time!",
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
        player: createPlayerElement("Chocolate"),
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
        player: createPlayerElement("Chocolate"),
        games: 38,
        points: 244,
        difference: "9",
        hoverColor: playerColors.Chocolate,
      },
    ],
    highlights: ["Vanilla scored the most points in a round – 17/30"],
  },
  "2019/20": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Chocolate"),
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
    highlights: ["The smallest gap between 1st and 2nd place"],
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
        player: createPlayerElement("Chocolate"),
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
        player: createPlayerElement("Chocolate"),
        games: "?",
        points: 443,
        difference: "59",
        hoverColor: playerColors.Chocolate,
      },
    ],
    highlights: ["Vanilla set the record for most correctly predicted scores in a day – 4/5"],
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
        player: createPlayerElement("Chocolate"),
        games: "?",
        points: 490,
        difference: "2",
        hoverColor: playerColors.Chocolate,
      },
    ],
    highlights: ["The largest gap between 1st and 2nd place"],
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
        player: createPlayerElement("Chocolate"),
        games: "?",
        points: 535,
        difference: "57",
        hoverColor: playerColors.Chocolate,
      },
    ],
    highlights: ["Panda won his 3rd cup in a row"],
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
        player: createPlayerElement("Chocolate"),
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
        points: 220,
        difference: "-",
        hoverColor: playerColors.Panda,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        points: 206,
        difference: "14",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Chocolate"),
        points: 194,
        difference: "12",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
}

type BetsSeasonTabsProps = {
  currentSeasonData: any[]
  currentSeasonChartData: any[]
  currentSeasonPieData: any[]
  columns: any[]
}

export default function BetsSeasonTabs({
  currentSeasonData,
  currentSeasonChartData,
  currentSeasonPieData,
  columns,
}: BetsSeasonTabsProps) {
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
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <BetsChart entries={currentSeasonChartData} />
              </div>
              <div className="w-full md:w-1/3">
                <PieChart data={currentSeasonPieData} />
              </div>
            </div>
          </section>
        </>
      )
    } else if (pastSeasonsData[activeSeason]) {
      // For seasons with data, use the provided static data
      const seasonData = pastSeasonsData[activeSeason]!

      // Create modified columns for past seasons without wins and winPercentage
      let seasonColumns = columns.filter((col) => col.accessor !== "wins" && col.accessor !== "winPercentage")

      // For 2012-2017 seasons, also remove the games column
      const oldSeasons = ["2012", "2013", "2014", "2015", "2016", "2017"]
      if (oldSeasons.includes(activeSeason)) {
        seasonColumns = seasonColumns.filter((col) => col.accessor !== "games")
      }

      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <DataTable columns={seasonColumns} data={seasonData.standings} />

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
