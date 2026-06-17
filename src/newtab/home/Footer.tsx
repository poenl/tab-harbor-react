import { useTranslation } from '@/i18n'

interface FooterProps {
  totalTabs: number
}

export function Footer({ totalTabs }: FooterProps) {
  const { t } = useTranslation()

  return (
    // ── 页脚：标签总数 + 版权信息 ──
    <footer className="flex justify-between items-end gap-4 flex-wrap pb-12 pt-5 border-t border-border max-[960px]:mt-8 mt-auto">
      <div className="flex flex-col gap-1">
        <div className="font-serif text-3xl font-light text-foreground leading-none">
          {totalTabs}
        </div>
        <div className="text-xs uppercase tracking-[1.5px] text-muted-foreground">
          {t('openTabsSectionTitle')}
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        <span>
          <a
            href="https://github.com/V-IOLE-T/tab-harbor"
            target="_blank"
            className="text-primary no-underline hover:underline"
          >
            Tab Harbor
          </a>{' '}
          {t('byAuthor')}{' '}
          <a
            href="https://github.com/V-IOLE-T"
            target="_blank"
            className="text-primary no-underline hover:underline"
          >
            OO
          </a>
        </span>
      </div>
    </footer>
  )
}
