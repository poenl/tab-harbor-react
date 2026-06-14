import type { DomainGroup } from '@/newtab/utils/domain-grouping.ts'
import { DomainGroupCard } from './DomainGroup.tsx'
import { EmptyState } from './EmptyState.tsx'

interface TabGroupListProps {
  groups: DomainGroup[]
  loading: boolean
  onCloseTab?: (id: number) => void
  onFocusTab?: (id: number) => void
}

export function TabGroupList({ groups, loading, onCloseTab, onFocusTab }: TabGroupListProps) {
  // ── 标签组列表（loading / empty / list） ──
  if (loading) {
    return <div>Loading...</div>
  }

  if (groups.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <div key={group.domain} data-domain={group.domain}>
          <DomainGroupCard
            group={group}
            onCloseTab={onCloseTab}
            onFocusTab={onFocusTab}
          />
        </div>
      ))}
    </div>
  )
}
