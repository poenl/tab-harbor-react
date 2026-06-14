export type ThemePaletteId = 'paper' | 'sage' | 'mist' | 'blush';

export type ThemeMode = 'system' | 'light' | 'dark';

export type SavedSessionRestoreMode = 'current-window' | 'new-window';

export type SavedSessionNavDisplayMode = 'icon' | 'name';

export interface ThemePreferences {
  mode: ThemeMode;
  paletteId: ThemePaletteId;
  customBackground: string;
  surfaceOpacity: number;
  uiScale: number;
  shortcutScale: number;
  hitokotoEnabled: boolean;
  sleepControlEnabled: boolean;
  closeDuplicateNewTabsEnabled: boolean;
  savedSessionRestoreMode: SavedSessionRestoreMode;
  savedSessionNavDisplayMode: SavedSessionNavDisplayMode;
}
