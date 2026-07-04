import { useTranslation } from '@/i18n'
import { useTheme } from '@/stores/theme'
import { useOpenTabsStore } from '@/stores/openTabs'
import type { TabScope, BookmarksBarSize, BookmarkOpenMode } from '@/constants/preferences'
import { toast } from 'sonner'
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
        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <Switch
            checked={preferences.hitokotoEnabled}
            onCheckedChange={() =>
              updatePreferences({ hitokotoEnabled: !preferences.hitokotoEnabled })
            }
          />
          <span className="text-muted-foreground cursor-pointer text-xs font-bold tracking-[0.16em] uppercase">
            {t('hitokotoLabel')}
          </span>
        </label>
      </div>

      <Separator className="my-3.5" />

      <div className="theme-menu-section">
        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <Switch
            checked={preferences.sleepControlEnabled}
            onCheckedChange={() =>
              updatePreferences({ sleepControlEnabled: !preferences.sleepControlEnabled })
            }
          />
          <span className="text-muted-foreground cursor-pointer text-xs font-bold tracking-[0.16em] uppercase">
            {t('sleepControlLabel')}
          </span>
        </label>
      </div>

      <Separator className="my-3.5" />

      <div className="theme-menu-section">
        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <Switch
            checked={preferences.closeDuplicateNewTabsEnabled}
            onCheckedChange={async () => {
              const next = !preferences.closeDuplicateNewTabsEnabled
              await updatePreferences({ closeDuplicateNewTabsEnabled: next })
              if (next) {
                const count = await useOpenTabsStore.getState().closeDuplicateExtras()
                if (count > 0) toast(t('toastClosedDuplicatesKeptOne'))
              }
            }}
          />
          <span className="text-muted-foreground cursor-pointer text-xs font-bold tracking-[0.16em] uppercase">
            {t('closeDuplicateNewTabsLabel')}
          </span>
        </label>
      </div>

      <Separator className="my-3.5" />

      <div className="theme-menu-section">
        <div className="flex items-center justify-between gap-2.5">
          <Label className="text-muted-foreground pt-1 pl-0.5 text-xs font-bold tracking-[0.16em] uppercase">
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
          <label className="flex cursor-pointer items-center gap-2.5 select-none">
            <Switch
              checked={preferences.bookmarksBarEnabled}
              onCheckedChange={() =>
                updatePreferences({ bookmarksBarEnabled: !preferences.bookmarksBarEnabled })
              }
            />
            <span className="text-muted-foreground cursor-pointer text-xs font-bold tracking-[0.16em] uppercase">
              {t('bookmarksBarLabel')}
            </span>
          </label>
        </div>

        {preferences.bookmarksBarEnabled && (
          <>
            <div className="flex items-center justify-between gap-2.5">
              <Label className="text-muted-foreground pt-1 pl-0.5 text-xs font-bold tracking-[0.16em] uppercase">
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
            <div className="flex items-center justify-between gap-2.5">
              <Label className="text-muted-foreground pt-1 pl-0.5 text-xs font-bold tracking-[0.16em] uppercase">
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
          </>
        )}
      </div>
    </div>
  )
}
