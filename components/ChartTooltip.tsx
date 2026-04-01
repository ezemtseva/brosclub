"use client"

import { PLAYER_COLORS } from "../lib/teamColors"

export const ChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    return (
      <div className="bg-white border border-gray-300 p-2 shadow-md">
        {sortedPayload.map((entry: any, index: number) =>
          entry.value !== null && (
            <p key={index} style={{ color: PLAYER_COLORS[entry.dataKey as string] }}>
              {entry.name}: {entry.value}
            </p>
          )
        )}
      </div>
    )
  }
  return null
}
