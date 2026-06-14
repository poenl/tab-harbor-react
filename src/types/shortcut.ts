export type ShortcutIconKind = '' | 'emoji' | 'svg' | 'image' | 'website';

export interface QuickShortcut {
  id: string;
  url: string;
  label: string;
  icon: string;
  iconKind: ShortcutIconKind;
}
