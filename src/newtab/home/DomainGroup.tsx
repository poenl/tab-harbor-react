import { useState } from 'react'
import { useTranslation } from '@/i18n'
import type { DomainGroup } from '@/newtab/utils/domain-grouping.ts'
import { TabChip } from './TabChip.tsx'
import { Badge } from '@/components/ui/badge.tsx'

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
    // ── 域名分组卡片 ──
    <div className="bg-card border border-border rounded-2xl p-[14px_16px] flex flex-col gap-2 shadow-[0_14px_28px_var(--tw-shadow-color)] shadow-primary/5 hover:shadow-[0_16px_30px_var(--tw-shadow-color)] hover:shadow-primary/10 hover:-translate-y-px transition-all duration-250">
      {/* ── 卡片标题 + 标签计数 ── */}
      <div className="flex items-center gap-2">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground m-0 flex-1 min-w-0 truncate">
          {group.label || group.domain}
        </h3>
        {group.tabs.length > 1 && (
          <Badge variant="secondary" className="text-[10px] font-semibold rounded-[3px] shrink-0">
            {group.tabs.length}
          </Badge>
        )}
      </div>

      {/* ── 标签列表 ── */}
      <div>
        {visibleTabs.map((tab) => (
          <TabChip
            key={tab.id}
            tab={tab}
            onClose={onCloseTab}
            onFocus={onFocusTab}
          />
        ))}
      </div>

      {/* ── 展开更多按钮 ── */}
      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="self-start text-[11px] text-primary bg-transparent border border-border rounded-md px-3 py-1 cursor-pointer hover:bg-secondary hover:border-primary transition-all duration-150"
        >
          {t('moreCount', { count: group.tabs.length - INITIAL_VISIBLE })}
        </button>
      )}
    </div>
  )
}
