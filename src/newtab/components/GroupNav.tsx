import type { DomainGroup } from '@/newtab/utils/domain-grouping.ts'

interface GroupNavProps {
  groups: DomainGroup[]
  onNavigate?: (domain: string) => void
}

export function GroupNav({ groups, onNavigate }: GroupNavProps) {
  if (groups.length <= 1) return null

  return (
    <nav className="flex gap-[10px] mb-[14px] flex-wrap">
      {groups.map((group) => {
        const label = group.label || group.domain
        const initial = label.charAt(0).toUpperCase()

        return (
          <button
            key={group.domain}
            onClick={() => onNavigate?.(group.domain)}
            className="size-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-240"
            style={{
              border: '1px solid color-mix(in srgb, var(--warm-gray) 70%, var(--workspace-accent-border) 30%)',
              backgroundColor: 'color-mix(in srgb, var(--card-bg) calc(var(--custom-surface-opacity) + 64%), transparent)',
              color: 'var(--workspace-chip-text)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--theme-accent-muted)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = ''
              ;(e.currentTarget as HTMLElement).style.transform = ''
            }}
            title={label}
          >
            {initial}
          </button>
        )
      })}
    </nav>
  )
}
