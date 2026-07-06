import { useTranslation } from '@/i18n'
import type { OpenTab } from '@/newtab/utils/domain-grouping.ts'
import { useOpenTabsStore } from '@/stores/openTabs'
import { useThemeStore } from '@/stores/theme'
import { Favicon } from '@/components/favicon'
import { Moon, Archive, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSelectMode } from './SelectModeContext.tsx'

interface TabChipProps {
  tab: OpenTab
  dupeCount?: number
  mode: 'select' | 'view'
}

export function TabChip({ tab, dupeCount, mode }: TabChipProps) {
  const { t } = useTranslation()
  const { selectedTabIds, toggleTab, saveTab } = useSelectMode()
  const sleepControlEnabled = useThemeStore((s) => s.preferences.sleepControlEnabled)
  const showSleep = sleepControlEnabled && !tab.discarded && !tab.active
  const closeTab = useOpenTabsStore((s) => s.closeTab)
  const focusTab = useOpenTabsStore((s) => s.focusTab)
  const sleepTab = useOpenTabsStore((s) => s.sleepTab)
  const selected = selectedTabIds.has(tab.id)

  return (
    // ── 标签行（外层容器，无点击事件） ──
    <div className="border-border/50 hover:bg-secondary/50 -mx-2 flex min-h-11 items-center gap-2 overflow-hidden rounded-md border-b px-2.5 py-2 text-sm leading-[1.4] transition-colors duration-150 last:border-b-0">
      {/* ── 文案区域（绑定跳转/勾选事件） ── */}
      <div
        onClick={() => (mode === 'view' ? focusTab(tab) : toggleTab(tab.id))}
        className="-my-1 flex min-w-0 flex-1 cursor-pointer items-center gap-2 overflow-hidden rounded-md py-1"
      >
        {mode === 'select' && (
          <Checkbox checked={!!selected} onCheckedChange={() => toggleTab(tab.id)} />
        )}
        <Favicon tab={tab} imgCls="w-3.5 h-3.5" fallbackCls="w-3.5 h-3.5 text-[9px]" />

        <span className={cn('flex-1 truncate', tab.discarded && 'text-muted-foreground/40')}>
          {tab.title || t('untitledTab')}
        </span>
        {dupeCount && dupeCount > 1 && (
          <span className="text-accent shrink-0 text-xs font-medium">({dupeCount}x)</span>
        )}
      </div>

      {/* ── 操作按钮组（仅展示模式） ── */}
      {mode === 'view' && (
        <div className="flex shrink-0 items-center gap-1">
          {showSleep && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => sleepTab(tab.id)}
                  aria-label={t('discardTab')}
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground/50 hover:bg-secondary/60 hover:text-primary"
                >
                  <Moon strokeWidth={1.8} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{t('discardTab')}</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => saveTab(tab)}
                aria-label={t('saveTabSession')}
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground/50 hover:bg-secondary/60 hover:text-primary"
              >
                <Archive strokeWidth={1.8} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{t('saveTabSession')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => closeTab(tab.id)}
                aria-label={t('closeThisTab')}
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground/50 hover:bg-secondary/60 hover:text-primary"
              >
                <X strokeWidth={1.8} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{t('closeThisTab')}</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  )
}
