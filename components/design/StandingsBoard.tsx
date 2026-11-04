"use client"

import type React from "react"
import DataTable from "../DataTable"
import PosterCard from "./PosterCard"

/** `strip`: on a card with many stats, this one goes to the strip below the poster */
export type StandingStat = { label: string; value: string | number; strip?: boolean }

export type StandingCardData = {
  name: string
  points: number
  /** The poster's list, before the gap; most cups give two or three, EA FC all time nine */
  stats: StandingStat[]
}

const RANKS = ["1ST", "2ND", "3RD"]

/** "62.5%" from wins and games, or a dash when there is nothing to divide. */
export function winPercent(wins: number | undefined, games: number | undefined): string {
  if (wins === undefined || !games) return "—"
  return `${((wins / games) * 100).toFixed(1)}%`
}

/** More stats than this and the card splits into a poster and a strip below it */
const POSTER_LIST_MAX = 5
/** How many stats the split card's poster lists */
const SPLIT_LIST = 4

/**
 * A bear's standing as a poster card: the stats, then the gap to the leader.
 * A card with many stats (EA FC all time) lists four on the poster and puts the
 * rest — those marked `strip`, or else the ones after the first four — in a
 * strip below; it has no gap row.
 */
function StandingCard({
  card,
  index,
  leaderPoints,
}: {
  card: StandingCardData
  index: number
  leaderPoints: number
}) {
  const rank = RANKS[index] ?? `${index + 1}th`
  const gap = leaderPoints - card.points
  const label = `${rank.toLowerCase()} ${card.name}, ${card.points} points`

  if (card.stats.length > POSTER_LIST_MAX) {
    const marked = card.stats.some((stat) => stat.strip)
    const list = marked ? card.stats.filter((stat) => !stat.strip) : card.stats.slice(0, SPLIT_LIST)
    const strip = marked ? card.stats.filter((stat) => stat.strip) : card.stats.slice(SPLIT_LIST)
    return (
      <PosterCard
        name={card.name}
        index={index}
        figure={card.points.toLocaleString("de-DE")}
        rows={list.slice(0, SPLIT_LIST)}
        strip={strip}
        label={label}
      />
    )
  }

  return (
    <PosterCard
      name={card.name}
      index={index}
      figure={card.points.toLocaleString("de-DE")}
      rows={[
        ...card.stats,
        // The leader's own card has no gap; a real minus sign
        { label: "Gap", value: index === 0 ? "—" : `−${gap.toLocaleString("de-DE")}` },
      ]}
      label={label}
    />
  )
}

/**
 * Standings on a cup page: a heading, then either a poster card per bear or the
 * plain table, as chosen in the nav (Settings on wide screens, Other on phones).
 * Both views are rendered and CSS picks one, so the stored choice applies
 * before React hydrates.
 */
export default function StandingsBoard({
  heading = "Standings",
  cards,
  columns,
  mobileColumns,
  tableCaption,
  captionEverywhere = false,
  pointsFollowGamesWhenNarrow = false,
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
  /** The caption on every screen, the columns leaving its figure out everywhere (FPL) */
  captionEverywhere?: boolean
  /** Table view: P moves to just after G once the table is too narrow to show it (EA FC) */
  pointsFollowGamesWhenNarrow?: boolean
  rows: any[]
  /** Extra controls beside the heading (7oker: seating, add game) */
  actions?: React.ReactNode
  /** Shown under the cards or table (7oker: the next table's seating) */
  footer?: React.ReactNode
}) {
  const leaderPoints = Math.max(...cards.map((card) => card.points), 0)
  // A static archive season fills fewer fields than the live tables — drop the empty columns
  const tableColumns = columns.filter((column) => rows.some((row) => row[column.accessor] !== undefined))

  return (
    <>
      <div className="mb-4 flex min-h-11 flex-wrap items-center justify-between gap-3">
        {/* Phones keep everything on the heading's line: the heading, then at the
            right end the caption and the buttons */}
        <div className="flex w-full items-center justify-between gap-3 md:w-auto">
          <h2 className="m-0 font-display text-2xl font-bold leading-none">{heading}</h2>
          <div className="flex items-center gap-3 md:hidden">
            {/* An upright phone only (as DataTable decides), in either view;
                with captionEverywhere a landscape phone too */}
            {tableCaption && (
              <div className={`standings-table-caption ${captionEverywhere ? "" : "landscape:hidden"}`}>{tableCaption}</div>
            )}
            {actions}
          </div>
        </div>
        {/* Wide screens: the caption (with captionEverywhere) and the buttons on the right */}
        {((captionEverywhere && tableCaption) || actions) && (
          <div className="hidden flex-wrap items-center gap-3 md:flex">
            {captionEverywhere && tableCaption}
            {actions}
          </div>
        )}
      </div>
      <div className="standings-cards grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {cards.map((card, index) => (
          <StandingCard key={card.name} card={card} index={index} leaderPoints={leaderPoints} />
        ))}
      </div>
      <div className="standings-table">
        <DataTable
          columns={tableColumns}
          mobileColumns={mobileColumns}
          data={rows}
          pointsFollowGamesWhenNarrow={pointsFollowGamesWhenNarrow}
        />
      </div>
      {footer && <div className="mt-4">{footer}</div>}
    </>
  )
}
