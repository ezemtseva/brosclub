"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const mainNavItems = [
  { href: "/fifa", label: "FIFA" },
  { href: "/fpl", label: "FPL" },
  { href: "/bets", label: "Bets" },
  { href: "/poker", label: "Holdem" },
  { href: "/7oker", label: "7oker" },
  { href: "/gg", label: "GG" },
]

export default function NavBar() {
  const pathname = usePathname()

  const renderNavLink = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`px-3 py-2 text-sm font-medium relative ${
        pathname === href ? "text-white" : "text-gray-300 hover:text-white"
      }`}
    >
      {label}
      {pathname === href && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>}
    </Link>
  )

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center">
        {/* Left - Logo */}
        <div className="flex-none">
          <Link href="/" className="text-xl font-bold">
            Bearos Club
          </Link>
        </div>

        {/* Center - Main Navigation */}
        <div className="flex-1 flex justify-center space-x-4">
          {mainNavItems.map((item) => renderNavLink(item.href, item.label))}
        </div>

        {/* Right - Brecords */}
        <div className="flex-none">{renderNavLink("/brecords", "Brecords")}</div>
      </div>
    </nav>
  )
}

