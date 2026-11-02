"use client"

import type React from "react"
import { BearAvatar, bearColor } from "../Bear"
import DataTable from "../DataTable"
import { ARCHIVO_CONDENSED, CARD_STRIPES, cardClip } from "../../lib/cardFrame"
import { applyStandingsView, useStandingsView, type StandingsView as View } from "../../lib/standingsView"

export type StandingStat = { label: string; value: string | number }

export type StandingCardData = {
  name: string
  points: number
  /** Three to a row under the divider; most cups give three, EA FC all time nine */
  stats: StandingStat[]
}

const RANKS = ["1ST", "2ND", "3RD"]

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
    // Phones switch views from the nav's Other menu instead
    <div role="group" aria-label="Standings view" className="standings-toggle hidden rounded-full bg-track p-1 md:flex">
      {button("cards", "Cards")}
      {button("table", "Table")}
    </div>
  )
}

function StandingCard({
  card,
  index,
  leaderPoints,
}: {
  card: StandingCardData
  index: number
  leaderPoints: number
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
          <BearAvatar name={card.name} size={44} filled />
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
  mobileColumns,
  tableCaption,
  rows,
  actions,
  footer,
}: {
  heading?: React.ReactNode
  cards: StandingCardData[]
  /** Table view: the page's usual columns over its processed rows */
  columns: any[]
  /** Table view on phones, when the page has a narrower set (EA FC) */
  mobileColumns?: any[]
  /** Beside the heading on an upright phone, cards or table: what the phone columns leave out (FPL: the gameweek) */
  tableCaption?: React.ReactNode
  rows: any[]
  /** Extra controls beside the switch (7oker: seating, add game) */
  actions?: React.ReactNode
  /** Shown under the cards or table (7oker: the next table's seating) */
  footer?: React.ReactNode
}) {
  const view = useStandingsView()

  const leaderPoints = Math.max(...cards.map((card) => card.points), 0)
  // A static archive season fills fewer fields than the live tables — drop the empty columns
  const tableColumns = columns.filter((column) => rows.some((row) => row[column.accessor] !== undefined))

  return (
    <>
      <div className="mb-4 flex min-h-11 flex-wrap items-center justify-between gap-3">
        {/* Phones keep everything on the heading's line: the heading, then at the
            right end the caption and the buttons; their view switch lives in the
            Other menu */}
        <div className="flex w-full items-center justify-between gap-3 md:w-auto">
          <h2 className="m-0 font-display text-2xl font-bold leading-none">{heading}</h2>
          <div className="flex items-center gap-3 md:hidden">
            {/* An upright phone only (as DataTable decides), in either view */}
            {tableCaption && <div className="standings-table-caption landscape:hidden">{tableCaption}</div>}
            {actions}
          </div>
        </div>
        {/* Wide screens: the buttons and the Cards | Table switch on the right */}
        <div className="hidden flex-wrap items-center gap-3 md:flex">
          {actions}
          <ViewToggle view={view} onChange={applyStandingsView} />
        </div>
      </div>
      <div className="standings-cards grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {cards.map((card, index) => (
          <StandingCard key={card.name} card={card} index={index} leaderPoints={leaderPoints} />
        ))}
      </div>
      <div className="standings-table">
        <DataTable columns={tableColumns} mobileColumns={mobileColumns} data={rows} />
      </div>
      {footer && <div className="mt-4">{footer}</div>}
    </>
  )
}
