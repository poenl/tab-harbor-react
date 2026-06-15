import { useTranslation } from '@/i18n'
import { useTheme } from '@/stores/theme'
import { useSavedSessionsStore } from '@/stores/savedSessions'
import { THEME_PALETTES } from '@/constants/preferences'
import type {
  ThemePaletteId,
  ThemeMode,
  SavedSessionNavDisplayMode,
  TabScope
} from '@/constants/preferences'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

function OptionsPage() {
  const { t } = useTranslation()
  const { preferences, updatePreferences } = useTheme()
  const restoreMode = useSavedSessionsStore((s) => s.restoreMode)
  const setRestoreMode = useSavedSessionsStore((s) => s.setRestoreMode)

  return (
    // ── 选项页面主体 ──
    <div className="min-h-screen bg-background text-foreground font-sans antialiased p-6">
      <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl p-6 shadow-lg space-y-6">
        <h1 className="text-lg font-semibold">{t('deskSettings')}</h1>

        {/* ── 外观 ── */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {t('settingsTabAppearance')}
          </h2>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">{t('appearanceMode')}</Label>
            <Select
              value={preferences.mode}
              onValueChange={(v) => updatePreferences({ mode: v as ThemeMode })}
            >
              <SelectTrigger className="w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">{t('themeModeSystem')}</SelectItem>
                <SelectItem value="light">{t('themeModeLight')}</SelectItem>
                <SelectItem value="dark">{t('themeModeDark')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">{t('deskPalette')}</Label>
            <Select
              value={preferences.paletteId}
              onValueChange={(v) => updatePreferences({ paletteId: v as ThemePaletteId })}
            >
              <SelectTrigger className="w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(THEME_PALETTES).map(([id, palette]) => (
                  <SelectItem key={id} value={id}>
                    {palette.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">{t('surfaceDepth')}</Label>
            <input
              type="number"
              min={0}
              max={50}
              value={preferences.surfaceOpacity}
              onChange={(e) =>
                updatePreferences({
                  surfaceOpacity: Math.min(50, Math.max(0, Number(e.target.value)))
                })
              }
              className="w-20 text-xs bg-secondary text-foreground border border-border rounded-md px-2 py-1.5 outline-none text-center"
            />
          </div>
        </section>

        {/* ── 功能 ── */}
        <div className="h-px bg-border/50" />
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {t('settingsTabFeatures')}
          </h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={preferences.hitokotoEnabled}
              onCheckedChange={(v) => updatePreferences({ hitokotoEnabled: v === true })}
            />
            <span className="text-sm">{t('hitokotoLabel')}</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={preferences.sleepControlEnabled}
              onCheckedChange={(v) => updatePreferences({ sleepControlEnabled: v === true })}
            />
            <span className="text-sm">{t('sleepControlLabel')}</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={preferences.closeDuplicateNewTabsEnabled}
              onCheckedChange={(v) =>
                updatePreferences({ closeDuplicateNewTabsEnabled: v === true })
              }
            />
            <span className="text-sm">{t('closeDuplicateNewTabsLabel')}</span>
          </label>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">{t('tabScopeLabel')}</Label>
            <Select
              value={preferences.tabScope}
              onValueChange={(v) => updatePreferences({ tabScope: v as TabScope })}
            >
              <SelectTrigger className="w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-window">{t('tabScopeCurrentWindow')}</SelectItem>
                <SelectItem value="all-windows">{t('tabScopeAllWindows')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* ── 会话 ── */}
        <div className="h-px bg-border/50" />
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {t('savedSessionSettings')}
          </h2>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">{t('savedSessionRestoreModeLabel')}</Label>
            <Select
              value={restoreMode}
              onValueChange={(v) => setRestoreMode(v as 'new-window' | 'current-window')}
            >
              <SelectTrigger className="w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-window">{t('savedSessionRestoreModeNewWindow')}</SelectItem>
                <SelectItem value="current-window">
                  {t('savedSessionRestoreModeCurrentWindow')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">{t('savedSessionNavDisplayModeLabel')}</Label>
            <Select
              value={preferences.savedSessionNavDisplayMode}
              onValueChange={(v) =>
                updatePreferences({ savedSessionNavDisplayMode: v as SavedSessionNavDisplayMode })
              }
            >
              <SelectTrigger className="w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="icon">{t('savedSessionNavDisplayModeIcon')}</SelectItem>
                <SelectItem value="name">{t('savedSessionNavDisplayModeName')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>
      </div>
    </div>
  )
}

export default OptionsPage
