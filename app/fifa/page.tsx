import Image from "next/image"
import prisma from "../../lib/prisma"
import FifaSeasonTabs from "../../components/FifaSeasonTabs"

const columns = [
  { header: "#", accessor: "position" },
  { header: "Team", accessor: "team" },
  { header: "G", accessor: "games" },
  { header: "W", accessor: "wins" },
  { header: "D", accessor: "draws" },
  { header: "L", accessor: "losses" },
  { header: "GS", accessor: "goalsScored" },
  { header: "GC", accessor: "goalsConceded" },
  { header: "GD", accessor: "goalDifference" },
  { header: "P", accessor: "points" },
]

// Team colors for 2024/25 season (historical - DO NOT CHANGE)
const teamColors2024 = {
  red: [
    "Liverpool",
    "Bayern Munich",
    "Inter",
    "Bayer Leverkusen",
    "Newcastle",
    "AS Roma",
    "Galatasaray",
    "Sporting CP",
    "SS Lazio",
    "AS Monaco",
  ],
  blue: [
    "Chelsea",
    "Manchester City",
    "Barcelona",
    "Tottenham",
    "Milan",
    "Aston Villa",
    "Athletic Bilbao",
    "Manchester United",
    "Benfica",
    "Olympique Lyonnais",
  ],
  green: [
    "Juventus",
    "Real Madrid",
    "Arsenal",
    "Borussia Dortmund",
    "PSG",
    "Atletico Madrid",
    "Napoli",
    "RB Leipzig",
    "Fenerbahçe",
    "Al Hilal",
  ],
}

// Team colors for 2025/26 season (NEW)
const teamColors2025 = {
  red: [
    "Liverpool",
    "Real Betis",
    "AS Roma",
    "RB Leipzig",
    "Arsenal",
    "Atletico Madrid",
    "Borussia Dortmund",
    "Marseille",
    "Sporting CP",
    "Bayer Leverkusen",
  ],
  blue: [
    "Villarreal",
    "Chelsea",
    "SS Lazio",
    "PSG",
    "Barcelona",
    "Inter",
    "Milan",
    "Manchester United",
    "Galatasaray",
    "Wolfsburg",
  ],
  green: [
    "Juventus",
    "Tottenham",
    "Newcastle",
    "Napoli",
    "Athletic Bilbao",
    "Aston Villa",
    "Real Madrid",
    "Bayern Munich",
    "Manchester City",
    "Nottingham Forrest",
  ],
}

const getTeamColor2024 = (team: string) => {
  if (teamColors2024.red.includes(team)) return "#ea7878"
  if (teamColors2024.blue.includes(team)) return "#4b98de"
  if (teamColors2024.green.includes(team)) return "#4fcb90"
  return "transparent"
}

const getTeamColor2025 = (team: string) => {
  if (teamColors2025.red.includes(team)) return "#ea7878"
  if (teamColors2025.blue.includes(team)) return "#4b98de"
  if (teamColors2025.green.includes(team)) return "#4fcb90"
  return "transparent"
}

