"use client"

import Image from "next/image"
import { PLAYER_COLORS, TEAM_ABBR } from "../lib/teamColors"

interface FifaMatchRecord {
  id: number
  teamA: string
  scoreA: number
  teamB: string
  scoreB: number
  createdAt: string
}

interface PlayerTeams {
  Vanilla: string[]
  Choco: string[]
  Panda: string[]
}

interface FifaMatchResultsProps {
  matches: FifaMatchRecord[]
  playerTeams: PlayerTeams
  teamLogos: Record<string, string>
}

function getPlayerColor(team: string, playerTeams: PlayerTeams): string {
  for (const [player, teams] of Object.entries(playerTeams)) {
    if (teams.includes(team)) return PLAYER_COLORS[player] ?? "#ccc"
  }
  return "transparent"
}

function TeamCell({ team, playerTeams, teamLogos, align = "left" }: { team: string; playerTeams: PlayerTeams; teamLogos: Record<string, string>; align?: "left" | "right" }) {
  const color = getPlayerColor(team, playerTeams)
  const logo = teamLogos[team] || "/placeholder.svg"
  const abbr = TEAM_ABBR[team]
  return (
    <div className="flex items-center justify-center space-x-2 whitespace-nowrap">
      <Image src={logo} alt={team} width={24} height={24} className="rounded-full shrink-0" />
      <span className="relative">
        <span className="hidden md:inline">{team}</span>
        <span className="inline md:hidden">{abbr ?? team}</span>
        <span className="absolute bottom-0 left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: color }} />
      </span>
    </div>
  )
}

export default function FifaMatchResults({ matches, playerTeams, teamLogos }: FifaMatchResultsProps) {
  return (
    <div className="overflow-x-auto flex justify-center">
      <table className="bg-white w-auto min-w-full">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-xs md:text-sm leading-normal h-[45px]">
            <th className="py-2 px-4 text-center w-px whitespace-nowrap">Home</th>
            <th className="py-2 px-1 text-center w-px whitespace-nowrap">Score</th>
            <th className="py-2 px-4 text-center w-px whitespace-nowrap">Away</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-xs md:text-sm font-light">
          {matches.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-8 text-center text-gray-400">No matches played yet</td>
            </tr>
          ) : (
            matches.map((match) => {
              const aWins = match.scoreA > match.scoreB
              const bWins = match.scoreB > match.scoreA
              return (
                <tr key={match.id} className="border-b border-gray-200 h-[45px]">
                  <td className="py-2 px-4 w-px whitespace-nowrap text-center">
                    <TeamCell team={match.teamA} playerTeams={playerTeams} teamLogos={teamLogos} align="right" />
                  </td>
                  <td className="py-2 px-1 text-center w-px whitespace-nowrap">
                    <span className={aWins ? "font-bold text-gray-900" : "text-gray-400"}>{match.scoreA}</span>
                    <span className="text-gray-300 mx-0.5">:</span>
                    <span className={bWins ? "font-bold text-gray-900" : "text-gray-400"}>{match.scoreB}</span>
                  </td>
                  <td className="py-2 px-4 w-px whitespace-nowrap">
                    <TeamCell team={match.teamB} playerTeams={playerTeams} teamLogos={teamLogos} />
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
