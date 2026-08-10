import { useEffect, useState, useRef, useLayoutEffect, type ReactNode } from 'react'
import { useTheme } from '@/stores/theme'
import type { Browser } from 'wxt/browser'
import { ChevronRight, Folder, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FaviconImage } from '@/components/FaviconImage'
import { getFaviconUrl } from '@/utils/favicon'
import { BookmarkItemContextMenu } from './BookmarksBarContextMenu'
import { useBrowsing, BrowsingContext, type BrowsedItemInfo, type FlatNode } from './use-browsing'

const OPEN_DELAY = 200

const SIZE_CLASSES = {
  compact: {
    icon: 'w-3 h-3',
    text: 'text-xs',
    py: 'py-1',
    px: 'px-2',
    padPx: 8,
    iconWidthPx: 12
  },
  normal: {
    icon: 'w-3.5 h-3.5',
    text: 'text-xs',
    py: 'py-1.5',
    px: 'px-2',
    padPx: 8,
    iconWidthPx: 14
  },
  large: { icon: 'w-4 h-4', text: 'text-sm', py: 'py-2', px: 'px-2.5', padPx: 10, iconWidthPx: 16 }
}

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

function BookmarkItem({
  node,
  depth = 0,
  direction = 'right',
  parentOpenChildId,
  onChildOpen,
  children,
  parentId,
  index,
  startIndex
}: {
  node: FlatNode
  depth?: number
  direction?: 'left' | 'right'
  parentOpenChildId?: string | null
  onChildOpen?: (childId: string) => void
  children?: ReactNode
  parentId?: string | null
  index?: number
  startIndex?: number
}) {
  const { preferences } = useTheme()
  const size = preferences.bookmarksBarSize
  const cls = SIZE_CLASSES[size]
  const { browsing, exitBrowsing, setDraggedItem, draggedItem } = useBrowsing()
  const itemRef = useRef<HTMLDivElement>(null)
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null)

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation()
    if (parentId == null || index == null) return
    setDraggedItem({ id: node.id, parentId, index })
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!draggedItem || draggedItem.id === node.id) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    // 如果光标在有 data-dragover 的子元素上，不处理自己
    const target = e.target as Element | null
    if (target?.closest('[data-dragover]') !== e.currentTarget) {
      setDropPosition(null)
      return
    }

    const el = itemRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const isVertical = depth > 0
    const pct = isVertical ? e.clientY - rect.top : e.clientX - rect.left
    const size = isVertical ? rect.height : rect.width

    let pos: typeof dropPosition = null
    if (node.type === 'folder') {
      if (pct < size * 0.1) {
        pos = 'before'
      } else if (pct > size * 0.9) {
        pos = 'after'
      } else {
        pos = 'inside'
      }
    } else {
      pos = pct < size / 2 ? 'before' : 'after'
    }

    // 通知父级当前悬停的元素，兄弟 effect 据此关闭同级兄弟
    onChildOpen?.(node.id)

    // 相邻排除：指向被拖拽元素原始位置的边不显示指示器
    if (pos && draggedItem.parentId === parentId && index != null) {
      if (
        (pos === 'after' && draggedItem.index === index + 1) ||
        (pos === 'before' && draggedItem.index === index - 1)
      ) {
        setDropPosition(null)
        return
      }
    }
    setDropPosition(pos)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setDropPosition(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!draggedItem || !dropPosition) return
    e.preventDefault()
    e.stopPropagation()

    let destParentId: string
    let destIndex: number | undefined

    if (dropPosition === 'inside' && node.type === 'folder') {
      destParentId = node.id
      destIndex = 0
    } else if (parentId && index != null) {
      destParentId = parentId
      destIndex = dropPosition === 'before' ? index : index + 1
    } else {
      return
    }

    browser.bookmarks
      .move(draggedItem.id, { parentId: destParentId, index: destIndex })
      .catch(() => {})

    handleDragEnd()
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDropPosition(null)
    exitBrowsing()
  }

  return (
    <BookmarkItemContextMenu node={node}>
      <div
        ref={itemRef}
        data-dragover
        draggable={parentId != null && index != null && (!browsing || depth > 0)}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative',
          dropPosition === 'before' &&
            (depth > 0
              ? `before:absolute before:-top-px before:inset-x-0 before:h-0.5 before:bg-muted-foreground before:rounded-full before:content-['']`
              : `before:absolute before:-left-px before:inset-y-0 before:w-0.5 before:bg-muted-foreground before:rounded-full before:content-['']`),
          dropPosition === 'after' &&
            (depth > 0
              ? `before:absolute before:-bottom-px before:inset-x-0 before:h-0.5 before:bg-muted-foreground before:rounded-full before:content-['']`
              : `before:absolute before:-right-px before:inset-y-0 before:w-0.5 before:bg-muted-foreground before:rounded-full before:content-['']`),
          dropPosition === 'inside' && 'bg-muted/60'
        )}
      >
        {node.type === 'bookmark' ? (
          <a
            href={node.url}
            target={preferences.bookmarkOpenMode === 'current-tab' ? undefined : '_blank'}
            onClick={() => exitBrowsing()}
            draggable={false}
            className={cn(
              'text-muted-foreground cursor-pointer no-underline',
              draggedItem?.id !== node.id &&
                'hover:bg-muted/60 hover:text-foreground transition-colors duration-150',
              depth === 0
                ? `flex items-center gap-1.5 ${cls.py} ${cls.px} max-w-45 shrink-0`
                : 'relative flex items-center gap-2 px-2 py-1.5'
            )}
          >
            <div className="pointer-events-none shrink-0">
              <FaviconImage
                src={getFaviconUrl(node.url)}
                fallback={node.title}
                imgCls={cls.icon}
                fallbackCls={cn(cls.icon, 'rounded-full text-[8px]')}
              />
            </div>
            <span className={cn('truncate', cls.text)}>{node.title}</span>
          </a>
        ) : (
          <FolderMenu
            node={node}
            depth={depth}
            direction={direction}
            parentOpenChildId={parentOpenChildId}
            onChildOpen={onChildOpen}
            startIndex={startIndex}
          >
            {children ?? (
              <>
                <Folder className={cn('shrink-0', cls.icon)} />
                <span className={cn('flex-1 truncate', depth === 0 && `max-w-30 ${cls.text}`)}>
                  {node.title}
                </span>
                {depth > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
              </>
            )}
          </FolderMenu>
        )}
      </div>
    </BookmarkItemContextMenu>
  )
}

