import { createContext, useContext, useState, type ReactNode } from 'react'

export interface DndState {
  draggedId: string | null
  sourceParentId: string | null
}

export interface DndContextValue {
  state: DndState
  startDrag: (id: string, sourceParentId: string | null) => (e: React.DragEvent) => void
  clearDrag: () => void
}

const Ctx = createContext<DndContextValue>(null!)

export function DndProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DndState>({
    draggedId: null,
    sourceParentId: null
  })

  const startDrag = (id: string, sourceParentId: string | null) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
    setState({ draggedId: id, sourceParentId })
  }

  const clearDrag = () => {
    setState({ draggedId: null, sourceParentId: null })
  }

  return <Ctx.Provider value={{ state, startDrag, clearDrag }}>{children}</Ctx.Provider>
}

export function useBookmarkDnd() {
  return useContext(Ctx)
}
