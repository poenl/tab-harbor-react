import { AnimatePresence, motion } from 'motion/react'
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
        <AnimatePresence>
          {groups.map((group, i) => (
            <motion.div
              key={group.domain}
              data-domain={group.domain}
              layout
              initial={{ opacity: 0, y: -12 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.3, ease: 'easeOut', delay: i * 0.05 }
              }}
              exit={{ opacity: 0, transition: { duration: 0.1, ease: 'easeOut' } }}
              className="rounded-2xl overflow-hidden"
            >
              <DomainGroupCard groups={[group]} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}
