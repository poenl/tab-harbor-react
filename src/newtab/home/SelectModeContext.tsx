import { createContext, useContext, useState, type ReactNode } from 'react'
import { useOpenTabsStore } from '@/stores/openTabs'
import type { OpenTab } from '@/newtab/utils/domain-grouping'

interface SelectModeContextValue {
  selectTarget: string | null
  selectedTabIds: Set<number>
  enterSelectMode: (target: string, initialTabIds?: number[]) => void
  exitSelectMode: () => void
  toggleTab: (id: number) => void
  toggleGroup: (domain: string) => void
  selectAll: () => void
  saveTab: (tab: OpenTab) => void
  saveGroup: (domain: string) => void
  saveCurrentWindow: () => void
}

const SelectModeCtx = createContext<SelectModeContextValue | null>(null)

export function SelectModeProvider({ children }: { children: ReactNode }) {
  const groups = useOpenTabsStore((s) => s.groups)
  const [selectTarget, setSelectTarget] = useState<string | null>(null)
  const [selectedTabIds, setSelectedTabIds] = useState<Set<number>>(new Set())

  function enterSelectMode(target: string, initialTabIds?: number[]) {
    const scope =
      initialTabIds ??
      (target === '*'
        ? groups.flatMap((g) => g.tabs.map((t) => t.id))
        : groups.filter((g) => g.domain === target).flatMap((g) => g.tabs.map((t) => t.id)))
    setSelectTarget(target)
    setSelectedTabIds(new Set(scope))
  }

  function exitSelectMode() {
    setSelectTarget(null)
    setSelectedTabIds(new Set())
  }

  function toggleTab(id: number) {
    setSelectedTabIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleGroup(domain: string) {
    setSelectedTabIds((prev) => {
      const groupIds = groups
        .filter((g) => g.domain === domain)
        .flatMap((g) => g.tabs.map((t) => t.id))
      const allSelected = groupIds.every((id) => prev.has(id))
      const next = new Set(prev)
      for (const id of groupIds) {
        if (allSelected) next.delete(id)
        else next.add(id)
      }
      return next
    })
  }

  function selectAll() {
    setSelectedTabIds((prev) => {
      const allIds = groups.flatMap((g) => g.tabs.map((t) => t.id))
      const allSelected = allIds.every((id) => prev.has(id))
      return new Set(allSelected ? [] : allIds)
    })
  }

  function saveTab(tab: OpenTab) {
    const group = groups.find((g) => g.tabs.some((t) => t.id === tab.id))
    if (group?.domain) enterSelectMode(group.domain, [tab.id])
  }

  function saveGroup(domain: string) {
    enterSelectMode(domain)
  }

  function saveCurrentWindow() {
    enterSelectMode('*')
  }

  return (
    <SelectModeCtx.Provider
      value={{
        selectTarget,
        selectedTabIds,
        enterSelectMode,
        exitSelectMode,
        toggleTab,
        toggleGroup,
        selectAll,
        saveTab,
        saveGroup,
        saveCurrentWindow
      }}
    >
      {children}
    </SelectModeCtx.Provider>
  )
}

export function useSelectMode(): SelectModeContextValue {
  const ctx = useContext(SelectModeCtx)
  if (!ctx) throw new Error('useSelectMode must be used within a <SelectModeProvider>')
  return ctx
}
