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

  return (
    <div
      className="flip-card cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
      onClick={handleClick}
    >
      <div className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}>
        <div className={`flip-card-front ${bgColor} shadow-md rounded-lg p-6 flex flex-col items-center`}>
          {frontContent}
        </div>
        <div className={`flip-card-back ${bgColor} shadow-md rounded-lg p-6 flex flex-col items-center justify-center`}>
          {backContent}
        </div>
      </div>
    </div>
  )
}

