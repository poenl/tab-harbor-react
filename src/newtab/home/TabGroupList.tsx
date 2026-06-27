import { useTranslation } from '@/i18n'
import type { DomainGroup } from '@/newtab/utils/domain-grouping.ts'
import { DomainGroupCard } from './DomainGroup.tsx'
import { EmptyState } from './EmptyState.tsx'

interface TabGroupListProps {
  groups: DomainGroup[]
  loading: boolean
  onSleepTab?: (id: number) => void
  onSleepGroup?: (domain: string) => void
  onSaveTab?: (tab: any) => void
  onSaveGroup?: (domain: string) => void
  sleepControlEnabled?: boolean

  // Selection
  selectedTabIds?: Set<number>
  selectTarget?: string | null
  onToggleTab?: (id: number) => void
  onToggleGroup?: (domain: string) => void
  onSelectCancel?: () => void
  onSelectAll?: () => void
}

export function TabGroupList({
  groups,
  loading,
  onSleepTab,
  onSleepGroup,
  onSaveTab,
  onSaveGroup,
  sleepControlEnabled,
  selectedTabIds,
  selectTarget,
  onToggleTab,
  onToggleGroup,
  onSelectCancel,
  onSelectAll
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
          showSelectAll
          onSelectAll={onSelectAll}
        />
      ) : (
        groups.map((group) => {
          const isSelect = selectTarget === group.domain
          return (
            <div key={group.domain} data-domain={group.domain} className="rounded-2xl">
              <DomainGroupCard
                mode={isSelect ? 'select' : 'view'}
                groups={[group]}
                onSleepTab={onSleepTab}
                onSleepGroup={onSleepGroup}
                onSaveTab={onSaveTab}
                onSaveGroup={onSaveGroup}
                sleepControlEnabled={sleepControlEnabled}
                selectedTabIds={selectedTabIds}
                onToggleTab={onToggleTab}
                onToggleGroup={onToggleGroup}
                onSelectCancel={onSelectCancel}
                onSelectAll={onSelectAll}
              />
            </div>
          )
        })
      )}
    </div>
  )
}
