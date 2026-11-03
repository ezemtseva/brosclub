'use client'

import React, { useState, useRef, useEffect } from 'react'

interface Column {
  header: string
  accessor: string
  width?: string
  /** Extra classes for this column's cells (EA FC phones: points bold in the accent) */
  cellClassName?: string
}

interface DataTableProps {
  columns: Column[]
  mobileColumns?: Column[]
  data: any[]
  maxHeight?: string
  sortable?: boolean
  sortableColumns?: string[]
  /** When the table is too narrow to show P, P moves to just after G (EA FC) */
  pointsFollowGamesWhenNarrow?: boolean
}

const NON_SORTABLE = new Set(['position', 'team', 'bearo', 'player', 'form'])

function fmtCell(val: any): any {
  if (typeof val === 'number' && Number.isInteger(val) && Math.abs(val) >= 1000) {
    return val.toLocaleString('de-DE')
  }
  return val
}

function parseValue(val: any): number {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const n = parseFloat(val.replace('%', ''))
    return isNaN(n) ? 0 : n
  }
  return 0
}

export default function DataTable({ columns, mobileColumns, data, maxHeight = '400px', sortable = false, sortableColumns, pointsFollowGamesWhenNarrow = false }: DataTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [isMobile, setIsMobile] = useState(false)
  const [pointsMoved, setPointsMoved] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // The trimmed phone columns are for a phone held upright only: turned sideways
    // it shows the full table, every column, even on a narrow phone
    const mq = window.matchMedia('(max-width: 767px) and (orientation: portrait)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const usingMobileColumns = !!mobileColumns && isMobile
  const pointsAt = columns.findIndex((c) => c.accessor === 'points')
  const gamesAt = columns.findIndex((c) => c.accessor === 'games')
  const canMovePoints = pointsFollowGamesWhenNarrow && !usingMobileColumns && pointsAt > gamesAt + 1 && gamesAt >= 0

  // P is cut off once the table overflows by more than the columns after it in
  // their usual order; each column keeps its width wherever it stands, so the
  // check holds whichever order is showing and never flips back and forth
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !canMovePoints) {
      setPointsMoved(false)
      return
    }
    const trailing = new Set(columns.slice(pointsAt + 1).map((c) => c.accessor))
    const measure = () => {
      const overflow = el.scrollWidth - el.clientWidth
      let trailingWidth = 0
      el.querySelectorAll<HTMLElement>('th[data-accessor]').forEach((th) => {
        if (trailing.has(th.dataset.accessor!)) trailingWidth += th.getBoundingClientRect().width
      })
      setPointsMoved(overflow > trailingWidth + 1)
    }
    measure()
    // The box follows the window; the table inside follows its rows
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => observer.disconnect()
  }, [canMovePoints, columns, pointsAt])

  const orderedColumns = pointsMoved && canMovePoints
    ? [
        ...columns.slice(0, gamesAt + 1),
        columns[pointsAt],
        ...columns.slice(gamesAt + 1).filter((c) => c.accessor !== 'points'),
      ]
    : columns
  const activeColumns = usingMobileColumns ? mobileColumns! : orderedColumns

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleWheel = (e: WheelEvent) => {
      const atTop = el.scrollTop === 0
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
        e.preventDefault()
        window.scrollBy({ top: e.deltaY, behavior: 'auto' })
      }
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const isSortable = (accessor: string) => {
    if (!sortable) return false
    if (sortableColumns) return sortableColumns.includes(accessor)
    return !NON_SORTABLE.has(accessor)
  }

  const handleSort = (accessor: string) => {
    if (!isSortable(accessor)) return
    if (sortKey === accessor) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(accessor)
      setSortDir('desc')
    }
  }

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const av = parseValue(a[sortKey])
        const bv = parseValue(b[sortKey])
        return sortDir === 'desc' ? bv - av : av - bv
      })
    : data

  // Spread the surplus width evenly instead of letting the browser hand it out
  // in proportion to each column's content, which made the gaps uneven. Columns
  // carrying an explicit percentage keep it, and the rest split what is left —
  // mixing px with these percentages loses, so widths should be given in %.
  const claimedPercent = activeColumns.reduce((sum, c: any) => {
    const w = typeof c.width === 'string' && c.width.endsWith('%') ? parseFloat(c.width) : 0
    return sum + w
  }, 0)
  const flexibleCols = activeColumns.filter((c: any) => !c.width && c.accessor !== 'position').length
  const evenWidth = flexibleCols > 0 ? `${(100 - claimedPercent) / flexibleCols}%` : undefined
  const widthFor = (column: any) =>
    column.width ? { width: column.width } : column.accessor === 'position' ? undefined : { width: evenWidth }

  return (
    <div ref={scrollRef} className="table-scroll overflow-x-auto rounded-[20px] border border-hairline bg-surface [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <table className="min-w-full tabular-nums">
        {/* Opaque, so rows scrolling under a sticky header stay hidden; the
            bottom line is a shadow because a collapsed border scrolls away */}
        <thead className="table-head">
          <tr className="h-[45px] font-mono text-xs uppercase leading-normal tracking-[0.08em] text-ink-muted">
            {activeColumns.map((column, index) => (
              <th
                key={index}
                data-accessor={column.accessor}
                style={widthFor(column)}
                className={`border-b border-hairline py-3 font-medium shadow-[inset_0_-1px_0_var(--hairline)] ${column.accessor === 'position' ? 'w-px whitespace-nowrap px-2 text-center' : column.accessor === 'team' || column.accessor === 'bearo' || column.accessor === 'player' ? 'whitespace-nowrap pl-4 pr-3 text-left md:pl-5 md:pr-4' : 'px-3 text-center md:px-4'} ${isSortable(column.accessor) ? 'cursor-pointer select-none hover:text-ink' : ''}`}
                onClick={() => handleSort(column.accessor)}
              >
                {column.header}
                {isSortable(column.accessor) && sortKey === column.accessor && (
                  <span className="ml-1 text-[10px]">{sortDir === 'desc' ? '▼' : '▲'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-base text-ink-2">
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="h-[45px] border-b border-hairline-row transition-colors duration-200"
              style={{
                // The bear's colour at 14% — the same tint the chips use
                backgroundColor: hoveredRow === rowIndex ? `${row.hoverColor}24` : 'transparent',
              }}
              onMouseEnter={() => setHoveredRow(rowIndex)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {/* Points (P) bold in the accent on every table and screen; olive in light */}
              {activeColumns.map((column, colIndex) => (
                <td key={colIndex} style={widthFor(column)} className={`py-2.5 ${column.accessor === 'position' ? 'w-px whitespace-nowrap px-2 text-center font-mono text-ink-muted' : column.accessor === 'team' || column.accessor === 'bearo' || column.accessor === 'player' ? 'whitespace-nowrap pl-4 pr-3 text-left md:pl-5 md:pr-4' : 'px-3 text-center md:px-4'} ${column.accessor === 'points' ? 'font-bold text-[color:var(--accent-text)]' : ''} ${column.cellClassName ?? ''}`}>
                  {fmtCell(row[column.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

