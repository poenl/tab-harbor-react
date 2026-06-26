import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react'
import { useTheme } from '@/stores/theme'
import type { BookmarksBarSize, BookmarkOpenMode } from '@/constants/preferences'
import type { Browser } from 'wxt/browser'
import { ChevronRight, Folder, ChevronsRight } from 'lucide-react'

const MAX_DEPTH = 5
const MAX_FAVICON_CACHE = 1000
const FAVICON_CACHE = new Map<string, string>()
const DEBOUNCE_MS = 100

const SIZE_CLASSES: Record<
  BookmarksBarSize,
  { icon: string; text: string; py: string; gap: string; gapPx: number }
> = {
  compact: { icon: 'w-3 h-3', text: 'text-xs', py: 'py-1', gap: 'gap-1', gapPx: 4 },
  normal: { icon: 'w-3.5 h-3.5', text: 'text-xs', py: 'py-1.5', gap: 'gap-1.5', gapPx: 6 },
  large: { icon: 'w-4 h-4', text: 'text-sm', py: 'py-2', gap: 'gap-2', gapPx: 8 }
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
    <span className={`${cls.icon} shrink-0 rounded-xs inline-flex items-center justify-center`}>
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
      <span className="hidden text-[8px] font-bold text-muted-foreground items-center justify-center w-full h-full">
        {title.charAt(0).toUpperCase()}
      </span>
    </span>
  )
}

function BookmarkLink({
  title,
  url,
  size
}: {
  title: string
  url: string
  size: BookmarksBarSize
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
      className={`flex items-center ${cls.gap} ${cls.py} px-1.5 hover:bg-muted/60 transition-colors duration-150 shrink-0 max-w-45 cursor-pointer no-underline text-muted-foreground hover:text-foreground`}
    >
      <FaviconForUrl url={url} title={title} cls={cls} />
      <span className={`truncate ${cls.text}`}>{title}</span>
    </a>
  )
}

function DropdownBookmarkItem({
  node,
  size
}: {
  node: Extract<FlatNode, { type: 'bookmark' }>
  size: BookmarksBarSize
}) {
  const cls = SIZE_CLASSES[size]
  const { preferences } = useTheme()
  return (
    <a
      href={node.url}
      onClick={(e) => {
        e.preventDefault()
        openBookmark(node.url, preferences.bookmarkOpenMode)
      }}
      className="relative flex items-center gap-2 px-2 py-1.5 hover:bg-muted/60 transition-colors duration-150 cursor-pointer no-underline text-muted-foreground hover:text-foreground"
    >
      <FaviconForUrl url={node.url} title={node.title} cls={cls} />
      <span className={`truncate flex-1 ${cls.text}`}>{node.title}</span>
    </a>
  )
}

function DropdownFolderItem({
  node,
  size
}: {
  node: Extract<FlatNode, { type: 'folder' }>
  size: BookmarksBarSize
}) {
  const cls = SIZE_CLASSES[size]
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground">
      <Folder className={`shrink-0 ${cls.icon}`} />
      <span className={`truncate flex-1 ${cls.text}`}>{node.title}</span>
    </div>
  )
}

