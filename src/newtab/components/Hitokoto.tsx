import { useHitokoto } from '../hooks/useHitokoto'

export function Hitokoto() {
  const { entry, loading } = useHitokoto()
  if (loading || !entry) return null

  const from = [entry.from_who, entry.from].filter(Boolean).join(' · ')
  const attribution = from ? ` — ${from}` : ''

  return (
    <div
      className="hitokoto mt-[14px] max-w-[520px] font-serif text-sm leading-relaxed tracking-[0.01em]"
      style={{
        fontFamily: "'Libre Caslon Display', serif",
        color: 'color-mix(in srgb, var(--muted) 85%, var(--ink) 15%)',
        fontStyle: 'italic',
      }}
      aria-live="polite"
      role="note"
    >
      <span>{entry.hitokoto}</span>
      {attribution && (
        <span
          className="text-xs not-italic whitespace-nowrap"
          style={{ color: 'var(--muted)' }}
        >
          {attribution}
        </span>
      )}
    </div>
  )
}
