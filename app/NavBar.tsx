"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"

const mainNavItems = [
  { href: "/fifa", label: "FIFA" },
  { href: "/fpl", label: "FPL" },
  { href: "/bets", label: "BETS" },
  { href: "/7oker", label: "7OKER" },
  { href: "/gg", label: "GG" },
  { href: "/poker", label: "HOLDEM" },
  { href: "/brecords", label: "BRECORDS" },
]

export default function NavBar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const renderNavLink = (href: string, label: string, onClick?: () => void) => (
    <Link
      key={href}
      href={href}
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium relative ${
        pathname === href ? "text-white" : "text-gray-300 hover:text-white"
      }`}
    >
      {label}
      {pathname === href && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>}
    </Link>
  )

  return (
    <nav className="bg-gray-800 text-white">
      {/* Desktop / top bar */}
      <div className="container mx-auto flex items-center px-4 py-3">
        {/* Logo */}
        <div className="flex-none">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Image src="/imgs/logo.png" alt="Bearos Club logo" width={36} height={36} className="rounded-full" />
            <span className="hidden sm:inline">Bearos Club</span>
          </Link>
        </div>

        {/* Desktop nav — hidden on mobile */}
        <div className="hidden md:flex flex-1 justify-center space-x-1">
          {mainNavItems.slice(0, 6).map((item) => renderNavLink(item.href, item.label))}
        </div>
        <div className="hidden md:flex flex-none">
          {renderNavLink("/brecords", "BRECORDS")}
        </div>

        {/* Hamburger button — visible on mobile */}
        <button
          className="md:hidden ml-auto p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="md:hidden border-t border-gray-700 px-4 py-2 flex flex-col relative z-20">
            {mainNavItems.map((item) => renderNavLink(item.href, item.label, () => setMenuOpen(false)))}
          </div>
        </>
      )}
    </nav>
  )
}
