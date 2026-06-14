import { useState } from 'react'
import { Plus, Pencil, X } from 'lucide-react'
import type { QuickShortcut } from '@/types/shortcut'
import { useQuickShortcuts, svgToDataUrl } from '../hooks/useQuickShortcuts'
import { getIconSources, getFallbackLabel } from '../utils/icon-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

// ── 图标容器（首字母 / favicon / emoji / SVG） ──
function ShortcutIcon({ shortcut }: { shortcut: QuickShortcut }) {
  const { icon, iconKind, url, label } = shortcut

  const [imgError, setImgError] = useState(false)

  if (iconKind === 'emoji') {
    return <span className="text-lg leading-none">{icon}</span>
  }

  if (iconKind === 'svg' && icon) {
    return (
      <img
        src={svgToDataUrl(icon)}
        alt=""
        draggable={false}
        onError={() => setImgError(true)}
        className="w-[22px] h-[22px] rounded-md object-contain"
      />
    )
  }

  if (iconKind === 'image' && icon && !imgError) {
    return (
      <img
        src={icon}
        alt=""
        draggable={false}
        onError={() => setImgError(true)}
        className="w-[22px] h-[22px] rounded-md object-contain"
      />
    )
  }

  if (imgError || (!iconKind && url)) {
    const sources = getIconSources(url, 32)
    const firstSrc = sources[0]

    if (!imgError && firstSrc) {
      return (
        <img
          src={firstSrc}
          alt=""
          draggable={false}
          data-fallback-src={sources[1]}
          onError={(e) => {
            const fallback = (e.currentTarget as HTMLImageElement).getAttribute('data-fallback-src')
            if (fallback) {
              e.currentTarget.src = fallback
              e.currentTarget.removeAttribute('data-fallback-src')
            } else {
              setImgError(true)
            }
          }}
          className="w-[22px] h-[22px] rounded-md object-contain"
        />
      )
    }
  }

  const fallbackText = getFallbackLabel(label, url)
  return <span className="text-[13px] font-bold text-primary">{fallbackText}</span>
}

// ── 添加快捷卡片 ──
function AddShortcutCard({ onAdd }: { onAdd: () => void }) {
  return (
    <div>
      <button
        type="button"
        onClick={onAdd}
        aria-label="Add quick tab"
        className="grid grid-rows-[40px_auto] justify-items-center content-start gap-1.5 w-full text-center cursor-pointer bg-none border-none p-0"
      >
        <span className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ring-1 ring-inset ring-border">
          <Plus strokeWidth={1.8} aria-hidden="true" className="w-[22px] h-[22px] text-primary" />
        </span>
        <span className="text-[11px] leading-[1.45] text-muted-foreground">Add link</span>
      </button>
    </div>
  )
}

// ── 编辑按钮（hover 显示） ──
function EditButton({ shortcutId, onEdit }: { shortcutId: string; onEdit: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onEdit(shortcutId) }}
      aria-label="Edit quick tab"
      className="absolute -top-0.5 left-0 w-[18px] h-[18px] p-0 rounded-full border border-border bg-card text-muted-foreground flex items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-all duration-200 translate-y-0.5 scale-90 group-hover:translate-y-0 group-hover:scale-100 group-focus-within:translate-y-0 group-focus-within:scale-100 shadow-[0_3px_8px_var(--tw-shadow-color)] shadow-foreground/5 hover:border-primary hover:bg-secondary hover:text-primary"
    >
      <Pencil strokeWidth={1.8} aria-hidden="true" className="w-[9px] h-[9px]" />
    </button>
  )
}

// ── 删除按钮（hover 显示） ──
function RemoveButton({ shortcutId, onRemove }: { shortcutId: string; onRemove: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onRemove(shortcutId) }}
      aria-label="Remove quick tab"
      className="absolute -top-0.5 right-0 w-[18px] h-[18px] p-0 rounded-full border border-border bg-card text-muted-foreground flex items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-all duration-200 translate-y-0.5 scale-90 group-hover:translate-y-0 group-hover:scale-100 group-focus-within:translate-y-0 group-focus-within:scale-100 shadow-[0_3px_8px_var(--tw-shadow-color)] shadow-foreground/5 hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <X strokeWidth={1.8} aria-hidden="true" className="w-[9px] h-[9px]" />
    </button>
  )
}

// ── 编辑对话框 ──
function ShortcutEditor({ shortcut, onSave, onCancel }: {
  shortcut: Partial<QuickShortcut> | null
  onSave: (data: Partial<QuickShortcut>) => void
  onCancel: () => void
}) {
  const [url, setUrl] = useState(shortcut?.url || '')
  const [label, setLabel] = useState(shortcut?.label || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ url, label })
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel() }}>
      <DialogContent className="sm:max-w-[400px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {shortcut?.id ? 'Edit shortcut' : 'Add shortcut'}
            </DialogTitle>
          </DialogHeader>

          <div>
            <label>
              <span>URL</span>
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
                type="url"
                required
                autoFocus
              />
            </label>

            <label>
              <span>Label</span>
              <Input
                value={label}
                onChange={e => setLabel(e.target.value)}
                type="text"
                placeholder="Optional"
              />
            </label>
          </div>

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="secondary" type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function QuickShortcuts() {
  const { shortcuts, add, update, remove } = useQuickShortcuts()
  const [editor, setEditor] = useState<{ shortcut: Partial<QuickShortcut> | null; mode: 'create' | 'edit' } | null>(null)

  async function handleOpen(url: string) {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) {
        await browser.tabs.update(tab.id, { url })
      }
    } catch {}
  }

  function handleEdit(id: string) {
    const s = shortcuts.find(s => s.id === id)
    if (s) setEditor({ shortcut: s, mode: 'edit' })
  }

  function handleAdd() {
    setEditor({ shortcut: null, mode: 'create' })
  }

  async function handleSave(data: Partial<QuickShortcut>) {
    if (editor?.mode === 'edit' && editor.shortcut?.id) {
      await update(editor.shortcut.id, data)
    } else {
      await add(data)
    }
    setEditor(null)
  }

  return (
    <>
      {/* ── 快捷链接网格 ── */}
      <section>
        <div className="grid grid-cols-[repeat(auto-fill,76px)] gap-3 gap-x-2.5 justify-start">
          {shortcuts.map(s => (
            <div key={s.id} data-shortcut-id={s.id} className="relative group">
              <button
                type="button"
                onClick={() => handleOpen(s.url)}
                aria-label={s.label || s.url}
                className="grid grid-rows-[40px_auto] justify-items-center content-start gap-1.5 w-full text-center cursor-pointer bg-none border-none p-0 hover:-translate-y-px transition-transform duration-300 ease-out"
              >
                {/* ── 图标外壳（40×40 圆角容器） ── */}
                <span className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:shadow-[0_4px_10px_var(--tw-shadow-color)] group-hover:shadow-primary/10 transition-shadow duration-200">
                  <ShortcutIcon shortcut={s} />
                </span>
                {/* ── 标签文字（最多两行） ── */}
                <span className="text-[11px] leading-[1.45] text-foreground max-w-full overflow-hidden line-clamp-2">
                  {s.label || getFallbackLabel('', s.url)}
                </span>
              </button>
              <EditButton shortcutId={s.id} onEdit={handleEdit} />
              <RemoveButton shortcutId={s.id} onRemove={remove} />
            </div>
          ))}
          <AddShortcutCard onAdd={handleAdd} />
        </div>
      </section>

      {editor && (
        <ShortcutEditor
          shortcut={editor.shortcut}
          onSave={handleSave}
          onCancel={() => setEditor(null)}
        />
      )}
    </>
  )
}
