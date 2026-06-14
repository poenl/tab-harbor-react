import { useTranslation } from '@/i18n'

export function EmptyState() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-3 py-14 animate-[fadeUp_0.5s_ease_both]">
      <p className="font-display text-[20px] italic -tracking-[0.3px] text-ink">
        {t('emptyTitle')}
      </p>
      <p className="text-[13px] tracking-[0.3px] text-muted-text">
        {t('emptySubtitle')}
      </p>
    </div>
  )
}
