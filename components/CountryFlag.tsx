import Image from "next/image"
import { countryOf, flagUrl } from "../lib/teamCountries"

/** Small rectangular flag of the club's country, blank when unknown. */
export default function CountryFlag({ team }: { team: string }) {
  const code = countryOf(team)
  if (!code) return null
  return (
    <Image
      src={flagUrl(code)}
      alt={code}
      width={40}
      height={28}
      // max-w-none: with Tailwind's img max-width the flag reports no width to
      // the table, the column collapses to its padding and squeezes it flat
      // Scaled rather than resized on mobile: a transform leaves the layout box
      // alone, so the column keeps its width
      className="inline-block max-w-none rounded-sm object-contain align-middle w-[26px] h-[18px] scale-[0.8] md:w-[20px] md:h-[14px] md:scale-100"
    />
  )
}
