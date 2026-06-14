import { GroupNav } from './components/GroupNav.tsx'
import { Greeting } from './components/Greeting.tsx'
import { Hitokoto } from './components/Hitokoto.tsx'
import { SearchBar } from './components/SearchBar.tsx'
import { QuickShortcuts } from './components/QuickShortcuts.tsx'
import { DomainGroupCard } from './components/DomainGroup.tsx'
import { EmptyState } from './components/EmptyState.tsx'
import { useOpenTabs } from './hooks/useOpenTabs.ts'

export default function App() {
  const { groups, loading } = useOpenTabs()

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
    <div className="container">
      <GroupNav groups={groups} onNavigate={(domain) => {
        document.getElementById(`group-${domain}`)?.scrollIntoView({ behavior: 'smooth' })
      }} />

      <main className="workspace-page is-active" id="homePage">
        <div className="dashboard-columns">

          <section className="active-section" id="openTabsSection">
            <div className="section-header">
              <h2>Open Tabs</h2>
              <div className="section-line" />
              <div className="section-count">{totalTabs}</div>
            </div>

            {loading ? (
              <div className="text-sm text-muted-text py-8 text-center">Loading...</div>
            ) : groups.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="missions flex flex-col gap-3">
                {groups.map((group) => (
                  <div key={group.domain} id={`group-${group.domain}`}>
                    <DomainGroupCard
                      group={group}
                      onCloseTab={handleCloseTab}
                      onFocusTab={handleFocusTab}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <header className="page-header">
            <div className="header-left">
              <Greeting />
              <Hitokoto />
              <SearchBar />
              <QuickShortcuts />
            </div>
          </header>

        </div>

        <footer>
          <div className="footer-stats">
            <div className="stat">
              <div className="stat-num">{totalTabs}</div>
              <div className="stat-label">Open tabs</div>
            </div>
          </div>
          <div className="last-refresh">
            <span className="footer-credit">
              <a className="footer-credit-link" href="https://github.com/V-IOLE-T/tab-harbor" target="_blank">Tab Harbor</a>
              {' '}by{' '}
              <a className="footer-credit-link" href="https://github.com/V-IOLE-T" target="_blank">OO</a>
            </span>
          </div>
        </footer>
      </main>
    </div>
  )
}
