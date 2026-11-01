"use client"

import type React from "react"

import { useState } from "react"
import ImageCarousel from "./ImageCarousel"
import dynamicImport from "next/dynamic"
import { PLAYER_COLORS } from "../lib/teamColors"
import PlayerCell from "./PlayerCell"
import CupHeader from "./design/CupHeader"
import StandingsBoard, { sparkSeries, winPercent, type StandingCardData } from "./design/StandingsBoard"
import { Panel, BearLegend, WinsSplit, EmptyPanel } from "./design/Panels"
import { RecordGrid, type RecordCard } from "./design/RecordTile"
import { splitRecordDate } from "./design/recordText"

const FplChart = dynamicImport(() => import("./FplChart"), { ssr: false })

const seasons = [
  "2026/27",
  "2025/26",
  "2024/25",
  "2023/24",
  "2022/23",
  "2021/22",
  "2020/21",
  "2019/20",
  "2018/19",
  "2017/18",
  "All Time",
] as const
type Season = (typeof seasons)[number]

const pageTabs = ["Summary", "Insights", "Brecords"] as const
type PageTab = (typeof pageTabs)[number]

type StatCard = {
  value?: string
  player?: keyof typeof PLAYER_COLORS
  description: string
}

const fplRecordCards: StatCard[] = [
  { value: "2.511", player: "Panda", description: "Panda holds the record for the most points in a season (2023/24)" },
  { value: "25", player: "Panda", description: "Panda held first place for 25 consecutive rounds (2022/23)" },
  { value: "141", player: "Choco", description: "Choco scored the most points in a round with a boost (2021/22)" },
  { value: "131", player: "Vanilla", description: "Vanilla scored the most points in a round without any boost (2022/23)" },
]

