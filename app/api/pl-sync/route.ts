import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { settleAndRecalculate } from "@/lib/pl-settle"

const API_KEY = process.env.FOOTBALL_DATA_API_KEY!
const BASE_URL = "https://api.football-data.org/v4"

async function apiGet(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": API_KEY },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`football-data API ${res.status}: ${await res.text()}`)
  return res.json()
}

async function upsertMatch(m: any) {
  const startYear = new Date(m.season.startDate).getFullYear()
  const endYear = new Date(m.season.endDate).getFullYear()
  const season = `${startYear}/${String(endYear).slice(2)}`

  await prisma.plMatch.upsert({
    where: { matchId: m.id },
    update: {
      status: m.status,
      scoreHome: m.score.fullTime.home ?? null,
      scoreAway: m.score.fullTime.away ?? null,
      homeCrest: m.homeTeam.crest ?? null,
      awayCrest: m.awayTeam.crest ?? null,
    },
    create: {
      matchId: m.id,
      season,
      gameweek: m.matchday,
      homeTeam: m.homeTeam.shortName,
      awayTeam: m.awayTeam.shortName,
      homeCrest: m.homeTeam.crest ?? null,
      awayCrest: m.awayTeam.crest ?? null,
      kickoff: new Date(m.utcDate),
      status: m.status,
      scoreHome: m.score.fullTime.home ?? null,
      scoreAway: m.score.fullTime.away ?? null,
    },
  })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const full = searchParams.get("full") === "true"

  try {
    let synced = 0

    if (full) {
      // Fetch all 380 matches for the season in one request
      const data = await apiGet("/competitions/PL/matches?season=2025")
      for (const m of data.matches) {
        await upsertMatch(m)
        synced++
      }
      const settled = await settleAndRecalculate()
      return NextResponse.json({ ok: true, synced, settled, mode: "full" })
    } else {
      // Daily cron: sync current ±1 gameweek only
      const competition = await apiGet("/competitions/PL")
      const currentMatchday: number = competition.currentSeason.currentMatchday
      const matchdays = [currentMatchday - 1, currentMatchday, currentMatchday + 1].filter(
        (d) => d >= 1 && d <= 38
      )
      for (const matchday of matchdays) {
        const data = await apiGet(`/competitions/PL/matches?season=2025&matchday=${matchday}`)
        for (const m of data.matches) {
          await upsertMatch(m)
          synced++
        }
      }
      const settled = await settleAndRecalculate()
      return NextResponse.json({ ok: true, synced, settled, mode: "partial", matchdays })
    }
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
