"use client"

import { useEffect } from "react"

/**
 * Freezes the page behind a modal. `overflow: hidden` alone is not enough on
 * iOS Safari, so the body is pinned with `position: fixed` and the scroll
 * position is restored on close. The removed scrollbar is compensated with
 * padding so the page does not jump on desktop.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const { body } = document
    const scrollY = window.scrollY
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    }

    body.style.overflow = "hidden"
    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.width = "100%"
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      body.style.overflow = previous.overflow
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.width = previous.width
      body.style.paddingRight = previous.paddingRight
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}
