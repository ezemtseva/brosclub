import type React from "react"
import { bearColor } from "../Bear"

/** Plain card used for charts and side panels. */
export function Panel({
  title,
  aside,
  className = "",
  children,
}: {
  title?: React.ReactNode
  aside?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-[20px] border border-hairline bg-surface p-7 ${className}`}>
      {(title || aside) && (
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          {title && <h2 className="font-display text-xl font-bold">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </div>
  )
}

/** Legend of bear names with a colour swatch — sits next to charts. */
export function BearLegend({ names }: { names: string[] }) {
  return (
    <div className="flex gap-4 text-[13px] text-ink-2">
      {names.map((name) => (
        <span key={name} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-[3px] w-3.5 rounded-sm"
            style={{ background: bearColor(name) }}
          />
          {name}
        </span>
      ))}
    </div>
  )
}

/**
 * Single stacked bar with a legend underneath — the redesign's replacement for
 * the wins pie chart.
 */
export function WinsSplit({
  title,
  rows,
  total,
  unit,
}: {
  title: string
  rows: { name: string; wins: number }[]
  total: number
  unit: string
}) {
  const anyWins = rows.some((row) => row.wins > 0)

  return (
    <Panel title={title} className="flex flex-[1_1_320px] flex-col gap-5">
      <div aria-hidden="true" className="flex h-3.5 gap-[3px] overflow-hidden rounded-full">
        {anyWins ? (
          rows.map((row) => (
            <div
              key={row.name}
              style={{ flexGrow: row.wins, flexBasis: 0, background: bearColor(row.name) }}
            />
          ))
        ) : (
          <div className="flex-1 bg-surface-3" />
        )}
      </div>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-3 text-[15px]">
            <span className="inline-flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: bearColor(row.name) }}
              />
              {row.name}
            </span>
            <span className="font-mono text-ink-2">
              {row.wins} of {total} {unit} · {total > 0 ? ((row.wins / total) * 100).toFixed(1) : "0.0"}%
            </span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

/** Dashed box shown where a tab has nothing to display yet. */
export function EmptyPanel({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-hairline-strong px-8 py-[72px] text-center">
      <div className="font-display text-[22px] font-bold">{title}</div>
      {text && <p className="mt-2 text-[15px] text-ink-muted">{text}</p>}
    </div>
  )
}
