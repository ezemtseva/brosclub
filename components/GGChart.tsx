'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PLAYER_COLORS } from '../lib/teamColors'
import { ChartTooltip } from './ChartTooltip'

type GGEntry = {
  player: string;
  week: number;
  games: number;
  points: number;
}

type ChartDataPoint = {
  games: number;
  [key: string]: number | null;
}

type GGChartProps = {
  entries: GGEntry[];
}

export default function GGChart({ entries }: GGChartProps) {
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

    const maxGames = Math.min(40, Math.max(...entries.map(entry => entry.games)))

    const chartData = Array.from({ length: maxGames + 1}, (_, i) => {
      const gameNumber = i
      const dataPoint: ChartDataPoint = { games: gameNumber }

      Object.keys(playerData).forEach(player => {
        const playerEntry = playerData[player].find(entry => entry.games === gameNumber)
        dataPoint[player] = playerEntry ? playerEntry.points : null
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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="games" 
            type="number" 
            domain={[0, 40]} 
            ticks={Array.from({ length: 21 }, (_, i) => i * 2)}
          />
          <YAxis 
            type="number"
            domain={[0, 375]}
            ticks={[0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375]}
            interval={0}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line type="monotone" dataKey="Vanilla" stroke={PLAYER_COLORS.Vanilla} dot={{ r: 1 }} activeDot={{ r: 4 }} connectNulls />
          <Line type="monotone" dataKey="Choco" stroke={PLAYER_COLORS.Choco} dot={{ r: 1 }} activeDot={{ r: 4 }} connectNulls />
          <Line type="monotone" dataKey="Panda" stroke={PLAYER_COLORS.Panda} dot={{ r: 1 }} activeDot={{ r: 4 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}