import prisma from './prisma'

async function fetchFplData(teamId: string) {
  const timestamp = Date.now();
  const url = `https://fantasy.premierleague.com/api/entry/${teamId}/history/?_=${timestamp}`;
  const response = await fetch(url, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch FPL data for team ${teamId}`)
  }
  return response.json()
}

export async function updateFplData() {
  const players = [
    { name: 'Vanilla', teamId: '1334964' },
    { name: 'Choco', teamId: '530378' },
    { name: 'Panda', teamId: '8724' },
  ]

  for (const player of players) {
    console.log(`Fetching data for ${player.name}...`)
    try {
      const fplData = await fetchFplData(player.teamId)
      console.log(`Received data for ${player.name}:`, JSON.stringify(fplData, null, 2))
      if (!fplData.current || fplData.current.length === 0) {
        console.log(`No current season data for ${player.name}, skipping`)
        continue
      }
      const latestEntry = fplData.current[fplData.current.length - 1]

      // Skip if this GW already exists in last season's archive — it's old data
      const existsInArchive = await (prisma as any).fplEntry2526.findFirst({
        where: { player: player.name, week: latestEntry.event }
      })
      if (existsInArchive) {
        console.log(`Week ${latestEntry.event} for ${player.name} is from 2025/26, skipping`)
        continue
      }

      const dbEntry = await prisma.fplEntry.findFirst({
        where: {
          player: player.name,
          week: latestEntry.event
        }
      })

      console.log(`Database entry for ${player.name}:`, dbEntry)

      if (!dbEntry || dbEntry.points !== latestEntry.total_points) {
        console.log(`Updating data for ${player.name}...`)
        await prisma.fplEntry.upsert({
          where: {
            week_player: {
              week: latestEntry.event,
              player: player.name
            }
          },
          update: {
            points: latestEntry.total_points,
            games: latestEntry.event
          },
          create: {
            player: player.name,
            week: latestEntry.event,
            points: latestEntry.total_points,
            games: latestEntry.event,
            teamId: player.teamId
          }
        })
        console.log(`Data updated for ${player.name}`)
      } else {
        console.log(`No update needed for ${player.name}`)
      }
    } catch (error) {
      console.error(`Error updating data for ${player.name}:`, error)
    }
  }
}

