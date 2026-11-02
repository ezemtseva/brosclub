import Image from "next/image"
import Link from "next/link"
import prisma from "../lib/prisma"
import { PLAYER_TINTS } from "../lib/teamColors"
import { CURRENT_FIFA_SEASON } from "../lib/fifaSeason"
import { cardClip, CARD_STRIPES, ARCHIVO_CONDENSED } from "../lib/cardFrame"
import { CURRENT_SEASON, CURRENT_SEASON_NUMERAL } from "../lib/season"
import { BearAvatar, bearColor } from "../components/Bear"
import PlayerCell from "../components/PlayerCell"
import MobileReveal from "../components/MobileReveal"
import dynamicImport from "next/dynamic"
import { SantaHat } from "../components/SantaHat"

export const dynamic = 'force-dynamic'

const Snowfall = dynamicImport(() => import("../components/Snowfall"), { ssr: false })

/** The club's three bears, in the order their cups are tallied. */
const clubMembers = [{ name: "Vanilla" }, { name: "Choco" }, { name: "Panda" }]

/** The club was founded on 06.09.2012 — the hero counts the years from here. */
const FOUNDED = new Date(2012, 8, 6)

/** The score on a season tile, and the metrics its portrait aligns to. */
const SCORE_FONT = {
  fontWeight: 900,
  fontVariationSettings: "'wdth' 62",
  fontSize: "136px",
  lineHeight: 1,
} as const

/** One tile in the current-season band: game, score, and who holds it. */
type SeasonSummary = {
  title: string
  link: string
  points?: number
  leader?: string
  /** The bear behind the leader — a club is led by whoever drafted it */
  owner?: string
  /** Mascot, or the club crest when the leader is a team (FIFA) */
  image?: string
  /** A crest is shown whole; a mascot is cropped by the panel's corner */
  isClub?: boolean
  /** The panel behind the leader — their colour, or neutral grey for a club */
  color: string
  empty?: string
  /**
   * Season progress: `value` out of `max` fills the bar (rounds played, or for
   * 7oker the leader's points); `gameweek` is written in it
   */
  progress: { value: number; max: number; gameweek: number }
}

const RANKS = ["1ST", "2ND", "3RD"]

const cupCategories = [
  { key: "fifa", label: "FIFA" },
  { key: "fpl", label: "FPL" },
  { key: "bets", label: "BETS" },
  { key: "sevenOker", label: "7OKER" },
  { key: "holdem", label: "HOLDEM" },
] as const

const historyData = [
  //{ year: "2025/26", fifa: "", fpl: "", bets: "", poker: "-", sevenOker: "" },
  // Hidden until the season has winners to show
  //{ year: "2026/27", fifa: "-", fpl: "-", bets: "-", poker: "-", sevenOker: "-" },
  { year: "2025/26", fifa: "Vanilla", fpl: "Choco", bets: "Choco & Panda", poker: "-", sevenOker: "Vanilla" },
  { year: "2024/25", fifa: "Vanilla", fpl: "Panda", bets: "Panda", poker: "Panda", sevenOker: "Panda" },
  { year: "2023/24", fifa: "Vanilla", fpl: "Panda", bets: "Choco", poker: "-", sevenOker: "-" },
  { year: "2022/23", fifa: "Choco", fpl: "Panda", bets: "Panda", poker: "-", sevenOker: "-" },
  { year: "2021/22", fifa: "Vanilla", fpl: "Vanilla", bets: "Panda", poker: "-", sevenOker: "-" },
  { year: "2020/21", fifa: "Vanilla", fpl: "Panda", bets: "Panda", poker: "-", sevenOker: "-" },
  { year: "2019/20", fifa: "Vanilla", fpl: "Vanilla", bets: "Choco", poker: "Panda", sevenOker: "-" },
  { year: "2019", fifa: "-", fpl: "Panda", bets: "-", poker: "DNF", sevenOker: "-" },
  { year: "2018", fifa: "DNF", fpl: "Vanilla", bets: "-", poker: "Panda", sevenOker: "-" },
  { year: "2017", fifa: "Vanilla", fpl: "-", bets: "Vanilla", poker: "Panda", sevenOker: "-" },
  { year: "2016", fifa: "Choco", fpl: "-", bets: "Vanilla", poker: "Panda", sevenOker: "-" },
  { year: "2015", fifa: "-", fpl: "-", bets: "Vanilla", poker: "Panda", sevenOker: "-" },
  { year: "2014", fifa: "-", fpl: "-", bets: "Panda", poker: "Panda", sevenOker: "-" },
  { year: "2013", fifa: "-", fpl: "-", bets: "Panda", poker: "Panda", sevenOker: "-" },
  { year: "2012", fifa: "-", fpl: "-", bets: "Panda", poker: "DSQ", sevenOker: "-" },
]

