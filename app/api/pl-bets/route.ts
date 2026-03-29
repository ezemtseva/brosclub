import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

const PLAYERS = ["Vanilla", "Choco", "Panda"]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const gameweek = searchParams.get("gameweek")

  const matches = await prisma.plMatch.findMany({
    where: {
      season: "2025/26",
      ...(gameweek ? { gameweek: parseInt(gameweek) } : {}),
    },
    include: { bets: true },
    orderBy: { kickoff: "asc" },
  })

  return NextResponse.json(matches)
}

export async function POST(req: Request) {
  const { matchId, player, scoreHome, scoreAway } = await req.json()

  if (!PLAYERS.includes(player)) {
    return NextResponse.json({ error: "Invalid player" }, { status: 400 })
  }

  const match = await prisma.plMatch.findUnique({ where: { matchId } })
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 })

  // Lock 10 minutes after kickoff
  const lockTime = new Date(match.kickoff.getTime() + 10 * 60 * 1000)
  if (new Date() > lockTime) {
    return NextResponse.json({ error: "Bets are locked for this match" }, { status: 403 })
  }

  const bet = await prisma.plBet.upsert({
    where: { matchId_player: { matchId, player } },
    update: { scoreHome, scoreAway, points: null },
    create: { matchId, player, scoreHome, scoreAway },
  })

  return NextResponse.json(bet)
}

export async function DELETE(req: Request) {
  const { matchId, player } = await req.json()

  if (!PLAYERS.includes(player)) {
    return NextResponse.json({ error: "Invalid player" }, { status: 400 })
  }

  const match = await prisma.plMatch.findUnique({ where: { matchId } })
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 })

  const lockTime = new Date(match.kickoff.getTime() + 10 * 60 * 1000)
  if (new Date() > lockTime) {
    return NextResponse.json({ error: "Bets are locked for this match" }, { status: 403 })
  }

  await prisma.plBet.deleteMany({ where: { matchId, player } })

  return NextResponse.json({ ok: true })
}
