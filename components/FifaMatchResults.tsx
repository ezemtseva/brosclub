"use client"

import Image from "next/image"
import { PLAYER_COLORS, TEAM_ABBR } from "../lib/teamColors"

const TEAM_NAME_MAP: Record<string, string> = {
  "Nottingham Forrest": "Nottingham Forest",
  "Olympique Lyonnais": "Olympique Lyon",
  "SL Benfica": "Benfica",
  "S.L. Benfica": "Benfica",
  "S.S. Lazio": "SS Lazio",
  "Lazio": "SS Lazio",
  "A.S. Roma": "AS Roma",
  "Roma": "AS Roma",
  "AC Milan": "Milan",
  "Monaco": "AS Monaco",
  "Atlectic Bilbao": "Athletic Bilbao",
  "Atletic Bilbao": "Athletic Bilbao",
  "Sevillia": "Sevilla",
  "Lille OSC": "Lille",
  "Leicester": "Leicester City",
  "Real Sosiedad": "Real Sociedad",
  "Borussia Monhengladbah": "Borussia Mönchengladbach",
  "Feyenord": "Feyenoord",
  "River PLate": "River Plate",
}

function normalizeTeam(name: string): string {
  return TEAM_NAME_MAP[name] ?? name
}

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
  const normalized = normalizeTeam(team)
  const color = getPlayerColor(team, playerTeams)
  const logo = teamLogos[team] || "/placeholder.svg"
  const abbr = TEAM_ABBR[normalized]
  return (
    <div className={`flex items-center space-x-2 whitespace-nowrap w-full ${align === "right" ? "flex-row-reverse space-x-reverse justify-center md:justify-start" : "justify-center md:justify-start"}`}>
      <Image src={logo} alt={normalized} width={24} height={24} className="rounded-full shrink-0" />
      <span className="relative">
        <span className="hidden md:inline">{normalized}</span>
        <span className="inline md:hidden">{abbr ?? normalized}</span>
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
            <th className="py-2 px-4 text-center w-[45%] whitespace-nowrap">Home</th>
            <th className="py-2 px-1 text-center w-px whitespace-nowrap">Score</th>
            <th className="py-2 px-4 text-center w-[45%] whitespace-nowrap">Away</th>
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
                  <td className="py-2 px-4 w-[45%] whitespace-nowrap">
                    <TeamCell team={match.teamA} playerTeams={playerTeams} teamLogos={teamLogos} />
                  </td>
                  <td className="py-2 px-1 text-center w-px whitespace-nowrap">
                    <span className={aWins ? "font-bold text-gray-900" : "text-gray-400"} style={{fontSize:'12.25px'}}>{match.scoreA}</span>
                    <span className="text-gray-300 mx-0.5" style={{fontSize:'12.25px'}}>:</span>
                    <span className={bWins ? "font-bold text-gray-900" : "text-gray-400"} style={{fontSize:'12.25px'}}>{match.scoreB}</span>
                  </td>
                  <td className="py-2 px-4 w-[45%] whitespace-nowrap">
                    <TeamCell team={match.teamB} playerTeams={playerTeams} teamLogos={teamLogos} align="right" />
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
