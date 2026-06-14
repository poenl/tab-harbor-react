export interface SessionTab {
  url: string;
  title: string;
  favIconUrl: string;
  groupKey: string;
  groupLabel: string;
  manualGroupId: string;
}

export interface SavedSessionGroup {
  key: string;
  label: string;
  manualGroupId: string;
  tabUrls: string[];
}

export interface SavedTabSession {
  id: string;
  name: string;
  savedAt: string;
  source: string;
  tabs: SessionTab[];
  groups: SavedSessionGroup[];
}

export interface ChromeImportedMetaEntry {
  sessionGroupId: string;
  chromeGroupId: number | null;
  windowId: number;
  title: string;
  color: string;
}

export const MANUAL_GROUP_PREFIX = '__session_group__:';
