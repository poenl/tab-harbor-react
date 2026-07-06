import { create } from 'zustand'
import { browser } from 'wxt/browser'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { persist, createJSONStorage } from 'zustand/middleware'

type ShortcutIconKind = '' | 'emoji' | 'svg' | 'image' | 'website'

export interface QuickShortcut {
  id: string
  url: string
  label: string
  icon: string
  iconKind: ShortcutIconKind
}

function generateId(): string {
  return `shortcut-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeShortcutIcon(value: string): {
  icon: string
  iconKind: QuickShortcut['iconKind']
} {
  const text = (value || '').trim()
  if (!text) return { icon: '', iconKind: '' }
  if (/^<svg[\s\S]*<\/svg>$/i.test(text)) return { icon: text, iconKind: 'svg' }
  if (/^data:image\//i.test(text)) return { icon: text, iconKind: 'image' }
  if (/^https?:\/\//i.test(text) || text.startsWith('/')) return { icon: text, iconKind: 'image' }
  const glyph = text.slice(0, 2)
  return { icon: glyph, iconKind: 'emoji' }
}

function normalize(input: Partial<QuickShortcut>): QuickShortcut | null {
  const url = (input.url || '').trim()
  if (!url) return null

  const label = (input.label || '').trim()
  const rawIcon = input.icon || ''
  const rawKind = input.iconKind as string

  let icon = rawIcon
  let iconKind = rawKind as QuickShortcut['iconKind']

  if (!iconKind) {
    const normalized = normalizeShortcutIcon(icon)
    icon = normalized.icon
    iconKind = normalized.iconKind || ''
  }

  return {
    id: input.id || generateId(),
    url,
    label,
    icon,
    iconKind
  }
}

interface QuickShortcutsStore {
  shortcuts: QuickShortcut[]
  ready: boolean
  add: (partial: Partial<QuickShortcut>) => void
  update: (id: string, partial: Partial<QuickShortcut>) => void
  remove: (id: string) => void
}

export const useQuickShortcutsStore = create<QuickShortcutsStore>()(
  persist(
    (set, get) => ({
      shortcuts: [],
      ready: false,

      add: (partial) => {
        const entry = normalize({ ...partial, id: generateId() })
        if (!entry) return
        set({ shortcuts: [...get().shortcuts, entry] })
      },

      update: (id, partial) => {
        set({ shortcuts: get().shortcuts.map((s) => (s.id === id ? { ...s, ...partial } : s)) })
      },

      remove: (id) => {
        set({ shortcuts: get().shortcuts.filter((s) => s.id !== id) })
      }
    }),
    {
      name: STORAGE_KEYS.QUICK_SHORTCUTS,
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
      partialize: (state) => ({ shortcuts: state.shortcuts }),
      onRehydrateStorage: () => () => {
        useQuickShortcutsStore.setState({ ready: true })
      }
    }
  )
)