// Season-specific highlights, shown on the Insights tab for the selected season
const seasonHighlightCards: Partial<Record<Season, StatCard[]>> = {
  "2025/26": [
    { player: "Choco", description: "Choco has won the first FPL title" },
  ],
  "2023/24": [
    { value: "2.511", player: "Panda", description: "Panda set the new points record for a season" },
  ],
  "2022/23": [
    { value: "25", player: "Panda", description: "Panda held first place for 25 consecutive rounds" },
    { value: "131", player: "Vanilla", description: "Vanilla scored the most points in a round without any boosts" },
  ],
  "2021/22": [
    { value: "141", player: "Choco", description: "Choco scored the most points in a round with a boost" },
    { value: "23", description: "Smallest gap between 1st and 2nd place this season" },
  ],
  "2017/18": [
    { value: "256", description: "Largest gap between 1st and 2nd place this season" },
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
  games: number
  points: number
  difference: string
  hoverColor: string
}

// Define type for season data
type SeasonData = {
  standings: StandingsData[]
  highlights?: string[]
}

// Define type for past seasons data
type PastSeasonsData = {
  [key in Season]?: SeasonData
}

// Static data for past seasons
const pastSeasonsData: PastSeasonsData = {
  "2023/24": {
    standings: [
      {
        position: 1,
        player: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 38,
        points: 2511,
        difference: "-",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        player: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 38,
        points: 2339,
        difference: "172",
        hoverColor: PLAYER_COLORS.Choco,
      },
      {
        position: 3,
        player: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 38,
        points: 2217,
        difference: "122",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
    ],
  },
  "2022/23": {
    standings: [
      {
        position: 1,
        player: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 38,
        points: 2422,
        difference: "-",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        player: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 38,
        points: 2309,
        difference: "113",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 3,
        player: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 38,
        points: 2209,
        difference: "100",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
  },
  "2021/22": {
    standings: [
      {
        position: 1,
        player: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 38,
        points: 2187,
        difference: "-",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 2,
        player: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 38,
        points: 2164,
        difference: "23",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 3,
        player: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 38,
        points: 2150,
        difference: "14",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
  },
  "2020/21": {
    standings: [
      {
        position: 1,
        player: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 38,
        points: 2332,
        difference: "-",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        player: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 38,
        points: 2192,
        difference: "140",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 3,
        player: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 38,
        points: 2192,
        difference: "0",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
  },
  "2019/20": {
    standings: [
      {
        position: 1,
        player: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 38,
        points: 2232,
        difference: "-",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 2,
        player: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 38,
        points: 2160,
        difference: "72",
        hoverColor: PLAYER_COLORS.Choco,
      },
      {
        position: 3,
        player: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 38,
        points: 1981,
        difference: "179",
        hoverColor: PLAYER_COLORS.Panda,
      },
    ],
  },
  "2018/19": {
    standings: [
      {
        position: 1,
        player: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 38,
        points: 2017,
        difference: "-",
        hoverColor: PLAYER_COLORS.Panda,
      },
      {
        position: 2,
        player: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 38,
        points: 1967,
        difference: "50",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 3,
        player: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 38,
        points: 1907,
        difference: "60",
        hoverColor: PLAYER_COLORS.Choco,
      },
    ],
  },
  "2017/18": {
    standings: [
      {
        position: 1,
        player: (
          <PlayerCell name={"Vanilla"} color={PLAYER_COLORS.Vanilla} />
        ),
        games: 38,
        points: 2177,
        difference: "-",
        hoverColor: PLAYER_COLORS.Vanilla,
      },
      {
        position: 2,
        player: (
          <PlayerCell name={"Choco"} color={PLAYER_COLORS.Choco} />
        ),
        games: 38,
        points: 1921,
        difference: "256",
        hoverColor: PLAYER_COLORS.Choco,
      },
      {
        position: 3,
        player: (
          <PlayerCell name={"Panda"} color={PLAYER_COLORS.Panda} />
        ),
        games: 38,
        points: 1902,
        difference: "19",
        hoverColor: PLAYER_COLORS.Panda,
      },
    ],
  },
}

type FplSeasonTabsProps = {
  title: React.ReactNode
  description: string
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

// Helper to reverse-map PLAYER_COLORS color -> player name
function playerNameFromColor(color: string): string {
  return Object.entries(PLAYER_COLORS).find(([, c]) => c === color)?.[0] ?? ""
}

const GAMEWEEKS_IN_SEASON = 38

// All Time columns
const allTimeColumns = [
  { header: "#", accessor: "position" },
  { header: "Player", accessor: "player" },
  { header: "GW", accessor: "games" },
  { header: "P", accessor: "points" },
  { header: "PD", accessor: "difference" },
  { header: "SW", accessor: "seasonsWon" },
]

export default function FplSeasonTabs({
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
}: FplSeasonTabsProps) {
  const [activeSeason, setActiveSeason] = useState<Season>("2026/27")
  const [activeTab, setActiveTab] = useState<PageTab>("Summary")

  // Compute All Time standings
  const computeAllTimeStandings = () => {
    const totals: Record<string, { games: number; wins: number; points: number; titles: number; hoverColor: string }> = {}

    const ensurePlayer = (name: string) => {
      if (!totals[name]) {
        totals[name] = { games: 0, wins: 0, points: 0, titles: 0, hoverColor: PLAYER_COLORS[name] ?? "#cccccc" }
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

    // From DB seasons: get max games and max points per player (cumulative charts)
    const dbChartSets = [
      { chartData: currentSeasonChartData, standings: currentSeasonData },
      { chartData: historicalSeasonChartData, standings: historicalSeasonData },
      { chartData: season2425ChartData, standings: season2425Data },
    ]
    for (const { chartData, standings } of dbChartSets) {
      const maxGames: Record<string, number> = {}
      const maxPoints: Record<string, number> = {}
      for (const row of chartData) {
        const p = row.player as string
        if (maxGames[p] === undefined || row.games > maxGames[p]) maxGames[p] = row.games
        if (maxPoints[p] === undefined || row.points > maxPoints[p]) maxPoints[p] = row.points
      }
      // wins from processed standings
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
        seasonPoints[name] = entry.points
      }
      awardTitle(seasonPoints)
    }

    const sorted = Object.entries(totals).sort(([, a], [, b]) => b.points - a.points)
    const leaderPoints = sorted[0]?.[1].points ?? 0
    return sorted.map(([name, data], index) => ({
        position: index + 1,
        player: (
          <PlayerCell name={name} color={data.hoverColor} />
        ),
        games: data.games,
        wins: data.wins,
        points: data.points,
        difference: index === 0 ? "-" : String(data.points - leaderPoints),
        seasonsWon: data.titles,
        hoverColor: data.hoverColor,
      }))
  }

  /** Processed table rows carry the bear in their colour — the cards want the name. */
  const toCards = (data: any[], chartData?: any[]): StandingCardData[] =>
    data.map((row) => {
      const name = playerNameFromColor(row.hoverColor)
      return {
        name,
        points: row.points,
        stats: [
          { label: "GW wins", value: row.wins ?? "—" },
          { label: "Win %", value: row.winPercent ?? winPercent(row.wins, row.games) },
          { label: "Gameweeks", value: row.games ?? "—" },
        ],
        series: chartData && sparkSeries(chartData, name),
      }
    })

  const gameweeksPlayed = (data: any[]) => Math.max(...data.map((row) => row.games ?? 0), 0)

  /** Standings + chart + wins split, the shape every played season shares. */
  const renderSeason = (
    data: any[],
    chartData: any[],
    pieData: any[],
    highlights: { src: string; alt: string; caption: string }[],
  ) => {
    const played = gameweeksPlayed(data)
    return (
      <>
        <section className="mx-auto max-w-page px-8 pt-10">
          <StandingsBoard cards={toCards(data, chartData)} columns={columns} rows={data} />
        </section>

        <section className="mx-auto flex max-w-page flex-wrap gap-6 px-8 pt-10">
          <Panel
            title="Season progress"
            aside={<BearLegend names={toCards(data).map((card) => card.name)} />}
            className="min-w-0 flex-[999_1_560px]"
          >
            <FplChart entries={chartData} />
          </Panel>
          <WinsSplit
            title="Gameweek wins"
            rows={pieData.map((slice) => ({ name: slice.name, wins: slice.value }))}
            total={played}
            unit="GW"
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
  }

  // Render content based on active tab
  const renderStandingsContent = () => {
    if (activeSeason === "2026/27") {
      return renderSeason(currentSeasonData, currentSeasonChartData, currentSeasonPieData, currentSeasonHighlights)
    } else if (activeSeason === "2025/26") {
      // 2025/26 season — archived data from fplEntry2526
      return renderSeason(
        historicalSeasonData,
        historicalSeasonChartData,
        historicalSeasonPieData,
        historicalSeasonHighlights,
      )
    } else if (activeSeason === "2024/25") {
      return renderSeason(season2425Data, season2425ChartData, season2425PieData, season2425Highlights)
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
    if (highlights && highlights.length > 0) {
      return (
        <section className="mx-auto max-w-page px-8 pt-10">
          <RecordGrid cards={highlights.map(toRecordCard)} />
        </section>
      )
    }
    return (
      <section className="mx-auto max-w-page px-8 pt-10">
        <EmptyPanel title="No insights yet" text="This cup has no insights for the season so far." />
      </section>
    )
  }

  const renderBrecordsContent = () => (
    <section className="mx-auto max-w-page px-8 pt-10">
      <RecordGrid cards={fplRecordCards.map(toRecordCard)} />
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
        selectId="season-fpl"
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
