import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const players = ["Vanilla", "Choco", "Panda"]

async function run() {
  const bets = await prisma.plBet.findMany({
    where: { points: { not: null } },
    include: { match: { select: { gameweek: true } } },
  })

  const gameweeks = Array.from(new Set(bets.map((b) => b.match.gameweek))).sort((a, b) => a - b)

  const gwPoints: Record<number, Record<string, number>> = {}
  for (const gw of gameweeks) {
    gwPoints[gw] = {}
    for (const player of players) {
      const pb = bets.filter((b) => b.player === player && b.match.gameweek === gw)
      gwPoints[gw][player] = pb.reduce((s, b) => s + (b.points ?? 0), 0)
    }
  }

  for (const gw of gameweeks) {
    const gwsUpTo = gameweeks.filter((g) => g <= gw)
    for (const player of players) {
      const games = gwsUpTo.length
      const points = gwsUpTo.reduce((s, g) => s + (gwPoints[g][player] ?? 0), 0)
      const wins = gwsUpTo.filter((g) => {
        const myPts = gwPoints[g][player] ?? 0
        return players.every((p) => p === player || (gwPoints[g][p] ?? 0) < myPts)
      }).length
      await prisma.betsEntry.upsert({
        where: { week_player: { week: gw, player } },
        update: { games, wins, points },
        create: { week: gw, player, games, wins, points },
      })
    }
  }

  const latest = Math.max(...gameweeks)
  const entries = await prisma.betsEntry.findMany({ where: { week: latest } })
  console.log(`GW ${latest} standings:`)
  entries
    .sort((a, b) => b.points - a.points)
    .forEach((e) => console.log(`${e.player} | games: ${e.games} | wins: ${e.wins} | points: ${e.points}`))

  await prisma.$disconnect()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
