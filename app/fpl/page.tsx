import Image from 'next/image'
import DataTable from '../../components/DataTable'
import ImageCarousel from '../../components/ImageCarousel'
import prisma from '../../lib/prisma'

export const dynamic = 'force-dynamic'

const columns = [
  { header: '#', accessor: 'position' },
  { header: 'Bearo', accessor: 'player' },
  { header: 'Games', accessor: 'games' },
  { header: 'Points', accessor: 'points' },
  { header: 'Difference', accessor: 'difference' },
]

const players = [
  { name: 'Vanilla', teamId: '1546526', color: '#ea7878' },
  { name: 'Choco', teamId: '3214199', color: '#4b98de' },
  { name: 'Panda', teamId: '5663', color: '#4fcb90' },
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

async function getFplDataAndUpdateDb() {
  try {
    const playersData = await Promise.all(
      players.map(async (player) => {
        const { games, points } = await fetchPlayerData(player.teamId)
        
        try {
          await prisma.fplEntry.upsert({
            where: {
              week_player: {
                week: games,
                player: player.name,
              },
            },
            update: { points, games },
            create: {
              week: games,
              player: player.name,
              points,
              games,
              teamId: player.teamId,
            },
          })
        } catch (dbError) {
          console.error('Error updating database:', dbError)
        }

        return {
          player: player.name,
          games,
          points,
          teamId: player.teamId,
          color: player.color,
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
    const data = await getFplDataAndUpdateDb()

    const tableData = data.map((entry, index) => ({
      position: index + 1,
      player: (
        <span className="relative">
          {entry.player}
          <span 
            className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" 
            style={{ backgroundColor: entry.color }}
          />
        </span>
      ),
      games: entry.games,
      points: entry.points,
      difference: index === 0 ? '-' : (data[index - 1].points - entry.points).toString(),
      hoverColor: entry.color,
    }))

    const images = [
      { src: "/imgs/fpl/fpl13.png", alt: "New FPL Season Highlight", caption: "Team of the week 12 - Choco" },     
      { src: "/imgs/fpl/fpl12.png", alt: "New FPL Season Highlight", caption: "Team of the week 12 - Vanilla" },
      { src: "/imgs/fpl/fpl11.png", alt: "New FPL Season Highlight", caption: "Team of the week 11 - Choco" },
      { src: "/imgs/fpl/fpl10.png", alt: "New FPL Season Highlight", caption: "Team of the week 10 - Choco" },
      { src: "/imgs/fpl/fpl4.png", alt: "New FPL Season Highlight", caption: "Team of the week 9 - Vanilla" },
      { src: "/imgs/fpl/fpl2.png", alt: "New FPL Season Highlight", caption: "Team of the week 8 - Vanilla" },
      { src: "/imgs/fpl/fpl1.png", alt: "Top team of the week", caption: "Team of the week 7 - Vanilla" },
      { src: "/imgs/fpl/fpl3.png", alt: "FPL Placeholder", caption: "Team of the week 6 - Vanilla" },
    ]

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-title font-bold mb-4">FPL Cup</h1>
        <p className="text-base text-gray-600 mb-8">VII season of Fantasy Premier League.</p>
        <h2 className="text-title font-bold mb-6">Standings</h2>
        <DataTable columns={columns} data={tableData} />

        <section className="mt-12">
          <h2 className="text-title font-bold mb-6">Highlights</h2>
          <div className="px-12">
            <ImageCarousel images={images} />
          </div>
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