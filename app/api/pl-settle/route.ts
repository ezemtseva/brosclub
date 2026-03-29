import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

function calcPoints(betHome: number, betAway: number, matchHome: number, matchAway: number): number {
  if (betHome === matchHome && betAway === matchAway) return 3
  if (Math.sign(betHome - betAway) === Math.sign(matchHome - matchAway)) return 1
  return 0
}

export async function GET() {
  try {
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

    return NextResponse.json({ ok: true, settled })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
