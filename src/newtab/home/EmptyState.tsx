import { useTranslation } from '@/i18n'

export function EmptyState() {
  const { t } = useTranslation()

  return (
    // ── 空白状态（没有打开的标签页时显示） ──
    <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
      <p className="font-serif text-xl italic font-normal text-foreground m-0">{t('emptyTitle')}</p>
      <p className="text-sm text-muted-foreground m-0">{t('emptySubtitle')}</p>
    </div>
  )
}
