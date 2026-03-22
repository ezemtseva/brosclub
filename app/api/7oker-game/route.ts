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
  const allEntries = await (prisma as any).sevenOkerEntry.findMany({
    orderBy: { week: "desc" },
  })

  const latestWeek: number = allEntries.length > 0 ? allEntries[0].week : 0
  const latestEntries = allEntries.filter((e: any) => e.week === latestWeek)

  const currentTotals: Record<string, { games: number; wins: number; points: number; gamepoints: number }> = {}
  for (const player of PLAYERS) {
    const entry = latestEntries.find((e: any) => e.bearo === player)
    currentTotals[player] = {
      games: entry?.games ?? 0,
      wins: entry?.wins ?? 0,
      points: entry?.points ?? 0,
      gamepoints: entry?.gamepoints ?? 0,
    }
  }

  // Rank players by score descending — higher score = better placement
  const ranked = [...PLAYERS].sort((a, b) => scores[b] - scores[a])
  const pointsMap: Record<number, number> = { 1: 3, 2: 1, 3: 0 }

  await (prisma as any).sevenOkerEntry.createMany({
    data: ranked.map((player, idx) => {
      const place = idx + 1
      const current = currentTotals[player]
      return {
        week: latestWeek + 1,
        bearo: player,
        games: current.games + 1,
        wins: current.wins + (place === 1 ? 1 : 0),
        points: current.points + pointsMap[place],
        gamepoints: current.gamepoints + scores[player],
      }
    }),
  })

  return Response.json({ success: true })
}
