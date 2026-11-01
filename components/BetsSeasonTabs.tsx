"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import AddGameDialog from "./AddGameDialog"
import PlBetsGameweek from "./PlBetsGameweek"
import { PLAYER_COLORS } from "../lib/teamColors"
import PlayerCell from "./PlayerCell"
import CupHeader from "./design/CupHeader"
import StandingsBoard, { sparkSeries, winPercent, type StandingCardData } from "./design/StandingsBoard"
import { Panel, BearLegend, WinsSplit, EmptyPanel } from "./design/Panels"
import { RecordGrid, type RecordCard } from "./design/RecordTile"
import { splitRecordDate } from "./design/recordText"

const BetsChart = dynamic(() => import("./BetsChart"), { ssr: false })

// Define the seasons array with all the required seasons - added 2025/26 as first tabs
const seasons = [
  "2026/27",
  "2025/26",
  "2024/25",
  "2023/24",
  "2022/23",
  "2021/22",
  "2020/21",
  "2019/20",
  "2017",
  "2016",
  "2015",
  "2014",
  "2013",
  "2012",
  "All Time",
] as const
type Season = (typeof seasons)[number]

const pageTabs = ["Summary", "Insights", "Brecords"] as const
type PageTab = (typeof pageTabs)[number]

type StatCard = {
  value: string
  player?: keyof typeof PLAYER_COLORS
  description: string
}

const betsRecordCards: StatCard[] = [
  { value: "240", description: "Choco and Panda scored the same number of points in a season (2025/26)" },
  { value: "299", player: "Choco", description: "Choco scored the most points in a season (2023/24)" },
  { value: "38", player: "Panda", description: "Panda held first place for 38 consecutive rounds (2022/23)" },
  { value: "x3", description: "Panda and Vanilla have won the cup three times in a row (2012–14, 2020–23, 2015–18)" },
  { value: "56.67%", player: "Vanilla", description: "Vanilla scored the most points in a round — 17/30 (2021)" },
  { value: "4/5", player: "Vanilla", description: "Vanilla holds the record for most correctly predicted scores in a day (2016)" },
]

// Season-specific highlights, shown on the Insights tab for the selected season
const seasonHighlightCards: Partial<Record<Season, StatCard[]>> = {
  "2025/26": [
    { value: "240", description: "Choco and Panda tied for the season with the same points total" },
    { value: "0", player: "Vanilla", description: "Vanilla guessed 0 correct match results in an EPL game week" },
  ],
  "2023/24": [
    { value: "299", player: "Choco", description: "Choco scored the most points in a season" },
  ],
  "2022/23": [
    { value: "38", player: "Panda", description: "Panda held first place for 38 consecutive rounds (whole season)" },
    { value: "x3", player: "Panda", description: "Panda won his 3rd cup in a row — his second three-peat" },
  ],
  "2020/21": [
    { value: "17/30", player: "Vanilla", description: "Vanilla scored the most points in a round" },
  ],
  "2019/20": [
    { value: "4", description: "Smallest gap between 1st and 2nd place this season" },
  ],
  "2016": [
    { value: "4/5", player: "Vanilla", description: "Vanilla set the record for most correctly predicted scores in a day" },
  ],
  "2015": [
    { value: "68", description: "Largest gap between 1st and 2nd place this season" },
  ],
  "2014": [
    { value: "x3", player: "Panda", description: "Panda won his 3rd cup in a row" },
  ],
}

/** Stat cards are written as one sentence — the tile wants value, text, bear and date apart. */
function toRecordCard(card: StatCard): RecordCard {
  const { text, when } = splitRecordDate(card.description)
  return { value: card.value, text, when, who: card.player ? [card.player] : [] }
}

// Define types for the standings data
type StandingsData = {
  position: number
  player: React.ReactNode
  games?: number | string
  wins?: number
  points: number
  difference: string
  winPercentage?: string
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
  standings: StandingsData[]
  pieChartData?: PieChartData[]
  highlights?: string[]
}

// Define type for past seasons data
type PastSeasonsData = {
  [key in Season]?: SeasonData
}

// Player colors for consistent styling
const playerColors: Record<string, string> = {
  ...PLAYER_COLORS,
  Chocolate: PLAYER_COLORS.Choco, // Same as Choco
}

