import { useTranslation } from '@/i18n'

export function EmptyState() {
  const { t } = useTranslation()

  return (
    // ── 空白状态（没有打开的标签页时显示） ──
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <p className="text-foreground m-0 font-serif text-xl font-normal italic">{t('emptyTitle')}</p>
      <p className="text-muted-foreground m-0 text-sm">{t('emptySubtitle')}</p>
    </div>
  )
}
