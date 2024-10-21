import Link from 'next/link'
import './globals.css'
import { Inter } from 'next/font/google'
import NavBar from './NavBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bearos Club',
  description: 'Here is always Sunday',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-base`}>
        <NavBar />
        <main className="container mx-auto mt-1 p-4">
          {children}
        </main>
      </body>
    </html>
  )
}