import { useEffect } from 'react'
import { browser } from 'wxt/browser'
import { useTranslation } from '@/i18n'
import { useSavedSessionsStore } from '@/stores/savedSessions'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { SectionHeader } from '@/newtab/home/SectionHeader.tsx'
import { SavedSessionCard } from './SavedSessionCard.tsx'
import { SavedSessionEmpty } from './SavedSessionEmpty.tsx'
import { SessionSettingsDropdown } from './SessionSettingsDropdown.tsx'

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
    <div className="grid grid-cols-[1.35fr_0.95fr] gap-8">
      <div className="w-full min-w-0">
        <SectionHeader
          title={t('workspacePageSavedTabs')}
          actions={
            <div className="flex items-center gap-2.5 min-w-0">
              <SessionSettingsDropdown />
              {sessions.length > 0 && (
                <span className="text-xs font-medium tracking-[0.02em] text-primary whitespace-nowrap">
                  {sessions.length}{' '}
                  {t(sessions.length === 1 ? 'sessionWordSingular' : 'sessionWordPlural')}
                </span>
              )}
            </div>
          }
        />

        {sessions.length === 0 ? (
          <SavedSessionEmpty />
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => (
              <SavedSessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
      <div aria-hidden="true" />
    </div>
  )
}
