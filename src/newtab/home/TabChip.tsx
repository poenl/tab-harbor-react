import { useState } from 'react'
import { useTranslation } from '@/i18n'
import type { OpenTab } from '@/newtab/utils/domain-grouping.ts'
import { getIconSources, getFallbackLabel } from '@/newtab/utils/icon-utils.ts'
import { Moon, Archive, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TabChipProps {
  tab: OpenTab
  mode?: 'view' | 'select'

  // View mode
  onClose?: (id: number) => void
  onFocus?: (id: number) => void
  onSleepTab?: (id: number) => void
  onSaveTab?: (tab: OpenTab) => void
  sleepControlEnabled?: boolean

  // Select mode
  selected?: boolean
  onToggle?: (id: number) => void

  // Duplicate count
  dupeCount?: number
}

// ── 网站图标（favicon → Google 代理 → 首字母） ──
function Favicon({ tab }: { tab: OpenTab }) {
  const [imgError, setImgError] = useState(false)

  if (tab.favIconUrl && !imgError) {
    return (
      <img
        src={tab.favIconUrl}
        alt=""
        className="w-3.5 h-3.5 rounded-xs shrink-0"
        onError={() => setImgError(true)}
      />
    )
  }

  const sources = getIconSources(tab.url, 32)
  const src = sources[0]

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt=""
        className="w-3.5 h-3.5 rounded-xs shrink-0"
        onError={() => setImgError(true)}
      />
    )
  }

  const fallbackLabel = getFallbackLabel(tab.title, tab.url)
  return (
    <span className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] font-bold shrink-0 text-primary bg-secondary">
      {fallbackLabel.slice(0, 2)}
    </span>
  )
}

export function TabChip({
  tab,
  mode = 'view',
  onClose,
  onFocus,
  onSleepTab,
  onSaveTab,
  sleepControlEnabled,
  selected,
  onToggle,
  dupeCount
}: TabChipProps) {
  const { t } = useTranslation()
  const showSleep = sleepControlEnabled && !tab.discarded && !tab.active

  return (
    // ── 标签行（展示/选择共用同一套样式） ──
    <div
      onClick={() => (mode === 'view' ? onFocus?.(tab.id) : onToggle?.(tab.id))}
      className="flex items-center gap-2 py-2 min-h-11 border-b border-border/50 text-[13px] leading-[1.4] last:border-b-0 hover:bg-secondary/50 rounded-md -mx-2 px-2.5 transition-colors duration-150 cursor-pointer"
    >
      {mode === 'select' && (
        <Checkbox checked={!!selected} onCheckedChange={() => onToggle?.(tab.id)} />
      )}
      <Favicon tab={tab} />

      <span className={cn('truncate flex-1', tab.discarded && 'text-muted-foreground/40')}>
        {tab.title || t('untitledTab')}
      </span>
      {dupeCount && dupeCount > 1 && (
        <span className="text-[10px] text-accent shrink-0 font-medium">
          ({dupeCount}x)
        </span>
      )}

      {/* ── 操作按钮组（仅展示模式） ── */}
      {mode === 'view' && (
        <div className="flex items-center gap-1 shrink-0">
          {showSleep && onSleepTab && (
            <Button
              onClick={() => onSleepTab(tab.id)}
              title={t('discardTab')}
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground/50  hover:bg-secondary/60 hover:text-primary"
            >
              <Moon strokeWidth={1.8} />
            </Button>
          )}
          {onSaveTab && (
            <Button
              onClick={() => onSaveTab(tab)}
              title={t('saveTabSession')}
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground/50  hover:bg-secondary/60 hover:text-primary"
            >
              <Archive strokeWidth={1.8} />
            </Button>
          )}
          {onClose && (
            <Button
              onClick={() => onClose(tab.id)}
              title={t('closeThisTab')}
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground/50  hover:bg-secondary/60 hover:text-primary"
            >
              <X strokeWidth={1.8} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