function FolderMenu({
  node,
  size,
  depth
}: {
  node: FlatNode
  size: BookmarksBarSize
  depth: number
}) {
  const cls = SIZE_CLASSES[size]
  const triggerRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dropdown, setDropdown] = useState<{ top: number; left: number; maxHeight: number } | null>(
    null
  )
  const gap = 8

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      const el = triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (depth === 0) {
        setDropdown({
          top: rect.bottom + 2,
          left: rect.left,
          maxHeight: window.innerHeight - rect.bottom - gap
        })
      } else {
        setDropdown({
          top: rect.top,
          left: rect.right + 4,
          maxHeight: window.innerHeight - rect.top - gap
        })
      }
    }, 200)
  }

  const handleMouseLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => setDropdown(null), 200)
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  if (node.type !== 'folder' || node.children.length === 0) return null

  const dropdownEl = dropdown && (
    <div
      className="min-w-44 max-w-64 overflow-y-auto border border-border rounded-xl shadow-lg z-60 scrollbar-hide overscroll-contain"
      style={{
        position: 'fixed',
        top: dropdown.top,
        left: dropdown.left,
        maxHeight: dropdown.maxHeight
      }}
    >
      <div className="p-1.5 blur-bg relative">
        {node.children.map((child) => {
          if (child.type === 'bookmark')
            return <DropdownBookmarkItem key={child.id} node={child} size={size} />
          if (depth < MAX_DEPTH)
            return <FolderMenu key={child.id} node={child} size={size} depth={depth + 1} />
          return <DropdownFolderItem key={child.id} node={child} size={size} />
        })}
      </div>
    </div>
  )

  if (depth === 0) {
    return (
      <div
        ref={triggerRef}
        className="relative shrink-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          className={`flex items-center ${cls.gap} ${cls.py} px-1.5 hover:bg-muted/60 transition-colors duration-150 cursor-pointer border-none bg-transparent text-muted-foreground hover:text-foreground`}
        >
          <Folder className={`shrink-0 ${cls.icon}`} />
          <span className={`truncate max-w-30 ${cls.text}`}>{node.title}</span>
          <ChevronRight
            className={`shrink-0 transition-transform duration-150 ${dropdown ? 'rotate-90' : ''} ${cls.icon}`}
          />
        </button>
        {dropdownEl}
      </div>
    )
  }

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-muted/60 transition-colors duration-150 cursor-pointer border-none bg-transparent text-muted-foreground hover:text-foreground text-left">
        <Folder className={`shrink-0 ${cls.icon}`} />
        <span className={`truncate flex-1 ${cls.text}`}>{node.title}</span>
        <ChevronRight className="shrink-0 w-3 h-3" />
      </button>
      {dropdownEl}
    </div>
  )
}

function OverflowMenu({ items, size }: { items: FlatNode[]; size: BookmarksBarSize }) {
  const cls = SIZE_CLASSES[size]
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = useCallback(() => setOpen((prev) => !prev), [])

  const handleMouseEnter = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setOpen(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setOpen(false), 200)
  }, [])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  if (items.length === 0) return null

  const dropdown = open && (
    <div
      className="absolute top-full right-0 mt-0.5 min-w-44 max-w-64 overflow-y-auto backdrop-blur-xl border border-border rounded-xl shadow-lg p-1.5 z-50 scrollbar-hide overscroll-contain"
      style={{
        backgroundColor:
          'color-mix(in srgb, var(--card) calc(40% + var(--custom-surface-opacity, 50%) * 0.6), transparent)',
        maxHeight: `calc(100vh - ${SIZE_HEIGHT[size]}px)`
      }}
    >
      {items.map((child) => {
        if (child.type === 'bookmark')
          return <DropdownBookmarkItem key={child.id} node={child} size={size} />
        return <FolderMenu key={child.id} node={child} size={size} depth={1} />
      })}
    </div>
  )

  return (
    <div
      className="relative shrink-0 ml-auto pr-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className={`flex items-center justify-center ${cls.py} px-1 hover:bg-muted/60 transition-colors duration-150 cursor-pointer border-none bg-transparent text-muted-foreground hover:text-foreground`}
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

  const recalc = useCallback(() => {
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
      if (used + gap + w > navWidth) break
      used += gap + w
      count++
    }

    const finalCount = count < items.length ? Math.max(1, count) : items.length
    setVisibleCount(finalCount)
  }, [items, cls.gapPx])

  useLayoutEffect(() => {
    if (!enabled || items.length === 0) return
    recalc()
    const ro = new ResizeObserver(() => recalc())
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [enabled, items.length, recalc])

  if (!enabled || items.length === 0) return null

  return (
    <>
      <div className="w-full fixed top-0 z-10 shadow-sm blur-bg max-[960px]:hidden">
        <nav
          ref={containerRef}
          className={`flex items-center ${cls.gap} relative`}
          role="navigation"
          aria-label="Bookmarks bar"
        >
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
                <BookmarkLink title={node.title} url={node.url} size={size} />
              )}
            </div>
          ))}
          {visibleCount < items.length && (
            <OverflowMenu items={items.slice(visibleCount)} size={size} />
          )}
        </nav>
      </div>
      <div
        className="shrink-0 max-[960px]:hidden"
        style={{ height: SIZE_HEIGHT[size] + 'px' }}
      ></div>
    </>
  )
}
