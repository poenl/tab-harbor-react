import { useEffect } from 'react'
import { browser } from 'wxt/browser'
import { useTranslation } from '@/i18n'
import { useSavedSessionsStore } from '@/stores/savedSessions'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { SectionHeader } from '@/newtab/home/SectionHeader.tsx'
import { SavedSessionCard } from './SavedSessionCard.tsx'
import { SavedSessionEmpty } from './SavedSessionEmpty.tsx'

export function SavedTabsPage() {
  const { t } = useTranslation()
  const { sessions, ready, load } = useSavedSessionsStore()

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const listener = (changes: Record<string, { newValue?: unknown }>) => {
      if (STORAGE_KEYS.SAVED_TAB_SESSIONS in changes) {
        load()
      }
    }
    browser.storage.local.onChanged.addListener(listener)
    return () => browser.storage.local.onChanged.removeListener(listener)
  }, [load])

  if (!ready) return null

  return (
    // ── 已保存标签页面 ──
    <section>
      <SectionHeader title={t('workspacePageSavedTabs')} count={sessions.length} />

      {sessions.length === 0 ? (
        <SavedSessionEmpty />
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <SavedSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </section>
  )
}
