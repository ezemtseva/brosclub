"use client"

import type React from "react"

import { useState } from "react"
import DataTable from "./DataTable"
import ImageCarousel from "./ImageCarousel"
import dynamic from "next/dynamic"

const PokerChart = dynamic(() => import("./PokerChart"), { ssr: false })
const PieChart = dynamic(() => import("./PieChart"), { ssr: false })

// Define the seasons array with all the required seasons - added 2025/26 as first tab
const seasons = ["2025/26", "2024/25", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012"] as const
type Season = (typeof seasons)[number]

// Define types for the standings data
type StandingsData = {
  position: number
  bearo: React.ReactNode
  games: number
  wins: number
  points: number
  pointsDifference: string
  winPercentage: string
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
  standings?: StandingsData[]
  pieChartData?: PieChartData[]
  highlights?: string[]
}

// Define type for past seasons data
type PastSeasonsData = {
  [key in Season]?: SeasonData
}

// Static data for past seasons - will be populated later
const pastSeasonsData: PastSeasonsData = {
  "2020": {
    standings: [
      {
        position: 1,
        bearo: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 58,
        wins: 24,
        points: 70,
        pointsDifference: "-",
        winPercentage: "41.4%",
        hoverColor: "#4fcb90",
      },
      {
        position: 2,
        bearo: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 58,
        wins: 15,
        points: 55,
        pointsDifference: "15",
        winPercentage: "25.9%",
        hoverColor: "#4b98de",
      },
      {
        position: 3,
        bearo: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 58,
        wins: 19,
        points: 49,
        pointsDifference: "6",
        winPercentage: "32.8%",
        hoverColor: "#ea7878",
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 24,
        color: "#4fcb90",
      },
      {
        name: "Choco",
        value: 15,
        color: "#4b98de",
      },
      {
        name: "Vanilla",
        value: 19,
        color: "#ea7878",
      },
    ],
  },
  "2019": {
    standings: [
      {
        position: 1,
        bearo: <span className="relative bg-gray-200 px-2 py-1 rounded">DSQ</span>,
        games: 24,
        wins: 10,
        points: 43,
        pointsDifference: "-",
        winPercentage: "41.7%",
        hoverColor: "#cccccc",
      },
      {
        position: 2,
        bearo: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 24,
        wins: 8,
        points: 39,
        pointsDifference: "4",
        winPercentage: "33.3%",
        hoverColor: "#4fcb90",
      },
      {
        position: 3,
        bearo: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 24,
        wins: 3,
        points: 32,
        pointsDifference: "7",
        winPercentage: "12.5%",
        hoverColor: "#ea7878",
      },
      {
        position: 4,
        bearo: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 24,
        wins: 3,
        points: 30,
        pointsDifference: "2",
        winPercentage: "12.5%",
        hoverColor: "#4b98de",
      },
    ],
    pieChartData: [
      {
        name: "DSQ",
        value: 10,
        color: "#cccccc",
      },
      {
        name: "Panda",
        value: 8,
        color: "#4fcb90",
      },
      {
        name: "Vanilla",
        value: 3,
        color: "#ea7878",
      },
      {
        name: "Choco",
        value: 3,
        color: "#4b98de",
      },
    ],
  },
  "2018": {
    standings: [
      {
        position: 1,
        bearo: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 44,
        wins: 22,
        points: 90,
        pointsDifference: "-",
        winPercentage: "50.0%",
        hoverColor: "#4fcb90",
      },
      {
        position: 2,
        bearo: <span className="relative bg-gray-200 px-2 py-1 rounded">DSQ</span>,
        games: 44,
        wins: 12,
        points: 66,
        pointsDifference: "24",
        winPercentage: "27.3%",
        hoverColor: "#cccccc",
      },
      {
        position: 3,
        bearo: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 44,
        wins: 7,
        points: 59,
        pointsDifference: "7",
        winPercentage: "15.9%",
        hoverColor: "#ea7878",
      },
      {
        position: 4,
        bearo: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 44,
        wins: 3,
        points: 49,
        pointsDifference: "10",
        winPercentage: "6.8%",
        hoverColor: "#4b98de",
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 22,
        color: "#4fcb90",
      },
      {
        name: "DSQ",
        value: 12,
        color: "#cccccc",
      },
      {
        name: "Vanilla",
        value: 7,
        color: "#ea7878",
      },
      {
        name: "Choco",
        value: 3,
        color: "#4b98de",
      },
    ],
    highlights: ["Panda set the biggest win rate in a season"],
  },
  "2017": {
    standings: [
      {
        position: 1,
        bearo: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 36,
        wins: 17,
        points: 72,
        pointsDifference: "-",
        winPercentage: "47.2%",
        hoverColor: "#4fcb90",
      },
      {
        position: 2,
        bearo: <span className="relative bg-gray-200 px-2 py-1 rounded">DSQ</span>,
        games: 36,
        wins: 9,
        points: 49,
        pointsDifference: "23",
        winPercentage: "25.0%",
        hoverColor: "#cccccc",
      },
      {
        position: 3,
        bearo: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 36,
        wins: 4,
        points: 47,
        pointsDifference: "2",
        winPercentage: "11.1%",
        hoverColor: "#ea7878",
      },
      {
        position: 4,
        bearo: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 36,
        wins: 6,
        points: 47,
        pointsDifference: "0",
        winPercentage: "16.7%",
        hoverColor: "#4b98de",
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 17,
        color: "#4fcb90",
      },
      {
        name: "DSQ",
        value: 9,
        color: "#cccccc",
      },
      {
        name: "Choco",
        value: 6,
        color: "#4b98de",
      },
      {
        name: "Vanilla",
        value: 4,
        color: "#ea7878",
      },
    ],
    highlights: ["The largest gap between 1st and 2nd place"],
  },
  "2016": {
    standings: [
      {
        position: 1,
        bearo: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 38,
        wins: 12,
        points: 67,
        pointsDifference: "-",
        winPercentage: "31.6%",
        hoverColor: "#4fcb90",
      },
      {
        position: 2,
        bearo: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 38,
        wins: 11,
        points: 60,
        pointsDifference: "7",
        winPercentage: "28.9%",
        hoverColor: "#ea7878",
      },
      {
        position: 3,
        bearo: <span className="relative bg-gray-200 px-2 py-1 rounded">DSQ</span>,
        games: 38,
        wins: 9,
        points: 55,
        pointsDifference: "5",
        winPercentage: "23.7%",
        hoverColor: "#cccccc",
      },
      {
        position: 4,
        bearo: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 38,
        wins: 6,
        points: 46,
        pointsDifference: "9",
        winPercentage: "15.8%",
        hoverColor: "#4b98de",
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 12,
        color: "#4fcb90",
      },
      {
        name: "Vanilla",
        value: 11,
        color: "#ea7878",
      },
      {
        name: "DSQ",
        value: 9,
        color: "#cccccc",
      },
      {
        name: "Choco",
        value: 6,
        color: "#4b98de",
      },
    ],
  },
  "2015": {
    standings: [
      {
        position: 1,
        bearo: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 70,
        wins: 29,
        points: 124,
        pointsDifference: "-",
        winPercentage: "41.4%",
        hoverColor: "#4fcb90",
      },
      {
        position: 2,
        bearo: <span className="relative bg-gray-200 px-2 py-1 rounded">DSQ</span>,
        games: 70,
        wins: 18,
        points: 119,
        pointsDifference: "5",
        winPercentage: "25.7%",
        hoverColor: "#cccccc",
      },
      {
        position: 3,
        bearo: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 70,
        wins: 10,
        points: 95,
        pointsDifference: "24",
        winPercentage: "14.3%",
        hoverColor: "#ea7878",
      },
      {
        position: 4,
        bearo: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 70,
        wins: 14,
        points: 94,
        pointsDifference: "1",
        winPercentage: "20.0%",
        hoverColor: "#4b98de",
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 29,
        color: "#4fcb90",
      },
      {
        name: "DSQ",
        value: 18,
        color: "#cccccc",
      },
      {
        name: "Choco",
        value: 14,
        color: "#4b98de",
      },
      {
        name: "Vanilla",
        value: 10,
        color: "#ea7878",
      },
    ],
    highlights: ["The longest poker game lasted 1 hour and 41 minutes"],
  },
  "2014": {
    standings: [
      {
        position: 1,
        bearo: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 67,
        wins: 24,
        points: 114,
        pointsDifference: "-",
        winPercentage: "35.8%",
        hoverColor: "#4fcb90",
      },
      {
        position: 2,
        bearo: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 67,
        wins: 14,
        points: 110,
        pointsDifference: "4",
        winPercentage: "20.9%",
        hoverColor: "#ea7878",
      },
      {
        position: 3,
        bearo: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 67,
        wins: 16,
        points: 105,
        pointsDifference: "5",
        winPercentage: "23.9%",
        hoverColor: "#4b98de",
      },
      {
        position: 4,
        bearo: <span className="relative bg-gray-200 px-2 py-1 rounded">DSQ</span>,
        games: 67,
        wins: 13,
        points: 75,
        pointsDifference: "30",
        winPercentage: "19.4%",
        hoverColor: "#cccccc",
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 24,
        color: "#4fcb90",
      },
      {
        name: "Choco",
        value: 16,
        color: "#4b98de",
      },
      {
        name: "Vanilla",
        value: 14,
        color: "#ea7878",
      },
      {
        name: "DSQ",
        value: 13,
        color: "#cccccc",
      },
    ],
    highlights: [
      "Vanilla is the first player to get a six- and seven-card straight flush",
      "Panda is the first and only player to get a royal flush (hearts)",
    ],
  },
  "2013": {
    standings: [
      {
        position: 1,
        bearo: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 48,
        wins: 20,
        points: 142,
        pointsDifference: "-",
        winPercentage: "41.7%",
        hoverColor: "#4fcb90",
      },
      {
        position: 2,
        bearo: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 48,
        wins: 13,
        points: 136,
        pointsDifference: "6",
        winPercentage: "27.1%",
        hoverColor: "#ea7878",
      },
      {
        position: 3,
        bearo: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 48,
        wins: 7,
        points: 117,
        pointsDifference: "19",
        winPercentage: "14.6%",
        hoverColor: "#4b98de",
      },
      {
        position: 4,
        bearo: <span className="relative bg-gray-200 px-2 py-1 rounded">DSQ</span>,
        games: 48,
        wins: 8,
        points: 89,
        pointsDifference: "28",
        winPercentage: "16.7%",
        hoverColor: "#cccccc",
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 20,
        color: "#4fcb90",
      },
      {
        name: "Vanilla",
        value: 13,
        color: "#ea7878",
      },
      {
        name: "DSQ",
        value: 8,
        color: "#cccccc",
      },
      {
        name: "Choco",
        value: 7,
        color: "#4b98de",
      },
    ],
    highlights: ["Choco is the first player to get a straight flush and four aces"],
  },
  "2012": {
    standings: [
      {
        position: 1,
        bearo: <span className="relative bg-gray-200 px-2 py-1 rounded">DSQ</span>,
        games: 21,
        wins: 7,
        points: 47,
        pointsDifference: "-",
        winPercentage: "33.3%",
        hoverColor: "#cccccc",
      },
      {
        position: 2,
        bearo: (
          <span className="relative">
            Panda
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4fcb90" }} />
          </span>
        ),
        games: 21,
        wins: 6,
        points: 46,
        pointsDifference: "1",
        winPercentage: "28.6%",
        hoverColor: "#4fcb90",
      },
      {
        position: 3,
        bearo: (
          <span className="relative">
            Vanilla
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#ea7878" }} />
          </span>
        ),
        games: 21,
        wins: 3,
        points: 45,
        pointsDifference: "1",
        winPercentage: "14.3%",
        hoverColor: "#ea7878",
      },
      {
        position: 4,
        bearo: (
          <span className="relative">
            Choco
            <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: "#4b98de" }} />
          </span>
        ),
        games: 21,
        wins: 5,
        points: 44,
        pointsDifference: "1",
        winPercentage: "23.8%",
        hoverColor: "#4b98de",
      },
    ],
    pieChartData: [
      {
        name: "DSQ",
        value: 7,
        color: "#cccccc",
      },
      {
        name: "Panda",
        value: 6,
        color: "#4fcb90",
      },
      {
        name: "Choco",
        value: 5,
        color: "#4b98de",
      },
      {
        name: "Vanilla",
        value: 3,
        color: "#ea7878",
      },
    ],
    highlights: ["Panda won the first club game", "The smallest gap between 1st and 2nd place"],
  },
}

