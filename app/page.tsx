import Image from "next/image"
import Link from "next/link"
import prisma from "../lib/prisma"
import { getTeamColor } from "../lib/teamColors"
import dynamic from "next/dynamic"
import { SantaHat } from "../components/SantaHat"
import FlippableCard from "../components/FlippableCard"

const Snowfall = dynamic(() => import("../components/Snowfall"), { ssr: false })

const clubMembers = [
  {
    name: "Vanilla",
    image: "/imgs/vanilla.png",
    achievements: ["x6 FIFA", "x3 FPL", "x3 BETS", "x1 GG"],
    bgColor: "bg-red-100",
  },
  {
    name: "Choco",
    image: "/imgs/choco.png",
    achievements: ["x2 FIFA", "x2 BETS"],
    bgColor: "bg-blue-100",
  },
  {
    name: "Panda",
    image: "/imgs/panda.png",
    achievements: ["x8 HOLDEM", "x7 BETS", "x5 FPL"],
    bgColor: "bg-green-100",
  },
]

const playerColors = {
  Vanilla: "#ea7878",
  Choco: "#4b98de",
  Panda: "#4fcb90",
}

const historyData = [
  { year: "2024/25", fifa: "Vanilla", fpl: "Panda", bets: "Panda", poker: "Panda", sevenOker: "", gg: "Vanilla" },
  { year: "2023/24", fifa: "Vanilla", fpl: "Panda", bets: "Choco", poker: "-", sevenOker: "-", gg: "-" },
  { year: "2022/23", fifa: "Choco", fpl: "Panda", bets: "Panda", poker: "-", sevenOker: "-", gg: "-" },
  { year: "2021/22", fifa: "Vanilla", fpl: "Vanilla", bets: "Panda", poker: "-", sevenOker: "-", gg: "-" },
  { year: "2020/21", fifa: "Vanilla", fpl: "Panda", bets: "Panda", poker: "-", sevenOker: "-", gg: "-" },
  { year: "2019/20", fifa: "Vanilla", fpl: "Vanilla", bets: "Choco", poker: "Panda", sevenOker: "-", gg: "-" },
  { year: "2019", fifa: "-", fpl: "Panda", bets: "-", poker: "DNF", sevenOker: "-", gg: "-" },
  { year: "2018", fifa: "DNF", fpl: "Vanilla", bets: "-", poker: "Panda", sevenOker: "-", gg: "-" },
  { year: "2017", fifa: "Vanilla", fpl: "-", bets: "Vanilla", poker: "Panda", sevenOker: "-", gg: "-" },
  { year: "2016", fifa: "Choco", fpl: "-", bets: "Vanilla", poker: "Panda", sevenOker: "-", gg: "-" },
  { year: "2015", fifa: "-", fpl: "-", bets: "Vanilla", poker: "Panda", sevenOker: "-", gg: "-" },
  { year: "2014", fifa: "-", fpl: "-", bets: "Panda", poker: "Panda", sevenOker: "-", gg: "-" },
  { year: "2013", fifa: "-", fpl: "-", bets: "Panda", poker: "Panda", sevenOker: "-", gg: "-" },
  { year: "2012", fifa: "-", fpl: "-", bets: "Panda", poker: "DSQ", sevenOker: "-", gg: "-" },
]

async function getLatestFplLeader() {
  try {
    const latestWeek = await prisma.fplEntry.findFirst({
      orderBy: { week: "desc" },
      select: { week: true },
    })

    if (!latestWeek) return null

    const leader = await prisma.fplEntry.findFirst({
      where: { week: latestWeek.week },
      orderBy: { points: "desc" },
    })

    return leader
  } catch (error) {
    console.error("Error fetching FPL leader:", error)
    return null
  }
}

async function getLatestGgLeader() {
  try {
    const latestWeek = await prisma.ggEntry.findFirst({
      orderBy: { week: "desc" },
      select: { week: true },
    })

    if (!latestWeek) return null

    const leader = await prisma.ggEntry.findFirst({
      where: { week: latestWeek.week },
      orderBy: { points: "desc" },
    })

    return leader
  } catch (error) {
    console.error("Error fetching GG leader:", error)
    return null
  }
}

async function getLatestPokerLeader() {
  try {
    const latestWeek = await prisma.pokerEntry.findFirst({
      orderBy: { week: "desc" },
      select: { week: true },
    })

    if (!latestWeek) return null

    const leader = await prisma.pokerEntry.findFirst({
      where: { week: latestWeek.week },
      orderBy: { points: "desc" },
      select: { bearo: true, points: true },
    })

    return leader
  } catch (error) {
    console.error("Error fetching Poker leader:", error)
    return null
  }
}

async function getLatest7okerLeader() {
  try {
    // Use dynamic property access to avoid TypeScript errors
    const modelName = "sevenOkerEntry2024"

    const latestWeek = await (prisma as any)[modelName].findFirst({
      orderBy: { week: "desc" },
      select: { week: true },
    })

    if (!latestWeek) return null

    const leader = await (prisma as any)[modelName].findFirst({
      where: { week: latestWeek.week },
      orderBy: { points: "desc" },
      select: { bearo: true, points: true },
    })

    return leader
  } catch (error) {
    console.error("Error fetching 7oker leader:", error)
    return null
  }
}

