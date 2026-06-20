import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from '@/i18n'
import { useTheme } from '@/stores/theme'
import { getTabQuery } from '@/utils/tabs'
import { useQuickShortcutsStore } from '@/stores/quickShortcuts'
import { getFallbackLabel } from '@/newtab/utils/icon-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ShortcutEditorForm } from './ShortcutEditorDialog.tsx'
import { X, Plus, Search, Check } from 'lucide-react'

interface BrowserTab {
  id: number
  url: string
  title: string
  favIconUrl?: string
}

interface TabPickerProps {
  onClose: () => void
}

function TabFavicon({ tab }: { tab: BrowserTab }) {
  const [imgError, setImgError] = useState(false)
  const initial = (tab.title || tab.url || '?').charAt(0).toUpperCase()

  if (tab.favIconUrl && !imgError) {
    return (
      <img
        src={tab.favIconUrl}
        alt=""
        className="size-4 rounded-xs shrink-0"
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <span className="size-4 rounded-full inline-flex items-center justify-center text-[8px] font-bold shrink-0 bg-accent/10 text-accent">
      {initial}
    </span>
  )
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
      className={`group flex items-center gap-2 rounded-[10px] py-1.5 px-2.5 text-xs leading-[1.4] cursor-pointer transition-colors duration-150 ${selected ? 'bg-accent/8' : 'hover:bg-accent/4'}`}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggle(tab.id)}
        className="size-4 rounded-lg border-[1.5px]"
      />
      <TabFavicon tab={tab} />
      <span className="flex-1 min-w-0 truncate text-foreground">{tab.title || tab.url}</span>
      {alreadyAdded ? (
        <Check strokeWidth={2.5} className="size-4 text-accent/70 shrink-0" />
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddSingle?.(tab)
          }}
          className="size-6 p-0 rounded-full border-none bg-accent/10 text-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer shrink-0"
        >
          <Plus strokeWidth={2.5} className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export function TabPicker({ onClose }: TabPickerProps) {
  const { t } = useTranslation()
  const { preferences } = useTheme()
  const shortcuts = useQuickShortcutsStore((s) => s.shortcuts)
  const add = useQuickShortcutsStore((s) => s.add)
  const [mode, setMode] = useState<'tabs' | 'url'>('tabs')
  const [tabs, setTabs] = useState<BrowserTab[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const result = await browser.tabs.query(getTabQuery(preferences.tabScope))
      setTabs(
        result
          .filter(
            (tab) => tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('about:')
          )
          .map((tab) => ({
            id: tab.id!,
            url: tab.url!,
            title: tab.title || '',
            favIconUrl: tab.favIconUrl
          }))
      )
      setLoading(false)
    })()
  }, [])

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

  async function handleAddSelected() {
    for (const tab of tabs.filter((t) => selectedIds.has(t.id))) {
      await add({
        url: tab.url,
        label: tab.title || getFallbackLabel('', tab.url),
        icon: tab.favIconUrl || '',
        iconKind: tab.favIconUrl ? 'image' : 'website'
      })
    }
    onClose()
  }

  function handleClearSelection() {
    setSelectedIds(new Set())
  }

  const shortcutUrls = useMemo(() => new Set(shortcuts.map((s) => s.url)), [shortcuts])

  async function handleAddSingle(tab: BrowserTab) {
    await add({
      url: tab.url,
      label: tab.title || getFallbackLabel('', tab.url),
      icon: tab.favIconUrl || '',
      iconKind: tab.favIconUrl ? 'image' : 'website'
    })
    onClose()
  }

  async function handleSaveFromUrl(data: {
    url: string
    label: string
    icon: string
    iconKind: any
  }) {
    await add(data)
    onClose()
  }

  return (
    <>
      {/* ── 遮罩 ── */}
      <div className="fixed inset-0 z-50 bg-foreground/6" onClick={onClose} />

      {/* ── 面板 ── */}
      <div
        className="fixed bottom-6 right-6 z-50 w-80 h-[min(480px,calc(100vh-80px))] backdrop-blur-xl border border-border rounded-[18px] shadow-[0_20px_42px_var(--tw-shadow-color)] shadow-accent/10 flex flex-col overflow-hidden"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--card) calc(40% + var(--custom-surface-opacity, 50%) * 0.6), transparent)'
        }}
      >
        {/* ── 头部 ── */}
        <div className="flex items-center justify-between gap-3 px-4 pt-2.5 pb-2 shrink-0">
          <div className="tab-picker-view-switch flex gap-4" role="tablist">
            <button
              onClick={() => setMode('tabs')}
              role="tab"
              aria-selected={mode === 'tabs'}
              className={`text-base font-serif leading-[1.05] border-none bg-transparent p-0 cursor-pointer transition-colors ${mode === 'tabs' ? 'text-foreground underline decoration-[color-mix(in_srgb,var(--accent)_68%,transparent)] underline-offset-[0.24em] decoration-[1.5px]' : 'text-muted-foreground/60 hover:text-foreground'}`}
            >
              {t('tabPickerTitle')}
            </button>
            <button
              onClick={() => setMode('url')}
              role="tab"
              aria-selected={mode === 'url'}
              className={`text-base font-serif leading-[1.05] border-none bg-transparent p-0 cursor-pointer transition-colors ${mode === 'url' ? 'text-foreground underline decoration-[color-mix(in_srgb,var(--accent)_68%,transparent)] underline-offset-[0.24em] decoration-[1.5px]' : 'text-muted-foreground/60 hover:text-foreground'}`}
            >
              {t('addByUrlTitle')}
            </button>
          </div>
          <button
            onClick={onClose}
            className="size-7 p-0 rounded-full border-none bg-transparent text-muted-foreground cursor-pointer flex items-center justify-center shrink-0 hover:bg-muted/30 hover:text-foreground transition-colors"
          >
            <X strokeWidth={2} className="size-3.5" />
          </button>
        </div>

        {/* ── 内容 ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mode === 'tabs' && (
            <>
              {/* ── 搜索栏 ── */}
              <div className="flex items-center gap-2 px-3.5 pb-2.5 shrink-0">
                <Search strokeWidth={1.8} className="size-3.5 text-muted-foreground shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('tabPickerSearchPlaceholder')}
                  className="flex-1 border-none bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>

              {/* ── 标签列表 ── */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-1.5 pb-1">
                {loading ? (
                  <div className="p-6 text-xs text-muted-foreground text-center">
                    {t('loading')}
                  </div>
                ) : groupedTabs.length === 0 ? (
                  <div className="p-6 text-xs text-muted-foreground text-center">No tabs found</div>
                ) : (
                  groupedTabs.map((group) => (
                    <div key={group.domain}>
                      <div className="sticky top-0 z-1 text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground px-2.5 py-2 bg-card/95">
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
                <div className="flex items-center gap-2 px-3.5 py-2.5 border-t border-[color-mix(in_srgb,var(--accent)_16%,transparent)] shrink-0">
                  <span className="flex-1 text-xs text-muted-foreground">
                    {selectedIds.size} selected
                  </span>
                  <button
                    onClick={handleClearSelection}
                    className="text-xs font-medium bg-transparent text-muted-foreground p-1.5 rounded-[6px] border-none cursor-pointer hover:text-foreground transition-colors"
                  >
                    {t('clearSelection')}
                  </button>
                  <button
                    onClick={handleAddSelected}
                    className="text-xs font-semibold bg-primary text-primary-foreground rounded-full px-3.5 py-1.5 border-none cursor-pointer transition-all hover:opacity-85"
                  >
                    {t('addLink')}
                  </button>
                </div>
              )}
            </>
          )}
          {mode === 'url' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <ShortcutEditorForm shortcut={null} onSave={handleSaveFromUrl} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
