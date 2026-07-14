import { createContext, useContext } from 'react'

export interface BrowsedItemInfo {
  id: string
  parentId: string
  index: number
}

export interface BrowsingContextType {
  browsing: boolean
  enterBrowsing: () => void
  exitBrowsing: () => void
  draggedItem: BrowsedItemInfo | null
  setDraggedItem: (item: BrowsedItemInfo | null) => void
  rootOpenedChildId: string | null
  setRootOpenedChildId: (id: string | null) => void
}

export const BrowsingContext = createContext<BrowsingContextType | null>(null)

export function useBrowsing() {
  const ctx = useContext(BrowsingContext)
  if (!ctx) throw new Error('useBrowsing must be used within BrowsingProvider')
  return ctx
}

export type FlatNode =
  | { id: string; title: string; type: 'bookmark'; url: string }
  | { id: string; title: string; type: 'folder'; children: FlatNode[] }
