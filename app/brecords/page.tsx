'use client'

import { useState } from 'react'

const sections = [
  {
    title: "FIFA",
    records: [
      "The longest FIFA Night (22 matches) lasted 8 hours and 18 minutes, 23-24.09.2017",
      "Vanilla holds the highest win rate for a season – 70.7%, 2020",
      "Vanilla holds the highest win rate for a team in a season (Newcastle, Marseille) – 89.29%, 2023/24",
      "Panda holds the lowest win rate for a team in a season (Sevilla) – 0.0%, 2023/24",
      "The smallest gap between 1st and 2nd place was 1 point, 2015/16 and 2023/24",
      "The largest gap was 10 points, 2020/21",
      "Choco was the fastest to score 100 goals in a tournament – 23 rounds (Chelsea), 2020",
      "Choco was the first to score a goal with a goalkeeper (Atletico Madrid), 2017",
      "Vanilla was the first to score a goal from their own half (into an empty net, no lags), 2017 for Napoli",
      "Vanilla was the first to score an Olympic goal (directly from a corner) against an opponent (Lille), 2021/22",
      "Vanilla holds the longest unbeaten streak for a team (Barcelona) – 26 matches, 2023/24"
    ]
  },
  {
    title: "FPL",
    records: [
      "Panda holds the record for the most points in a season – 2,511, 2023/24",
      "Choco scored the most points in a round with a boost – 141, 2021/22",
      "Vanilla scored the most points in a round without boosts – 131, 2022/23",
      "The smallest gap between 1st and 2nd place was 23 points, 2021/22",
      "The largest gap was 256 points, 2017/18"
    ]
  },
  {
    title: "Bets",
    records: [
      "Choco scored the most points in a season – 299, 2023/24",
      "Panda and Vanilla won the betting cup three times in a row – 2012-14, 2020-23, and 2015-18",
      "Vanilla scored the most points in a round – 17/30 (56.67%), 2021",
      "The smallest gap between 1st and 2nd place was 4 points, 2019",
      "The largest gap was 68 points, 2015",
      "Vanilla holds the record for most correctly predicted scores in a day – 4/5 matches, 2016"
    ]
  },
  {
    title: "Geo Guessr",
    records: [
      "Vanilla holds the record for the most accurate guess when the location was known – 17 meters, Hagia Sophia (Istanbul), 2023/24",
      "Vanilla holds the record for the most accurate guess when the location was unknown – 910 meters, Monastery of Santa Catalina (Arequipa), 2023/24"
    ]
  },
  {
    title: "Poker",
    records: [
      "Panda won the first club game, 06.09.2012",
      "Panda was the first to win 100 games in the club: it took him only 263 games, 09.06.2017",
      "The longest poker game lasted 1 hour and 41 minutes, 2015",
      "The smallest gap between 1st and 2nd place was 1 point, 2012",
      "The largest gap was 16 points, 2017",
      "Panda holds the record for the longest winning streak – 4 games, 5th season, 2016",
      "Choco was the first player to get a straight flush and four aces",
      "Vanilla was the first player to get a six- and seven-card straight flush",
      "Panda was the first and only player to get a royal flush (hearts)"
    ]
  }
]

export default function BrecordsPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-8">Brecords</h1>
      <div className="space-y-8">
        {sections.map((section, index) => (
          <section 
            key={index} 
            className={`bg-white shadow-md rounded-lg p-6 transition-all duration-300 ease-in-out ${
              hoveredIndex === index ? 'scale-105 shadow-lg' : ''
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <h2 className="text-title font-semibold mb-4">
              {section.title}
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              {section.records.map((record, recordIndex) => (
                <li key={recordIndex} className="text-base text-gray-700">{record}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}