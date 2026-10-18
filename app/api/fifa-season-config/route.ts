import prisma from "../../../lib/prisma"

const PLAYERS = ["Vanilla", "Choco", "Panda"]

const emptyTeams = (): Record<string, string[]> => ({ Vanilla: [], Choco: [], Panda: [] })

/** A team returning from an earlier season should come back with its crest. */
async function logoFromArchive(team: string): Promise<string> {
  for (const model of ["fifaEntry2526", "fifaEntry2024"] as const) {
    try {
      const row = await (prisma as any)[model].findFirst({ where: { team }, select: { logo: true } })
      if (row?.logo) return row.logo
    } catch {
      // archive table may not exist yet — fall through to the placeholder
    }
  }
  return "/placeholder.svg"
}

// GET /api/fifa-season-config?season=2025/26
// Returns { round1, round2 } — round2 is the subset of round 1 teams that advanced.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const season = searchParams.get("season") || "2025/26"

  const rows = await prisma.fifaPlayerTeam.findMany({ where: { season } })

  const round1 = emptyTeams()
  const round2 = emptyTeams()
  for (const row of rows) {
    if (!round1[row.player]) continue
    round1[row.player].push(row.team)
    if (row.round2) round2[row.player].push(row.team)
  }

  return Response.json({ round1, round2 })
}

// POST /api/fifa-season-config
// Body: { season, player, team, action: "add" | "remove" }
//       { season, team, action: "round2", include: boolean }
export async function POST(request: Request) {
  const { season, player, team, action, include, logo } = await request.json()

  if (!season || !team || !["add", "remove", "round2"].includes(action)) {
    return Response.json({ error: "Invalid body" }, { status: 400 })
  }

  if (action === "round2") {
    // Round 2 only flags an existing round 1 row — it never creates or reassigns.
    const updated = await prisma.fifaPlayerTeam.updateMany({
      where: { season, team },
      data: { round2: Boolean(include) },
    })
    if (updated.count === 0) {
      return Response.json({ error: "Team is not in round 1" }, { status: 404 })
    }
    return Response.json({ success: true })
  }

  if (!player || !PLAYERS.includes(player)) {
    return Response.json({ error: "Unknown player" }, { status: 400 })
  }

  if (action === "add") {
    // Upsert — if team is already assigned to another player, reassign
    await prisma.fifaPlayerTeam.upsert({
      where: { season_team: { season, team } },
      update: { player },
      create: { season, player, team },
    })

    // Ensure FifaEntry exists for this team (with zeros if new)
    const exists = await prisma.fifaEntry.findUnique({ where: { team } })
    if (!exists) {
      await prisma.fifaEntry.create({
        data: { team, logo: logo || (await logoFromArchive(team)), games: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 },
      })
    }
  } else {
    // Only the assignment goes. The FifaEntry row stays so the crest survives
    // if the team comes back; the all-time table leaves unassigned teams out.
    await prisma.fifaPlayerTeam.deleteMany({ where: { season, team } })
  }

  return Response.json({ success: true })
}
