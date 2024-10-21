'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/fifa', label: 'FIFA' },
  { href: '/fpl', label: 'FPL' },
  { href: '/bets', label: 'Bets' },
  { href: '/gg', label: 'GG' },
  { href: '/poker', label: 'Poker' },
  { href: '/brecords', label: 'Brecords' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">Bearos Club</Link>
        <div className="space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-sm font-medium relative ${
                pathname === item.href
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {item.label}
              {pathname === item.href && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}