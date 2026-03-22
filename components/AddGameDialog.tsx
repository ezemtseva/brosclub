"use client"

import { useState } from "react"

const PLAYERS = ["Panda", "Choco", "Vanilla"] as const
type Player = (typeof PLAYERS)[number]

interface AddGameDialogProps {
  apiEndpoint: string
  onSuccess: () => void
  onClose: () => void
}

export default function AddGameDialog({ apiEndpoint, onSuccess, onClose }: AddGameDialogProps) {
  const [scores, setScores] = useState<Record<Player, string>>({
    Panda: "",
    Choco: "",
    Vanilla: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isValid = PLAYERS.every(
    (p) => scores[p] !== "" && scores[p] !== "-" && !isNaN(Number(scores[p]))
  )

  const numericScores = Object.fromEntries(PLAYERS.map((p) => [p, Number(scores[p])]))
  const maxScore = Math.max(...PLAYERS.map((p) => numericScores[p]))
  const allFilled = PLAYERS.every((p) => scores[p] !== "")

  const getRowClass = (player: Player) => {
    if (allFilled && numericScores[player] === maxScore) return "border-yellow-300 bg-yellow-50"
    return "border-gray-200 bg-white"
  }

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    setError("")

    const res = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scores: Object.fromEntries(PLAYERS.map((p) => [p, Number(scores[p])])),
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
        <h2 className="text-lg font-bold mb-6">Add Game Result</h2>

        <div className="flex flex-col gap-3 mb-6">
          {PLAYERS.map((player) => (
            <div
              key={player}
              className={`flex items-center justify-between border rounded-lg px-4 py-2 transition-colors ${getRowClass(player)}`}
            >
              <span className="text-sm font-medium">{player}</span>
              <input
                type="number"
                className="w-20 text-center border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={scores[player]}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "" || val === "-") {
                    setScores((prev) => ({ ...prev, [player]: val }))
                  } else {
                    const digits = val.replace(/[^0-9]/g, "")
                    const signed = val.startsWith("-") ? `-${digits}` : digits
                    setScores((prev) => ({ ...prev, [player]: signed.slice(0, 4) }))
                  }
                }}
              />
            </div>
          ))}
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
