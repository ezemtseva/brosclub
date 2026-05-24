"use client"

import type React from "react"

import { useState } from "react"

interface FlippableCardProps {
  frontContent: React.ReactNode
  backContent: React.ReactNode
  bgColor: string
}

export default function FlippableCard({ frontContent, backContent, bgColor }: FlippableCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleClick = () => {
    setIsFlipped(!isFlipped)
  }

  const flipIcon = (
    <div className="absolute top-3 right-3 text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
      </svg>
    </div>
  )

  return (
    <div
      className="flip-card cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
      onClick={handleClick}
    >
      <div className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}>
        <div className={`flip-card-front relative ${bgColor} shadow-md rounded-lg p-6 flex flex-col items-center`}>
          {flipIcon}
          {frontContent}
        </div>
        <div className={`flip-card-back relative ${bgColor} shadow-md rounded-lg p-6 flex flex-col items-center justify-center`}>
          {flipIcon}
          {backContent}
        </div>
      </div>
    </div>
  )
}

