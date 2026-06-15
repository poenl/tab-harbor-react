import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from '@/i18n'
import { useTheme } from '@/stores/theme'
import { getTabQuery } from '@/utils/tabs'
import { useQuickShortcuts } from '@/newtab/hooks/useQuickShortcuts'
import { getFallbackLabel } from '@/newtab/utils/icon-utils'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ShortcutEditorForm } from './ShortcutEditorDialog.tsx'
import { X, Plus } from 'lucide-react'

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
        className="w-3.5 h-3.5 rounded-xs shrink-0"
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <span className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] font-bold shrink-0 text-primary bg-secondary">
      {initial}
    </span>
  )
}

function TabRow({
  tab,
  selected,
  onToggle
}: {
  tab: BrowserTab
  selected: boolean
  onToggle: (id: number) => void
}) {
  return (
    <label className="flex items-center gap-2 py-2 border-b border-border/50 text-[13px] leading-[1.4] last:border-b-0 hover:bg-secondary/50 rounded-md px-4 transition-colors duration-150 cursor-pointer">
      <Checkbox checked={selected} onCheckedChange={() => onToggle(tab.id)} />
      <TabFavicon tab={tab} />
      <span className="flex-1 min-w-0 truncate text-foreground">{tab.title || tab.url}</span>
    </label>
  )
}

export function TabPicker({ onClose }: TabPickerProps) {
  const { t } = useTranslation()
  const { preferences } = useTheme()
  const { add } = useQuickShortcuts()
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

  function toggleTab(id: number) {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  async function handleAddSelected() {
    const selected = tabs.filter((t) => selectedIds.has(t.id))
    for (const tab of selected) {
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
      <div className="fixed inset-0 z-50 bg-foreground/5" onClick={onClose} />
      <div className="fixed bottom-6 right-6 z-50 w-80 h-[min(480px,calc(100vh-80px))] bg-card border border-border rounded-2xl shadow-[0_14px_28px_var(--tw-shadow-color)] shadow-primary/5 flex flex-col overflow-hidden">
        {/* ── 头部 ── */}
        <div className="flex items-center gap-2 p-[14px_16px] border-b border-border/50">
          <div className="inline-flex items-center gap-0.5 p-0.5 border border-border/60 rounded-lg bg-secondary/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('tabs')}
              className={cn(mode === 'tabs' && 'bg-card shadow-sm')}
            >
              {t('tabPickerTitle')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('url')}
              className={cn(mode === 'url' && 'bg-card shadow-sm')}
            >
              {t('addByUrlTitle')}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-auto text-muted-foreground hover:text-destructive"
          >
            <X strokeWidth={2} className="size-4" />
          </Button>
        </div>

        {/* ── 内容 ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mode === 'tabs' && (
            <>
              <div className="px-4 py-2 border-b border-border/30 shrink-0">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('tabPickerSearchPlaceholder')}
                  className="h-7 text-xs"
                />
              </div>
              <div className="flex-1 overflow-auto">
                {loading ? (
                  <div className="p-4 text-xs text-muted-foreground text-center">
                    {t('loading')}
                  </div>
                ) : filteredTabs.length === 0 ? (
                  <div className="p-4 text-xs text-muted-foreground text-center">No tabs found</div>
                ) : (
                  filteredTabs.map((tab) => (
                    <TabRow
                      key={tab.id}
                      tab={tab}
                      selected={selectedIds.has(tab.id)}
                      onToggle={toggleTab}
                    />
                  ))
                )}
              </div>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.75 border-t border-border/50 bg-[color-mix(in_srgb,var(--card)_74%,var(--background)_26%)] shrink-0">
                  <span className="flex-1 text-xs text-muted-foreground">
                    {selectedIds.size} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="text-xs h-7"
                  >
                    {t('clearSelection')}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddSelected}
                    className="text-xs h-7"
                  >
                    <Plus strokeWidth={2} className="size-3.5 mr-0.5" />
                    {t('addLink')}
                  </Button>
                </div>
              )}
            </>
          )}
          {mode === 'url' && (
            <div className="flex-1 overflow-auto">
              <ShortcutEditorForm shortcut={null} onSave={handleSaveFromUrl} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
