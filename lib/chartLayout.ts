/**
 * Phone layout shared by the season-progress line charts: no side margins,
 * the Y labels drawn inside the plot just above their gridlines (so they take
 * no column of their own), and far fewer ticks on both axes.
 */

const DESKTOP_MARGIN = { top: 10, right: 10, left: 10, bottom: 5 }
// Top room for a label on the ceiling gridline, which sits above its line; right
// room for half of the last X label, which is centred on the plot's end
const MOBILE_MARGIN = { top: 20, right: 12, left: 0, bottom: 0 }

/** Every nth tick, so a phone gets about `count` labels instead of a dozen. */
export function thinTicks(ticks: number[], count: number): number[] {
  if (ticks.length <= count) return ticks
  const step = Math.ceil((ticks.length - 1) / (count - 1))
  return ticks.filter((_, i) => i % step === 0)
}

/**
 * An axis that ends at the first `step` at or past `max` (never before one step,
 * never past `cap`), with a labelled tick on every step: on a phone the chart
 * zooms to the season played so far instead of drawing the whole year empty.
 */
export function fitAxis(max: number, step: number, cap = Infinity) {
  const end = Math.min(cap, Math.max(step, Math.ceil(max / step) * step))
  const ticks: number[] = []
  for (let tick = step; tick <= end; tick += step) ticks.push(tick)
  return { domain: [0, end] as [number, number], ticks }
}

/** The furthest game with a result and the highest value across the bears' lines. */
export function dataExtent(data: { games: number; [bear: string]: number | null }[]) {
  let maxX = 0
  let maxY = 0
  for (const point of data) {
    for (const [key, value] of Object.entries(point)) {
      if (key === "games" || value === null || value === undefined) continue
      maxY = Math.max(maxY, value)
      maxX = Math.max(maxX, point.games)
    }
  }
  return { maxX, maxY }
}

export function chartLayout(isMobile: boolean, desktopMargin = DESKTOP_MARGIN) {
  return {
    margin: isMobile ? MOBILE_MARGIN : desktopMargin,
    /** Spread onto <YAxis>; `tick` still needs the theme colours added */
    // Not 0: recharts skips drawing an axis with no width. No axis line either —
    // the labels sit on the gridlines
    yAxis: isMobile ? { mirror: true, width: 1, axisLine: false, tickLine: false } : {},
    /** Lifts a mirrored label off its gridline */
    yTickOffset: isMobile ? { dy: -7 } : {},
    // Zero is left out on phones: with no margins it would be clipped at the
    // edge or sit on the lines' start
    xTicks: (ticks: number[]) => (isMobile ? thinTicks(ticks, 5).filter((tick) => tick !== 0) : ticks),
    yTicks: (ticks: number[]) => (isMobile ? thinTicks(ticks, 4).filter((tick) => tick !== 0) : ticks),
  }
}
