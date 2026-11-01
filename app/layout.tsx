import './globals.css'
import NavBar from './NavBar'
import Footer from './Footer'

export const metadata = {
  title: 'Bearos Club',
  description: 'Here is always Sunday',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/imgs/bearos-logo.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    // iOS only takes a PNG here, and masks it itself — hence the full-bleed square
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Bearos Club',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // The site opens dark whatever the system says, so the browser bar does too;
  // a stored light choice repaints it (see below and applyTheme)
  themeColor: '#0B0C0F',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Runs before the first paint, so a light-theme visitor never sees dark flash.
  // Dark is the default for everyone; only a stored choice of light changes it
  const noFlashTheme = `
    try {
      if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.add('light');
        document.addEventListener('DOMContentLoaded', function () {
          var meta = document.querySelector('meta[name="theme-color"]');
          if (meta) meta.setAttribute('content', '#F7F8FA');
        });
      }
    } catch (e) {}
    // Same for the cup pages' Cards | Table choice — CSS reads the attribute
    try {
      if (localStorage.getItem('standings-view') === 'table') document.documentElement.dataset.standingsView = 'table';
    } catch (e) {}
  `

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
        {/* Geist is not in Next 14's font list, so all three come from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,600..900&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Unbounded:wght@500;700;800&display=swap"
        />
      </head>
      <body className="bg-night text-ink font-sans text-base antialiased">
        <NavBar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
