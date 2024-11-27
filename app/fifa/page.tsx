import Image from 'next/image'
import DataTable from '../../components/DataTable'
import prisma from '../../lib/prisma'
import VideoCarousel from '../../components/VideoCarousel'

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

const teamColors = {
  red: ['Liverpool', 'Bayern Munich', 'Inter', 'Bayer Leverkusen', 'Newcastle', 'AS Roma', 'Galatasaray', 'Sporting CP', 'SS Lazio', 'AS Monaco'],
  blue: ['Chelsea', 'Manchester City', 'Barcelona', 'Tottenham', 'Milan', 'Aston Villa', 'Athletic Bilbao', 'Manchester United', 'Benfica', 'Olympique Lyonnais'],
  green: ['Juventus', 'Real Madrid', 'Arsenal', 'Borussia Dortmund', 'PSG', 'Atletico Madrid', 'Napoli', 'RB Leipzig', 'Fenerbahçe', 'Al Hilal']
}

const getTeamColor = (team: string) => {
  if (teamColors.red.includes(team)) return '#ea7878'
  if (teamColors.blue.includes(team)) return '#4b98de'
  if (teamColors.green.includes(team)) return '#4fcb90'
  return 'transparent'
}

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
        <span className="relative">
          {entry.team}
          <span 
            className="absolute bottom-0 left-0 w-[0.85em] h-[2px]" 
            style={{ backgroundColor: getTeamColor(entry.team) }}
          />
        </span>
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
    hoverColor: getTeamColor(entry.team),
  }))

  const highlights = [
    { videoId: 'pXJHDQxF1IA', title: 'Gonçalves smooth finish', thumbnail: '/imgs/fifa/fifathumbnail.jpg', coverageText: 'GAME DAY 5' },
    { videoId: 'OAWMDmaf9Bk', title: 'Musiala did it again', thumbnail: '/imgs/fifa/fifathumbnail.jpg', coverageText: 'GAME DAY 2' },
    { videoId: 'yTEhQIjNgyM', title: 'Beautiful assist from Zaccagni', thumbnail: '/imgs/fifa/fifathumbnail.jpg', coverageText: 'GAME DAY 2' },
    { videoId: 'qYX6R6ITVCQ', title: 'Musiala long shot', thumbnail: '/imgs/fifa/fifathumbnail.jpg', coverageText: 'GAME DAY 2' },
    { videoId: 'MAdZDsPaeKI', title: 'Gyökeres scissors shot', thumbnail: '/imgs/fifa/fifathumbnail.jpg', coverageText: 'GAME DAY 1' },
    { videoId: '6cDyxHRGFJg', title: 'Thuram scores out of the box', thumbnail: '/imgs/fifa/fifathumbnail.jpg', coverageText: 'GAME DAY 1' },
    { videoId: 'G3DRPDA_xQk', title: 'Lautaro right in the nine', thumbnail: '/imgs/fifa/fifathumbnail.jpg', coverageText: 'GAME DAY 1' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">EA FC 25 Cup</h1>
      <p className="text-basic text-gray-600 mb-8">IX season of online friendlies matches. First ever cross-platform tournament.</p>
      <h2 className="text-title font-bold mb-6">Standings</h2>
      <DataTable columns={columns} data={data} />

      <section className="mt-12">
        <h2 className="text-title font-bold mb-6">Highlights</h2>
        <div className="px-12">
          <VideoCarousel videos={highlights} />
        </div>
      </section>
    </div>
  )
}