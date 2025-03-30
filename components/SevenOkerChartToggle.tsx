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
      <div className="flex items-center mb-6">
        <h2 className="text-title font-bold mr-4">Weekly progress</h2>
        <div className="flex space-x-2 rounded-lg p-1">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              chartView === "points" ? "bg-gray-500/50" : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setChartView("points")}
          >
            Points per Win
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              chartView === "gamepoints" ? "bg-gray-500/50" : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setChartView("gamepoints")}
          >
            Points per Game
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <SevenOkerChart entries={entries} dataKey={chartView} />
        </div>
        <div className="w-full md:w-1/3">
          <PieChart data={pieChartData} />
        </div>
      </div>
    </>
  )
}

