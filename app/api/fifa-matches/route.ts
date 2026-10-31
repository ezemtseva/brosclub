import prisma from "../../../lib/prisma"
import { CURRENT_FIFA_SEASON } from "../../../lib/fifaSeason"

// GET /api/fifa-matches?season=2026/27
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const season = searchParams.get("season") || CURRENT_FIFA_SEASON

  const matches = await prisma.fifaMatch.findMany({
    where: { season },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(matches)
}
