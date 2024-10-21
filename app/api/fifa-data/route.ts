import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function POST(request: Request) {
  const data = await request.json()
  
  if (!Array.isArray(data) || data.some(entry => !entry.team || !entry.logo || typeof entry.games !== 'number' || typeof entry.wins !== 'number' || typeof entry.draws !== 'number' || typeof entry.losses !== 'number' || typeof entry.goalsScored !== 'number' || typeof entry.goalsConceded !== 'number')) {
    return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
  }

  try {
    const upsertOperations = data.map(entry =>
      prisma.fifaEntry.upsert({
        where: {
          team: entry.team,
        },
        update: {
          logo: entry.logo,
          games: entry.games,
          wins: entry.wins,
          draws: entry.draws,
          losses: entry.losses,
          goalsScored: entry.goalsScored,
          goalsConceded: entry.goalsConceded,
        },
        create: {
          team: entry.team,
          logo: entry.logo,
          games: entry.games,
          wins: entry.wins,
          draws: entry.draws,
          losses: entry.losses,
          goalsScored: entry.goalsScored,
          goalsConceded: entry.goalsConceded,
        },
      })
    )

    await prisma.$transaction(upsertOperations)

    return NextResponse.json({ message: 'Update successful' }, { status: 200 })
  } catch (error) {
    console.error('Error updating FIFA data:', error)
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
  }
}