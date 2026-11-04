import { playerChipStyle } from "../lib/teamColors"
import { BearAvatar } from "./Bear"

/**
 * Player in a table: the mascot on a disc of the bear's colour, as on the
 * standings cards, and the name in the surrounding text colour (so it reads on
 * a lime row too). `color` is kept for callers that still pass it.
 */
export default function PlayerCell({
  name,
  small = false,
}: {
  name: string
  color?: string
  /** A step smaller, for narrow spots such as a phone's bet card */
  small?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full py-[3px] pl-[3px] font-medium ${
        small ? "gap-1.5 pr-2.5 text-xs" : "gap-[7px] pr-[11px] text-sm md:text-base"
      }`}
      style={playerChipStyle(name)}
    >
      <BearAvatar name={name} size={small ? 18 : 20} ring={false} filled />
      {name}
    </span>
  )
}
