"use client"

import { useState } from "react"

const PLAYERS = ["Panda", "Choco", "Vanilla"] as const
type Player = (typeof PLAYERS)[number]

interface AddGGGameDialogProps {
  onSuccess: () => void
  onClose: () => void
}

export default function AddGGGameDialog({ onSuccess, onClose }: AddGGGameDialogProps) {
  const [points, setPoints] = useState<Record<Player, string>>({ Panda: "", Choco: "", Vanilla: "" })
  const [fiveK, setFiveK] = useState<Record<Player, string>>({ Panda: "", Choco: "", Vanilla: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isValid = PLAYERS.every(
    (p) =>
      points[p] !== "" && !isNaN(Number(points[p])) &&
      fiveK[p] !== "" && !isNaN(Number(fiveK[p])) && Number(fiveK[p]) >= 0
  )

  const allPointsFilled = PLAYERS.every((p) => points[p] !== "")
  const maxPoints = allPointsFilled ? Math.max(...PLAYERS.map((p) => Number(points[p]))) : null

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    setError("")

    const res = await fetch("/api/gg-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        points: Object.fromEntries(PLAYERS.map((p) => [p, Number(points[p])])),
        fiveK: Object.fromEntries(PLAYERS.map((p) => [p, Number(fiveK[p])])),
      }),
    })

    setIsSubmitting(false)

    if (res.ok) {
      onSuccess()
      onClose()
    } else {
      const data = await res.json()
      setError(data.error || "Something went wrong")
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-5">Add Game Result</h2>

        {/* Header row */}
        <div className="flex items-center gap-3 mb-2 px-4">
          <span className="flex-1 text-xs font-medium text-gray-400 uppercase tracking-wide">Player</span>
          <span className="w-16 text-center text-xs font-medium text-gray-400 uppercase tracking-wide">Points</span>
          <span className="w-16 text-center text-xs font-medium text-gray-400 uppercase tracking-wide">5K</span>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          {PLAYERS.map((player) => {
            const isTop = allPointsFilled && maxPoints !== null && Number(points[player]) === maxPoints
            return (
              <div
                key={player}
                className={`flex items-center gap-3 border rounded-lg px-4 py-2 transition-colors ${
                  isTop ? "border-yellow-300 bg-yellow-50" : "border-gray-200 bg-white"
                }`}
              >
                <span className="flex-1 text-sm font-medium">{player}</span>
                <input
                  type="number"
                  className="w-16 text-center border border-gray-200 rounded-lg px-1 py-1 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  placeholder="0"
                  value={points[player]}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "" || val === "-") {
                      setPoints((prev) => ({ ...prev, [player]: val }))
                    } else {
                      const digits = val.replace(/[^0-9]/g, "")
                      const signed = val.startsWith("-") ? `-${digits}` : digits
                      setPoints((prev) => ({ ...prev, [player]: signed.slice(0, 6) }))
                    }
                  }}
                />
                <input
                  type="number"
                  min="0"
                  className="w-16 text-center border border-gray-200 rounded-lg px-1 py-1 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  placeholder="0"
                  value={fiveK[player]}
                  onChange={(e) =>
                    setFiveK((prev) => ({ ...prev, [player]: e.target.value.slice(0, 2) }))
                  }
                />
              </div>
            )
          })}
        </div>

        {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg disabled:opacity-40 hover:bg-gray-700 transition-colors"
          >
            {isSubmitting ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  )
}
