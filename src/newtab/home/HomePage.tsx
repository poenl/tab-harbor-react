import { useState } from 'react'
import { useTranslation } from '@/i18n'
import type { DomainGroup } from '@/newtab/utils/domain-grouping.ts'
import type { OpenTab } from '@/newtab/utils/domain-grouping.ts'
import { useOpenTabsStore } from '@/stores/openTabs'
import { useTheme } from '@/stores/theme'
import { toast } from 'sonner'
import { Moon, Archive, X } from 'lucide-react'
import { getTabQuery, discardTabs } from '@/utils/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { SectionHeader } from './SectionHeader.tsx'
import { TabGroupList } from './TabGroupList.tsx'
import { Greeting } from './Greeting.tsx'
import { Hitokoto } from './Hitokoto.tsx'
import { SearchBar } from './SearchBar.tsx'
import { QuickShortcuts } from './QuickShortcuts.tsx'
import { Footer } from './Footer.tsx'
import { TabOutDupeBanner } from './TabOutDupeBanner.tsx'

export function HomePage() {
  const { t } = useTranslation()
  const groups = useOpenTabsStore((s) => s.groups)
  const loading = useOpenTabsStore((s) => s.loading)
  const totalTabs = useOpenTabsStore((s) => s.totalTabs)
  const { preferences } = useTheme()
  const { sleepControlEnabled } = preferences
  const [selectTarget, setSelectTarget] = useState<string | null>(null)
  const [selectedTabIds, setSelectedTabIds] = useState<Set<number>>(new Set())

  async function handleSleepAllTabs() {
    const tabs = await browser.tabs.query(getTabQuery(preferences.tabScope))
    const ids = tabs.filter((t) => !t.discarded && t.id).map((t) => t.id!)
    const count = await discardTabs(ids)
    toast(t('toastTabsDiscarded', { count }))
  }

  async function handleSleepTab(id: number) {
    try {
      await browser.tabs.discard(id)
      toast(t('toastTabDiscarded'))
    } catch {
      toast(t('toastTabDiscardFailed'))
    }
  }

  async function handleSleepGroup(domain: string) {
    const ids = groups
      .filter((g) => g.domain === domain)
      .flatMap((g) => g.tabs.filter((t) => !t.discarded && t.id))
      .map((t) => t.id!)
    const count = await discardTabs(ids)
    toast(t('toastTabsDiscarded', { count }))
  }

  function handleSaveTab(tab: OpenTab) {
    const group = groups.find((g) => g.tabs.some((t) => t.id === tab.id))
    const domain = group?.domain
    if (domain) {
      enterSelectMode(domain, [tab.id])
    }
  }

  // ── 选择模式 ──

  function enterSelectMode(target: string, initialTabIds?: number[]) {
    const scope =
      initialTabIds ??
      (target === '*'
        ? groups.flatMap((g) => g.tabs.map((t) => t.id))
        : groups.filter((g) => g.domain === target).flatMap((g) => g.tabs.map((t) => t.id)))
    setSelectTarget(target)
    setSelectedTabIds(new Set(scope))
  }

  function exitSelectMode() {
    setSelectTarget(null)
    setSelectedTabIds(new Set())
  }

  function handleToggleTab(id: number) {
    const next = new Set(selectedTabIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedTabIds(next)
  }

  function handleToggleGroup(domain: string) {
    const groupIds = groups
      .filter((g) => g.domain === domain)
      .flatMap((g) => g.tabs.map((t) => t.id))
    const allSelected = groupIds.every((id) => selectedTabIds.has(id))
    const next = new Set(selectedTabIds)
    for (const id of groupIds) {
      if (allSelected) {
        next.delete(id)
      } else {
        next.add(id)
      }
    }
    setSelectedTabIds(next)
  }

  function handleSelectAll() {
    const allIds = groups.flatMap((g) => g.tabs.map((t) => t.id))
    const allSelected = allIds.every((id) => selectedTabIds.has(id))
    setSelectedTabIds(new Set(allSelected ? [] : allIds))
  }

  function handleSaveCurrentWindow() {
    enterSelectMode('*')
  }

  function handleSaveGroup(domain: string) {
    enterSelectMode(domain)
  }

  async function handleCloseAllTabs() {
    const tabs = await browser.tabs.query(getTabQuery(preferences.tabScope))
    const toClose = tabs.filter((t) => !t.pinned && t.id).map((t) => t.id!)
    if (toClose.length > 0) {
      await browser.tabs.remove(toClose)
    }
    toast(t('toastAllTabsClosed'))
  }

  return (
    <>
      <TabOutDupeBanner />

      {/* ── 两列布局（左: 1.35fr = 标签列表 / 右: 0.95fr = 问候+搜索+快捷） ── */}
      <div className="grid grid-cols-[1.35fr_0.95fr] items-start gap-8 max-[960px]:grid-cols-1 max-[960px]:gap-5 mb-15">
        {/* ── 左栏：打开标签页 ── */}
        <section className="min-w-0">
          <SectionHeader
            title={t('openTabsSectionTitle')}
            count={totalTabs}
            actions={
              <>
                {sleepControlEnabled && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSleepAllTabs}
                        aria-label={t('sleepAllTabsButton')}
                        className="text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                      >
                        <Moon strokeWidth={1.8} className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{t('sleepAllTabsButton')}</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSaveCurrentWindow}
                      aria-label={t('saveSessionButton')}
                      className="text-muted-foreground border-border hover:bg-secondary hover:text-primary"
                    >
                      <Archive strokeWidth={1.8} className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t('saveSessionButton')}</TooltipContent>
                </Tooltip>
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t('closeAllTabsButton')}
                          className="text-muted-foreground border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        >
                          <X strokeWidth={1.8} className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">{t('closeAllTabsButton')}</TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('closeAllTabsConfirmTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('closeAllTabsConfirmDescription')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCloseAllTabs}>
                        {t('closeAllTabsConfirmAction')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            }
          />
          <TabGroupList
            groups={groups}
            loading={loading}
            onSleepTab={handleSleepTab}
            onSleepGroup={handleSleepGroup}
            onSaveTab={handleSaveTab}
            onSaveGroup={handleSaveGroup}
            sleepControlEnabled={sleepControlEnabled}
            selectTarget={selectTarget}
            selectedTabIds={selectedTabIds}
            onToggleTab={handleToggleTab}
            onToggleGroup={handleToggleGroup}
            onSelectCancel={exitSelectMode}
            onSelectAll={handleSelectAll}
          />
        </section>

        {/* ── 右栏：头部（问候 + 一言 + 搜索 + 快捷链接） ── */}
        <header>
          <div className="flex flex-col gap-6">
            <Greeting />
            <Hitokoto />
            <SearchBar />
            <QuickShortcuts />
          </div>
        </header>
      </div>

      <Footer />
    </>
  )
}
