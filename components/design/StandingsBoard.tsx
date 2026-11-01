"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { BearAvatar, bearColor } from "../Bear"
import DataTable from "../DataTable"
import { ARCHIVO_CONDENSED, CARD_STRIPES, cardClip } from "../../lib/cardFrame"

export type StandingStat = { label: string; value: string | number }

/** A point on a bear's season curve: games (or gameweeks) played, points so far. */
export type SparkPoint = { x: number; y: number }

export type StandingCardData = {
  name: string
  points: number
  /** Exactly three, shown in a row under the divider */
  stats: StandingStat[]
  /** Cumulative points per game; the sparkline row is left out without it */
  series?: SparkPoint[]
}

type View = "cards" | "table"

/**
 * One key for every cup page. The layout's inline script copies it onto
 * <html data-standings-view> before the first paint, and the CSS shows the
 * matching view and button from that, so a stored "table" never flashes cards.
 */
const VIEW_KEY = "standings-view"

const RANKS = ["1ST", "2ND", "3RD"]

/** Cumulative points per game from a season's chart entries, starting at zero. */
export function sparkSeries(chartData: any[], name: string): SparkPoint[] | undefined {
  const points = chartData
    .filter((row) => (row.player ?? row.bearo) === name)
    .map((row) => ({ x: Number(row.games) || 0, y: Number(row.points) || 0 }))
    .sort((a, b) => a.x - b.x)
  if (points.length === 0) return undefined
  return points[0].x === 0 ? points : [{ x: 0, y: 0 }, ...points]
}

/** "62.5%" from wins and games, or a dash when there is nothing to divide. */
export function winPercent(wins: number | undefined, games: number | undefined): string {
  if (wins === undefined || !games) return "—"
  return `${((wins / games) * 100).toFixed(1)}%`
}