function FolderMenu({
  node,
  depth,
  direction = 'right',
  children,
  parentOpenChildId,
  onChildOpen,
  startIndex = 0
}: {
  node: FlatNode & { children: FlatNode[] }
  depth: number
  direction?: 'left' | 'right'
  children: ReactNode
  /** 父级当前展开的子文件夹 id，用于兄弟间自动收起 */
  parentOpenChildId?: string | null
  /** 通知父级：本文件夹展开了子文件夹 */
  onChildOpen?: (childId: string) => void
  startIndex?: number
}) {
  const { preferences } = useTheme()
  const size = preferences.bookmarksBarSize
  const cls = SIZE_CLASSES[size]
  const folderChildren = node.children
  const triggerRef = useRef<HTMLDivElement>(null)
  const [curDirection, setCurDirection] = useState(direction)
  const [dropdown, setDropdown] = useState<{ top: number; left: number; maxHeight: number } | null>(
    null
  )
  const [openChildId, setOpenChildId] = useState<string | null>(null)

  const isRoot = depth === 0

  const openDropdown = () => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const viewWidth = document.documentElement.clientWidth
    const viewHeight = document.documentElement.clientHeight

    const top = isRoot ? rect.bottom + 2 : rect.top - 10
    const maxHeight = isRoot ? viewHeight - rect.bottom - 8 : viewHeight - rect.top - 8
    let left = 0
    if (isRoot) {
      left = rect.left
      if (left + 64 * 4 > viewWidth) {
        left = rect.right - 64 * 4
        setCurDirection('left')
      }
    } else {
      if (curDirection === 'right') {
        left = rect.right + 4
        if (left + 64 * 4 > viewWidth) {
          left = rect.left - 64 * 4 - 4
          setCurDirection('left')
        }
      } else {
        left = rect.left - 64 * 4 - 4
        if (left < 0) {
          left = rect.right + 4
          setCurDirection('right')
        }
      }
    }
    setDropdown({ top, left, maxHeight })
  }

  const openedByDrag = useRef(false)

  const { browsing, enterBrowsing, exitBrowsing, draggedItem } = useBrowsing()
  const closeDropdownImmediately = () => {
    // 手动打开的文件夹拖拽期间不关
    if (draggedItem && !openedByDrag.current) return
    setDropdown(null)
    setOpenChildId(null)
    openedByDrag.current = false
  }

  const openDropdownRef = useRef(openDropdown)
  const closeDropdownImmediatelyRef = useRef(closeDropdownImmediately)
  useEffect(() => {
    openDropdownRef.current = openDropdown
    closeDropdownImmediatelyRef.current = closeDropdownImmediately
  })

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const handleButtonClick = () => {
    if (browsing) {
      exitBrowsing()
      return
    }
    openDropdown()
    enterBrowsing()
    onChildOpen?.(node.id)
  }

  const handleMouseEnter = () => {
    clearTimeout(timer.current)
    if (!browsing) return
    timer.current = setTimeout(
      () => {
        openDropdown()
        onChildOpen?.(node.id)
      },
      isRoot ? 0 : OPEN_DELAY
    )
  }

  const handleMouseLeave = () => {
    clearTimeout(timer.current)
    if (browsing) return
    timer.current = setTimeout(
      () => {
        closeDropdownImmediately()
      },
      isRoot ? 0 : OPEN_DELAY
    )
  }

  // ── 父级展开的兄弟变化时关闭/展开自己 ──
  useEffect(() => {
    // ── 关闭：父级说别的兄弟是活跃的 ──
    if (parentOpenChildId !== undefined && parentOpenChildId !== node.id && dropdown) {
      const isChild =
        node.type === 'folder' && node.children?.some((c) => c.id === parentOpenChildId)
      if (isChild) return
      closeDropdownImmediatelyRef.current()
      clearTimeout(timer.current)
    }
    // ── 展开：父级说我是活跃的 + 面板未开 + 浏览模式 ──
    if (parentOpenChildId === node.id && !dropdown && (browsing || !!draggedItem)) {
      if (isRoot) {
        openDropdownRef.current()
        openedByDrag.current = true
      } else {
        const timer = setTimeout(() => {
          if (parentOpenChildId !== node.id) return
          openDropdownRef.current()
          openedByDrag.current = true
        }, OPEN_DELAY)
        return () => clearTimeout(timer)
      }
    }
  }, [
    parentOpenChildId,
    node.id,
    dropdown,
    browsing,
    isRoot,
    draggedItem,
    node.children,
    node.type
  ])

  // ── 退出浏览状态时关闭所有面板（拖拽期间不触发） ──
  useEffect(() => {
    if (!browsing && dropdown && !draggedItem) {
      closeDropdownImmediatelyRef.current()
      clearTimeout(timer.current)
    }
  }, [browsing, dropdown, draggedItem])

  // ── 子菜单 ──
  return (
    <div
      ref={triggerRef}
      className={cn('relative', isRoot && 'shrink-0')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── 下拉按钮 ── */}
      <button
        className={cn(
          'group text-muted-foreground cursor-pointer border-none bg-transparent',
          draggedItem?.id !== node.id &&
            'hover:bg-muted/60 hover:text-foreground transition-colors duration-150',
          dropdown && isRoot && 'bg-muted/80 text-foreground',
          isRoot
            ? `flex items-center gap-1.5 ${cls.py} ${cls.px}`
            : 'flex w-full items-center gap-2 px-2 py-1.5 text-left'
        )}
        aria-expanded={!!dropdown}
        onClick={handleButtonClick}
      >
        {children}
      </button>
      {dropdown && (
        <div
          className="border-border scrollbar-hide fixed z-60 w-64 overflow-y-auto overscroll-none rounded-xl border shadow-lg"
          style={{ ...dropdown }}
          onDragOver={(e) => e.stopPropagation()}
        >
          <div className="p-1.5 relative before:absolute before:inset-0 before:pointer-events-none before:blur-bg before:h-full">
            {folderChildren.length === 0 ? (
              <div className="text-muted-foreground py-1 text-center text-xs relative z-1">空</div>
            ) : (
              folderChildren.map((child, i) => (
                <BookmarkItem
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  direction={curDirection}
                  parentOpenChildId={openChildId}
                  onChildOpen={setOpenChildId}
                  parentId={node.id}
                  index={startIndex + i}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function BookmarksBar() {
  const [browsing, setBrowsing] = useState(false)
  const [draggedItem, setDraggedItem] = useState<BrowsedItemInfo | null>(null)
  const [rootOpenedChildId, setRootOpenedChildId] = useState<string | null>(null)

  const enterBrowsing = () => {
    setBrowsing(true)
  }

  const exitBrowsing = () => {
    setBrowsing(false)
    setRootOpenedChildId(null)
  }

  return (
    <BrowsingContext.Provider
      value={{
        browsing,
        enterBrowsing,
        exitBrowsing,
        draggedItem,
        setDraggedItem,
        rootOpenedChildId,
        setRootOpenedChildId
      }}
    >
      <BookmarksBarContent />
    </BrowsingContext.Provider>
  )
}

function BookmarksBarContent() {
  const { preferences } = useTheme()
  const [items, setItems] = useState<FlatNode[]>([])
  const [bookmarksBarId, setBookmarksBarId] = useState<string | null>(null)
  const { browsing, exitBrowsing, draggedItem, rootOpenedChildId, setRootOpenedChildId } =
    useBrowsing()
  const enabled = preferences.bookmarksBarEnabled
  const size = preferences.bookmarksBarSize
  const cls = SIZE_CLASSES[size]

  const containerRef = useRef<HTMLDivElement>(null)
  const widthsRef = useRef<Map<string, number>>(new Map())
  const [visibleCount, setVisibleCount] = useState(Number.MAX_SAFE_INTEGER)

  useEffect(() => {
    if (!enabled) return
    if (!browser.bookmarks) return
    let cancelled = false

    async function load() {
      const tree = await browser.bookmarks.getTree()
      const bookmarksBar = tree[0]?.children?.[0]
      if (bookmarksBar) setBookmarksBarId(bookmarksBar.id)
      const nodes = (bookmarksBar?.children ?? []).filter((c) => c.title || c.url).map(toFlatNode)
      if (!cancelled) setItems(nodes)
    }

    load()
    browser.bookmarks.onCreated.addListener(load)
    browser.bookmarks.onRemoved.addListener(load)
    browser.bookmarks.onChanged.addListener(load)
    browser.bookmarks.onMoved.addListener(load)

    return () => {
      cancelled = true
      browser.bookmarks.onCreated.removeListener(load)
      browser.bookmarks.onRemoved.removeListener(load)
      browser.bookmarks.onChanged.removeListener(load)
      browser.bookmarks.onMoved.removeListener(load)
    }
  }, [enabled])

  useLayoutEffect(() => {
    if (!enabled || items.length === 0) return

    const doRecalc = () => {
      const nav = containerRef.current
      if (!nav) return
      const navWidth = nav.clientWidth
      let used = 0
      let count = 0
      for (const item of items) {
        const w = widthsRef.current.get(item.id)
        if (w == null) break
        if (used + w > navWidth - (cls.iconWidthPx + cls.padPx * 2 + 20)) break
        used += w
        count++
      }
      const finalCount = count < items.length ? Math.max(1, count) : items.length
      setVisibleCount(finalCount)
    }

    doRecalc()
    const ro = new ResizeObserver(() => doRecalc())
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [enabled, items.length, items, cls])

  if (!enabled) return null

  return (
    <>
      {items.length > 0 && (
        /* ── 书签栏容器 ── */
        <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300 fixed top-0 z-1 w-full shadow-sm max-[960px]:hidden px-4 before:absolute before:inset-0 before:pointer-events-none before:blur-bg">
          {/* ── 书签导航 ── */}
          <nav
            ref={containerRef}
            className="flex items-center relative"
            role="navigation"
            aria-label="Bookmarks bar"
          >
            {items.map((node, i) => (
              <div
                key={node.id}
                className={cn(
                  'shrink-0',
                  node.type === 'folder' && 'z-2',
                  i >= visibleCount && 'invisible pointer-events-none absolute'
                )}
                ref={(el) => {
                  if (el) {
                    const w = el.getBoundingClientRect().width
                    if (w > 0) widthsRef.current.set(node.id, w)
                  }
                }}
              >
                <BookmarkItem
                  node={node}
                  depth={0}
                  parentOpenChildId={rootOpenedChildId}
                  onChildOpen={setRootOpenedChildId}
                  parentId={bookmarksBarId}
                  index={i}
                />
              </div>
            ))}
            {/* ── 溢出菜单 ── */}
            {visibleCount < items.length && (
              <div className="z-2 mr-5 ml-auto">
                <BookmarkItem
                  node={{
                    id: bookmarksBarId || '',
                    title: '',
                    type: 'folder',
                    children: items.slice(visibleCount)
                  }}
                  depth={0}
                  parentOpenChildId={rootOpenedChildId}
                  onChildOpen={setRootOpenedChildId}
                  startIndex={visibleCount}
                >
                  <ChevronsRight className={cls.icon} />
                </BookmarkItem>
              </div>
            )}
            {/* ── 浏览状态全屏遮罩（仅手动浏览时显示，拖拽时不渲染） ── */}
            {browsing && !draggedItem && (
              <div className="fixed inset-0 z-1" onClick={() => exitBrowsing()} />
            )}
          </nav>
        </div>
      )}
      {/* ── 占位间距 ── */}
      <div
        className="shrink-0 max-[960px]:hidden"
        style={{ height: { compact: 24, normal: 28, large: 36 }[size] + 'px' }}
      ></div>
    </>
  )
}
