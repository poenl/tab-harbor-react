import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from '@/i18n'
import { useQuickShortcutsStore } from '@/stores/quickShortcuts'
import { useTheme } from '@/stores/theme'
import { getTabQuery } from '@/utils/tabs'
import { normalizeTab, buildDomainGroups } from '@/newtab/utils/domain-grouping'
import type { OpenTab } from '@/newtab/utils/domain-grouping'
import { Favicon } from '@/components/favicon'
import { ShortcutIcon } from '@/components/shortcut-icon'
import { getFallbackLabel } from '@/newtab/utils/icon-utils'
import { GroupIcon } from '@/components/group-icon'
import { RefreshCw, X } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export default function Popup() {
  const { t } = useTranslation()
  const { preferences } = useTheme()
  const shortcuts = useQuickShortcutsStore((s) => s.shortcuts)

  const [view, setView] = useState<'shortcuts' | 'tabs'>('shortcuts')
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  // ── 检测 prefers-reduced-motion ──
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // ── 入场动画 ──
  useEffect(() => {
    if (reducedMotion) {
      setReady(true)
      return
    }
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setReady(true))
    })
    return () => cancelAnimationFrame(raf)
  }, [reducedMotion])

  // ── 加载标签页 ──
  const loadTabs = useCallback(async () => {
    setRefreshing(true)
    try {
      const result = await browser.tabs.query(getTabQuery(preferences.tabScope))
      setOpenTabs(result.map(normalizeTab))
    } catch {
      setOpenTabs([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [preferences.tabScope])

  useEffect(() => {
    loadTabs()
    browser.tabs.onCreated.addListener(loadTabs)
    browser.tabs.onRemoved.addListener(loadTabs)
    browser.tabs.onUpdated.addListener(loadTabs)
    browser.tabs.onAttached.addListener(loadTabs)
    browser.tabs.onDetached.addListener(loadTabs)
    return () => {
      browser.tabs.onCreated.removeListener(loadTabs)
      browser.tabs.onRemoved.removeListener(loadTabs)
      browser.tabs.onUpdated.removeListener(loadTabs)
      browser.tabs.onAttached.removeListener(loadTabs)
      browser.tabs.onDetached.removeListener(loadTabs)
    }
  }, [loadTabs])

  const groups = buildDomainGroups(openTabs)

  // ── 打开快捷方式 ──
  async function handleOpenUrl(url: string) {
    try {
      const existing = await browser.tabs.query({ url })
      if (existing[0]?.id) {
        await browser.tabs.update(existing[0].id, { active: true })
        if (existing[0].windowId) {
          await browser.windows.update(existing[0].windowId, { focused: true })
        }
      } else {
        await browser.tabs.create({ url })
      }
    } catch {
      await browser.tabs.create({ url }).catch(() => {})
    }
    window.close()
  }

  // ── 聚焦标签页 ──
  async function handleFocusTab(tab: OpenTab) {
    try {
      await browser.tabs.update(tab.id, { active: true })
      await browser.windows.update(tab.windowId, { focused: true })
    } catch {
      await browser.tabs.create({ url: tab.url }).catch(() => {})
    }
    window.close()
  }

  // ── 关闭标签页 ──
  async function handleCloseTab(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    try {
      await browser.tabs.remove(id)
    } catch {}
  }

  // ── 跳转到分组 ──
  function handleJumpToGroup(domain: string) {
    setActiveGroup(domain)
    const el = document.querySelector(`[data-group-id="${CSS.escape(domain)}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const fadeCls = (i: number) =>
    `transition-all duration-200 ease-out ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`
  const fadeStyle = (i: number) => (ready ? undefined : { transitionDelay: `${i * 30}ms` })

  return (
    <div className="min-w-[380px] max-w-[420px] w-full bg-background text-foreground font-sans text-sm select-none flex flex-col max-h-[600px]">
      {/* ── 顶部栏 ── */}
      <header
        className={`flex items-center gap-2 p-[14px_16px_0] shrink-0 ${fadeCls(0)}`}
        style={fadeStyle(0)}
      >
        <div className="flex-1 flex bg-secondary rounded-lg p-[3px] gap-[2px]">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'shortcuts'}
            onClick={() => setView('shortcuts')}
            className={`flex-1 px-2.5 py-[5px] rounded-[7px] text-xs font-medium transition-all duration-180 cursor-pointer border border-transparent ${
              view === 'shortcuts'
                ? 'bg-card text-foreground font-semibold shadow-[0_1px_3px_var(--shadow),0_1px_1px_rgba(26,22,19,0.04)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/55'
            }`}
          >
            {t('shortcutsLabel')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'tabs'}
            onClick={() => setView('tabs')}
            className={`flex-1 px-2.5 py-[5px] rounded-[7px] text-xs font-medium transition-all duration-180 cursor-pointer border border-transparent ${
              view === 'tabs'
                ? 'bg-card text-foreground font-semibold shadow-[0_1px_3px_var(--shadow),0_1px_1px_rgba(26,22,19,0.04)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/55'
            }`}
          >
            {t('openTabsSectionTitle')}
          </button>
        </div>
        <button
          type="button"
          onClick={loadTabs}
          disabled={refreshing}
          aria-label={t('popupRefreshLabel')}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-muted-foreground bg-card/80 hover:bg-secondary hover:text-accent transition-all duration-150 cursor-pointer active:scale-90 disabled:pointer-events-none disabled:opacity-60"
        >
          {refreshing ? (
            <Spinner className="w-3.5 h-3.5" />
          ) : (
            <RefreshCw strokeWidth={2} className="w-3.5 h-3.5" />
          )}
        </button>
      </header>

      {/* ── 快捷方式面板 ── */}
      {view === 'shortcuts' && (
        <section
          className={`flex-1 overflow-y-auto min-h-0 p-[14px_16px_16px] ${fadeCls(1)}`}
          style={fadeStyle(1)}
        >
          {shortcuts.length === 0 ? (
            <div className="py-7 text-center text-muted-foreground text-xs">
              {t('popupShortcutsEmpty')}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5 content-start pr-0.5">
              {shortcuts.map((s, i) => (
                <div key={s.id} className={`w-[76px] shrink-0 ${fadeCls(i)}`} style={fadeStyle(i)}>
                  <button
                    type="button"
                    onClick={() => handleOpenUrl(s.url)}
                    aria-label={s.label || s.url}
                    className="grid justify-items-center content-start gap-1.5 w-full text-center cursor-pointer bg-none border-none p-0 hover:-translate-y-px transition-transform duration-240 ease-out"
                    style={{ gridTemplateRows: '40px auto' }}
                  >
                    <span className="w-10 h-10 rounded-xl bg-secondary inline-flex items-center justify-center shrink-0">
                      <ShortcutIcon shortcut={s} />
                    </span>
                    <span className="text-[11px] leading-[1.45] text-foreground/82 max-w-full overflow-hidden line-clamp-2">
                      {s.label || getFallbackLabel('', s.url)}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 标签页面板 ── */}
      {view === 'tabs' && (
        <section
          className={`flex flex-col flex-1 min-h-0 overflow-hidden ${fadeCls(1)}`}
          style={fadeStyle(1)}
        >
          {loading ? (
            <div className="py-7 text-center text-muted-foreground text-xs">{t('loading')}</div>
          ) : openTabs.length === 0 || groups.length === 0 ? (
            <div className="py-7 text-center text-muted-foreground text-xs px-4">
              {t('popupTabsEmpty')}
            </div>
          ) : (
            <>
              {/* ── 分组导航（固定顶部） ── */}
              <div
                className={`grid grid-cols-[repeat(auto-fill,40px)] justify-center gap-1.5 px-4 pb-1.5 pt-3 shrink-0 ${fadeCls(2)}`}
                style={fadeStyle(2)}
              >
                {groups.map((g, i) => {
                  const label = g.label || g.domain
                  return (
                    <Tooltip key={g.domain}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleJumpToGroup(g.domain)}
                          aria-label={label}
                          className={`w-10 h-10 rounded-full border shrink-0 inline-flex items-center justify-center cursor-pointer transition-all duration-200 ease-out hover:-translate-y-px ${
                            activeGroup === g.domain
                              ? 'border-primary bg-card shadow-sm'
                              : 'border-border bg-card/64 hover:border-primary'
                          } ${fadeCls(i)}`}
                          style={fadeStyle(i)}
                        >
                          <GroupIcon
                            tabs={g.tabs}
                            label={g.label || g.domain}
                            imgCls="w-[14px] h-[14px] rounded-[3px]"
                            fallbackCls="w-4 h-4 text-[8px]"
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6}>
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>

              {/* ── 标签分组列表（可滚动） ── */}
              <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4 pr-2 scrollbar-hide">
                <div className="flex flex-col gap-2">
                  {groups.map((g, gi) => {
                    const label = g.label || g.domain
                    return (
                      <div
                        key={g.domain}
                        data-group-id={g.domain}
                        className={`flex flex-col gap-1.5 ${fadeCls(gi)}`}
                        style={fadeStyle(gi)}
                      >
                        <h3 className="text-xs font-semibold text-foreground tracking-[-0.01em] m-0 border-l-2 border-secondary pl-1.5">
                          {label}
                        </h3>
                        <div className="flex flex-col gap-1">
                          {g.tabs.map((tab, ti) => (
                            <div
                              key={tab.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => handleFocusTab(tab)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleFocusTab(tab)
                              }}
                              className={`flex items-center gap-2 px-2.5 py-[7px] rounded-xl bg-card border border-border/45 shadow-[0_1px_2px_var(--shadow)] cursor-pointer transition-all duration-140 hover:bg-card/88 hover:border-accent/40 hover:shadow-[0_2px_5px_var(--shadow)] ${fadeCls(ti)}`}
                              style={fadeStyle(ti)}
                            >
                              <Favicon
                                tab={tab}
                                imgCls="w-4 h-4"
                                fallbackCls="w-4 h-4 text-[8px]"
                              />
                              <span className="flex-1 min-w-0 text-xs text-foreground overflow-hidden line-clamp-2 leading-[1.35] break-words">
                                {tab.title || t('untitledTab')}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCloseTab(e, tab.id)}
                                aria-label={t('closeTabButton')}
                                className="w-[22px] h-[22px] rounded shrink-0 flex items-center justify-center text-muted-foreground opacity-50 hover:opacity-100 hover:text-[rgb(179,90,90)] hover:bg-[rgba(179,90,90,0.08)] transition-all duration-150 cursor-pointer active:scale-95"
                              >
                                <X strokeWidth={2.5} className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}
