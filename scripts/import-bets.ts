import { PrismaClient } from "@prisma/client"
import { createReadStream } from "fs"
import { createInterface } from "readline"

const prisma = new PrismaClient()

const RU_TO_EN: Record<string, string> = {
  "Ливерпуль": "Liverpool",
  "Астон Вилла": "Aston Villa",
  "Тоттенхэм Хотспур": "Tottenham",
  "Сандерленд": "Sunderland",
  "Брайтон энд Хоув Альбион": "Brighton Hove",
  "Вулверхэмптон": "Wolverhampton",
  "Ноттингем Форест": "Nottingham",
  "Челси": "Chelsea",
  "Манчестер Юнайтед": "Man United",
  "Лидс Юнайтед": "Leeds United",
  "Вест Хэм Юнайтед": "West Ham",
  "Манчестер Сити": "Man City",
  "Бёрнли": "Burnley",
  "Борнмут": "Bournemouth",
  "Брентфорд": "Brentford",
  "Арсенал": "Arsenal",
  "Эвертон": "Everton",
  "Кристал Пэлас": "Crystal Palace",
  "Фулхэм": "Fulham",
  "Ньюкасл Юнайтед": "Newcastle",
}

function toEn(ruName: string): string {
  const en = RU_TO_EN[ruName.trim()]
  if (!en) throw new Error(`Unknown team: "${ruName}"`)
  return en
}

async function main() {
  const csvPath = process.argv[2] ?? "/Users/yuryloguinov/Downloads/bets.csv"

  const lines: string[] = []
  const rl = createInterface({ input: createReadStream(csvPath, "utf-8") })
  for await (const line of rl) lines.push(line)

  // Skip header row
  const dataLines = lines.slice(1).filter((l) => l.trim())

  let imported = 0
  let skipped = 0
  let notFound = 0

  for (const line of dataLines) {
    // Split carefully: first comma separates match name from scores
    const firstComma = line.indexOf(",")
    const matchName = line.slice(0, firstComma).trim()
    const rest = line.slice(firstComma + 1).split(",")

    // rest: [ChocoH, ChocoA, VanillaH, VanillaA, PandaH, PandaA]
    const [chocoH, chocoA, vanillaH, vanillaA, pandaH, pandaA] = rest

    // Parse match name: "Home\u00a0\u2013\u00a0Away" (NBSP + en dash + NBSP)
    const parts = matchName.split("\u00a0\u2013\u00a0")
    if (parts.length !== 2) {
      console.warn(`Skipping bad line: ${line}`)
      skipped++
      continue
    }

    let homeEn: string, awayEn: string
    try {
      homeEn = toEn(parts[0])
      awayEn = toEn(parts[1])
    } catch (e) {
      console.warn(String(e))
      skipped++
      continue
    }

    const match = await prisma.plMatch.findFirst({
      where: { homeTeam: homeEn, awayTeam: awayEn, season: "2025/26" },
    })

    if (!match) {
      console.warn(`Match not found in DB: ${homeEn} vs ${awayEn}`)
      notFound++
      continue
    }

    const bets: { player: string; h: string; a: string }[] = [
      { player: "Choco", h: chocoH, a: chocoA },
      { player: "Vanilla", h: vanillaH, a: vanillaA },
      { player: "Panda", h: pandaH, a: pandaA },
    ]

    for (const { player, h, a } of bets) {
      const scoreHome = h?.trim()
      const scoreAway = a?.trim()
      if (scoreHome === "" || scoreAway === "" || scoreHome === undefined || scoreAway === undefined) {
        continue // no bet for this player on this match
      }

      await prisma.plBet.upsert({
        where: { matchId_player: { matchId: match.matchId, player } },
        update: { scoreHome: parseInt(scoreHome), scoreAway: parseInt(scoreAway), points: null },
        create: { matchId: match.matchId, player, scoreHome: parseInt(scoreHome), scoreAway: parseInt(scoreAway) },
      })
      imported++
    }
  }

  console.log(`Done: ${imported} bets imported, ${skipped} rows skipped, ${notFound} matches not found in DB`)

  // Settle all finished matches
  console.log("Running settle...")
  const { settleAndRecalculate } = await import("../lib/pl-settle")
  const settled = await settleAndRecalculate()
  console.log(`Settled ${settled} bets`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
