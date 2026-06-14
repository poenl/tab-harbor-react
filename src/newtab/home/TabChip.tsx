import { useState } from 'react'
import { useTranslation } from '@/i18n'
import type { OpenTab } from '@/newtab/utils/domain-grouping.ts'
import { getIconSources, getFallbackLabel } from '@/newtab/utils/icon-utils.ts'
import { Moon, Archive, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

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
}

// ── 网站图标（favicon → Google 代理 → 首字母） ──
function Favicon({ tab }: { tab: OpenTab }) {
  const [imgError, setImgError] = useState(false)

  if (tab.favIconUrl && !imgError) {
    return (
      <img
        src={tab.favIconUrl}
        alt=""
        className="w-3.5 h-3.5 rounded-[2px] shrink-0"
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
        className="w-3.5 h-3.5 rounded-[2px] shrink-0"
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

export function TabChip({ tab, mode = 'view', onClose, onFocus, onSleepTab, onSaveTab, sleepControlEnabled, selected, onToggle }: TabChipProps) {
  const { t } = useTranslation()
  const showSleep = sleepControlEnabled && !tab.discarded && !tab.active

  return (
    // ── 标签行（展示/选择共用同一套样式） ──
    <div className="flex items-center gap-2 py-2 min-h-11 border-b border-border/50 text-[13px] leading-[1.4] last:border-b-0 hover:bg-secondary/50 rounded-md -mx-2 px-2.5 transition-colors duration-150">
      {mode === 'select' && (
        <Checkbox
          checked={!!selected}
          onCheckedChange={() => onToggle?.(tab.id)}
        />
      )}
      <Favicon tab={tab} />

      {/* ── 标题按钮（点击聚焦标签页，仅展示模式） ── */}
      <button
        onClick={() => mode === 'view' && onFocus?.(tab.id)}
        title={tab.title}
        className="flex-1 min-w-0 text-left bg-none border-none p-0 text-[13px] text-foreground cursor-pointer truncate leading-[1.4]"
      >
        {tab.title || t('untitledTab')}
      </button>

      {/* ── 休眠标签 ── */}
      {tab.discarded && (
        <span className="text-[10px] text-muted-foreground shrink-0">{t('sleepingTab')}</span>
      )}

      {/* ── 操作按钮组（仅展示模式） ── */}
      {mode === 'view' && (
        <div className="flex items-center gap-1 shrink-0">
          {showSleep && onSleepTab && (
            <button
              onClick={() => onSleepTab(tab.id)}
              title={t('discardTab')}
              className="w-7 h-7 p-0 border-none rounded bg-none text-muted-foreground/50 cursor-pointer flex items-center justify-center opacity-48 hover:opacity-100 hover:bg-muted/10 hover:text-muted-foreground transition-all duration-150"
            >
              <Moon strokeWidth={1.8} className="w-[13px] h-[13px]" />
            </button>
          )}
          {onSaveTab && (
            <button
              onClick={() => onSaveTab(tab)}
              title={t('saveTabSession')}
              className="w-7 h-7 p-0 border-none rounded bg-none text-muted-foreground/50 cursor-pointer flex items-center justify-center opacity-48 hover:opacity-100 hover:bg-secondary/60 hover:text-primary transition-all duration-150"
            >
              <Archive strokeWidth={1.8} className="w-[13px] h-[13px]" />
            </button>
          )}
          {onClose && (
            <button
              onClick={() => onClose(tab.id)}
              title={t('closeThisTab')}
              className="w-7 h-7 p-0 border-none rounded bg-none text-muted-foreground/50 cursor-pointer flex items-center justify-center opacity-48 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
            >
              <X strokeWidth={1.8} className="w-[13px] h-[13px]" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
