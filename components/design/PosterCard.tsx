import type React from "react"
import { bearColor, bearFullImage } from "../Bear"
import { ARCHIVO_CONDENSED } from "../../lib/cardFrame"

const RANKS = ["1ST", "2ND", "3RD"]

export type PosterRow = { label: string; value: React.ReactNode }

/**
 * A bear's poster card (design revision 7): a wash of the bear's colour, the
 * rank and name at the top left, the stats as a short list down the left, the
 * full-body mascot on the right, and the main figure huge in the bottom-right
 * corner, outlined in the card's own fill so it cuts out of the picture. Used by
 * the cup pages' standings and the home page's History.
 *
 * With `strip` (a card with many stats, EA FC all time) the poster gets a fixed
 * height (268px, 288px on phones) and the strip's stats sit below it in columns
 * across the card. With `footer` (EA FC insights: the last games) the poster
 * keeps its own height and the footer sits below it, behind the same rule.
 */
export default function PosterCard({
  name,
  index,
  figure,
  rows,
  strip,
  footer,
  label,
}: {
  name: string
  /** Place in the standings, from 0 */
  index: number
  /** The main figure: points or cups, already formatted */
  figure: string
  rows: PosterRow[]
  /** Stats in columns below a fixed-height poster */
  strip?: PosterRow[]
  /** Anything below the poster, which then crops the mascot and the figure */
  footer?: React.ReactNode
  /** The card's accessible name, e.g. "1st Panda, 581 points" */
  label: string
}) {
  const rank = RANKS[index] ?? `${index + 1}TH`
  const image = bearFullImage(name)
  const split = !!strip && strip.length > 0
  const digits = figure.replace(/\D/g, "").length

  // The figure's size. The plain poster: 180px for one or two characters, 128px
  // for three, longer squeezed to three's width. The split poster: 4+ digits at
  // 104px (84px on phones), unsqueezed, so they fit its fixed height
  const figureStyle: React.CSSProperties = split
    ? { fontVariationSettings: ARCHIVO_CONDENSED }
    : {
        fontSize: figure.length <= 2 ? 180 : 128,
        fontVariationSettings: ARCHIVO_CONDENSED,
        transform: figure.length > 3 ? `scaleX(${3 / figure.length})` : undefined,
        transformOrigin: "right bottom",
      }
  const figureSize = !split
    ? ""
    : digits >= 4
      ? "text-[84px] md:text-[104px]"
      : digits === 3
        ? "text-[128px]"
        : "text-[180px]"

  const poster = (
    <>
      <div className="relative z-[3] flex items-center gap-2.5 px-5 pt-5">
        <span
          className={`font-archivo rounded-full px-3 py-1 text-[18px] font-black leading-none ${
            // 1st in the lime, 2nd in a fixed silver, both with the dark ink
            index === 0
              ? "bg-accent text-accent-foreground"
              : index === 1
                ? "bg-[#C9CDD3] text-accent-foreground"
                : "bg-surface-3 text-ink-2"
          }`}
          style={{ fontVariationSettings: ARCHIVO_CONDENSED }}
        >
          {rank}
        </span>
        <span className="font-display text-xl font-bold">{name}</span>
      </div>

      {image && (
        // Decorative: the card's label carries who it is. On a split card's phone
        // poster it starts below the header, which the wider list crowds
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className={`absolute bottom-0 right-2.5 z-[1] w-auto object-contain object-right-bottom ${
            split ? "top-14 h-[calc(100%-56px)] md:top-2 md:h-[calc(100%-8px)]" : "top-2 h-[calc(100%-8px)]"
          }`}
        />
      )}

      <dl className={`relative z-[3] m-0 pb-[18px] pl-5 pt-3.5 ${split ? "w-[56%] md:w-[42%]" : "w-[42%]"}`}>
        {rows.map((row) => (
          <div key={row.label} className="poster-row flex items-baseline justify-between gap-3 py-1.5">
            <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2">{row.label}</dt>
            <dd
              className="font-archivo m-0 text-[20px] font-black leading-none"
              style={{ fontVariationSettings: ARCHIVO_CONDENSED }}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* stat-number: the bear's colour in dark, plain ink in light */}
      <span
        aria-hidden="true"
        className={`poster-figure stat-number font-archivo absolute -bottom-[0.2em] -right-1 z-[2] font-black leading-none tracking-[-0.03em] ${figureSize}`}
        style={figureStyle}
      >
        {figure}
      </span>
    </>
  )

  return (
    <article
      aria-label={label}
      className="poster-card relative overflow-hidden rounded-[22px] text-ink"
      style={{ "--bear": bearColor(name) } as React.CSSProperties}
    >
      {split ? (
        <>
          {/* 288px on phones (the spec's 250px let the outlined 84px figure, which
              cannot pass right of the 56% list there, cut into the last row) */}
          <div className="relative h-[288px] overflow-hidden md:h-[268px]">{poster}</div>
          <dl
            className="poster-strip m-0 grid px-5 pb-[18px] pt-3.5"
            style={{ gridTemplateColumns: `repeat(${strip!.length}, minmax(0, 1fr))` }}
          >
            {strip!.map((row) => (
              <div key={row.label} className="flex flex-col-reverse gap-1">
                <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2">{row.label}</dt>
                <dd
                  className="font-archivo m-0 text-[26px] font-black leading-none"
                  style={{ fontVariationSettings: ARCHIVO_CONDENSED }}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : footer ? (
        <>
          <div className="relative overflow-hidden">{poster}</div>
          <div className="poster-strip px-5 pb-[18px] pt-3.5">{footer}</div>
        </>
      ) : (
        poster
      )}
    </article>
  )
}
