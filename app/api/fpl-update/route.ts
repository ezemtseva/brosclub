import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function POST(request: Request) {
  const data = await request.json()
  
  if (!Array.isArray(data) || data.some(entry => !entry.player || !entry.points)) {
    return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
  }

  try {
    await prisma.$transaction(
      data.map(entry =>
        prisma.fplEntry.upsert({
          where: {
            week_player: {
              week: entry.games,
              player: entry.player,
            },
          },
          update: {
            points: entry.points,
            games: entry.games,
            teamId: entry.teamId,
          },
          create: {
            week: entry.games,
            player: entry.player,
            points: entry.points,
            games: entry.games,
            teamId: entry.teamId,
          },
        })
      )
    )

    return NextResponse.json({ message: 'Update successful' }, { status: 200 })
  } catch (error) {
    console.error('Error updating FPL data:', error)
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
  }
}