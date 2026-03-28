import prisma from "../../../lib/prisma"

// GET /api/fifa-matches?season=2025/26
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const season = searchParams.get("season") || "2025/26"

  const matches = await prisma.fifaMatch.findMany({
    where: { season },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(matches)
}
