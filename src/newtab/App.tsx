import { useState } from 'react'
import { BackToTop } from './components/BackToTop.tsx'
import { GroupNav } from './components/GroupNav.tsx'
import { WorkspacePageSwitch } from './components/WorkspacePageSwitch.tsx'
import { SettingsDropdown } from './components/SettingsDropdown.tsx'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { HomePage } from './home/HomePage.tsx'
import { SavedTabsPage } from './saved-tabs/SavedTabsPage.tsx'
import { useOpenTabs } from './hooks/useOpenTabs.ts'
import { useSavedSessionsStore } from '@/stores/savedSessions'
import { useTheme } from '@/stores/theme'

export default function App() {
  const { groups, loading } = useOpenTabs()
  const sessions = useSavedSessionsStore((s) => s.sessions)
  const { preferences } = useTheme()
  const [currentPage, setCurrentPage] = useState<'home' | 'saved-tabs'>('home')

  async function handleCloseTab(id: number) {
    try {
      await browser.tabs.remove(id)
    } catch {}
  }

  async function handleFocusTab(id: number) {
    try {
      await browser.tabs.update(id, { active: true })
      await browser.windows.update((await browser.tabs.get(id)).windowId!, { focused: true })
    } catch {}
  }

  const totalTabs = groups.reduce((sum, g) => sum + g.tabs.length, 0)

  function scrollToAndHighlight(selector: string) {
    const el = document.querySelector(selector)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth' })
    el.classList.add('ring-2', 'ring-accent/20', 'shadow-lg')
    setTimeout(() => {
      el.classList.remove('ring-2', 'ring-accent/20', 'shadow-lg')
    }, 1200)
  }

  return (
    <TooltipProvider disableHoverableContent>
      <div className="h-screen flex flex-col max-w-315 mx-auto px-8 pt-10 max-[960px]:px-5 max-[960px]:py-6 max-[960px]:pb-12">
        {/* ── 顶部导航栏：分组圆点 + 页面切换 + 设置 ── */}
        <div className="flex items-start gap-4 mb-3.5 flex-wrap">
          {currentPage === 'home' ? (
            <GroupNav
              items={groups.map((g) => ({
                id: g.domain,
                label: g.label || g.domain,
                tabs: g.tabs
              }))}
              onNavigate={(id) => scrollToAndHighlight(`[data-domain="${id}"]`)}
            />
          ) : (
            <GroupNav
              items={sessions.map((s) => ({ id: s.id, label: s.name, tabs: s.tabs }))}
              onNavigate={(id) => scrollToAndHighlight(`[data-session-id="${id}"]`)}
              variant={preferences.savedSessionNavDisplayMode}
            />
          )}
          <div className="flex items-center gap-1.5 pt-2 ml-auto relative">
            <WorkspacePageSwitch currentPage={currentPage} onPageChange={setCurrentPage} />
            <SettingsDropdown />
          </div>
        </div>

        {/* ── 主体 ── */}
        {currentPage === 'home' ? (
          <HomePage
            groups={groups}
            loading={loading}
            totalTabs={totalTabs}
            onCloseTab={handleCloseTab}
            onFocusTab={handleFocusTab}
          />
        ) : (
          <SavedTabsPage />
        )}

        <Toaster />
        <BackToTop />
      </div>
    </TooltipProvider>
  )
}
