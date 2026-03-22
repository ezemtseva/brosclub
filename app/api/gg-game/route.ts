import prisma from "../../../lib/prisma"

const PLAYERS = ["Panda", "Choco", "Vanilla"]

export async function POST(request: Request) {
  const body = await request.json()
  const { points, fiveK } = body

  for (const player of PLAYERS) {
    if (typeof points[player] !== "number" || isNaN(points[player])) {
      return Response.json({ error: "Invalid points" }, { status: 400 })
    }
    if (typeof fiveK[player] !== "number" || isNaN(fiveK[player]) || fiveK[player] < 0) {
      return Response.json({ error: "Invalid 5K values" }, { status: 400 })
    }
  }

  // Get latest cumulative entries
  const allEntries = await prisma.ggEntry.findMany({
    orderBy: { week: "desc" },
  })

  const latestWeek: number = allEntries.length > 0 ? allEntries[0].week : 0
  const latestEntries = allEntries.filter((e) => e.week === latestWeek)

  const currentTotals: Record<string, { games: number; wins: number; fiveK: number; points: number }> = {}
  for (const player of PLAYERS) {
    const entry = latestEntries.find((e) => e.player === player)
    currentTotals[player] = {
      games: entry?.games ?? 0,
      wins: entry?.wins ?? 0,
      fiveK: entry?.fiveK ?? 0,
      points: entry?.points ?? 0,
    }
  }

  const maxPoints = Math.max(...PLAYERS.map((p) => points[p]))

  await prisma.ggEntry.createMany({
    data: PLAYERS.map((player) => {
      const current = currentTotals[player]
      return {
        week: latestWeek + 1,
        player,
        games: current.games + 1,
        wins: current.wins + (points[player] === maxPoints ? 1 : 0),
        fiveK: current.fiveK + fiveK[player],
        points: current.points + points[player],
      }
    }),
  })

  return Response.json({ success: true })
}
