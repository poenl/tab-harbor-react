import { useTranslation } from '@/i18n'

interface FooterProps {
  totalTabs: number
}

export function Footer({ totalTabs }: FooterProps) {
  const { t } = useTranslation()

  return (
    // ── 页脚：标签总数 + 版权信息 ──
    <footer className="border-border mt-auto flex flex-wrap items-end justify-between gap-4 border-t pt-5 pb-12 max-[960px]:mt-8">
      <div className="flex flex-col gap-1">
        <div className="text-foreground font-serif text-3xl leading-none font-light">
          {totalTabs}
        </div>
        <div className="text-muted-foreground text-xs tracking-[1.5px] uppercase">
          {t('openTabsSectionTitle')}
        </div>
      </div>
      <div className="text-muted-foreground text-xs">
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
