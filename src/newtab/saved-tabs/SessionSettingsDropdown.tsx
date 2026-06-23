import { useTranslation } from '@/i18n'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSavedSessionsStore } from '@/stores/savedSessions'
import { useTheme } from '@/stores/theme'
import { InlineSelect } from '@/components/settings/AppearancePanel'
import type { SavedSessionNavDisplayMode } from '@/constants/preferences'

export function SessionSettingsDropdown() {
  const { t } = useTranslation()

  const restoreMode = useSavedSessionsStore((s) => s.restoreMode)
  const setRestoreMode = useSavedSessionsStore((s) => s.setRestoreMode)
  const { preferences, updatePreferences } = useTheme()

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              aria-label={t('savedSessionSettings')}
              className="p-0.75 rounded-full border-none bg-transparent cursor-pointer transition-colors duration-150 text-muted-foreground hover:text-foreground hover:bg-accent/10 data-[state=open]:text-accent data-[state=open]:bg-accent/10"
            >
              <svg
                viewBox="0 0 1024 1024"
                fill="currentColor"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M416.4 958h191.2V849.7c0-12.7 6.4-25.5 19.1-31.9 31.9-12.7 63.7-31.9 89.2-51 12.7-6.4 25.5-6.4 38.2 0l95.6 57.3 95.6-165.7-95.6-57.3C837 588.5 830.6 575.7 837 563c0-19.1 6.4-31.9 6.4-51s0-31.9-6.4-51c0-12.7 6.4-25.5 12.7-31.9l95.6-57.3-95.6-165.7-95.6 57.3c-12.7 6.4-25.5 6.4-38.2 0-25.5-19.1-57.3-38.2-89.2-51-12.7-12.7-19.1-25.5-19.1-38.2V66H416.4v108.3c0 12.7-6.4 25.5-19.1 31.9-31.9 12.7-63.7 31.9-89.2 51-12.7 6.4-25.5 6.4-38.2 0l-95.6-51-95.6 165.6 95.6 57.3c12.7 6.4 19.1 19.1 12.7 31.9 0 19.1-6.4 31.9-6.4 51s0 31.9 6.4 51c6.4 12.7 0 25.5-12.7 31.9l-95.6 57.3 95.6 165.7 95.6-57.3c12.7-6.4 25.5-6.4 38.2 0 25.5 19.1 57.3 38.2 89.2 51 12.7 6.4 19.1 19.1 19.1 31.9V958z m223 63.7H384.6c-19.1 0-31.9-12.7-31.9-31.9v-121c-25.5-12.7-51-25.5-70.1-38.2l-101.9 63.7c-12.7 6.4-31.9 6.4-44.6-12.7L8.6 658.6c-12.7-19.1-6.4-38.2 12.7-44.6l101.9-63.7v-76.5L21.4 410.1c-19.1-6.4-25.5-25.5-12.7-44.6l127.4-223c6.4-12.7 25.5-19.1 44.6-6.4l101.9 63.7c19.1-12.7 44.6-31.9 70.1-38.2V34.1c0-19.1 12.7-31.9 31.9-31.9h254.9c19.1 0 31.9 12.7 31.9 31.9v121.1c25.5 12.7 51 25.5 70.1 38.2l101.9-63.7c12.7-6.4 31.9-6.4 44.6 12.7l127.4 223c12.7 19.1 6.4 38.2-12.7 44.6l-101.9 63.7v76.5l101.9 63.7c12.7 6.4 19.1 25.5 12.7 44.6L888 881.5c-6.4 12.7-25.5 19.1-44.6 12.7l-101.9-63.7c-19.1 12.7-44.6 31.9-70.1 38.2v121.1c-0.1 19.2-12.8 31.9-32 31.9zM512 703.2c-108.3 0-191.2-82.8-191.2-191.2S403.7 320.8 512 320.8 703.2 403.7 703.2 512 620.3 703.2 512 703.2z m0-318.6c-70.1 0-127.4 57.3-127.4 127.4S441.9 639.4 512 639.4 639.4 582.1 639.4 512 582.1 384.6 512 384.6z" />
              </svg>
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">{t('savedSessionSettings')}</TooltipContent>
      </Tooltip>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-62 backdrop-blur-xl border border-border rounded-2xl shadow-lg p-4 bg-transparent ring-0 data-open:animate-none data-closed:animate-none"
        style={
          {
            backgroundColor:
              'color-mix(in srgb, var(--card) calc(40% + var(--custom-surface-opacity, 50%) * 0.6), transparent)'
          } as React.CSSProperties
        }
      >
        {/* ── 默认打开方式 ── */}
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.16em] pl-0.5">
            {t('savedSessionRestoreModeLabel')}
          </span>
          <InlineSelect
            options={[
              { key: 'new-window', label: t('savedSessionRestoreModeNewWindow') },
              { key: 'current-window', label: t('savedSessionRestoreModeCurrentWindow') }
            ]}
            value={restoreMode}
            onChange={(v) => setRestoreMode(v as 'new-window' | 'current-window')}
          />
        </div>

        {/* ── 顶部导航显示 ── */}
        <div className="flex items-center justify-between gap-2.5 mt-3.5 pt-3.5 border-t border-border/18">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.16em] pl-0.5">
            {t('savedSessionNavDisplayModeLabel')}
          </span>
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
      </PopoverContent>
    </Popover>
  )
}
