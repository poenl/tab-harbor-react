import { create } from 'zustand'
import { browser } from 'wxt/browser'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import type { SavedTabSession, SavedTabTab } from '@/types/session'
import type { ThemePreferences } from '@/types/theme'

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

  load: () => Promise<void>
  addSession: (input: { name?: string; tabs: SavedTabTab[] }) => Promise<string>
  removeSession: (id: string) => Promise<void>
  renameSession: (id: string, name: string) => Promise<void>
  removeTabFromSession: (sessionId: string, tabIndex: number) => Promise<void>
  toggleCollapse: (sessionId: string) => Promise<void>
  restoreSession: (id: string) => Promise<void>
  restoreTab: (sessionId: string, tabIndex: number) => Promise<void>
}

export const useSavedSessionsStore = create<SavedSessionsStore>((set, get) => ({
  sessions: [],
  collapsed: {},
  ready: false,

  load: async () => {
    const result = await browser.storage.local.get([
      STORAGE_KEYS.SAVED_TAB_SESSIONS,
      STORAGE_KEYS.SAVED_TAB_SESSION_COLLAPSED,
    ])
    set({
      sessions: (result[STORAGE_KEYS.SAVED_TAB_SESSIONS] as SavedTabSession[]) ?? [],
      collapsed: (result[STORAGE_KEYS.SAVED_TAB_SESSION_COLLAPSED] as Record<string, boolean>) ?? {},
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

  restoreSession: async (id) => {
    const session = get().sessions.find(s => s.id === id)
    if (!session || session.tabs.length === 0) return

    const result = await browser.storage.local.get(STORAGE_KEYS.THEME_PREFERENCES)
    const prefs = result[STORAGE_KEYS.THEME_PREFERENCES] as ThemePreferences | undefined
    const restoreMode = prefs?.savedSessionRestoreMode ?? 'new-window'

    if (restoreMode === 'new-window') {
      const win = await browser.windows.create({ url: session.tabs[0].url })
      const winId = win?.id
      if (winId) {
        for (let i = 1; i < session.tabs.length; i++) {
          await browser.tabs.create({ url: session.tabs[i].url, windowId: winId })
        }
      }
    } else {
      for (const tab of session.tabs) {
        await browser.tabs.create({ url: tab.url })
      }
    }
  },

  restoreTab: async (sessionId, tabIndex) => {
    const session = get().sessions.find(s => s.id === sessionId)
    const tab = session?.tabs[tabIndex]
    if (tab) {
      await browser.tabs.create({ url: tab.url })
    }
  },
}))
