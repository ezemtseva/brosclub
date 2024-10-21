import Image from 'next/image'
import DataTable from '../../components/DataTable'
import ImageGallery from '../../components/ImageGallery'
import { unstable_noStore as noStore } from 'next/cache'

const columns = [
  { header: '#', accessor: 'position' },
  { header: 'Bearo', accessor: 'player' },
  { header: 'Games', accessor: 'games' },
  { header: 'Points', accessor: 'points' },
  { header: 'Difference', accessor: 'difference' },
  { header: 'Updated At', accessor: 'updatedAt' },
]

const players = [
  { name: 'Vanilla', teamId: '1546526' },
  { name: 'Choco', teamId: '3214199' },
  { name: 'Panda', teamId: '5663' },
]

async function fetchPlayerData(teamId: string) {
  const res = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/history/`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to fetch data for team ${teamId}`)
  }
  const data = await res.json()
  const currentEvent = data.current.slice(-1)[0]
  return {
    games: currentEvent.event,
    points: currentEvent.total_points,
  }
}

async function getFplData() {
  noStore()
  try {
    const playersData = await Promise.all(
      players.map(async (player) => {
        const { games, points } = await fetchPlayerData(player.teamId)
        return {
          player: player.name,
          games,
          points,
          teamId: player.teamId,
          updatedAt: new Date().toLocaleString(), // Current time as update time
        }
      })
    )
    return playersData.sort((a, b) => b.points - a.points)
  } catch (error) {
    console.error('Error fetching FPL data:', error)
    throw error
  }
}

export default async function FPLPage() {
  try {
    const data = await getFplData()

    const tableData = data.map((entry, index) => ({
      position: index + 1,
      player: entry.player,
      games: entry.games,
      points: entry.points,
      difference: index === 0 ? '-' : (data[index - 1].points - entry.points).toString(),
      updatedAt: entry.updatedAt,
    }))

    const images = [
      { src: "/imgs/fpl/fpl2.png", alt: "New FPL Season Highlight", caption: "Latest highlight from the FPL season" },
      { src: "/imgs/fpl/fpl1.png", alt: "Top team of the week", caption: "Top team of the week" },
      { src: "/placeholder.svg?height=400&width=600", alt: "FPL Placeholder", caption: "FPL Placeholder Image" },
    ]

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-title font-bold mb-4">FPL Cup</h1>
        <p className="text-base text-gray-600 mb-8">VII season of Fantasy Premier League.</p>
        <h2 className="text-title font-bold mb-6">Standings</h2>
        <DataTable columns={columns} data={tableData} />

        <section className="mt-12">
          <h2 className="text-title font-bold mb-6">Highlights</h2>
          <ImageGallery images={images} />
        </section>
      </div>
    )
  } catch (error) {
    console.error('Error in FPLPage:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-title font-bold mb-4">FPL Cup</h1>
        <p className="text-base text-gray-600 mb-8">VII season of Fantasy Premier League.</p>
        <h2 className="text-title font-bold mb-4">Standings</h2>
        <p className="text-red-500">Error loading FPL data. Please try again later.</p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-sm text-gray-500 mt-2">Error details: {(error as Error).message}</p>
        )}
      </div>
    )
  }
}