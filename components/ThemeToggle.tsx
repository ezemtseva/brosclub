"use client"

import { useEffect, useState } from "react"

export type Theme = "dark" | "light"

/** Reads the theme the no-flash script in <head> already applied. */
function currentTheme(): Theme {
  if (typeof document === "undefined") return "dark"
  return document.documentElement.classList.contains("light") ? "light" : "dark"
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("light", theme === "light")
  // The browser bar follows the site's theme, not the system's
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#F7F8FA" : "#0B0C0F")
  try {
    localStorage.setItem("theme", theme)
  } catch {
    // private mode — the choice just does not survive the tab
  }
  // Charts read their colours from CSS variables, so they need a nudge
  window.dispatchEvent(new CustomEvent("themechange", { detail: theme }))
}

/**
 * Watches the class on <html> so components can re-read theme colours.
 * Returns "dark" on the server and on the first client render, which matches
 * the class the no-flash script sets before React hydrates.
 */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    setTheme(currentTheme())
    const observer = new MutationObserver(() => setTheme(currentTheme()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return theme
}

export default function ThemeToggle() {
  const theme = useTheme()
  const next = theme === "dark" ? "light" : "dark"

  return (
    <button
      type="button"
      onClick={() => applyTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline-strong text-ink transition-colors hover:border-ink"
    >
      {theme === "dark" ? (
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}
