"use client"

import { PLAYER_COLORS } from "../lib/teamColors"

export const ChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    return (
      <div className="rounded-xl border border-hairline-strong bg-surface-2 px-3 py-2 font-mono text-[13px] shadow-lg">
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
