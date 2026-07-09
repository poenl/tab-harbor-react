import { useState } from 'react'
import { Plus, Pencil, X, ExternalLink } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { useTheme } from '@/stores/theme'
import type { QuickShortcut } from '@/stores/quickShortcuts'
import { useQuickShortcutsStore } from '@/stores/quickShortcuts'
import { ShortcutIcon } from '@/components/shortcut-icon'
import { getFallbackLabel } from '../utils/icon-utils'
import { TabPicker } from './TabPicker.tsx'
import { ShortcutEditorDialog } from './ShortcutEditorDialog.tsx'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'

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

  async function handleOpenInNewTab(url: string) {
    await browser.tabs.create({ url })
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
              <ContextMenu>
                <ContextMenuTrigger asChild>
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
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => handleOpenInNewTab(s.url)}>
                    <ExternalLink />
                    {t('openInNewTab')}
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleEdit(s.id)}>
                    <Pencil />
                    {t('editQuickTab')}
                  </ContextMenuItem>
                  <ContextMenuItem variant="destructive" onClick={() => remove(s.id)}>
                    <X />
                    {t('removeQuickTab')}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
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
