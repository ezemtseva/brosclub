'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    return (
      <div className="bg-white border border-gray-300 p-2 shadow-md">
        {sortedPayload.map((entry: any, index: number) => (
          entry.value !== null && (
            <p key={index} style={{ color: entry.dataKey === 'Vanilla' ? '#ea7878' : entry.dataKey === 'Choco' ? '#4b98de' : '#4fcb90' }}>
              {entry.name}: {entry.value}
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
      <text x={0} y={0} dy={4} textAnchor="end" fill="#666">
        {payload.value}
      </text>
    </g>
  );
};

export default function BetsChart({ entries }: BetsChartProps) {
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
    const lastFifteenGames = Math.max(1, maxGames - 30)

    const chartData = Array.from({ length: 30 }, (_, i) => {
      const gameNumber = lastFifteenGames + i
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
            domain={['dataMin', 'dataMax']}
            ticks={chartData.map(d => d.games)}
          />
          <YAxis 
            type="number"
            domain={[0, 200]}
            ticks={[0, 25, 50, 75, 100, 125, 150, 175, 200]}
            interval={0}
            tick={<CustomYAxisTick />}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="Vanilla" stroke="#ea7878" activeDot={{ r: 8 }} connectNulls />
          <Line type="monotone" dataKey="Choco" stroke="#4b98de" activeDot={{ r: 8 }} connectNulls />
          <Line type="monotone" dataKey="Panda" stroke="#4fcb90" activeDot={{ r: 8 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}