import Image from "next/image"
import Link from "next/link"
import prisma from "../lib/prisma"
import { getTeamColor, PLAYER_COLORS } from "../lib/teamColors"
import dynamicImport from "next/dynamic"
import { SantaHat } from "../components/SantaHat"

export const dynamic = 'force-dynamic'

const Snowfall = dynamicImport(() => import("../components/Snowfall"), { ssr: false })

const clubMembers = [
  {
    name: "Vanilla",
    image: "/imgs/vanilla.png",
    cups: { fifa: 6, fpl: 3, bets: 3, sevenOker: 1, holdem: 0 },
    bgColor: "bg-red-100",
  },
  {
    name: "Choco",
    image: "/imgs/choco.png",
    cups: { fifa: 2, fpl: 1, bets: 3, sevenOker: 0, holdem: 0 },
    bgColor: "bg-blue-100",
  },
  {
    name: "Panda",
    image: "/imgs/panda.png",
    cups: { fifa: 0, fpl: 5, bets: 8, sevenOker: 1, holdem: 8 },
    bgColor: "bg-green-100",
  },
]

const cupCategories = [
  { key: "fifa", label: "FIFA" },
  { key: "fpl", label: "FPL" },
  { key: "bets", label: "BETS" },
  { key: "sevenOker", label: "7P" },
  { key: "holdem", label: "TH" },
] as const

const historyData = [
  //{ year: "2025/26", fifa: "", fpl: "", bets: "", poker: "-", sevenOker: "" },
  { year: "2025/26", fifa: "-", fpl: "Choco", bets: "Choco & Panda", poker: "-", sevenOker: "Vanilla" },
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
      if (leader) return leader
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
    return archiveLeader
  } catch (error) {
    console.error("Error fetching 7oker leader:", error)
    return null
  }
}


async function getLatestFifaLeader() {
  try {
    const leader = await prisma.fifaEntry.findFirst({
      orderBy: [{ wins: "desc" }, { draws: "desc"}, { games: "asc"}, { goalsScored: "desc" }, { goalsConceded: "asc" }],
      select: {
        team: true,
        wins: true,
        draws: true,
        losses: true,
        goalsScored: true,
        goalsConceded: true,
      },
    })
    if (leader) {
      const points = leader.wins * 3 + leader.draws
      const goalDifference = leader.goalsScored - leader.goalsConceded
      return { ...leader, points, goalDifference }
    }
    return null
  } catch (error) {
    console.error("Error fetching FIFA leader:", error)
    return null
  }
}

const UnderlinedPlayer = ({ name, isFifaTeam = false }: { name: string; isFifaTeam?: boolean }) => {
  if (name === "-" || name === "DNF" || name === "DSQ") {
    return <span>{name}</span>
  }
  const color = isFifaTeam ? getTeamColor(name) : PLAYER_COLORS[name]
  return (
    <span className="relative">
      <span className="relative">
        {name[0]}
        <span className="absolute bottom-[-2px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: color }} />
      </span>
      {name.slice(1)}
    </span>
  )
}

const HistoryCell = ({ value }: { value: string }) => {
  if (!value.includes(" & ")) return <UnderlinedPlayer name={value} />
  const parts = value.split(" & ")
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && " & "}
          <UnderlinedPlayer name={part} />
        </span>
      ))}
    </>
  )
}

