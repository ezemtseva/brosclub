'use client'

import React, { useState, useRef, useEffect } from 'react'

interface Column {
  header: string
  accessor: string
  width?: string
}

interface DataTableProps {
  columns: Column[]
  mobileColumns?: Column[]
  data: any[]
  maxHeight?: string
  sortable?: boolean
  sortableColumns?: string[]
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

export default function DataTable({ columns, mobileColumns, data, maxHeight = '400px', sortable = false, sortableColumns }: DataTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [isMobile, setIsMobile] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const activeColumns = mobileColumns && isMobile ? mobileColumns : columns

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
        <thead>
          <tr className="h-[45px] font-mono text-xs uppercase leading-normal tracking-[0.08em] text-ink-muted">
            {activeColumns.map((column, index) => (
              <th
                key={index}
                style={widthFor(column)}
                className={`border-b border-hairline py-3 font-medium ${column.accessor === 'position' ? 'w-px whitespace-nowrap px-2 text-center' : column.accessor === 'team' || column.accessor === 'bearo' || column.accessor === 'player' ? 'whitespace-nowrap pl-5 pr-8 text-left md:pr-4' : 'px-4 text-center'} ${isSortable(column.accessor) ? 'cursor-pointer select-none hover:text-ink' : ''}`}
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
        <tbody className="text-sm text-ink-2">
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
              {activeColumns.map((column, colIndex) => (
                <td key={colIndex} style={widthFor(column)} className={`py-2.5 ${column.accessor === 'position' ? 'w-px whitespace-nowrap px-2 text-center font-mono text-ink-muted' : column.accessor === 'team' || column.accessor === 'bearo' || column.accessor === 'player' ? 'whitespace-nowrap pl-5 pr-8 text-left md:pr-4' : 'px-4 text-center'}`}>
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

