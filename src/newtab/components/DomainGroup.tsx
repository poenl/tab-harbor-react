import { useState } from 'react'
import { useTranslation } from '@/i18n'
import type { DomainGroup } from '@/newtab/utils/domain-grouping.ts'
import { TabChip } from './TabChip.tsx'

const INITIAL_VISIBLE = 8

interface DomainGroupProps {
  group: DomainGroup
  onCloseTab?: (id: number) => void
  onFocusTab?: (id: number) => void
}

export function DomainGroupCard({ group, onCloseTab, onFocusTab }: DomainGroupProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const visibleTabs = expanded ? group.tabs : group.tabs.slice(0, INITIAL_VISIBLE)
  const hasMore = group.tabs.length > INITIAL_VISIBLE

  return (
    <div
      className="group rounded-[16px] p-[14px_16px] border transition-all duration-250 ease"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--card-bg) calc(var(--custom-surface-opacity) + 68%), transparent)',
        borderColor: 'color-mix(in srgb, var(--warm-gray) calc(var(--custom-border-opacity) + 56%), var(--workspace-accent-border) 26%)',
        boxShadow: 'var(--card-shadow)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow-hover)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <h3 className="font-sans text-[15px] font-semibold -tracking-[0.01em] text-ink">
          {group.label || group.domain}
        </h3>
        {group.tabs.length > 1 && (
          <span
            className="text-[10px] font-semibold px-[6px] py-[2px] rounded-[3px]"
            style={{
              color: 'var(--workspace-chip-text)',
              backgroundColor: 'var(--workspace-chip-bg-strong)',
              borderColor: 'var(--workspace-chip-border)',
              border: '1px solid',
            }}
          >
            {group.tabs.length}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0">
        {visibleTabs.map((tab) => (
          <TabChip
            key={tab.id}
            tab={tab}
            onClose={onCloseTab}
            onFocus={onFocusTab}
          />
        ))}
      </div>

      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-1 text-[13px] text-workspace-accent hover:underline"
        >
          {t('moreCount', { count: group.tabs.length - INITIAL_VISIBLE })}
        </button>
      )}
    </div>
  )
}


