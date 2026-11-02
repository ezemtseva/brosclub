"use client"

import type React from "react"

import { useState } from "react"
import ImageCarousel from "./ImageCarousel"
import dynamic from "next/dynamic"
import { PLAYER_COLORS } from "../lib/teamColors"
import PlayerCell from "./PlayerCell"
import CupHeader from "./design/CupHeader"
import StandingsBoard, { winPercent, type StandingCardData } from "./design/StandingsBoard"
import { gamesCaption, phoneColumns } from "./design/gameweekTable"
import { Panel, WinsSplit, EmptyPanel } from "./design/Panels"
import { RecordGrid, type RecordCard } from "./design/RecordTile"
import { splitRecordDate } from "./design/recordText"

const PokerChart = dynamic(() => import("./PokerChart"), { ssr: false })

// Define the seasons array with all the required seasons - added 2025/26 as first tab
const seasons = ["XXXX/XX", "2024/25", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "All Time"] as const //Update to return 25-26
type Season = (typeof seasons)[number]

const visibleSeasons = seasons.filter((season) => season !== "XXXX/XX")

const pageTabs = ["Summary", "Insights", "Brecords"] as const
type PageTab = (typeof pageTabs)[number]

type StatCard = {
  value?: string
  player?: keyof typeof PLAYER_COLORS
  description: string
  // Lime tile with dark ink, for the cup's signature record
  highlight?: boolean
}

const holdemRecordCards: StatCard[] = [
  { player: "Panda", description: "Panda won the first game (06.09.2012)" },
  { value: "263", player: "Panda", description: "Panda was the first to win 100 games — it took him 263 games (09.06.2017)" },
  { value: "1h 41m", highlight: true, description: "The longest poker game (2015)" },
  { value: "5", player: "Panda", description: "Panda holds the record for the longest winning streak — 5 games (10th season, 2025)" },
  { player: "Choco", description: "Choco is the first player to get a straight flush and four aces" },
  { player: "Vanilla", description: "Vanilla is the first player to get a six- and seven-card straight flush" },
  { player: "Panda", description: "Panda is the first and only player to get a royal flush (hearts) — first in 2014, then again in 2025" },
]

// Season-specific highlights, shown on the Insights tab for the selected season
const seasonHighlightCards: Partial<Record<Season, StatCard[]>> = {
  "2024/25": [
    { value: "5", player: "Panda", description: "Panda set the new record for the longest winning streak" },
    { player: "Panda", description: "Panda got his second royal flush, again hearts" },
  ],
  "2018": [
    { value: "50%", player: "Panda", description: "Panda set the biggest win rate in a season" },
  ],
  "2017": [
    { value: "23", description: "Largest gap between 1st and 2nd place this season" },
  ],
  "2015": [
    { value: "1h 41m", highlight: true, description: "The longest poker game" },
  ],
  "2014": [
    { player: "Vanilla", description: "Vanilla is the first player to get a six- and seven-card straight flush" },
    { player: "Panda", description: "Panda is the first and only player to get a royal flush (hearts)" },
  ],
  "2013": [
    { player: "Choco", description: "Choco is the first player to get a straight flush and four aces" },
  ],
  "2012": [
    { player: "Panda", description: "Panda won the first club game" },
    { value: "1", description: "Smallest gap between 1st and 2nd place this season" },
  ],
}

/** Stat cards are written as one sentence — the tile wants value, text, bear and date apart. */
function toRecordCard(card: StatCard): RecordCard {
  const { text, when } = splitRecordDate(card.description)
  return { value: card.value, text, when, who: card.player ? [card.player] : [], highlight: card.highlight }
}

// Define types for the standings data
type StandingsData = {
  position: number
  bearo: React.ReactNode
  games: number
  wins: number
  points: number
  pointsDifference: string
  winPercentage: string
  hoverColor: string
}

// Define type for pie chart data
type PieChartData = {
  name: string
  value: number
  color: string
}

// Define type for season data
type SeasonData = {
  standings?: StandingsData[]
  pieChartData?: PieChartData[]
  highlights?: string[]
}

