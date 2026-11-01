"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { PLAYER_COLORS } from "../lib/teamColors"
import { useChartColors } from "../lib/useChartColors"
import { useIsMobile } from "../lib/useIsMobile"
import { chartLayout } from "../lib/chartLayout"
import { ChartTooltip } from "./ChartTooltip"

type SevenOkerEntry = {
  id?: number
  bearo: string
  week: number
  games: number
  wins: number
  points: number
  gamepoints?: number
  createdAt?: string | null
}

type ChartDataPoint = {
  games: number
  [key: string]: number | null
}

type SevenOkerChartProps = {
  entries: SevenOkerEntry[]
  dataKey?: "points" | "gamepoints"
}

export default function SevenOkerChart({
  entries,
  dataKey = "points",
}: SevenOkerChartProps) {
  const colors = useChartColors()
  // Phones: Y labels inside the plot, no side margins, fewer ticks
  const isMobile = useIsMobile()
  const layout = chartLayout(isMobile, { top: 10, right: 10, left: 0, bottom: 5 })
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 30])
  const [yAxisTicks, setYAxisTicks] = useState<number[]>([])

  useEffect(() => {
    // Y axis config depends only on the toggle, so set it even with no data yet
    if (dataKey === "points") {
      setYAxisDomain([0, 100])
      setYAxisTicks(Array.from({ length: 11 }, (_, i) => i * 10))
    } else {
      setYAxisDomain([0, 11000])
      setYAxisTicks(Array.from({ length: 12 }, (_, i) => i * 1000))
    }

    if (!entries || entries.length === 0) {
      setChartData([])
      return
    }

    // 1) Normalize + sort entries by games
    const normalized = entries
      .map((e) => ({ ...e, games: Number(e.games) }))
      .sort((a, b) => a.games - b.games)

    // 2) Build fast lookup per player: games -> entry
    const playerMaps = normalized.reduce<
      Record<string, Map<number, SevenOkerEntry>>
    >((acc, e) => {
      if (!acc[e.bearo]) acc[e.bearo] = new Map()
      acc[e.bearo].set(e.games, e)
      return acc
    }, {})

    // 3) Take ONLY games that actually exist (unique & sorted)
    const gameNumbers = Array.from(
      new Set(normalized.map((e) => e.games)),
    ).sort((a, b) => a - b)

    // 4) Build chart data points only for those games
    const nextChartData: ChartDataPoint[] = gameNumbers.map((gameNumber) => {
      const dp: ChartDataPoint = { games: gameNumber }

      Object.keys(playerMaps).forEach((bearo) => {
        const entry = playerMaps[bearo].get(gameNumber)
        dp[bearo] = entry
          ? dataKey === "points"
            ? entry.points
            : entry.gamepoints ?? 0
          : null
      })

      return dp
    })

    // Everyone starts the season on zero, so the first game has a line to draw
    // from instead of sitting there as a lone dot.
    if (!gameNumbers.includes(0)) {
      const start: ChartDataPoint = { games: 0 }
      Object.keys(playerMaps).forEach((bearo) => {
        start[bearo] = 0
      })
      nextChartData.unshift(start)
    }

    setChartData(nextChartData)
  }, [entries, dataKey])

  return (
    <div className="h-[280px] md:h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={layout.margin}
        >
          <CartesianGrid stroke={colors.grid} vertical={false} />

          {/* Сохраняем фиксированную сетку как у тебя */}
          <XAxis
            dataKey="games"
            type="number"
            domain={[0, 75]}
            ticks={layout.xTicks(Array.from({ length: 16 }, (_, i) => i * 5))}
            allowDecimals={false}
            allowDataOverflow
            interval={0}
            stroke={colors.grid}
            tick={{ fill: colors.tick, fontFamily: "Geist Mono, monospace", fontSize: 11 }}
          />

          <YAxis
            type="number"
            // Phones run game points to 12500, so the ceiling lands on a 2500 step and gets a label
            domain={isMobile && dataKey === "gamepoints" ? [0, 12500] : yAxisDomain}
            // Phones step by 25 points, or by 2500 game points
            ticks={layout.yTicks(yAxisTicks, dataKey === "points" ? [25, 50, 75, 100] : [2500, 5000, 7500, 10000, 12500])}
            interval={0}
            width={50}
            {...layout.yAxis}
            stroke={colors.grid}
            tick={{ fill: colors.tick, fontFamily: "Geist Mono, monospace", fontSize: 11, ...layout.yTickOffset }}
          />

          <Tooltip content={<ChartTooltip />} cursor={{ stroke: colors.cursor }} />

          <Line
            type="monotone"
            dataKey="Vanilla"
            stroke={PLAYER_COLORS.Vanilla}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Choco"
            stroke={PLAYER_COLORS.Choco}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Panda"
            stroke={PLAYER_COLORS.Panda}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
