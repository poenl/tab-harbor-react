import { useTranslation } from '@/i18n'
import type { DomainGroup } from '@/newtab/utils/domain-grouping.ts'
import { DomainGroupCard } from './DomainGroup.tsx'
import { EmptyState } from './EmptyState.tsx'
import { useSelectMode } from './SelectModeContext.tsx'

interface TabGroupListProps {
  groups: DomainGroup[]
  loading: boolean
}

export function TabGroupList({ groups, loading }: TabGroupListProps) {
  const { t } = useTranslation()
  const { selectTarget } = useSelectMode()

  if (loading) {
    return <div>{t('loading')}</div>
  }

  if (groups.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="flex flex-col gap-3">
      {selectTarget === '*' ? (
        <DomainGroupCard groups={groups} />
      ) : (
        groups.map((group) => (
          <div key={group.domain} data-domain={group.domain} className="rounded-2xl">
            <DomainGroupCard groups={[group]} />
          </div>
        ))
      )}
    </div>
  )
}
