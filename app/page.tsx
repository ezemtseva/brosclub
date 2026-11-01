import Image from "next/image"
import Link from "next/link"
import prisma from "../lib/prisma"
import { PLAYER_TINTS } from "../lib/teamColors"
import { CURRENT_FIFA_SEASON } from "../lib/fifaSeason"
import { flagSvgUrl } from "../lib/teamCountries"
import { CURRENT_SEASON, CURRENT_SEASON_NUMERAL } from "../lib/season"
import { BearAvatar, bearColor } from "../components/Bear"
import dynamicImport from "next/dynamic"
import { SantaHat } from "../components/SantaHat"

export const dynamic = 'force-dynamic'

const Snowfall = dynamicImport(() => import("../components/Snowfall"), { ssr: false })

/** Each bear's collectible card: mascot, the flag they play under, their club. */
const clubMembers = [
  {
    name: "Vanilla",
    image: "/imgs/vanilla.png",
    country: "Serbia",
    countryCode: "rs",
    club: "Liverpool",
    crest: "/imgs/fifa/liv.png",
  },
  {
    name: "Choco",
    image: "/imgs/choco.png",
    country: "Cyprus",
    countryCode: "cy",
    club: "Chelsea",
    crest: "/imgs/fifa/che.png",
  },
  {
    name: "Panda",
    image: "/imgs/panda.png",
    country: "Russia",
    countryCode: "ru",
    club: "Juventus",
    crest: "/imgs/fifa/juv.png",
  },
]

/** Text on the player cards — the same dark ink in both themes. */
const CARD_INK = "#0B0C0F"
const CARD_RULE = "rgba(11,12,15,0.35)"

/** Two cut corners, top-right and bottom-left, like a trading card. */
const CARD_CLIP =
  "polygon(0 0, calc(100% - 36px) 0, 100% 36px, 100% 100%, 36px 100%, 0 calc(100% - 36px))"
const CARD_STRIPES = "repeating-linear-gradient(135deg, rgba(255,255,255,0.16) 0 2px, transparent 2px 16px)"

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
          <BearAvatar name={name} size={20} ring={false} />
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
      owner: hasFifa ? fifaLeader!.owner ?? undefined : undefined,
      image: hasFifa ? fifaLeader!.logo || "/placeholder.svg" : undefined,
      isClub: true,
      // The panel takes the colour of whoever drafted the leading club
      color: fifaLeader?.owner ? bearColor(fifaLeader.owner) : CLUB_PANEL,
      empty: "Will be started soon",
    },
    {
      title: "FPL",
      link: "/fpl",
      points: hasFpl ? fplLeader!.points : undefined,
      leader: hasFpl ? fplLeader!.player : undefined,
      color: hasFpl ? bearColor(fplLeader!.player) : CLUB_PANEL,
      empty: "Will be started soon",
    },
    {
      title: "Bets",
      link: "/bets",
      points: betsLeaders?.points,
      leader: betsLeaders?.players.join(" & "),
      color: betsLeaders?.players.length === 1 ? bearColor(betsLeaders.players[0]) : CLUB_PANEL,
      empty: "Will be started soon",
    },
    {
      title: "7oker",
      link: "/7oker",
      points: has7oker ? sevenOkerLeader.points : undefined,
      leader: has7oker ? sevenOkerLeader.bearo : undefined,
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
        <div className="grid gap-6 lg:grid-cols-3">
          {standings.map((member) => {
            const stats = cupCategories.map((category, column) => ({
              label: category.label,
              n: member.cups[column],
            }))
            return (
              <article
                key={member.name}
                aria-label={`${member.name}: ${member.total} cups, ${member.club}, ${member.country}`}
                className="font-archivo mx-auto flex aspect-[320/452] w-full max-w-[320px] flex-col rounded-[18px]"
                style={{
                  clipPath: CARD_CLIP,
                  background: `${CARD_STRIPES}, ${bearColor(member.name)}`,
                  color: CARD_INK,
                  fontVariationSettings: "'wdth' 62",
                }}
              >
                <div className="relative min-h-0 flex-1">
                  <div className="absolute left-[26px] top-[26px] flex w-16 flex-col items-center gap-[10px]">
                    <div className="text-[72px] font-black leading-[0.85]">{member.total}</div>
                    <div className="text-[22px] font-extrabold leading-none">CUPS</div>
                    <div className="h-px w-10" style={{ background: CARD_RULE }} />
                    <Image
                      src={flagSvgUrl(member.countryCode)}
                      alt=""
                      width={44}
                      height={29}
                      unoptimized
                      className="h-[29px] w-[44px] object-cover"
                      style={{ outline: `1px solid ${CARD_INK}` }}
                    />
                    <div className="h-px w-10" style={{ background: CARD_RULE }} />
                    <Image src={member.crest} alt="" width={42} height={42} className="h-[42px] w-[42px] object-contain" />
                  </div>
                  {/* Head and shoulders, standing on the name rule like a player photo */}
                  {/* Full width, never sliced at the sides; the rule crops the bottom
                      eighth and anything taller may rise past the box */}
                  <div
                    className="absolute bottom-0 right-[10px] h-[196px] w-[196px]"
                    style={{ clipPath: "inset(-100% 0 0 0)" }}
                  >
                    <Image
                      src={member.image}
                      alt=""
                      width={392}
                      height={392}
                      className="absolute bottom-0 left-0 h-auto w-full translate-y-[12%]"
                    />
                  </div>
                </div>
                <div className="px-[26px] pb-[30px]">
                  <h3
                    className="font-archivo border-b border-t-2 pb-2 pt-[10px] text-center text-[38px] font-black uppercase leading-none"
                    style={{ borderTopColor: CARD_INK, borderBottomColor: CARD_RULE }}
                  >
                    {member.name}
                  </h3>
                  <div className="mt-3 flex gap-[18px]">
                    {[stats.slice(0, 3), stats.slice(3)].map((column, i) => (
                      <div
                        key={i}
                        className={`flex flex-1 flex-col gap-0.5 ${i === 1 ? "border-l pl-[18px]" : ""}`}
                        style={i === 1 ? { borderLeftColor: CARD_RULE } : undefined}
                      >
                        {column.map((stat) => (
                          <div key={stat.label} className="flex items-baseline gap-2">
                            <span className="min-w-[22px] text-right text-[28px] font-black leading-tight">{stat.n}</span>
                            <span className="text-[22px] font-semibold leading-tight">{stat.label}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
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
        </div>
        {/* Header plus five rows; older seasons scroll under the sticky header */}
        <div className="max-h-[288px] overflow-auto rounded-[20px] border border-hairline bg-surface">
          <table className="w-full min-w-[760px] table-fixed border-collapse text-sm">
            {/* Season gets a fixed width; the five cups split the rest evenly */}
            <colgroup>
              <col className="w-[120px]" />
              <col />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-surface">
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
