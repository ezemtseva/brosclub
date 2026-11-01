import Image from "next/image"
import Link from "next/link"
import prisma from "../lib/prisma"
import { PLAYER_TINTS } from "../lib/teamColors"
import { CURRENT_FIFA_SEASON } from "../lib/fifaSeason"
import { CURRENT_SEASON, CURRENT_SEASON_NUMERAL } from "../lib/season"
import { BearAvatar, bearColor, bearImage } from "../components/Bear"
import dynamicImport from "next/dynamic"
import { SantaHat } from "../components/SantaHat"

export const dynamic = 'force-dynamic'

const Snowfall = dynamicImport(() => import("../components/Snowfall"), { ssr: false })

const clubMembers = [
  { name: "Vanilla", image: "/imgs/vanilla.png" },
  { name: "Choco", image: "/imgs/choco.png" },
  { name: "Panda", image: "/imgs/panda.png" },
]

/** The club was founded on 06.09.2012 — the hero counts the years from here. */
const FOUNDED = new Date(2012, 8, 6)

/** One tile in the current-season band: game, score, and who holds it. */
type SeasonSummary = {
  title: string
  link: string
  points?: number
  leader?: string
  /** Mascot, or the club crest when the leader is a team (FIFA) */
  image?: string
  /** A crest is shown whole; a mascot is cropped by the panel's corner */
  isClub?: boolean
  /** The panel behind the leader — their colour, or neutral grey for a club */
  color: string
  empty?: string
}

const cupCategories = [
  { key: "fifa", label: "FIFA" },
  { key: "fpl", label: "FPL" },
  { key: "bets", label: "BETS" },
  { key: "sevenOker", label: "7OKER" },
  { key: "holdem", label: "HOLD'EM" },
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
        select: { bearo: true, points: true },
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
      select: { bearo: true, points: true },
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
    return { players: entries.filter((e) => e.points === top).map((e) => e.player), points: top }
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
        select: { team: true, logo: true, wins: true, draws: true, losses: true, goalsScored: true, goalsConceded: true },
      }),
      prisma.fifaPlayerTeam.findMany({ where: { season: CURRENT_FIFA_SEASON }, select: { team: true, player: true } }),
    ])

    const owners = new Map(drafted.map((row) => [row.team, row.player]))
    const leader = entries
      .filter((entry) => owners.size === 0 || owners.has(entry.team))
      .map((entry) => ({
        ...entry,
        points: entry.wins * 3 + entry.draws,
        goalDifference: entry.goalsScored - entry.goalsConceded,
      }))
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)[0]

    // The chip takes the colour of whoever drafted the team this season.
    return leader ? { ...leader, owner: owners.get(leader.team) ?? null } : null
  } catch (error) {
    console.error("Error fetching FIFA leader:", error)
    return null
  }
}