// Helper function to process FIFA data for 2025/26 season
function processFifaData2025(entries: any[]) {
  return entries
    .map((entry) => ({
      ...entry,
      goalDifference: entry.goalsScored - entry.goalsConceded,
      points: entry.wins * 3 + entry.draws,
    }))
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
    .map((entry, index) => ({
      position: index + 1,
      team: (
        <div className="flex items-center space-x-2">
          <Image
            src={entry.logo || "/placeholder.svg"}
            alt={entry.team}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="relative">
            {entry.team}
            <span
              className="absolute bottom-0 left-0 w-[0.85em] h-[2px]"
              style={{ backgroundColor: getTeamColor2025(entry.team) }}
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
      hoverColor: getTeamColor2025(entry.team),
      className: index === 0 ? "bg-amber-50" : undefined,
    }))
}

// Helper function to process FIFA data for 2024/25 season
function processFifaData2024(entries: any[]) {
  return entries
    .map((entry) => ({
      ...entry,
      goalDifference: entry.goalsScored - entry.goalsConceded,
      points: entry.wins * 3 + entry.draws,
    }))
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
    .map((entry, index) => ({
      position: index + 1,
      team: (
        <div className="flex items-center space-x-2">
          <Image
            src={entry.logo || "/placeholder.svg"}
            alt={entry.team}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="relative">
            {entry.team}
            <span
              className="absolute bottom-0 left-0 w-[0.85em] h-[2px]"
              style={{ backgroundColor: getTeamColor2024(entry.team) }}
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
      hoverColor: getTeamColor2024(entry.team),
      className: index === 0 ? "bg-amber-50" : undefined,
    }))
}

async function getCurrentSeasonData() {
  const entries = await prisma.fifaEntry.findMany()
  return entries
}

async function getHistoricalSeasonData() {
  try {
    const entries = await (prisma as any).fifaEntry2024.findMany()
    return entries
  } catch (error) {
    console.error("Error fetching historical FIFA data:", error)
    return []
  }
}

export default async function FIFAPage() {
  // Fetch current season data (2025/26)
  const currentEntries = await getCurrentSeasonData()
  const currentSeasonData = processFifaData2025(currentEntries)

  // Fetch historical season data (2024/25)
  const historicalEntries = await getHistoricalSeasonData()
  const historicalSeasonData = processFifaData2024(historicalEntries)

  // Current season highlights (2025/26) - update as new highlights happen
  const currentSeasonHighlights = [
    {
      videoId: "91wyYRDJS38",
      title: "Julian Brandt",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 6",
    },
    {
      videoId: "5RT6rg4cUuo",
      title: "Viktor Gyökeres",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 5",
    },
    {
      videoId: "f1E3HbJxfws",
      title: "Julian Alvarez",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 4",
    },
    {
      videoId: "uSmtmNA8s50",
      title: "Pedro Neto",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 4",
    },
    {
      videoId: "CrNcXFZkemY",
      title: "Goal of the year - Phil Foden",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 3",
    },
    {
      videoId: "Tc5to_xuEp0",
      title: "Paulo Dybala",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 2",
    },
    {
      videoId: "i3CyZ4H8k14",
      title: "Kevin De Bruyne",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 2",
    },
    {
      videoId: "yMJbOuHDdPU",
      title: "Cucho Mala!",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 1",
    },
    {
      videoId: "-M71Et4iObU",
      title: "Pierre-Emile  Højbjerg!",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 1",
    },
    {
      videoId: "KnGlx-oMB4Y",
      title: "Wilfried Singo",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 1",
    },
    // Add more current season videos as they happen
  ]

  // Historical season highlights (2024/25)
  const historicalSeasonHighlights = [
    {
      videoId: "7NS6-JdeK60",
      title: "He's our number 20..",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "REST IN PEACE",
    },
    {
      videoId: "caPxV7oCJxA",
      title: "Amiak Karbromid at its finest",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "CLUBS",
    },
    {
      videoId: "csD8h1kda6o",
      title: "One touch shot from Mbappe",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 21",
    },
    {
      videoId: "LTVrP3TvDyk",
      title: "Choco - the king of free kicks",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 21",
    },
    {
      videoId: "6ncbObTMXSk",
      title: "The canonball from Salah",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 20",
    },
    {
      videoId: "CjjLHixprVM",
      title: "Beautiful finish from Adeyemi",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 20",
    },
    {
      videoId: "39evDXu--Xc",
      title: "Royal build-up from Real Madrid",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 19",
    },
    {
      videoId: "s5SPfN5n6ao",
      title: "One touch chip from Boniface",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 18",
    },
    {
      videoId: "lFU_IxBGjOg",
      title: "Wirtz did it smooth",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 18",
    },
    {
      videoId: "tw18MAFGJ4E",
      title: "Wiiiiii from Weeeeaaaah",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 17",
    },
    {
      videoId: "oXzSTLHYQ3w",
      title: "Smooth operator Isak",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 17",
    },
    {
      videoId: "0JiK73BRZAo",
      title: "Crazy corner finish from Jota",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 17",
    },
    {
      videoId: "X04yK_xIiAA",
      title: "Deja-vue goal from Szoboszlai",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 17",
    },
    {
      videoId: "TQm9V-hoVbg",
      title: "Beauty from Openga",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 16",
    },
    {
      videoId: "O6ZMEraVZKM",
      title: "Van de Ven scissirs",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 16",
    },
    {
      videoId: "mOg5XlIHeUo",
      title: "Surprise-surprise from Timo Werner",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 15",
    },
    {
      videoId: "szr6l12D6es",
      title: "Magic from Liverpool",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 14",
    },
    {
      videoId: "Wmej-0Stsjs",
      title: "Brilliant pass!",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 12",
    },
    {
      videoId: "gSMHK41YwrI",
      title: "Crazy scissors right to the 9",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 11",
    },
    {
      videoId: "IJye7gKwcvo",
      title: "What a header!",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 11",
    },
    {
      videoId: "emHY6c2E2U0",
      title: "Big ass goal",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 9",
    },
    {
      videoId: "5xjIm5-GyGI",
      title: "Thats why we love FIFA, right?",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 9",
    },
    {
      videoId: "CKwdP6IPrCw",
      title: "Smooth operator Vlahović",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 9",
    },
    {
      videoId: "LZt5vbBoAqY",
      title: "Marata-Morata scissors!",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 9",
    },
    {
      videoId: "piylDb5uj3s",
      title: "Flawless curve from Cherki",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 7",
    },
    {
      videoId: "s3g0RVD8OFg",
      title: "Simple magic from Salah",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 7",
    },
    {
      videoId: "8Laa6qgNW_Q",
      title: "Almiron right in the nine",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 7",
    },
    {
      videoId: "0nhw_IeN-QM",
      title: "Crazy long distance shot by Calabria",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 7",
    },
    {
      videoId: "stmM4vE4mJw",
      title: "Wilson from the crossbar",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 6",
    },
    {
      videoId: "b3f66F0NDow",
      title: "A rocket shot by Ramsey",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 6",
    },
    {
      videoId: "pXJHDQxF1IA",
      title: "Gonçalves smooth finish",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 5",
    },
    {
      videoId: "OAWMDmaf9Bk",
      title: "Musiala did it again",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 2",
    },
    {
      videoId: "yTEhQIjNgyM",
      title: "Beautiful assist from Zaccagni",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 2",
    },
    {
      videoId: "qYX6R6ITVCQ",
      title: "Musiala long shot",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 2",
    },
    {
      videoId: "MAdZDsPaeKI",
      title: "Gyökeres scissors shot",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 1",
    },
    {
      videoId: "6cDyxHRGFJg",
      title: "Thuram scores out of the box",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 1",
    },
    {
      videoId: "G3DRPDA_xQk",
      title: "Lautaro right in the nine",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 1",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">EA FC Cup</h1>
      <p className="text-basic text-gray-600 mb-8">X anniversary season of pure hate, rage and hopelessness. Only for 80 euro annually.</p>

      <FifaSeasonTabs
        currentSeasonData={currentSeasonData}
        currentSeasonHighlights={currentSeasonHighlights}
        historicalSeasonData={historicalSeasonData}
        historicalSeasonHighlights={historicalSeasonHighlights}
        columns={columns}
      />
    </div>
  )
}
