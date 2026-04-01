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
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 30])
  const [yAxisTicks, setYAxisTicks] = useState<number[]>([])

  useEffect(() => {
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

    setChartData(nextChartData)

    // 5) Y axis config
    if (dataKey === "points") {
      setYAxisDomain([0, 100])
      setYAxisTicks(Array.from({ length: 11 }, (_, i) => i * 10))
    } else {
      setYAxisDomain([0, 11000])
      setYAxisTicks(Array.from({ length: 12 }, (_, i) => i * 1000))
    }
  }, [entries, dataKey])

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          {/* Сохраняем фиксированную сетку как у тебя */}
          <XAxis
            dataKey="games"
            type="number"
            domain={[0, 75]}
            ticks={Array.from({ length: 16 }, (_, i) => i * 5)}
            allowDecimals={false}
            allowDataOverflow
          />

          <YAxis
            type="number"
            domain={yAxisDomain}
            ticks={yAxisTicks}
            interval={0}
            width={50}
          />

          <Tooltip content={<ChartTooltip />} />

          <Line
            type="monotone"
            dataKey="Vanilla"
            stroke={PLAYER_COLORS.Vanilla}
            dot={{ r: 1 }}
            activeDot={{ r: 4 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Choco"
            stroke={PLAYER_COLORS.Choco}
            dot={{ r: 1 }}
            activeDot={{ r: 4 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Panda"
            stroke={PLAYER_COLORS.Panda}
            dot={{ r: 1 }}
            activeDot={{ r: 4 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
