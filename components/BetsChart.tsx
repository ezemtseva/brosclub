'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PLAYER_COLORS } from '../lib/teamColors'
import { useChartColors } from '../lib/useChartColors'
import { useIsMobile } from '../lib/useIsMobile'
import { chartLayout, dataExtent, fitAxis } from '../lib/chartLayout'
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
  // Phones: Y labels inside the plot, no side margins, fewer ticks
  const isMobile = useIsMobile()
  const layout = chartLayout(isMobile)
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

  // Phones zoom to the season so far: each axis ends at the first step that
  // covers the games played and the highest total
  const extent = dataExtent(chartData)
  const fit = isMobile ? { x: fitAxis(extent.maxX, 10, 38), y: fitAxis(extent.maxY, 100) } : null

  return (
    <div className="h-[280px] md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={layout.margin}
        >
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="games"
            type="number"
            domain={fit ? fit.x.domain : [0, 38]}
            ticks={fit ? fit.x.ticks : layout.xTicks(Array.from({ length: 20 }, (_, i) => i * 2))}
            stroke={colors.grid}
            tick={{ fill: colors.tick, fontFamily: "Geist Mono, monospace", fontSize: 11 }}
          />
          <YAxis
            type="number"
            domain={fit ? fit.y.domain : [0, 300]}
            ticks={fit ? fit.y.ticks : layout.yTicks([0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300])}
            interval={0}
            tick={{ fill: colors.tick, fontFamily: "Geist Mono, monospace", fontSize: 11, ...layout.yTickOffset }}
            width={44}
            {...layout.yAxis}
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