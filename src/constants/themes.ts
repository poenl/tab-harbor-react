import type { ThemePaletteId, ThemeMode, ThemePreferences } from '@/types/theme'

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  mode: 'system',
  paletteId: 'paper',
  customBackground: '',
  surfaceOpacity: 14,
  uiScale: 100,
  shortcutScale: 100,
  hitokotoEnabled: true,
  sleepControlEnabled: false,
  closeDuplicateNewTabsEnabled: false,
  savedSessionRestoreMode: 'new-window',
  savedSessionNavDisplayMode: 'name',
}

function getSystemTone(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTone(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTone()
  return mode
}

export const THEME_PALETTES: Record<ThemePaletteId, { name: string }> = {
  paper: { name: 'Paper' },
  sage: { name: 'Sage' },
  mist: { name: 'Mist' },
  blush: { name: 'Blush' },
}
