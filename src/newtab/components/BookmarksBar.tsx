import { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react'
import { useTheme } from '@/stores/theme'
import type { BookmarksBarSize } from '@/constants/preferences'
import type { Browser } from 'wxt/browser'
import { ChevronRight, Folder, ChevronsRight } from 'lucide-react'
import { DndProvider, useBookmarkDnd } from './BookmarkDndContext'
import { FaviconImage } from '@/components/FaviconImage'
import { getFaviconUrl } from '@/utils/favicon'

const MAX_DEPTH = 5
const DEBOUNCE_MS = 100

const SIZE_CLASSES = {
  compact: {
    icon: 'w-3 h-3',
    text: 'text-xs',
    py: 'py-1',
    gap: 'gap-1',
    gapPx: 4,
    iconWidthPx: 12
  },
  normal: {
    icon: 'w-3.5 h-3.5',
    text: 'text-xs',
    py: 'py-1.5',
    gap: 'gap-1.5',
    gapPx: 6,
    iconWidthPx: 14
  },
  large: { icon: 'w-4 h-4', text: 'text-sm', py: 'py-2', gap: 'gap-2', gapPx: 8, iconWidthPx: 16 }
}

const SIZE_HEIGHT = {
  compact: 24,
  normal: 28,
  large: 36
}

export type FlatNode =
  | { id: string; title: string; type: 'bookmark'; url: string }
  | { id: string; title: string; type: 'folder'; children: FlatNode[] }

function toFlatNode(n: Browser.bookmarks.BookmarkTreeNode): FlatNode {
  if (n.url) return { id: n.id, title: n.title, type: 'bookmark', url: n.url }
  return {
    id: n.id,
    title: n.title,
    type: 'folder',
    children: (n.children ?? [])
      .filter((c: Browser.bookmarks.BookmarkTreeNode) => c.title || c.url)
      .map(toFlatNode)
  }
}

function FaviconForUrl({ url, title, cls }: { url: string; title: string; cls: { icon: string } }) {
  return (
    <FaviconImage
      src={getFaviconUrl(url)}
      fallback={title}
      imgCls={cls.icon}
      fallbackCls={`${cls.icon} rounded-full text-[8px]`}
    />
  )
}

function BookmarkItem({
  title,
  url,
  size,
  variant
}: {
  title: string
  url: string
  size: BookmarksBarSize
  variant: 'inline' | 'dropdown'
}) {
  const cls = SIZE_CLASSES[size]
  const { preferences } = useTheme()
  return (
    <a
      href={url}
      onClick={(e) => {
        e.preventDefault()
        if (preferences.bookmarkOpenMode === 'current-tab') {
          browser.tabs.update({ url }).catch((err) => console.error('[BookmarksBar]', err))
        } else {
          browser.tabs.create({ url }).catch((err) => console.error('[BookmarksBar]', err))
        }
      }}
      draggable={false}
      className={
        variant === 'inline'
          ? `flex items-center ${cls.gap} ${cls.py} hover:bg-muted/60 text-muted-foreground hover:text-foreground max-w-45 shrink-0 cursor-pointer px-1.5 no-underline transition-colors duration-150`
          : `hover:bg-muted/60 text-muted-foreground hover:text-foreground relative flex cursor-pointer items-center gap-2 px-2 py-1.5 no-underline transition-colors duration-150`
      }
    >
      <FaviconForUrl url={url} title={title} cls={cls} />
      <span className={`truncate ${cls.text}`}>{title}</span>
    </a>
  )
}

function FolderMenu({
  node,
  size,
  depth,
  direction = 'right',
  onOverTrigger
}: {
  node: FlatNode
  size: BookmarksBarSize
  depth: number
  direction?: 'left' | 'right'
  onOverTrigger?: () => void
}) {
  const cls = SIZE_CLASSES[size]
  const triggerRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const directionRef = useRef(direction)
  const {
    state: { draggedId, sourceParentId },
    startDrag: ctxStartDrag,
    clearDrag: ctxClearDrag
  } = useBookmarkDnd()
  const [dropdown, setDropdown] = useState<{ top: number; left: number; maxHeight: number } | null>(
    null
  )

  // ── 文件夹拖拽状态 ──
  const [folderDropIndex, setFolderDropIndex] = useState<number | null>(null)
  const [dragOverFolder, setDragOverFolder] = useState(false)
  const dragOverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const itemHeightsRef = useRef<Map<string, number>>(new Map())
  // ponytail: narrow type locally so useCallback deps pass typecheck
  const folderChildren: FlatNode[] = node.type === 'folder' ? node.children : []

  const clearFolderDrag = useCallback(() => {
    setFolderDropIndex(null)
    setDragOverFolder(false)
    if (dragOverTimerRef.current) {
      clearTimeout(dragOverTimerRef.current)
      dragOverTimerRef.current = null
    }
    ctxClearDrag()
  }, [ctxClearDrag])

  // ── 按 mouse Y 与子项中点计算插入位置 ──
  const computeFolderDropIndex = useCallback(
    (clientY: number): number | null => {
      const el = innerRef.current
      if (!el || folderChildren.length === 0) return null
      const elRect = el.getBoundingClientRect()
      let acc = 0
      for (let i = 0; i < folderChildren.length; i++) {
        const h = itemHeightsRef.current.get(folderChildren[i].id)
        if (h == null) break
        const half = elRect.top + acc + h / 2
        if (clientY < half) return i
        acc += h
      }
      return folderChildren.length
    },
    [folderChildren]
  )

  // ── 文件夹拖拽事件处理 ──
  const handleItemDragStart = useCallback(
    (id: string) => (e: React.DragEvent) => {
      e.stopPropagation()
      ctxStartDrag(id, node.id)(e)
    },
    [ctxStartDrag, node.id]
  )

  const handleFolderDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!draggedId || draggedId === node.id) return
      e.stopPropagation()
      e.dataTransfer.dropEffect = 'move'
      // cancel drag-leave close timer (user moved from button into dropdown)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      setFolderDropIndex(computeFolderDropIndex(e.clientY))
    },
    [draggedId, computeFolderDropIndex]
  )

  const handleFolderDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const id = draggedId
      const idx = folderDropIndex
      clearFolderDrag()
      if (!id || idx === null || id === node.id) return
      if (sourceParentId === node.id) {
        // same-folder reorder
        const curIdx = folderChildren.findIndex((c: FlatNode) => c.id === id)
        if (curIdx === -1 || curIdx === idx) return
        // ponytail: root tree reload will remount folders, no need to close manually
        browser.bookmarks
          .move(id, { index: idx })
          .catch((err) => console.error('[BookmarksBar] folder move', err))
      } else {
        // cross-folder: move into this folder
        browser.bookmarks
          .move(id, { parentId: node.id, index: idx })
          .catch((err) => console.error('[BookmarksBar] cross-folder move', err))
      }
    },
    [draggedId, sourceParentId, folderDropIndex, node.id, folderChildren, clearFolderDrag]
  )

  const handleFolderDragLeave = useCallback(() => {
    setFolderDropIndex(null)
  }, [])

  // ── 水平指示器位置（基于累加子项高度 + 容器 padding） ──
  const folderIndicatorTop = useCallback((): number | null => {
    if (folderDropIndex === null || draggedId === null) return null
    let acc = 0
    for (let i = 0; i < folderDropIndex && i < folderChildren.length; i++) {
      const h = itemHeightsRef.current.get(folderChildren[i].id)
      if (h == null) return null
      acc += h
    }
    // ponytail: hardcoded 6px = p-1.5 top padding
    return acc + 6
  }, [folderDropIndex, draggedId, folderChildren])

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      const el = triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const viewWidth = document.documentElement.clientWidth
      const viewHeight = document.documentElement.clientHeight

      const top = depth === 0 ? rect.bottom + 2 : rect.top
      const maxHeight = depth === 0 ? viewHeight - rect.bottom - 8 : viewHeight - rect.top - 8
      let left = 0
      if (depth === 0) {
        left = rect.left
        if (left + 64 * 4 > viewWidth) {
          left = rect.right - 64 * 4
          directionRef.current = 'left'
        }
      } else {
        if (directionRef.current === 'right') {
          left = rect.right + 4
          if (left + 64 * 4 > viewWidth) {
            left = rect.left - 64 * 4 - 4
            directionRef.current = 'left'
          }
        } else {
          left = rect.left - 64 * 4 - 4
          if (left < 0) {
            left = rect.right + 4
            directionRef.current = 'right'
          }
        }
      }
      setDropdown({ top, left, maxHeight })
    }, 200)
  }

  const handleMouseLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => setDropdown(null), 200)
  }

  // ponytail: close folder dropdown when drag ends (drop outside)
  const prevDraggedId = useRef(draggedId)
  useEffect(() => {
    if (prevDraggedId.current && !draggedId) {
      setDropdown(null)
      setFolderDropIndex(null)
      setDragOverFolder(false)
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      if (dragOverTimerRef.current) {
        clearTimeout(dragOverTimerRef.current)
        dragOverTimerRef.current = null
      }
    }
    prevDraggedId.current = draggedId
  }, [draggedId])

  // ponytail: close dropdown when dragging the folder itself (self-move guard)
  useEffect(() => {
    if (draggedId !== node.id) return
    setDropdown(null)
    setFolderDropIndex(null)
    setDragOverFolder(false)
  }, [draggedId, node.id])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      if (dragOverTimerRef.current) clearTimeout(dragOverTimerRef.current)
    }
  }, [])

  // ── 文件夹触发按钮拖拽处理（根层文件夹接收根层书签） ──
  const handleTriggerDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!draggedId || draggedId === node.id) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverFolder(true)
      // ponytail: right half enters folder mode, left half lets event bubble for root indicator
      const btnRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      if (e.clientX >= btnRect.left + btnRect.width / 2) {
        e.stopPropagation()
        onOverTrigger?.()
        if (!dropdown && !dragOverTimerRef.current) {
          dragOverTimerRef.current = setTimeout(() => {
            dragOverTimerRef.current = null
            handleMouseEnter()
          }, 300)
        }
      }
    },
    [draggedId, dropdown, onOverTrigger, node.id]
  )

  const handleTriggerDragLeave = useCallback(() => {
    setDragOverFolder(false)
    if (dragOverTimerRef.current) {
      clearTimeout(dragOverTimerRef.current)
      dragOverTimerRef.current = null
    }
    // close dropdown after 200ms unless cursor enters dropdown (handleFolderDragOver cancels)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => setDropdown(null), 200)
  }, [])

  const handleTriggerDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const id = draggedId
      handleTriggerDragLeave()
      if (!id || id === node.id) return

      // ponytail: left half drops to root bar, right half drops into folder
      const btnRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      if (e.clientX >= btnRect.left + btnRect.width / 2) {
        e.stopPropagation()
        browser.bookmarks
          .move(id, { parentId: node.id, index: folderChildren.length })
          .catch((err) => console.error('[BookmarksBar] folder trigger drop', err))
      }
    },
    [draggedId, node.id, folderChildren.length, handleTriggerDragLeave]
  )

  if (node.type !== 'folder') return null
  if (node.children.length === 0) return null

  const indicatorTop = folderIndicatorTop()

  // ── 子菜单 ──
  const dropdownEl = dropdown && draggedId !== node.id && (
    <div
      className="border-border scrollbar-hide z-60 max-w-64 min-w-44 overflow-y-auto overscroll-none rounded-xl border shadow-lg"
      style={{
        position: 'fixed',
        ...dropdown
      }}
    >
      {/* ── 文件夹内部拖拽放置区 ── */}
      <div
        ref={innerRef}
        className="blur-bg relative p-1.5"
        onDragOver={handleFolderDragOver}
        onDragLeave={handleFolderDragLeave}
        onDrop={handleFolderDrop}
      >
        {node.children.map((child) => (
          /* ── 可拖拽子项 ── */
          <div
            key={child.id}
            draggable
            className={`${draggedId === child.id ? 'opacity-40' : ''} py-1`}
            onDragStart={handleItemDragStart(child.id)}
            onDragEnd={clearFolderDrag}
            ref={(el) => {
              if (el && !itemHeightsRef.current.has(child.id)) {
                const h = el.getBoundingClientRect().height
                if (h > 0) itemHeightsRef.current.set(child.id, h)
              }
            }}
          >
            {child.type === 'bookmark' ? (
              <BookmarkItem title={child.title} url={child.url} size={size} variant="dropdown" />
            ) : depth < MAX_DEPTH ? (
              <FolderMenu
                node={child}
                size={size}
                depth={depth + 1}
                direction={directionRef.current}
                onOverTrigger={() => setFolderDropIndex(null)}
              />
            ) : (
              <div className="text-muted-foreground flex items-center gap-2 px-2 py-1.5">
                <Folder className={`shrink-0 ${cls.icon}`} />
                <span className={`flex-1 truncate ${cls.text}`}>{child.title}</span>
              </div>
            )}
          </div>
        ))}
        {/* ── 水平放置指示线 ── */}
        {indicatorTop !== null && (
          <div
            className="pointer-events-none absolute left-0 right-0 z-10 h-0.5 rounded-full bg-primary transition-none"
            style={{ top: `${indicatorTop}px` }}
          />
        )}
      </div>
    </div>
  )

  const isRoot = depth === 0

  return (
    <div
      ref={triggerRef}
      className={isRoot ? 'relative shrink-0' : 'relative'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── 下拉按钮 ── */}
      <button
        className={
          isRoot
            ? `flex items-center ${cls.gap} ${cls.py} ${dragOverFolder ? 'bg-muted/60' : 'hover:bg-muted/60'} text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent px-1.5 transition-colors duration-150`
            : `hover:bg-muted/60 text-muted-foreground hover:text-foreground flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-2 py-1.5 text-left transition-colors duration-150`
        }
        onDragOver={handleTriggerDragOver}
        onDragLeave={handleTriggerDragLeave}
        onDrop={handleTriggerDrop}
      >
        <Folder className={`shrink-0 ${cls.icon}`} />
        <span className={`${isRoot ? 'max-w-30' : 'flex-1'} truncate ${cls.text}`}>
          {node.title}
        </span>
        <ChevronRight
          className={
            isRoot
              ? `shrink-0 transition-transform duration-150 ${dropdown ? 'rotate-90' : ''} ${cls.icon}`
              : 'h-3 w-3 shrink-0'
          }
        />
      </button>
      {dropdownEl}
    </div>
  )
}

