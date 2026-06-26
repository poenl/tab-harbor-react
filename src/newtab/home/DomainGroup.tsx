import { useState, useCallback } from 'react'
import { useTranslation } from '@/i18n'
import { toast } from 'sonner'
import { useSavedSessionsStore } from '@/stores/savedSessions'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
  showSelectAll?: boolean
  onSelectAll?: () => void
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
  onSelectCancel,
  showSelectAll,
  onSelectAll
}: DomainGroupCardProps) {
  const { t } = useTranslation()
  const { addSession, sessions, setSessions } = useSavedSessionsStore()
  const [expanded, setExpanded] = useState(false)

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
        setSessions(
          sessions.map((s) =>
            s.id === targetSessionId ? { ...s, tabs: [...s.tabs, ...newTabs] } : s
          )
        )
        toast(t('toastSessionTabsAdded', { count: newTabs.length, skipped }))
      }
    } else {
      const name = newSessionName.trim() || new Date().toLocaleString()
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
    setSessions,
    onSelectCancel
  ])

  async function closeGroupDuplicates(urls: string[]) {
    const currentWindow = await browser.windows.getCurrent()
    const allTabs = await browser.tabs.query({ windowId: currentWindow.id })
    const toClose: number[] = []
    for (const url of urls) {
      const matching = allTabs.filter((t) => t.url === url)
      if (matching.length <= 1) continue
      const keep = matching.find((t) => t.active) || matching[0]
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
    <div className="bg-card border-border shadow-primary/5 hover:shadow-primary/10 flex flex-col gap-2 rounded-2xl border p-[14px_16px] shadow-[0_14px_28px_var(--tw-shadow-color)] transition-all duration-250 hover:-translate-y-px hover:shadow-[0_16px_30px_var(--tw-shadow-color)]">
      {/* ── 选择模式头部 ── */}
      {mode === 'select' && (
        <div className="border-border/50 flex items-start justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            {showSelectAll && (
              <Checkbox
                checked={
                  selectedCount === allIds.length && allIds.length > 0
                    ? true
                    : selectedCount === 0
                      ? false
                      : 'indeterminate'
                }
                onCheckedChange={onSelectAll}
              />
            )}
            <div className="text-foreground text-sm font-semibold">{t('sessionPickerTitle')}</div>
          </div>
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
            <div className="mb-2 flex min-h-7 items-center gap-2">
              {mode === 'select' && (
                <Checkbox
                  checked={getGroupState(group)}
                  onCheckedChange={() => onToggleGroup?.(group.domain)}
                />
              )}
              <span className="min-w-0 flex-1 truncate">
                <h3 className="text-foreground m-0 inline text-base font-semibold tracking-[-0.01em]">
                  {groupLabel}
                </h3>
                {mode === 'view' && hasDupes && (
                  <span className="text-accent ml-2 inline-flex text-xs font-semibold">
                    {t('duplicatesCount', {
                      count: totalExtras,
                      suffix: totalExtras !== 1 ? 's' : ''
                    })}
                  </span>
                )}
              </span>
              {mode === 'view' &&
                sleepControlEnabled &&
                onSleepGroup &&
                group.tabs.some((t) => !t.discarded && !t.active) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onSleepGroup(group.domain)}
                        aria-label={t('sleepAllTabsButton')}
                        className="text-muted-foreground border-border hover:bg-secondary hover:text-primary"
                      >
                        <Moon strokeWidth={1.8} className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{t('sleepAllTabsButton')}</TooltipContent>
                  </Tooltip>
                )}
              {mode === 'view' && onSaveGroup && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onSaveGroup(group.domain)}
                      aria-label={t('saveGroupSession')}
                      className="text-muted-foreground border-border hover:bg-secondary hover:text-primary"
                    >
                      <Archive strokeWidth={1.8} className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t('saveGroupSession')}</TooltipContent>
                </Tooltip>
              )}
              {group.tabs.length > 1 && (
                <Badge
                  variant="secondary"
                  className="ml-auto shrink-0 rounded-[3px] text-xs font-semibold"
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
                className="text-primary border-border hover:bg-secondary hover:border-primary cursor-pointer self-start rounded-md border bg-transparent px-3 py-1 text-xs transition-all duration-150"
              >
                {t('moreCount', { count: group.tabs.length - INITIAL_VISIBLE })}
              </button>
            )}

            {/* ── 关闭重复标签页（仅展示模式） ── */}
            {mode === 'view' && hasDupes && (
              <button
                onClick={() => closeGroupDuplicates(dupeEntries.map(([url]) => url))}
                className="text-muted-foreground bg-card border-border hover:text-accent hover:border-accent mt-2 cursor-pointer self-start rounded-full border px-3 py-1.5 text-xs transition-all duration-150"
              >
                {t('closedDuplicatesCount', {
                  count: totalExtras,
                  suffix: totalExtras !== 1 ? 's' : ''
                })}
              </button>
            )}

            {/* ── 分组间分隔线（仅选择模式多组时） ── */}
            {mode === 'select' && gi < visibleGroups.length - 1 && (
              <div className="bg-border/50 my-2 h-px" />
            )}
          </div>
        )
      })}

      {/* ── 选择模式 Footer ── */}
      {mode === 'select' && (
        <footer className="border-border/50 flex items-center gap-2 border-t pt-3">
          <span className="text-muted-foreground flex-1 text-xs">
            {t('sessionPickerSelectedCount', { count: selectedCount })}
          </span>

          <div className="border-border/60 bg-secondary/30 inline-flex items-center gap-0.5 rounded-lg border">
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
              className={cn('h-7 w-full', footerMode !== 'new' && 'hidden')}
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
            className="h-7 min-w-[9em] rounded-full text-xs"
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
