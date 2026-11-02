"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Panel } from "./design/Panels"

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
}

export default function SevenOkerChartToggle({ entries }: SevenOkerChartToggleProps) {
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
          <>
            <div role="group" aria-label="Chart metric" className="ml-auto hidden rounded-full bg-track p-1 md:flex">
              {toggle("points", "Points")}
              {toggle("gamepoints", "Game points")}
            </div>
            {/* Phones: one GP switch on the title's line (right-aligned if it has to wrap);
                off shows points, the default */}
            <button
              type="button"
              aria-pressed={chartView === "gamepoints"}
              aria-label="Show game points"
              onClick={() => setChartView((view) => (view === "points" ? "gamepoints" : "points"))}
              className={`ml-auto min-h-9 self-center whitespace-nowrap rounded-full border px-3 text-[13px] transition-colors md:hidden ${
                chartView === "gamepoints"
                  ? "border-ink bg-ink font-semibold text-night"
                  : "border-hairline-strong text-ink-2"
              }`}
            >
              GP
            </button>
          </>
        }
        className="min-w-0 flex-[999_1_560px]"
      >
        <SevenOkerChart entries={entries} dataKey={chartView} />
      </Panel>
    </div>
  )
}