/** A winner cell in the hall of champions: chips for bears, a mark otherwise. */
const HistoryCell = ({ value }: { value: string }) => {
  const winners = value.split(" & ").filter((name) => name in PLAYER_TINTS)
  if (winners.length === 0) {
    return <span className="font-mono text-[13px] text-ink-dim">{value === "-" ? "—" : value}</span>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {winners.map((name) => (
        <span
          key={name}
          className="inline-flex items-center gap-[7px] whitespace-nowrap rounded-full py-[3px] pl-[3px] pr-[11px] text-sm font-medium"
          style={{ background: PLAYER_TINTS[name] }}
        >
          <BearAvatar name={name} size={20} />
          {name}
        </span>
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
      image: hasFifa ? fifaLeader!.logo || "/placeholder.svg" : undefined,
      isClub: true,
      color: CLUB_PANEL,
      empty: "Will be started soon",
    },
    {
      title: "FPL",
      link: "/fpl",
      points: hasFpl ? fplLeader!.points : undefined,
      leader: hasFpl ? fplLeader!.player : undefined,
      image: hasFpl ? bearImage(fplLeader!.player) : undefined,
      color: hasFpl ? bearColor(fplLeader!.player) : CLUB_PANEL,
      empty: "Will be started soon",
    },
    {
      title: "Bets",
      link: "/bets",
      points: betsLeaders?.points,
      leader: betsLeaders?.players.join(" & "),
      // A shared lead has no single mascot, so the panel stays neutral
      image: betsLeaders?.players.length === 1 ? bearImage(betsLeaders.players[0]) : undefined,
      color: betsLeaders?.players.length === 1 ? bearColor(betsLeaders.players[0]) : CLUB_PANEL,
      empty: "Will be started soon",
    },
    {
      title: "7oker",
      link: "/7oker",
      points: has7oker ? sevenOkerLeader.points : undefined,
      leader: has7oker ? sevenOkerLeader.bearo : undefined,
      image: has7oker ? bearImage(sevenOkerLeader.bearo) : undefined,
      color: has7oker ? bearColor(sevenOkerLeader.bearo) : CLUB_PANEL,
      empty: "Will be started soon",
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
  const bestInOneCup = Math.max(...standings.flatMap((member) => member.cups))

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

      <section className="mx-auto flex max-w-page flex-wrap items-end gap-12 px-8 pb-[72px] pt-11">
        <div className="min-w-0 flex-[999_1_560px]">
          <p className="mb-6 font-mono text-sm uppercase tracking-[0.12em] text-ink-muted">{facts}</p>
          <h1 className="relative font-display text-[clamp(56px,9vw,136px)] font-extrabold leading-[0.92] tracking-[-0.03em]">
            Always
            <br />
            <span className="accent-word">Sunday.</span>
            {(currentMonth === 12 || currentMonth === 1) && <SantaHat />}
          </h1>
        </div>
      </section>

      <section aria-labelledby="standings" className="mx-auto max-w-page px-8 pb-20 pt-6">
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="standings" className="font-display text-[32px] font-bold tracking-[-0.01em]">
            All-time standings
          </h2>
        </div>
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          {standings.map((member, index) => {
            const color = bearColor(member.name)
            return (
              <article
                key={member.name}
                className="relative flex flex-col gap-7 overflow-hidden rounded-[24px] border border-hairline bg-surface p-7"
              >
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: color }} />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-[14px]">
                    <BearAvatar name={member.name} size={56} />
                    <div>
                      <div className="font-mono text-xs tracking-[0.1em] text-ink-muted">
                        #0{index + 1}
                      </div>
                      <h3 className="mt-0.5 font-display text-2xl font-bold">{member.name}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="stat-number font-display text-[64px] font-extrabold leading-[0.9]" style={{ color }}>
                      {member.total}
                    </div>
                    <div className="mt-1.5 font-mono text-xs tracking-[0.1em] text-ink-muted">CUPS</div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {cupCategories.map((category, column) => {
                    const n = member.cups[column]
                    const pct = n === 0 ? 0 : Math.max(8, Math.round((n / bestInOneCup) * 100))
                    return (
                      <div key={category.key} className="flex flex-col gap-2">
                        <div className="flex h-16 items-end overflow-hidden rounded-lg bg-track">
                          <div className="w-full rounded-lg" style={{ height: `${pct}%`, background: color }} />
                        </div>
                        <div className="font-mono text-[18px] font-medium leading-none">{n}</div>
                        <div className="text-[11px] tracking-[0.06em] text-ink-muted">{category.label}</div>
                      </div>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="season" className="border-y border-hairline bg-band">
        <div className="mx-auto max-w-page px-8 pb-20 pt-[72px]">
          <div className="mb-7 flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="season" className="font-display text-[32px] font-bold tracking-[-0.01em]">
              Season {CURRENT_SEASON_NUMERAL} <span className="accent-word font-medium">{CURRENT_SEASON}</span>
            </h2>
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
                          fontWeight: 900,
                          fontVariationSettings: "'wdth' 62",
                          fontSize: "136px",
                          lineHeight: 1,
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
                  {summary.image &&
                    (summary.isClub ? (
                      // A crest is shown whole, its top level with the mascots'
                      <Image
                        src={summary.image}
                        alt=""
                        aria-hidden="true"
                        width={94}
                        height={94}
                        className="pointer-events-none absolute bottom-0 left-4 h-[94px] w-auto object-contain"
                      />
                    ) : (
                      <Image
                        src={summary.image}
                        alt=""
                        aria-hidden="true"
                        width={144}
                        height={144}
                        className="pointer-events-none absolute -bottom-[50px] -left-[10px] h-[144px] w-[144px] object-contain"
                      />
                    ))}
                  {summary.points === undefined && (
                    <span
                      className="absolute bottom-4 right-4 max-w-[60%] text-right text-[15px] font-medium"
                      style={{ color: PANEL_INK }}
                    >
                      {summary.empty}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="history" className="mx-auto max-w-page px-8 pb-24 pt-20">
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="history" className="font-display text-[32px] font-bold tracking-[-0.01em]">
            Hall of champions
          </h2>
          <div className="flex flex-wrap gap-4 text-[13px] text-ink-2">
            {clubMembers.map((member) => (
              <span key={member.name} className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: bearColor(member.name) }}
                />
                {member.name}
              </span>
            ))}
            <span className="font-mono text-ink-muted">DNF · DSQ · — not played</span>
          </div>
        </div>
        <div className="overflow-x-auto rounded-[20px] border border-hairline bg-surface">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="text-left font-mono text-xs tracking-[0.1em] text-ink-muted">
                <th scope="col" className="border-b border-hairline px-6 py-[18px] font-medium">SEASON</th>
                <th scope="col" className="border-b border-hairline px-4 py-[18px] font-medium">FIFA</th>
                <th scope="col" className="border-b border-hairline px-4 py-[18px] font-medium">FPL</th>
                <th scope="col" className="border-b border-hairline px-4 py-[18px] font-medium">BETS</th>
                <th scope="col" className="border-b border-hairline px-4 py-[18px] font-medium">7OKER</th>
                <th scope="col" className="border-b border-hairline px-4 py-[18px] font-medium">HOLD&apos;EM</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((row) => (
                <tr key={row.year}>
                  <th
                    scope="row"
                    className="whitespace-nowrap border-b border-hairline-row px-6 py-3.5 text-left font-mono text-sm font-medium"
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
