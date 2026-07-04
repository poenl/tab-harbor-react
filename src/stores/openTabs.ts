import { create } from 'zustand'
import {
  type DomainGroup,
  type OpenTab,
  normalizeTab,
  buildDomainGroups
} from '@/newtab/utils/domain-grouping'
import { getTabQuery } from '@/utils/tabs'
import { useThemeStore } from '@/stores/theme'

interface OpenTabsState {
  allTabs: OpenTab[]
  groups: DomainGroup[]
  loading: boolean
  newTabUrl: string
  tabs: OpenTab[]

  closeDuplicateExtras: () => Promise<number>
  fetchTabs: () => Promise<void>
  closeTab: (tabId: number) => Promise<void>
  focusTab: (tab: { id: number; windowId: number }) => Promise<void>
}

export const useOpenTabsStore = create<OpenTabsState>()((set, get) => {
  const allTabs: OpenTab[] = []
  const groups: DomainGroup[] = []
  const loading = true
  const newTabUrl = ''
  const tabs: OpenTab[] = []

  const closeDuplicateExtras = async () => {
    const { allTabs, newTabUrl } = get()
    if (!newTabUrl) return 0
    const tabOutTabs = allTabs.filter((t) => t.url === newTabUrl)
    if (tabOutTabs.length <= 1) return 0
    const currentWindow = await browser.windows.getCurrent()
    const keep =
      tabOutTabs.find((t) => t.active && t.windowId === currentWindow.id) ||
      tabOutTabs.find((t) => t.active) ||
      tabOutTabs[0]
    const toClose = tabOutTabs.filter((t) => t.id !== keep.id).map((t) => t.id)
    if (toClose.length > 0) {
      await browser.tabs.remove(toClose)
    }
    return toClose.length
  }

  const fetchTabs = async () => {
    try {
      const { preferences } = useThemeStore.getState()
      const result = await browser.tabs.query(getTabQuery(preferences.tabScope))
      const openTabs = result.map(normalizeTab)
      let { newTabUrl } = get()
      if (!newTabUrl) {
        newTabUrl = result.find((t) => t.active)?.url || ''
        set({ newTabUrl })
      }
      const tabs = openTabs.filter((t) => t.id != null && t.url !== newTabUrl)
      const groups = buildDomainGroups(tabs)
      set({ allTabs: openTabs, groups, tabs, loading: false })
    } catch (error) {
      set({ allTabs: [], groups: [], tabs: [], loading: false })
    }
  }

  const closeTab = async (tabId: number) => {
    try {
      await browser.tabs.remove(tabId)
    } catch {}
  }

  const focusTab = async (tab: { id: number; windowId: number }) => {
    try {
      await browser.tabs.update(tab.id, { active: true })
      await browser.windows.update(tab.windowId, { focused: true })
    } catch {}
  }

  return {
    allTabs,
    groups,
    loading,
    newTabUrl,
    tabs,
    closeDuplicateExtras,
    fetchTabs,
    closeTab,
    focusTab
  }
})

function init() {
  const { fetchTabs, closeDuplicateExtras } = useOpenTabsStore.getState()
  fetchTabs()

  browser.tabs.onCreated.addListener(async () => {
    await fetchTabs()
    const { preferences } = useThemeStore.getState()
    if (preferences.closeDuplicateNewTabsEnabled) {
      await closeDuplicateExtras()
    }
  })
  browser.tabs.onRemoved.addListener(fetchTabs)
  browser.tabs.onUpdated.addListener(async () => {
    await fetchTabs()
    const { preferences } = useThemeStore.getState()
    if (preferences.closeDuplicateNewTabsEnabled) {
      await closeDuplicateExtras()
    }
  })
  browser.tabs.onActivated.addListener(fetchTabs)
  browser.tabs.onAttached.addListener(fetchTabs)
  browser.tabs.onDetached.addListener(fetchTabs)

  useThemeStore.subscribe((state, prevState) => {
    if (state.preferences.tabScope !== prevState.preferences.tabScope) {
      fetchTabs()
    }
  })
}

init()
