export type ThemePaletteId = 'paper' | 'sage' | 'mist' | 'blush'

export type ThemeMode = 'system' | 'light' | 'dark'

export type SavedSessionNavDisplayMode = 'icon' | 'name'

export type TabScope = 'current-window' | 'all-windows'

export interface ThemePreferences {
  mode: ThemeMode
  paletteId: ThemePaletteId
  customBackground: string
  surfaceOpacity: number
  uiScale: number
  shortcutScale: number
  hitokotoEnabled: boolean
  sleepControlEnabled: boolean
  closeDuplicateNewTabsEnabled: boolean
  savedSessionRestoreMode: 'current-window' | 'new-window'
  savedSessionNavDisplayMode: SavedSessionNavDisplayMode
  tabScope: TabScope
}

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  mode: 'system',
  paletteId: 'paper',
  customBackground: '',
  surfaceOpacity: 50,
  uiScale: 100,
  shortcutScale: 100,
  hitokotoEnabled: true,
  sleepControlEnabled: false,
  closeDuplicateNewTabsEnabled: false,
  savedSessionRestoreMode: 'new-window',
  savedSessionNavDisplayMode: 'name',
  tabScope: 'current-window'
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
  blush: { name: 'Blush' }
}
