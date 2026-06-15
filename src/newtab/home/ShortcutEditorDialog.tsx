import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import type { QuickShortcut } from '@/newtab/hooks/useQuickShortcuts'
import { getIconSources, getFallbackLabel } from '@/newtab/utils/icon-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

export interface ShortcutEditorData {
  url: string
  label: string
  icon: string
  iconKind: QuickShortcut['iconKind']
}

interface ShortcutEditorFormProps {
  shortcut: Partial<QuickShortcut> | null
  onSave: (data: ShortcutEditorData) => void
  onBack?: () => void
}

interface ShortcutEditorDialogProps extends ShortcutEditorFormProps {
  onCancel: () => void
}

const ICON_CHIPS = ['website', 'emoji', 'image', 'svg'] as const

export function ShortcutEditorForm({ shortcut, onSave, onBack }: ShortcutEditorFormProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [url, setUrl] = useState(shortcut?.url || '')
  const [label, setLabel] = useState(shortcut?.label || '')
  const [iconKind, setIconKind] = useState<QuickShortcut['iconKind']>(
    shortcut?.iconKind || 'website'
  )
  const [iconData, setIconData] = useState(shortcut?.icon || '')
  const [emojiInput, setEmojiInput] = useState(iconKind === 'emoji' ? shortcut?.icon || '' : '')
  const [svgCode, setSvgCode] = useState(iconKind === 'svg' ? shortcut?.icon || '' : '')
  const [imgSrc, setImgSrc] = useState('')
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (iconKind === 'website' && url) {
      const sources = getIconSources(url, 32)
      if (sources[0]) {
        setImgSrc(sources[0])
        setImgError(false)
      }
    } else if (iconKind === 'image' && iconData) {
      setImgSrc(iconData)
      setImgError(false)
    } else if (iconKind === 'svg' && svgCode) {
      const svg = svgCode.trim()
      if (svg) {
        setImgSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
        setImgError(false)
      } else setImgSrc('')
    } else setImgSrc('')
  }, [iconKind, url, iconData, svgCode])

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setIconData(reader.result as string)
      setIconKind('image')
    }
    reader.readAsDataURL(file)
  }

  function handlePaste(e: React.ClipboardEvent) {
    for (const item of Array.from(e.clipboardData.items)) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile()
        if (!blob) continue
        const reader = new FileReader()
        reader.onload = () => {
          setIconData(reader.result as string)
          setIconKind('image')
        }
        reader.readAsDataURL(blob)
        return
      }
      if (item.type === 'text/plain') {
        item.getAsString((text) => {
          const trimmed = text.trim()
          if (trimmed.startsWith('<svg') || trimmed.startsWith('<?xml')) {
            setSvgCode(trimmed)
            setIconKind('svg')
          }
        })
        return
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    let finalIcon = ''
    let finalKind: QuickShortcut['iconKind'] = 'website'
    if (iconKind === 'emoji' && emojiInput) {
      finalIcon = emojiInput.slice(0, 2)
      finalKind = 'emoji'
    } else if (iconKind === 'image' && iconData) {
      finalIcon = iconData
      finalKind = 'image'
    } else if (iconKind === 'svg' && svgCode.trim()) {
      finalIcon = svgCode.trim()
      finalKind = 'svg'
    }
    onSave({ url: url.trim(), label: label.trim(), icon: finalIcon, iconKind: finalKind })
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 space-y-2.5">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-[11px] font-semibold text-muted-foreground bg-none border-none p-0 cursor-pointer hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      )}

      <label className="block">
        <span className="text-xs font-medium text-muted-foreground">{t('urlLabel')}</span>
        <Input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setImgError(false)
          }}
          type="url"
          required
          autoFocus
          className="h-7 text-xs"
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-muted-foreground">{t('labelLabel')}</span>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          type="text"
          placeholder={t('optionalPlaceholder')}
          className="h-7 text-xs"
        />
      </label>

      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          {ICON_CHIPS.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() =>
                setIconKind(
                  kind === 'website'
                    ? 'website'
                    : kind === 'emoji'
                      ? 'emoji'
                      : kind === 'image'
                        ? 'image'
                        : 'svg'
                )
              }
              className={`text-[10px] font-semibold px-2 py-1 border border-border/60 rounded-md cursor-pointer transition-colors ${iconKind === kind ? 'bg-card text-foreground shadow-sm' : 'bg-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t(`shortcutIcon${kind.charAt(0).toUpperCase() + kind.slice(1)}` as any)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 p-2 bg-secondary/20 rounded-lg mb-1.5">
          <div className="size-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
            {iconKind === 'emoji' && emojiInput ? (
              <span className="text-base">{emojiInput.slice(0, 2)}</span>
            ) : imgSrc && !imgError ? (
              <img
                src={imgSrc}
                alt=""
                className="size-5 object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-xs font-bold text-primary">
                {url ? getFallbackLabel(label, url).slice(0, 2) : '?'}
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground truncate">
            {label || url || t('shortcutIconPreview')}
          </span>
        </div>

        {iconKind === 'emoji' && (
          <Input
            value={emojiInput}
            onChange={(e) => setEmojiInput(e.target.value.slice(0, 4))}
            placeholder={t('shortcutEmojiInput')}
            className="h-7 text-xs"
          />
        )}
        {iconKind === 'image' && (
          <div onPaste={handlePaste} className="space-y-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              hidden
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-7"
            >
              {t('shortcutUploadImage')}
            </Button>
            <p className="text-[9px] text-muted-foreground">{t('shortcutPasteImage')}</p>
          </div>
        )}
        {iconKind === 'svg' && (
          <textarea
            value={svgCode}
            onChange={(e) => setSvgCode(e.target.value)}
            placeholder={t('shortcutSvgCode')}
            rows={3}
            className="w-full text-[10px] bg-card border border-border/60 rounded-md px-2 py-1 text-foreground outline-none focus:border-primary/50 resize-none font-mono"
          />
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
        {onBack && (
          <Button variant="ghost" size="sm" type="button" onClick={onBack} className="text-xs h-7">
            {t('cancelButton')}
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          type="submit"
          disabled={!url.trim()}
          className="text-xs h-7"
        >
          {t('saveButton')}
        </Button>
      </div>
    </form>
  )
}

export function ShortcutEditorDialog({ shortcut, onSave, onCancel }: ShortcutEditorDialogProps) {
  const { t } = useTranslation()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20"
      onClick={onCancel}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-lg w-[380px] max-w-[90vw] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="text-sm font-semibold text-foreground">
            {shortcut?.id ? t('shortcutEditTitle') : t('shortcutAddTitle')}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-6 h-6 p-0 border-none rounded bg-transparent text-muted-foreground cursor-pointer flex items-center justify-center hover:text-foreground shrink-0"
          >
            <X strokeWidth={2} className="size-3.5" />
          </button>
        </div>
        <ShortcutEditorForm
          shortcut={shortcut}
          onSave={(data) => {
            onSave(data)
            onCancel()
          }}
        />
      </div>
    </div>
  )
}
