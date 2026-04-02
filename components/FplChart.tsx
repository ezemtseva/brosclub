'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PLAYER_COLORS } from '../lib/teamColors'
import { ChartTooltip } from './ChartTooltip'

type FplEntry = {
  player: string;
  week: number;
  games: number;
  points: number;
}

type ChartDataPoint = {
  games: number;
  [key: string]: number | null;
}

type FplChartProps = {
  entries: FplEntry[];
}

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#666">
        {payload.value}
      </text>
    </g>
  );
};

export default function FplChart({ entries }: FplChartProps) {
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

    const maxGames = entries.length > 0 ? Math.max(...entries.map(entry => entry.games)) : 38

    const chartData = Array.from({ length: maxGames + 1 }, (_, i) => {
      const gameNumber = i
      const dataPoint: ChartDataPoint = { games: gameNumber }

      Object.keys(playerData).forEach(player => {
        const gameData = playerData[player].find(entry => entry.games === gameNumber)
        dataPoint[player] = gameData ? gameData.points : null
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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="games"
            type="number"
            domain={[0, 38]}
            ticks={Array.from({ length: 20 }, (_, i) => i * 2)}
          />
          <YAxis
            type="number"
            domain={[0, 2500]}
            ticks={[0, 250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500]}
            interval={0}
            tick={<CustomYAxisTick />}
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
