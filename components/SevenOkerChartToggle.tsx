"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Panel, BearLegend, WinsSplit } from "./design/Panels"

const SevenOkerChart = dynamic(() => import("./SevenOkerChart"), { ssr: false })

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
  /** Games played this season — the wins panel shows wins out of this */
  games: number
}

export default function SevenOkerChartToggle({ entries, pieChartData, games }: SevenOkerChartToggleProps) {
  const [chartView, setChartView] = useState<"points" | "gamepoints">("points")

  const toggle = (view: "points" | "gamepoints", label: string) => (
    <button
      type="button"
      aria-pressed={chartView === view}
      onClick={() => setChartView(view)}
      className={`min-h-9 whitespace-nowrap rounded-full px-3.5 text-[13px] transition-colors ${
        chartView === view ? "bg-ink font-semibold text-night" : "text-ink-2 hover:text-ink"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-wrap gap-6">
      <Panel
        title="Season progress"
        aside={
          <div role="group" aria-label="Chart metric" className="flex rounded-full bg-track p-1">
            {toggle("points", "Points")}
            {toggle("gamepoints", "Game points")}
          </div>
        }
        className="min-w-0 flex-[999_1_560px]"
      >
        <SevenOkerChart entries={entries} dataKey={chartView} />
        <div className="mt-3">
          <BearLegend names={pieChartData.map((slice) => slice.name)} />
        </div>
      </Panel>
      <WinsSplit
        title="Wins"
        rows={pieChartData.map((slice) => ({ name: slice.name, wins: slice.value }))}
        total={games}
        unit="games"
      />
    </div>
  )
}
