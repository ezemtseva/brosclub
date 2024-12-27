'use client'

import React, { useState } from 'react'

interface Column {
  header: string
  accessor: string
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
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            {columns.map((column, index) => (
              <th key={index} className={`py-3 px-6 ${column.accessor === 'team' ? 'text-left' : 'text-center'}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className="border-b border-gray-200 transition-colors duration-200"
              style={{
                backgroundColor: hoveredRow === rowIndex ? `${row.hoverColor}80` : 'transparent',
              }}
              onMouseEnter={() => setHoveredRow(rowIndex)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={`py-3 px-6 ${column.accessor === 'team' ? 'text-left' : 'text-center'}`}>
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

