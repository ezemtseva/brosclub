import prisma from "./prisma"

function calcPoints(betHome: number, betAway: number, matchHome: number, matchAway: number): number {
  if (betHome === matchHome && betAway === matchAway) {
    const bonus = matchHome + matchAway >= 4 ? 1 : 0
    return 3 + bonus
  }
  if (Math.sign(betHome - betAway) === Math.sign(matchHome - matchAway)) return 1
  return 0
}

async function recalculateBetsEntry() {
  const players = ["Vanilla", "Choco", "Panda"]

  const bets = await prisma.plBet.findMany({
    where: { points: { not: null } },
    include: { match: { select: { gameweek: true } } },
    orderBy: { match: { gameweek: "asc" } },
  })

  const gameweeks = Array.from(new Set(bets.map((b) => b.match.gameweek))).sort((a, b) => a - b)

  // Find gameweeks that still have unfinished matches
  const unfinishedMatches = await prisma.plMatch.findMany({
    where: { season: "2025/26", gameweek: { in: gameweeks }, status: { notIn: ["FINISHED", "POSTPONED"] } },
    select: { gameweek: true },
  })
  const gwsWithUnfinished = new Set(unfinishedMatches.map((m) => m.gameweek))

  // Points scored by each player per gameweek
  const gwPoints: Record<number, Record<string, number>> = {}
  for (const gw of gameweeks) {
    gwPoints[gw] = {}
    for (const player of players) {
      const playerBets = bets.filter((b) => b.player === player && b.match.gameweek === gw)
      gwPoints[gw][player] = playerBets.reduce((sum, b) => sum + (b.points ?? 0), 0)
    }
  }

  for (const gw of gameweeks) {
    const gwsUpTo = gameweeks.filter((g) => g <= gw)

    for (const player of players) {
      const games = gwsUpTo.length
      const points = gwsUpTo.reduce((sum, g) => sum + (gwPoints[g][player] ?? 0), 0)

      // wins = GWs where all matches finished AND this player scored strictly more than all others
      const wins = gwsUpTo.filter((g) => {
        if (gwsWithUnfinished.has(g)) return false
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
}

export async function settleAndRecalculate(): Promise<number> {
  // Quick check — exit early if nothing to settle
  const hasUnsettled = await prisma.plBet.findFirst({
    where: { points: null, match: { status: "FINISHED" } },
  })
  if (!hasUnsettled) return 0

  // Find finished matches with unsettled bets
  const matches = await prisma.plMatch.findMany({
    where: {
      status: "FINISHED",
      scoreHome: { not: null },
      scoreAway: { not: null },
      bets: { some: { points: null } },
    },
    include: { bets: true },
  })

  let settled = 0
  for (const match of matches) {
    if (match.scoreHome === null || match.scoreAway === null) continue
    for (const bet of match.bets) {
      if (bet.points !== null) continue
      const points = calcPoints(bet.scoreHome, bet.scoreAway, match.scoreHome, match.scoreAway)
      await prisma.plBet.update({ where: { id: bet.id }, data: { points } })
      settled++
    }
  }

  if (settled > 0) {
    await recalculateBetsEntry()
  }

  return settled
}
