"use client"

import { useEffect, useState } from "react"

export type StandingsView = "cards" | "table"

/**
 * One key for every cup page. The layout's inline script copies it onto
 * <html data-standings-view> before the first paint, and the CSS shows the
 * matching view and button from that, so a stored "table" never flashes cards.
 */
const VIEW_KEY = "standings-view"

function currentView(): StandingsView {
  return document.documentElement.dataset.standingsView === "table" ? "table" : "cards"
}

export function applyStandingsView(view: StandingsView) {
  document.documentElement.dataset.standingsView = view
  try {
    localStorage.setItem(VIEW_KEY, view)
  } catch {}
}

/**
 * Follows the attribute on <html>, so the desktop switch and the phone's
 * Other menu stay in step whichever one changed it.
 */
export function useStandingsView(): StandingsView {
  const [view, setView] = useState<StandingsView>("cards")

  useEffect(() => {
    setView(currentView())
    const observer = new MutationObserver(() => setView(currentView()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-standings-view"] })
    return () => observer.disconnect()
  }, [])

  return view
}