async function getLatestFplLeader() {
  try {
    const latestWeek = await prisma.fplEntry.findFirst({
      orderBy: { week: "desc" },
      select: { week: true },
    })

    if (latestWeek) {
      const leader = await prisma.fplEntry.findFirst({
        where: { week: latestWeek.week },
        orderBy: { points: "desc" },
      })
      if (leader) return { ...leader, isArchive: false }
    }

    // Fallback: show 2025/26 champion from archive
    const latestArchiveWeek = await (prisma as any).fplEntry2526.findFirst({
      orderBy: { week: "desc" },
      select: { week: true },
    })
    if (!latestArchiveWeek) return null

    const archiveLeader = await (prisma as any).fplEntry2526.findFirst({
      where: { week: latestArchiveWeek.week },
      orderBy: { points: "desc" },
    })
    return archiveLeader ? { ...archiveLeader, isArchive: true } : null
  } catch (error) {
    console.error("Error fetching FPL leader:", error)
    return null
  }
}

async function getLatest7okerLeader() {
  try {
    const latestWeek = await (prisma as any).sevenOkerEntry.findFirst({
      orderBy: { week: "desc" },
      select: { week: true },
    })

    if (latestWeek) {
      const leader = await (prisma as any).sevenOkerEntry.findFirst({
        where: { week: latestWeek.week },
        orderBy: { points: "desc" },
        select: { bearo: true, points: true, games: true },
      })
      if (leader) return { ...leader, isArchive: false }
    }

    // Fallback: show 2025/26 champion from archive
    const latestArchiveWeek = await (prisma as any).sevenOkerEntry2526.findFirst({
      orderBy: { week: "desc" },
      select: { week: true },
    })
    if (!latestArchiveWeek) return null

    const archiveLeader = await (prisma as any).sevenOkerEntry2526.findFirst({
      where: { week: latestArchiveWeek.week },
      orderBy: { points: "desc" },
      select: { bearo: true, points: true, games: true },
    })
    return archiveLeader ? { ...archiveLeader, isArchive: true } : null
  } catch (error) {
    console.error("Error fetching 7oker leader:", error)
    return null
  }
}


async function getLatestBetsLeaders() {
  try {
    const latestWeek = await prisma.betsEntry.findFirst({
      orderBy: { week: "desc" },
      select: { week: true },
    })
    if (!latestWeek) return null

    const entries = await prisma.betsEntry.findMany({ where: { week: latestWeek.week } })
    const top = entries.reduce((max, e) => Math.max(max, e.points), 0)
    if (top <= 0) return null

    // Several players can share the lead
    return {
      players: entries.filter((e) => e.points === top).map((e) => e.player),
      points: top,
      games: entries.reduce((max, e) => Math.max(max, e.games), 0),
    }
  } catch (error) {
    console.error("Error fetching Bets leader:", error)
    return null
  }
}

