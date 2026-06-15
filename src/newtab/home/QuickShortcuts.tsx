import { useState } from 'react'
import { Plus, Pencil, X } from 'lucide-react'
import { useTranslation } from '@/i18n'
import type { QuickShortcut } from '@/newtab/hooks/useQuickShortcuts'
import { useQuickShortcuts, svgToDataUrl } from '../hooks/useQuickShortcuts'
import { getIconSources, getFallbackLabel } from '../utils/icon-utils'
import { TabPicker } from './TabPicker.tsx'
import { ShortcutEditorDialog } from './ShortcutEditorDialog.tsx'

// ── 图标容器 ──
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

  if (!imgError && url) {
    const sources = getIconSources(url, 32)
    const firstSrc = sources[0]
    if (firstSrc) {
      return (
        <img
          src={firstSrc}
          alt=""
          draggable={false}
          data-fallback-src={sources[1]}
          onError={(e) => {
            const fb = (e.currentTarget as HTMLImageElement).getAttribute('data-fallback-src')
            if (fb) {
              e.currentTarget.src = fb
              e.currentTarget.removeAttribute('data-fallback-src')
            } else setImgError(true)
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
  const { t } = useTranslation()
  return (
    <div>
      <button
        type="button"
        onClick={onAdd}
        aria-label={t('addQuickTab')}
        className="grid grid-rows-[40px_auto] justify-items-center content-start gap-1.5 w-full text-center cursor-pointer bg-none border-none p-0"
      >
        <span className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ring-1 ring-inset ring-border">
          <Plus strokeWidth={1.8} aria-hidden="true" className="w-[22px] h-[22px] text-primary" />
        </span>
        <span className="text-[11px] leading-[1.45] text-muted-foreground">{t('addLink')}</span>
      </button>
    </div>
  )
}

// ── 编辑按钮 ──
function EditButton({ shortcutId, onEdit }: { shortcutId: string; onEdit: (id: string) => void }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onEdit(shortcutId)
      }}
      aria-label={t('editQuickTab')}
      className="absolute -top-0.5 left-0 w-[18px] h-[18px] p-0 rounded-full border border-border bg-card text-muted-foreground flex items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-all duration-200 translate-y-0.5 scale-90 group-hover:translate-y-0 group-hover:scale-100 group-focus-within:translate-y-0 group-focus-within:scale-100 shadow-[0_3px_8px_var(--tw-shadow-color)] shadow-foreground/5 hover:border-primary hover:bg-secondary hover:text-primary"
    >
      <Pencil strokeWidth={1.8} aria-hidden="true" className="w-[9px] h-[9px]" />
    </button>
  )
}

// ── 删除按钮 ──
function RemoveButton({
  shortcutId,
  onRemove
}: {
  shortcutId: string
  onRemove: (id: string) => void
}) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onRemove(shortcutId)
      }}
      aria-label={t('removeQuickTab')}
      className="absolute -top-0.5 right-0 w-[18px] h-[18px] p-0 rounded-full border border-border bg-card text-muted-foreground flex items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-all duration-200 translate-y-0.5 scale-90 group-hover:translate-y-0 group-hover:scale-100 group-focus-within:translate-y-0 group-focus-within:scale-100 shadow-[0_3px_8px_var(--tw-shadow-color)] shadow-foreground/5 hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <X strokeWidth={1.8} aria-hidden="true" className="w-[9px] h-[9px]" />
    </button>
  )
}

export function QuickShortcuts() {
  const { t } = useTranslation()
  const { shortcuts, add, update, remove } = useQuickShortcuts()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editor, setEditor] = useState<{
    shortcut: Partial<QuickShortcut> | null
    mode: 'create' | 'edit'
  } | null>(null)

  async function handleOpen(url: string) {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) await browser.tabs.update(tab.id, { url })
    } catch {}
  }

  function handleEdit(id: string) {
    const s = shortcuts.find((s) => s.id === id)
    if (s) setEditor({ shortcut: s, mode: 'edit' })
  }

  function handleAddViaTabPicker() {
    setPickerOpen(true)
  }

  async function handleSave(data: {
    url: string
    label: string
    icon: string
    iconKind: QuickShortcut['iconKind']
  }) {
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
          {shortcuts.map((s) => (
            <div key={s.id} data-shortcut-id={s.id} className="relative group">
              <button
                type="button"
                onClick={() => handleOpen(s.url)}
                aria-label={s.label || s.url}
                className="grid grid-rows-[40px_auto] justify-items-center content-start gap-1.5 w-full text-center cursor-pointer bg-none border-none p-0 hover:-translate-y-px transition-transform duration-300 ease-out"
              >
                <span className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:shadow-[0_4px_10px_var(--tw-shadow-color)] group-hover:shadow-primary/10 transition-shadow duration-200">
                  <ShortcutIcon shortcut={s} />
                </span>
                <span className="text-[11px] leading-[1.45] text-foreground max-w-full overflow-hidden line-clamp-2">
                  {s.label || getFallbackLabel('', s.url)}
                </span>
              </button>
              <EditButton shortcutId={s.id} onEdit={handleEdit} />
              <RemoveButton shortcutId={s.id} onRemove={remove} />
            </div>
          ))}
          <AddShortcutCard onAdd={handleAddViaTabPicker} />
        </div>
      </section>

      {pickerOpen && <TabPicker onClose={() => setPickerOpen(false)} />}

      {editor && (
        <ShortcutEditorDialog
          shortcut={editor.shortcut}
          onSave={handleSave}
          onCancel={() => setEditor(null)}
        />
      )}
    </>
  )
}
