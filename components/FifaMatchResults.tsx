"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { PLAYER_COLORS, shortenTeamName, teamAbbr } from "../lib/teamColors"

const TEAM_NAME_MAP: Record<string, string> = {
  "Nottingham Forrest": "Nottingham Forest",
  "Olympique Lyon": "Olympique Lyonnais",
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

/** One side of a result card: owner dot, crest and club name; the winner stays white. */
function TeamCell({
  team,
  playerTeams,
  teamLogos,
  align = "left",
  won,
}: {
  team: string
  playerTeams: PlayerTeams
  teamLogos: Record<string, string>
  align?: "left" | "right"
  won: boolean
}) {
  const normalized = normalizeTeam(team)
  const color = getPlayerColor(team, playerTeams)
  const logo = teamLogos[team] || "/placeholder.svg"
  return (
    <span
      className={`flex min-w-0 items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""} ${
        won ? "font-semibold text-ink" : "text-ink-dim"
      }`}
    >
      <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <Image
        src={logo}
        alt={normalized}
        width={24}
        height={24}
        className="h-6 w-6 shrink-0 object-contain"
      />
      <span className="truncate">
        {/* Phones: the three-letter code. Full names while Results runs the page's
            width; the short ones in the narrow column beside the standings (1280px+) */}
        <span className="inline md:hidden">{teamAbbr(normalized)}</span>
        <span className="hidden md:inline xl:hidden">{normalized}</span>
        <span className="hidden xl:inline">{shortenTeamName(normalized)}</span>
      </span>
    </span>
  )
}

/** Height of the fade at the bottom of the list while more results lie below. */
const FADE = 80

export default function FifaMatchResults({ matches, playerTeams, teamLogos }: FifaMatchResultsProps) {
  const listRef = useRef<HTMLDivElement>(null)
  // More results below the fold: the last visible card fades out, so the list
  // reads as one to scroll; gone once scrolled to the end or with nothing to scroll
  const [moreBelow, setMoreBelow] = useState(false)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const update = () => setMoreBelow(list.scrollTop + list.clientHeight < list.scrollHeight - 4)
    update()
    list.addEventListener("scroll", update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(list)
    return () => {
      list.removeEventListener("scroll", update)
      observer.disconnect()
    }
  }, [matches.length])

  if (matches.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-hairline-strong px-6 py-12 text-center text-[15px] text-ink-muted">
        No matches played yet
      </div>
    )
  }

  return (
    <div
      ref={listRef}
      className="table-scroll flex flex-col gap-2 overflow-y-auto"
      // The list's bottom edge fades to nothing over FADE px while more lies below
      style={
        moreBelow
          ? {
              maskImage: `linear-gradient(to bottom, #000 calc(100% - ${FADE}px), transparent)`,
              WebkitMaskImage: `linear-gradient(to bottom, #000 calc(100% - ${FADE}px), transparent)`,
            }
          : undefined
      }
    >
      {matches.map((match) => (
        <div
          key={match.id}
          className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 rounded-[14px] border border-hairline bg-surface px-4 py-3.5 text-base"
        >
          <TeamCell
            team={match.teamA}
            playerTeams={playerTeams}
            teamLogos={teamLogos}
            won={match.scoreA > match.scoreB}
          />
          <span className="rounded-lg bg-surface-3 px-2.5 py-1 font-mono text-base font-medium text-ink">
            {match.scoreA}:{match.scoreB}
          </span>
          <TeamCell
            team={match.teamB}
            playerTeams={playerTeams}
            teamLogos={teamLogos}
            align="right"
            won={match.scoreB > match.scoreA}
          />
        </div>
      ))}
      {/* A blur that deepens toward the bottom, pinned to the list's lower edge
          while more lies below; it takes no room in the list */}
      {moreBelow && (
        <div
          aria-hidden="true"
          className="pointer-events-none sticky bottom-0 shrink-0 backdrop-blur-[3px]"
          style={{
            height: FADE,
            marginTop: -FADE - 8,
            maskImage: "linear-gradient(to bottom, transparent, #000)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000)",
          }}
        />
      )}
    </div>
  )
}
