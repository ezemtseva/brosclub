'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PLAYER_COLORS } from '../lib/teamColors'
import { useChartColors } from '../lib/useChartColors'
import { useIsMobile } from '../lib/useIsMobile'
import { chartLayout, dataExtent, fitAxis } from '../lib/chartLayout'
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
  // Phones: Y labels inside the plot, no side margins, fewer ticks
  const isMobile = useIsMobile()
  const layout = chartLayout(isMobile, { top: 10, right: 10, left: 0, bottom: 5 })
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

  // Phones zoom to the season so far: each axis ends at the first step that
  // covers the games played and the highest total
  const extent = dataExtent(chartData)
  const fit = isMobile ? { x: fitAxis(extent.maxX, 10, 44), y: fitAxis(extent.maxY, 25) } : null

  return (
    <div className="h-[280px] md:h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={layout.margin}
        >
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="games"
            type="number"
            domain={fit ? fit.x.domain : [0, 44]}
            ticks={fit ? fit.x.ticks : layout.xTicks(Array.from({ length: 23 }, (_, i) => i * 2))}
            stroke={colors.grid}
            tick={{ fill: colors.tick, fontFamily: "Geist Mono, monospace", fontSize: 11 }}
          />
          <YAxis
            type="number"
            domain={fit ? fit.y.domain : [0, 85]}
            ticks={fit ? fit.y.ticks : layout.yTicks([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85])}
            interval={0}
            width={44}
            {...layout.yAxis}
            stroke={colors.grid}
            tick={{ fill: colors.tick, fontFamily: "Geist Mono, monospace", fontSize: 11, ...layout.yTickOffset }}
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