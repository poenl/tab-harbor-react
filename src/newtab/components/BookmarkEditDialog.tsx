import { useState, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface BookmarkEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  defaultTitle?: string
  defaultUrl?: string
  showUrl?: boolean
  onConfirm: (data: { title: string; url?: string }) => void
}

export function BookmarkEditDialog({
  open,
  onOpenChange,
  title,
  defaultTitle = '',
  defaultUrl = '',
  showUrl = false,
  onConfirm
}: BookmarkEditDialogProps) {
  const { t } = useTranslation()
  const [titleValue, setTitleValue] = useState(defaultTitle)
  const [urlValue, setUrlValue] = useState(defaultUrl)

  // 每次打开时同步初始值
  useEffect(() => {
    if (open) {
      setTitleValue(defaultTitle)
      setUrlValue(defaultUrl)
    }
  }, [open, defaultTitle, defaultUrl])

  function handleSave() {
    if (!titleValue.trim()) return
    onConfirm({ title: titleValue.trim(), url: showUrl ? urlValue.trim() : undefined })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="w-80 p-4 gap-3">
        <DialogHeader className="p-0">
          <DialogTitle className="text-base font-medium">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2.5">
          <Input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            placeholder={t('labelLabel')}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
            }}
          />
          {showUrl && (
            <Input
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="URL"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
            />
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {t('cancelButton')}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!titleValue.trim()}>
            {t('saveButton')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
