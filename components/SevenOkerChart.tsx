"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    return (
      <div className="bg-white border border-gray-300 p-2 shadow-md">
        {sortedPayload.map(
          (entry: any, index: number) =>
            entry.value !== null && (
              <p
                key={index}
                style={{
                  color: entry.dataKey === "Vanilla" ? "#ea7878" : entry.dataKey === "Choco" ? "#4b98de" : "#4fcb90",
                }}
              >
                {entry.name}: {entry.value}
              </p>
            ),
        )}
      </div>
    )
  }
  return null
}

export default function SevenOkerChart({ entries, dataKey = "points" }: SevenOkerChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 30])
  const [yAxisTicks, setYAxisTicks] = useState<number[]>([])

  useEffect(() => {
    const playerData = entries.reduce<Record<string, { games: number; points: number; gamepoints: number }[]>>(
      (acc, entry) => {
        if (!acc[entry.bearo]) {
          acc[entry.bearo] = []
        }
        acc[entry.bearo].push({
          games: entry.games,
          points: entry.points,
          gamepoints: entry.gamepoints || 0,
        })
        return acc
      },
      {},
    )

    // Limit to 10 games for x-axis
    const maxGames = entries.length > 0 ? Math.min(35, Math.max(...entries.map((entry) => entry.games))) : 0

    const chartData = Array.from({ length: maxGames }, (_, i) => {
      const gameNumber = i + 1
      const dataPoint: ChartDataPoint = { games: gameNumber }

      Object.keys(playerData).forEach((bearo) => {
        const playerEntry = playerData[bearo].find((entry) => entry.games === gameNumber)
        dataPoint[bearo] = playerEntry ? playerEntry[dataKey] : null
      })

      return dataPoint
    })

    setChartData(chartData)

    // Set Y-axis domain based on data type
    if (dataKey === "points") {
      setYAxisDomain([0, 50])
      setYAxisTicks(Array.from({ length: 11 }, (_, i) => i * 5))
    } else {
      // For gamepoints, use fixed scale from 0 to 1000 with steps of 100
      setYAxisDomain([0, 5000])
      setYAxisTicks(Array.from({ length: 11 }, (_, i) => i * 500))
    }
  }, [entries, dataKey])

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="games" type="number" domain={[1, 35]} ticks={Array.from({ length: 35 }, (_, i) => i + 1)} />
          <YAxis type="number" domain={yAxisDomain} ticks={yAxisTicks} interval={0} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="Vanilla" stroke="#ea7878" activeDot={{ r: 8 }} connectNulls />
          <Line type="monotone" dataKey="Choco" stroke="#4b98de" activeDot={{ r: 8 }} connectNulls />
          <Line type="monotone" dataKey="Panda" stroke="#4fcb90" activeDot={{ r: 8 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

