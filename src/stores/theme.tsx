import { useEffect, useCallback } from 'react'
import type { ThemePaletteId, ThemePreferences } from '@/constants/preferences'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { resolveTone, DEFAULT_THEME_PREFERENCES } from '@/constants/preferences'
import type { ReactNode } from 'react'
import { create } from 'zustand'
import { browser } from 'wxt/browser'
import { persist, createJSONStorage } from 'zustand/middleware'

// ── Zustand persist store ──

interface ThemeStore {
  preferences: ThemePreferences
  ready: boolean
  updatePreferences: (partial: Partial<ThemePreferences>) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      preferences: DEFAULT_THEME_PREFERENCES,
      ready: false,

      updatePreferences: (partial) => {
        set((state) => ({ preferences: { ...state.preferences, ...partial } }))
      }
    }),
    {
      name: STORAGE_KEYS.THEME_PREFERENCES,
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
      partialize: (state) => ({ preferences: state.preferences }),
      onRehydrateStorage: () => () => {
        useThemeStore.setState({ ready: true })
      }
    }
  )
)

// ── Theme side effects provider ──

function applyTheme(paletteId: ThemePaletteId, tone: 'light' | 'dark', surfaceOpacity?: number) {
  const root = document.documentElement

  root.classList.remove('theme-paper', 'theme-sage', 'theme-mist', 'theme-blush')
  root.classList.add(`theme-${paletteId}`)

  root.classList.toggle('dark', tone === 'dark')
  document.body.classList.remove('theme-tone-light', 'theme-tone-dark')
  document.body.classList.add(tone === 'dark' ? 'theme-tone-dark' : 'theme-tone-light')

  if (surfaceOpacity != null) {
    root.style.setProperty('--custom-surface-opacity', `${surfaceOpacity}%`)
    root.style.setProperty('--custom-border-opacity', `${surfaceOpacity}%`)
    root.style.setProperty(
      '--custom-badge-opacity',
      `${Math.max(2, Math.round(surfaceOpacity / 5))}%`
    )
    root.style.setProperty(
      '--custom-fallback-opacity',
      `${Math.max(3, Math.round(surfaceOpacity / 4))}%`
    )
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preferences = useThemeStore((s) => s.preferences)
  const ready = useThemeStore((s) => s.ready)

  const tone = resolveTone(preferences.mode)

  useEffect(() => {
    if (!ready) return
    applyTheme(preferences.paletteId, tone, preferences.surfaceOpacity)
  }, [preferences.paletteId, tone, preferences.surfaceOpacity, ready])

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(preferences.uiScale / 100))
  }, [preferences.uiScale])

  useEffect(() => {
    if (preferences.customBackground) {
      document.body.style.backgroundImage = `url(${preferences.customBackground})`
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundAttachment = 'fixed'
    } else {
      document.body.style.backgroundImage = ''
      document.body.style.backgroundSize = ''
      document.body.style.backgroundPosition = ''
      document.body.style.backgroundAttachment = ''
    }
  }, [preferences.customBackground])

  const handleSystemChange = useCallback(() => {
    if (preferences.mode !== 'system') return
    const newTone = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    applyTheme(preferences.paletteId, newTone, preferences.surfaceOpacity)
  }, [preferences.paletteId, preferences.mode, preferences.surfaceOpacity])

  useEffect(() => {
    if (preferences.mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', handleSystemChange)
    return () => mq.removeEventListener('change', handleSystemChange)
  }, [preferences.mode, handleSystemChange])

  return children
}

// ── Public hook (replaces Context consumer) ──

export function useTheme() {
  const preferences = useThemeStore((s) => s.preferences)
  const updatePreferences = useThemeStore((s) => s.updatePreferences)
  const ready = useThemeStore((s) => s.ready)
  const tone = resolveTone(preferences.mode)
  return { preferences, updatePreferences, resolvedTone: tone, ready }
}
