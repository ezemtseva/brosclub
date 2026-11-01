"use client"

import type React from "react"

type CupHeaderProps = {
  title: React.ReactNode
  tagline?: React.ReactNode
  seasons: readonly string[]
  activeSeason: string
  onSeasonChange: (season: string) => void
  selectId: string
  tabs: readonly string[]
  activeTab: string
  onTabChange: (tab: string) => void
  /** Extra controls shown next to the season picker (Add Game, Sync, …) */
  actions?: React.ReactNode
}

export default function CupHeader({
  title,
  tagline,
  seasons,
  activeSeason,
  onSeasonChange,
  selectId,
  tabs,
  activeTab,
  onTabChange,
  actions,
}: CupHeaderProps) {
  return (
    // Every cup page opens its content 40px below the tabs; phones pull it up to 20
    <section className="mx-auto -mb-5 max-w-page px-8 pt-8 md:mb-0">
      {/* Season picker pinned to the top right, level with the title's top edge.
          Phones keep it beside the title; wider screens may wrap it below */}
      <div className="flex items-start justify-between gap-3 md:flex-wrap md:gap-6">
        <div className="min-w-0 flex-1 md:flex-[999_1_520px]">
          <h1 className="font-display text-[clamp(44px,6vw,84px)] font-extrabold leading-[0.95] tracking-[-0.03em]">
            {title}
          </h1>
          {/* No width cap: a long tagline runs on one line while the page has room.
              Phones leave it out */}
          {tagline && (
            <p className="mt-5 hidden text-[18px] text-ink-2 md:block">
              {/* An inline span, so a wrapped line gets its own highlight */}
              <span className="tagline-highlight">{tagline}</span>
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-end gap-3">
          {actions}
          <div className="flex">
            <select
              id={selectId}
              aria-label="Season"
              value={activeSeason}
              onChange={(e) => onSeasonChange(e.target.value)}
              className="season-select min-h-[44px] rounded-xl border border-hairline-strong bg-surface-2 px-3.5 pr-9 text-[15px] text-ink focus:outline-none"
            >
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <nav className="mt-5 md:mt-10 flex flex-wrap gap-7 border-b border-hairline [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const active = tab === activeTab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              aria-pressed={active}
              className={`-mb-px min-h-[44px] whitespace-nowrap border-b-2 py-3 text-base ${
                active
                  ? "border-[color:var(--tab-line)] font-semibold text-ink"
                  : "border-transparent font-normal text-ink-muted hover:text-ink"
              }`}
            >
              {tab}
            </button>
          )
        })}
      </nav>
    </section>
  )
}
