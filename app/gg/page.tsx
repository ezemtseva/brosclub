import DataTable from '../../components/DataTable'
import prisma from '../../lib/prisma'
import dynamic from 'next/dynamic'
import ImageCarousel from '../../components/ImageCarousel'

const GGChart = dynamic(() => import('../../components/GGChart'), { ssr: false })
const PieChart = dynamic(() => import('../../components/PieChart'), { ssr: false })

const columns = [
  { header: '#', accessor: 'position' },
  { header: 'Bearo', accessor: 'player' },
  { header: 'Games', accessor: 'games' },
  { header: 'Wins', accessor: 'wins' },
  { header: '5K', accessor: 'fiveK' },
  { header: 'Points', accessor: 'points' },
  { header: 'Difference', accessor: 'difference' },
  { header: 'W%', accessor: 'winPercentage' },
]

const playerColors = {
  'Vanilla': '#ea7878',
  'Choco': '#4b98de',
  'Panda': '#4fcb90'
}

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
      fiveK: entry.fiveK,
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

  const images = [
    { src: "/imgs/gg/5k10.jpg", alt: "Third 5K of the season", caption: "10th 5k in the season for Vanilla - Malta " }, 
    { src: "/imgs/gg/5k9.jpg", alt: "Third 5K of the season", caption: "When you're really proud of your 5k in Pompei" }, 
    { src: "/imgs/gg/5k8.jpg", alt: "Third 5K of the season", caption: "5k in Jordan for Vanilla" }, 
    { src: "/imgs/gg/5k7.jpg", alt: "Third 5K of the season", caption: "Boring 5k in Monaco" }, 
    { src: "/imgs/gg/5k6.jpg", alt: "Third 5K of the season", caption: "Last min win by 5k in Arequipa!" },
    { src: "/imgs/gg/5k5.jpg", alt: "Third 5K of the season", caption: "Double 5k in a game, both in San Marino.." },
    { src: "/imgs/gg/5k3.jpg", alt: "Third 5K of the season", caption: "Almost double 5K hit in Zermatt" },
    { src: "/imgs/gg/5k2.jpg", alt: "Second 5K of the season", caption: "5K for Vanilla in San Marino" },
    { src: "/imgs/gg/gg1.jpg", alt: "New GeoGuessr Season Highlight", caption: "And that was frozen round" },
    { src: "/imgs/gg/5k1.jpg", alt: "First 5K of the season", caption: "First 5K of the season in Belgrade" },
    { src: "/imgs/gg/gg.jpg", alt: "First 5K of the season", caption: "And the journey began!" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">GeoGuessr Cup</h1>
      <p className="text-base text-gray-600 mb-8">First ever season! Move, no move and frozen rounds in a row.</p>
      <h2 className="text-title font-bold mb-6">Standings</h2>
      <DataTable columns={columns} data={tableData} />

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Weekly progress</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <GGChart entries={entries} />
          </div>
          <div className="w-full md:w-1/3">
            <PieChart data={pieChartData} />
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Highlights</h2>
        <div className="px-12">
          <ImageCarousel images={images} />
        </div>
      </section>
    </div>
  )
}