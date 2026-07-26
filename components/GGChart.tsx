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

const DEFAULT_MAX_GAMES = 30
const DEFAULT_GAMES_STEP = 2
const DEFAULT_MAX_POINTS = 75
const DEFAULT_POINTS_STEP = 5

// Ticks at a fixed step from 0 to maxValue, plus a final tick at maxValue itself
// if it doesn't already land on the step (e.g. step 5 up to 37 -> ...,30,35,37)
function buildTicks(maxValue: number, step: number) {
  const ticks: number[] = []
  for (let t = 0; t <= maxValue; t += step) ticks.push(t)
  if (ticks[ticks.length - 1] !== maxValue) ticks.push(maxValue)
  return ticks
}

function pointsStepFor(maxPoints: number) {
  if (maxPoints <= 150) return 10
  if (maxPoints <= 300) return 25
  if (maxPoints <= 600) return 50
  return 100
}

export default function GGChart({ entries }: GGChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  const maxGames = entries.length > 0 ? Math.max(...entries.map(entry => entry.games)) : DEFAULT_MAX_GAMES
  const maxPoints = entries.length > 0 ? Math.max(...entries.map(entry => entry.points)) : DEFAULT_MAX_POINTS

  // Seasons that fit the default grid keep the original fixed axes untouched.
  // Only a season whose points outgrow that grid (e.g. an archived season on a
  // different scale) gets axes fit to its own data.
  const outgrowsDefaultGrid = maxPoints > DEFAULT_MAX_POINTS

  const xDomainMax = outgrowsDefaultGrid ? maxGames : DEFAULT_MAX_GAMES
  const xTicks = outgrowsDefaultGrid ? buildTicks(maxGames, 5) : buildTicks(DEFAULT_MAX_GAMES, DEFAULT_GAMES_STEP)

  const yDomainMax = outgrowsDefaultGrid ? maxPoints : DEFAULT_MAX_POINTS
  const yTicks = outgrowsDefaultGrid
    ? buildTicks(maxPoints, pointsStepFor(maxPoints))
    : buildTicks(DEFAULT_MAX_POINTS, DEFAULT_POINTS_STEP)

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
  }, [entries, maxGames])

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
            domain={[0, xDomainMax]}
            ticks={xTicks}
          />
          <YAxis
            type="number"
            domain={[0, yDomainMax]}
            ticks={yTicks}
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
