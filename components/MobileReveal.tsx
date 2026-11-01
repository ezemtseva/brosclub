"use client"

import type React from "react"
import { useState } from "react"

/**
 * Phones get a lime button that shows or hides the content; wider screens
 * always show it and never see the button. `className` styles the content
 * box once it shows (its display comes from here, so leave that out).
 */
export default function MobileReveal({
  showLabel,
  hideLabel,
  className = "",
  children,
}: {
  showLabel: string
  hideLabel: string
  className?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* A small lime circle with the arrow, the words beside it; the whole row is the tap target */}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="mb-6 flex min-h-[44px] items-center gap-3 text-sm font-semibold text-ink md:hidden"
      >
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
        {open ? hideLabel : showLabel}
      </button>
      <div className={`${open ? "grid" : "hidden"} md:grid ${className}`}>{children}</div>
    </>
  )
}
