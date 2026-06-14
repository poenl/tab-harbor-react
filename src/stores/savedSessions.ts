import { create } from 'zustand'
import { browser } from 'wxt/browser'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import type { SavedTabSession, SavedTabTab } from '@/types/session'

function createSessionId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `tab-session-${ts}-${rand}`
}

function isRestorable(url: string): boolean {
  return !url.startsWith('chrome://') && !url.startsWith('about:') && !url.startsWith('chrome-extension://')
}

interface SavedSessionsStore {
  sessions: SavedTabSession[]
  collapsed: Record<string, boolean>
  ready: boolean
  restoreMode: 'new-window' | 'current-window'

  load: () => Promise<void>
  addSession: (input: { name?: string; tabs: SavedTabTab[] }) => Promise<string>
  removeSession: (id: string) => Promise<void>
  renameSession: (id: string, name: string) => Promise<void>
  removeTabFromSession: (sessionId: string, tabIndex: number) => Promise<void>
  toggleCollapse: (sessionId: string) => Promise<void>
  restoreSession: (id: string) => Promise<void>
  restoreTab: (sessionId: string, tabIndex: number) => Promise<void>
  setRestoreMode: (mode: 'new-window' | 'current-window') => Promise<void>
}

export const useSavedSessionsStore = create<SavedSessionsStore>((set, get) => ({
  sessions: [],
  collapsed: {},
  ready: false,
  restoreMode: 'new-window',

  load: async () => {
    const result = await browser.storage.local.get([
      STORAGE_KEYS.SAVED_TAB_SESSIONS,
      STORAGE_KEYS.SAVED_TAB_SESSION_COLLAPSED,
      STORAGE_KEYS.RESTORE_MODE,
    ])
    set({
      sessions: (result[STORAGE_KEYS.SAVED_TAB_SESSIONS] as SavedTabSession[]) ?? [],
      collapsed: (result[STORAGE_KEYS.SAVED_TAB_SESSION_COLLAPSED] as Record<string, boolean>) ?? {},
      restoreMode: (result[STORAGE_KEYS.RESTORE_MODE] as 'new-window' | 'current-window') ?? 'new-window',
      ready: true,
    })
  },

  addSession: async (input) => {
    const id = createSessionId()
    const session: SavedTabSession = {
      id,
      name: input.name || 'Saved tabs',
      tabs: input.tabs.filter(t => isRestorable(t.url)),
      savedAt: new Date().toISOString(),
      source: 'selected',
    }
    const sessions = [...get().sessions, session]
    await browser.storage.local.set({ [STORAGE_KEYS.SAVED_TAB_SESSIONS]: sessions })
    set({ sessions })
    return id
  },

  removeSession: async (id) => {
    const sessions = get().sessions.filter(s => s.id !== id)
    await browser.storage.local.set({ [STORAGE_KEYS.SAVED_TAB_SESSIONS]: sessions })
    set({ sessions })
  },

  renameSession: async (id, name) => {
    const sessions = get().sessions.map(s => s.id === id ? { ...s, name } : s)
    await browser.storage.local.set({ [STORAGE_KEYS.SAVED_TAB_SESSIONS]: sessions })
    set({ sessions })
  },

  removeTabFromSession: async (sessionId, tabIndex) => {
    const sessions = get().sessions.map(s =>
      s.id === sessionId
        ? { ...s, tabs: s.tabs.filter((_, i) => i !== tabIndex) }
        : s
    )
    await browser.storage.local.set({ [STORAGE_KEYS.SAVED_TAB_SESSIONS]: sessions })
    set({ sessions })
  },

  toggleCollapse: async (sessionId) => {
    const collapsed = { ...get().collapsed }
    collapsed[sessionId] = !collapsed[sessionId]
    await browser.storage.local.set({ [STORAGE_KEYS.SAVED_TAB_SESSION_COLLAPSED]: collapsed })
    set({ collapsed })
  },

  setRestoreMode: async (mode) => {
    await browser.storage.local.set({ [STORAGE_KEYS.RESTORE_MODE]: mode })
    set({ restoreMode: mode })
  },

  restoreSession: async (id) => {
    const session = get().sessions.find(s => s.id === id)
    if (!session || session.tabs.length === 0) return

    const currentWindow = await browser.windows.getCurrent()
    const winId = currentWindow.id
    if (!winId) return

    const restoreMode = get().restoreMode
    const tabs = session.tabs

    if (restoreMode === 'new-window') {
      // 此标签页：当前标签导航到第一个 URL，其余创建新标签
      const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
      if (activeTab?.id) {
        await browser.tabs.update(activeTab.id, { url: tabs[0].url })
      }
      for (let i = 1; i < tabs.length; i++) {
        await browser.tabs.create({ url: tabs[i].url, windowId: winId })
      }
    } else {
      // 新标签页：全部创建新标签
      for (const tab of tabs) {
        await browser.tabs.create({ url: tab.url, windowId: winId })
      }
    }
  },

  restoreTab: async (sessionId, tabIndex) => {
    const session = get().sessions.find(s => s.id === sessionId)
    const tab = session?.tabs[tabIndex]
    if (tab) {
      const currentWindow = await browser.windows.getCurrent()
      const winId = currentWindow.id
      if (winId) {
        await browser.tabs.create({ url: tab.url, windowId: winId })
      }
    }
  },
}))
