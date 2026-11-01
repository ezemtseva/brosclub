"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import ThemeToggle, { applyTheme, useTheme } from "../components/ThemeToggle"
import { applyStandingsView, useStandingsView } from "../lib/standingsView"

const mainNavItems = [
  { href: "/fifa", label: "FIFA" },
  { href: "/fpl", label: "FPL" },
  { href: "/bets", label: "BETS" },
  { href: "/7oker", label: "7OKER" },
  // Phones file this one under Other
  { href: "/poker", label: "HOLDEM", phoneInOther: true },
]

const tabClass = (active: boolean) =>
  `shrink-0 whitespace-nowrap rounded-full px-2 py-2 text-[13px] md:px-[14px] md:py-[10px] md:text-sm ${
    active
      ? "bg-accent font-semibold text-accent-foreground"
      : "font-medium text-ink hover:text-[color:var(--accent-text)]"
  }`

/** Phones only: an Other tab holding Holdem, the standings view and the theme switch, in words. */
function OtherMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const theme = useTheme()
  const next = theme === "dark" ? "light" : "dark"
  const view = useStandingsView()
  const otherItems = mainNavItems.filter((item) => item.phoneInOther)
  const active = otherItems.some((item) => item.href === pathname)

  // Closes on a tap elsewhere and after moving to another page
  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [open])
  useEffect(() => setOpen(false), [pathname])

  const itemClass = "block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-surface-3"

  return (
    <div ref={ref} className="relative shrink-0 md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={tabClass(active)}
      >
        OTHER
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[160px] rounded-xl border border-hairline-strong bg-surface-2 p-1.5 shadow-lg">
          {otherItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === pathname ? "page" : undefined}
              className={`${itemClass} ${item.href === pathname ? "text-[color:var(--accent-text)]" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          {/* Pages above the rule, settings below */}
          <div role="separator" className="mx-1.5 my-1.5 border-t border-hairline-strong" />
          {/* Offered on every page: where there are no standings it just stores
              the choice for the cup pages */}
          <button
            type="button"
            onClick={() => {
              applyStandingsView(view === "cards" ? "table" : "cards")
              setOpen(false)
            }}
            className={itemClass}
          >
            {view === "cards" ? "TABLE VIEW" : "CARD VIEW"}
          </button>
          <button
            type="button"
            onClick={() => {
              applyTheme(next)
              setOpen(false)
            }}
            className={itemClass}
          >
            {next === "light" ? "LIGHT THEME" : "DARK THEME"}
          </button>
        </div>
      )}
    </div>
  )
}

export default function NavBar() {
  const pathname = usePathname()

  return (
    // Pinned while scrolling; opaque so the page slides under it unseen
    <header className="sticky top-0 z-40 border-b border-hairline bg-night">
      <nav
        aria-label="Main"
        // Phones keep logo and tabs on one line; wider screens may wrap
        className="mx-auto flex max-w-page items-center justify-between gap-2 px-4 py-3 md:flex-wrap md:gap-4 md:px-8 md:py-[18px]"
      >
        <Link href="/" aria-label="Bearos Club" className="flex shrink-0 items-center gap-3">
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
          {/* Phones show the logo alone */}
          <span className="hidden font-display text-[15px] font-bold tracking-[0.04em] md:inline">BEAROS CLUB</span>
        </Link>

        {/* Phones space the tabs with gaps, so the lime pill stays its size */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:flex-none md:flex-wrap md:gap-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`${tabClass(pathname === item.href)} ${item.phoneInOther ? "hidden md:inline" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          <OtherMenu pathname={pathname} />
        </div>

        {/* On phones the theme switch lives in Other */}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
