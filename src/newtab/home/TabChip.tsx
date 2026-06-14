import type { OpenTab } from '@/newtab/utils/domain-grouping.ts'
import { X } from 'lucide-react'

interface TabChipProps {
  tab: OpenTab
  onClose?: (id: number) => void
  onFocus?: (id: number) => void
}

// ── 网站图标（favicon / 首字母） ──
function Favicon({ tab }: { tab: OpenTab }) {
  const initial = (tab.title || tab.url || '?').charAt(0).toUpperCase()

  if (tab.favIconUrl) {
    return (
      <img
        src={tab.favIconUrl}
        alt=""
        className="w-3.5 h-3.5 rounded-[2px] shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none'
          const fallback = (e.target as HTMLImageElement).nextElementSibling
          if (fallback) (fallback as HTMLElement).style.display = 'flex'
        }}
      />
    )
  }

  return (
    <span className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] font-bold shrink-0 text-primary bg-secondary">
      {initial}
    </span>
  )
}

export function TabChip({ tab, onClose, onFocus }: TabChipProps) {
  return (
    // ── 标签行 ──
    <div className="flex items-center gap-2 py-2 border-b border-border/50 text-[13px] leading-[1.4] last:border-b-0 hover:bg-secondary/50 rounded-md -mx-2 px-2.5 transition-colors duration-150">
      <Favicon tab={tab} />

      {/* ── 标题按钮（点击聚焦标签页） ── */}
      <button
        onClick={() => onFocus?.(tab.id)}
        title={tab.title}
        className="flex-1 min-w-0 text-left bg-none border-none p-0 text-[13px] text-foreground cursor-pointer truncate leading-[1.4]"
      >
        {tab.title || '(untitled)'}
      </button>

      {/* ── 休眠标签 ── */}
      {tab.discarded && (
        <span className="text-[10px] text-muted-foreground shrink-0">Sleeping</span>
      )}

      {/* ── 关闭按钮 ── */}
      {onClose && (
        <button
          onClick={() => onClose(tab.id)}
          title="Close tab"
          className="w-7 h-7 p-0 border-none rounded bg-none text-muted-foreground/50 cursor-pointer shrink-0 flex items-center justify-center text-sm hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
        >
          <X strokeWidth={1.8} className="w-[13px] h-[13px]" />
        </button>
      )}
    </div>
  )
}
