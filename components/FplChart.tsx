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
  [key: string]: number | null | { cumulative: number; weekPoints: number };
}

type FplChartProps = {
  entries: FplEntry[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    // Sort the payload based on cumulative points (highest first)
    const sortedPayload = [...payload].sort((a, b) => {
      const pointsA = a.payload[a.name]?.cumulative || 0;
      const pointsB = b.payload[b.name]?.cumulative || 0;
      return pointsB - pointsA;
    });

    return (
      <div className="bg-white border border-gray-300 p-2 shadow-md">
        {sortedPayload.map((entry: any, index: number) => {
          if (entry.payload[entry.name]) {
            return (
              <p key={index} style={{ color: entry.stroke }}>
                {entry.name}: {entry.payload[entry.name].cumulative}
              </p>
            );
          }
          return null;
        })}
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
    // First, organize data by player and week
    const playerWeeklyData: Record<string, Record<number, number>> = {};
    
    // Initialize data structure
    entries.forEach(entry => {
      if (!playerWeeklyData[entry.player]) {
        playerWeeklyData[entry.player] = {};
      }
      playerWeeklyData[entry.player][entry.week] = entry.points;
    });

    // Create chart data points
    const chartData = Array.from({ length: 19 }, (_, i) => {
      const weekNumber = i + 1;
      const dataPoint: ChartDataPoint = { games: weekNumber };

      Object.entries(playerWeeklyData).forEach(([player, weeklyPoints]) => {
        if (weeklyPoints[weekNumber]) {
          // Calculate cumulative points up to this week
          const cumulative = Object.entries(weeklyPoints)
            .filter(([week]) => parseInt(week) <= weekNumber)
            .reduce((sum, [_, points]) => sum + points, 0);

          dataPoint[player] = {
            cumulative,
            weekPoints: weeklyPoints[weekNumber]
          };
        } else {
          dataPoint[player] = null;
        }
      });

      return dataPoint;
    });

    setChartData(chartData);
  }, [entries]);

  const renderLine = (player: string, color: string) => {
    return (
      <Line 
        type="monotone" 
        dataKey={(dataPoint) => dataPoint[player]?.cumulative} 
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
            domain={[1, 19]}
            ticks={Array.from({ length: 19 }, (_, i) => i + 1)}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="number"
            domain={[0, 1250]}
            ticks={[0, 250, 500, 750, 1000, 1250]}
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

