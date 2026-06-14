import type { ThemePaletteId, ThemeMode, ThemePreferences } from '@/types/theme'

export interface PaletteTone {
  '--ink': string
  '--paper': string
  '--warm-gray': string
  '--muted': string
  '--accent-amber': string
  '--accent-sage': string
  '--accent-slate': string
  '--accent-rose': string
  '--workspace-accent': string
  '--workspace-accent-soft': string
  '--workspace-accent-border': string
  '--workspace-accent-contrast': string
  '--status-active': string
  '--status-cooling': string
  '--status-abandoned': string
  '--card-bg': string
}

export interface PaletteDefinition {
  name: string
  light: PaletteTone
  dark: PaletteTone
}

export const THEME_FAMILIES: Record<ThemePaletteId, PaletteDefinition> = {
  paper: {
    name: 'Paper',
    light: {
      '--ink': '#1a1613',
      '--paper': '#f8f5f0',
      '--warm-gray': '#e8e2da',
      '--muted': '#9a918a',
      '--accent-amber': '#c8713a',
      '--accent-sage': '#5a7a62',
      '--accent-slate': '#5a6b7a',
      '--accent-rose': '#b35a5a',
      '--workspace-accent': '#8a653f',
      '--workspace-accent-soft': '#f2e7db',
      '--workspace-accent-border': '#d4b396',
      '--workspace-accent-contrast': '#fffaf5',
      '--status-active': '#3d7a4a',
      '--status-cooling': '#b8892e',
      '--status-abandoned': '#b35a5a',
      '--card-bg': '#fffdf9',
    },
    dark: {
      '--ink': '#e8e2da',
      '--paper': '#1a1613',
      '--warm-gray': '#2d2722',
      '--muted': '#7a726a',
      '--accent-amber': '#d4854a',
      '--accent-sage': '#6a8a72',
      '--accent-slate': '#6a7b8a',
      '--accent-rose': '#b37a7a',
      '--workspace-accent': '#a0754f',
      '--workspace-accent-soft': '#2d2722',
      '--workspace-accent-border': '#5a4a3a',
      '--workspace-accent-contrast': '#f8f5f0',
      '--status-active': '#5a9a6a',
      '--status-cooling': '#c89a3a',
      '--status-abandoned': '#c36a6a',
      '--card-bg': '#231f1a',
    },
  },
  sage: {
    name: 'Sage',
    light: {
      '--ink': '#172018',
      '--paper': '#eef2eb',
      '--warm-gray': '#dbe3d7',
      '--muted': '#7f8c81',
      '--accent-amber': '#8b7146',
      '--accent-sage': '#4d6f57',
      '--accent-slate': '#5e7072',
      '--accent-rose': '#9a6860',
      '--workspace-accent': '#4f7657',
      '--workspace-accent-soft': '#deebe1',
      '--workspace-accent-border': '#9ebda6',
      '--workspace-accent-contrast': '#f6fbf7',
      '--status-active': '#446953',
      '--status-cooling': '#907548',
      '--status-abandoned': '#996760',
      '--card-bg': '#fafcf8',
    },
    dark: {
      '--ink': '#d8e3d7',
      '--paper': '#172018',
      '--warm-gray': '#252d25',
      '--muted': '#6a7a6a',
      '--accent-amber': '#9a8a5a',
      '--accent-sage': '#6a9a7a',
      '--accent-slate': '#6a7a8a',
      '--accent-rose': '#9a7a7a',
      '--workspace-accent': '#5a8a6a',
      '--workspace-accent-soft': '#252d25',
      '--workspace-accent-border': '#3a4a3a',
      '--workspace-accent-contrast': '#eef2eb',
      '--status-active': '#5a9a7a',
      '--status-cooling': '#b89a4a',
      '--status-abandoned': '#c36a6a',
      '--card-bg': '#1e261e',
    },
  },
  mist: {
    name: 'Mist',
    light: {
      '--ink': '#161c21',
      '--paper': '#eef2f5',
      '--warm-gray': '#d8dee5',
      '--muted': '#7d8791',
      '--accent-amber': '#927255',
      '--accent-sage': '#5d7569',
      '--accent-slate': '#4f687a',
      '--accent-rose': '#9b6b71',
      '--workspace-accent': '#4f6d88',
      '--workspace-accent-soft': '#dde7f0',
      '--workspace-accent-border': '#9fb2c5',
      '--workspace-accent-contrast': '#f7fafc',
      '--status-active': '#4e6c61',
      '--status-cooling': '#94724a',
      '--status-abandoned': '#93636c',
      '--card-bg': '#fafcfd',
    },
    dark: {
      '--ink': '#d8dee5',
      '--paper': '#161c21',
      '--warm-gray': '#252d35',
      '--muted': '#5d6771',
      '--accent-amber': '#a08a6a',
      '--accent-sage': '#6a8a7a',
      '--accent-slate': '#6a8a9a',
      '--accent-rose': '#9a7a7a',
      '--workspace-accent': '#6a8a9a',
      '--workspace-accent-soft': '#252d35',
      '--workspace-accent-border': '#3a4a5a',
      '--workspace-accent-contrast': '#f8f5f0',
      '--status-active': '#5a9a7a',
      '--status-cooling': '#c8a83a',
      '--status-abandoned': '#c36a6a',
      '--card-bg': '#1c232b',
    },
  },
  blush: {
    name: 'Blush',
    light: {
      '--ink': '#201716',
      '--paper': '#f6efec',
      '--warm-gray': '#e5d8d2',
      '--muted': '#97827c',
      '--accent-amber': '#a06d4f',
      '--accent-sage': '#6a7866',
      '--accent-slate': '#64707a',
      '--accent-rose': '#ad6966',
      '--workspace-accent': '#a5656f',
      '--workspace-accent-soft': '#f2dfe1',
      '--workspace-accent-border': '#d2a1a7',
      '--workspace-accent-contrast': '#fff7f8',
      '--status-active': '#5a7162',
      '--status-cooling': '#9c7448',
      '--status-abandoned': '#a96262',
      '--card-bg': '#fffaf7',
    },
    dark: {
      '--ink': '#e8e2da',
      '--paper': '#201716',
      '--warm-gray': '#332a2a',
      '--muted': '#8a7a7a',
      '--accent-amber': '#a06d4f',
      '--accent-sage': '#6a7a6a',
      '--accent-slate': '#6a7a8a',
      '--accent-rose': '#c37a7a',
      '--workspace-accent': '#a5656f',
      '--workspace-accent-soft': '#332a2a',
      '--workspace-accent-border': '#5a4a4a',
      '--workspace-accent-contrast': '#f6efec',
      '--status-active': '#5a9a7a',
      '--status-cooling': '#b89a4a',
      '--status-abandoned': '#c36a6a',
      '--card-bg': '#281f1f',
    },
  },
}

export const THEME_PALETTE_ORDER: ThemePaletteId[] = ['paper', 'sage', 'mist', 'blush']

export const THEME_MODE_ORDER: ThemeMode[] = ['system', 'light', 'dark']

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

export function getSystemTone(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTone(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTone()
  return mode
}
