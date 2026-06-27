import { create } from 'zustand'
import type { Browser } from 'wxt/browser'
import {
  type DomainGroup,
  normalizeTab,
  buildDomainGroups
} from '@/newtab/utils/domain-grouping'
import { getTabQuery } from '@/utils/tabs'
import { useThemeStore } from '@/stores/theme'
import { closeDuplicateNewTabs } from '@/utils/close-duplicate-tabs'

interface OpenTabsState {
  rawTabs: Browser.tabs.Tab[]
  loading: boolean
  groups: DomainGroup[]
  totalTabs: number
  tabOutCount: number

  fetchTabs: () => Promise<void>
  closeTab: (tabId: number) => Promise<void>
  focusTab: (tab: {
    id: number
    windowId: number
  }) => Promise<void>
}

export const useOpenTabsStore = create<OpenTabsState>()((set) => ({
  rawTabs: [],
  loading: true,
  groups: [],
  totalTabs: 0,
  tabOutCount: 0,

  fetchTabs: async () => {
    try {
      const { preferences } = useThemeStore.getState()
      const result = await browser.tabs.query(getTabQuery(preferences.tabScope))
      const openTabs = result.map(normalizeTab)
      const groups = buildDomainGroups(openTabs)
      const totalTabs = openTabs.length
      const extensionUrl = browser.runtime.getURL('/newtab.html')
      const tabOutCount = result.filter(
        (tab) => tab.url === extensionUrl || tab.url === 'chrome://newtab/'
      ).length
      set({ rawTabs: result, groups, totalTabs, tabOutCount, loading: false })
    } catch {
      set({ rawTabs: [], groups: [], totalTabs: 0, tabOutCount: 0, loading: false })
    }
  },

  closeTab: async (tabId: number) => {
    try {
      await browser.tabs.remove(tabId)
    } catch {}
  },

  focusTab: async (tab) => {
    try {
      await browser.tabs.update(tab.id, { active: true })
      await browser.windows.update(tab.windowId, { focused: true })
    } catch {}
  }
}))

function init() {
  const { fetchTabs } = useOpenTabsStore.getState()
  fetchTabs()

  function onTabCreated() {
    closeDuplicateNewTabs()
    fetchTabs()
  }

  browser.tabs.onCreated.addListener(onTabCreated)
  browser.tabs.onRemoved.addListener(fetchTabs)
  browser.tabs.onUpdated.addListener(fetchTabs)
  browser.tabs.onAttached.addListener(fetchTabs)
  browser.tabs.onDetached.addListener(fetchTabs)

  useThemeStore.subscribe((state, prevState) => {
    if (state.preferences.tabScope !== prevState.preferences.tabScope) {
      fetchTabs()
    }
  })
}

init()
