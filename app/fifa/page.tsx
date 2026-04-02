import Image from "next/image"
import prisma from "../../lib/prisma"

export const dynamic = 'force-dynamic'
import FifaSeasonTabs from "../../components/FifaSeasonTabs"
import AutoRefresh from "../../components/AutoRefresh"
import { PLAYER_COLORS } from "../../lib/teamColors"

const columns = [
  { header: "#", accessor: "position" },
  { header: "Team", accessor: "team", width: "365px" },
  { header: "G", accessor: "games", width: "83px" },
  { header: "W", accessor: "wins", width: "83px" },
  { header: "D", accessor: "draws", width: "83px" },
  { header: "L", accessor: "losses", width: "83px" },
  { header: "GS", accessor: "goalsScored", width: "83px" },
  { header: "GC", accessor: "goalsConceded", width: "83px" },
  { header: "GD", accessor: "goalDifference", width: "83px" },
  { header: "P", accessor: "points", width: "83px" },
  { header: "Form", accessor: "form", width: "140px" },
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


const getTeamColor2024 = (team: string) => {
  if (teamColors2024.red.includes(team)) return PLAYER_COLORS.Vanilla
  if (teamColors2024.blue.includes(team)) return PLAYER_COLORS.Choco
  if (teamColors2024.green.includes(team)) return PLAYER_COLORS.Panda
  return "transparent"
}

type MatchRecord = { teamA: string; scoreA: number; teamB: string; scoreB: number }

function getTeamForm(team: string, matches: MatchRecord[]) {
  const results = matches
    .filter((m) => m.teamA === team || m.teamB === team)
    .slice(0, 5)
    .map((m) => {
      const scored = m.teamA === team ? m.scoreA : m.scoreB
      const conceded = m.teamA === team ? m.scoreB : m.scoreA
      const opponent = m.teamA === team ? m.teamB : m.teamA
      const result = scored > conceded ? "W" : scored === conceded ? "D" : "L"
      return { result, scored, conceded, opponent }
    })
  return (
    <div className="flex items-center gap-1">
      {results.map(({ result, scored, conceded, opponent }, i) => (
        <span key={i} className="relative group">
          <span
            className={`w-6 h-6 text-[11px] font-bold inline-flex items-center justify-center rounded text-white leading-none ${
              result === "W" ? "bg-green-500" : result === "D" ? "bg-gray-400" : "bg-red-400"
            }`}
          >
            {result}
          </span>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
            <span className="bg-gray-900 text-white text-[10px] font-medium rounded px-2 py-1 whitespace-nowrap">
              {scored}–{conceded} vs {opponent}
            </span>
            <span className="w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-1" />
          </span>
        </span>
      ))}
    </div>
  )
}

// Helper function to process FIFA data for 2025/26 season
function processFifaData2025(entries: any[], playerTeams: { Vanilla: string[]; Choco: string[]; Panda: string[] }, matches: MatchRecord[]) {
  const getColor = (team: string) => {
    for (const [player, teams] of Object.entries(playerTeams)) {
      if (teams.includes(team)) return PLAYER_COLORS[player] ?? "transparent"
    }
    return "transparent"
  }

  // Only show teams assigned to a player in setup
  const assignedTeams = new Set([...playerTeams.Vanilla, ...playerTeams.Choco, ...playerTeams.Panda])
  const filtered = assignedTeams.size > 0 ? entries.filter((e) => assignedTeams.has(e.team)) : entries

  return filtered
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
              style={{ backgroundColor: getColor(entry.team) }}
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
      form: getTeamForm(entry.team, matches),
      hoverColor: getColor(entry.team),
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

async function getPlayerTeams(season: string) {
  const rows = await prisma.fifaPlayerTeam.findMany({ where: { season } })
  const result: Record<string, string[]> = { Vanilla: [], Choco: [], Panda: [] }
  for (const row of rows) {
    if (result[row.player]) result[row.player].push(row.team)
  }
  return result as { Vanilla: string[]; Choco: string[]; Panda: string[] }
}

async function getMatches(season: string) {
  return prisma.fifaMatch.findMany({ where: { season }, orderBy: { createdAt: "desc" } })
}

export default async function FIFAPage() {
  // Fetch current season data (2025/26)
  const [currentEntries, historicalEntries, playerTeams, matches] = await Promise.all([
    getCurrentSeasonData(),
    getHistoricalSeasonData(),
    getPlayerTeams("2025/26"),
    getMatches("2025/26"),
  ])

  const teamNames = currentEntries.map((e: { team: string }) => e.team).sort()
  const teamLogos: Record<string, string> = Object.fromEntries(
    currentEntries.map((e: { team: string; logo: string }) => [e.team, e.logo || "/placeholder.svg"])
  )
  const currentSeasonData = processFifaData2025(currentEntries, playerTeams, matches)
  const historicalSeasonData = processFifaData2024(historicalEntries)

  // Current season highlights (2025/26) - update as new highlights happen
  const currentSeasonHighlights = [
    {
      videoId: "CrNcXFZkemY",
      title: "✯ Goal of the season - Phil Foden",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 3",
    },
    {
      videoId: "d-I7dNafuh0",
      title: "Musiala",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 12",
    },
    {
      videoId: "6XZblisC22U",
      title: "Nkunku",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 12",
    },
    {
      videoId: "OApK73E9VZ4",
      title: "El Shaarawy",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 12",
    },
    {
      videoId: "u_HfQ_F-XI8",
      title: "Kolo Muani",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 12",
    },
    {
      videoId: "2mF2EU3_3bs",
      title: "Livramento",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 12",
    },
    {
      videoId: "krlFFYu-378",
      title: "Woltemade",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 12",
    },
    {
      videoId: "Scr4UX7dwA4",
      title: "Doan",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 11",
    },
    {
      videoId: "jat3zbRe9CE",
      title: "Saka",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 11",
    },
    {
      videoId: "pIeumr4KXLw",
      title: "Griezman",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 10",
    },
    {
      videoId: "eHGkZN8Z1EY",
      title: "Musiala",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 10",
    },
    {
      videoId: "FFd09SG2TgU",
      title: "Griezman",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 10",
    },
    {
      videoId: "tWDeWiw7sqU",
      title: "Van Dijk",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 10",
    },
    {
      videoId: "rQAj5luT-Lk",
      title: "Williams",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 10",
    },
    {
      videoId: "XrtTPAG0Kgs",
      title: "Vanilović",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "CLUBS",
    },
    {
      videoId: "9LxJVl_4T8A",
      title: "Suarez",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 9",
    },
    {
      videoId: "aX9HdwA-jZ4",
      title: "Çalhanoğlu",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 9",
    },
    {
      videoId: "7dWzhy8EJBI",
      title: "Baena",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 9",
    },
    {
      videoId: "RLxsIJlEGJI",
      title: "Moleiro",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 9",
    },
    {
      videoId: "UAgJ0XgmnMc",
      title: "Larsson",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 8",
    },
    {
      videoId: "dN4RbubOEjY",
      title: "Amoura (Vavro)",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 8",
    },
    {
      videoId: "yn8Z2-jYEx0",
      title: "Suarez",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 7",
    },
    {
      videoId: "gg-2faNZ2ZA",
      title: "Torreira",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 7",
    },
    {
      videoId: "X4cc-WT-X84",
      title: "Dele-Bashiru",
      thumbnail: "/imgs/fifa/fifathumbnail26.jpg",
      coverageText: "GAME DAY 7",
    },
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
      videoId: "0JiK73BRZAo",
      title: "✯ Goal of the season - Jota",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "GAME DAY 17",
    },
    {
      videoId: "7NS6-JdeK60",
      title: "He's our number 20..",
      thumbnail: "/imgs/fifa/fifathumbnail.jpg",
      coverageText: "REST IN PEACE",
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
    <div className="container mx-auto px-3 py-2 md:px-4 md:py-4">
      <AutoRefresh intervalMs={30000} />
      <h1 className="text-title font-bold mb-4">EA FC Cup</h1>
      <p className="text-basic text-gray-600 mb-8">X anniversary season of pure hate, rage and hopelessness. Only for 80 euro annually.</p>

      <FifaSeasonTabs
        currentSeasonData={currentSeasonData}
        currentSeasonHighlights={currentSeasonHighlights}
        historicalSeasonData={historicalSeasonData}
        historicalSeasonHighlights={historicalSeasonHighlights}
        columns={columns}
        teamNames={teamNames}
        playerTeams={playerTeams}
        matches={matches.map((m: { id: number; season: string; teamA: string; scoreA: number; teamB: string; scoreB: number; createdAt: Date }) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
        teamLogos={teamLogos}
      />
    </div>
  )
}
