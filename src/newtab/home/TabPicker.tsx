import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import { useOpenTabsStore } from '@/stores/openTabs'
import { useQuickShortcutsStore } from '@/stores/quickShortcuts'
import { getFallbackLabel } from '@/newtab/utils/icon-utils'
import { FaviconImage } from '@/components/FaviconImage'
import { Checkbox } from '@/components/ui/checkbox'
import { ShortcutEditorForm } from './ShortcutEditorDialog.tsx'
import { X, Plus, Search, Check } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { cn } from '@/lib/utils'

interface BrowserTab {
  id: number
  url: string
  title: string
  faviconUrl: string
}

interface TabPickerProps {
  onClose: () => void
}

function extractDomain(url: string): string {
  try {
    const host = new URL(url).hostname
    return host.startsWith('www.') ? host.slice(4) : host
  } catch {
    return 'other'
  }
}

function TabRow({
  tab,
  selected,
  onToggle,
  onAddSingle,
  alreadyAdded
}: {
  tab: BrowserTab
  selected: boolean
  onToggle: (id: number) => void
  onAddSingle?: (tab: BrowserTab) => void
  alreadyAdded?: boolean
}) {
  return (
    <div
      className={`group flex cursor-pointer items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-xs leading-[1.4] transition-colors duration-150 ${selected ? 'bg-accent/8' : 'hover:bg-accent/4'}`}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggle(tab.id)}
        className="size-4 rounded-lg border-[1.5px]"
      />
      <FaviconImage
        src={tab.faviconUrl}
        fallback={(tab.title || tab.url || '?').charAt(0).toUpperCase()}
        imgCls="size-4 rounded-xs"
        fallbackCls="bg-accent/10 text-accent size-4 rounded-full text-[8px]"
      />
      <span className="text-foreground min-w-0 flex-1 truncate">{tab.title || tab.url}</span>
      {alreadyAdded ? (
        <Check strokeWidth={2.5} className="text-accent/70 size-4 shrink-0" />
      ) : (
        <Button
          variant="secondary"
          size="icon-xs"
          className="rounded-full opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onAddSingle?.(tab)
          }}
        >
          <Plus strokeWidth={2.5} className="size-3.5" />
        </Button>
      )}
    </div>
  )
}

