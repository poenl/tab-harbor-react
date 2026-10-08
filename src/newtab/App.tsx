import { useState, useRef } from 'react'
import { BackToTop } from './components/BackToTop.tsx'
import { GroupNav } from './components/GroupNav.tsx'
import { WorkspacePageSwitch } from './components/WorkspacePageSwitch.tsx'
import { SettingsDropdown } from './components/SettingsDropdown.tsx'
import { BookmarksBar } from './components/BookmarksBar.tsx'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { HomePage } from './home/HomePage.tsx'
import { SavedTabsPage } from './saved-tabs/SavedTabsPage.tsx'
import { useOpenTabsStore } from '@/stores/openTabs'
import { useSavedSessionsStore } from '@/stores/savedSessions'
import { useTheme } from '@/stores/theme'

export default function App() {
  const groups = useOpenTabsStore((s) => s.groups)
  const sessions = useSavedSessionsStore((s) => s.sessions)
  const { preferences } = useTheme()
  const [currentPage, setCurrentPage] = useState<'home' | 'saved-tabs'>('home')
  const scrollRef = useRef<HTMLDivElement>(null)

  function scrollToAndHighlight(selector: string) {
    const el = document.querySelector(selector)
    const container = scrollRef.current
    if (!el || !container) return
    // 书签栏是 fixed 覆盖层（top-0），scrollIntoView 无法感知会遮住卡片标题，
    // 因此基于滚动容器手动计算落点：对齐位置扣除书签栏实际高度 + 留白
    const bar = document.querySelector('[data-bookmarks-fixed]')
    const offset = (bar?.getBoundingClientRect().height ?? 0) + 12
    const top =
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop -
      offset
    container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    // 高亮目标卡片（短暂 ring），1.2s 后移除
    el.classList.add('ring-2', 'ring-accent/20', 'shadow-lg')
    setTimeout(() => {
      el.classList.remove('ring-2', 'ring-accent/20', 'shadow-lg')
    }, 1200)
  }

  return (
    <TooltipProvider disableHoverableContent>
      <div ref={scrollRef} className="flex h-screen flex-col overflow-auto">
        {/* ── 书签栏（页面顶部全宽） ── */}
        <BookmarksBar />

        <div className="mx-auto flex w-full max-w-315 flex-1 flex-col px-8 pt-10 max-[960px]:px-5 max-[960px]:py-6 max-[960px]:pb-12">
          {/* ── 顶部导航栏：分组圆点 + 页面切换 + 设置 ── */}
          <div className="mb-3.5 flex flex-wrap items-start gap-4">
            {currentPage === 'home' ? (
              <GroupNav
                items={groups.map((g) => ({
                  id: g.domain,
                  label: g.label || g.domain,
                  tabs: g.tabs,
                  faviconUrl: g.faviconUrl
                }))}
                onNavigate={(id) => scrollToAndHighlight(`[data-domain="${id}"]`)}
              />
            ) : (
              <GroupNav
                items={sessions.map((s) => ({
                  id: s.id,
                  label: s.name,
                  tabs: s.tabs,
                  faviconUrl: s.faviconUrl
                }))}
                onNavigate={(id) => scrollToAndHighlight(`[data-session-id="${id}"]`)}
                variant={preferences.savedSessionNavDisplayMode}
              />
            )}
            <div className="relative ml-auto flex items-center gap-1.5 pt-2">
              <WorkspacePageSwitch currentPage={currentPage} onPageChange={setCurrentPage} />
              <SettingsDropdown />
            </div>
          </div>

          {/* ── 主体 ── */}
          {currentPage === 'home' ? <HomePage /> : <SavedTabsPage />}

          <Toaster />
          <BackToTop scrollRef={scrollRef} />
        </div>
      </div>
    </TooltipProvider>
  )
}
