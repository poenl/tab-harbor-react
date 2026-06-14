import type { DomainGroup } from '@/newtab/utils/domain-grouping.ts'
import { SectionHeader } from './SectionHeader.tsx'
import { TabGroupList } from './TabGroupList.tsx'
import { Greeting } from './Greeting.tsx'
import { Hitokoto } from './Hitokoto.tsx'
import { SearchBar } from './SearchBar.tsx'
import { QuickShortcuts } from './QuickShortcuts.tsx'
import { Footer } from './Footer.tsx'

interface HomePageProps {
  groups: DomainGroup[]
  loading: boolean
  totalTabs: number
  onCloseTab?: (id: number) => void
  onFocusTab?: (id: number) => void
}

export function HomePage({ groups, loading, totalTabs, onCloseTab, onFocusTab }: HomePageProps) {
  return (
    <>
      {/* ── 两列布局（左: 1.35fr = 标签列表 / 右: 0.95fr = 问候+搜索+快捷） ── */}
      <div className="grid grid-cols-[1.35fr_0.95fr] gap-8 items-start max-[960px]:grid-cols-1 max-[960px]:gap-5">

        {/* ── 左栏：打开标签页 ── */}
        <section>
          <SectionHeader title="Open Tabs" count={totalTabs} />
          <TabGroupList
            groups={groups}
            loading={loading}
            onCloseTab={onCloseTab}
            onFocusTab={onFocusTab}
          />
        </section>

        {/* ── 右栏：头部（问候 + 一言 + 搜索 + 快捷链接） ── */}
        <header>
          <div className="flex flex-col gap-6">
            <Greeting />
            <Hitokoto />
            <SearchBar />
            <QuickShortcuts />
          </div>
        </header>

      </div>

      <Footer totalTabs={totalTabs} />
    </>
  )
}
