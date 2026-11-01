import { BearAvatar, bearColor } from "../Bear"

export type StandingsRow = {
  name: string
  points: number
  metrics: { label: string; value: string | number }[]
}

/**
 * The redesign's standings: one card per bear with a bar that runs
 * points / leader's points.
 */
export default function StandingsCards({ rows }: { rows: StandingsRow[] }) {
  const top = Math.max(...rows.map((row) => row.points), 0)

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => {
        const color = bearColor(row.name)
        return (
          <div
            key={row.name}
            className="flex flex-wrap items-center gap-x-8 gap-y-5 rounded-[20px] border border-hairline bg-surface px-7 py-[22px]"
          >
            <div className="flex flex-[1_1_240px] items-center gap-4">
              <span className="w-6 font-mono text-sm text-ink-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <BearAvatar name={row.name} size={48} />
              <span className="font-display text-[22px] font-bold">{row.name}</span>
            </div>
            {/* Wraps so a long metric row folds on a phone instead of pushing the card wide */}
            <div className="flex flex-[2_1_320px] flex-wrap gap-x-7 gap-y-4">
              {row.metrics.map((metric) => (
                <div key={metric.label}>
                  <div className="font-mono text-[11px] tracking-[0.1em] text-ink-muted">{metric.label}</div>
                  <div className="font-mono text-[18px] font-medium">{metric.value}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-[1_1_200px] flex-col items-end gap-4">
              <div className="stat-number font-display text-[44px] font-extrabold leading-none" style={{ color }}>
                {row.points.toLocaleString("de-DE")}
                <span className="ml-2 font-mono text-[13px] font-normal text-ink-muted">pts</span>
              </div>
              <div
                aria-hidden="true"
                className="h-1.5 w-full max-w-[240px] overflow-hidden rounded-full bg-surface-3"
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${top > 0 ? Math.round((row.points / top) * 100) : 0}%`, background: color }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