type HoldemSeasonTabsProps = {
  currentSeasonData: StandingsData[]
  currentSeasonChartData: any[]
  currentSeasonPieData: PieChartData[]
  currentSeasonHighlights: any[]
  historicalSeasonData: StandingsData[]
  historicalSeasonChartData: any[]
  historicalSeasonPieData: PieChartData[]
  historicalSeasonHighlights: any[]
  columns: any[]
}

export default function HoldemSeasonTabs({
  currentSeasonData,
  currentSeasonChartData,
  currentSeasonPieData,
  currentSeasonHighlights,
  historicalSeasonData,
  historicalSeasonChartData,
  historicalSeasonPieData,
  historicalSeasonHighlights,
  columns,
}: HoldemSeasonTabsProps) {
  const [activeSeason, setActiveSeason] = useState<Season>("2025/26")

  // Render content based on active tab
  const renderContent = () => {
    if (activeSeason === "2025/26") {
      // For the current season (2025/26), use the live data from pokerEntry
      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <DataTable columns={columns} data={currentSeasonData} />

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Weekly progress</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <PokerChart entries={currentSeasonChartData} />
              </div>
              <div className="w-full md:w-1/3">
                <PieChart data={currentSeasonPieData} />
              </div>
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
    } else if (activeSeason === "2024/25") {
      // For the 2024/25 season, use the historical data from pokerEntry2024
      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          <DataTable columns={columns} data={historicalSeasonData} />

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Weekly progress</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <PokerChart entries={historicalSeasonChartData} />
              </div>
              <div className="w-full md:w-1/3">
                <PieChart data={historicalSeasonPieData} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Highlights</h2>
            <div className="px-12">
              <ImageCarousel images={historicalSeasonHighlights} />
            </div>
          </section>
        </>
      )
    } else if (pastSeasonsData[activeSeason]) {
      // For seasons with static data, use the provided static data
      const seasonData = pastSeasonsData[activeSeason]!

      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
          {seasonData.standings ? (
            <DataTable columns={columns} data={seasonData.standings} />
          ) : (
            <p className="text-gray-500 italic mb-8">
              Standings data for the {activeSeason} season will be added soon.
            </p>
          )}

          {/* Only show Highlights section if there are highlights */}
          {seasonData.highlights && seasonData.highlights.length > 0 && (
            <section className="mt-12">
              <h2 className="text-title font-bold mb-6">Highlights</h2>
              <div className="flex flex-wrap gap-3 mb-8">
                {seasonData.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="inline-block bg-amber-200 text-black-800 px-4 py-2 rounded-full text-sm font-small border border-amber-100"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
              {/* Pie chart is kept in code but hidden with CSS */}
              {seasonData.pieChartData && (
                <div className="hidden">
                  <PieChart data={seasonData.pieChartData} />
                </div>
              )}
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
              This section will contain the standings, weekly progress chart, and highlights from the {activeSeason}{" "}
              Holdem Poker season.
            </p>
          </div>

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Highlights</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3">
                <div className="bg-gray-100 p-8 rounded-lg text-center h-full flex items-center justify-center">
                  <p className="text-gray-600">Win distribution chart for {activeSeason} will be displayed here.</p>
                </div>
              </div>
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
