import { useHitokoto } from '../hooks/useHitokoto'

export function Hitokoto() {
  const { entry, loading } = useHitokoto()
  if (loading || !entry) return null

  const from = [entry.from_who, entry.from].filter(Boolean).join(' · ')
  const attribution = from ? ` — ${from}` : ''

  return (
    // ── 一言 ──
    <div
      aria-live="polite"
      role="note"
      className="font-serif text-sm leading-[1.6] text-muted-foreground max-w-[520px]"
    >
      <span className="italic">{entry.hitokoto}</span>
      {attribution && (
        <span className="text-xs text-muted-foreground not-italic whitespace-nowrap">
          {attribution}
        </span>
      )}
    </div>
  )
}
