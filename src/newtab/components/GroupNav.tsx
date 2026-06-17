import { useState } from 'react'
import { useTranslation } from '@/i18n'
import type { DomainGroup } from '@/newtab/utils/domain-grouping.ts'
import { getIconSources, getFallbackLabel } from '@/newtab/utils/icon-utils.ts'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface GroupNavProps {
  groups: DomainGroup[]
  onNavigate?: (domain: string) => void
}

// ── 圆点图标（网站图标 → 首字母） ──
function GroupIcon({ group }: { group: DomainGroup }) {
  const label = group.label || group.domain
  const [imgError, setImgError] = useState(false)

  const preferredTab =
    group.tabs.find((t) => {
      const url = t.favIconUrl || ''
      return url.startsWith('https://') || url.startsWith('data:')
    }) ||
    group.tabs.find((t) => t.url) ||
    group.tabs[0]

  const fallbackLabel = getFallbackLabel(label, preferredTab?.url || group.domain)

  if (preferredTab?.favIconUrl && !imgError) {
    return (
      <img
        src={preferredTab.favIconUrl}
        alt=""
        draggable={false}
        onError={() => setImgError(true)}
        className="w-5 h-5 rounded-xs object-contain"
      />
    )
  }

  if (preferredTab?.url && !imgError) {
    const sources = getIconSources(preferredTab.url, 32)
    if (sources[0]) {
      return (
        <img
          src={sources[0]}
          alt=""
          draggable={false}
          data-fallback-src={sources[1]}
          onError={(e) => {
            const fallback = (e.currentTarget as HTMLImageElement).getAttribute('data-fallback-src')
            if (fallback) {
              e.currentTarget.src = fallback
              e.currentTarget.removeAttribute('data-fallback-src')
            } else {
              setImgError(true)
            }
          }}
          className="w-5 h-5 rounded-xs object-contain"
        />
      )
    }
  }

  return (
    <span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[9px] font-bold text-primary bg-secondary">
      {fallbackLabel.slice(0, 2)}
    </span>
  )
}

export function GroupNav({ groups, onNavigate }: GroupNavProps) {
  const { t } = useTranslation()

  if (!groups.length) return null

  return (
    // ── 分组导航圆点 ──
    <nav className="flex gap-2.5 flex-wrap flex-1 min-w-0">
      {groups.map((group) => {
        const label = group.label || group.domain

        return (
          <Tooltip key={group.domain}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onNavigate?.(group.domain)}
                aria-label={t('jumpToLabel', { label })}
                draggable={false}
                className="w-10 h-10 rounded-full border border-border bg-card inline-flex items-center justify-center cursor-grab hover:-translate-y-px hover:border-primary transition-[transform,border-color] duration-200 ease-out"
              >
                <GroupIcon group={group} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8}>
              {label}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </nav>
  )
}
