'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    return (
      <div className="bg-white border border-gray-300 p-2 shadow-md">
        {sortedPayload.map((entry: any, index: number) => (
          entry.value !== null && (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value} points
            </p>
          )
        ))}
      </div>
    );
  }
  return null;
};

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#666" fontSize={12}>
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

    const chartData = Array.from({ length: 38 }, (_, i) => {
      const gameNumber = i + 1
      const dataPoint: ChartDataPoint = { games: gameNumber }

      Object.keys(playerData).forEach(player => {
        const gameData = playerData[player].find(entry => entry.games === gameNumber)
        dataPoint[player] = gameData ? gameData.points : null
      })

      return dataPoint
    })

    setChartData(chartData)
  }, [entries])

  const renderLine = (player: string, color: string) => {
    return (
      <Line 
        type="monotone" 
        dataKey={player}
        name={player} 
        stroke={color} 
        activeDot={{ r: 8 }} 
        connectNulls={false}
      />
    )
  }

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
            domain={[1, 38]}
            ticks={Array.from({ length: 38 }, (_, i) => i + 1)}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="number"
            domain={[0, 2511]}
            ticks={[0, 250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2511]}
            tick={<CustomYAxisTick />}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          {renderLine('Vanilla', '#ea7878')}
          {renderLine('Choco', '#4b98de')}
          {renderLine('Panda', '#4fcb90')}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

