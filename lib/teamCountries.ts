/**
 * Country each FIFA club belongs to, as the ISO code flagcdn.com expects.
 * The UK nations have their own codes there: gb-eng, gb-sct, gb-wls.
 * Both spellings of a renamed club are listed so lookups never miss.
 */
const TEAM_COUNTRY: Record<string, string> = {
  // England
  "AFC Richmond": "gb-eng",
  Arsenal: "gb-eng",
  "Aston Villa": "gb-eng",
  Bournemouth: "gb-eng",
  Brentford: "gb-eng",
  Brighton: "gb-eng",
  Chelsea: "gb-eng",
  "Crystal Palace": "gb-eng",
  Everton: "gb-eng",
  "Leicester City": "gb-eng",
  Liverpool: "gb-eng",
  "Manchester City": "gb-eng",
  "Manchester United": "gb-eng",
  Newcastle: "gb-eng",
  "Nottingham Forest": "gb-eng",
  "Nottingham Forrest": "gb-eng",
  "Stoke City": "gb-eng",
  Tottenham: "gb-eng",
  "West Ham": "gb-eng",
  Wolverhampton: "gb-eng",

  // Scotland
  Rangers: "gb-sct",

  // Spain
  "Athletic Bilbao": "es",
  "Atletico Madrid": "es",
  Barcelona: "es",
  "Real Betis": "es",
  "Real Madrid": "es",
  "Real Sociedad": "es",
  Sevilla: "es",
  Valencia: "es",
  Villarreal: "es",

  // Italy
  "AS Roma": "it",
  Atalanta: "it",
  "Como 1907": "it",
  Fiorentina: "it",
  Inter: "it",
  Juventus: "it",
  Milan: "it",
  Napoli: "it",
  "SS Lazio": "it",

  // Germany
  "Bayer Leverkusen": "de",
  "Bayern Munich": "de",
  "Borussia Dortmund": "de",
  "Borussia Mönchengladbach": "de",
  "Eintracht Frankfurt": "de",
  "RB Leipzig": "de",
  "Schalke 04": "de",
  Wolfsburg: "de",

  // France
  Lille: "fr",
  Marseille: "fr",
  "OGC Nice": "fr",
  "Olympique Lyon": "fr",
  "Olympique Lyonnais": "fr",
  PSG: "fr",
  "RC Lens": "fr",

  // Monaco — Ligue 1 club, but its own country
  "AS Monaco": "mc",

  // Portugal
  Benfica: "pt",
  Porto: "pt",
  "Sporting CP": "pt",

  // Netherlands
  Ajax: "nl",
  Feyenoord: "nl",
  PSV: "nl",

  // Türkiye
  "Adana Demirspor": "tr",
  "Fenerbahçe": "tr",
  Galatasaray: "tr",

  // Saudi Arabia
  "Al Ahli": "sa",
  "Al Hilal": "sa",
  "Al Nassr": "sa",

  // Russia
  CSKA: "ru",
  "Spartak Moscow": "ru",
  Zenit: "ru",

  // Rest
  "Dinamo Zagreb": "hr",
  Shakhtar: "ua",
  "Boca Juniors": "ar",
  "River Plate": "ar",
  "RB Salzburg": "at",
}

export function countryOf(team: string): string | undefined {
  return TEAM_COUNTRY[team]
}

export function flagUrl(code: string): string {
  return `https://flagcdn.com/w40/${code}.png`
}