// Define type for past seasons data
type PastSeasonsData = {
  [key in Season]?: SeasonData
}

// Static data for past seasons - will be populated later
const pastSeasonsData: PastSeasonsData = {
  "2020": {
    standings: [
      {
        position: 1,
        bearo: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 58,
        wins: 24,
        points: 70,
        pointsDifference: "-",
        winPercentage: "41.4%",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        bearo: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 58,
        wins: 15,
        points: 55,
        pointsDifference: "15",
        winPercentage: "25.9%",
        hoverColor: PLAYER_COLORS.Choco,
      },
      {
        position: 3,
        bearo: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 58,
        wins: 19,
        points: 49,
        pointsDifference: "6",
        winPercentage: "32.8%",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 24,
        color: PLAYER_COLORS.Panda,
      },
      {
        name: "Choco",
        value: 15,
        color: PLAYER_COLORS.Choco,
      },
      {
        name: "Vanilla",
        value: 19,
        color: PLAYER_COLORS.Vanilla,
      },
    ],
  },
  "2019": {
    standings: [
      {
        position: 1,
        bearo: <span className="relative rounded bg-surface-3 px-2 py-1 font-mono text-ink-dim">DSQ</span>,
        games: 24,
        wins: 10,
        points: 43,
        pointsDifference: "-",
        winPercentage: "41.7%",
        hoverColor: "#cccccc",
      },
      {
        position: 2,
        bearo: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 24,
        wins: 8,
        points: 39,
        pointsDifference: "4",
        winPercentage: "33.3%",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 3,
        bearo: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 24,
        wins: 3,
        points: 32,
        pointsDifference: "7",
        winPercentage: "12.5%",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 4,
        bearo: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 24,
        wins: 3,
        points: 30,
        pointsDifference: "2",
        winPercentage: "12.5%",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
    pieChartData: [
      {
        name: "DSQ",
        value: 10,
        color: "#cccccc",
      },
      {
        name: "Panda",
        value: 8,
        color: PLAYER_COLORS.Panda,
      },
      {
        name: "Vanilla",
        value: 3,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        name: "Choco",
        value: 3,
        color: PLAYER_COLORS.Choco,
      },
    ],
  },
  "2018": {
    standings: [
      {
        position: 1,
        bearo: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 44,
        wins: 22,
        points: 90,
        pointsDifference: "-",
        winPercentage: "50.0%",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        bearo: <span className="relative rounded bg-surface-3 px-2 py-1 font-mono text-ink-dim">DSQ</span>,
        games: 44,
        wins: 12,
        points: 66,
        pointsDifference: "24",
        winPercentage: "27.3%",
        hoverColor: "#cccccc",
      },
      {
        position: 3,
        bearo: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 44,
        wins: 7,
        points: 59,
        pointsDifference: "7",
        winPercentage: "15.9%",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 4,
        bearo: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 44,
        wins: 3,
        points: 49,
        pointsDifference: "10",
        winPercentage: "6.8%",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 22,
        color: PLAYER_COLORS.Panda,
      },
      {
        name: "DSQ",
        value: 12,
        color: "#cccccc",
      },
      {
        name: "Vanilla",
        value: 7,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        name: "Choco",
        value: 3,
        color: PLAYER_COLORS.Choco,
      },
    ],
  },
  "2017": {
    standings: [
      {
        position: 1,
        bearo: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 36,
        wins: 17,
        points: 72,
        pointsDifference: "-",
        winPercentage: "47.2%",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        bearo: <span className="relative rounded bg-surface-3 px-2 py-1 font-mono text-ink-dim">DSQ</span>,
        games: 36,
        wins: 9,
        points: 49,
        pointsDifference: "23",
        winPercentage: "25.0%",
        hoverColor: "#cccccc",
      },
      {
        position: 3,
        bearo: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 36,
        wins: 4,
        points: 47,
        pointsDifference: "2",
        winPercentage: "11.1%",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 4,
        bearo: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 36,
        wins: 6,
        points: 47,
        pointsDifference: "0",
        winPercentage: "16.7%",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 17,
        color: PLAYER_COLORS.Panda,
      },
      {
        name: "DSQ",
        value: 9,
        color: "#cccccc",
      },
      {
        name: "Choco",
        value: 6,
        color: PLAYER_COLORS.Choco,
      },
      {
        name: "Vanilla",
        value: 4,
        color: PLAYER_COLORS.Vanilla,
      },
    ],
  },
  "2016": {
    standings: [
      {
        position: 1,
        bearo: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 38,
        wins: 12,
        points: 67,
        pointsDifference: "-",
        winPercentage: "31.6%",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        bearo: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 38,
        wins: 11,
        points: 60,
        pointsDifference: "7",
        winPercentage: "28.9%",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 3,
        bearo: <span className="relative rounded bg-surface-3 px-2 py-1 font-mono text-ink-dim">DSQ</span>,
        games: 38,
        wins: 9,
        points: 55,
        pointsDifference: "5",
        winPercentage: "23.7%",
        hoverColor: "#cccccc",
      },
      {
        position: 4,
        bearo: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 38,
        wins: 6,
        points: 46,
        pointsDifference: "9",
        winPercentage: "15.8%",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 12,
        color: PLAYER_COLORS.Panda,
      },
      {
        name: "Vanilla",
        value: 11,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        name: "DSQ",
        value: 9,
        color: "#cccccc",
      },
      {
        name: "Choco",
        value: 6,
        color: PLAYER_COLORS.Choco,
      },
    ],
  },
  "2015": {
    standings: [
      {
        position: 1,
        bearo: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 70,
        wins: 29,
        points: 124,
        pointsDifference: "-",
        winPercentage: "41.4%",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        bearo: <span className="relative rounded bg-surface-3 px-2 py-1 font-mono text-ink-dim">DSQ</span>,
        games: 70,
        wins: 18,
        points: 119,
        pointsDifference: "5",
        winPercentage: "25.7%",
        hoverColor: "#cccccc",
      },
      {
        position: 3,
        bearo: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 70,
        wins: 10,
        points: 95,
        pointsDifference: "24",
        winPercentage: "14.3%",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 4,
        bearo: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 70,
        wins: 14,
        points: 94,
        pointsDifference: "1",
        winPercentage: "20.0%",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 29,
        color: PLAYER_COLORS.Panda,
      },
      {
        name: "DSQ",
        value: 18,
        color: "#cccccc",
      },
      {
        name: "Choco",
        value: 14,
        color: PLAYER_COLORS.Choco,
      },
      {
        name: "Vanilla",
        value: 10,
        color: PLAYER_COLORS.Vanilla,
      },
    ],
  },
  "2014": {
    standings: [
      {
        position: 1,
        bearo: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 67,
        wins: 24,
        points: 114,
        pointsDifference: "-",
        winPercentage: "35.8%",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        bearo: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 67,
        wins: 14,
        points: 110,
        pointsDifference: "4",
        winPercentage: "20.9%",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 3,
        bearo: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 67,
        wins: 16,
        points: 105,
        pointsDifference: "5",
        winPercentage: "23.9%",
        hoverColor: PLAYER_COLORS.Choco,
      },
      {
        position: 4,
        bearo: <span className="relative rounded bg-surface-3 px-2 py-1 font-mono text-ink-dim">DSQ</span>,
        games: 67,
        wins: 13,
        points: 75,
        pointsDifference: "30",
        winPercentage: "19.4%",
        hoverColor: "#cccccc",
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 24,
        color: PLAYER_COLORS.Panda,
      },
      {
        name: "Choco",
        value: 16,
        color: PLAYER_COLORS.Choco,
      },
      {
        name: "Vanilla",
        value: 14,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        name: "DSQ",
        value: 13,
        color: "#cccccc",
      },
    ],
  },
  "2013": {
    standings: [
      {
        position: 1,
        bearo: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 48,
        wins: 20,
        points: 142,
        pointsDifference: "-",
        winPercentage: "41.7%",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        bearo: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 48,
        wins: 13,
        points: 136,
        pointsDifference: "6",
        winPercentage: "27.1%",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 3,
        bearo: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 48,
        wins: 7,
        points: 117,
        pointsDifference: "19",
        winPercentage: "14.6%",
        hoverColor: PLAYER_COLORS.Choco,
      },
      {
        position: 4,
        bearo: <span className="relative rounded bg-surface-3 px-2 py-1 font-mono text-ink-dim">DSQ</span>,
        games: 48,
        wins: 8,
        points: 89,
        pointsDifference: "28",
        winPercentage: "16.7%",
        hoverColor: "#cccccc",
      },
    ],
    pieChartData: [
      {
        name: "Panda",
        value: 20,
        color: PLAYER_COLORS.Panda,
      },
      {
        name: "Vanilla",
        value: 13,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        name: "DSQ",
        value: 8,
        color: "#cccccc",
      },
      {
        name: "Choco",
        value: 7,
        color: PLAYER_COLORS.Choco,
      },
    ],
  },
  "2012": {
    standings: [
      {
        position: 1,
        bearo: <span className="relative rounded bg-surface-3 px-2 py-1 font-mono text-ink-dim">DSQ</span>,
        games: 21,
        wins: 7,
        points: 47,
        pointsDifference: "-",
        winPercentage: "33.3%",
        hoverColor: "#cccccc",
      },
      {
        position: 2,
        bearo: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 21,
        wins: 6,
        points: 46,
        pointsDifference: "1",
        winPercentage: "28.6%",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 3,
        bearo: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 21,
        wins: 3,
        points: 45,
        pointsDifference: "1",
        winPercentage: "14.3%",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 4,
        bearo: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 21,
        wins: 5,
        points: 44,
        pointsDifference: "1",
        winPercentage: "23.8%",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
    pieChartData: [
      {
        name: "DSQ",
        value: 7,
        color: "#cccccc",
      },
      {
        name: "Panda",
        value: 6,
        color: PLAYER_COLORS.Panda,
      },
      {
        name: "Choco",
        value: 5,
        color: PLAYER_COLORS.Choco,
      },
      {
        name: "Vanilla",
        value: 3,
        color: PLAYER_COLORS.Vanilla,
      },
    ],
  },
}

// Helper to reverse-map PLAYER_COLORS color -> player name
function playerNameFromColor(color: string): string {
  return Object.entries(PLAYER_COLORS).find(([, c]) => c === color)?.[0] ?? ""
}

// All Time columns
/**
 * The cup is permanently suspended, so its title count is final — Panda took
 * every season played.
 */
const SEASONS_WON: Record<string, number> = { Panda: 8, Vanilla: 0, Choco: 0 }

const allTimeColumns = [
  { header: "#", accessor: "position" },
  { header: "Bearo", accessor: "bearo" },
  { header: "G", accessor: "games" },
  { header: "W", accessor: "wins" },
  { header: "P", accessor: "points" },
  { header: "PD", accessor: "difference" },
  { header: "W%", accessor: "winPercentage" },
  { header: "SW", accessor: "seasonsWon" },
]

type HoldemSeasonTabsProps = {
  title: React.ReactNode
  description: string
  currentSeasonData: StandingsData[]
  currentSeasonChartData: any[]
  currentSeasonPieData: PieChartData[]
  currentSeasonHighlights: any[]
  historicalSeasonData: StandingsData[]
  historicalSeasonChartData: any[]
  historicalSeasonPieData: PieChartData[]
  historicalSeasonHighlights: any[]
  columns: any[]
}

export default function HoldemSeasonTabs({
  title,
  description,
  currentSeasonData,
  currentSeasonChartData,
  currentSeasonPieData,
  currentSeasonHighlights,
  historicalSeasonData,
  historicalSeasonChartData,
  historicalSeasonPieData,
  historicalSeasonHighlights,
  columns,
}: HoldemSeasonTabsProps) {
  // The cup is over — All Time is the view that matters now
  const [activeSeason, setActiveSeason] = useState<Season>("All Time")
  const [activeTab, setActiveTab] = useState<PageTab>("Summary")

  // Compute All Time standings
  const computeAllTimeStandings = () => {
    const totals: Record<string, { games: number; wins: number; points: number; hoverColor: string }> = {}

    const ensurePlayer = (name: string) => {
      if (!totals[name]) {
        totals[name] = { games: 0, wins: 0, points: 0, hoverColor: PLAYER_COLORS[name] ?? "#cccccc" }
      }
    }

    // From DB seasons: max games/points/wins per player from chart data
    for (const chartData of [currentSeasonChartData, historicalSeasonChartData]) {
      const maxGames: Record<string, number> = {}
      const maxPoints: Record<string, number> = {}
      const maxWins: Record<string, number> = {}
      for (const row of chartData) {
        const p = (row.bearo ?? row.player) as string
        if (maxGames[p] === undefined || row.games > maxGames[p]) maxGames[p] = row.games
        if (maxPoints[p] === undefined || row.points > maxPoints[p]) maxPoints[p] = row.points
        if (maxWins[p] === undefined || row.wins > maxWins[p]) maxWins[p] = row.wins
      }
      for (const player of Object.keys(maxGames)) {
        ensurePlayer(player)
        totals[player].games += maxGames[player] ?? 0
        totals[player].points += maxPoints[player] ?? 0
        totals[player].wins += maxWins[player] ?? 0
      }
    }

    // From static pastSeasonsData - only include known players (skip DSQ)
    for (const seasonKey of Object.keys(pastSeasonsData)) {
      const sd = pastSeasonsData[seasonKey as keyof typeof pastSeasonsData]
      if (!sd || !sd.standings) continue
      for (const entry of sd.standings) {
        const name = playerNameFromColor(entry.hoverColor)
        if (!name) continue // skip DSQ and unknown players
        ensurePlayer(name)
        totals[name].games += entry.games
        totals[name].points += entry.points
        totals[name].wins += entry.wins
      }
    }

    const sorted = Object.entries(totals).sort(([, a], [, b]) => b.points - a.points)
    const leaderPoints = sorted[0]?.[1].points ?? 0
    return sorted.map(([name, data], index) => ({
        position: index + 1,
        bearo: (
          <PlayerCell name={name} color={data.hoverColor} />
        ),
        games: data.games,
        wins: data.wins,
        points: data.points,
        difference: index === 0 ? "-" : String(data.points - leaderPoints),
        winPercentage: data.games > 0 ? `${((data.wins / data.games) * 100).toFixed(1)}%` : "0%",
        seasonsWon: SEASONS_WON[name] ?? 0,
        hoverColor: data.hoverColor,
      }))
  }

  // Render content based on active tab
  /** Processed table rows carry the bear in their colour — the cards want the name. */
  const toCards = (data: any[]): StandingCardData[] =>
    data.map((row) => {
      const name = playerNameFromColor(row.hoverColor)
      return {
        name,
        points: row.points,
        stats: [
          { label: "Wins", value: row.wins ?? "—" },
          { label: "Win %", value: row.winPercentage ?? winPercent(row.wins, row.games) },
          // Titles are an all-time figure; a single season shows its games instead
          row.seasonsWon !== undefined
            ? { label: "Titles", value: row.seasonsWon }
            : { label: "Games", value: row.games ?? "—" },
        ],
      }
    })

  const gamesIn = (data: any[]) => data.reduce((max: number, row: any) => Math.max(max, row.games ?? 0), 0)

  /** Standings + chart, the shape every played season shares. */
  const renderSeason = (data: any[], chartData: any[], pieData: any[], highlights: any[]) => (
    <>
      <section className="mx-auto max-w-page px-8 pt-10">
        <StandingsBoard cards={toCards(data)} columns={columns} rows={data} />
      </section>

      <section className="mx-auto flex max-w-page flex-wrap gap-6 px-8 pt-10">
        <Panel
          title="Season progress"
          className="min-w-0 flex-[999_1_560px]"
        >
          <PokerChart entries={chartData} />
        </Panel>
        <WinsSplit
          title="Wins"
          rows={pieData.map((slice) => ({ name: slice.name, wins: slice.value }))}
          total={gamesIn(data)}
          unit="games"
        />
      </section>

      {highlights.length > 0 && (
        <section className="mx-auto max-w-page px-8 pt-10">
          <h2 className="mb-4 font-display text-2xl font-bold">Highlights</h2>
          <ImageCarousel images={highlights} />
        </section>
      )}
    </>
  )

  const renderStandingsContent = () => {
    if (activeSeason === "XXXX/XX") {
      // For the current season (2025/26), use the live data from pokerEntry
      return renderSeason(currentSeasonData, currentSeasonChartData, currentSeasonPieData, currentSeasonHighlights)
    } else if (activeSeason === "2024/25") {
      // For the 2024/25 season, use the historical data from pokerEntry2024
      return renderSeason(
        historicalSeasonData,
        historicalSeasonChartData,
        historicalSeasonPieData,
        historicalSeasonHighlights,
      )
    } else if (pastSeasonsData[activeSeason]) {
      // For seasons with static data, use the provided static data
      const seasonData = pastSeasonsData[activeSeason]!

      return (
        <section className="mx-auto max-w-page px-8 pt-10">
          {seasonData.standings ? (
            <StandingsBoard cards={toCards(seasonData.standings)} columns={columns} rows={seasonData.standings} />
          ) : (
            <>
              <h2 className="mb-4 font-display text-2xl font-bold">Standings</h2>
              <EmptyPanel
                title={`Season ${activeSeason}`}
                text={`Standings data for the ${activeSeason} season will be added soon.`}
              />
            </>
          )}
        </section>
      )
    } else if (activeSeason === "All Time") {
      const allTimeData = computeAllTimeStandings()
      return (
        <section className="mx-auto max-w-page px-8 pt-10">
          <StandingsBoard
            // Phones: "Standings" with the games played beside it, and a table
            // without G (now in the heading) and SW
            heading={
              <>
                <span className="md:hidden">Standings</span>
                <span className="hidden md:inline">All time standings</span>
              </>
            }
            cards={toCards(allTimeData)}
            columns={allTimeColumns}
            mobileColumns={phoneColumns(allTimeColumns, ["games", "seasonsWon"])}
            tableCaption={gamesCaption("G", allTimeData)}
            rows={allTimeData}
          />
        </section>
      )
    } else {
      // For other past seasons, show placeholder content that will be replaced with static data later
      return (
        <section className="mx-auto max-w-page px-8 pt-10">
          <EmptyPanel
            title={`Season ${activeSeason} archive`}
            text={`Historical data for the ${activeSeason} season will be added soon.`}
          />
        </section>
      )
    }
  }

  const renderInsightsContent = () => {
    const highlights = seasonHighlightCards[activeSeason]
    return (
      <section className="mx-auto max-w-page px-8 pt-10">
        {highlights && highlights.length > 0 ? (
          <RecordGrid cards={highlights.map(toRecordCard)} />
        ) : (
          <EmptyPanel title="No insights yet" text="This cup has no insights for the season so far." titleOnlyOnPhones />
        )}
      </section>
    )
  }

  const renderBrecordsContent = () => (
    <section className="mx-auto max-w-page px-8 pt-10">
      <RecordGrid cards={holdemRecordCards.map(toRecordCard)} />
    </section>
  )

  return (
    <div className="pb-12">
      <CupHeader
        title={title}
        tagline={description}
        seasons={visibleSeasons}
        activeSeason={activeSeason}
        onSeasonChange={(season) => {
          setActiveSeason(season as Season)
          if (season === "All Time" && activeTab === "Insights") setActiveTab("Summary")
        }}
        selectId="season-holdem"
        tabs={pageTabs.filter((tab) => !(tab === "Insights" && activeSeason === "All Time"))}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as PageTab)}
      />

      {/* Render content based on active page tab */}
      {activeTab === "Summary" && renderStandingsContent()}
      {activeTab === "Insights" && renderInsightsContent()}
      {activeTab === "Brecords" && renderBrecordsContent()}
    </div>
  )
}