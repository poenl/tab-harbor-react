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
import { playCloseSound } from '@/newtab/utils/sound'

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

  async function closeGroupDuplicates(urls: string[]) {
    const currentWindow = await browser.windows.getCurrent()
    const allTabs = await browser.tabs.query({ windowId: currentWindow.id })
    const toClose: number[] = []
    for (const url of urls) {
      const matching = allTabs.filter(t => t.url === url)
      if (matching.length <= 1) continue
      const keep = matching.find(t => t.active) || matching[0]
      for (const tab of matching) {
        if (tab.id && tab.id !== keep.id) toClose.push(tab.id)
      }
    }
    if (toClose.length === 0) return
    await browser.tabs.remove(toClose)
    playCloseSound()
    toast(t('toastClosedDuplicatesKeptOne'))
  }

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
        const urlCounts: Record<string, number> = {}
        for (const tab of group.tabs) urlCounts[tab.url] = (urlCounts[tab.url] || 0) + 1
        const dupeEntries = Object.entries(urlCounts).filter(([, c]) => c > 1)
        const hasDupes = dupeEntries.length > 0
        const totalExtras = dupeEntries.reduce((s, [, c]) => s + c - 1, 0)
        return (
          <div key={group.domain}>
            {/* ── 卡片标题 + 标签计数（展示模式加组级保存，选择模式加 checkbox） ── */}
            <div className="flex items-center gap-2 min-h-7 mb-2">
              {mode === 'select' && (
                <Checkbox
                  checked={getGroupState(group)}
                  onCheckedChange={() => onToggleGroup?.(group.domain)}
                />
              )}
              <span className="flex-1 min-w-0 truncate">
                <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground m-0 inline">
                  {groupLabel}
                </h3>
                {mode === 'view' && hasDupes && (
                  <span className="inline-flex ml-2 text-[10px] font-semibold text-accent">
                    {t('duplicatesCount', { count: totalExtras, suffix: totalExtras !== 1 ? 's' : '' })}
                  </span>
                )}
              </span>
              {mode === 'view' &&
                sleepControlEnabled &&
                onSleepGroup &&
                group.tabs.some((t) => !t.discarded && !t.active) && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onSleepGroup(group.domain)}
                    title={t('sleepAllTabsButton')}
                    aria-label={t('sleepAllTabsButton')}
                    className="text-muted-foreground border-border hover:bg-secondary hover:text-primary"
                  >
                    <Moon strokeWidth={1.8} className="w-3.5 h-3.5" />
                  </Button>
                )}
              {mode === 'view' && onSaveGroup && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onSaveGroup(group.domain)}
                  title={t('saveGroupSession')}
                  className="text-muted-foreground border-border hover:bg-secondary hover:text-primary"
                >
                  <Archive strokeWidth={1.8} className="w-3.5 h-3.5" />
                </Button>
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
                  dupeCount={urlCounts[tab.url]}
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

            {/* ── 关闭重复标签页（仅展示模式） ── */}
            {mode === 'view' && hasDupes && (
              <button
                onClick={() => closeGroupDuplicates(dupeEntries.map(([url]) => url))}
                className="self-start text-[11px] text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 cursor-pointer hover:text-accent hover:border-accent transition-all duration-150 mt-2"
              >
                {t('closedDuplicatesCount', { count: totalExtras, suffix: totalExtras !== 1 ? 's' : '' })}
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
              className={cn('h-6.5', footerMode === 'new' && 'bg-card shadow-sm')}
            >
              {t('sessionPickerNewSession')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFooterMode('existing')}
              disabled={sessions.length === 0}
              className={cn('h-6.5', footerMode === 'existing' && 'bg-card shadow-sm')}
            >
              {t('sessionPickerExistingSession')}
            </Button>
          </div>

          <div className="h-7 w-[min(220px,28vw)] max-w-55">
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
