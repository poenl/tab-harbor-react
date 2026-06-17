import { useTranslation } from '@/i18n'
import { useTheme } from '@/stores/theme'
import { useSavedSessionsStore } from '@/stores/savedSessions'
import type { TabScope, SavedSessionNavDisplayMode } from '@/constants/preferences'
import { toast } from 'sonner'
import { closeDuplicateNewTabs } from '@/utils/close-duplicate-tabs'
import { InlineSelect, SectionDivider, ThemeLabel } from './AppearancePanel'

function ToggleSwitch({
  pressed,
  onToggle,
  label
}: {
  pressed: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <div className="theme-menu-section">
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <button
          type="button"
          role="switch"
          aria-checked={pressed}
          onClick={onToggle}
          className={`relative w-9 h-5 rounded-full border transition-all duration-200 shrink-0 p-0 ${
            pressed
              ? 'bg-accent border-transparent'
              : 'bg-[color-mix(in_srgb,var(--border)_40%,var(--muted)_60%)] border-[color-mix(in_srgb,var(--border)_40%,transparent)]'
          }`}
        >
          <span
            className={`absolute top-[1.5px] left-[1.5px] size-4 rounded-full bg-card shadow-sm transition-transform duration-200 ease-out ${
              pressed ? 'translate-x-4' : ''
            }`}
          />
        </button>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.16em] cursor-pointer">
          {label}
        </span>
      </label>
    </div>
  )
}

export function FeaturesPanel() {
  const { t } = useTranslation()
  const { preferences, updatePreferences } = useTheme()
  const restoreMode = useSavedSessionsStore((s) => s.restoreMode)
  const setRestoreMode = useSavedSessionsStore((s) => s.setRestoreMode)

  return (
    <div className="flex flex-col gap-0">
      <ToggleSwitch
        pressed={preferences.hitokotoEnabled}
        onToggle={() => updatePreferences({ hitokotoEnabled: !preferences.hitokotoEnabled })}
        label={t('hitokotoLabel')}
      />

      <SectionDivider />

      <ToggleSwitch
        pressed={preferences.sleepControlEnabled}
        onToggle={() =>
          updatePreferences({ sleepControlEnabled: !preferences.sleepControlEnabled })
        }
        label={t('sleepControlLabel')}
      />

      <SectionDivider />

      <ToggleSwitch
        pressed={preferences.closeDuplicateNewTabsEnabled}
        onToggle={async () => {
          const next = !preferences.closeDuplicateNewTabsEnabled
          await updatePreferences({ closeDuplicateNewTabsEnabled: next })
          if (next) {
            const count = await closeDuplicateNewTabs()
            if (count > 0) toast(t('toastClosedDuplicatesKeptOne'))
          }
        }}
        label={t('closeDuplicateNewTabsLabel')}
      />

      <SectionDivider />

      <div className="theme-menu-section">
        <div className="flex items-center justify-between gap-2.5">
          <ThemeLabel>{t('tabScopeLabel')}</ThemeLabel>
          <InlineSelect
            options={[
              { key: 'current-window', label: t('tabScopeCurrentWindow') },
              { key: 'all-windows', label: t('tabScopeAllWindows') }
            ]}
            value={preferences.tabScope}
            onChange={(v) => updatePreferences({ tabScope: v as TabScope })}
          />
        </div>
      </div>

      {/* ── 会话 ── */}
      <SectionDivider />
      <div className="theme-menu-section space-y-3">
        <ThemeLabel>{t('savedSessionSettings')}</ThemeLabel>

        <div className="flex items-center justify-between gap-2.5">
          <ThemeLabel>{t('savedSessionRestoreModeLabel')}</ThemeLabel>
          <InlineSelect
            options={[
              { key: 'new-window', label: t('savedSessionRestoreModeNewWindow') },
              { key: 'current-window', label: t('savedSessionRestoreModeCurrentWindow') }
            ]}
            value={restoreMode}
            onChange={(v) => setRestoreMode(v as 'new-window' | 'current-window')}
          />
        </div>

        <div className="flex items-center justify-between gap-2.5">
          <ThemeLabel>{t('savedSessionNavDisplayModeLabel')}</ThemeLabel>
          <InlineSelect
            options={[
              { key: 'icon', label: t('savedSessionNavDisplayModeIcon') },
              { key: 'name', label: t('savedSessionNavDisplayModeName') }
            ]}
            value={preferences.savedSessionNavDisplayMode}
            onChange={(v) =>
              updatePreferences({
                savedSessionNavDisplayMode: v as SavedSessionNavDisplayMode
              })
            }
          />
        </div>
      </div>
    </div>
  )
}
