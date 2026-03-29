import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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

export async function GET() {
  try {
    const competition = await apiGet("/competitions/PL")
    const currentMatchday: number = competition.currentSeason.currentMatchday

    // Sync prev, current, and next gameweek
    const matchdays = [currentMatchday - 1, currentMatchday, currentMatchday + 1].filter(
      (d) => d >= 1 && d <= 38
    )

    let synced = 0
    for (const matchday of matchdays) {
      const data = await apiGet(`/competitions/PL/matches?season=2025&matchday=${matchday}`)
      for (const m of data.matches) {
        await prisma.plMatch.upsert({
          where: { matchId: m.id },
          update: {
            status: m.status,
            scoreHome: m.score.fullTime.home ?? null,
            scoreAway: m.score.fullTime.away ?? null,
          },
          create: {
            matchId: m.id,
            season: "2025/26",
            gameweek: m.matchday,
            homeTeam: m.homeTeam.shortName,
            awayTeam: m.awayTeam.shortName,
            kickoff: new Date(m.utcDate),
            status: m.status,
            scoreHome: m.score.fullTime.home ?? null,
            scoreAway: m.score.fullTime.away ?? null,
          },
        })
        synced++
      }
    }

    return NextResponse.json({ ok: true, synced, matchdays })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
