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
