import { useState } from 'react'
import { GroupNav } from './components/GroupNav.tsx'
import { WorkspacePageSwitch } from './components/WorkspacePageSwitch.tsx'
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
    // ── 外层容器（1260px 居中） ──
    <div className="max-w-[1260px] mx-auto px-8 py-10 pb-18 max-[960px]:px-5 max-[960px]:py-6 max-[960px]:pb-12">

      {/* ── 顶部导航栏：分组圆点 + 页面切换 ── */}
      <div className="flex items-start gap-4 mb-[14px] flex-wrap min-h-10">
        <GroupNav groups={groups} onNavigate={(domain) => {
          document.querySelector(`[data-domain="${domain}"]`)?.scrollIntoView({ behavior: 'smooth' })
        }} />
        <WorkspacePageSwitch currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      {/* ── 主体 ── */}
      <main>
        {currentPage === 'home'
          ? <HomePage groups={groups} loading={loading} totalTabs={totalTabs} onCloseTab={handleCloseTab} onFocusTab={handleFocusTab} />
          : <SavedTabsPage />
        }
      </main>

      <Toaster />
    </div>
  )
}
