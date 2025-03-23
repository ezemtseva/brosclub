import { NextResponse } from "next/server"
import prisma from "../../../lib/prisma"

export async function POST(request: Request) {
  const data = await request.json()

  if (
    !Array.isArray(data) ||
    data.some(
      (entry) =>
        !entry.bearo ||
        typeof entry.games !== "number" ||
        typeof entry.wins !== "number" ||
        typeof entry.points !== "number",
    )
  ) {
    return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
  }

  try {
    // Use the exact model name from your schema.prisma file
    // Replace 'sevenOkerEntry' with whatever name appears in your schema
    const modelName = "sevenOkerEntry" // Change this to match your schema

    // Check if the model exists using dynamic property access
    if (!(prisma as any)[modelName]) {
      return NextResponse.json({ error: "Database model not found. Check your schema.prisma file." }, { status: 500 })
    }

    const latestWeek = await (prisma as any)[modelName].findFirst({
      orderBy: { week: "desc" },
      select: { week: true },
    })

    const newWeek = latestWeek ? latestWeek.week + 1 : 1

    const upsertOperations = data.map((entry) =>
      (prisma as any)[modelName].upsert({
        where: {
          // Use the correct unique constraint name from your schema
          week_bearo: {
            week: newWeek,
            bearo: entry.bearo,
          },
        },
        update: {
          games: entry.games,
          wins: entry.wins,
          points: entry.points,
        },
        create: {
          week: newWeek,
          bearo: entry.bearo,
          games: entry.games,
          wins: entry.wins,
          points: entry.points,
        },
      }),
    )

    await prisma.$transaction(upsertOperations)

    return NextResponse.json({ message: "Update successful", week: newWeek }, { status: 200 })
  } catch (error) {
    console.error("Error updating 7oker data:", error)
    return NextResponse.json({ error: "Failed to update data" }, { status: 500 })
  }
}

