'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

export default function PokerChart({ entries }: PokerChartProps) {
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

    const maxGames = Math.min(50, Math.max(...entries.map(entry => entry.games)))

    const chartData = Array.from({ length: maxGames }, (_, i) => {
      const gameNumber = i + 1
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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="games" 
            type="number" 
            domain={[1, 50]} 
            ticks={Array.from({ length: 50 }, (_, i) => i + 1)}
          />
          <YAxis 
            type="number"
            domain={[0, 80]}
            ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]}
            interval={0}
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