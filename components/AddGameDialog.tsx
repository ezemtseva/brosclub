"use client"

import { useState } from "react"

const PLAYERS = ["Panda", "Choco", "Vanilla"] as const
type Player = (typeof PLAYERS)[number]

interface AddGameDialogProps {
  apiEndpoint: string
  /**
   * When set, mobile shows dropdowns limited to these values — one per player.
   * A value picked by one player disappears from the others, and the last
   * player is filled in automatically. Desktop keeps the free-form inputs.
   */
  scoreOptions?: number[]
  onSuccess: () => void
  onClose: () => void
}

export default function AddGameDialog({ apiEndpoint, scoreOptions, onSuccess, onClose }: AddGameDialogProps) {
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

  // Dropdown pick: take the value off whoever else held it, then fill the last
  // remaining player automatically once the other two are set.
  const pickScore = (player: Player, val: string) => {
    setScores((prev) => {
      const next = { ...prev, [player]: val }
      if (!scoreOptions || val === "") return next

      for (const p of PLAYERS) {
        if (p !== player && next[p] === val) next[p] = ""
      }

      const empty = PLAYERS.filter((p) => next[p] === "")
      if (empty.length === 1) {
        const used = PLAYERS.filter((p) => p !== empty[0]).map((p) => Number(next[p]))
        const remaining = scoreOptions.find((o) => !used.includes(o))
        if (remaining !== undefined) next[empty[0]] = String(remaining)
      }
      return next
    })
  }

  // Values still selectable for a player: unused ones plus their own current value
  const optionsFor = (player: Player) =>
    (scoreOptions ?? []).filter(
      (o) =>
        Number(scores[player]) === o ||
        !PLAYERS.some((p) => p !== player && scores[p] !== "" && Number(scores[p]) === o)
    )

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
              {scoreOptions && (
                <select
                  className="season-select sm:hidden w-20 border border-gray-200 rounded-lg px-2 pr-6 py-1 text-sm font-bold bg-white focus:outline-none"
                  value={scores[player]}
                  onChange={(e) => pickScore(player, e.target.value)}
                >
                  <option value=""></option>
                  {optionsFor(player).map((o) => (
                    <option key={o} value={String(o)}>{o}</option>
                  ))}
                </select>
              )}
              <input
                type="number"
                className={`${scoreOptions ? "hidden sm:block" : ""} w-20 text-center border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold bg-white focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
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
