"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

/**
 * A small tooltip above its trigger, drawn on the page itself (portalled to
 * <body>, fixed position) so a scrolling or rounded table around the trigger
 * can't clip it. Shown on hover and on focus.
 */
export default function HoverTip({ tip, children }: { tip: React.ReactNode; children: React.ReactNode }) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null)

  const show = (e: React.SyntheticEvent<HTMLSpanElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setAt({ x: r.left + r.width / 2, y: r.top })
  }
  const hide = () => setAt(null)

  // A fixed tip would stay behind if the page (or the table) scrolled under it
  useEffect(() => {
    if (!at) return
    const close = () => setAt(null)
    window.addEventListener("scroll", close, { capture: true, passive: true })
    return () => window.removeEventListener("scroll", close, { capture: true })
  }, [at])

  return (
    <span className="inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {at &&
        createPortal(
          <span
            role="tooltip"
            className="pointer-events-none fixed z-[100] flex -translate-x-1/2 -translate-y-full flex-col items-center pb-1.5"
            style={{ left: at.x, top: at.y }}
          >
            <span className="whitespace-nowrap rounded-md border border-hairline-strong bg-surface-2 px-2 py-1 font-mono text-[10px] text-ink">
              {tip}
            </span>
            <span className="-mt-1 h-1.5 w-1.5 rotate-45 border-b border-r border-hairline-strong bg-surface-2" />
          </span>,
          document.body,
        )}
    </span>
  )
}