export function TabPicker({ onClose }: TabPickerProps) {
  const { t } = useTranslation()
  const shortcuts = useQuickShortcutsStore((s) => s.shortcuts)
  const add = useQuickShortcutsStore((s) => s.add)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [closing, setClosing] = useState(false)

  const tabs = useOpenTabsStore((s) => s.tabs)
  const loading = useOpenTabsStore((s) => s.loading)

  const filteredTabs = useMemo(() => {
    if (!search.trim()) return tabs
    const q = search.toLowerCase()
    return tabs.filter((t) => t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q))
  }, [tabs, search])

  const groupedTabs = useMemo(() => {
    const groups = new Map<string, BrowserTab[]>()
    for (const tab of filteredTabs) {
      const domain = extractDomain(tab.url)
      if (!groups.has(domain)) groups.set(domain, [])
      groups.get(domain)!.push(tab)
    }
    return Array.from(groups.entries()).map(([domain, tabs]) => ({ domain, tabs }))
  }, [filteredTabs])

  function toggleTab(id: number) {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }

  function handleClose() {
    setClosing(true)
  }

  useEffect(() => {
    if (closing) {
      const timer = setTimeout(onClose, 200)
      return () => clearTimeout(timer)
    }
  }, [closing])

  async function handleAddSelected() {
    for (const tab of tabs.filter((t) => selectedIds.has(t.id))) {
      await add({
        url: tab.url,
        label: tab.title || getFallbackLabel('', tab.url),
        icon: tab.faviconUrl,
        iconKind: 'website'
      })
    }
    handleClose()
  }

  function handleClearSelection() {
    setSelectedIds(new Set())
  }

  const shortcutUrls = useMemo(() => new Set(shortcuts.map((s) => s.url)), [shortcuts])

  async function handleAddSingle(tab: BrowserTab) {
    await add({
      url: tab.url,
      label: tab.title || getFallbackLabel('', tab.url),
      icon: tab.faviconUrl,
      iconKind: 'website'
    })
    handleClose()
  }

  async function handleSaveFromUrl(data: {
    url: string
    label: string
    icon: string
    iconKind: any
  }) {
    await add(data)
    handleClose()
  }

  return (
    <>
      {/* ── 遮罩 ── */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-foreground/6',
          closing ? 'animate-out fade-out-0 duration-200' : 'animate-in fade-in-0 duration-200'
        )}
        onClick={handleClose}
      />

      {/* ── 面板 ── */}
      <div
        className={cn(
          'border-border shadow-accent/10 fixed right-6 bottom-6 z-50 flex h-[min(480px,calc(100vh-80px))] w-80 flex-col overflow-hidden rounded-[18px] border shadow-[0_20px_42px_var(--tw-shadow-color)] backdrop-blur-xl',
          closing
            ? 'animate-out fade-out-0 slide-out-to-bottom-4 duration-200'
            : 'animate-in fade-in-0 slide-in-from-bottom-4 duration-200'
        )}
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--card) calc(40% + var(--custom-surface-opacity, 50%) * 0.6), transparent)'
        }}
      >
        <Tabs defaultValue="tabs" className="w-full h-full relative">
          <Button
            value=""
            onClick={handleClose}
            variant="link"
            className="hover:text-destructive absolute top-2 right-2 max-h-0 p-2 min-h-fit"
          >
            <X strokeWidth={2} className="size-3.5" />
          </Button>
          <TabsList variant="line" className="self-center min-h-fit px-4 pt-3 pb-2 font-serif">
            <TabsTrigger value="tabs"> {t('tabPickerTitle')}</TabsTrigger>
            <TabsTrigger value="url"> {t('addByUrlTitle')}</TabsTrigger>
          </TabsList>
          <TabsContent value="tabs" className="flex-1 min-h-0 flex flex-col">
            {/* ── 搜索栏 ── */}
            <div className="flex shrink-0 items-center gap-2 px-3.5 pb-2.5 pt-1">
              <InputGroup>
                <InputGroupAddon>
                  <Search strokeWidth={1.8} className="text-muted-foreground size-3.5 shrink-0" />
                </InputGroupAddon>
                <InputGroupInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('tabPickerSearchPlaceholder')}
                  className="placeholder:text-xs"
                />
              </InputGroup>
            </div>

            {/* ── 标签列表 ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain pb-1">
              {loading ? (
                <div className="text-muted-foreground p-6 text-center text-xs">{t('loading')}</div>
              ) : groupedTabs.length === 0 ? (
                <div className="text-muted-foreground p-6 text-center text-xs">
                  {t('tabPickerNoTabsFound')}
                </div>
              ) : (
                groupedTabs.map((group) => (
                  <div key={group.domain}>
                    <div className="text-muted-foreground bg-card/95 sticky top-0 z-1 px-2.5 py-2 text-[10px] font-bold tracking-[0.14em] uppercase">
                      {group.domain}
                    </div>
                    {group.tabs.map((tab) => (
                      <TabRow
                        key={tab.id}
                        tab={tab}
                        selected={selectedIds.has(tab.id)}
                        onToggle={toggleTab}
                        onAddSingle={handleAddSingle}
                        alreadyAdded={shortcutUrls.has(tab.url)}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* ── 底部栏 ── */}
            {selectedIds.size > 0 && (
              <div className="flex shrink-0 items-center gap-2 border-t border-[color-mix(in_srgb,var(--accent)_16%,transparent)] px-3.5 py-2.5">
                <span className="text-muted-foreground flex-1 text-xs">
                  {t('tabPickerSelectedCount', { count: selectedIds.size })}
                </span>
                <button
                  onClick={handleClearSelection}
                  className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md border-none bg-transparent p-1.5 text-xs font-medium transition-colors"
                >
                  {t('clearSelection')}
                </button>
                <button
                  onClick={handleAddSelected}
                  className="bg-primary text-primary-foreground cursor-pointer rounded-full border-none px-3.5 py-1.5 text-xs font-semibold transition-all hover:opacity-85"
                >
                  {t('addLink')}
                </button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="url" className="h-full min-h-0">
            <ShortcutEditorForm shortcut={null} onSave={handleSaveFromUrl} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
