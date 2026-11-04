"use client"

import type React from "react"
import { useState } from "react"

/**
 * A lime button that shows or hides the content. By default it is for phones
 * only: wider screens always show the content and never see the button; with
 * `everywhere` the button works on every screen. With `heading` the heading's
 * row is drawn here too: wider screens get the button at its right end, phones
 * keep it below, and the content starts hidden on every screen. `className`
 * styles the content box once it shows (its display comes from here, so leave
 * that out).
 */
export default function MobileReveal({
  showLabel,
  hideLabel,
  everywhere = false,
  heading,
  className = "",
  children,
}: {
  showLabel: React.ReactNode
  hideLabel: React.ReactNode
  everywhere?: boolean
  /** The section's heading, with the button on its row on wider screens */
  heading?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  // A small lime circle with the arrow, the words beside it; the whole row is the tap target
  const button = (extra: string) => (
    <button
      type="button"
      aria-expanded={open}
      onClick={() => setOpen((value) => !value)}
      className={`flex min-h-[44px] items-center gap-3 text-sm font-semibold text-ink ${extra}`}
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
  )

  if (heading) {
    return (
      <>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          {heading}
          {/* At the row's right end the circle follows the words, closing the line */}
          {button("hidden md:flex md:flex-row-reverse")}
        </div>
        {button("mb-6 md:hidden")}
        <div className={`${open ? "grid" : "hidden"} ${className}`}>{children}</div>
      </>
    )
  }

  return (
    <>
      {button(`mb-6 ${everywhere ? "" : "md:hidden"}`)}
      <div className={`${open ? "grid" : "hidden"} ${everywhere ? "" : "md:grid"} ${className}`}>{children}</div>
    </>
  )
}
