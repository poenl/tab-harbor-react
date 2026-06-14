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

  return (
    <div className="flex flex-col gap-3">
      {selectTarget === '*' ? (
        <DomainGroupCard
          mode="select"
          groups={groups}
          selectedTabIds={selectedTabIds}
          onToggleTab={onToggleTab}
          onToggleGroup={onToggleGroup}
          onSelectCancel={onSelectCancel}
        />
      ) : (
        groups.map((group) => {
          const isSelect = selectTarget === group.domain
          return (
            <div key={group.domain} data-domain={group.domain}>
              <DomainGroupCard
                mode={isSelect ? 'select' : 'view'}
                groups={[group]}
                onCloseTab={onCloseTab}
                onFocusTab={onFocusTab}
                onSleepTab={onSleepTab}
                onSaveTab={onSaveTab}
                onSaveGroup={onSaveGroup}
                sleepControlEnabled={sleepControlEnabled}
                selectedTabIds={selectedTabIds}
                onToggleTab={onToggleTab}
                onToggleGroup={onToggleGroup}
                onSelectCancel={onSelectCancel}
              />
            </div>
          )
        })
      )}
    </div>
  )
}
