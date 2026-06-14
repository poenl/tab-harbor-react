import { useTranslation } from '@/i18n'
import type { DomainGroup } from '@/newtab/utils/domain-grouping.ts'
import { DomainGroupCard } from './DomainGroup.tsx'
import { EmptyState } from './EmptyState.tsx'

interface TabGroupListProps {
  groups: DomainGroup[]
  loading: boolean
  onCloseTab?: (id: number) => void
  onFocusTab?: (id: number) => void
  onSleepTab?: (id: number) => void
  onSaveTab?: (tab: any) => void
  onSaveGroup?: (domain: string) => void
  sleepControlEnabled?: boolean

  // Selection
  selectedTabIds?: Set<number>
  selectTarget?: string | null
  onToggleTab?: (id: number) => void
  onToggleGroup?: (domain: string) => void
  onSelectSave?: () => void
  onSelectCancel?: () => void
}

export function TabGroupList({
  groups, loading,
  onCloseTab, onFocusTab, onSleepTab, onSaveTab, onSaveGroup, sleepControlEnabled,
  selectedTabIds, selectTarget, onToggleTab, onToggleGroup, onSelectSave, onSelectCancel,
}: TabGroupListProps) {
  const { t } = useTranslation()

  if (loading) {
    return <div>{t('loading')}</div>
  }

  if (groups.length === 0) {
    return <EmptyState />
  }

  // ── 选择模式：分离选中组和未选中组 ──
  if (selectTarget) {
    const selectedGroups = selectTarget === '*'
      ? groups
      : groups.filter(g => g.domain === selectTarget)

    const remainingGroups = selectTarget === '*'
      ? []
      : groups.filter(g => g.domain !== selectTarget)

    return (
      <div className="flex flex-col gap-3">
        {/* 选中组合并为一张选择卡片 */}
        {selectedGroups.length > 0 && (
          <DomainGroupCard
            mode="select"
            groups={selectedGroups}
            selectedTabIds={selectedTabIds}
            onToggleTab={onToggleTab}
            onToggleGroup={onToggleGroup}
            onSelectCancel={onSelectCancel}
          />
        )}

        {/* 未选中组保持展示模式 */}
        {remainingGroups.map((group) => (
          <div key={group.domain} data-domain={group.domain}>
            <DomainGroupCard
              mode="view"
              groups={[group]}
              onCloseTab={onCloseTab}
              onFocusTab={onFocusTab}
              onSleepTab={onSleepTab}
              onSaveTab={onSaveTab}
              onSaveGroup={onSaveGroup}
              sleepControlEnabled={sleepControlEnabled}
            />
          </div>
        ))}
      </div>
    )
  }

  // ── 展示模式：普通列表 ──
  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <div key={group.domain} data-domain={group.domain}>
          <DomainGroupCard
            mode="view"
            groups={[group]}
            onCloseTab={onCloseTab}
            onFocusTab={onFocusTab}
            onSleepTab={onSleepTab}
            onSaveTab={onSaveTab}
            onSaveGroup={onSaveGroup}
            sleepControlEnabled={sleepControlEnabled}
          />
        </div>
      ))}
    </div>
  )
}
