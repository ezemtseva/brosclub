import Image from 'next/image'
import prisma from '../../lib/prisma'
import DataTable from '../../components/DataTable'
import ImageGallery from '../../components/ImageGallery'

const columns = [
  { header: '#', accessor: 'position' },
  { header: 'Bearo', accessor: 'player' },
  { header: 'Games', accessor: 'games' },
  { header: 'Wins', accessor: 'wins' },
  { header: '5K', accessor: 'fiveK' },
  { header: 'Points', accessor: 'points' },
  { header: 'Difference', accessor: 'difference' },
]

async function getLatestGgData() {
  const latestWeek = await prisma.ggEntry.findFirst({
    orderBy: { week: 'desc' },
    select: { week: true },
  })

  if (!latestWeek) return []

  const entries = await prisma.ggEntry.findMany({
    where: { week: latestWeek.week },
    orderBy: { points: 'desc' },
  })

  return entries.map((entry, index) => ({
    position: index + 1,
    player: entry.player,
    games: entry.games,
    wins: entry.wins,
    fiveK: entry.fiveK,
    points: entry.points,
    difference: index === 0 ? '-' : (entries[index - 1].points - entry.points).toString(),
  }))
}

export default async function GGPage() {
  const data = await getLatestGgData()

  const images = [
    { src: "/imgs/gg/gg1.jpg", alt: "New GeoGuessr Season Highlight", caption: "And that was no move round" },
    { src: "/imgs/gg/5k1.jpg", alt: "First 5K of the season", caption: "First 5K of the season" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">GeoGuessr Cup</h1>
      <p className="text-base text-gray-600 mb-8">First ever season!</p>
      <h2 className="text-title font-bold mb-6">Standings</h2>
      <DataTable columns={columns} data={data} />

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Highlights</h2>
        <ImageGallery images={images} />
      </section>
    </div>
  )
}