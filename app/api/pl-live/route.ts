import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { settleAndRecalculate } from "@/lib/pl-settle"
import { CURRENT_PL_SEASON } from "@/lib/plSeason"

// Live scores from the FPL API — the same source /api/pl-sync uses. Called every
// minute by the gameweek table while matches are in progress.

const FPL_BASE = "https://fantasy.premierleague.com/api"

type FplFixture = {
  id: number
  event: number | null
  finished: boolean
  started: boolean | null
  team_h_score: number | null
  team_a_score: number | null
}

function statusOf(fixture: FplFixture) {
  if (fixture.event === null) return "POSTPONED"
  if (fixture.finished) return "FINISHED"
  if (fixture.started) return "IN_PLAY"
  return "SCHEDULED"
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const gameweekParam = searchParams.get("gameweek")

    // Default to the gameweeks that actually have matches around now, so a single
    // call covers whatever is live without pulling all 380 fixtures.
    let gameweeks: number[]
    if (gameweekParam) {
      gameweeks = [parseInt(gameweekParam)]
    } else {
      const now = new Date()
      const nearby = await prisma.plMatch.findMany({
        where: {
          season: CURRENT_PL_SEASON,
          status: { notIn: ["FINISHED", "POSTPONED"] },
          kickoff: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            lte: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        select: { gameweek: true },
        distinct: ["gameweek"],
      })
      gameweeks = nearby.map((m) => m.gameweek)
    }

    if (gameweeks.length === 0) {
      return NextResponse.json({ ok: true, updated: 0, settled: 0, gameweeks })
    }

    const responses = await Promise.all(
      gameweeks.map(async (gw) => {
        const res = await fetch(`${FPL_BASE}/fixtures/?event=${gw}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`FPL fixtures GW${gw} → ${res.status}`)
        return res.json() as Promise<FplFixture[]>
      })
    )
    const fixtures = responses.flat()

    let updated = 0
    for (const fixture of fixtures) {
      const hasScore = fixture.team_h_score !== null && fixture.team_a_score !== null

      const result = await prisma.plMatch.updateMany({
        where: {
          matchId: fixture.id,
          // Never touch a finished match that already has a score — it may have
          // been corrected by hand
          OR: [{ status: { not: "FINISHED" } }, { scoreHome: null }],
        },
        data: hasScore
          ? { status: statusOf(fixture), scoreHome: fixture.team_h_score, scoreAway: fixture.team_a_score }
          : { status: statusOf(fixture) },
      })
      if (result.count > 0) updated++
    }

    const settled = await settleAndRecalculate()
    return NextResponse.json({ ok: true, updated, settled, gameweeks, fixtures: fixtures.length })
  } catch (e) {
    console.error("[pl-live]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
