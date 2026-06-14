import { useTranslation } from '@/i18n'

export function SavedSessionEmpty() {
  const { t } = useTranslation()

  return (
    // ── 无已保存标签页 ──
    <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
      <p className="font-serif text-xl italic font-normal text-foreground m-0">
        {t('sessionPickerNoSavedSessions')}
      </p>
      <p className="text-sm text-muted-foreground m-0">
        {t('emptySessionSubtitle')}
      </p>
    </div>
  )
}
