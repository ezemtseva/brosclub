import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function POST(request: Request) {
  const data = await request.json()
  
  if (!Array.isArray(data) || data.some(entry => !entry.player || !entry.points)) {
    return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
  }

  const latestWeek = await prisma.fplEntry.findFirst({
    orderBy: { week: 'desc' },
    select: { week: true },
  })

  const newWeek = latestWeek ? latestWeek.week + 1 : 1

  try {
    await prisma.$transaction(
      data.map(entry =>
        prisma.fplEntry.create({
          data: {
            week: newWeek,
            player: entry.player,
            points: entry.points,
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