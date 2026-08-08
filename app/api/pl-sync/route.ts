import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { settleAndRecalculate } from "@/lib/pl-settle"

// ── Primary source: the public FPL API (no key, and we already use it for the
// FPL cup). football-data.org is kept as a fallback via ?source=football-data
// because it stopped returning the current season.

const FPL_BASE = "https://fantasy.premierleague.com/api"
const FD_BASE = "https://api.football-data.org/v4"
const FD_API_KEY = process.env.FOOTBALL_DATA_API_KEY

type FplTeam = { id: number; name: string; code: number }

type FplFixture = {
  id: number
  event: number | null
  finished: boolean
  started: boolean | null
  kickoff_time: string | null
  team_h: number
  team_a: number
  team_h_score: number | null
  team_a_score: number | null
}

type FplEvent = { id: number; deadline_time: string; is_current: boolean; is_next: boolean }

async function getJson(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers, cache: "no-store" })
  if (!res.ok) throw new Error(`${url} → ${res.status}: ${await res.text()}`)
  return res.json()
}

/** FPL gives no crest URLs, but the official badge is addressable by team code. */
function crestFor(team: FplTeam | undefined) {
  return team ? `https://resources.premierleague.com/premierleague/badges/70/t${team.code}.png` : null
}

/** FPL has no status field — derive it from the two flags it does have. */
function statusOf(fixture: FplFixture) {
  if (fixture.finished) return "FINISHED"
  if (fixture.started) return "IN_PLAY"
  return "SCHEDULED"
}

/** "2026/27" from the first gameweek deadline. */
function seasonFrom(events: FplEvent[]) {
  const first = events.slice().sort((a, b) => a.deadline_time.localeCompare(b.deadline_time))[0]
  const startYear = new Date(first?.deadline_time ?? Date.now()).getFullYear()
  return `${startYear}/${String(startYear + 1).slice(2)}`
}

async function upsertFixture(fixture: FplFixture, teams: Map<number, FplTeam>, season: string) {
  const home = teams.get(fixture.team_h)
  const away = teams.get(fixture.team_a)
  if (!home || !away) return false

  const existing = await prisma.plMatch.findUnique({
    where: { matchId: fixture.id },
    select: { status: true, scoreHome: true, gameweek: true },
  })

  // Never overwrite a finished match that already has a score — feeds can go stale
  if (existing?.status === "FINISHED" && existing.scoreHome !== null) return false

  // A postponed fixture loses its gameweek in the FPL feed
  const postponed = fixture.event === null
  const gameweek = fixture.event ?? existing?.gameweek
  if (gameweek === undefined) return false

  const status = postponed ? "POSTPONED" : statusOf(fixture)
  const hasScore = fixture.team_h_score !== null && fixture.team_a_score !== null
  const kickoff = fixture.kickoff_time ? new Date(fixture.kickoff_time) : new Date()

  await prisma.plMatch.upsert({
    where: { matchId: fixture.id },
    update: {
      status,
      gameweek,
      kickoff,
      homeCrest: crestFor(home),
      awayCrest: crestFor(away),
      ...(hasScore ? { scoreHome: fixture.team_h_score, scoreAway: fixture.team_a_score } : {}),
    },
    create: {
      matchId: fixture.id,
      season,
      gameweek,
      homeTeam: home.name,
      awayTeam: away.name,
      homeCrest: crestFor(home),
      awayCrest: crestFor(away),
      kickoff,
      status,
      scoreHome: fixture.team_h_score,
      scoreAway: fixture.team_a_score,
    },
  })
  return true
}

