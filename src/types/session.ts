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
