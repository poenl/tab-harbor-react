import { useState } from 'react'
import type { QuickShortcut } from '@/types/shortcut'
import { useQuickShortcuts, svgToDataUrl } from '../hooks/useQuickShortcuts'
import { getIconSources, getFallbackLabel } from '../utils/icon-utils'

function ShortcutIcon({ shortcut }: { shortcut: QuickShortcut }) {
  const { icon, iconKind, url, label } = shortcut

  const [imgError, setImgError] = useState(false)

  if (iconKind === 'emoji') {
    return <span className="quick-shortcut-custom-glyph">{icon}</span>
  }

  if (iconKind === 'svg' && icon) {
    return (
      <img
        className="quick-shortcut-icon quick-shortcut-icon-custom"
        src={svgToDataUrl(icon)}
        alt=""
        draggable={false}
        onError={() => setImgError(true)}
      />
    )
  }

  if (iconKind === 'image' && icon && !imgError) {
    return (
      <img
        className="quick-shortcut-icon quick-shortcut-icon-custom"
        src={icon}
        alt=""
        draggable={false}
        onError={() => setImgError(true)}
      />
    )
  }

  if (imgError || (!iconKind && url)) {
    const sources = getIconSources(url, 32)
    const firstSrc = sources[0]

    if (!imgError && firstSrc) {
      return (
        <img
          className="quick-shortcut-icon"
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
        />
      )
    }
  }

  const fallbackText = getFallbackLabel(label, url)
  return <span className="quick-shortcut-fallback">{fallbackText}</span>
}

function AddShortcutCard({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="quick-shortcut-card is-add">
      <button
        className="quick-shortcut-open"
        type="button"
        onClick={onAdd}
        aria-label="Add quick tab"
      >
        <span className="quick-shortcut-icon-wrap">
          <svg className="quick-shortcut-icon" width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M11 5v12M5 11h12" strokeLinecap="round" />
          </svg>
        </span>
        <span className="quick-shortcut-label">Add link</span>
      </button>
    </div>
  )
}

function EditButton({ shortcutId, onEdit }: { shortcutId: string; onEdit: (id: string) => void }) {
  return (
    <button
      className="quick-shortcut-edit"
      type="button"
      onClick={(e) => { e.stopPropagation(); onEdit(shortcutId) }}
      aria-label="Edit quick tab"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M15.232 5.232l3.536 3.536M9 11l-3 3v3h3l8-8-3-3L9 14z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function RemoveButton({ shortcutId, onRemove }: { shortcutId: string; onRemove: (id: string) => void }) {
  return (
    <button
      className="quick-shortcut-remove"
      type="button"
      onClick={(e) => { e.stopPropagation(); onRemove(shortcutId) }}
      aria-label="Remove quick tab"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
      </svg>
    </button>
  )
}

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
    <div className="shortcut-editor-backdrop" onClick={onCancel}>
      <div className="shortcut-editor" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <form className="shortcut-editor-form" onSubmit={handleSubmit}>
          <div className="shortcut-editor-header">
            <h2 className="shortcut-editor-title">
              {shortcut?.id ? 'Edit shortcut' : 'Add shortcut'}
            </h2>
            <button className="shortcut-editor-close" type="button" onClick={onCancel}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <label className="shortcut-editor-field">
            <span className="shortcut-editor-label">URL</span>
            <input
              className="shortcut-editor-input"
              value={url}
              onChange={e => setUrl(e.target.value)}
              type="url"
              required
              autoFocus
            />
          </label>

          <label className="shortcut-editor-field">
            <span className="shortcut-editor-label">Label</span>
            <input
              className="shortcut-editor-input"
              value={label}
              onChange={e => setLabel(e.target.value)}
              type="text"
              placeholder="Optional"
            />
          </label>

          <div className="shortcut-editor-footer">
            <button className="theme-menu-action is-secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button className="theme-menu-action" type="submit">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
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
      <section className="quick-tabs" id="quickTabsSection">
        <div className="quick-tabs-grid" id="quickTabsList">
          {shortcuts.map(s => (
            <div key={s.id} className="quick-shortcut-card" data-shortcut-id={s.id}>
              <button
                className="quick-shortcut-open"
                type="button"
                onClick={() => handleOpen(s.url)}
                aria-label={s.label || s.url}
              >
                <span className="quick-shortcut-icon-wrap">
                  <ShortcutIcon shortcut={s} />
                </span>
                <span className="quick-shortcut-label">{s.label || getFallbackLabel('', s.url)}</span>
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
