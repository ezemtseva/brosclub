import Image from 'next/image'
import DataTable from '../../components/DataTable'
import ImageCarousel from '../../components/ImageCarousel'
import prisma from '../../lib/prisma'
import dynamicImport from 'next/dynamic'

const FplChart = dynamicImport(() => import('../../components/FplChart'), { ssr: false })

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

type WeekData = {
  event: number;
  points: number;
};

type PlayerData = {
  player: string;
  weeklyData: WeekData[];
  color: string;
}

async function fetchPlayerData(teamId: string): Promise<WeekData[]> {
  const res = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/history/`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to fetch data for team ${teamId}`)
  }
  const data = await res.json()
  return data.current.map((week: any) => ({
    event: week.event,
    points: week.total_points,
  }))
}

async function getFplDataAndUpdateDb(): Promise<PlayerData[]> {
  try {
    const playersData = await Promise.all(
      players.map(async (player) => {
        const weeklyData = await fetchPlayerData(player.teamId)
        
        for (const week of weeklyData) {
          try {
            await prisma.fplEntry.upsert({
              where: {
                week_player: {
                  week: week.event,
                  player: player.name,
                },
              },
              update: { points: week.points },
              create: {
                week: week.event,
                player: player.name,
                points: week.points,
                games: week.event,
                teamId: player.teamId,
              },
            })
          } catch (dbError) {
            console.error('Error updating database:', dbError)
          }
        }

        return {
          player: player.name,
          weeklyData,
          color: player.color,
        }
      })
    )
    return playersData
  } catch (error) {
    console.error('Error fetching FPL data:', error)
    throw error
  }
}

export default async function FPLPage() {
  try {
    const playersData = await getFplDataAndUpdateDb()
    
    const tableData = playersData
      .sort((a, b) => b.weeklyData[b.weeklyData.length - 1].points - a.weeklyData[a.weeklyData.length - 1].points)
      .map((entry, index) => ({
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
        games: entry.weeklyData.length,
        points: entry.weeklyData[entry.weeklyData.length - 1].points,
        difference: index === 0 ? '-' : (
          playersData[index - 1].weeklyData[playersData[index - 1].weeklyData.length - 1].points - 
          entry.weeklyData[entry.weeklyData.length - 1].points
        ).toString(),
        hoverColor: entry.color,
      }))

    const chartData = playersData.flatMap(player => 
      player.weeklyData.map((week, index, array) => ({
        player: player.player,
        week: week.event,
        points: index === 0 ? week.points : week.points - array[index - 1].points,
        games: week.event, 
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

