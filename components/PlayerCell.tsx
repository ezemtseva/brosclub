import Image from "next/image"
import { PLAYER_COLORS } from "../lib/teamColors"

const PLAYER_AVATARS: Record<string, string> = {
  Vanilla: "/imgs/vanilla.png",
  Choco: "/imgs/choco.png",
  Panda: "/imgs/panda.png",
}

/** Player in a standings table: avatar ringed in the player's colour, then the name. */
export default function PlayerCell({ name, color }: { name: string; color?: string }) {
  const ringColor = color ?? PLAYER_COLORS[name] ?? "#cccccc"
  const avatar = PLAYER_AVATARS[name]

  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      {avatar && (
        <Image
          src={avatar}
          alt={name}
          width={24}
          height={24}
          className="rounded-full object-cover w-6 h-6 border-2 shrink-0"
          style={{ borderColor: ringColor }}
        />
      )}
      {name}
    </span>
  )
}
