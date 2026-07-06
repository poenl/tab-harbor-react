import { X, GripVertical } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { SavedTabTab } from '@/stores/savedSessions'
import { FaviconImage } from '@/components/FaviconImage'
import { getFallbackLabel } from '@/newtab/utils/icon-utils'
import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'

interface SavedSessionTabRowProps {
  tab: SavedTabTab
  sessionId: string
  index: number
  onRestoreTab: (sessionId: string, index: number) => void
  onDeleteTab: (sessionId: string, index: number) => void
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
    <Draggable draggableId={tab.url} index={index}>
      {(provided, snapshot) => (
        // ── 已保存标签行 ──
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...(provided.draggableProps.style as React.CSSProperties),
            ...(snapshot.isDropAnimating ? { transitionDuration: '0.001s' } : {})
          }}
          className="border-border/50 group flex items-center gap-2 border-b py-1.5 text-sm leading-[1.4] transition-colors duration-150 last:border-b-0 hover:bg-secondary/20 -mx-0.5 px-0.5"
        >
          <span
            {...provided.dragHandleProps}
            className="inline-flex cursor-grab active:cursor-grabbing"
          >
            <GripVertical strokeWidth={1.8} className="text-muted-foreground/40 h-4 w-4 shrink-0" />
          </span>
          <button
            onClick={() => onRestoreTab(sessionId, index)}
            className="group flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-none bg-none p-0 text-left"
          >
            <FaviconImage
              src={tab.faviconUrl}
              fallback={getFallbackLabel(tab.title, tab.url)}
              imgCls="h-3.5 w-3.5 rounded-xs"
              fallbackCls="text-primary bg-secondary h-3.5 w-3.5 rounded-full text-[9px]"
            />
            <span className="text-foreground group-hover:text-primary truncate transition-colors duration-150">
              {tab.title || tab.url}
            </span>
          </button>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onDeleteTab(sessionId, index)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border-none bg-none p-0 opacity-0 transition-all duration-150 group-hover:opacity-100"
                aria-label={t('removeTabFromSession')}
              >
                <X strokeWidth={1.8} className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{t('removeTabFromSession')}</TooltipContent>
          </Tooltip>
        </div>
      )}
    </Draggable>
  )
}
