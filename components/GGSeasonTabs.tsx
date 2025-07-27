"use client"

import { useState } from "react"
import DataTable from "./DataTable"
import ImageCarousel from "./ImageCarousel"
import dynamic from "next/dynamic"

const GGChart = dynamic(() => import("./GGChart"), { ssr: false })
const PieChart = dynamic(() => import("./PieChart"), { ssr: false })

// Define the seasons array
const seasons = ["2025/26", "2024/25"] as const
type Season = (typeof seasons)[number]

// Player colors for consistent styling
const playerColors = {
  Vanilla: "#ea7878",
  Choco: "#4b98de",
  Panda: "#4fcb90",
}

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

  // Render content based on active tab
  const renderContent = () => {
    if (activeSeason === "2025/26") {
      // For the current season, use the live data from ggEntry
      return (
        <>
          <h2 className="text-title font-bold mb-6">Standings</h2>
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
            <div className="px-12">
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
            <div className="px-12">
              <ImageCarousel images={historicalSeasonHighlights} />
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