// Helper function to create player element with consistent styling
const createPlayerElement = (name: string) => {
  const color = playerColors[name as keyof typeof playerColors] || "#cccccc"
  return (
    <PlayerCell name={name} color={color} />
  )
}

// Static data for past seasons
const pastSeasonsData: PastSeasonsData = {
  "2023/24": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Choco"),
        games: 38,
        points: 299,
        difference: "-",
        hoverColor: playerColors.Chocolate,
      },
      {
        position: 2,
        player: createPlayerElement("Panda"),
        games: 38,
        points: 275,
        difference: "24",
        hoverColor: playerColors.Panda,
      },
      {
        position: 3,
        player: createPlayerElement("Vanilla"),
        games: 38,
        points: 270,
        difference: "5",
        hoverColor: playerColors.Vanilla,
      },
    ],
  },
  "2022/23": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Panda"),
        games: 38,
        points: 265,
        difference: "-",
        hoverColor: playerColors.Panda,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: 38,
        points: 249,
        difference: "16",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: 38,
        points: 234,
        difference: "15",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2021/22": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Panda"),
        games: 38,
        points: 269,
        difference: "-",
        hoverColor: playerColors.Panda,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: 38,
        points: 261,
        difference: "8",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: 38,
        points: 240,
        difference: "21",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2020/21": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Panda"),
        games: 38,
        points: 262,
        difference: "-",
        hoverColor: playerColors.Panda,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: 38,
        points: 253,
        difference: "9",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: 38,
        points: 244,
        difference: "9",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2019/20": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Choco"),
        games: 38,
        points: 269,
        difference: "-",
        hoverColor: playerColors.Chocolate,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: 38,
        points: 265,
        difference: "4",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Panda"),
        games: 38,
        points: 263,
        difference: "2",
        hoverColor: playerColors.Panda,
      },
    ],
  },
  "2017": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Vanilla"),
        games: "?",
        points: 460,
        difference: "-",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 2,
        player: createPlayerElement("Panda"),
        games: "?",
        points: 453,
        difference: "7",
        hoverColor: playerColors.Panda,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: "?",
        points: 389,
        difference: "64",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2016": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Vanilla"),
        games: "?",
        points: 526,
        difference: "-",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 2,
        player: createPlayerElement("Panda"),
        games: "?",
        points: 502,
        difference: "24",
        hoverColor: playerColors.Panda,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: "?",
        points: 443,
        difference: "59",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2015": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Vanilla"),
        games: "?",
        points: 560,
        difference: "-",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 2,
        player: createPlayerElement("Panda"),
        games: "?",
        points: 492,
        difference: "68",
        hoverColor: playerColors.Panda,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: "?",
        points: 490,
        difference: "2",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2014": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Panda"),
        games: "?",
        points: 623,
        difference: "-",
        hoverColor: playerColors.Panda,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: "?",
        points: 592,
        difference: "31",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: "?",
        points: 535,
        difference: "57",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2013": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Panda"),
        games: "?",
        points: 584,
        difference: "-",
        hoverColor: playerColors.Panda,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: "?",
        points: 579,
        difference: "5",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: "?",
        points: 538,
        difference: "41",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
  "2012": {
    standings: [
      {
        position: 1,
        player: createPlayerElement("Panda"),
        games: "?",
        points: 220,
        difference: "-",
        hoverColor: playerColors.Panda,
      },
      {
        position: 2,
        player: createPlayerElement("Vanilla"),
        games: "?",
        points: 206,
        difference: "14",
        hoverColor: playerColors.Vanilla,
      },
      {
        position: 3,
        player: createPlayerElement("Choco"),
        games: "?",
        points: 194,
        difference: "12",
        hoverColor: playerColors.Chocolate,
      },
    ],
  },
}

type BetsSeasonTabsProps = {
  title: string
  description: string
  currentSeasonData: any[]
  currentSeasonChartData: any[]
  currentSeasonPieData: any[]
  season2526Data: any[]
  season2526ChartData: any[]
  season2526PieData: any[]
  historicalSeasonData: any[]
  historicalSeasonChartData: any[]
  historicalSeasonPieData: any[]
  columns: any[]
  initialGameweek: number
  initialMatches: any[]
}

// Helper to reverse-map PLAYER_COLORS color -> player name
function playerNameFromColor(color: string): string {
  return Object.entries(playerColors).find(([, c]) => c === color)?.[0] ?? ""
}

