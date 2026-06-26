import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { AppearancePanel } from '@/components/settings/AppearancePanel'
import { FeaturesPanel } from '@/components/settings/FeaturesPanel'

export function SettingsDropdown() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'appearance' | 'features'>('appearance')

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              aria-label={t('deskSettings')}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/10 data-[state=open]:text-accent data-[state=open]:bg-accent/10 cursor-pointer rounded-full border-none bg-transparent p-1 transition-colors duration-150"
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
                className="size-4.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 7.5h15m-12 4.5h9m-6 4.5h3"
                />
                <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="16.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="10.5" cy="16.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">{t('deskSettings')}</TooltipContent>
      </Tooltip>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={10}
        className="border-border w-80 rounded-2xl border bg-transparent p-4 shadow-lg ring-0 backdrop-blur-xl data-closed:animate-none data-open:animate-none"
        style={
          {
            backgroundColor:
              'color-mix(in srgb, var(--card) calc(40% + var(--custom-surface-opacity, 50%) * 0.6), transparent)'
          } as React.CSSProperties
        }
      >
        {/* ── 标签栏 ── */}
        <div className="border-border/18 mb-4 flex items-center gap-4.5 border-b pb-2.5">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`cursor-pointer border-none bg-transparent p-0 pb-0.75 text-xs font-bold transition-colors duration-150 ${
              activeTab === 'appearance'
                ? 'text-accent underline decoration-[color-mix(in_srgb,var(--accent)_68%,transparent)] decoration-1 underline-offset-[0.28em]'
                : 'hover:text-foreground text-[color-mix(in_srgb,var(--muted)_74%,var(--foreground)_26%)]'
            }`}
          >
            {t('settingsTabAppearance')}
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`cursor-pointer border-none bg-transparent p-0 pb-0.75 text-xs font-bold transition-colors duration-150 ${
              activeTab === 'features'
                ? 'text-accent underline decoration-[color-mix(in_srgb,var(--accent)_68%,transparent)] decoration-1 underline-offset-[0.28em]'
                : 'hover:text-foreground text-[color-mix(in_srgb,var(--muted)_74%,var(--foreground)_26%)]'
            }`}
          >
            {t('settingsTabFeatures')}
          </button>
        </div>

        {activeTab === 'appearance' ? <AppearancePanel /> : <FeaturesPanel />}
      </PopoverContent>
    </Popover>
  )
}
