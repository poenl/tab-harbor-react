import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import { toast } from 'sonner'
import { useSavedSessionsStore } from '@/stores/savedSessions'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import type { DomainGroup } from '@/newtab/utils/domain-grouping.ts'
import type { SavedTabSession } from '@/stores/savedSessions'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge.tsx'
import { Moon, Archive, X } from 'lucide-react'
import { TabChip } from './TabChip.tsx'

const INITIAL_VISIBLE = 8

interface DomainGroupCardProps {
  mode: 'view' | 'select'
  groups: DomainGroup[]

  // View mode callbacks
  onCloseTab?: (id: number) => void
  onFocusTab?: (id: number) => void
  onSleepTab?: (id: number) => void
  onSleepGroup?: (domain: string) => void
  onSaveTab?: (tab: any) => void
  onSaveGroup?: (domain: string) => void
  sleepControlEnabled?: boolean

  // Select mode callbacks
  selectedTabIds?: Set<number>
  onToggleTab?: (id: number) => void
  onToggleGroup?: (domain: string) => void
  onSelectCancel?: () => void
}

export function DomainGroupCard({
  mode,
  groups,
  onCloseTab,
  onFocusTab,
  onSleepTab,
  onSleepGroup,
  onSaveTab,
  onSaveGroup,
  sleepControlEnabled,
  selectedTabIds,
  onToggleTab,
  onToggleGroup,
  onSelectCancel
}: DomainGroupCardProps) {
  const { t } = useTranslation()
  const { addSession, sessions, load } = useSavedSessionsStore()
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    load()
  }, [load])

  // ── 选择模式 footer 状态 ──
  const [footerMode, setFooterMode] = useState<'new' | 'existing'>('new')
  const [newSessionName, setNewSessionName] = useState('')
  const [targetSessionId, setTargetSessionId] = useState(sessions[0]?.id ?? '')

  function getGroupState(group: DomainGroup): boolean | 'indeterminate' {
    const ids = group.tabs.map((t) => t.id)
    const sel = ids.filter((id) => selectedTabIds?.has(id)).length
    if (sel === 0) return false
    if (sel === ids.length) return true
    return 'indeterminate'
  }

  const visibleGroups = groups.filter((g) => g.tabs.length > 0)

  const allIds = visibleGroups.flatMap((g) => g.tabs.map((t) => t.id))
  const selectedCount = allIds.filter((id) => selectedTabIds?.has(id)).length

  const handleSelectSave = useCallback(async () => {
    const selectedTabs = groups.flatMap((g) => g.tabs.filter((t) => selectedTabIds?.has(t.id)))
    if (selectedTabs.length === 0) return

    const tabData = selectedTabs.map((t) => ({
      url: t.url,
      title: t.title,
      favIconUrl: t.favIconUrl || undefined
    }))

    if (footerMode === 'existing' && targetSessionId) {
      const session = sessions.find((s) => s.id === targetSessionId)
      if (session) {
        const existingUrls = new Set(session.tabs.map((t) => t.url))
        const newTabs = tabData.filter((t) => !existingUrls.has(t.url))
        const skipped = tabData.length - newTabs.length
        const updated: SavedTabSession = { ...session, tabs: [...session.tabs, ...newTabs] }
        const updatedSessions = sessions.map((s) => (s.id === targetSessionId ? updated : s))
        await browser.storage.local.set({ [STORAGE_KEYS.SAVED_TAB_SESSIONS]: updatedSessions })
        load()
        toast(t('toastSessionTabsAdded', { count: newTabs.length, skipped }))
      }
    } else {
      const name = newSessionName.trim() || `Saved tabs ${new Date().toLocaleString()}`
      await addSession({ name, tabs: tabData })
      toast(t('toastSessionSaved', { count: selectedTabs.length }))
    }

    const ids = selectedTabs.map((t) => t.id).filter(Boolean)
    if (ids.length > 0) {
      try {
        await browser.tabs.remove(ids)
      } catch {}
    }

    onSelectCancel?.()
  }, [
    groups,
    selectedTabIds,
    footerMode,
    newSessionName,
    targetSessionId,
    addSession,
    sessions,
    load,
    onSelectCancel
  ])

  return (
    // ── 域名分组卡片（展示/选择共用同一套卡片样式） ──
    <div className="bg-card border border-border rounded-2xl p-[14px_16px] flex flex-col gap-2 shadow-[0_14px_28px_var(--tw-shadow-color)] shadow-primary/5 hover:shadow-[0_16px_30px_var(--tw-shadow-color)] hover:shadow-primary/10 hover:-translate-y-px transition-all duration-250">
      {/* ── 选择模式头部 ── */}
      {mode === 'select' && (
        <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-3">
          <div className="text-sm font-semibold text-foreground">{t('sessionPickerTitle')}</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSelectCancel}
            className="text-muted-foreground hover:text-destructive shrink-0"
          >
            <X strokeWidth={2} className="size-4" />
          </Button>
        </div>
      )}

      {visibleGroups.map((group, gi) => {
        const groupLabel = group.label || group.domain
        return (
          <div key={group.domain}>
            {/* ── 卡片标题 + 标签计数（展示模式加组级保存，选择模式加 checkbox） ── */}
            <div className="flex items-center gap-2 min-h-7">
              {mode === 'select' && (
                <Checkbox
                  checked={getGroupState(group)}
                  onCheckedChange={() => onToggleGroup?.(group.domain)}
                />
              )}
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground m-0 flex-1 min-w-0 truncate">
                {groupLabel}
              </h3>
              {mode === 'view' &&
                sleepControlEnabled &&
                onSleepGroup &&
                group.tabs.some((t) => !t.discarded && !t.active) && (
                  <button
                    onClick={() => onSleepGroup(group.domain)}
                    title={t('sleepAllTabsButton')}
                    aria-label={t('sleepAllTabsButton')}
                    className="w-7 h-7 p-0 border border-border rounded-md bg-transparent text-muted-foreground cursor-pointer flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-150 shrink-0"
                  >
                    <Moon strokeWidth={1.8} className="w-3.5 h-3.5" />
                  </button>
                )}
              {mode === 'view' && onSaveGroup && (
                <button
                  onClick={() => onSaveGroup(group.domain)}
                  title={t('saveGroupSession')}
                  className="w-7 h-7 p-0 border border-border rounded-md bg-transparent text-muted-foreground cursor-pointer flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-150 shrink-0"
                >
                  <Archive strokeWidth={1.8} className="w-3.5 h-3.5" />
                </button>
              )}
              {group.tabs.length > 1 && (
                <Badge
                  variant="secondary"
                  className="ml-auto text-[10px] font-semibold rounded-[3px] shrink-0"
                >
                  {group.tabs.length}
                </Badge>
              )}
            </div>

            {/* ── 标签列表 ── */}
            <div>
              {(mode === 'select'
                ? group.tabs
                : expanded
                  ? group.tabs
                  : group.tabs.slice(0, INITIAL_VISIBLE)
              ).map((tab) => (
                <TabChip
                  key={tab.id}
                  tab={tab}
                  mode={mode}
                  onClose={onCloseTab}
                  onFocus={onFocusTab}
                  onSleepTab={onSleepTab}
                  onSaveTab={onSaveTab}
                  sleepControlEnabled={sleepControlEnabled}
                  selected={selectedTabIds?.has(tab.id)}
                  onToggle={onToggleTab}
                />
              ))}
            </div>

            {/* ── 展开更多（仅展示模式） ── */}
            {mode === 'view' && group.tabs.length > INITIAL_VISIBLE && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="self-start text-[11px] text-primary bg-transparent border border-border rounded-md px-3 py-1 cursor-pointer hover:bg-secondary hover:border-primary transition-all duration-150"
              >
                {t('moreCount', { count: group.tabs.length - INITIAL_VISIBLE })}
              </button>
            )}

            {/* ── 分组间分隔线（仅选择模式多组时） ── */}
            {mode === 'select' && gi < visibleGroups.length - 1 && (
              <div className="h-px bg-border/50 my-2" />
            )}
          </div>
        )
      })}

      {/* ── 选择模式 Footer ── */}
      {mode === 'select' && (
        <footer className="flex items-center gap-2 border-t border-border/50 pt-3">
          <span className="flex-1 text-xs text-muted-foreground">
            {t('sessionPickerSelectedCount', { count: selectedCount })}
          </span>

          <div className="inline-flex items-center gap-0.5 border border-border/60 rounded-lg bg-secondary/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFooterMode('new')}
              className={cn('h-[26px]', footerMode === 'new' && 'bg-card shadow-sm')}
            >
              {t('sessionPickerNewSession')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFooterMode('existing')}
              disabled={sessions.length === 0}
              className={cn('h-[26px]', footerMode === 'existing' && 'bg-card shadow-sm')}
            >
              {t('sessionPickerExistingSession')}
            </Button>
          </div>

          <div className="h-7 w-[min(220px,28vw)] max-w-[220px]">
            <Input
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder={t('sessionPickerNewSessionNamePlaceholder')}
              className={cn('w-full h-7', footerMode !== 'new' && 'hidden')}
            />

            <div className={cn('w-full', footerMode !== 'existing' && 'hidden')}>
              <Select value={targetSessionId} onValueChange={setTargetSessionId}>
                <SelectTrigger size="sm" className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={selectedCount === 0}
            onClick={handleSelectSave}
            className="rounded-full text-xs h-7 min-w-[9em]"
          >
            {footerMode === 'existing'
              ? t('sessionPickerAddToExisting')
              : t('sessionPickerSaveAndClose')}
          </Button>
        </footer>
      )}
    </div>
  )
}
