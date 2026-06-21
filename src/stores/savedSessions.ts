import { create } from 'zustand'
import { browser } from 'wxt/browser'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface SavedTabTab {
  url: string
  title: string
  favIconUrl?: string
}

export interface SavedTabSession {
  id: string
  name: string
  tabs: SavedTabTab[]
  savedAt: string
  source: 'manual' | 'current-window' | 'selected' | 'single-tab' | 'group'
}

export function createSessionId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `tab-session-${ts}-${rand}`
}

function isRestorable(url: string): boolean {
  return (
    !url.startsWith('chrome://') &&
    !url.startsWith('about:') &&
    !url.startsWith('chrome-extension://')
  )
}

interface SavedSessionsStore {
  sessions: SavedTabSession[]
  collapsed: Record<string, boolean>
  ready: boolean
  restoreMode: 'new-window' | 'current-window'

  addSession: (input: { name?: string; tabs: SavedTabTab[] }) => string
  removeSession: (id: string) => void
  renameSession: (id: string, name: string) => void
  removeTabFromSession: (sessionId: string, tabIndex: number) => void
  toggleCollapse: (sessionId: string, isCollapsed?: boolean) => void
  restoreSession: (id: string) => Promise<void>
  restoreTab: (sessionId: string, tabIndex: number) => Promise<void>
  setRestoreMode: (mode: 'new-window' | 'current-window') => void
  setSessions: (
    updater: SavedTabSession[] | ((prev: SavedTabSession[]) => SavedTabSession[])
  ) => void
}

export const useSavedSessionsStore = create<SavedSessionsStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      collapsed: {},
      ready: false,
      restoreMode: 'new-window',

      addSession: (input) => {
        const id = createSessionId()
        const session: SavedTabSession = {
          id,
          name: input.name || new Date().toLocaleString(),
          tabs: input.tabs.filter((t) => isRestorable(t.url)),
          savedAt: new Date().toISOString(),
          source: 'selected'
        }
        set({ sessions: [...get().sessions, session] })
        return id
      },

      removeSession: (id) => {
        set({ sessions: get().sessions.filter((s) => s.id !== id) })
      },

      renameSession: (id, name) => {
        set({ sessions: get().sessions.map((s) => (s.id === id ? { ...s, name } : s)) })
      },

      removeTabFromSession: (sessionId, tabIndex) => {
        set({
          sessions: get().sessions.map((s) =>
            s.id === sessionId ? { ...s, tabs: s.tabs.filter((_, i) => i !== tabIndex) } : s
          )
        })
      },

      toggleCollapse: (sessionId, isCollapsed) => {
        set({
          collapsed: { ...get().collapsed, [sessionId]: isCollapsed || !get().collapsed[sessionId] }
        })
      },

      setRestoreMode: (mode) => {
        set({ restoreMode: mode })
      },

      setSessions: (updater) => {
        const next = typeof updater === 'function' ? updater(get().sessions) : updater
        set({ sessions: next })
      },

      restoreSession: async (id) => {
        const session = get().sessions.find((s) => s.id === id)
        if (!session || session.tabs.length === 0) return

        const currentWindow = await browser.windows.getCurrent()
        const winId = currentWindow.id
        if (!winId) return

        const restoreMode = get().restoreMode
        const tabs = session.tabs

        if (restoreMode === 'new-window') {
          const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
          if (activeTab?.id) {
            await browser.tabs.update(activeTab.id, { url: tabs[0].url })
          }
          for (let i = 1; i < tabs.length; i++) {
            await browser.tabs.create({ url: tabs[i].url, windowId: winId })
          }
        } else {
          for (const tab of tabs) {
            await browser.tabs.create({ url: tab.url, windowId: winId })
          }
        }
      },

      restoreTab: async (sessionId, tabIndex) => {
        const session = get().sessions.find((s) => s.id === sessionId)
        const tab = session?.tabs[tabIndex]
        if (tab) {
          const currentWindow = await browser.windows.getCurrent()
          const winId = currentWindow.id
          if (winId) {
            await browser.tabs.create({ url: tab.url, windowId: winId })
          }
        }
      }
    }),
    {
      name: STORAGE_KEYS.SAVED_TAB_SESSIONS,
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const result = await browser.storage.local.get(name)
          const value = result[name]
          if (value === undefined) return null
          return typeof value === 'string' ? value : JSON.stringify(value)
        },
        setItem: async (name, value) => {
          await browser.storage.local.set({ [name]: value })
        },
        removeItem: async (name) => {
          await browser.storage.local.remove(name)
        }
      })),
      partialize: (state) => ({
        sessions: state.sessions,
        collapsed: state.collapsed,
        restoreMode: state.restoreMode
      }),
      onRehydrateStorage: () => () => {
        useSavedSessionsStore.setState({ ready: true })
      }
    }
  )
)

useSavedSessionsStore.subscribe((state) => {
  const cleaned = state.sessions.filter((s) => s.tabs.length > 0)
  if (cleaned.length !== state.sessions.length) {
    useSavedSessionsStore.setState({ sessions: cleaned })
  }
})