function OverflowMenu({
  items,
  size,
  visibleOffset,
  bookmarksBarId,
  onDragEnter
}: {
  items: FlatNode[]
  size: BookmarksBarSize
  visibleOffset: number
  bookmarksBarId: string | null
  onDragEnter?: () => void
}) {
  const cls = SIZE_CLASSES[size]
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dragOverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const {
    state: { draggedId, sourceParentId },
    startDrag: ctxStartDrag,
    clearDrag: ctxClearDrag
  } = useBookmarkDnd()

  // ── 溢出菜单拖拽状态 ──
  const [overflowDropIndex, setOverflowDropIndex] = useState<number | null>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const itemHeightsRef = useRef<Map<string, number>>(new Map())

  const clearOverflowDrag = useCallback(() => {
    setOverflowDropIndex(null)
  }, [])

  const computeOverflowDropIndex = useCallback(
    (clientY: number): number | null => {
      const el = innerRef.current
      if (!el || items.length === 0) return null
      const elRect = el.getBoundingClientRect()
      let acc = 0
      for (let i = 0; i < items.length; i++) {
        const h = itemHeightsRef.current.get(items[i].id)
        if (h == null) break
        const half = elRect.top + acc + h / 2
        if (clientY < half) return i
        acc += h
      }
      return items.length
    },
    [items]
  )

  // ── 溢出菜单拖拽事件 ──
  const handleOverflowDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!draggedId) return

      e.stopPropagation()
      e.dataTransfer.dropEffect = 'move'
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      setOverflowDropIndex(computeOverflowDropIndex(e.clientY))
      onDragEnter?.()
    },
    [draggedId, computeOverflowDropIndex, onDragEnter]
  )

  const handleOverflowDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const id = draggedId
      const srcParent = sourceParentId
      const idx = overflowDropIndex
      clearOverflowDrag()
      ctxClearDrag()
      if (!id || idx === null) return
      // ponytail: visibleOffset converts overflow-local index to global index
      if (srcParent === bookmarksBarId) {
        browser.bookmarks
          .move(id, { index: visibleOffset + idx })
          .catch((err) => console.error('[BookmarksBar] overflow move', err))
      } else if (bookmarksBarId) {
        browser.bookmarks
          .move(id, { parentId: bookmarksBarId, index: visibleOffset + idx })
          .catch((err) => console.error('[BookmarksBar] overflow cross-folder move', err))
      }
    },
    [
      draggedId,
      sourceParentId,
      overflowDropIndex,
      visibleOffset,
      bookmarksBarId,
      clearOverflowDrag,
      ctxClearDrag
    ]
  )

  // ── 溢出按钮区域拖拽展开 ──
  const handleOverflowTriggerDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!draggedId) return
      e.dataTransfer.dropEffect = 'move'
      if (!open && !dragOverTimerRef.current) {
        dragOverTimerRef.current = setTimeout(() => {
          dragOverTimerRef.current = null
          setOpen(true)
        }, 300)
      }
    },
    [draggedId, open]
  )

  const handleOverflowTriggerDragLeave = useCallback(() => {
    if (dragOverTimerRef.current) {
      clearTimeout(dragOverTimerRef.current)
      dragOverTimerRef.current = null
    }
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => setOpen(false), 200)
  }, [])

  const overflowIndicatorTop = useCallback((): number | null => {
    if (overflowDropIndex === null) return null
    let acc = 0
    for (let i = 0; i < overflowDropIndex && i < items.length; i++) {
      const h = itemHeightsRef.current.get(items[i].id)
      if (h == null) return null
      acc += h
    }
    // ponytail: hardcoded 6px = p-1.5 top padding
    return acc + 6
  }, [overflowDropIndex, items])

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => setOpen(false), 200)
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      if (dragOverTimerRef.current) clearTimeout(dragOverTimerRef.current)
    }
  }, [])

  // ponytail: close overflow menu when drag ends outside
  const prevDraggedId = useRef(draggedId)
  useEffect(() => {
    if (prevDraggedId.current && !draggedId) {
      setOpen(false)
      setOverflowDropIndex(null)
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      if (dragOverTimerRef.current) {
        clearTimeout(dragOverTimerRef.current)
        dragOverTimerRef.current = null
      }
    }
    prevDraggedId.current = draggedId
  }, [draggedId])

  if (items.length === 0) return null

  const indicatorTop = overflowIndicatorTop()

  // ── 溢出下拉菜单 ──
  const dropdown = open && (
    <div
      className="border-border scrollbar-hide absolute top-full right-0 z-50 mt-0.5 max-w-64 min-w-44 overflow-y-auto overscroll-y-none rounded-xl border p-1.5 shadow-lg blur-bg"
      style={{ maxHeight: `calc(100vh - ${SIZE_HEIGHT[size]}px)` }}
    >
      {/* ── 溢出菜单拖拽放置区 ── */}
      <div
        ref={innerRef}
        className="relative blur-bg"
        onDragOver={handleOverflowDragOver}
        onDrop={handleOverflowDrop}
      >
        {items.map((child) => (
          /* ── 可拖拽溢出子项 ── */
          <div
            key={child.id}
            draggable
            className={`${draggedId === child.id ? 'opacity-40' : ''} py-1`}
            onDragStart={ctxStartDrag(child.id, bookmarksBarId)}
            onDragEnd={() => {
              clearOverflowDrag()
              ctxClearDrag()
            }}
            ref={(el) => {
              if (el && !itemHeightsRef.current.has(child.id)) {
                const h = el.getBoundingClientRect().height
                if (h > 0) itemHeightsRef.current.set(child.id, h)
              }
            }}
          >
            {child.type === 'bookmark' ? (
              <BookmarkItem title={child.title} url={child.url} size={size} variant="dropdown" />
            ) : (
              <FolderMenu
                node={child}
                size={size}
                depth={1}
                onOverTrigger={() => setOverflowDropIndex(null)}
              />
            )}
          </div>
        ))}
        {/* ── 水平放置指示线 ── */}
        {indicatorTop !== null && (
          <div
            className="pointer-events-none absolute left-0 right-0 z-10 h-0.5 rounded-full bg-primary transition-none"
            style={{ top: `${indicatorTop}px` }}
          />
        )}
      </div>
    </div>
  )

  return (
    <div
      className="relative ml-auto shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragOver={handleOverflowTriggerDragOver}
      onDragLeave={handleOverflowTriggerDragLeave}
    >
      {/* ── 溢出按钮 ── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center justify-center ${cls.py} hover:bg-muted/60 text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent px-1 transition-colors duration-150`}
      >
        <ChevronsRight className={cls.icon} />
      </button>
      {dropdown}
    </div>
  )
}

export function BookmarksBar() {
  return (
    <DndProvider>
      <BookmarksBarContent />
    </DndProvider>
  )
}

function BookmarksBarContent() {
  const { preferences } = useTheme()
  const [items, setItems] = useState<FlatNode[]>([])
  const enabled = preferences.bookmarksBarEnabled
  const size = preferences.bookmarksBarSize
  const cls = SIZE_CLASSES[size]

  const containerRef = useRef<HTMLDivElement>(null)
  const widthsRef = useRef<Map<string, number>>(new Map())
  const [visibleCount, setVisibleCount] = useState(Number.MAX_SAFE_INTEGER)

  // ── 根层拖拽状态 ──
  const {
    state: { draggedId, sourceParentId },
    startDrag: ctxStartDrag,
    clearDrag: ctxClearDrag
  } = useBookmarkDnd()
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [bookmarksBarId, setBookmarksBarId] = useState<string | null>(null)

  const clearDrag = useCallback(() => {
    setDropIndex(null)
    ctxClearDrag()
  }, [ctxClearDrag])

  // ── 根层拖拽事件处理 ──
  const computeDropIndex = useCallback(
    (clientX: number) => {
      const nav = containerRef.current
      if (!nav || items.length === 0) return null
      const navRect = nav.getBoundingClientRect()
      const localX = clientX - navRect.left
      let acc = 0
      for (let i = 0; i < Math.min(visibleCount, items.length); i++) {
        const w = widthsRef.current.get(items[i].id)
        if (w == null) return i
        const gap = i > 0 ? cls.gapPx : 0
        const half = acc + gap + w / 2
        if (localX < half) return i
        acc += gap + w
      }
      return visibleCount
    },
    [items, visibleCount, cls.gapPx]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDropIndex(computeDropIndex(e.clientX))
    },
    [computeDropIndex]
  )

  const handleRootDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropIndex(null)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const id = draggedId
      const srcParent = sourceParentId
      const idx = dropIndex
      clearDrag()
      if (!id || idx === null) return
      if (srcParent === bookmarksBarId) {
        // same-folder reorder (root bar)
        const curIdx = items.findIndex((i) => i.id === id)
        if (curIdx === -1 || curIdx === idx) return
        browser.bookmarks
          .move(id, { index: idx })
          .catch((err) => console.error('[BookmarksBar] move', err))
      } else if (bookmarksBarId) {
        // cross-folder: move to root bar
        browser.bookmarks
          .move(id, { parentId: bookmarksBarId, index: idx })
          .catch((err) => console.error('[BookmarksBar] cross-folder move', err))
      }
    },
    [draggedId, sourceParentId, dropIndex, items, bookmarksBarId, clearDrag]
  )

  // ── 竖线指示器 ──
  const dropIndicatorLeft = useCallback((): number | null => {
    if (dropIndex === null || draggedId === null) return null
    let acc = 0
    const limit = Math.min(dropIndex, visibleCount)
    for (let i = 0; i < limit && i < items.length; i++) {
      const w = widthsRef.current.get(items[i].id)
      if (w == null) return null
      if (i > 0) acc += cls.gapPx
      acc += w
    }
    return acc
  }, [dropIndex, draggedId, items, cls.gapPx, visibleCount])

  useEffect(() => {
    if (!draggedId) return
    const onEnd = () => clearDrag()
    document.addEventListener('dragend', onEnd)
    return () => document.removeEventListener('dragend', onEnd)
  }, [draggedId, clearDrag])

  useEffect(() => {
    if (!enabled) return
    if (!browser.bookmarks) return
    let cancelled = false
    let loadVersion = 0
    let debounceTimer: ReturnType<typeof setTimeout> | undefined

    async function load() {
      const version = ++loadVersion
      try {
        const tree = await browser.bookmarks.getTree()
        const bookmarksBar = tree[0]?.children?.[0]
        if (bookmarksBar) setBookmarksBarId(bookmarksBar.id)
        const nodes = (bookmarksBar?.children ?? [])
          .filter((c: Browser.bookmarks.BookmarkTreeNode) => c.title || c.url)
          .map(toFlatNode)
        if (version === loadVersion && !cancelled) {
          setItems(nodes)
          setVisibleCount(Number.MAX_SAFE_INTEGER)
        }
      } catch (err) {
        console.error('[BookmarksBar]', err)
      }
    }

    load()

    const handleChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(load, DEBOUNCE_MS)
    }

    browser.bookmarks.onCreated.addListener(handleChange)
    browser.bookmarks.onRemoved.addListener(handleChange)
    browser.bookmarks.onChanged.addListener(handleChange)
    browser.bookmarks.onMoved.addListener(handleChange)

    return () => {
      cancelled = true
      if (debounceTimer) clearTimeout(debounceTimer)
      browser.bookmarks.onCreated.removeListener(handleChange)
      browser.bookmarks.onRemoved.removeListener(handleChange)
      browser.bookmarks.onChanged.removeListener(handleChange)
      browser.bookmarks.onMoved.removeListener(handleChange)
    }
  }, [enabled])

  const recalc = () => {
    const nav = containerRef.current
    if (!nav || items.length === 0) return

    const navWidth = nav.clientWidth
    const gapPx = cls.gapPx
    let used = 0
    let count = 0

    for (const item of items) {
      const w = widthsRef.current.get(item.id)
      if (w == null) break
      const gap = count > 0 ? gapPx : 0
      if (used + gap + w > navWidth - (cls.iconWidthPx + 8)) break
      used += gap + w
      count++
    }

    const finalCount = count < items.length ? Math.max(1, count) : items.length
    setVisibleCount(finalCount)
  }

  useLayoutEffect(() => {
    if (!enabled || items.length === 0) return
    recalc()
    const ro = new ResizeObserver(() => recalc())
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [enabled, items.length, items, cls.gapPx])

  if (!enabled) return null

  const rootIndicatorLeft = dropIndicatorLeft()

  return (
    <>
      {items.length > 0 && (
        /* ── 书签栏容器 ── */
        <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300 blur-bg fixed top-0 z-10 w-full shadow-sm max-[960px]:hidden px-4">
          {/* ── 书签导航 ── */}
          {/* ── 根层拖拽放置区 ── */}
          <nav
            ref={containerRef}
            className={`flex items-center ${cls.gap} relative`}
            role="navigation"
            aria-label="Bookmarks bar"
            onDragOver={handleDragOver}
            onDragLeave={handleRootDragLeave}
            onDrop={handleDrop}
          >
            {/* ── 可拖拽书签项 ── */}
            {items.map((node, i) => (
              <div
                key={node.id}
                draggable={i < visibleCount}
                className={`shrink-0 ${draggedId === node.id ? 'opacity-40' : ''}`}
                style={
                  i >= visibleCount
                    ? { position: 'absolute', visibility: 'hidden', pointerEvents: 'none' as const }
                    : undefined
                }
                onDragStart={i < visibleCount ? ctxStartDrag(node.id, bookmarksBarId) : undefined}
                onDragEnd={i < visibleCount ? clearDrag : undefined}
                ref={(el) => {
                  if (el) {
                    const w = el.getBoundingClientRect().width
                    if (w > 0) widthsRef.current.set(node.id, w)
                  }
                }}
              >
                {node.type === 'folder' ? (
                  <FolderMenu
                    node={node}
                    size={size}
                    depth={0}
                    onOverTrigger={() => setDropIndex(null)}
                  />
                ) : (
                  <BookmarkItem title={node.title} url={node.url} size={size} variant="inline" />
                )}
              </div>
            ))}
            {/* ── 竖线指示器 ── */}
            {rootIndicatorLeft !== null && (
              <div
                className="pointer-events-none absolute top-0 z-10 w-0.5 rounded-full bg-primary transition-none"
                style={{ left: `${rootIndicatorLeft}px`, bottom: 0 }}
              />
            )}
            {/* ── 溢出菜单 ── */}
            {visibleCount < items.length && (
              <OverflowMenu
                items={items.slice(visibleCount)}
                size={size}
                visibleOffset={visibleCount}
                bookmarksBarId={bookmarksBarId}
                onDragEnter={() => setDropIndex(null)}
              />
            )}
          </nav>
        </div>
      )}
      {/* ── 占位间距 ── */}
      <div
        className="shrink-0 max-[960px]:hidden"
        style={{ height: SIZE_HEIGHT[size] + 'px' }}
      ></div>
    </>
  )
}
