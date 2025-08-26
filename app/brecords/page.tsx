"use client"

const playerColors = {
  Vanilla: "#ea7878",
  Choco: "#4b98de",
  Panda: "#4fcb90",
}

const UnderlinedPlayer = ({ name }: { name: string }) => (
  <span className="relative">
    <span className="relative">
      {name[0]}
      <span
        className="absolute bottom-[-2px] left-0 w-[0.85em] h-[2px]"
        style={{ backgroundColor: playerColors[name as keyof typeof playerColors] }}
      />
    </span>
    {name.slice(1)}
  </span>
)

const sections = [
  {
    title: "FIFA",
    records: [
      "The longest FIFA Night (22 matches) lasted 8 hours and 18 minutes, 23-24.09.2017",
      <>
        <UnderlinedPlayer name="Vanilla" /> holds the highest win rate for a season – 73.3%, 2024/25 <strong>✯</strong>
      </>,
      <>
        <UnderlinedPlayer name="Vanilla" /> holds the highest win rate for a team in a season (Newcastle, Marseille) –
        89.29%, 2023/24
      </>,
      "The smallest gap between 1st and 2nd place is 1 point, 2015/16 and 2023/24",
      "The largest gap is 10 points, 2020/21",
      <>
        <UnderlinedPlayer name="Vanilla" /> is the fastest to score 100 goals by a team (Liverpool) – 20 games, 2024/25 <strong>✯</strong>
      </>,
      <>
        <UnderlinedPlayer name="Choco" /> is the first to score a goal with a goalkeeper (Atletico Madrid), 2017
      </>,
      <>
        <UnderlinedPlayer name="Vanilla" /> is the first to score a goal from their own half (empty net) - Napoli, 2017
      </>,
      <>
        <UnderlinedPlayer name="Vanilla" /> is the first to score an Olympic goal (directly from a corner) - Lille, 2021/22
      </>,
      <>
        <UnderlinedPlayer name="Vanilla" /> holds the longest unbeaten streak for a team (Barcelona) – 26 matches,
        2023/24
      </>,
    ],
  },
  {
    title: "FPL",
    records: [
      <>
        <UnderlinedPlayer name="Panda" /> holds the record for the most points in a season – 2,511, 2023/24{" "}
      </>,
      <>
        <UnderlinedPlayer name="Panda" /> held first place for 25 consecutive rounds, 2022/23 <strong>✯</strong>{" "}
      </>,
      <>
        <UnderlinedPlayer name="Choco" /> scored the most points in a round with a boost – 141, 2021/22
      </>,
      <>
        <UnderlinedPlayer name="Vanilla" /> scored the most points in a round without boosts – 131, 2022/23
      </>,
      "The smallest gap between 1st and 2nd place was 23 points, 2021/22",
      "The largest gap was 256 points, 2017/18",
    ],
  },
  {
    title: "Bets",
    records: [
      <>
        <UnderlinedPlayer name="Choco" /> scored the most points in a season – 299, 2023/24
      </>,
      <>
        <UnderlinedPlayer name="Panda" /> held first place for 38 consecutive rounds (whole season), 2022/23{" "}
        <strong>✯</strong>{" "}
      </>,
      <>
        <UnderlinedPlayer name="Panda" /> and <UnderlinedPlayer name="Vanilla" /> won the betting cup three times in a
        row – 2012-14, 2020-23, and 2015-18
      </>,
      <>
        <UnderlinedPlayer name="Vanilla" /> scored the most points in a round – 17/30 (56.67%), 2021
      </>,
      "The smallest gap between 1st and 2nd place was 4 points, 2019",
      "The largest gap was 68 points, 2015",
      <>
        <UnderlinedPlayer name="Vanilla" /> holds the record for most correctly predicted scores in a day – 4/5 matches,
        2016
      </>,
    ],
  },
  {
    title: "GeoGuessr",
    records: [
      <>
        <UnderlinedPlayer name="Vanilla" /> holds the record for the most accurate guess when the location was known – 4
        m, Plaza Mayor (Arequipa), 2024/25 <strong>✯</strong>{" "}
      </>,
      <>
        <UnderlinedPlayer name="Vanilla" /> holds the record for the most accurate guess when the location was unknown –
        910 m, Monastery of Santa Catalina (Arequipa), 2024/25 <strong>✯</strong>{" "}
      </>,
      <>
        <UnderlinedPlayer name="Vanilla" /> hits first 5k in the competition - 129 m, Belgrade 2024/25{" "}
        <strong>✯</strong>{" "}
      </>,
      <>
      <UnderlinedPlayer name="Vanilla" /> struck the most 5Ks in a season - 11, 2024/25 <strong>✯</strong>{" "}
    </>,
    ],
  },
  {
    title: "Texas Holdem",
    records: [
      <>
        <UnderlinedPlayer name="Panda" /> won the first club game, 06.09.2012
      </>,
      <>
        <UnderlinedPlayer name="Panda" /> is the first to win 100 games - it took him only 263 games,
        09.06.2017
      </>,
      "The longest poker game lasted 1 hour and 41 minutes, 2015",
      "The smallest gap between 1st and 2nd place was 1 point, 2012",
      "The largest gap was 16 points, 2017",
      <>
        <UnderlinedPlayer name="Panda" /> holds the record for the longest winning streak – 5 games, 10th season, 2025{" "}
        <strong>✯</strong>{" "}
      </>,
      <>
        <UnderlinedPlayer name="Choco" /> is the first player to get a straight flush and four aces
      </>,
      <>
        <UnderlinedPlayer name="Vanilla" /> is the first player to get a six- and seven-card straight flush
      </>,
      <>
        <UnderlinedPlayer name="Panda" /> is the first and only player to get a royal flush (hearts)
      </>,
      <>
        <UnderlinedPlayer name="Panda" /> is the first and only player to get second royal flush (again hearts), 2025{" "}
        <strong>✯</strong>{" "}
      </>,
    ],
  },
  {
    title: "7oker",
    records: [
      <>
        <UnderlinedPlayer name="Vanilla" /> won the first 7oker game, 29.03.2025 <strong>✯</strong>{" "}
      </>,
      <>
      <UnderlinedPlayer name="Panda" /> is the first who bet 6 and won all 6 tricks <strong>✯</strong>{" "}
    </>,
    <>
    The smallest gap between 1st and 2nd place in a game - 1 points, 2024/25 <strong>✯</strong>{" "}
  </>,
  <>
  <UnderlinedPlayer name="Choco" /> was the first one to win the game by golden round against <UnderlinedPlayer name="Panda" />, 2024/25 <strong>✯</strong>{" "}
</>,
  <>
  <UnderlinedPlayer name="Choco" /> has the longest winning streak - 5 games in a row, 2024/25 <strong>✯</strong>{" "}
</>,
<>
  <UnderlinedPlayer name="Vanilla" /> scored the biggest amount of points per game - 294, 2024/25 <strong>✯</strong>{" "}
</>,
    ],
  },
]

export default function BrecordsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-title font-bold mb-4">Brecords</h1>
      <p className="text-basic text-gray-600 mb-8">
        <strong>Eternal record:</strong> the longest bros call lasted 12 hours and 32 minutes on February 22, 2016.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <div key={index} className="flex">
            <section className="bg-gray-50 shadow-lg rounded-lg p-6 flex-1 flex flex-col">
              <h2 className="text-title font-semibold mb-4">{section.title}</h2>
              <ul className="space-y-2 list-disc pl-5 flex-1">
                {section.records.map((record, recordIndex) => (
                  <li key={recordIndex} className="text-base text-gray-700">
                    {record}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ))}
      </div>
    </div>
  )
}

