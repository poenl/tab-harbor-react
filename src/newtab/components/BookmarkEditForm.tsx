import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface BookmarkEditFormProps {
  title: string
  defaultTitle?: string
  defaultUrl?: string
  showUrl?: boolean
  onConfirm: (data: { title: string; url?: string }) => void
  onCancel: () => void
}

export function BookmarkEditForm({
  title,
  defaultTitle = '',
  defaultUrl = '',
  showUrl = false,
  onConfirm,
  onCancel
}: BookmarkEditFormProps) {
  const { t } = useTranslation()
  const [titleValue, setTitleValue] = useState(defaultTitle)
  const [urlValue, setUrlValue] = useState(defaultUrl)

  function handleSave() {
    if (!titleValue.trim()) return
    onConfirm({ title: titleValue.trim(), url: showUrl ? urlValue.trim() : undefined })
    onCancel()
  }

  return (
    <>
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
        <Button variant="outline" size="sm" onClick={onCancel}>
          {t('cancelButton')}
        </Button>
        <Button size="sm" onClick={handleSave} disabled={!titleValue.trim()}>
          {t('saveButton')}
        </Button>
      </div>
    </>
  )
}
