import type React from "react"

/**
 * Gameweek cups (FPL, Bets) on an upright phone: the GW column is the same
 * number for every bear, so it leaves the table and is stated once beside the
 * heading; the points stand out bold in the accent (olive in light).
 */
export function phoneColumnsWithoutGameweek(columns: any[]): any[] {
  return phoneColumns(columns, ["games"])
}

/**
 * An upright phone's columns: `drop` left out, the rest packed to fit the
 * screen, the points bold in the accent.
 */
export function phoneColumns(columns: any[], drop: string[]): any[] {
  return columns
    .filter((column) => !drop.includes(column.accessor))
    .map((column) => {
      if (column.accessor === "position") return column
      // The pill carries its own padding, so its cell needs little more
      if (column.accessor === "player" || column.accessor === "bearo") return { ...column, cellClassName: "!pl-3 !pr-1" }
      // 1% and tighter padding: the figures shrink to their digits, so the bear's
      // pill gets the rest and the table fits an upright phone without scrolling
      const figures = { ...column, width: "1%", cellClassName: "!px-2" }
      return column.accessor === "points"
        ? { ...figures, cellClassName: "!px-2 font-bold text-[color:var(--accent-text)]" }
        : figures
    })
}

/**
 * A count beside the "Standings" heading, e.g. "GW 9" or "G 447": set like the
 * heading a step smaller, the number in the accent. Taken from the rows' games,
 * the most any bear has played.
 */
export function gamesCaption(label: string, rows: any[]): React.ReactNode {
  return (
    <p className="m-0 font-display text-xl font-bold leading-none">
      {label}{" "}
      <span className="text-[color:var(--accent-text)]">
        {Math.max(...rows.map((row) => Number(row.games) || 0), 0)}
      </span>
    </p>
  )
}

export function gameweekCaption(rows: any[]): React.ReactNode {
  return gamesCaption("GW", rows)
}
