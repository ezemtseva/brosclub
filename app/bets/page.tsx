import DataTable from '../../components/DataTable'
import prisma from '../../lib/prisma'
import dynamic from 'next/dynamic'

const BetsChart = dynamic(() => import('../../components/BetsChart'), { ssr: false })
const PieChart = dynamic(() => import('../../components/PieChart'), { ssr: false })

const columns = [
  { header: '#', accessor: 'position' },
  { header: 'Bearo', accessor: 'player' },
  { header: 'Games', accessor: 'games' },
  { header: 'Wins', accessor: 'wins' },
  { header: 'Points', accessor: 'points' },
  { header: 'Difference', accessor: 'difference' },
  { header: 'W%', accessor: 'winPercentage' },
]

const playerColors = {
  'Vanilla': '#ea7878',
  'Choco': '#4b98de',
  'Panda': '#4fcb90'
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

  const totalWins = latestEntries.reduce((sum, entry) => sum + entry.wins, 0)

  const tableData = latestEntries
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      position: index + 1,
      player: (
        <span className="relative">
          {entry.player}
          <span 
            className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" 
            style={{ backgroundColor: playerColors[entry.player as keyof typeof playerColors] }}
          />
        </span>
      ),
      games: entry.games,
      wins: entry.wins,
      points: entry.points,
      difference: index === 0 ? '-' : (latestEntries[index - 1].points - entry.points).toString(),
      winPercentage: totalWins > 0 ? `${((entry.wins / totalWins) * 100).toFixed(1)}%` : '0%',
      hoverColor: playerColors[entry.player as keyof typeof playerColors],
    }))

  const pieChartData = latestEntries.map(entry => ({
    name: entry.player,
    value: entry.wins,
    color: playerColors[entry.player as keyof typeof playerColors]
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">Bets Cup</h1>
      <p className="text-base text-gray-600 mb-8">XII season of betting on top football leagues matches. Currently only on English Premier League.</p>
      <h2 className="text-title font-bold mb-6">Standings</h2>
      <DataTable columns={columns} data={tableData} />

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Weekly progress</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <BetsChart entries={entries} />
          </div>
          <div className="w-full md:w-1/3">
            <PieChart data={pieChartData} />
          </div>
        </div>
      </section>
    </div>
  )
}