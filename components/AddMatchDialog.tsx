"use client"

import { useState, useRef } from "react"

interface AddMatchDialogProps {
  teams: string[]
  onSuccess: () => void
  onClose: () => void
}

interface TeamSelectProps {
  options: string[]
  value: string
  onChange: (val: string) => void
  colorClass: string
}

function TeamSelect({ options, value, onChange, colorClass }: TeamSelectProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = query
    ? options.filter((t) => t.toLowerCase().includes(query.toLowerCase()))
    : options

  const handleSelect = (team: string) => {
    onChange(team)
    setQuery("")
    setOpen(false)
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false)
      setQuery("")
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0" onBlur={handleBlur}>
      <input
        type="text"
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors ${colorClass}`}
        placeholder="Select team"
        value={open ? query : value}
        onFocus={() => { setOpen(true); setQuery("") }}
        onChange={(e) => setQuery(e.target.value)}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((team) => (
            <li
              key={team}
              onMouseDown={() => handleSelect(team)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
            >
              {team}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function AddMatchDialog({ teams, onSuccess, onClose }: AddMatchDialogProps) {
  const [teamA, setTeamA] = useState("")
  const [teamB, setTeamB] = useState("")
  const [scoreA, setScoreA] = useState("")
  const [scoreB, setScoreB] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isValid =
    teamA &&
    teamB &&
    teamA !== teamB &&
    scoreA !== "" &&
    scoreB !== "" &&
    !isNaN(Number(scoreA)) &&
    !isNaN(Number(scoreB)) &&
    Number(scoreA) >= 0 &&
    Number(scoreB) >= 0

  const aScore = Number(scoreA)
  const bScore = Number(scoreB)
  const scoresEntered = scoreA !== "" && scoreB !== ""

  const selectAClass = !scoresEntered
    ? "border-gray-200"
    : aScore > bScore
    ? "border-green-300 bg-green-50"
    : aScore < bScore
    ? "border-red-300 bg-red-50"
    : "border-gray-300 bg-gray-50"
  const selectBClass = !scoresEntered
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
        <h2 className="text-lg font-bold mb-6">Add Game Result</h2>

        {/* Match row */}
        <div className="flex items-center gap-3 mb-6">
          <TeamSelect
            options={teamsForA}
            value={teamA}
            onChange={setTeamA}
            colorClass={selectAClass}
          />

          {/* Score A */}
          <input
            type="number"
            min="0"
            max="99"
            placeholder="0"
            className="w-14 shrink-0 text-center border border-gray-200 rounded-lg px-2 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value.slice(0, 2))}
          />

          <span className="text-gray-400 font-bold shrink-0">:</span>

          {/* Score B */}
          <input
            type="number"
            min="0"
            max="99"
            placeholder="0"
            className="w-14 shrink-0 text-center border border-gray-200 rounded-lg px-2 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value.slice(0, 2))}
          />

          <TeamSelect
            options={teamsForB}
            value={teamB}
            onChange={setTeamB}
            colorClass={selectBClass}
          />
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
