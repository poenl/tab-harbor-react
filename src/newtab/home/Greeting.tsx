import { useTranslation } from '@/i18n'
import { getGreeting, getDateDisplay } from '@/newtab/utils/time.ts'

const GREETING_KEY: Record<
  'Good morning' | 'Good afternoon' | 'Good evening',
  'greetingMorning' | 'greetingAfternoon' | 'greetingEvening'
> = {
  'Good morning': 'greetingMorning',
  'Good afternoon': 'greetingAfternoon',
  'Good evening': 'greetingEvening'
}

export function Greeting() {
  const { t } = useTranslation()
  const greeting = getGreeting()

  return (
    // ── 问候语 + 日期 ──
    <div className="animate-in fade-in-0 duration-700 fill-mode-both">
      <h1 className="text-foreground m-0 font-serif text-4xl leading-none font-normal tracking-[-0.02em] whitespace-nowrap">
        {t(GREETING_KEY[greeting])}
      </h1>
      <div className="text-muted-foreground mt-4.5 text-xs leading-none font-semibold tracking-[0.18em] uppercase">
        {getDateDisplay()}
      </div>
    </div>
  )
}
