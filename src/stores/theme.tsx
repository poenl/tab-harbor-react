import { createContext, useContext, useEffect, useCallback } from 'react'
import type { ThemePaletteId, ThemePreferences } from '@/types/theme'
import { useStorage } from '@/hooks/useStorage'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { THEME_FAMILIES, DEFAULT_THEME_PREFERENCES, resolveTone } from '@/constants/themes'
import type { ReactNode } from 'react'

interface ThemeContextValue {
  preferences: ThemePreferences
  updatePreferences: (partial: Partial<ThemePreferences>) => Promise<void>
  resolvedTone: 'light' | 'dark'
  ready: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme(paletteId: ThemePaletteId, tone: 'light' | 'dark', surfaceOpacity?: number) {
  const palette = THEME_FAMILIES[paletteId]
  const vars = tone === 'dark' ? palette.dark : palette.light
  const root = document.documentElement

  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, String(value))
  }

  root.classList.toggle('dark', tone === 'dark')
  document.body.classList.remove('theme-tone-light', 'theme-tone-dark')
  document.body.classList.add(tone === 'dark' ? 'theme-tone-dark' : 'theme-tone-light')

  if (surfaceOpacity != null) {
    root.style.setProperty('--custom-surface-opacity', `${surfaceOpacity}%`)
    root.style.setProperty('--custom-border-opacity', `${surfaceOpacity}%`)
    root.style.setProperty('--custom-badge-opacity', `${Math.max(2, Math.round(surfaceOpacity / 3))}%`)
    root.style.setProperty('--custom-fallback-opacity', `${Math.max(3, Math.round(surfaceOpacity / 2.5))}%`)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences, ready] = useStorage<ThemePreferences>(
    STORAGE_KEYS.THEME_PREFERENCES,
    DEFAULT_THEME_PREFERENCES,
  )

  const tone = resolveTone(preferences.mode)

  useEffect(() => {
    if (!ready) return
    applyTheme(preferences.paletteId, tone, preferences.surfaceOpacity)
  }, [preferences.paletteId, tone, preferences.surfaceOpacity, ready])

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

  const updatePreferences = async (partial: Partial<ThemePreferences>) => {
    await setPreferences({ ...preferences, ...partial })
  }

  return (
    <ThemeContext.Provider value={{ preferences, updatePreferences, resolvedTone: tone, ready }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
