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
}

interface ShortcutEditorDialogProps {
  shortcut: Partial<QuickShortcut> | null
  onSave: (data: ShortcutEditorData) => void
  onCancel: () => void
}

const ICON_CHIPS = ['website', 'emoji', 'image', 'svg'] as const

export function ShortcutEditorForm({ shortcut, onSave }: ShortcutEditorFormProps) {
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
    } else if (iconKind === 'svg' && svgCode.trim()) {
      setImgSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode.trim())}`)
      setImgError(false)
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

  const labelClass = 'text-[10px] font-bold text-muted-foreground uppercase tracking-[0.16em]'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-auto space-y-4 px-4 py-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>{t('urlLabel')}</span>
          <Input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setImgError(false)
            }}
            type="url"
            required
            autoFocus
            placeholder="https://example.com"
            className="h-10 text-xs rounded-xl px-3"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>{t('labelLabel')}</span>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            type="text"
            placeholder={t('optionalPlaceholder')}
            className="h-10 text-xs rounded-xl px-3"
          />
        </label>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl border border-border/40 bg-secondary/30 flex items-center justify-center shrink-0 overflow-hidden">
              {iconKind === 'emoji' && emojiInput ? (
                <span className="text-xl">{emojiInput.slice(0, 2)}</span>
              ) : imgSrc && !imgError ? (
                <img
                  src={imgSrc}
                  alt=""
                  className="size-5.5 object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="size-5.5 rounded-full bg-accent/10 text-accent text-[11px] font-bold inline-flex items-center justify-center">
                  {url ? getFallbackLabel(label, url).slice(0, 2) : 'A'}
                </span>
              )}
            </div>
            <div className="flex items-center p-0.75 border border-border/50 rounded-xl bg-secondary/20 flex-1 min-w-0">
              {ICON_CHIPS.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setIconKind(kind)}
                  className={`text-[11px] font-semibold px-2.5 py-1.75 rounded-[9px] transition-colors flex-1 ${
                    iconKind === kind
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(`shortcutIcon${kind.charAt(0).toUpperCase() + kind.slice(1)}` as any)}
                </button>
              ))}
            </div>
          </div>

          <div>
            {iconKind === 'emoji' && (
              <Input
                value={emojiInput}
                onChange={(e) => setEmojiInput(e.target.value.slice(0, 4))}
                placeholder={t('shortcutEmojiInput')}
                className="h-10 text-xs rounded-xl px-3"
              />
            )}
            {iconKind === 'image' && (
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  hidden
                />
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs h-9 rounded-xl"
                    >
                      {t('shortcutUploadImage')}
                    </Button>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground">{t('shortcutPasteImage')}</span>
              </div>
            )}
            {iconKind === 'svg' && (
              <textarea
                value={svgCode}
                onChange={(e) => setSvgCode(e.target.value)}
                placeholder={t('shortcutSvgCode')}
                rows={4}
                className="w-full text-xs bg-card border border-border/50 rounded-xl px-3 py-2.5 text-foreground outline-none focus:border-primary/50 resize-none font-mono"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end px-4 py-3 border-t border-border/30 shrink-0">
        <Button
          variant="default"
          size="sm"
          type="submit"
          disabled={!url.trim()}
          className="text-xs h-9 min-w-[9em] rounded-xl"
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
    <>
      <div className="fixed inset-0 z-50 bg-foreground/8" onClick={onCancel} />
      <div className="fixed bottom-6 right-22 z-50 w-90 bg-card border border-border rounded-[20px] shadow-[0_20px_42px_var(--tw-shadow-color)] shadow-accent/10 flex flex-col overflow-hidden max-w-[calc(100vw-32px)]">
        <div className="shrink-0 px-4 pt-4 pb-2">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-serif text-2xl font-normal text-foreground leading-[1.05]">
              {shortcut?.id ? t('shortcutEditTitle') : t('shortcutAddTitle')}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground rounded-full size-8"
            >
              <X strokeWidth={2} className="size-3.5" />
            </Button>
          </div>
        </div>
        <ShortcutEditorForm
          shortcut={shortcut}
          onSave={(data) => {
            onSave(data)
            onCancel()
          }}
        />
      </div>
    </>
  )
}
