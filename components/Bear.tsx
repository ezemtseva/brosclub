import Image from "next/image"
import { PLAYER_COLORS, PLAYER_TINTS } from "../lib/teamColors"

const BEAR_IMAGES: Record<string, string> = {
  Vanilla: "/imgs/vanilla.png",
  Choco: "/imgs/choco.png",
  Panda: "/imgs/panda.png",
}

export function bearColor(name: string): string {
  return PLAYER_COLORS[name] ?? "#C9CBD1"
}

export function bearImage(name: string): string {
  return BEAR_IMAGES[name] ?? "/placeholder.svg"
}

/**
 * The mascot in a circle ringed in the bear's colour — the redesign keeps the
 * drawings where the mockups use a coloured monogram.
 */
export function BearAvatar({
  name,
  size = 48,
  ring = true,
}: {
  name: string
  size?: number
  ring?: boolean
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${ring ? "bg-surface-2" : ""}`}
      style={{
        width: size,
        height: size,
        boxShadow: ring ? `inset 0 0 0 2px ${bearColor(name)}` : undefined,
      }}
    >
      <Image
        src={BEAR_IMAGES[name] ?? "/placeholder.svg"}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: ring ? size - 6 : size, height: ring ? size - 6 : size }}
      />
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
      style={{ background: tinted ? PLAYER_TINTS[name] ?? "#1F2229" : "#1F2229" }}
    >
      <BearAvatar name={name} size={size} />
      {name}
    </span>
  )
}
