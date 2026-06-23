import { useTranslation } from '@/i18n'
import { useTheme } from '@/stores/theme'
import type { TabScope, BookmarksBarSize, BookmarkOpenMode } from '@/constants/preferences'
import { toast } from 'sonner'
import { closeDuplicateNewTabs } from '@/utils/close-duplicate-tabs'
import { InlineSelect } from './AppearancePanel'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

export function FeaturesPanel() {
  const { t } = useTranslation()
  const { preferences, updatePreferences } = useTheme()

  return (
    <div className="flex flex-col gap-0">
      <div className="theme-menu-section">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <Switch
            checked={preferences.hitokotoEnabled}
            onCheckedChange={() =>
              updatePreferences({ hitokotoEnabled: !preferences.hitokotoEnabled })
            }
          />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.16em] cursor-pointer">
            {t('hitokotoLabel')}
          </span>
        </label>
      </div>

      <Separator className="my-3.5" />

      <div className="theme-menu-section">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <Switch
            checked={preferences.sleepControlEnabled}
            onCheckedChange={() =>
              updatePreferences({ sleepControlEnabled: !preferences.sleepControlEnabled })
            }
          />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.16em] cursor-pointer">
            {t('sleepControlLabel')}
          </span>
        </label>
      </div>

      <Separator className="my-3.5" />

      <div className="theme-menu-section">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <Switch
            checked={preferences.closeDuplicateNewTabsEnabled}
            onCheckedChange={async () => {
              const next = !preferences.closeDuplicateNewTabsEnabled
              await updatePreferences({ closeDuplicateNewTabsEnabled: next })
              if (next) {
                const count = await closeDuplicateNewTabs()
                if (count > 0) toast(t('toastClosedDuplicatesKeptOne'))
              }
            }}
          />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.16em] cursor-pointer">
            {t('closeDuplicateNewTabsLabel')}
          </span>
        </label>
      </div>

      <Separator className="my-3.5" />

      <div className="theme-menu-section">
        <div className="flex items-center justify-between gap-2.5">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.16em] pl-0.5 pt-1">
            {t('tabScopeLabel')}
          </Label>
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

      <Separator className="my-3.5" />

      <div className="flex flex-col gap-2.5">
        <div className="theme-menu-section">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <Switch
              checked={preferences.bookmarksBarEnabled}
              onCheckedChange={() =>
                updatePreferences({ bookmarksBarEnabled: !preferences.bookmarksBarEnabled })
              }
            />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.16em] cursor-pointer">
              {t('bookmarksBarLabel')}
            </span>
          </label>
        </div>

        {preferences.bookmarksBarEnabled && (
          <div className="theme-menu-section">
            <div className="flex items-center justify-between gap-2.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.16em] pl-0.5 pt-1">
                {t('bookmarksBarSizeLabel')}
              </Label>
              <InlineSelect
                options={[
                  { key: 'compact', label: t('bookmarksBarSizeCompact') },
                  { key: 'normal', label: t('bookmarksBarSizeNormal') },
                  { key: 'large', label: t('bookmarksBarSizeLarge') }
                ]}
                value={preferences.bookmarksBarSize}
                onChange={(v) => updatePreferences({ bookmarksBarSize: v as BookmarksBarSize })}
              />
            </div>
            <Separator className="my-3.5" />
            <div className="flex items-center justify-between gap-2.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.16em] pl-0.5 pt-1">
                {t('bookmarkOpenModeLabel')}
              </Label>
              <InlineSelect
                options={[
                  { key: 'new-tab', label: t('savedSessionRestoreModeCurrentWindow') },
                  { key: 'current-tab', label: t('savedSessionRestoreModeNewWindow') }
                ]}
                value={preferences.bookmarkOpenMode}
                onChange={(v) => updatePreferences({ bookmarkOpenMode: v as BookmarkOpenMode })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