// All Time columns
const GAMEWEEKS_IN_SEASON = 38

const allTimeColumns = [
  { header: "#", accessor: "position" },
  { header: "Player", accessor: "player" },
  { header: "GW", accessor: "games" },
  { header: "P", accessor: "points" },
  { header: "PD", accessor: "difference" },
  { header: "SW", accessor: "seasonsWon" },
]

// Helper to create player element for All Time table
const createAllTimePlayerElement = (name: string) => {
  const color = playerColors[name as keyof typeof playerColors] || "#cccccc"
  return (
    <PlayerCell name={name} color={color} />
  )
}

export default function BetsSeasonTabs({
  title,
  description,
  currentSeasonData,
  currentSeasonChartData,
  currentSeasonPieData,
  season2526Data,
  season2526ChartData,
  season2526PieData,
  historicalSeasonData,
  historicalSeasonChartData,
  historicalSeasonPieData,
  columns,
  initialGameweek,
  initialMatches,
}: BetsSeasonTabsProps) {
  const [activeSeason, setActiveSeason] = useState<Season>("2026/27")
  const [activeTab, setActiveTab] = useState<PageTab>("Summary")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const router = useRouter()

  // Compute All Time standings
  const computeAllTimeStandings = () => {
    const totals: Record<string, { games: number; wins: number; points: number; titles: number; hoverColor: string }> = {}

    const ensurePlayer = (name: string) => {
      if (!totals[name]) {
        totals[name] = { games: 0, wins: 0, points: 0, titles: 0, hoverColor: playerColors[name] ?? "#cccccc" }
      }
    }

    /** Season champion(s): most points at the end. A tie shares the title. */
    const awardTitle = (pointsByPlayer: Record<string, number>) => {
      const best = Math.max(...Object.values(pointsByPlayer), 0)
      if (best <= 0) return
      for (const [player, points] of Object.entries(pointsByPlayer)) {
        if (points !== best) continue
        ensurePlayer(player)
        totals[player].titles += 1
      }
    }

    // From DB seasons: max games/points per player from chart data, wins from standings
    const dbSets = [
      { chartData: currentSeasonChartData, standings: currentSeasonData },
      { chartData: season2526ChartData, standings: season2526Data },
      { chartData: historicalSeasonChartData, standings: historicalSeasonData },
    ]
    for (const { chartData, standings } of dbSets) {
      const maxGames: Record<string, number> = {}
      const maxPoints: Record<string, number> = {}
      for (const row of chartData) {
        const p = row.player as string
        if (maxGames[p] === undefined || row.games > maxGames[p]) maxGames[p] = row.games
        if (maxPoints[p] === undefined || row.points > maxPoints[p]) maxPoints[p] = row.points
      }
      const winsMap: Record<string, number> = {}
      for (const row of standings) {
        const name = playerNameFromColor(row.hoverColor)
        if (name) winsMap[name] = row.wins ?? 0
      }
      for (const [player, g] of Object.entries(maxGames)) {
        ensurePlayer(player)
        totals[player].games += g
        totals[player].points += maxPoints[player] ?? 0
        totals[player].wins += winsMap[player] ?? 0
      }
      // A season is over once all 38 gameweeks are in
      if (Math.max(...Object.values(maxGames), 0) >= GAMEWEEKS_IN_SEASON) awardTitle(maxPoints)
    }

    // From static pastSeasonsData
    for (const seasonKey of Object.keys(pastSeasonsData)) {
      const sd = pastSeasonsData[seasonKey as keyof typeof pastSeasonsData]
      if (!sd) continue
      const seasonPoints: Record<string, number> = {}
      for (const entry of sd.standings) {
        const name = playerNameFromColor(entry.hoverColor)
        if (!name) continue
        ensurePlayer(name)
        totals[name].games += typeof entry.games === "number" ? entry.games : 0
        totals[name].points += entry.points
        totals[name].wins += entry.wins ?? 0
        seasonPoints[name] = entry.points
      }
      awardTitle(seasonPoints)
    }

    const sorted = Object.entries(totals).sort(([, a], [, b]) => b.points - a.points)
    const leaderPoints = sorted[0]?.[1].points ?? 0
    return sorted.map(([name, data], index) => ({
        position: index + 1,
        player: createAllTimePlayerElement(name),
        games: data.games,
        wins: data.wins,
        points: data.points,
        difference: index === 0 ? "-" : String(data.points - leaderPoints),
        seasonsWon: data.titles,
        hoverColor: data.hoverColor,
      }))
  }

  const handleGameSuccess = () => {
    router.refresh()
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  /** Processed table rows carry the bear in their colour — the cards want the name. */
  const toCards = (data: any[], chartData?: any[]): StandingCardData[] =>
    data.map((row) => {
      const name = playerNameFromColor(row.hoverColor)
      // All time keeps no prediction split, so it shows the gameweek win rate and titles instead
      const stats =
        row.seasonsWon !== undefined
          ? [
              { label: "GW wins", value: row.wins ?? "—" },
              { label: "GW %", value: winPercent(row.wins, row.games) },
              { label: "Titles", value: row.seasonsWon },
            ]
          : [
              { label: "GW wins", value: row.wins ?? "—" },
              { label: "PS %", value: row.outcomePercent ?? "—" },
              { label: "EPS %", value: row.exactPercent ?? "—" },
            ]
      return { name, points: row.points, stats, series: chartData && sparkSeries(chartData, name) }
    })

  const gameweeksPlayed = (data: any[]) =>
    Math.max(...data.map((row) => (typeof row.games === "number" ? row.games : 0)), 0)

  /** Standings + chart + wins split, the shape every played season shares. */
  const renderSeason = (data: any[], chartData: any[], pieData: any[], gameweek?: React.ReactNode) => {
    const played = gameweeksPlayed(data)
    return (
      <>
        <section className="mx-auto max-w-page px-8 pt-10">
          <StandingsBoard cards={toCards(data, chartData)} columns={columns} rows={data} />
        </section>

        {gameweek}

        <section className="mx-auto flex max-w-page flex-wrap gap-6 px-8 pt-10">
          <Panel
            title="Season progress"
            aside={<BearLegend names={toCards(data).map((card) => card.name)} />}
            className="min-w-0 flex-[999_1_560px]"
          >
            <BetsChart entries={chartData} />
          </Panel>
          <WinsSplit
            title="Gameweek wins"
            rows={pieData.map((slice) => ({ name: slice.name, wins: slice.value }))}
            total={played}
            unit="GW"
          />
        </section>
      </>
    )
  }

  // Render content based on active tab
  const renderStandingsContent = () => {
    if (activeSeason === "2026/27") {
      return renderSeason(
        currentSeasonData,
        currentSeasonChartData,
        currentSeasonPieData,
        <section className="mx-auto max-w-page px-8 pt-12">
          <PlBetsGameweek initialGameweek={initialGameweek} initialMatches={initialMatches} />
        </section>,
      )
    } else if (activeSeason === "2025/26") {
      return renderSeason(season2526Data, season2526ChartData, season2526PieData)
    } else if (activeSeason === "2024/25") {
      return renderSeason(historicalSeasonData, historicalSeasonChartData, historicalSeasonPieData)
    } else if (pastSeasonsData[activeSeason]) {
      // For seasons with static data, use the provided static data
      const seasonData = pastSeasonsData[activeSeason]!
      return (
        <section className="mx-auto max-w-page px-8 pt-10">
          <StandingsBoard cards={toCards(seasonData.standings)} columns={columns} rows={seasonData.standings} />
        </section>
      )
    } else if (activeSeason === "All Time") {
      const allTimeData = computeAllTimeStandings()
      return (
        <section className="mx-auto max-w-page px-8 pt-10">
          <StandingsBoard heading="All time standings" cards={toCards(allTimeData)} columns={allTimeColumns} rows={allTimeData} />
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
          <EmptyPanel title="No insights yet" text="This cup has no insights for the season so far." />
        )}
      </section>
    )
  }

  const renderBrecordsContent = () => (
    <section className="mx-auto max-w-page px-8 pt-10">
      <RecordGrid cards={betsRecordCards.map(toRecordCard)} />
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
        selectId="season-bets"
        tabs={pageTabs.filter((tab) => !(tab === "Insights" && activeSeason === "All Time"))}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as PageTab)}
      />

      {dialogOpen && (
        <AddGameDialog
          apiEndpoint="/api/bets-game"
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
