import { useState } from 'react'
import { BackToTop } from './components/BackToTop.tsx'
import { GroupNav } from './components/GroupNav.tsx'
import { WorkspacePageSwitch } from './components/WorkspacePageSwitch.tsx'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { HomePage } from './home/index.tsx'
import { SavedTabsPage } from './saved-tabs/index.tsx'
import { useOpenTabs } from './hooks/useOpenTabs.ts'

export default function App() {
  const { groups, loading } = useOpenTabs()
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

  return (
    <TooltipProvider disableHoverableContent>
      <div className="h-screen flex flex-col max-w-315 mx-auto px-8 pt-10 max-[960px]:px-5 max-[960px]:py-6 max-[960px]:pb-12">
        {/* ── 顶部导航栏：分组圆点 + 页面切换 ── */}
        <div className="flex items-start gap-4 mb-3.5 flex-wrap">
          <GroupNav
            groups={groups}
            onNavigate={(domain) => {
              document
                .querySelector(`[data-domain="${domain}"]`)
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
          />
          <WorkspacePageSwitch currentPage={currentPage} onPageChange={setCurrentPage} />
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
