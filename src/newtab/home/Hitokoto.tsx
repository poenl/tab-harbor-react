import { useHitokoto } from '../hooks/useHitokoto'

export function Hitokoto() {
  const { entry } = useHitokoto()
  if (!entry) return null

  const from = [entry.from_who, entry.from].filter(Boolean).join(' · ')
  const attribution = from ? ` — ${from}` : ''

  return (
    // ── 一言 ──
    <div
      aria-live="polite"
      role="note"
      className="text-muted-foreground max-w-130 font-serif text-sm leading-[1.6]"
    >
      <span className="italic">{entry.hitokoto}</span>
      {attribution && (
        <span className="text-muted-foreground text-xs whitespace-nowrap not-italic">
          {attribution}
        </span>
      )}
    </div>
  )
}
