import { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { useTheme } from '@/stores/theme'
import type { BookmarksBarSize, BookmarkOpenMode } from '@/constants/preferences'
import type { Browser } from 'wxt/browser'
import { ChevronRight, Folder, ChevronsRight } from 'lucide-react'

const MAX_DEPTH = 5
const MAX_FAVICON_CACHE = 1000
const FAVICON_CACHE = new Map<string, string>()
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

function cacheFavicon(url: string, href: string) {
  if (FAVICON_CACHE.size >= MAX_FAVICON_CACHE) {
    const entry = FAVICON_CACHE.keys().next()
    if (!entry.done) FAVICON_CACHE.delete(entry.value)
  }
  FAVICON_CACHE.set(url, href)
}

function getFaviconHref(url: string): string {
  let cached = FAVICON_CACHE.get(url)
  if (cached) return cached
  const faviconUrl = new URL('/_favicon/', browser.runtime.getURL(''))
  faviconUrl.searchParams.set('pageUrl', url)
  faviconUrl.searchParams.set('size', '32')
  const href = faviconUrl.href
  cacheFavicon(url, href)
  return href
}

function openBookmark(url: string, mode: BookmarkOpenMode) {
  if (mode === 'current-tab') {
    browser.tabs.update({ url }).catch((err) => console.error('[BookmarksBar]', err))
  } else {
    browser.tabs.create({ url }).catch((err) => console.error('[BookmarksBar]', err))
  }
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

function FaviconForUrl({ url, title, cls }: { url: string; title: string; cls: { icon: string } }) {
  return (
    <span className={`${cls.icon} inline-flex shrink-0 items-center justify-center rounded-xs`}>
      <img
        src={getFaviconHref(url)}
        alt=""
        className={`${cls.icon} rounded-xs`}
        onError={(e) => {
          const img = e.currentTarget
          img.style.display = 'none'
          const fb = img.nextElementSibling
          if (fb) fb.classList.remove('hidden')
        }}
      />
      <span className="text-muted-foreground hidden h-full w-full items-center justify-center text-[8px] font-bold">
        {title.charAt(0).toUpperCase()}
      </span>
    </span>
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
        openBookmark(url, preferences.bookmarkOpenMode)
      }}
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
  direction = 'right'
}: {
  node: FlatNode
  size: BookmarksBarSize
  depth: number
  direction?: 'left' | 'right'
}) {
  const cls = SIZE_CLASSES[size]
  const triggerRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const directionRef = useRef(direction)
  const [dropdown, setDropdown] = useState<{ top: number; left: number; maxHeight: number } | null>(
    null
  )

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
    closeTimerRef.current = setTimeout(() => {
      setDropdown(null)
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  if (node.type !== 'folder' || node.children.length === 0) return null

  // ── 子菜单 ──
  const dropdownEl = dropdown && (
    <div
      className="border-border scrollbar-hide z-60 max-w-64 min-w-44 overflow-y-auto overscroll-none rounded-xl border shadow-lg"
      style={{
        position: 'fixed',
        ...dropdown
      }}
    >
      <div className="blur-bg relative p-1.5">
        {node.children.map((child) => {
          if (child.type === 'bookmark')
            return (
              <BookmarkItem
                key={child.id}
                title={child.title}
                url={child.url}
                size={size}
                variant="dropdown"
              />
            )
          if (depth < MAX_DEPTH)
            return (
              <FolderMenu
                key={child.id}
                node={child}
                size={size}
                depth={depth + 1}
                direction={directionRef.current}
              />
            )
          return (
            <div
              key={child.id}
              className="text-muted-foreground flex items-center gap-2 px-2 py-1.5"
            >
              <Folder className={`shrink-0 ${cls.icon}`} />
              <span className={`flex-1 truncate ${cls.text}`}>{child.title}</span>
            </div>
          )
        })}
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
            ? `flex items-center ${cls.gap} ${cls.py} hover:bg-muted/60 text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent px-1.5 transition-colors duration-150`
            : `hover:bg-muted/60 text-muted-foreground hover:text-foreground flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-2 py-1.5 text-left transition-colors duration-150`
        }
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

function OverflowMenu({ items, size }: { items: FlatNode[]; size: BookmarksBarSize }) {
  const cls = SIZE_CLASSES[size]
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    }
  }, [])

  if (items.length === 0) return null

  // ── 溢出下拉菜单 ──
  const dropdown = open && (
    <div
      className="border-border scrollbar-hide absolute top-full right-0 z-50 mt-0.5 max-w-64 min-w-44 overflow-y-auto overscroll-y-none rounded-xl border p-1.5 shadow-lg blur-bg"
      style={{ maxHeight: `calc(100vh - ${SIZE_HEIGHT[size]}px)` }}
    >
      <div className=" relative blur-bg">
        {items.map((child) => {
          if (child.type === 'bookmark')
            return (
              <BookmarkItem
                key={child.id}
                title={child.title}
                url={child.url}
                size={size}
                variant="dropdown"
              />
            )
          return <FolderMenu key={child.id} node={child} size={size} depth={1} />
        })}
      </div>
    </div>
  )

  return (
    <div
      className="relative ml-auto shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
  const { preferences } = useTheme()
  const [items, setItems] = useState<FlatNode[]>([])
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
    let loadVersion = 0
    let debounceTimer: ReturnType<typeof setTimeout> | undefined

    async function load() {
      const version = ++loadVersion
      try {
        const tree = await browser.bookmarks.getTree()
        const bookmarksBar = tree[0]?.children?.[0]
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
      if (used + gap + w > navWidth - (cls.iconWidthPx + gapPx)) break
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
  }, [enabled, items.length, cls.gapPx])

  if (!enabled || items.length === 0) return null

  return (
    <>
      {/* ── 书签栏容器 ── */}
      <div className="blur-bg fixed top-0 z-10 w-full shadow-sm max-[960px]:hidden px-4">
        {/* ── 书签导航 ── */}
        <nav
          ref={containerRef}
          className={`flex items-center ${cls.gap} relative`}
          role="navigation"
          aria-label="Bookmarks bar"
        >
          {/* ── 书签项 ── */}
          {items.map((node, i) => (
            <div
              key={node.id}
              className="shrink-0"
              style={
                i >= visibleCount
                  ? { position: 'absolute', visibility: 'hidden', pointerEvents: 'none' as const }
                  : undefined
              }
              ref={(el) => {
                if (el) {
                  const w = el.getBoundingClientRect().width
                  if (w > 0) widthsRef.current.set(node.id, w)
                }
              }}
            >
              {node.type === 'folder' ? (
                <FolderMenu node={node} size={size} depth={0} />
              ) : (
                <BookmarkItem title={node.title} url={node.url} size={size} variant="inline" />
              )}
            </div>
          ))}
          {/* ── 溢出菜单 ── */}
          {visibleCount < items.length && (
            <OverflowMenu items={items.slice(visibleCount)} size={size} />
          )}
        </nav>
      </div>
      {/* ── 占位间距 ── */}
      <div
        className="shrink-0 max-[960px]:hidden"
        style={{ height: SIZE_HEIGHT[size] + 'px' }}
      ></div>
    </>
  )
}
