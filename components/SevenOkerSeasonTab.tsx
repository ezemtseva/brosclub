"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import ImageCarousel from "./ImageCarousel"
import SevenOkerChartToggle from "./SevenOkerChartToggle"
import AddGameDialog from "./AddGameDialog"
import { PLAYER_COLORS } from "../lib/teamColors"
import PlayerCell from "./PlayerCell"
import CupHeader from "./design/CupHeader"
import StandingsBoard, { winPercent, type StandingCardData } from "./design/StandingsBoard"
import { EmptyPanel } from "./design/Panels"
import { RecordGrid, type RecordCard } from "./design/RecordTile"
import { splitRecordDate } from "./design/recordText"

// Define the seasons array
const seasons = ["2026/27", "2025/26", "2024/25", "All Time"] as const
type Season = (typeof seasons)[number]

// Player colors for consistent styling
const playerColors = PLAYER_COLORS

// Helper to reverse-map player color -> player name
function playerNameFromColor(color: string): string {
  return Object.entries(playerColors).find(([, c]) => c === color)?.[0] ?? ""
}

const pageTabs = ["Summary", "Insights", "Brecords"] as const
type PageTab = (typeof pageTabs)[number]

const PLAYER_AVATARS: Record<string, string> = {
  Vanilla: "/imgs/vanilla.png",
  Choco: "/imgs/choco.png",
  Panda: "/imgs/panda.png",
}

type StatCard = {
  value?: string
  player?: keyof typeof PLAYER_COLORS
  description: string
  // Lime tile with dark ink, for the cup's signature record
  highlight?: boolean
}

const sevenOkerRecordCards: StatCard[] = [
  { player: "Vanilla", description: "Vanilla won the first ever 7oker game (29.03.2025)" },
  { player: "Panda", description: "Panda won the first season — took him 71 games to reach 100 points" },
  { player: "Choco", description: "Choco was the first to win a game by golden round against Panda (2024/25)" },
  { value: "5", highlight: true, description: "Vanilla and Choco share the longest winning streak — 5 games (2024/25 and 2025/26)" },
  { value: "298", player: "Panda", description: "Panda scored the biggest amount of points in a single game (2025/26)" },
  { value: "10.645", player: "Panda", description: "Panda holds the record for the most gamepoints in a season (2025/26)" },
]

// Season-specific highlights, shown on the Insights tab for the selected season
const seasonHighlightCards: Partial<Record<Season, StatCard[]>> = {
  "2025/26": [
    { value: "298", player: "Panda", description: "Panda set the new record for the most points in a single game" },
    { value: "5", player: "Vanilla", description: "Vanilla matched Choco's record with 5 consecutive wins" },
    { value: "10.645", player: "Panda", description: "Panda broke his own record for the most gamepoints in a season" },
  ],
  "2024/25": [
    { player: "Vanilla", description: "Vanilla won the first ever game" },
    { player: "Panda", description: "Panda won the first cup" },
    { player: "Choco", description: "Choco was the first one to win the game by golden round against Panda" },
    { value: "5", player: "Choco", description: "Choco set the longest winning streak — 5 games in a row" },
    { value: "294", player: "Vanilla", description: "Vanilla scored the biggest amount of points in a single game" },
    { value: "10.422", player: "Panda", description: "Panda scored the biggest amount of gamepoints in a season" },
  ],
}

/** Stat cards are written as one sentence — the tile wants value, text, bear and date apart. */
function toRecordCard(card: StatCard): RecordCard {
  const { text, when } = splitRecordDate(card.description)
  return { value: card.value, text, when, who: card.player ? [card.player] : [], highlight: card.highlight }
}

/**
 * Seating runs on a fixed six-game rotation that restarts every seventh game,
 * so game N sits in slot ((N - 1) mod 6).
 */
const SEATING_ROTATION = [
  ["Choco", "Panda", "Vanilla"],
  ["Panda", "Vanilla", "Choco"],
  ["Vanilla", "Choco", "Panda"],
  ["Choco", "Vanilla", "Panda"],
  ["Vanilla", "Panda", "Choco"],
  ["Panda", "Choco", "Vanilla"],
]

function seatingForGame(gameNumber: number) {
  return SEATING_ROTATION[(gameNumber - 1) % SEATING_ROTATION.length]
}

/** The 7oker season ends once someone reaches this many points. */
const SEASON_WIN_TARGET = 100

// All Time columns
const allTimeColumns = [
  { header: "#", accessor: "position" },
  { header: "Bearo", accessor: "bearo" },
  { header: "G", accessor: "games" },
  { header: "W", accessor: "wins" },
  { header: "P", accessor: "points" },
  { header: "PD", accessor: "difference" },
  { header: "GP", accessor: "gamepoints" },
  { header: "GPD", accessor: "gamepointsDifference" },
  { header: "W%", accessor: "winPercentage" },
  { header: "SW", accessor: "seasonsWon" },
]

