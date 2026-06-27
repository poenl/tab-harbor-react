import { useEffect, useState } from 'react'
import { useTranslation } from '@/i18n'
import { useQuickShortcutsStore } from '@/stores/quickShortcuts'
import { useOpenTabsStore } from '@/stores/openTabs'
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
  const shortcuts = useQuickShortcutsStore((s) => s.shortcuts)

  const [view, setView] = useState<'shortcuts' | 'tabs'>('shortcuts')
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  const groups = useOpenTabsStore((s) => s.groups)
  const loading = useOpenTabsStore((s) => s.loading)

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

  // ── 手动刷新 ──
  async function handleRefresh() {
    setRefreshing(true)
    await useOpenTabsStore.getState().fetchTabs()
    setRefreshing(false)
  }

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
    <div className="bg-background text-foreground flex max-h-150 w-full max-w-105 min-w-95 flex-col font-sans text-sm select-none">
      {/* ── 顶部栏 ── */}
      <header
        className={`flex shrink-0 items-center gap-2 p-[14px_16px_0] ${fadeCls(0)}`}
        style={fadeStyle(0)}
      >
        <div className="bg-secondary flex flex-1 gap-0.5 rounded-lg p-0.75">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'shortcuts'}
            onClick={() => setView('shortcuts')}
            className={`flex-1 cursor-pointer rounded-[7px] border border-transparent px-2.5 py-1.25 text-xs font-medium transition-all duration-180 ${
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
            className={`flex-1 cursor-pointer rounded-[7px] border border-transparent px-2.5 py-1.25 text-xs font-medium transition-all duration-180 ${
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
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label={t('popupRefreshLabel')}
          className="text-muted-foreground bg-card/80 hover:bg-secondary hover:text-accent flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all duration-150 active:scale-90 disabled:pointer-events-none disabled:opacity-60"
        >
          {refreshing ? (
            <Spinner className="h-3.5 w-3.5" />
          ) : (
            <RefreshCw strokeWidth={2} className="h-3.5 w-3.5" />
          )}
        </button>
      </header>

      {/* ── 快捷方式面板 ── */}
      {view === 'shortcuts' && (
        <section
          className={`min-h-0 flex-1 overflow-y-auto p-[14px_16px_16px] ${fadeCls(1)}`}
          style={fadeStyle(1)}
        >
          {shortcuts.length === 0 ? (
            <div className="text-muted-foreground py-7 text-center text-xs">
              {t('popupShortcutsEmpty')}
            </div>
          ) : (
            <div className="flex flex-wrap content-start gap-2.5 pr-0.5">
              {shortcuts.map((s, i) => (
                <div key={s.id} className={`w-19 shrink-0 ${fadeCls(i)}`} style={fadeStyle(i)}>
                  <button
                    type="button"
                    onClick={() => handleOpenUrl(s.url)}
                    aria-label={s.label || s.url}
                    className="grid w-full cursor-pointer content-start justify-items-center gap-1.5 border-none bg-none p-0 text-center transition-transform duration-240 ease-out hover:-translate-y-px"
                    style={{ gridTemplateRows: '40px auto' }}
                  >
                    <span className="bg-secondary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <ShortcutIcon shortcut={s} />
                    </span>
                    <span className="text-foreground/82 line-clamp-2 max-w-full overflow-hidden text-[11px] leading-[1.45]">
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
          className={`flex min-h-0 flex-1 flex-col overflow-hidden ${fadeCls(1)}`}
          style={fadeStyle(1)}
        >
          {loading ? (
            <div className="text-muted-foreground py-7 text-center text-xs">{t('loading')}</div>
          ) : groups.length === 0 ? (
            <div className="text-muted-foreground px-4 py-7 text-center text-xs">
              {t('popupTabsEmpty')}
            </div>
          ) : (
            <>
              {/* ── 分组导航（固定顶部） ── */}
              <div
                className={`grid shrink-0 grid-cols-[repeat(auto-fill,40px)] justify-center gap-1.5 px-4 pt-3 pb-1.5 ${fadeCls(2)}`}
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
                          className={`inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 ease-out hover:-translate-y-px ${
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
              <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 pr-2 pb-4">
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
                        <h3 className="text-foreground border-secondary m-0 border-l-2 pl-1.5 text-xs font-semibold tracking-[-0.01em]">
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
                              className={`bg-card border-border/45 hover:bg-card/88 hover:border-accent/40 flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-1.75 shadow-[0_1px_2px_var(--shadow)] transition-all duration-140 hover:shadow-[0_2px_5px_var(--shadow)] ${fadeCls(ti)}`}
                              style={fadeStyle(ti)}
                            >
                              <Favicon
                                tab={tab}
                                imgCls="w-4 h-4"
                                fallbackCls="w-4 h-4 text-[8px]"
                              />
                              <span className="text-foreground line-clamp-2 min-w-0 flex-1 overflow-hidden text-xs leading-[1.35] wrap-break-word">
                                {tab.title || t('untitledTab')}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCloseTab(e, tab.id)}
                                aria-label={t('closeTabButton')}
                                className="text-muted-foreground flex h-5.5 w-5.5 shrink-0 cursor-pointer items-center justify-center rounded opacity-50 transition-all duration-150 hover:bg-[rgba(179,90,90,0.08)] hover:text-[rgb(179,90,90)] hover:opacity-100 active:scale-95"
                              >
                                <X strokeWidth={2.5} className="h-3 w-3" />
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
