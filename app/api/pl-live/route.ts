import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { settleAndRecalculate } from "@/lib/pl-settle"

const API_KEY = process.env.FOOTBALL_DATA_API_KEY!

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const now = new Date()
    const dateFrom = searchParams.get("from") ?? new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const dateTo = searchParams.get("to") ?? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const res = await fetch(
      `https://api.football-data.org/v4/matches?competitions=PL&dateFrom=${dateFrom}&dateTo=${dateTo}`,
      { headers: { "X-Auth-Token": API_KEY }, cache: "no-store" }
    )
    if (!res.ok) throw new Error(`football-data API ${res.status}`)
    const data = await res.json()

    let updated = 0

    for (const m of data.matches) {
      const scoreHome = m.score?.fullTime?.home ?? null
      const scoreAway = m.score?.fullTime?.away ?? null

      // Only update score fields when we have actual values (FINISHED),
      // otherwise just update status to avoid overwriting real scores with null
      const updateData = scoreHome !== null && scoreAway !== null
        ? { status: m.status, scoreHome, scoreAway }
        : { status: m.status }

      const result = await prisma.plMatch.updateMany({
        where: {
          matchId: m.id,
          // Don't overwrite FINISHED matches that already have a score (may be manually corrected)
          OR: [{ status: { not: "FINISHED" } }, { scoreHome: null }],
        },
        data: updateData,
      })
      if (result.count > 0) updated++
    }

    const settled = await settleAndRecalculate()
    return NextResponse.json({ ok: true, updated, settled, apiCount: data.matches.length })
  } catch (e) {
    console.error("[pl-live]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
