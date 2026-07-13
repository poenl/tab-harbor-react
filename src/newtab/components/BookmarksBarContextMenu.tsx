import { useState, type ReactNode } from 'react'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator
} from '@/components/ui/context-menu'
import { BookmarkEditDialog } from './BookmarkEditDialog'
import { useBrowsing, type FlatNode } from './BookmarksBar'
import { useTranslation } from '@/i18n'

function collectBookmarkUrls(nodes: FlatNode[]): string[] {
  const urls: string[] = []
  for (const n of nodes) {
    if (n.type === 'bookmark') urls.push(n.url)
    else urls.push(...collectBookmarkUrls(n.children))
  }
  return urls
}

export function BookmarkItemContextMenu({
  node,
  children
}: {
  node: FlatNode
  children: ReactNode
}) {
  const { t } = useTranslation()
  const { exitBrowsing } = useBrowsing()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editDialogConfig, setEditDialogConfig] = useState<{
    mode: 'edit' | 'rename'
    id: string
    title: string
    url?: string
  } | null>(null)

  // 溢出菜单（title 为空）不显示右键菜单
  if (!node.title) return <>{children}</>

  // ── 操作函数 ──

  const handleOpenInNewTab = (url: string) => {
    exitBrowsing()
    browser.tabs.create({ url }).catch(() => {})
  }

  const handleOpenAllInNewTabs = () => {
    if (node.type !== 'folder') return
    exitBrowsing()
    const urls = collectBookmarkUrls(node.children)
    for (const url of urls) {
      browser.tabs.create({ url }).catch(() => {})
    }
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {}
    exitBrowsing()
  }

  const handleDelete = (id: string, title: string, isFolder: boolean) => {
    if (!window.confirm(t('confirmDelete', { title }))) return
    if (isFolder) {
      browser.bookmarks.removeTree(id).catch(() => {})
    } else {
      browser.bookmarks.remove(id).catch(() => {})
    }
    exitBrowsing()
  }

  const handleEditConfirm = (data: { title: string; url?: string }) => {
    if (!editDialogConfig) return
    if (data.url !== undefined) {
      browser.bookmarks
        .update(editDialogConfig.id, { title: data.title, url: data.url })
        .then(() => setEditDialogConfig(null))
        .catch(() => {})
    } else {
      browser.bookmarks
        .update(editDialogConfig.id, { title: data.title })
        .then(() => setEditDialogConfig(null))
        .catch(() => {})
    }
    exitBrowsing()
  }

  const openEdit = (mode: 'edit' | 'rename', id: string, title: string, url?: string) => {
    setEditDialogConfig({ mode, id, title, url })
    setEditDialogOpen(true)
  }

  // ── 操作项 ──

  const bookmarkItems = (
    <>
      <ContextMenuItem onClick={() => handleOpenInNewTab(node.type === 'bookmark' ? node.url : '')}>
        {t('openInNewTab')}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        onClick={() =>
          openEdit('edit', node.id, node.title, (node as FlatNode & { url: string }).url)
        }
      >
        {t('editBookmark')}
      </ContextMenuItem>
      <ContextMenuItem onClick={() => handleCopyUrl((node as FlatNode & { url: string }).url)}>
        {t('copyUrl')}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        variant="destructive"
        onClick={() => handleDelete(node.id, node.title, false)}
      >
        {t('deleteBookmark')}
      </ContextMenuItem>
    </>
  )

  const folderItems = (
    <>
      <ContextMenuItem onClick={handleOpenAllInNewTabs}>{t('openAllInNewTabs')}</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => openEdit('rename', node.id, node.title)}>
        {t('renameFolder')}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        variant="destructive"
        onClick={() => handleDelete(node.id, node.title, true)}
      >
        {t('deleteBookmark')}
      </ContextMenuItem>
    </>
  )

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {node.type === 'bookmark' ? bookmarkItems : folderItems}
      </ContextMenuContent>
      <BookmarkEditDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditDialogConfig(null)
        }}
        title={t(
          editDialogConfig?.mode === 'edit' ? 'editBookmarkDialogTitle' : 'renameFolderDialogTitle'
        )}
        defaultTitle={editDialogConfig?.title}
        defaultUrl={editDialogConfig?.url}
        showUrl={editDialogConfig?.mode === 'edit'}
        onConfirm={handleEditConfirm}
      />
    </ContextMenu>
  )
}
