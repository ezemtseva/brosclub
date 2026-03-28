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
}

export default function DataTable({ columns, data, maxHeight = '400px' }: DataTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-xs md:text-sm leading-normal h-[45px]">
            {columns.map((column, index) => (
              <th key={index} style={column.width ? { width: column.width } : undefined} className={`py-2 px-4 ${column.accessor === 'position' ? 'text-left w-px whitespace-nowrap' : column.accessor === 'team' || column.accessor === 'bearo' || column.accessor === 'player' ? 'text-left whitespace-nowrap' : 'text-center'}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-600 text-xs md:text-sm font-light">
          {data.map((row, rowIndex) => (
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

