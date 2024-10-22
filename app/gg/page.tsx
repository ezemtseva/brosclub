import Image from 'next/image'
import prisma from '../../lib/prisma'
import DataTable from '../../components/DataTable'
import ImageGallery from '../../components/ImageGallery'
import dynamic from 'next/dynamic'

const GGChart = dynamic(() => import('../../components/GGChart'), { ssr: false })

const columns = [
  { header: '#', accessor: 'position' },
  { header: 'Bearo', accessor: 'player' },
  { header: 'Games', accessor: 'games' },
  { header: 'Wins', accessor: 'wins' },
  { header: '5K', accessor: 'fiveK' },
  { header: 'Points', accessor: 'points' },
  { header: 'Difference', accessor: 'difference' },
]

async function getGgData() {
  const entries = await prisma.ggEntry.findMany({
    orderBy: [
      { week: 'asc' },
      { player: 'asc' }
    ],
  })

  const latestWeek = Math.max(...entries.map(entry => entry.week))
  const latestEntries = entries.filter(entry => entry.week === latestWeek)

  return { entries, latestEntries }
}

export default async function GGPage() {
  const { entries, latestEntries } = await getGgData()

  const tableData = latestEntries
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      position: index + 1,
      player: entry.player,
      games: entry.games,
      wins: entry.wins,
      fiveK: entry.fiveK,
      points: entry.points,
      difference: index === 0 ? '-' : (latestEntries[index - 1].points - entry.points).toString(),
    }))

  const images = [
    { src: "/imgs/gg/gg1.jpg", alt: "New GeoGuessr Season Highlight", caption: "And that was no move round" },
    { src: "/imgs/gg/5k1.jpg", alt: "First 5K of the season", caption: "First 5K of the season" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">GeoGuessr Cup</h1>
      <p className="text-base text-gray-600 mb-8">First ever season!</p>
      <h2 className="text-title font-bold mb-6">Standings</h2>
      <DataTable columns={columns} data={tableData} />

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Weekly progress</h2>
        <div className="w-full">
          <GGChart entries={entries} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Highlights</h2>
        <ImageGallery images={images} />
      </section>
    </div>
  )
}