export default async function Home() {
  const fplLeader = await getLatestFplLeader()
  const sevenOkerLeader = await getLatest7okerLeader()
  const fifaLeader = await getLatestFifaLeader()

  const fplSummary = {
    title: "FPL",
    champion: !!(fplLeader && fplLeader.points > 0),
    content:
      fplLeader && fplLeader.points > 0 ? (
        <>
          Champion: <UnderlinedPlayer name={fplLeader.player} /> - {fplLeader.points} points
        </>
      ) : (
        "Will be started soon"
      ),
    link: "/fpl",
  }

  const holdemSummary = {
    title: "Holdem",
    champion: false,
    suspended: true,
    content: "Currently suspended",
    link: "/poker",
  }

  const sevenOkerSummary = {
    title: "7oker",
    champion: !!(sevenOkerLeader && sevenOkerLeader.points > 0),
    content:
      sevenOkerLeader && sevenOkerLeader.points > 0 ? (
        <>
          Champion: <UnderlinedPlayer name={sevenOkerLeader.bearo} /> - {sevenOkerLeader.points} points
        </>
      ) : (
        "Will be started soon"
      ),
    link: "/7oker",
  }

  const betsSummary = {
    title: "Bets",
    champion: true,
    content: (
      <>
        Champions: <UnderlinedPlayer name="Choco" /> & <UnderlinedPlayer name="Panda" /> - 240 points
      </>
    ),
    link: "/bets",
  }

  const fifaSummary = {
    title: "FIFA",
    champion: false,
    content:
      fifaLeader && fifaLeader.points > 0 ? (
        <>
          Leader: <UnderlinedPlayer name={fifaLeader.team} isFifaTeam={true} /> - {fifaLeader.points} points
        </>
      ) : (
        "Will be started soon"
      ),
    link: "/fifa",
  }

  const summaries = [fifaSummary, fplSummary, betsSummary, sevenOkerSummary]

  const currentMonth = new Date().getMonth() + 1 // getMonth() returns 0-11

  return (
    <>
      {(currentMonth === 12 || currentMonth === 1) && <Snowfall />}
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
        <section className="mb-3 md:mb-6">
          <h1 className="text-title font-bold mb-4 relative inline-block">
            Welcome to Bearos Club
            {(currentMonth === 12 || currentMonth === 1) && <SantaHat />}
          </h1>
          <p className="text-basic text-gray-600">Here is always Sunday since 06.09.2012</p>
        </section>

        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...clubMembers]
              .sort((a, b) => Object.values(b.cups).reduce((sum, n) => sum + n, 0) - Object.values(a.cups).reduce((sum, n) => sum + n, 0))
              .map((member, index) => {
              const totalCups = Object.values(member.cups).reduce((sum, n) => sum + n, 0)
              return (
                <div key={index} className={`shadow-md rounded-lg p-6 ${member.bgColor}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Image
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover w-16 h-16"
                      />
                      <h2 className="text-xl font-semibold">{member.name}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{totalCups}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Cups</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {cupCategories.map((category) => (
                      <div key={category.key} className="bg-white border border-gray-200 rounded-lg p-1.5 text-center">
                        <div className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5 truncate">{category.label}</div>
                        <div className="text-base font-semibold text-gray-800">{member.cups[category.key]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-title font-bold mb-6">XV Season 2025/26</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {summaries.map((summary, index) => (
              <div
                key={index}
                className={`shadow-md rounded-lg p-6 transition-all duration-300 ease-in-out ${
                  "suspended" in summary && summary.suspended
                    ? "bg-gray-100 opacity-60"
                    : `hover:shadow-xl hover:scale-105 ${summary.champion ? "bg-amber-50" : "bg-gray-50"}`
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{summary.title}</h3>
                  <Link href={summary.link} className="text-blue-500 hover:text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </Link>
                </div>
                <p className={`text-gray-600 ${"suspended" in summary && summary.suspended ? "italic" : ""}`}>{summary.content}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-title font-bold mb-6">History</h2>
          <div className="history-table overflow-x-auto rounded-lg">
            <table className="history-table-inner min-w-full bg-white shadow-md rounded-lg table-fixed">
              <colgroup>
                <col className="w-[16.66%]" />
                <col className="w-[16.66%]" />
                <col className="w-[16.66%]" />
                <col className="w-[16.66%]" />
                <col className="w-[16.66%]" />
                <col className="w-[16.66%]" />
              </colgroup>
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">FIFA</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">FPL</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Bets</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">7oker</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Holdem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historyData.map((row, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors duration-200`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <HistoryCell value={row.fifa} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <HistoryCell value={row.fpl} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <HistoryCell value={row.bets} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <HistoryCell value={row.sevenOker} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <HistoryCell value={row.poker} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}

