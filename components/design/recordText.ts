/**
 * Record descriptions carry their season in brackets, e.g.
 * "Panda holds the record for the most points in a season (2023/24)".
 * The redesign puts that date in the corner of the card, so it is split off here.
 */
export function splitRecordDate(description: string): { text: string; when?: string } {
  const match = description.match(/\s*\(([^()]*\d{4}[^()]*)\)\s*$/)
  if (!match) return { text: description }
  return { text: description.slice(0, match.index).trim(), when: match[1] }
}
