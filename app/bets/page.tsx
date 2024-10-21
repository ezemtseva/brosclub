import prisma from '../../lib/prisma'
import DataTable from '../../components/DataTable'
import dynamic from 'next/dynamic'

const BetsChart = dynamic(() => import('../../components/BetsChart'), { ssr: false })

const columns = [
  { header: '#', accessor: 'position' },
  { header: 'Bearo', accessor: 'player' },
  { header: 'Games', accessor: 'games' },
  { header: 'Wins', accessor: 'wins' },
  { header: 'Points', accessor: 'points' },
  { header: 'Difference', accessor: 'difference' },
]

type BetsEntry = {
  player: string;
  week: number;
  games: number;
  wins: number;
  points: number;
}

async function getBetsData() {
  const entries = await prisma.betsEntry.findMany({
    orderBy: [
      { week: 'asc' },
      { player: 'asc' }
    ],
  })

  const latestWeek = Math.max(...entries.map(entry => entry.week))
  const latestEntries = entries.filter(entry => entry.week === latestWeek)

  return { entries, latestEntries }
}

export default async function BetsPage() {
  const { entries, latestEntries } = await getBetsData()

  const tableData = latestEntries
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      position: index + 1,
      player: entry.player,
      games: entry.games,
      wins: entry.wins,
      points: entry.points,
      difference: index === 0 ? '-' : (latestEntries[index - 1].points - entry.points).toString(),
    }))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">Bets Cup</h1>
      <p className="text-basic text-gray-600 mb-8">XII season of betting on English Premier League matches.</p>
      <h2 className="text-title font-bold mb-6">Standings</h2>
      <DataTable columns={columns} data={tableData} />

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Weekly progress</h2>
        <BetsChart entries={entries} />
      </section>
    </div>
  )
}