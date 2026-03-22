import prisma from "../../../lib/prisma"

const PLAYERS = ["Panda", "Choco", "Vanilla"]

export async function POST(request: Request) {
  const body = await request.json()
  const { scores } = body

  for (const player of PLAYERS) {
    if (typeof scores[player] !== "number" || isNaN(scores[player])) {
      return Response.json({ error: "Invalid scores" }, { status: 400 })
    }
  }

  // Get latest cumulative entries
  const allEntries = await prisma.betsEntry.findMany({
    orderBy: { week: "desc" },
  })

  const latestWeek: number = allEntries.length > 0 ? allEntries[0].week : 0
  const latestEntries = allEntries.filter((e) => e.week === latestWeek)

  const currentTotals: Record<string, { games: number; wins: number; points: number }> = {}
  for (const player of PLAYERS) {
    const entry = latestEntries.find((e) => e.player === player)
    currentTotals[player] = {
      games: entry?.games ?? 0,
      wins: entry?.wins ?? 0,
      points: entry?.points ?? 0,
    }
  }

  const maxScore = Math.max(...PLAYERS.map((p) => scores[p]))

  await prisma.betsEntry.createMany({
    data: PLAYERS.map((player) => {
      const current = currentTotals[player]
      return {
        week: latestWeek + 1,
        player,
        games: current.games + 1,
        wins: current.wins + (scores[player] === maxScore ? 1 : 0),
        points: current.points + scores[player],
      }
    }),
  })

  return Response.json({ success: true })
}
