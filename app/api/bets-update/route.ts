import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function POST(request: Request) {
  const data = await request.json()
  
  if (!Array.isArray(data) || data.some(entry => !entry.player || typeof entry.games !== 'number' || typeof entry.wins !== 'number' || typeof entry.points !== 'number')) {
    return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
  }

  try {
    const latestWeek = await prisma.betsEntry.findFirst({
      orderBy: { week: 'desc' },
      select: { week: true },
    })

    const newWeek = latestWeek ? latestWeek.week + 1 : 1

    const upsertOperations = data.map(entry =>
      prisma.betsEntry.upsert({
        where: {
          week_player: {
            week: newWeek,
            player: entry.player,
          },
        },
        update: {
          games: entry.games,
          wins: entry.wins,
          points: entry.points,
        },
        create: {
          week: newWeek,
          player: entry.player,
          games: entry.games,
          wins: entry.wins,
          points: entry.points,
        },
      })
    )

    await prisma.$transaction(upsertOperations)

    return NextResponse.json({ message: 'Update successful', week: newWeek }, { status: 200 })
  } catch (error) {
    console.error('Error updating Bets data:', error)
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
  }
}