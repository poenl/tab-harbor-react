import { Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import { browser } from 'wxt/browser'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import type { ThemePreferences } from '@/types/theme'
import { DEFAULT_THEME_PREFERENCES } from '@/constants/themes'

export function SavedSessionSettings() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<ThemePreferences>(DEFAULT_THEME_PREFERENCES)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    browser.storage.local.get(STORAGE_KEYS.THEME_PREFERENCES).then(result => {
      const stored = result[STORAGE_KEYS.THEME_PREFERENCES] as ThemePreferences | undefined
      if (stored) setPrefs(stored)
      setLoaded(true)
    })
  }, [])

  async function update(key: keyof ThemePreferences, value: string) {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    await browser.storage.local.set({ [STORAGE_KEYS.THEME_PREFERENCES]: next })
  }

  if (!loaded) return null

  return (
    // ── 已保存页面设置 ──
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-muted-foreground bg-none border-none cursor-pointer hover:text-foreground transition-colors duration-150"
      >
        <Settings strokeWidth={1.8} className="w-3.5 h-3.5" />
        {t('savedSessionSettings')}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-card border border-border rounded-xl shadow-lg p-4 z-50">
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground">{t('savedSessionRestoreModeLabel')}</span>
              <select
                value={prefs.savedSessionRestoreMode}
                onChange={e => update('savedSessionRestoreMode', e.target.value)}
                className="text-xs bg-secondary text-foreground border border-border rounded-md px-2 py-1.5 outline-none"
              >
                <option value="new-window">{t('savedSessionRestoreModeNewWindow')}</option>
                <option value="current-window">{t('savedSessionRestoreModeCurrentWindow')}</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground">{t('savedSessionNavDisplayModeLabel')}</span>
              <select
                value={prefs.savedSessionNavDisplayMode}
                onChange={e => update('savedSessionNavDisplayMode', e.target.value)}
                className="text-xs bg-secondary text-foreground border border-border rounded-md px-2 py-1.5 outline-none"
              >
                <option value="icon">{t('savedSessionNavDisplayModeIcon')}</option>
                <option value="name">{t('savedSessionNavDisplayModeName')}</option>
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
