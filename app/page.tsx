import Image from 'next/image'
import Link from 'next/link'
import prisma from '../lib/prisma'

const clubMembers = [
  { 
    name: 'Vanilla', 
    image: '/imgs/vanilla.png',
    achievements: [
      'x5 FIFA cups',
      'x3 FPL cups',
      'x3 BETS cups'
    ]
  },
  { 
    name: 'Choco', 
    image: '/imgs/choco.png',
    achievements: [
      'x2 FIFA cups',
      'x2 FPL cups'
    ]
  },
  { 
    name: 'Panda', 
    image: '/imgs/panda.png',
    achievements: [
      'x7 POKER cups',
      'x6 BETS cups',
      'x4 FPL cups'
    ]
  },
]

const summaries = [
  //fifaSummary will be added here
]

const historyData = [
  { year: '2023/24', poker: '-', bets: 'Choco', fpl: 'Panda', gg: '-', fifa: 'Vanilla' },
  { year: '2022/23', poker: '-', bets: 'Panda', fpl: 'Panda', gg: '-', fifa: 'Choco' },
  { year: '2021/22', poker: '-', bets: 'Panda', fpl: 'Vanilla', gg: '-', fifa: 'Vanilla' },
  { year: '2020/21', poker: '-', bets: 'Panda', fpl: 'Panda', gg: '-', fifa: 'Vanilla' },
  { year: '2019/20', poker: 'Panda', bets: 'Choco', fpl: 'Vanilla', gg: '-', fifa: 'Vanilla' },
  { year: '2019', poker: 'DNF', bets: '-', fpl: 'Panda', gg: '-', fifa: '-' },
  { year: '2018', poker: 'Panda', bets: '-', fpl: 'Vanilla', gg: '-', fifa: 'DNF' },
  { year: '2017', poker: 'Panda', bets: 'Vanilla', fpl: '-', gg: '-', fifa: 'Vanilla' },
  { year: '2016', poker: 'Panda', bets: 'Vanilla', fpl: '-', gg: '-', fifa: 'Choco' },
  { year: '2015', poker: 'Panda', bets: 'Vanilla', fpl: '-', gg: '-', fifa: '-' },
  { year: '2014', poker: 'Panda', bets: 'Panda', fpl: '-', gg: '-', fifa: '-' },
  { year: '2013', poker: 'Panda', bets: 'Panda', fpl: '-', gg: '-', fifa: '-' },
  { year: '2012', poker: 'DSQ', bets: 'Panda', fpl: '-', gg: '-', fifa: '-' },
]

async function getLatestFplLeader() {
  try {
    const latestWeek = await prisma.fplEntry.findFirst({
      orderBy: { week: 'desc' },
      select: { week: true },
    })

    if (!latestWeek) return null

    const leader = await prisma.fplEntry.findFirst({
      where: { week: latestWeek.week },
      orderBy: { points: 'desc' },
    })

    return leader
  } catch (error) {
    console.error('Error fetching FPL leader:', error)
    return null
  }
}

async function getLatestGgLeader() {
  try {
    const latestWeek = await prisma.ggEntry.findFirst({
      orderBy: { week: 'desc' },
      select: { week: true },
    })

    if (!latestWeek) return null

    const leader = await prisma.ggEntry.findFirst({
      where: { week: latestWeek.week },
      orderBy: { points: 'desc' },
    })

    return leader
  } catch (error) {
    console.error('Error fetching GG leader:', error)
    return null
  }
}

async function getLatestPokerLeader() {
  try {
    const latestWeek = await prisma.pokerEntry.findFirst({
      orderBy: { week: 'desc' },
      select: { week: true },
    })

    if (!latestWeek) return null

    const leader = await prisma.pokerEntry.findFirst({
      where: { week: latestWeek.week },
      orderBy: { points: 'desc' },
      select: { bearo: true, points: true },
    })

    return leader
  } catch (error) {
    console.error('Error fetching Poker leader:', error)
    return null
  }
}

async function getLatestBetsLeader() {
  try {
    const latestWeek = await prisma.betsEntry.findFirst({
      orderBy: { week: 'desc' },
      select: { week: true },
    })

    if (!latestWeek) return null

    const leader = await prisma.betsEntry.findFirst({
      where: { week: latestWeek.week },
      orderBy: { points: 'desc' },
    })

    return leader
  } catch (error) {
    console.error('Error fetching Bets leader:', error)
    return null
  }
}

async function getLatestFifaLeader() {
  try {
    const leader = await prisma.fifaEntry.findFirst({
      orderBy: [
        { wins: 'desc' },
        { goalsScored: 'desc' },
        { goalsConceded: 'asc' }
      ],
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
    console.error('Error fetching FIFA leader:', error)
    return null
  }
}

export default async function Home() {
  const fplLeader = await getLatestFplLeader()
  const ggLeader = await getLatestGgLeader()
  const pokerLeader = await getLatestPokerLeader()
  const betsLeader = await getLatestBetsLeader()
  const fifaLeader = await getLatestFifaLeader()

  const fplSummary = {
    title: 'FPL',
    content: fplLeader
      ? `Leader: ${fplLeader.player} with ${fplLeader.points} points`
      : 'No FPL data available',
    link: '/fpl'
  }

  const ggSummary = {
    title: 'GeoGuessr',
    content: ggLeader
      ? `Leader: ${ggLeader.player} with ${ggLeader.points} points`
      : 'No GG data available',
    link: '/gg'
  }

  const pokerSummary = {
    title: 'Poker',
    content: pokerLeader
      ? `Leader: ${pokerLeader.bearo} with ${pokerLeader.points} points`
      : 'No Poker data available',
    link: '/poker'
  }

  const betsSummary = {
    title: 'Bets',
    content: betsLeader
      ? `Leader: ${betsLeader.player} with ${betsLeader.points} points`
      : 'No Bets data available',
    link: '/bets'
  }

  const fifaSummary = {
    title: 'FIFA',
    content: fifaLeader
      ? `Leader: ${fifaLeader.team} with ${fifaLeader.points} points`
      : 'No FIFA data available',
    link: '/fifa'
  }

  const summaries = [
    fifaSummary,
    fplSummary,
    ggSummary,
    pokerSummary,
    betsSummary
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-title font-bold mb-4">Welcome to Bearos Club</h1>
        <p className="text-basic text-gray-600">
          Here is always Sunday!
        </p>
      </section>

      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {clubMembers.map((member, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
              <Image
                src={member.image}
                alt={member.name}
                width={200}
                height={200}
                className="rounded-full object-cover w-48 h-48 mb-4"
              />
              <h2 className="text-2xl font-semibold mb-2">{member.name}</h2>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {member.achievements.map((achievement, i) => (
                  <li key={i}>{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-title font-bold mb-6">XIV Season 2024/25</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...summaries].map((summary, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">{summary.title}</h3>
              <p className="text-gray-600 mb-4">{summary.content}</p>
              <Link href={summary.link} className="text-blue-500 hover:underline">
                View full {summary.title.split(' ')[0]} standings
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-title font-bold mb-6">History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FPL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GG</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIFA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {historyData.map((row, index) => (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-200`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.poker}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.bets}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.fpl}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.gg}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.fifa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}