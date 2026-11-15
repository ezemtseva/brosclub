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
  /** The club the record belongs to, as a chip beside the bear's (FIFA) */
  team?: { name: string; logo: string }
  /** A record game as a chip: home crest, score, away crest (FIFA) */
  game?: { home: string; score: string; away: string }
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
      <p className={`m-0 flex-1 text-[15px] leading-normal ${lime ? "text-accent-foreground" : "text-ink-2"}`}>
        {card.text}
      </p>
      {/* One line in every tile, as on every cup's Brecords: the chips, then the
          date at the right end. Never wrapped; a club's name gives way first */}
      <div className="flex min-w-0 items-center gap-1.5">
        {/* Same chip as in the tables: the mascot on the bear's colour disc, the
            name in the tile's own text colour (dark on a lime tile) */}
        {/* Two bears beside a game chip don't fit a phone's line: there the
            mascots stand alone, the game chip naming the clubs */}
        {who.map((name) => {
          const compact = who.length > 1 && !!card.game
          return (
            <span
              key={name}
              title={name}
              className={`inline-flex shrink-0 items-center gap-[7px] whitespace-nowrap rounded-full py-[3px] pl-[3px] text-sm font-medium ${
                compact ? "max-md:pr-[3px] md:pr-[11px]" : "pr-[11px]"
              } ${lime ? "text-accent-foreground" : "text-ink"}`}
              style={playerChipStyle(name)}
            >
              <BearAvatar name={name} size={20} ring={false} filled />
              <span className={compact ? "max-md:hidden" : undefined}>{name}</span>
            </span>
          )
        })}
        {/* The club in the same chip: its crest where the mascot sits. The grid
            keeps a tile wide enough for the name (RecordGrid's minWidth) */}
        {card.team && (
          <span
            title={card.team.name}
            className={`inline-flex min-w-0 items-center gap-[7px] rounded-full py-[3px] pl-[3px] pr-[11px] text-sm font-medium ${
              lime ? "text-accent-foreground" : "text-ink"
            }`}
          >
            <Image src={card.team.logo} alt="" width={20} height={20} className="h-5 w-5 shrink-0 object-contain" />
            <span className="truncate">{card.team.name}</span>
          </span>
        )}
        {/* A record game: the two crests either side of the score */}
        {card.game && (
          <span
            className={`inline-flex shrink-0 items-center gap-[7px] whitespace-nowrap rounded-full px-[3px] py-[3px] text-sm font-semibold ${
              lime ? "text-accent-foreground" : "text-ink"
            }`}
          >
            <Image src={card.game.home} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
            {card.game.score}
            <Image src={card.game.away} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
          </span>
        )}
        {card.when && (
          <span
            className={`ml-auto shrink-0 whitespace-nowrap pl-1.5 font-mono text-xs ${
              lime ? "text-accent-foreground/70" : "text-ink-dim"
            }`}
          >
            {card.when}
          </span>
        )}
      </div>
    </article>
  )
}

/**
 * The tiles in as many columns as fit. `minWidth` raises the narrowest a tile
 * may get, for records whose chips need the room (EA FC: a bear, a club and a
 * date on one line).
 */
export function RecordGrid({ cards, minWidth = 280 }: { cards: RecordCard[]; minWidth?: number }) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${minWidth}px, 100%), 1fr))` }}
    >
      {cards.map((card, i) => (
        <RecordTile key={i} card={card} />
      ))}
    </div>
  )
}