async function getLatestBetsLeader() {
  try {
    const latestWeek = await prisma.betsEntry.findFirst({
      orderBy: { week: "desc" },
      select: { week: true },
    })

    if (!latestWeek) return null

    const leader = await prisma.betsEntry.findFirst({
      where: { week: latestWeek.week },
      orderBy: { points: "desc" },
    })

    return leader
  } catch (error) {
    console.error("Error fetching Bets leader:", error)
    return null
  }
}

async function getLatestFifaLeader() {
  try {
    const leader = await prisma.fifaEntry.findFirst({
      orderBy: [{ wins: "desc" }, { goalsScored: "desc" }, { goalsConceded: "asc" }],
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
  const color = isFifaTeam ? getTeamColor(name) : playerColors[name as keyof typeof playerColors]
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

export default async function Home() {
  const fplLeader = await getLatestFplLeader()
  const ggLeader = await getLatestGgLeader()
  const pokerLeader = await getLatestPokerLeader()
  const sevenOkerLeader = await getLatest7okerLeader()
  const betsLeader = await getLatestBetsLeader()
  const fifaLeader = await getLatestFifaLeader()

  const fplSummary = {
    title: "FPL",
    content:
      fplLeader && fplLeader.points > 0 ? (
        <>
          Champion: <UnderlinedPlayer name={fplLeader.player} /> with {fplLeader.points} points
        </>
      ) : (
        "Will be started soon"
      ),
    link: "/fpl",
  }

  const ggSummary = {
    title: "GeoGuessr",
    content:
      ggLeader && ggLeader.points > 0 ? (
        <>
          Leader: <UnderlinedPlayer name={ggLeader.player} /> with {ggLeader.points} points
        </>
      ) : (
        "Will be started soon"
      ),
    link: "/gg",
  }

  const holdemSummary = {
    title: "Holdem",
    content:
      pokerLeader && pokerLeader.points > 0 ? (
        <>
          Leader: <UnderlinedPlayer name={pokerLeader.bearo} /> with {pokerLeader.points} points
        </>
      ) : (
        "Will be started soon"
      ),
    link: "/poker",
  }

  const sevenOkerSummary = {
    title: "7oker",
    content:
      sevenOkerLeader && sevenOkerLeader.points > 0 ? (
        <>
          Leader: <UnderlinedPlayer name={sevenOkerLeader.bearo} /> with {sevenOkerLeader.points} points
        </>
      ) : (
        "Will be started soon"
      ),
    link: "/7oker",
  }

  const betsSummary = {
    title: "Bets",
    content:
      betsLeader && betsLeader.points > 0 ? (
        <>
          Leader: <UnderlinedPlayer name={betsLeader.player} /> with {betsLeader.points} points
        </>
      ) : (
        "Will be started soon"
      ),
    link: "/bets",
  }

  const fifaSummary = {
    title: "FIFA",
    content:
      fifaLeader && fifaLeader.points > 0 ? (
        <>
          Leader: <UnderlinedPlayer name={fifaLeader.team} isFifaTeam={true} /> with {fifaLeader.points} points
        </>
      ) : (
        "Will be started soon"
      ),
    link: "/fifa",
  }

  const summaries = [fifaSummary, fplSummary, betsSummary, holdemSummary, sevenOkerSummary, ggSummary]

  const currentMonth = new Date().getMonth() + 1 // getMonth() returns 0-11

  return (
    <>
      {(currentMonth === 12 || currentMonth === 1) && <Snowfall />}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <section className="mb-12">
          <h1 className="text-title font-bold mb-4 relative inline-block">
            Welcome to Bearos Club
            {(currentMonth === 12 || currentMonth === 1) && <SantaHat />}
          </h1>
          <p className="text-basic text-gray-600">Here is always Sunday since 06.09.2012.</p>
        </section>

        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {clubMembers.map((member, index) => (
              <div key={index} className="h-[300px]">
                <FlippableCard
                  bgColor={member.bgColor}
                  frontContent={
                    <div className="flex flex-col justify-between h-full w-full">
                      <div className="flex flex-col items-center">
                        <Image
                          src={member.image || "/placeholder.svg"}
                          alt={member.name}
                          width={200}
                          height={200}
                          className="rounded-full object-cover w-48 h-48"
                        />
                      </div>
                      <div className="flex flex-col items-center mt-auto">
                        <h2 className="text-title font-semibold mb-2">{member.name}</h2>
                        <p className="text-sm text-gray-300 italic">Click to see cups</p>
                      </div>
                    </div>
                  }
                  backContent={
                    <>
                      <h2 className="text-xl font-semibold mb-6">Cups of {member.name}:</h2>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        {member.achievements.map((achievement, i) => (
                          <li key={i} className="mb-2 text-base">
                            {achievement}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-gray-300 mt-6 italic">Click to flip back</p>
                    </>
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-title font-bold mb-6">XIV Season 2024/25</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summaries.map((summary, index) => (
              <div
                key={index}
                className="bg-gray-50 shadow-md rounded-lg p-6 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105"
              >
                <h3 className="text-xl font-semibold mb-2">{summary.title}</h3>
                <p className="text-gray-600 mb-4">{summary.content}</p>
                <Link href={summary.link} className="text-blue-500 hover:underline">
                  Full standings
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-title font-bold mb-6">History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">FIFA</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">FPL</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Bets</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Holdem
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                    7oker
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">GG</th>
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
                      <UnderlinedPlayer name={row.fifa} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <UnderlinedPlayer name={row.fpl} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <UnderlinedPlayer name={row.bets} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <UnderlinedPlayer name={row.poker} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <UnderlinedPlayer name={row.sevenOker} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <UnderlinedPlayer name={row.gg} />
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

