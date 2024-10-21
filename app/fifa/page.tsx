import Image from 'next/image'
import DataTable from '../../components/DataTable'
import prisma from '../../lib/prisma'
import VideoGallery from '../../components/VideoGallery'

const columns = [
  { header: '#', accessor: 'position' },
  { header: 'Team', accessor: 'team' },
  { header: 'G', accessor: 'games' },
  { header: 'W', accessor: 'wins' },
  { header: 'D', accessor: 'draws' },
  { header: 'L', accessor: 'losses' },
  { header: 'GS', accessor: 'goalsScored' },
  { header: 'GC', accessor: 'goalsConceded' },
  { header: 'GD', accessor: 'goalDifference' },
  { header: 'P', accessor: 'points' },
]

async function getFifaData() {
  const entries = await prisma.fifaEntry.findMany()
  return entries.map(entry => ({
    ...entry,
    goalDifference: entry.goalsScored - entry.goalsConceded,
    points: entry.wins * 3 + entry.draws,
  })).sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
}

export default async function FIFAPage() {
  const fifaData = await getFifaData()

  const data = fifaData.map((entry, index) => ({
    position: index + 1,
    team: (
      <div className="flex items-center space-x-2">
        <Image src={entry.logo} alt={entry.team} width={24} height={24} className="rounded-full" />
        <span>{entry.team}</span>
      </div>
    ),
    games: entry.games,
    wins: entry.wins,
    draws: entry.draws,
    losses: entry.losses,
    goalsScored: entry.goalsScored,
    goalsConceded: entry.goalsConceded,
    goalDifference: entry.goalDifference,
    points: entry.points,
  }))

  const highlights = [
    { videoId: 'MAdZDsPaeKI', title: 'Gyökeres scissors shot', thumbnail: '/imgs/fifa/fifathumbnail.jpg' },
    { videoId: '6cDyxHRGFJg', title: 'Thuram scores out of the box', thumbnail: '/imgs/fifa/fifathumbnail.jpg' },
    { videoId: 'G3DRPDA_xQk', title: 'Lautaro right in the 9', thumbnail: '/imgs/fifa/fifathumbnail.jpg' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">EA FC 25 Cup</h1>
      <p className="text-basic text-gray-600 mb-8">IX season of online friendlies matches. First ever cross-platform tournament.</p>
      <h2 className="text-title font-bold mb-6">Standings</h2>
      <DataTable columns={columns} data={data} />

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Highlights</h2>
        <VideoGallery videos={highlights} />
      </section>
    </div>
  )
}