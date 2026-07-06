import { useTranslation } from '@/i18n'

export function SavedSessionEmpty() {
  const { t } = useTranslation()

  return (
    // ── 无已保存标签页 ──
    <div className="animate-in fade-in-0 duration-700 fill-mode-both flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <p className="text-foreground m-0 font-serif text-xl font-normal italic">
        {t('sessionPickerNoSavedSessions')}
      </p>
      <p className="text-muted-foreground m-0 text-sm">{t('emptySessionSubtitle')}</p>
    </div>
  )
}