async function getLatestFifaLeader() {
  try {
    // Same rule as the standings on /fifa: only teams drafted this season, ranked
    // by points then goal difference. Ordering in SQL can't do either, so the
    // rows are ranked here — otherwise the card names a different leader.
    const [entries, drafted] = await Promise.all([
      prisma.fifaEntry.findMany({
        select: { team: true, logo: true, games: true, wins: true, draws: true, losses: true, goalsScored: true, goalsConceded: true },
      }),
      prisma.fifaPlayerTeam.findMany({ where: { season: CURRENT_FIFA_SEASON }, select: { team: true, player: true } }),
    ])

    const owners = new Map(drafted.map((row) => [row.team, row.player]))
    const inSeason = entries.filter((entry) => owners.size === 0 || owners.has(entry.team))
    // Rounds played so far: the most games any of this season's teams has had
    const rounds = inSeason.reduce((max, entry) => Math.max(max, entry.games), 0)
    const leader = inSeason
      .map((entry) => ({
        ...entry,
        points: entry.wins * 3 + entry.draws,
        goalDifference: entry.goalsScored - entry.goalsConceded,
      }))
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)[0]

    // The chip takes the colour of whoever drafted the team this season.
    return leader ? { ...leader, owner: owners.get(leader.team) ?? null, rounds } : null
  } catch (error) {
    console.error("Error fetching FIFA leader:", error)
    return null
  }
}

/** A winner cell in the hall of champions: chips for bears, a mark otherwise. */
const HistoryCell = ({ value }: { value: string }) => {
  const winners = value.split(" & ").filter((name) => name in PLAYER_TINTS)
  if (winners.length === 0) {
    return <span className="font-mono text-[13px] text-ink-dim md:text-base">{value === "-" ? "—" : value}</span>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {winners.map((name) => (
        <PlayerCell key={name} name={name} />
      ))}
    </div>
  )
}

