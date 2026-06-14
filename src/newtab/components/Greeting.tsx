import { useTranslation } from '@/i18n'
import { getGreeting, getDateDisplay } from '@/newtab/utils/domain-grouping.ts'

const GREETING_KEY: Record<string, string> = {
  'Good morning': 'greetingMorning',
  'Good afternoon': 'greetingAfternoon',
  'Good evening': 'greetingEvening',
}

export function Greeting() {
  const { t } = useTranslation()
  const greeting = getGreeting()

  return (
    <div className="header-title-row">
      <h1 className="font-display text-[40px] leading-none -tracking-[0.02em] text-ink whitespace-nowrap">
        {t(GREETING_KEY[greeting] as any)}
      </h1>
      <div className="font-sans text-[10px] font-semibold tracking-[0.18em] text-workspace-chip-text uppercase whitespace-nowrap leading-none translate-y-px">
        {getDateDisplay()}
      </div>
    </div>
  )
}
