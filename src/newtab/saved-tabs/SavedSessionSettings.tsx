import { Settings } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/i18n'
import { useSavedSessionsStore } from '@/stores/savedSessions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SavedSessionSettings() {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const restoreMode = useSavedSessionsStore(s => s.restoreMode)
  const setRestoreMode = useSavedSessionsStore(s => s.setRestoreMode)
  const [navDisplayMode, setNavDisplayMode] = useState('name')

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    // ── 已保存页面设置 ──
    <div className="relative" ref={panelRef}>
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
              <Select value={restoreMode} onValueChange={(v) => setRestoreMode(v as 'new-window' | 'current-window')}>
                <SelectTrigger className="w-full bg-secondary text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-window">{t('savedSessionRestoreModeNewWindow')}</SelectItem>
                  <SelectItem value="current-window">{t('savedSessionRestoreModeCurrentWindow')}</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground">{t('savedSessionNavDisplayModeLabel')}</span>
              <Select value={navDisplayMode} onValueChange={setNavDisplayMode}>
                <SelectTrigger className="w-full bg-secondary text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="icon">{t('savedSessionNavDisplayModeIcon')}</SelectItem>
                  <SelectItem value="name">{t('savedSessionNavDisplayModeName')}</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
