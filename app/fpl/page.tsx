import Image from 'next/image'
import DataTable from '../../components/DataTable'
import ImageCarousel from '../../components/ImageCarousel'
import prisma from '../../lib/prisma'
import dynamicImport from 'next/dynamic'

const FplChart = dynamicImport(() => import('../../components/FplChart'), { ssr: false })

export const dynamic = 'force-dynamic'

type TableDataItem = {
  position: number;
  player: React.ReactNode;
  games: number;
  points: number;
  difference: string;
  hoverColor: string;
};

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

async function fetchFplData(teamId: string) {
  const response = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/history/`)
  if (!response.ok) {
    throw new Error(`Failed to fetch FPL data for team ${teamId}`)
  }
  return response.json()
}

async function updateFplDataIfNeeded() {
  for (const player of players) {
    const fplData = await fetchFplData(player.teamId)
    const latestEntry = fplData.current[fplData.current.length - 1]
    
    const dbEntry = await prisma.fplEntry.findFirst({
      where: {
        player: player.name,
        week: latestEntry.event
      }
    })

    if (!dbEntry || dbEntry.points < latestEntry.total_points) {
      await prisma.fplEntry.upsert({
        where: {
          week_player: {
            week: latestEntry.event,
            player: player.name
          }
        },
        update: {
          points: latestEntry.total_points,
          games: latestEntry.event,
          teamId: player.teamId
        },
        create: {
          player: player.name,
          week: latestEntry.event,
          points: latestEntry.total_points,
          games: latestEntry.event,
          teamId: player.teamId
        }
      })
    }
  }
}

async function getFplDataFromDb() {
  try {
    const fplEntries = await prisma.fplEntry.findMany({
      orderBy: [
        { player: 'asc' },
        { week: 'asc' },
      ],
    })

    const playerData = players.map(player => ({
      ...player,
      entries: fplEntries.filter(entry => entry.player === player.name),
    }))

    return playerData
  } catch (error) {
    console.error('Error fetching FPL data from database:', error)
    throw error
  }
}

export default async function FPLPage() {
  try {
    await updateFplDataIfNeeded()
    const playersData = await getFplDataFromDb()
    
    const tableData: TableDataItem[] = playersData
      .map(player => {
        const lastEntry = player.entries[player.entries.length - 1]
        return {
          player: player.name,
          games: lastEntry.games,
          points: lastEntry.points,
          color: player.color,
        }
      })
      .sort((a, b) => b.points - a.points)
      .map((entry, index, sortedData) => ({
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
        difference: index === 0 ? '-' : (sortedData[index - 1].points - entry.points).toString(),
        hoverColor: entry.color,
      }))

    const chartData = playersData.flatMap(player => 
      player.entries.map(entry => ({
        player: player.name,
        week: entry.week,
        games: entry.games,
        points: entry.points,
      }))
    )

    const images = [
      { src: "/imgs/fpl/fpl16.png", alt: "New FPL Season Highlight", caption: "Team of the week 16 - Panda" }, 
      { src: "/imgs/fpl/fpl15.png", alt: "New FPL Season Highlight", caption: "Team of the week 15 - Choco" }, 
      { src: "/imgs/fpl/fpl14.png", alt: "New FPL Season Highlight", caption: "Team of the week 14 - Vanilla" }, 
      { src: "/imgs/fpl/fpl13.png", alt: "New FPL Season Highlight", caption: "Team of the week 13 - Choco" },     
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
          <h2 className="text-title font-bold mb-6">Weekly progress</h2>
          <div className="w-full">
            <FplChart entries={chartData} />
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

