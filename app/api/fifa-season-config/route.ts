import prisma from "../../../lib/prisma"

// GET /api/fifa-season-config?season=2025/26
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const season = searchParams.get("season") || "2025/26"

  const rows = await prisma.fifaPlayerTeam.findMany({ where: { season } })

  // Group by player
  const result: Record<string, string[]> = { Vanilla: [], Choco: [], Panda: [] }
  for (const row of rows) {
    if (result[row.player]) result[row.player].push(row.team)
  }

  return Response.json(result)
}

// POST /api/fifa-season-config
// Body: { season, player, team, action: "add" | "remove" }
export async function POST(request: Request) {
  const { season, player, team, action } = await request.json()

  if (!season || !player || !team || !["add", "remove"].includes(action)) {
    return Response.json({ error: "Invalid body" }, { status: 400 })
  }

  if (!["Vanilla", "Choco", "Panda"].includes(player)) {
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
        data: { team, logo: "/placeholder.svg", games: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 },
      })
    }
  } else {
    await prisma.fifaPlayerTeam.deleteMany({ where: { season, team } })
  }

  return Response.json({ success: true })
}
