import { PLAYER_TINTS } from "../lib/teamColors"
import { BearAvatar } from "./Bear"

/**
 * Player in a table: the hall-of-champions pill — the mascot and the name on
 * the bear's tint. `color` is kept for callers that still pass it.
 */
export default function PlayerCell({ name }: { name: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-[7px] whitespace-nowrap rounded-full py-[3px] pl-[3px] pr-[11px] text-sm font-medium text-ink md:text-base"
      style={{ background: PLAYER_TINTS[name] ?? "var(--chip)" }}
    >
      <BearAvatar name={name} size={20} ring={false} />
      {name}
    </span>
  )
}
