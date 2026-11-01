"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { CURRENT_SEASON_LABEL } from "../lib/season"
import ThemeToggle from "../components/ThemeToggle"

const mainNavItems = [
  { href: "/fifa", label: "FIFA" },
  { href: "/fpl", label: "FPL" },
  { href: "/bets", label: "Bets" },
  { href: "/7oker", label: "7oker" },
  { href: "/poker", label: "Hold'em" },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <header className="border-b border-hairline">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-8 py-[18px]"
      >
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/imgs/bearos-logo-tight.svg"
            alt=""
            aria-hidden="true"
            width={36}
            height={36}
            // Served as-is: the optimiser does not touch SVG
            unoptimized
            className="h-9 w-9 shrink-0"
          />
          <span className="font-display text-[15px] font-bold tracking-[0.04em]">BEAROS CLUB</span>
        </Link>

        <div className="flex flex-wrap items-center gap-1">
          {mainNavItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-[14px] py-[10px] text-sm ${
                  active
                    ? "bg-ink font-semibold text-night"
                    : "font-medium text-ink hover:text-[color:var(--accent-text)]"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex items-center gap-2 rounded-full border border-hairline-strong px-[14px] py-2 font-mono text-[13px] text-ink-2">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
            {CURRENT_SEASON_LABEL}
          </div>
        </div>
      </nav>
    </header>
  )
}
