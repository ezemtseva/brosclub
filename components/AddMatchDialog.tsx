"use client"

import { useState } from "react"

interface AddMatchDialogProps {
  teams: string[]
  onSuccess: () => void
  onClose: () => void
}

export default function AddMatchDialog({ teams, onSuccess, onClose }: AddMatchDialogProps) {
  const [teamA, setTeamA] = useState("")
  const [teamB, setTeamB] = useState("")
  const [scoreA, setScoreA] = useState("0")
  const [scoreB, setScoreB] = useState("0")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isValid =
    teamA &&
    teamB &&
    teamA !== teamB &&
    !isNaN(Number(scoreA)) &&
    !isNaN(Number(scoreB)) &&
    Number(scoreA) >= 0 &&
    Number(scoreB) >= 0

  const aScore = Number(scoreA)
  const bScore = Number(scoreB)
  const selectAClass = !teamA && !teamB
    ? "border-gray-200"
    : aScore > bScore
    ? "border-green-300 bg-green-50"
    : aScore < bScore
    ? "border-red-300 bg-red-50"
    : "border-gray-300 bg-gray-50"
  const selectBClass = !teamA && !teamB
    ? "border-gray-200"
    : bScore > aScore
    ? "border-green-300 bg-green-50"
    : bScore < aScore
    ? "border-red-300 bg-red-50"
    : "border-gray-300 bg-gray-50"

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    setError("")

    const res = await fetch("/api/fifa-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamA,
        scoreA: Number(scoreA),
        teamB,
        scoreB: Number(scoreB),
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

  const teamsForB = teams.filter((t) => t !== teamA)
  const teamsForA = teams.filter((t) => t !== teamB)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-6">Add Match Result</h2>

        {/* Match row */}
        <div className="flex items-center gap-3 mb-6">
          {/* Team A */}
          <select
            className={`flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors ${selectAClass}`}
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
          >
            <option value="">Select team</option>
            {teamsForA.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Score A */}
          <input
            type="number"
            min="0"
            max="99"
            className="w-14 shrink-0 text-center border border-gray-200 rounded-lg px-2 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            value={scoreA}
            onChange={(e) => {
              const val = e.target.value.slice(0, 2)
              setScoreA(val)
            }}
          />

          <span className="text-gray-400 font-bold shrink-0">:</span>

          {/* Score B */}
          <input
            type="number"
            min="0"
            max="99"
            className="w-14 shrink-0 text-center border border-gray-200 rounded-lg px-2 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            value={scoreB}
            onChange={(e) => {
              const val = e.target.value.slice(0, 2)
              setScoreB(val)
            }}
          />

          {/* Team B */}
          <select
            className={`flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors ${selectBClass}`}
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
          >
            <option value="">Select team</option>
            {teamsForB.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}

        {/* Actions */}
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