function ViewToggle({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  const button = (value: View, label: string) => (
    <button
      type="button"
      data-view={value}
      aria-pressed={view === value}
      onClick={() => onChange(value)}
      className="min-h-9 whitespace-nowrap rounded-full px-3.5 text-[13px] transition-colors"
    >
      {label}
    </button>
  )
  return (
    <div role="group" aria-label="Standings view" className="standings-toggle flex rounded-full bg-track p-1">
      {button("cards", "Cards")}
      {button("table", "Table")}
    </div>
  )
}

function Sparkline({
  name,
  series,
  color,
  maxX,
  maxY,
}: {
  name: string
  series: SparkPoint[]
  color: string
  maxX: number
  maxY: number
}) {
  const height = 48
  // Room for half the stroke at the top and the baseline at the bottom
  const top = 2
  const bottom = height - 1
  const width = Math.max(maxX, 1)
  const y = (value: number) => bottom - (maxY > 0 ? (value / maxY) * (bottom - top) : 0)
  const last = series[series.length - 1]

  return (
    <svg
      role="img"
      aria-label={`${name}: ${last.y} points after ${last.x} games`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="block h-12 w-full overflow-visible"
    >
      <line
        x1={0}
        x2={width}
        y1={height - 0.5}
        y2={height - 0.5}
        stroke="var(--card-rule)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points={series.map((p) => `${p.x},${y(p.y)}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function StandingCard({
  card,
  index,
  leaderPoints,
  maxX,
}: {
  card: StandingCardData
  index: number
  leaderPoints: number
  maxX: number
}) {
  const color = bearColor(card.name)
  const rank = RANKS[index] ?? `${index + 1}TH`
  const isLeader = index === 0
  const pointsLabel = card.points.toLocaleString("de-DE")
  // 112px fits three digits beside the gap; longer totals step down to stay on one line
  const pointsSize = pointsLabel.length <= 3 ? 112 : pointsLabel.length <= 5 ? 88 : 72

  return (
    <article
      aria-label={`${rank.toLowerCase()} ${card.name}, ${card.points} points`}
      className="rounded-[16px] p-[3px]"
      style={{ clipPath: cardClip(28), background: color }}
    >
      <div
        className="flex h-full flex-col gap-5 rounded-[13px] bg-surface px-6 pb-[26px] pt-[22px] text-ink"
        style={{ clipPath: cardClip(27), backgroundImage: CARD_STRIPES }}
      >
        <div className="flex items-center gap-3">
          <BearAvatar name={card.name} size={44} />
          <span className="font-display text-xl font-bold">{card.name}</span>
          <span
            className={`font-archivo ml-auto rounded-full px-3 py-1 text-[18px] font-black leading-none ${
              isLeader ? "bg-accent text-accent-foreground" : "bg-surface-3 text-ink-2"
            }`}
            style={{ fontVariationSettings: ARCHIVO_CONDENSED }}
          >
            {rank}
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          {/* stat-number: the bear's colour in dark, plain ink in light */}
          <span
            className="stat-number font-archivo font-black leading-[0.8]"
            style={{ color, fontSize: pointsSize, fontVariationSettings: ARCHIVO_CONDENSED }}
          >
            {pointsLabel}
          </span>
          <span
            className="font-archivo whitespace-nowrap text-[22px] font-extrabold uppercase leading-none text-ink-muted"
            style={{ fontVariationSettings: ARCHIVO_CONDENSED }}
          >
            {isLeader ? "Leader" : `−${(leaderPoints - card.points).toLocaleString("de-DE")} pts`}
          </span>
        </div>

        {card.series && (
          <Sparkline name={card.name} series={card.series} color={color} maxX={maxX} maxY={leaderPoints} />
        )}

        <div className="grid grid-cols-3 gap-3 border-t border-[var(--card-rule)] pt-4">
          {card.stats.map((stat) => (
            <div key={stat.label}>
              <div
                className="font-archivo text-[30px] font-black leading-none"
                style={{ fontVariationSettings: ARCHIVO_CONDENSED }}
              >
                {stat.value}
              </div>
              <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

/**
 * Standings on a cup page: a heading with a Cards | Table switch, then either a
 * framed card per bear or the plain table. Both views are rendered and CSS
 * picks one, so the stored choice applies before React hydrates.
 */
export default function StandingsBoard({
  heading = "Standings",
  cards,
  columns,
  rows,
  actions,
  notice,
}: {
  heading?: string
  cards: StandingCardData[]
  /** Table view: the page's usual columns over its processed rows */
  columns: any[]
  rows: any[]
  /** Extra controls beside the switch (7oker: seating, add game) */
  actions?: React.ReactNode
  /** Shown between the heading and the standings (7oker: seating order) */
  notice?: React.ReactNode
}) {
  const [view, setView] = useState<View>("cards")

  useEffect(() => {
    if (document.documentElement.dataset.standingsView === "table") setView("table")
  }, [])

  const changeView = (next: View) => {
    setView(next)
    document.documentElement.dataset.standingsView = next
    try {
      localStorage.setItem(VIEW_KEY, next)
    } catch {}
  }

  const leaderPoints = Math.max(...cards.map((card) => card.points), 0)
  const maxX = Math.max(...cards.flatMap((card) => card.series?.map((p) => p.x) ?? []), 0)
  // A static archive season fills fewer fields than the live tables — drop the empty columns
  const tableColumns = columns.filter((column) => rows.some((row) => row[column.accessor] !== undefined))

  return (
    <>
      <div className="mb-4 flex min-h-11 flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 font-display text-2xl font-bold leading-none">{heading}</h2>
        <div className="flex flex-wrap items-center gap-3">
          {actions}
          <ViewToggle view={view} onChange={changeView} />
        </div>
      </div>
      {notice}
      <div className="standings-cards grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {cards.map((card, index) => (
          <StandingCard key={card.name} card={card} index={index} leaderPoints={leaderPoints} maxX={maxX} />
        ))}
      </div>
      <div className="standings-table">
        <DataTable columns={tableColumns} data={rows} />
      </div>
    </>
  )
}
