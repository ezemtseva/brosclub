'use client'

import React, { useState } from 'react'

interface Column {
  header: string
  accessor: string
  width?: string
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  maxHeight?: string
  sortable?: boolean
  sortableColumns?: string[]
}

const NON_SORTABLE = new Set(['position', 'team', 'bearo', 'player', 'form'])

function parseValue(val: any): number {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const n = parseFloat(val.replace('%', ''))
    return isNaN(n) ? 0 : n
  }
  return 0
}

export default function DataTable({ columns, data, maxHeight = '400px', sortable = false, sortableColumns }: DataTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-xs md:text-sm leading-normal h-[45px]">
            {columns.map((column, index) => (
              <th
                key={index}
                style={column.width ? { width: column.width } : undefined}
                className={`py-2 px-4 ${column.accessor === 'position' ? 'text-left w-px whitespace-nowrap' : column.accessor === 'team' || column.accessor === 'bearo' || column.accessor === 'player' ? 'text-left whitespace-nowrap' : 'text-center'} ${isSortable(column.accessor) ? 'cursor-pointer select-none hover:text-gray-900' : ''}`}
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
        <tbody className="text-gray-600 text-xs md:text-sm font-light">
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-gray-200 transition-colors duration-200 h-[45px]"
              style={{
                backgroundColor: hoveredRow === rowIndex ? `${row.hoverColor}80` : 'transparent',
              }}
              onMouseEnter={() => setHoveredRow(rowIndex)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} style={column.width ? { width: column.width } : undefined} className={`py-2 px-4 ${column.accessor === 'position' ? 'text-left w-px whitespace-nowrap' : column.accessor === 'team' || column.accessor === 'bearo' || column.accessor === 'player' ? 'text-left whitespace-nowrap' : 'text-center'}`}>
                  {row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