export default async function Home() {
  const fplLeader = await getLatestFplLeader()
  const sevenOkerLeader = await getLatest7okerLeader()
  const betsLeaders = await getLatestBetsLeaders()
  const fifaLeader = await getLatestFifaLeader()

  const hasFpl = !!(fplLeader && fplLeader.points > 0)
  const has7oker = !!(sevenOkerLeader && sevenOkerLeader.points > 0)
  const hasFifa = !!(fifaLeader && fifaLeader.points > 0)

  // A team leader gets a neutral panel; text on any of them is always the dark ink
  const CLUB_PANEL = "var(--club-panel)"
  const PANEL_INK = "#0B0C0F"

  const summaries: SeasonSummary[] = [
    {
      title: "FIFA",
      link: "/fifa",
      points: hasFifa ? fifaLeader!.points : undefined,
      leader: hasFifa ? fifaLeader!.team : undefined,
      owner: hasFifa ? fifaLeader!.owner ?? undefined : undefined,
      image: hasFifa ? fifaLeader!.logo || "/placeholder.svg" : undefined,
      isClub: true,
      // The panel takes the colour of whoever drafted the leading club
      color: fifaLeader?.owner ? bearColor(fifaLeader.owner) : CLUB_PANEL,
      empty: "Will be started soon",
      progress: { value: fifaLeader?.rounds ?? 0, max: 30, gameweek: fifaLeader?.rounds ?? 0 },
    },
    {
      title: "FPL",
      link: "/fpl",
      points: hasFpl ? fplLeader!.points : undefined,
      leader: hasFpl ? fplLeader!.player : undefined,
      color: hasFpl ? bearColor(fplLeader!.player) : CLUB_PANEL,
      empty: "Will be started soon",
      progress: { value: fplLeader?.games ?? 0, max: 38, gameweek: fplLeader?.games ?? 0 },
    },
    {
      title: "Bets",
      link: "/bets",
      points: betsLeaders?.points,
      leader: betsLeaders?.players.join(" & "),
      color: betsLeaders?.players.length === 1 ? bearColor(betsLeaders.players[0]) : CLUB_PANEL,
      empty: "Will be started soon",
      progress: { value: betsLeaders?.games ?? 0, max: 38, gameweek: betsLeaders?.games ?? 0 },
    },
    {
      title: "7oker",
      link: "/7oker",
      points: has7oker ? sevenOkerLeader.points : undefined,
      leader: has7oker ? sevenOkerLeader.bearo : undefined,
      color: has7oker ? bearColor(sevenOkerLeader.bearo) : CLUB_PANEL,
      empty: "Will be started soon",
      // The bar fills toward the 100 points that end the season; the label still
      // gives the gameweek, the games played so far
      progress: { value: sevenOkerLeader?.points ?? 0, max: 100, gameweek: sevenOkerLeader?.games ?? 0 },
    },
  ]

  // Every cup total on this page is counted from the history table below, so the
  // hero line, the standings cards and the champions table can never disagree.
  // A shared title counts for each winner.
  const cupsByPlayer: Record<string, number[]> = Object.fromEntries(
    clubMembers.map((member) => [member.name, cupCategories.map(() => 0)]),
  )
  for (const row of historyData) {
    const cells = [row.fifa, row.fpl, row.bets, row.sevenOker, row.poker]
    cells.forEach((cell, column) => {
      for (const winner of cell.split(" & ")) {
        if (cupsByPlayer[winner]) cupsByPlayer[winner][column] += 1
      }
    })
  }

  const standings = clubMembers
    .map((member) => ({
      ...member,
      cups: cupsByPlayer[member.name],
      total: cupsByPlayer[member.name].reduce((sum, n) => sum + n, 0),
    }))
    .sort((a, b) => b.total - a.total)
  const cupsAwarded = standings.reduce((sum, member) => sum + member.total, 0)
  const seasonsPlayed = historyData.length + 1

  const now = new Date()
  const beforeAnniversary =
    now < new Date(now.getFullYear(), FOUNDED.getMonth(), FOUNDED.getDate())
  const years = now.getFullYear() - FOUNDED.getFullYear() - (beforeAnniversary ? 1 : 0)
  const facts = [
    `${years} years`,
    `${seasonsPlayed} seasons played`,
    `${cupsAwarded} cups awarded`,
    `${cupCategories.length} competitions`,
  ].join(" · ")

  const currentMonth = now.getMonth() + 1 // getMonth() returns 0-11

  return (
    <>
      {(currentMonth === 12 || currentMonth === 1) && <Snowfall />}

      {/* Hidden on phones for now — drop `hidden md:flex` to bring it back.
          Phones also drop the facts line */}
      <section className="mx-auto hidden max-w-page flex-wrap items-end gap-12 px-8 pb-2 pt-11 md:flex md:pb-[47px]">
        <div className="min-w-0 flex-[999_1_560px]">
          <h1 className="relative font-display text-[clamp(56px,9vw,136px)] font-extrabold leading-[0.92] tracking-[-0.03em]">
            Always
            <br />
            <span className="accent-word">Sunday.</span>
            {(currentMonth === 12 || currentMonth === 1) && <SantaHat />}
          </h1>
          <p className="mt-6 hidden font-mono text-sm uppercase tracking-[0.12em] text-ink-muted md:block">{facts}</p>
        </div>
      </section>

      <section aria-labelledby="season" className="border-y border-hairline bg-band">
        <div className="mx-auto max-w-page px-8 pb-10 pt-9 md:pb-[53px] md:pt-[47px]">
          <div className="mb-7 flex flex-wrap items-baseline justify-between gap-3">
            {/* Phones: "Season 26/27" in one heading; wider screens: "Season XVI"
                with the full years pushed to the right */}
            <h2 id="season" className="font-display text-[32px] font-bold tracking-[-0.01em]">
              Season <span className="hidden md:inline">{CURRENT_SEASON_NUMERAL}</span>
              <span className="accent-word font-medium md:hidden">{CURRENT_SEASON.replace(/^20/, "")}</span>
            </h2>
            <span className="accent-word hidden font-display text-[32px] font-medium tracking-[-0.01em] md:inline">
              {CURRENT_SEASON}
            </span>
          </div>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {summaries.map((summary) => (
              <Link
                key={summary.title}
                href={summary.link}
                className="flex flex-col gap-4 rounded-[24px] border border-hairline bg-surface-2 p-4 transition-colors hover:border-hairline-strong"
              >
                <div className="flex items-center justify-between gap-3 px-1 pt-1">
                  <span className="font-display text-xl font-bold">{summary.title}</span>
                  <svg
                    aria-hidden="true"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </div>
                {/* The leader fills the panel: their colour behind, the score huge
                    across the top, and the picture painted over it */}
                <div
                  role="img"
                  aria-label={
                    summary.leader
                      ? `Leader: ${summary.leader}, ${summary.points} points`
                      : summary.empty
                  }
                  title={summary.leader}
                  className="relative h-[176px] overflow-hidden rounded-2xl"
                  style={{ background: summary.color }}
                >
                  {summary.points !== undefined && (
                    <div className="absolute left-3 right-[14px] top-[10px] flex justify-end">
                      <span
                        className="font-archivo"
                        style={{
                          ...SCORE_FONT,
                          letterSpacing: "-0.02em",
                          color: PANEL_INK,
                          // The figure never shrinks; a longer number is squeezed instead
                          transform:
                            String(summary.points).length > 3
                              ? `scaleX(${3 / String(summary.points).length})`
                              : undefined,
                          transformOrigin: "right center",
                        }}
                      >
                        {summary.points}
                      </span>
                    </div>
                  )}
                  {summary.image && (
                    // Sits on the digits' baseline and rises to their cap height:
                    // the zero-width strut carries the score's own font metrics
                    <div
                      aria-hidden="true"
                      className="font-archivo pointer-events-none absolute left-4 right-[14px] top-[10px] flex items-baseline"
                      style={SCORE_FONT}
                    >
                      <Image
                        src={summary.image}
                        alt=""
                        width={120}
                        height={99}
                        className="leader-portrait shrink-0 object-contain"
                      />
                      <span className="w-0 overflow-hidden">0</span>
                    </div>
                  )}
                  {(summary.owner ?? summary.leader) && (
                    <span
                      className="absolute bottom-3.5 right-[14px] text-2xl font-medium"
                      style={{ color: PANEL_INK }}
                    >
                      {summary.owner ?? summary.leader}
                    </span>
                  )}
                  {summary.points === undefined && (
                    <span
                      className="absolute bottom-4 right-4 max-w-[60%] text-right text-[15px] font-medium"
                      style={{ color: PANEL_INK }}
                    >
                      {summary.empty}
                    </span>
                  )}
                </div>
                {/* How far the season has run, in the brand lime, with the count and
                    share written at the right end */}
                {(() => {
                  const { value, max, gameweek } = summary.progress
                  const percent = Math.min(100, Math.round((value / max) * 100))
                  return (
                    <div
                      role="progressbar"
                      aria-label={`${summary.title} season progress`}
                      aria-valuemin={0}
                      aria-valuemax={max}
                      aria-valuenow={Math.min(value, max)}
                      aria-valuetext={`Gameweek ${gameweek}, ${percent}%`}
                      className="relative mx-1 mb-1 h-6 overflow-hidden rounded-full bg-track"
                    >
                      <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
                      {/* Once the lime reaches the words they switch to its dark ink */}
                      <span
                        className={`absolute inset-y-0 right-3 flex items-center font-mono text-[11px] font-medium uppercase tracking-[0.08em] ${
                          percent >= 80 ? "text-accent-foreground" : "text-ink-2"
                        }`}
                      >
                        GW {gameweek} · {percent}%
                      </span>
                    </div>
                  )
                })()}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="history" className="mx-auto max-w-page px-8 pb-6 pt-10 md:pb-8 md:pt-[53px]">
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="history" className="font-display text-[32px] font-bold tracking-[-0.01em]">
            History
          </h2>
        </div>
        {/* The bears' cups, framed like the standings cards on the cup pages: rank,
            the total in the bear's colour, then the five cups. Always shown on wide
            screens; phones open them from a button */}
        <MobileReveal showLabel="SEE BEAROS CARDS" hideLabel="HIDE BEAROS CARDS" className="mb-8 gap-5 md:grid-cols-3">
          {standings.map((member, index) => {
            const color = bearColor(member.name)
            const isLeader = index === 0
            return (
              <article
                key={member.name}
                aria-label={`${member.name}: ${member.total} cups`}
                className="rounded-[16px] p-[3px]"
                style={{ clipPath: cardClip(28), background: color }}
              >
                <div
                  className="flex h-full flex-col gap-5 rounded-[13px] bg-surface px-6 pb-[26px] pt-[22px] text-ink"
                  style={{ clipPath: cardClip(27), backgroundImage: CARD_STRIPES }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl font-bold">{member.name}</span>
                    <span
                      className={`font-archivo ml-auto rounded-full px-3 py-1 text-[18px] font-black leading-none ${
                        isLeader ? "bg-accent text-accent-foreground" : "bg-surface-3 text-ink-2"
                      }`}
                      style={{ fontVariationSettings: ARCHIVO_CONDENSED }}
                    >
                      {RANKS[index] ?? `${index + 1}TH`}
                    </span>
                  </div>

                  {/* The total on the left, the bear large on the right */}
                  <div className="flex items-center justify-between gap-3">
                    {/* stat-number: the bear's colour in dark, plain ink in light */}
                    <span
                      className="stat-number font-archivo text-[112px] font-black leading-[0.8]"
                      style={{ color, fontVariationSettings: ARCHIVO_CONDENSED }}
                    >
                      {member.total}
                    </span>
                    <BearAvatar name={member.name} size={112} filled />
                  </div>

                  <div className="grid grid-cols-5 gap-2 border-t border-[var(--card-rule)] pt-4">
                    {cupCategories.map((category, column) => (
                      <div key={category.key}>
                        <div
                          className="font-archivo text-[30px] font-black leading-none"
                          style={{ fontVariationSettings: ARCHIVO_CONDENSED }}
                        >
                          {member.cups[column]}
                        </div>
                        <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                          {category.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            )
          })}
        </MobileReveal>
        {/* Header plus five rows (53px each on wide screens; on phones a shared title wraps
            its row to 79px), older seasons scroll under the sticky header */}
        <div className="max-h-[330px] overflow-auto md:max-h-[320px] rounded-[20px] border border-hairline bg-surface">
          <table className="w-full min-w-[760px] table-fixed border-collapse text-base">
            {/* Season gets a fixed width; the five cups split the rest evenly */}
            <colgroup>
              <col className="w-[120px]" />
              <col />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead className="table-head sticky top-0 z-10">
              <tr className="text-left font-mono text-xs tracking-[0.1em] text-ink-muted">
                <th scope="col" className="border-b border-hairline px-6 py-[18px] font-medium">SEASON</th>
                <th scope="col" className="border-b border-hairline px-4 py-[18px] font-medium">FIFA</th>
                <th scope="col" className="border-b border-hairline px-4 py-[18px] font-medium">FPL</th>
                <th scope="col" className="border-b border-hairline px-4 py-[18px] font-medium">BETS</th>
                <th scope="col" className="border-b border-hairline px-4 py-[18px] font-medium">7OKER</th>
                <th scope="col" className="border-b border-hairline px-4 py-[18px] font-medium">HOLDEM</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((row) => (
                <tr key={row.year}>
                  <th
                    scope="row"
                    className="whitespace-nowrap border-b border-hairline-row px-6 py-3.5 text-left font-mono text-sm font-medium md:text-base"
                  >
                    {row.year}
                  </th>
                  {[row.fifa, row.fpl, row.bets, row.sevenOker, row.poker].map((value, i) => (
                    <td key={i} className="border-b border-hairline-row px-4 py-2.5">
                      <HistoryCell value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
