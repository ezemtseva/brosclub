"use client"

import { useTheme } from "../components/ThemeToggle"

/** Grid and axis colours for recharts, per theme. */
export function useChartColors() {
  const theme = useTheme()
  return theme === "light"
    ? { grid: "#E3E6EB", tick: "#6A6F7A", cursor: "#D2D6DD" }
    : { grid: "#22252C", tick: "#9A9DA6", cursor: "#2E323B" }
}
