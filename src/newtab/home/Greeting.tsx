import { useTranslation } from '@/i18n'
import { getGreeting, getDateDisplay } from '@/newtab/utils/domain-grouping.ts'

const GREETING_KEY: Record<string, string> = {
  'Good morning': 'greetingMorning',
  'Good afternoon': 'greetingAfternoon',
  'Good evening': 'greetingEvening'
}

export function Greeting() {
  const { t } = useTranslation()
  const greeting = getGreeting()

  return (
    // ── 问候语 + 日期 ──
    <div>
      <h1 className="font-serif text-[40px] font-normal tracking-[-0.02em] leading-none text-foreground whitespace-nowrap m-0">
        {t(GREETING_KEY[greeting] as any)}
      </h1>
      <div className="text-[10px] font-semibold tracking-[0.18em] uppercase leading-none text-muted-foreground mt-[18px]">
        {getDateDisplay()}
      </div>
    </div>
  )
}
