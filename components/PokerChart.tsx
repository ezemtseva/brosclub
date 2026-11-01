'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PLAYER_COLORS } from '../lib/teamColors'
import { useChartColors } from '../lib/useChartColors'
import { ChartTooltip } from './ChartTooltip'

type PokerEntry = {
  bearo: string;
  week: number;
  games: number;
  points: number;
}

type ChartDataPoint = {
  games: number;
  [key: string]: number | null;
}

type PokerChartProps = {
  entries: PokerEntry[];
}

export default function PokerChart({ entries }: PokerChartProps) {
  const colors = useChartColors()
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    const playerData = entries.reduce<Record<string, { games: number; points: number }[]>>((acc, entry) => {
      if (!acc[entry.bearo]) {
        acc[entry.bearo] = []
      }
      acc[entry.bearo].push({
        games: entry.games,
        points: entry.points,
      })
      return acc
    }, {})

    const maxGames = Math.min(45, Math.max(...entries.map(entry => entry.games)))

    const chartData = Array.from({ length: maxGames + 1}, (_, i) => {
      const gameNumber = i
      const dataPoint: ChartDataPoint = { games: gameNumber }

      Object.keys(playerData).forEach(bearo => {
        const playerEntry = playerData[bearo].find(entry => entry.games === gameNumber)
        dataPoint[bearo] = playerEntry ? playerEntry.points : null
      })

      return dataPoint
    })

    setChartData(chartData)
  }, [entries])

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="games"
            type="number"
            domain={[0, 44]}
            ticks={Array.from({ length: 23 }, (_, i) => i * 2)}
            stroke={colors.grid}
            tick={{ fill: colors.tick, fontFamily: "Geist Mono, monospace", fontSize: 11 }}
          />
          <YAxis
            type="number"
            domain={[0, 85]}
            ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85]}
            interval={0}
            width={44}
            stroke={colors.grid}
            tick={{ fill: colors.tick, fontFamily: "Geist Mono, monospace", fontSize: 11 }}
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