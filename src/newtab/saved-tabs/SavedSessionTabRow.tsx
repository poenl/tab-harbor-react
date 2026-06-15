import { X } from 'lucide-react'
import { useTranslation } from '@/i18n'
import type { SavedTabTab } from '@/stores/savedSessions'
import { getIconSources, getFallbackLabel } from '@/newtab/utils/icon-utils'
import { useState } from 'react'

interface SavedSessionTabRowProps {
  tab: SavedTabTab
  sessionId: string
  index: number
  onRestoreTab: (sessionId: string, index: number) => void
  onDeleteTab: (sessionId: string, index: number) => void
}

function TabFavicon({ tab }: { tab: SavedTabTab }) {
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

  const fallback = getFallbackLabel(tab.title, tab.url)
  return (
    <span className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] font-bold shrink-0 text-primary bg-secondary">
      {fallback.slice(0, 2)}
    </span>
  )
}

export function SavedSessionTabRow({
  tab,
  sessionId,
  index,
  onRestoreTab,
  onDeleteTab
}: SavedSessionTabRowProps) {
  const { t } = useTranslation()

  return (
    // ── 已保存标签行 ──
    <div className="flex items-center gap-2 py-1.5 border-b border-border/50 text-[13px] leading-[1.4] last:border-b-0">
      <button
        onClick={() => onRestoreTab(sessionId, index)}
        className="flex items-center gap-2 flex-1 min-w-0 text-left bg-none border-none p-0 cursor-pointer group"
      >
        <TabFavicon tab={tab} />
        <span className="truncate text-foreground group-hover:text-primary transition-colors duration-150">
          {tab.title || tab.url}
        </span>
      </button>

      <button
        onClick={() => onDeleteTab(sessionId, index)}
        className="w-6 h-6 p-0 border-none rounded bg-none text-muted-foreground/40 cursor-pointer shrink-0 flex items-center justify-center hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
        title={t('removeTabFromSession')}
      >
        <X strokeWidth={1.8} className="w-3 h-3" />
      </button>
    </div>
  )
}