type SevenOkerSeasonTabsProps = {
  title: string
  description: React.ReactNode
  currentSeasonData: any[]
  currentSeasonChartData: any[]
  currentSeasonPieData: any[]
  currentSeasonHighlights: any[]
  historicalSeasonData: any[]
  historicalSeasonChartData: any[]
  historicalSeasonPieData: any[]
  historicalSeasonHighlights: any[]
  season2425Data: any[]
  season2425ChartData: any[]
  season2425PieData: any[]
  season2425Highlights: any[]
  columns: any[]
}

export default function SevenOkerSeasonTabs({
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
  season2425Data,
  season2425ChartData,
  season2425PieData,
  season2425Highlights,
  columns,
}: SevenOkerSeasonTabsProps) {
  const [activeSeason, setActiveSeason] = useState<Season>("2026/27")
  const [activeTab, setActiveTab] = useState<PageTab>("Summary")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const router = useRouter()

  // Compute All Time standings
  const computeAllTimeStandings = () => {
    const totals: Record<string, { games: number; wins: number; points: number; gamepoints: number; titles: number; hoverColor: string }> = {}

    const ensurePlayer = (name: string) => {
      if (!totals[name]) {
        totals[name] = { games: 0, wins: 0, points: 0, gamepoints: 0, titles: 0, hoverColor: playerColors[name] ?? "#cccccc" }
      }
    }

    /** Season champion(s): most points, once someone has reached the target. */
    const awardTitle = (pointsByPlayer: Record<string, number>) => {
      const best = Math.max(...Object.values(pointsByPlayer), 0)
      if (best < SEASON_WIN_TARGET) return
      for (const [player, points] of Object.entries(pointsByPlayer)) {
        if (points !== best) continue
        ensurePlayer(player)
        totals[player].titles += 1
      }
    }

    for (const chartData of [currentSeasonChartData, historicalSeasonChartData, season2425ChartData]) {
      const maxGames: Record<string, number> = {}
      const maxPoints: Record<string, number> = {}
      const maxWins: Record<string, number> = {}
      const maxGamepoints: Record<string, number> = {}
      for (const row of chartData) {
        const p = (row.bearo ?? row.player) as string
        if (maxGames[p] === undefined || row.games > maxGames[p]) maxGames[p] = row.games
        if (maxPoints[p] === undefined || row.points > maxPoints[p]) maxPoints[p] = row.points
        if (maxWins[p] === undefined || row.wins > maxWins[p]) maxWins[p] = row.wins
        const gp = row.gamepoints ?? 0
        if (maxGamepoints[p] === undefined || gp > maxGamepoints[p]) maxGamepoints[p] = gp
      }
      for (const player of Object.keys(maxGames)) {
        ensurePlayer(player)
        totals[player].games += maxGames[player] ?? 0
        totals[player].points += maxPoints[player] ?? 0
        totals[player].wins += maxWins[player] ?? 0
        totals[player].gamepoints += maxGamepoints[player] ?? 0
      }
      awardTitle(maxPoints)
    }

    const sorted = Object.entries(totals).sort(([, a], [, b]) => b.points - a.points)
    const leaderPoints = sorted[0]?.[1].points ?? 0
    const leaderGamepoints = sorted[0]?.[1].gamepoints ?? 0
    return sorted.map(([name, data], index) => ({
        position: index + 1,
        bearo: (
          <PlayerCell name={name} color={data.hoverColor} />
        ),
        games: data.games,
        wins: data.wins,
        points: data.points,
        difference: index === 0 ? "-" : String(data.points - leaderPoints),
        gamepoints: data.gamepoints,
        gamepointsDifference: index === 0 ? "-" : String(data.gamepoints - leaderGamepoints),
        winPercentage: data.games > 0 ? `${((data.wins / data.games) * 100).toFixed(1)}%` : "0%",
        seasonsWon: data.titles,
        hoverColor: data.hoverColor,
      }))
  }

  const handleGameSuccess = () => {
    router.refresh()
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Render content based on active tab
  const [seatingOpen, setSeatingOpen] = useState(false)

  // Games already played this season decide which seat order comes next
  const gamesPlayed = currentSeasonData.reduce((max: number, row: any) => Math.max(max, row.games ?? 0), 0)
  const nextGameNumber = gamesPlayed + 1

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
          // The season total, as in the table's GP column
          { label: "GP", value: (row.gamepoints ?? 0).toLocaleString("de-DE") },
        ],
      }
    })

  /** Standings + chart, the shape every played season shares. */
  const renderSeason = (
    data: any[],
    chartData: any[],
    pieData: any[],
    highlights: any[],
    extras?: React.ReactNode,
    actions?: React.ReactNode,
  ) => (
    <>
      <section className="mx-auto max-w-page px-8 pt-10">
        <StandingsBoard
          cards={toCards(data)}
          columns={columns}
          rows={data}
          actions={actions}
          notice={extras}
        />
      </section>

      <section className="mx-auto max-w-page px-8 pt-10">
        <SevenOkerChartToggle entries={chartData} pieChartData={pieData} />
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
    if (activeSeason === "2026/27") {
      // Current season — live data from sevenOkerEntry
      const [first, second, third] = seatingForGame(nextGameNumber)
      const who = (name: string) => <span className="font-medium text-ink">{name}</span>
      return renderSeason(
        currentSeasonData,
        currentSeasonChartData,
        currentSeasonPieData,
        currentSeasonHighlights,
        seatingOpen && (
          <div className="mb-4 rounded-2xl border border-hairline bg-surface-2 px-5 py-4">
            {/* Phones get the order alone */}
            <span className="text-[15px] text-ink-muted md:hidden">
              Game #{nextGameNumber}: {who(first)} → {who(second)} → {who(third)}
            </span>
            <span className="hidden text-[15px] text-ink-muted md:inline">
              Game {nextGameNumber}: {who(first)} creates the table, then {who(second)} joins and later {who(third)}
            </span>
          </div>
        ),
        <>
          {/* A "?" hint on phones, so it shares the row with the heading and Add game */}
          <button
            onClick={() => setSeatingOpen((open) => !open)}
            aria-label={seatingOpen ? "Hide seating" : "Show seating"}
            aria-expanded={seatingOpen}
            className={`flex h-11 w-11 items-center justify-center rounded-full border text-base font-semibold transition-colors md:w-auto md:px-[18px] md:text-sm md:font-medium ${
              seatingOpen ? "border-ink text-ink" : "border-hairline-strong text-ink hover:border-ink"
            }`}
          >
            <span aria-hidden="true" className="md:hidden">?</span>
            <span className="hidden md:inline">{seatingOpen ? "Hide seating" : "Show seating"}</span>
          </button>
          <button
            onClick={() => setDialogOpen(true)}
            aria-label="Add game"
            className="min-h-[44px] whitespace-nowrap rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 md:px-[18px]"
          >
            {/* "+ Game" on phones keeps it on the heading's row */}
            <span className="md:hidden">+ Game</span>
            <span className="hidden md:inline">+ Add game</span>
          </button>
        </>,
      )
    } else if (activeSeason === "2025/26") {
      // 2025/26 season — archived data from sevenOkerEntry2526
      return renderSeason(
        historicalSeasonData,
        historicalSeasonChartData,
        historicalSeasonPieData,
        historicalSeasonHighlights,
      )
    } else if (activeSeason === "2024/25") {
      // For the 2024/25 season, use the archived data from sevenOkerEntry2024
      return renderSeason(season2425Data, season2425ChartData, season2425PieData, season2425Highlights)
    } else if (activeSeason === "All Time") {
      const allTimeData = computeAllTimeStandings()
      return (
        <section className="mx-auto max-w-page px-8 pt-10">
          <StandingsBoard heading="All time standings" cards={toCards(allTimeData)} columns={allTimeColumns} rows={allTimeData} />
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
          <EmptyPanel title="No insights yet" text="This cup has no insights for the season so far." />
        )}
      </section>
    )
  }

  const renderBrecordsContent = () => (
    <section className="mx-auto max-w-page px-8 pt-10">
      <RecordGrid cards={sevenOkerRecordCards.map(toRecordCard)} />
    </section>
  )

  return (
    <div className="pb-24">
      <CupHeader
        title={title}
        tagline={description}
        seasons={seasons}
        activeSeason={activeSeason}
        onSeasonChange={(season) => {
          setActiveSeason(season as Season)
          if (season === "All Time" && activeTab === "Insights") setActiveTab("Summary")
        }}
        selectId="season-7oker"
        tabs={pageTabs.filter((tab) => !(tab === "Insights" && activeSeason === "All Time"))}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as PageTab)}
      />

      {dialogOpen && (
        <AddGameDialog
          apiEndpoint="/api/7oker-game"
          onSuccess={handleGameSuccess}
          onClose={() => setDialogOpen(false)}
        />
      )}

      {showToast && (
        <div className="fixed right-4 top-16 z-50 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-lg">
          Game added ✓
        </div>
      )}

      {/* Render content based on active page tab */}
      {activeTab === "Summary" && renderStandingsContent()}
      {activeTab === "Insights" && renderInsightsContent()}
      {activeTab === "Brecords" && renderBrecordsContent()}
    </div>
  )
}
