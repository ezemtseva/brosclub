import Image from "next/image"
import { PLAYER_COLORS, PLAYER_TINTS, playerChipStyle } from "../lib/teamColors"

const BEAR_IMAGES: Record<string, string> = {
  Vanilla: "/imgs/vanilla.png",
  Choco: "/imgs/choco-cool.png",
  Panda: "/imgs/panda-cool-1.png",
}

export function bearColor(name: string): string {
  return PLAYER_COLORS[name] ?? "#C9CBD1"
}

export function bearImage(name: string): string {
  return BEAR_IMAGES[name] ?? "/placeholder.svg"
}

const BEAR_FULL_IMAGES: Record<string, string> = {
  Vanilla: "/imgs/bears/vanilla-full.png",
  Choco: "/imgs/bears/choco-full.png",
  Panda: "/imgs/bears/panda-full.png",
}

/** The full-body mascot (transparent, 720px tall) for the poster cards; none for anyone else. */
export function bearFullImage(name: string): string | undefined {
  return BEAR_FULL_IMAGES[name]
}

/**
 * The mascot in a circle ringed in the bear's colour — the redesign keeps the
 * drawings where the mockups use a coloured monogram.
 */
export function BearAvatar({
  name,
  size = 48,
  ring = true,
  filled = false,
}: {
  name: string
  size?: number
  ring?: boolean
  /** The bear's colour behind the drawing instead of the dark surface */
  filled?: boolean
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${ring && !filled ? "bg-surface-2" : ""}`}
      style={{
        width: size,
        height: size,
        background: filled ? bearColor(name) : undefined,
        boxShadow: ring ? `inset 0 0 0 2px ${bearColor(name)}` : undefined,
      }}
    >
      {/* No mascot for anyone else (DSQ): just the circle, filled grey */}
      {BEAR_IMAGES[name] ? (
        <Image
          src={BEAR_IMAGES[name]}
          alt={name}
          width={size}
          height={size}
          className="rounded-full object-cover"
          style={{ width: ring ? size - 6 : size, height: ring ? size - 6 : size }}
        />
      ) : (
        <span
          aria-hidden="true"
          className="rounded-full"
          style={{ width: ring ? size - 6 : size, height: ring ? size - 6 : size, background: bearColor(name) }}
        />
      )}
    </span>
  )
}

/** Pill with the mascot and the bear's name, on a neutral or tinted fill. */
export function BearChip({
  name,
  tinted = false,
  size = 20,
}: {
  name: string
  tinted?: boolean
  size?: number
}) {
  return (
    <span
      className="inline-flex items-center gap-[7px] whitespace-nowrap rounded-full py-[3px] pl-[3px] pr-[11px] text-[13px] font-medium"
      style={tinted && PLAYER_TINTS[name] ? playerChipStyle(name) : { background: "#1F2229" }}
    >
      <BearAvatar name={name} size={size} />
      {name}
    </span>
  )
}
