import DataTable from '../../components/DataTable'
import prisma from '../../lib/prisma'
import dynamic from 'next/dynamic'
import ImageCarousel from '../../components/ImageCarousel'

const PokerChart = dynamic(() => import('../../components/PokerChart'), { ssr: false })
const PieChart = dynamic(() => import('../../components/PieChart'), { ssr: false })

const columns = [
  { header: '#', accessor:  'position' },
  { header: 'Bearo', accessor: 'bearo' },
  { header: 'G', accessor: 'games' },
  { header: 'W', accessor: 'wins' },
  { header: 'P', accessor: 'points' },
  { header: 'PD', accessor: 'pointsDifference' },
  { header: 'W%', accessor: 'winPercentage' },
]

const playerColors = {
  'Vanilla': '#ea7878',
  'Choco': '#4b98de',
  'Panda': '#4fcb90'
}

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
      bearo: (
        <span className="relative">
          {entry.bearo}
          <span 
            className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" 
            style={{ backgroundColor: playerColors[entry.bearo as keyof typeof playerColors] }}
          />
        </span>
      ),
      games: entry.games,
      wins: entry.wins,
      points: entry.points,
      pointsDifference: index === 0 ? '-' : arr[0].points - entry.points,
      winPercentage: entry.games > 0 ? `${((entry.wins / entry.games) * 100).toFixed(1)}%` : '0%',
      hoverColor: playerColors[entry.bearo as keyof typeof playerColors],
    }))

  const pieChartData = latestEntries.map(entry => ({
    name: entry.bearo,
    value: entry.wins,
    color: playerColors[entry.bearo as keyof typeof playerColors]
  }))

  const images = [
    { src: "/imgs/poker/poker4.jpg", alt: "Poker Season Highlight - Full House", caption: "Straights fight" },
    { src: "/imgs/poker/poker3.jpg", alt: "Poker Season Highlight - Full House", caption: "Never fold to early" },    
    { src: "/imgs/poker/poker2.jpg", alt: "New Poker Season Highlight", caption: "Last call survivor" },
    { src: "/imgs/poker/poker1.jpg", alt: "Poker Season Highlight - Full House", caption: "Full house, triple seven and two pairs" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">Poker Cup</h1>
      <p className="text-base text-gray-600  mb-8">X anniversary season of texas holdem poker after long 4 years pause.</p>
      <h2 className="text-title font-bold mb-6">Standings</h2>
      <DataTable columns={columns} data={data} />

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Weekly progress</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <PokerChart entries={entries} />
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