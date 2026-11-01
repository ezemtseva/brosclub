'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PLAYER_COLORS } from '../lib/teamColors'
import { useChartColors } from '../lib/useChartColors'
import { ChartTooltip } from './ChartTooltip'

type BetsEntry = {
  player: string;
  week: number;
  games: number;
  points: number;
}

type ChartDataPoint = {
  games: number;
  [key: string]: number | null;
}

type BetsChartProps = {
  entries: BetsEntry[];
}


export default function BetsChart({ entries }: BetsChartProps) {
  const colors = useChartColors()
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    const playerData = entries.reduce<Record<string, { games: number; points: number }[]>>((acc, entry) => {
      if (!acc[entry.player]) {
        acc[entry.player] = []
      }
      acc[entry.player].push({
        games: entry.games,
        points: entry.points,
      })
      return acc
    }, {})

    const maxGames = Math.max(...entries.map(entry => entry.games))
    const lastFifteenGames = Math.max(0, maxGames - 38)

    const chartData = Array.from({ length: maxGames + 1 }, (_, i) => {
      const gameNumber = i
      const dataPoint: ChartDataPoint = { games: gameNumber }

      Object.keys(playerData).forEach(player => {
        const playerEntry = playerData[player].find(entry => entry.games === gameNumber)
        // Everyone starts the season on zero, so the first gameweek has a line to
        // draw from instead of sitting there as a lone dot.
        dataPoint[player] = playerEntry ? playerEntry.points : gameNumber === 0 ? 0 : null
      })

      return dataPoint
    })

    setChartData(chartData)
  }, [entries])

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="games"
            type="number"
            domain={[0, 38]}
            ticks={Array.from({ length: 20 }, (_, i) => i * 2)}
            stroke={colors.grid}
            tick={{ fill: colors.tick, fontFamily: "Geist Mono, monospace", fontSize: 11 }}
          />
          <YAxis
            type="number"
            domain={[0, 300]}
            ticks={[0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300]}
            interval={0}
            tick={{ fill: colors.tick, fontFamily: "Geist Mono, monospace", fontSize: 11 }}
            width={44}
            stroke={colors.grid}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: colors.cursor }} />
          <Line type="monotone" dataKey="Vanilla" stroke={PLAYER_COLORS.Vanilla} strokeWidth={3} dot={false} activeDot={{ r: 4 }} connectNulls />
          <Line type="monotone" dataKey="Choco" stroke={PLAYER_COLORS.Choco} strokeWidth={3} dot={false} activeDot={{ r: 4 }} connectNulls />
          <Line type="monotone" dataKey="Panda" stroke={PLAYER_COLORS.Panda} strokeWidth={3} dot={false} activeDot={{ r: 4 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}