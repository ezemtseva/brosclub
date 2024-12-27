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
    { name: 'Vanilla', teamId: '1546526' },
    { name: 'Choco', teamId: '3214199' },
    { name: 'Panda', teamId: '5663' },
  ]

  for (const player of players) {
    console.log(`Fetching data for ${player.name}...`)
    try {
      const fplData = await fetchFplData(player.teamId)
      console.log(`Received data for ${player.name}:`, JSON.stringify(fplData, null, 2))
      const latestEntry = fplData.current[fplData.current.length - 1]

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

