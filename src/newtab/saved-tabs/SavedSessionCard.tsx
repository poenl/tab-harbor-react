import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Trash2, RotateCcw, GripVertical } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { TFunction } from 'i18next'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import type { SavedTabSession } from '@/stores/savedSessions'
import { useSavedSessionsStore } from '@/stores/savedSessions'
import { SavedSessionTabRow } from './SavedSessionTabRow.tsx'
import { Droppable, Draggable } from '@hello-pangea/dnd'

function formatRelativeTime(iso: string, t: TFunction): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t('timeJustNow')
  if (mins < 60) return t('timeMinAgo', { count: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours === 1 ? t('timeHourAgo') : t('timeHoursAgo', { count: hours })
  const days = Math.floor(hours / 24)
  if (days < 30) return t('timeDaysAgo', { count: days })
  return new Date(iso).toLocaleDateString()
}

interface SavedSessionCardProps {
  session: SavedTabSession
  index: number
  isDragActive?: boolean
}

export function SavedSessionCard({ session, index, isDragActive }: SavedSessionCardProps) {
  const { t } = useTranslation()
  const {
    collapsed,
    toggleCollapse,
    renameSession,
    removeSession,
    restoreSession,
    restoreTab,
    removeTabFromSession
  } = useSavedSessionsStore()
  const isCollapsed = collapsed[session.id] ?? false
  const [renaming, setRenaming] = useState(false)
  const [nameInput, setNameInput] = useState(session.name)

  function handleRenameSubmit() {
    const trimmed = nameInput.trim()
    if (trimmed && trimmed !== session.name) {
      renameSession(session.id, trimmed)
    }
    setRenaming(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleRenameSubmit()
    if (e.key === 'Escape') {
      setNameInput(session.name)
      setRenaming(false)
    }
  }

  return (
    <Draggable draggableId={session.id} index={index}>
      {(provided) => (
        // ── 已保存 session 卡片 ──
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-card border-border shadow-primary/5 rounded-2xl border p-[14px_16px] shadow-[0_14px_28px_var(--tw-shadow-color)] transition-all duration-250 hover:shadow-[0_16px_30px_var(--tw-shadow-color)]"
          data-session-id={session.id}
          style={provided.draggableProps.style as React.CSSProperties}
        >
          {/* ── 卡片顶部：名称 + 摘要 + 操作按钮 ── */}
          <div className="flex items-center gap-2">
            <span
              {...provided.dragHandleProps}
              className="inline-flex cursor-grab active:cursor-grabbing"
            >
              <GripVertical
                strokeWidth={1.8}
                className="text-muted-foreground/40 h-4 w-4 shrink-0"
              />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              {renaming ? (
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="text-foreground border-primary/30 border-b bg-transparent py-0 text-base font-semibold tracking-[-0.01em] outline-none"
                />
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setRenaming(true)}
                      className="text-foreground hover:text-primary w-fit max-w-full cursor-text truncate border-b border-transparent bg-none p-0 text-left text-base font-semibold tracking-[-0.01em] transition-colors duration-150"
                    >
                      {session.name}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t('clickToRename')}</TooltipContent>
                </Tooltip>
              )}

              <div className="text-muted-foreground mt-0.5 text-xs">
                {session.tabs.length}{' '}
                {t(session.tabs.length === 1 ? 'tabsWordSingular' : 'tabsWordPlural')} saved{' '}
                {formatRelativeTime(session.savedAt, t)}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => toggleCollapse(session.id)}
                    className="border-border text-muted-foreground hover:bg-secondary hover:text-foreground flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border bg-transparent p-0 transition-all duration-150"
                    aria-label={isCollapsed ? t('expand') || 'Expand' : t('collapse') || 'Collapse'}
                  >
                    <ChevronDown
                      strokeWidth={1.8}
                      className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {isCollapsed ? t('expand') || 'Expand' : t('collapse') || 'Collapse'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => restoreSession(session.id)}
                    className="border-border text-muted-foreground hover:bg-secondary hover:text-primary flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border bg-transparent p-0 transition-all duration-150"
                    aria-label={t('restoreSessionTooltip')}
                  >
                    <RotateCcw strokeWidth={1.8} className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{t('restoreSessionTooltip')}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => removeSession(session.id)}
                    className="border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border bg-transparent p-0 transition-all duration-150"
                    aria-label={t('deleteSessionTooltip')}
                  >
                    <Trash2 strokeWidth={1.8} className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{t('deleteSessionTooltip')}</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* ── Tab 列表（可折叠） ── */}
          <div
            className={cn('grid', !isDragActive && 'transition-[grid-template-rows] duration-200')}
            style={{ gridTemplateRows: isCollapsed ? '0fr' : '1fr' }}
          >
            <div className="overflow-hidden min-h-0">
              {session.tabs.length > 0 && (
                <Droppable droppableId={session.id} type="TAB">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="border-border/50 mt-3 border-t pt-3"
                    >
                      <AnimatePresence>
                        {session.tabs.map((tab, i) => (
                          <motion.div
                            key={tab.url}
                            exit={{
                              opacity: 0,
                              height: 0,
                              marginBottom: 0,
                              transition: { duration: 0.1, ease: 'easeOut' }
                            }}
                          >
                            <SavedSessionTabRow
                              tab={tab}
                              sessionId={session.id}
                              index={i}
                              onRestoreTab={restoreTab}
                              onDeleteTab={removeTabFromSession}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          </div>
        </article>
      )}
    </Draggable>
  )
}
