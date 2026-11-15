import prisma from "../lib/prisma"

/**
 * Renames a FIFA club in every table that stores club names: the season tables,
 * the owners per season, and both sides of every match.
 *
 *   npx tsx scripts/rename-team.ts "AFC Bournemouth" "Bournemouth"          # dry run
 *   npx tsx scripts/rename-team.ts "AFC Bournemouth" "Bournemouth" --apply  # write
 *
 * A dry run only counts. Applying refuses if the new name is already taken where
 * a club's name must be unique, and writes everything in one transaction.
 */
async function run() {
  const [from, to, flag] = process.argv.slice(2)
  if (!from || !to) throw new Error('Usage: rename-team.ts "<old name>" "<new name>" [--apply]')
  const apply = flag === "--apply"
  const db = prisma as any

  const counts = {
    fifaEntry: await db.fifaEntry.count({ where: { team: from } }),
    fifaEntry2526: await db.fifaEntry2526.count({ where: { team: from } }),
    fifaEntry2024: await db.fifaEntry2024.count({ where: { team: from } }),
    fifaPlayerTeam: await db.fifaPlayerTeam.count({ where: { team: from } }),
    fifaMatchA: await db.fifaMatch.count({ where: { teamA: from } }),
    fifaMatchB: await db.fifaMatch.count({ where: { teamB: from } }),
  }
  // Where the name is unique: the current season table, and one owner per season
  const clashes = {
    fifaEntry: await db.fifaEntry.count({ where: { team: to } }),
    fifaPlayerTeam: await db.fifaPlayerTeam.findMany({ where: { team: to }, select: { season: true } }),
  }
  const ownerSeasons = await db.fifaPlayerTeam.findMany({ where: { team: from }, select: { season: true } })
  const seasonClash = ownerSeasons.filter((r: { season: string }) =>
    clashes.fifaPlayerTeam.some((c: { season: string }) => c.season === r.season),
  )

  console.log(`"${from}" → "${to}"`, counts)
  console.log(`"${to}" already in fifaEntry: ${clashes.fifaEntry}; owner seasons that clash: ${seasonClash.length}`)
  if (!apply) {
    console.log("Dry run: nothing written. Add --apply to rename.")
    return
  }
  if ((clashes.fifaEntry > 0 && counts.fifaEntry > 0) || seasonClash.length > 0) {
    throw new Error(`"${to}" already exists where club names are unique; merge those rows by hand first`)
  }

  const result = await prisma.$transaction([
    db.fifaEntry.updateMany({ where: { team: from }, data: { team: to } }),
    db.fifaEntry2526.updateMany({ where: { team: from }, data: { team: to } }),
    db.fifaEntry2024.updateMany({ where: { team: from }, data: { team: to } }),
    db.fifaPlayerTeam.updateMany({ where: { team: from }, data: { team: to } }),
    db.fifaMatch.updateMany({ where: { teamA: from }, data: { teamA: to } }),
    db.fifaMatch.updateMany({ where: { teamB: from }, data: { teamB: to } }),
  ])
  console.log("Renamed rows:", result.map((r: { count: number }) => r.count))
}

run()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
