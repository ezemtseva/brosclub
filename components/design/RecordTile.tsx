import { BearAvatar, bearColor } from "../Bear"
import Image from "next/image"
import { playerChipStyle } from "../../lib/teamColors"

export type RecordCard = {
  /** Big number or figure; left out when the record is a "first ever" */
  value?: string
  /** Outline pill shown instead of a value */
  pill?: string
  text: string
  /** Bears the record belongs to — one colours the value, several keep it white */
  who?: string[]
  /** Date or season on the right */
  when?: string
  /** Club crest shown in place of the value (FIFA) */
  logo?: string
  /** The brand lime with dark ink, in both themes */
  highlight?: boolean
}

export default function RecordTile({ card }: { card: RecordCard }) {
  const who = card.who ?? []
  const lime = card.highlight
  // On lime everything is the accent's dark ink
  const color = lime ? "#0B0C0F" : who.length === 1 ? bearColor(who[0]) : "var(--ink)"

  return (
    <article
      className={`flex min-h-[200px] flex-col gap-4 rounded-[20px] border p-6 ${
        lime ? "border-accent bg-accent text-accent-foreground" : "border-hairline bg-surface"
      }`}
    >
      {/* One fixed-height slot for crest, figure or pill, so the text below
          starts on the same line in every tile */}
      <div className="flex h-14 shrink-0 items-center">
        {card.logo ? (
          <Image
            src={card.logo}
            alt={card.text}
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
        ) : card.value ? (
          <div
            className="font-display text-[40px] font-extrabold leading-none tracking-[-0.02em]"
            style={{ color }}
          >
            {card.value}
          </div>
        ) : (
          <span
            className="rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em]"
            style={{ borderColor: color, color }}
          >
            {card.pill ?? "First"}
          </span>
        )}
      </div>
      <p className={`m-0 flex-1 text-[15px] leading-normal ${lime ? "text-accent-foreground" : "text-ink-2"}`}>{card.text}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Same chip as in the tables: the mascot on the bear's colour disc, the
            name in the tile's own text colour (dark on a lime tile) */}
        {who.map((name) => (
          <span
            key={name}
            className={`inline-flex items-center gap-[7px] whitespace-nowrap rounded-full py-[3px] pl-[3px] pr-[11px] text-sm font-medium ${
              lime ? "text-accent-foreground" : "text-ink"
            }`}
            style={playerChipStyle(name)}
          >
            <BearAvatar name={name} size={20} ring={false} filled />
            {name}
          </span>
        ))}
        {card.when && (
          <span className={`ml-auto font-mono text-xs ${lime ? "text-accent-foreground/70" : "text-ink-dim"}`}>{card.when}</span>
        )}
      </div>
    </article>
  )
}

export function RecordGrid({ cards }: { cards: RecordCard[] }) {
  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
      {cards.map((card, i) => (
        <RecordTile key={i} card={card} />
      ))}
    </div>
  )
}
