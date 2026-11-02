export default function Footer() {
  return (
    <footer className="border-t border-hairline">
      {/* Same height and side padding as the nav bar: 64px on phones, 80px wider */}
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 text-[13px] text-ink-muted md:h-20 md:px-8">
        <span className="font-display font-bold tracking-[0.04em] text-ink">BEAROS CLUB</span>
        <span className="font-mono">Since 06.09.2012</span>
      </div>
    </footer>
  )
}
