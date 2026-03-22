import prisma from "../../../lib/prisma"

export async function POST(request: Request) {
  const body = await request.json()
  const { teamA, scoreA, teamB, scoreB } = body

  if (!teamA || !teamB || teamA === teamB) {
    return Response.json({ error: "Invalid teams" }, { status: 400 })
  }
  if (typeof scoreA !== "number" || typeof scoreB !== "number" || scoreA < 0 || scoreB < 0) {
    return Response.json({ error: "Invalid scores" }, { status: 400 })
  }

  const aWins = scoreA > scoreB
  const bWins = scoreB > scoreA
  const isDraw = scoreA === scoreB

  await prisma.$transaction([
    prisma.fifaEntry.update({
      where: { team: teamA },
      data: {
        games:         { increment: 1 },
        wins:          { increment: aWins  ? 1 : 0 },
        draws:         { increment: isDraw ? 1 : 0 },
        losses:        { increment: bWins  ? 1 : 0 },
        goalsScored:   { increment: scoreA },
        goalsConceded: { increment: scoreB },
      },
    }),
    prisma.fifaEntry.update({
      where: { team: teamB },
      data: {
        games:         { increment: 1 },
        wins:          { increment: bWins  ? 1 : 0 },
        draws:         { increment: isDraw ? 1 : 0 },
        losses:        { increment: aWins  ? 1 : 0 },
        goalsScored:   { increment: scoreB },
        goalsConceded: { increment: scoreA },
      },
    }),
  ])

  return Response.json({ success: true })
}