async function syncFromFpl(full: boolean) {
  const bootstrap = await getJson(`${FPL_BASE}/bootstrap-static/`)
  const teams = new Map<number, FplTeam>((bootstrap.teams as FplTeam[]).map((t) => [t.id, t]))
  const events = bootstrap.events as FplEvent[]
  const season = seasonFrom(events)

  let fixtures: FplFixture[]
  let gameweeks: number[] | undefined

  if (full) {
    fixtures = await getJson(`${FPL_BASE}/fixtures/`)
  } else {
    // Daily cron: current gameweek ±1 is enough
    const current = events.find((e) => e.is_current)?.id ?? events.find((e) => e.is_next)?.id ?? 1
    gameweeks = [current - 1, current, current + 1].filter((gw) => gw >= 1 && gw <= events.length)
    const perGameweek = await Promise.all(
      gameweeks.map((gw) => getJson(`${FPL_BASE}/fixtures/?event=${gw}`) as Promise<FplFixture[]>)
    )
    fixtures = perGameweek.flat()
  }

  let synced = 0
  for (const fixture of fixtures) {
    if (await upsertFixture(fixture, teams, season)) synced++
  }

  return { synced, season, gameweeks, total: fixtures.length }
}

// ── Fallback: football-data.org ──────────────────────────────────────────────

async function fdGet(path: string) {
  if (!FD_API_KEY) throw new Error("FOOTBALL_DATA_API_KEY is not set")
  return getJson(`${FD_BASE}${path}`, { "X-Auth-Token": FD_API_KEY })
}

async function upsertFdMatch(m: any) {
  const startYear = new Date(m.season.startDate).getFullYear()
  const season = `${startYear}/${String(new Date(m.season.endDate).getFullYear()).slice(2)}`

  const scoreHome = m.score?.fullTime?.home ?? null
  const scoreAway = m.score?.fullTime?.away ?? null

  const existing = await prisma.plMatch.findUnique({
    where: { matchId: m.id },
    select: { status: true, scoreHome: true },
  })
  if (existing?.status === "FINISHED" && existing.scoreHome !== null) return

  await prisma.plMatch.upsert({
    where: { matchId: m.id },
    update: {
      status: m.status,
      kickoff: new Date(m.utcDate),
      homeCrest: m.homeTeam.crest ?? null,
      awayCrest: m.awayTeam.crest ?? null,
      ...(scoreHome !== null && scoreAway !== null ? { scoreHome, scoreAway } : {}),
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
      scoreHome,
      scoreAway,
    },
  })
}

async function syncFromFootballData(full: boolean, seasonStartYear: string) {
  let synced = 0

  if (full) {
    const data = await fdGet(`/competitions/PL/matches?season=${seasonStartYear}`)
    for (const m of data.matches) {
      await upsertFdMatch(m)
      synced++
    }
    return { synced, gameweeks: undefined }
  }

  const competition = await fdGet("/competitions/PL")
  const current: number = competition.currentSeason?.currentMatchday
  if (!current) throw new Error("football-data returned no currentMatchday")

  const gameweeks = [current - 1, current, current + 1].filter((d) => d >= 1 && d <= 38)
  for (const gameweek of gameweeks) {
    const data = await fdGet(`/competitions/PL/matches?season=${seasonStartYear}&matchday=${gameweek}`)
    for (const m of data.matches) {
      await upsertFdMatch(m)
      synced++
    }
  }
  return { synced, gameweeks }
}

// GET /api/pl-sync                       — current gameweek ±1 from FPL
// GET /api/pl-sync?full=true             — the whole season from FPL
// GET /api/pl-sync?source=football-data  — fallback source (&season=2026)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const full = searchParams.get("full") === "true"
  const source = searchParams.get("source") ?? "fpl"

  try {
    if (source === "football-data") {
      const seasonStartYear = searchParams.get("season") ?? "2026"
      const { synced, gameweeks } = await syncFromFootballData(full, seasonStartYear)
      const settled = await settleAndRecalculate()
      return NextResponse.json({
        ok: true,
        source,
        mode: full ? "full" : "partial",
        synced,
        gameweeks,
        settled,
      })
    }

    const { synced, season, gameweeks, total } = await syncFromFpl(full)
    const settled = await settleAndRecalculate()
    return NextResponse.json({
      ok: true,
      source: "fpl",
      mode: full ? "full" : "partial",
      season,
      synced,
      skipped: total - synced,
      gameweeks,
      settled,
    })
  } catch (e) {
    console.error("[pl-sync]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
