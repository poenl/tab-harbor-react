import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, RotateCcw } from 'lucide-react'
import type { TFunction } from 'i18next'
import { useTranslation } from '@/i18n'
import type { SavedTabSession } from '@/stores/savedSessions'
import { useSavedSessionsStore } from '@/stores/savedSessions'
import { SavedSessionTabRow } from './SavedSessionTabRow.tsx'

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
}

export function SavedSessionCard({ session }: SavedSessionCardProps) {
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
    // ── 已保存 session 卡片 ──
    <article className="bg-card border border-border rounded-2xl p-[14px_16px] shadow-[0_14px_28px_var(--tw-shadow-color)] shadow-primary/5">
      {/* ── 卡片顶部：名称 + 摘要 + 操作按钮 ── */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col flex-1 min-w-0">
          {renaming ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-[15px] font-semibold tracking-[-0.01em] text-foreground bg-transparent border-b border-primary/30 outline-none py-0.5"
            />
          ) : (
            <button
              onClick={() => setRenaming(true)}
              title={t('clickToRename')}
              className="text-[15px] font-semibold tracking-[-0.01em] text-foreground text-left bg-none border-none p-0 cursor-text hover:text-primary transition-colors duration-150 truncate"
            >
              {session.name}
            </button>
          )}

          <div className="text-[11px] text-muted-foreground mt-0.5">
            {session.tabs.length}{' '}
            {t(session.tabs.length === 1 ? 'tabsWordSingular' : 'tabsWordPlural')} saved{' '}
            {formatRelativeTime(session.savedAt, t)}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleCollapse(session.id)}
            className="w-8 h-8 p-0 border border-border rounded-lg bg-transparent text-muted-foreground cursor-pointer flex items-center justify-center hover:bg-secondary hover:text-foreground transition-all duration-150"
            title={isCollapsed ? t('expand') || 'Expand' : t('collapse') || 'Collapse'}
          >
            {isCollapsed ? (
              <ChevronDown strokeWidth={1.8} className="w-4 h-4" />
            ) : (
              <ChevronUp strokeWidth={1.8} className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => restoreSession(session.id)}
            className="w-8 h-8 p-0 border border-border rounded-lg bg-transparent text-muted-foreground cursor-pointer flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-150"
            title={t('restoreSessionTooltip')}
          >
            <RotateCcw strokeWidth={1.8} className="w-4 h-4" />
          </button>

          <button
            onClick={() => removeSession(session.id)}
            className="w-8 h-8 p-0 border border-border rounded-lg bg-transparent text-muted-foreground cursor-pointer flex items-center justify-center hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-150"
            title={t('deleteSessionTooltip')}
          >
            <Trash2 strokeWidth={1.8} className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Tab 列表（可折叠） ── */}
      {!isCollapsed && session.tabs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          {session.tabs.map((tab, i) => (
            <SavedSessionTabRow
              key={`${tab.url}-${i}`}
              tab={tab}
              sessionId={session.id}
              index={i}
              onRestoreTab={restoreTab}
              onDeleteTab={removeTabFromSession}
            />
          ))}
        </div>
      )}
    </article>
  )
}
