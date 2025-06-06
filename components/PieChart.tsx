"use client"

import { useState } from "react"
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts"

type PieChartProps = {
  data: { name: string; value: number; color: string }[]
}

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// Helper function to convert hex color to rgba with transparency
const hexToRgba = (hex: string, alpha = 0.9) => {
  // Remove the # if it exists
  hex = hex.replace("#", "")

  // Parse the hex values
  const r = Number.parseInt(hex.substring(0, 2), 16)
  const g = Number.parseInt(hex.substring(2, 4), 16)
  const b = Number.parseInt(hex.substring(4, 6), 16)

  // Return the rgba value
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const winText = data.value === 1 ? "win" : "wins"
    return (
      <div className="bg-white border border-gray-200 p-2 shadow-md rounded">
        <p style={{ color: data.color }}>{`${data.name}: ${data.value} ${winText}`}</p>
      </div>
    )
  }
  return null
}

export default function PieChart({ data }: PieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>()

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(undefined)
  }

  // Process data to add transparent colors
  const processedData = data.map((item) => ({
    ...item,
    transparentColor: hexToRgba(item.color, 0.9),
  }))

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.transparentColor} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RechartsChart>
      </ResponsiveContainer>
    </div>
  )
}

