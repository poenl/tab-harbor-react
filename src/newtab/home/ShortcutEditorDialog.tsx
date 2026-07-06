import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import type { QuickShortcut } from '@/stores/quickShortcuts'
import { getIconSources, getFallbackLabel } from '@/newtab/utils/icon-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X } from 'lucide-react'
import { Field, FieldDescription } from '@/components/ui/field'

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

  const labelClass = 'text-xs font-bold text-muted-foreground uppercase tracking-[0.16em]'

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden h-full">
      <div className="flex-1 space-y-4 overflow-auto px-4 py-3">
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
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>{t('labelLabel')}</span>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            type="text"
            placeholder={t('optionalPlaceholder')}
          />
        </label>

        <Tabs
          value={iconKind}
          onValueChange={(v) => setIconKind(v as QuickShortcut['iconKind'])}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="border-border/40 bg-secondary/30 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
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
                <span className="bg-accent/10 text-accent inline-flex size-5.5 items-center justify-center rounded-full text-[11px] font-bold">
                  {url ? getFallbackLabel(label, url).slice(0, 2) : 'A'}
                </span>
              )}
            </div>
            <TabsList className="w-full flex-1 min-w-0 rounded-xl border border-border/50 bg-secondary/20 p-0.75">
              {ICON_CHIPS.map((kind) => (
                <TabsTrigger
                  key={kind}
                  value={kind}
                  className="flex-1 rounded-[9px] px-2.5 py-1.75 text-xs font-semibold data-active:bg-card"
                >
                  {t(`shortcutIcon${kind.charAt(0).toUpperCase() + kind.slice(1)}` as any)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="emoji">
            <Input
              value={emojiInput}
              onChange={(e) => setEmojiInput(e.target.value.slice(0, 4))}
              placeholder={t('shortcutEmojiInput')}
            />
          </TabsContent>
          <TabsContent value="image">
            <div className="flex flex-col gap-2">
              <Field>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="h-7 py-0.5 px-3 text-muted-foreground text-xs! file:text-xs"
                />
                <FieldDescription className="text-xs">{t('shortcutPasteImage')}</FieldDescription>
              </Field>
            </div>
          </TabsContent>
          <TabsContent value="svg">
            <Textarea
              value={svgCode}
              onChange={(e) => setSvgCode(e.target.value)}
              placeholder={t('shortcutSvgCode')}
              rows={4}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="border-border/30 flex shrink-0 justify-end border-t px-4 py-3">
        <Button variant="default" size="lg" type="submit" disabled={!url.trim()} className="">
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
      <div className="bg-foreground/6 fixed inset-0 z-50" onClick={onCancel} />
      <div
        className="border-border shadow-accent/10 fixed right-22 bottom-6 z-50 flex w-90 max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[20px] border shadow-[0_20px_42px_var(--tw-shadow-color)] backdrop-blur-xl"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--card) calc(40% + var(--custom-surface-opacity, 50%) * 0.6), transparent)'
        }}
      >
        <div className="shrink-0 px-4 pt-4 pb-2">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-foreground font-serif text-lg leading-[1.05] font-normal">
              {shortcut?.id ? t('shortcutEditTitle') : t('shortcutAddTitle')}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground size-8 rounded-full"
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
