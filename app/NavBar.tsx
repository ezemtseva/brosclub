"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { applyTheme, useTheme } from "../components/ThemeToggle"
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

  // The colour is left to each item: two text colours in one class list clash
  const itemBase = "block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-surface-3"
  const itemClass = `${itemBase} text-ink`

  return (
    <div ref={ref} className="relative shrink-0 md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        aria-label="More"
        // Three bars, the usual "more" menu; lime like a tab when Holdem is open
        className={`${tabClass(active)} flex items-center justify-center`}
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[160px] rounded-xl border border-hairline-strong bg-surface-2 p-1.5 shadow-lg">
          {otherItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === pathname ? "page" : undefined}
              className={`${itemBase} ${item.href === pathname ? "text-[color:var(--accent-text)]" : "text-ink"}`}
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

/**
 * Wide screens: a gear holding the theme and the standings view, each a
 * two-way switch; it stays open while switching and closes on a click elsewhere.
 */
function SettingsMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const theme = useTheme()
  const view = useStandingsView()

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", close)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("pointerdown", close)
      document.removeEventListener("keydown", escape)
    }
  }, [open])
  useEffect(() => setOpen(false), [pathname])

  const option = (active: boolean) =>
    `min-h-9 flex-1 whitespace-nowrap rounded-full px-3.5 text-[13px] transition-colors ${
      active ? "bg-ink font-semibold text-night" : "text-ink-2 hover:text-ink"
    }`
  const label = "mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted"

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        aria-label="Settings"
        title="Settings"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline-strong text-ink transition-colors hover:border-ink"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[240px] rounded-xl border border-hairline-strong bg-surface-2 p-4 shadow-lg">
          <div className={label}>Theme</div>
          <div role="group" aria-label="Theme" className="flex rounded-full bg-track p-1">
            <button type="button" aria-pressed={theme === "dark"} onClick={() => applyTheme("dark")} className={option(theme === "dark")}>
              Dark
            </button>
            <button type="button" aria-pressed={theme === "light"} onClick={() => applyTheme("light")} className={option(theme === "light")}>
              Light
            </button>
          </div>
          {/* Offered on every page: where there are no standings it just stores
              the choice for the cup pages */}
          <div className={`${label} mt-4`}>Standings view</div>
          <div role="group" aria-label="Standings view" className="flex rounded-full bg-track p-1">
            <button type="button" aria-pressed={view === "cards"} onClick={() => applyStandingsView("cards")} className={option(view === "cards")}>
              Cards
            </button>
            <button type="button" aria-pressed={view === "table"} onClick={() => applyStandingsView("table")} className={option(view === "table")}>
              Table
            </button>
          </div>
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

        {/* On phones the theme and view switches live in Other */}
        <SettingsMenu pathname={pathname} />
      </nav>
    </header>
  )
}
