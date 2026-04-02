"use client"

import { useState } from "react"
import dynamic from "next/dynamic"

const SevenOkerChart = dynamic(() => import("./SevenOkerChart"), { ssr: false })
const PieChart = dynamic(() => import("./PieChart"), { ssr: false })

type SevenOkerEntry = {
  id?: number
  week: number
  bearo: string
  games: number
  wins: number
  points: number
  gamepoints?: number
  createdAt?: string | null
}

type SevenOkerChartToggleProps = {
  entries: SevenOkerEntry[]
  pieChartData: any[]
}

export default function SevenOkerChartToggle({ entries, pieChartData }: SevenOkerChartToggleProps) {
  const [chartView, setChartView] = useState<"points" | "gamepoints">("points")

  return (
    <>
      {/* Mobile: title + buttons on one line */}
      <div className="flex items-center justify-between mb-6 md:hidden">
        <h2 className="text-title font-bold whitespace-nowrap">Weekly progress</h2>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
              chartView === "points"
                ? "border-gray-400 text-gray-800 bg-gray-50"
                : "border-gray-300 text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
            onClick={() => setChartView("points")}
          >
            Points
          </button>
          <button
            className={`px-3 py-1.5 text-sm border rounded-lg transition-colors whitespace-nowrap ${
              chartView === "gamepoints"
                ? "border-gray-400 text-gray-800 bg-gray-50"
                : "border-gray-300 text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
            onClick={() => setChartView("gamepoints")}
          >
            Game Points
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <div className="hidden md:flex items-center justify-between mb-4">
            <h2 className="text-title font-bold">Weekly progress</h2>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                  chartView === "points"
                    ? "border-gray-400 text-gray-800 bg-gray-50"
                    : "border-gray-300 text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
                onClick={() => setChartView("points")}
              >
                Points
              </button>
              <button
                className={`px-3 py-1.5 text-sm border rounded-lg transition-colors whitespace-nowrap ${
                  chartView === "gamepoints"
                    ? "border-gray-400 text-gray-800 bg-gray-50"
                    : "border-gray-300 text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
                onClick={() => setChartView("gamepoints")}
              >
                Game Points
              </button>
            </div>
          </div>
          <SevenOkerChart entries={entries} dataKey={chartView} />
        </div>
        <div className="w-full md:w-1/3">
          <PieChart data={pieChartData} />
        </div>
      </div>
    </>
  )
}

