import DataTable from '../../components/DataTable'
import ImageGallery from '../../components/ImageGallery'
import prisma from '../../lib/prisma'
import dynamic from 'next/dynamic'

const PokerChart = dynamic(() => import('../../components/PokerChart'), { ssr: false })

const columns = [
  { header: '#', accessor: 'position' },
  { header: 'Bearo', accessor: 'bearo' },
  { header: 'G', accessor: 'games' },
  { header: 'W', accessor: 'wins' },
  { header: 'P', accessor: 'points' },
  { header: 'PD', accessor: 'pointsDifference' },
  { header: 'W%', accessor: 'winPercentage' },
]

async function getPokerData() {
  const entries = await prisma.pokerEntry.findMany({
    orderBy: [
      { week: 'asc' },
      { bearo: 'asc' }
    ],
  })

  const latestWeek = Math.max(...entries.map(entry => entry.week))
  const latestEntries = entries.filter(entry => entry.week === latestWeek)

  return { entries, latestEntries }
}

export default async function PokerPage() {
  const { entries, latestEntries } = await getPokerData()

  const data = latestEntries
    .sort((a, b) => b.points - a.points)
    .map((entry, index, arr) => ({
      position: index + 1,
      bearo: entry.bearo,
      games: entry.games,
      wins: entry.wins,
      points: entry.points,
      pointsDifference: index === 0 ? 0 : arr[0].points - entry.points,
      winPercentage: entry.games > 0 ? `${((entry.wins / entry.games) * 100).toFixed(1)}%` : '0%',
    }))

  const images = [
    { src: "/imgs/poker/poker2.jpg", alt: "New Poker Season Highlight", caption: "Last call survivor" },
    { src: "/imgs/poker/poker1.jpg", alt: "Poker Season Highlight - Full House", caption: "Full house, triple seven and two pairs" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">Poker Cup</h1>
      <p className="text-base text-gray-600 mb-8">X anniversary season of texas holdem poker after long 4 years pause</p>
      <h2 className="text-title font-bold mb-6">Standings</h2>
      <DataTable columns={columns} data={data} />

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Weekly progress</h2>
        <div className="w-full">
          <PokerChart entries={entries} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Highlights</h2>
        <ImageGallery images={images} />
      </section>
    </div>
  )
}