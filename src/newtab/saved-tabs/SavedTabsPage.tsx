import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { createSessionId, useSavedSessionsStore } from '@/stores/savedSessions'
import { SectionHeader } from '@/newtab/home/SectionHeader.tsx'
import { SavedSessionCard } from './SavedSessionCard.tsx'
import { SavedSessionEmpty } from './SavedSessionEmpty.tsx'
import { SessionSettingsDropdown } from './SessionSettingsDropdown.tsx'
import {
  BeforeCapture,
  DragDropContext,
  DragUpdate,
  Droppable,
  type DropResult
} from '@hello-pangea/dnd'

export function SavedTabsPage() {
  const { t } = useTranslation()
  const { sessions, ready, setSessions, toggleCollapse } = useSavedSessionsStore()
  const [isDraggingOutside, setIsDraggingOutside] = useState(false)

  function handleBeforeCapture(before: BeforeCapture) {
    toggleCollapse(before.draggableId, true)
  }

  function handleDragUpdate(rupdate: DragUpdate) {
    setIsDraggingOutside(rupdate.destination === null && rupdate.type === 'TAB')
  }

  function handleDragEnd(result: DropResult) {
    toggleCollapse(result.draggableId, false)
    setIsDraggingOutside(false)

    const { source, destination, type } = result

    if (!destination) {
      if (type === 'TAB') {
        setSessions((prev) => {
          const srcIdx = prev.findIndex((s) => s.id === source.droppableId)
          if (srcIdx === -1) return prev
          const src = prev[srcIdx]
          const srcTabs = [...src.tabs]
          const [movedTab] = srcTabs.splice(source.index, 1)
          if (!movedTab) return prev

          const filtered =
            srcTabs.length === 0
              ? prev.filter((s) => s.id !== source.droppableId)
              : prev.map((s) => (s.id === source.droppableId ? { ...s, tabs: srcTabs } : s))

          return [
            ...filtered,
            {
              id: createSessionId(),
              name: movedTab.title || movedTab.url,
              tabs: [movedTab],
              savedAt: new Date().toISOString(),
              source: 'manual'
            }
          ]
        })
      }
      return
    }

    if (source.index === destination.index && source.droppableId === destination.droppableId) return

    if (type === 'SESSION') {
      setSessions((prev) => {
        const arr = [...prev]
        const [removed] = arr.splice(source.index, 1)
        arr.splice(destination.index, 0, removed)
        return arr
      })
      return
    }

    setSessions((prev) => {
      const src = prev.find((s) => s.id === source.droppableId)
      const tgt = prev.find((s) => s.id === destination.droppableId)
      if (!src || !tgt) return prev

      const srcTabs = [...src.tabs]
      const [moved] = srcTabs.splice(source.index, 1)
      if (!moved) return prev

      if (source.droppableId === destination.droppableId) {
        srcTabs.splice(destination.index, 0, moved)
        return prev.map((s) => (s.id === source.droppableId ? { ...s, tabs: srcTabs } : s))
      }

      const tgtTabs = [...tgt.tabs]
      tgtTabs.splice(destination.index, 0, moved)
      return prev.map((s) => {
        if (s.id === source.droppableId) return { ...s, tabs: srcTabs }
        if (s.id === destination.droppableId) return { ...s, tabs: tgtTabs }
        return s
      })
    })
  }

  if (!ready) return null

  return (
    // ── 已保存标签页面 ──
    <div className="grid grid-cols-[1.35fr_0.95fr] gap-8">
      <div className="w-full min-w-0">
        <SectionHeader
          title={t('workspacePageSavedTabs')}
          actions={
            <div className="flex items-center gap-2.5 min-w-0">
              <SessionSettingsDropdown />
              {sessions.length > 0 && (
                <span className="text-xs font-medium tracking-[0.02em] text-primary whitespace-nowrap">
                  {sessions.length}{' '}
                  {t(sessions.length === 1 ? 'sessionWordSingular' : 'sessionWordPlural')}
                </span>
              )}
            </div>
          }
        />

        {sessions.length === 0 ? (
          <SavedSessionEmpty />
        ) : (
          <div className="flex flex-col gap-3">
            <DragDropContext
              onDragEnd={handleDragEnd}
              onBeforeCapture={handleBeforeCapture}
              onDragUpdate={handleDragUpdate}
            >
              <Droppable droppableId="saved-sessions" type="SESSION">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-col gap-3"
                  >
                    {sessions.map((session, i) => (
                      <SavedSessionCard key={session.id} session={session} index={i} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {isDraggingOutside && (
              // ── 拖拽至外部提示区域 ──
              <div className="border-2 border-dashed border-primary/30 rounded-xl py-8 text-center text-sm text-muted-foreground transition-all">
                放开以创建新会话
              </div>
            )}
          </div>
        )}
      </div>
      <div aria-hidden="true" />
    </div>
  )
}
