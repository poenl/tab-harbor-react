import { useState } from 'react'
import { Plus, Pencil, X } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { useTheme } from '@/stores/theme'
import type { QuickShortcut } from '@/stores/quickShortcuts'
import { useQuickShortcutsStore } from '@/stores/quickShortcuts'
import { ShortcutIcon } from '@/components/shortcut-icon'
import { getFallbackLabel } from '../utils/icon-utils'
import { TabPicker } from './TabPicker.tsx'
import { ShortcutEditorDialog } from './ShortcutEditorDialog.tsx'

// ── 添加快捷卡片 ──
function AddShortcutCard({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation()
  return (
    <div>
      <button
        type="button"
        onClick={onAdd}
        aria-label={t('addQuickTab')}
        className="grid w-full cursor-pointer content-start justify-items-center border-none bg-none p-0 text-center transition-transform duration-300 ease-out hover:-translate-y-px"
        style={
          {
            gridTemplateRows: `calc(40px * var(--shortcut-scale, 1)) auto`,
            gap: `calc(6px * var(--shortcut-scale, 1))`
          } as React.CSSProperties
        }
      >
        <span
          className="bg-secondary ring-border flex items-center justify-center rounded-xl ring-1 ring-inset"
          style={
            {
              width: `calc(40px * var(--shortcut-scale, 1))`,
              height: `calc(40px * var(--shortcut-scale, 1))`
            } as React.CSSProperties
          }
        >
          <Plus strokeWidth={1.8} aria-hidden="true" className="text-primary h-5.5 w-5.5" />
        </span>
        <span className="text-muted-foreground text-xs leading-[1.45]">{t('addLink')}</span>
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
      className="border-border bg-card text-muted-foreground shadow-foreground/5 hover:border-primary hover:bg-secondary hover:text-primary pointer-events-none absolute -top-0.5 left-0 flex h-4.5 w-4.5 translate-y-0.5 scale-90 items-center justify-center rounded-full border p-0 opacity-0 shadow-[0_3px_8px_var(--tw-shadow-color)] transition-all duration-200 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
    >
      <Pencil strokeWidth={1.8} aria-hidden="true" className="h-2.25 w-2.25" />
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
      className="border-border bg-card text-muted-foreground shadow-foreground/5 hover:border-destructive hover:bg-destructive/10 hover:text-destructive pointer-events-none absolute -top-0.5 right-0 flex h-4.5 w-4.5 translate-y-0.5 scale-90 items-center justify-center rounded-full border p-0 opacity-0 shadow-[0_3px_8px_var(--tw-shadow-color)] transition-all duration-200 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
    >
      <X strokeWidth={1.8} aria-hidden="true" className="h-2.25 w-2.25" />
    </button>
  )
}

export function QuickShortcuts() {
  const { t } = useTranslation()
  const { preferences } = useTheme()
  const shortcuts = useQuickShortcutsStore((s) => s.shortcuts)
  const add = useQuickShortcutsStore((s) => s.add)
  const update = useQuickShortcutsStore((s) => s.update)
  const remove = useQuickShortcutsStore((s) => s.remove)
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
      <section
        style={{ '--shortcut-scale': preferences.shortcutScale / 100 } as React.CSSProperties}
      >
        <div
          className="grid justify-start"
          style={
            {
              gridTemplateColumns: `repeat(auto-fill,calc(76px * var(--shortcut-scale, 1)))`,
              gap: `calc(12px * var(--shortcut-scale, 1))`,
              columnGap: `calc(10px * var(--shortcut-scale, 1))`
            } as React.CSSProperties
          }
        >
          {shortcuts.map((s) => (
            <div key={s.id} data-shortcut-id={s.id} className="group relative">
              <button
                type="button"
                onClick={() => handleOpen(s.url)}
                aria-label={s.label || s.url}
                className="grid w-full cursor-pointer content-start justify-items-center gap-[calc(6px*var(--shortcut-scale,1))] border-none bg-none p-0 text-center transition-transform duration-300 ease-out hover:-translate-y-px"
                style={
                  {
                    gridTemplateRows: `calc(40px * var(--shortcut-scale, 1)) auto`
                  } as React.CSSProperties
                }
              >
                <span
                  className="bg-secondary group-hover:shadow-primary/10 flex items-center justify-center rounded-xl transition-shadow duration-200 group-hover:shadow-[0_4px_10px_var(--tw-shadow-color)]"
                  style={
                    {
                      width: `calc(40px * var(--shortcut-scale, 1))`,
                      height: `calc(40px * var(--shortcut-scale, 1))`
                    } as React.CSSProperties
                  }
                >
                  <ShortcutIcon shortcut={s} />
                </span>
                <span className="text-foreground line-clamp-2 max-w-full overflow-hidden text-xs leading-[1.45]">
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
