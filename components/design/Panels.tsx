import type React from "react"
import { bearColor } from "../Bear"

/**
 * Plain card used for charts and side panels. The title and its controls sit
 * above the card, set like the "Standings" heading, not inside the frame.
 */
export function Panel({
  title,
  aside,
  className = "",
  bodyClassName = "",
  children,
}: {
  title?: React.ReactNode
  aside?: React.ReactNode
  /** The whole block: heading and card (sizing in a row of panels) */
  className?: string
  /** The framed card itself (its inner layout) */
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      {(title || aside) && (
        <div className="mb-4 flex min-h-11 flex-wrap items-center justify-between gap-2 md:gap-3">
          {title && <h2 className="m-0 font-display text-2xl font-bold leading-none">{title}</h2>}
          {aside}
        </div>
      )}
      {/* Phones trim the padding so a chart inside gets the width */}
      <div className={`rounded-[20px] border border-hairline bg-surface p-4 md:p-7 ${bodyClassName}`}>{children}</div>
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
  hideOnPhones = false,
}: {
  title: string
  rows: { name: string; wins: number }[]
  total: number
  unit: string
  hideOnPhones?: boolean
}) {
  const anyWins = rows.some((row) => row.wins > 0)

  return (
    <Panel
      title={title}
      className={`${hideOnPhones ? "hidden md:block" : ""} flex-[1_1_320px]`}
      bodyClassName="flex flex-col gap-5"
    >
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
export function EmptyPanel({
  title,
  text,
  titleOnlyOnPhones = false,
}: {
  title: string
  text?: string
  /** Phones show the title alone (empty insights) */
  titleOnlyOnPhones?: boolean
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-hairline-strong px-8 py-[72px] text-center">
      <div className="font-display text-[22px] font-bold">{title}</div>
      {text && <p className={`mt-2 text-[15px] text-ink-muted ${titleOnlyOnPhones ? "hidden md:block" : ""}`}>{text}</p>}
    </div>
  )
}
