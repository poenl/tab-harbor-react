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
              className="p-1 rounded-full border-none bg-transparent cursor-pointer transition-colors duration-150 text-muted-foreground hover:text-foreground hover:bg-accent/10 data-[state=open]:text-accent data-[state=open]:bg-accent/10"
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
        className="w-80 backdrop-blur-xl border border-border rounded-2xl shadow-lg p-4 bg-transparent ring-0 data-open:animate-none data-closed:animate-none"
        style={
          {
            backgroundColor:
              'color-mix(in srgb, var(--card) calc(40% + var(--custom-surface-opacity, 50%) * 0.6), transparent)'
          } as React.CSSProperties
        }
      >
        {/* ── 标签栏 ── */}
        <div className="flex items-center gap-4.5 pb-2.5 mb-4 border-b border-border/18">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`border-none bg-transparent p-0 pb-0.75 text-xs font-bold cursor-pointer transition-colors duration-150 ${
              activeTab === 'appearance'
                ? 'text-accent underline decoration-[color-mix(in_srgb,var(--accent)_68%,transparent)] underline-offset-[0.28em] decoration-1'
                : 'text-[color-mix(in_srgb,var(--muted)_74%,var(--foreground)_26%)] hover:text-foreground'
            }`}
          >
            {t('settingsTabAppearance')}
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`border-none bg-transparent p-0 pb-0.75 text-xs font-bold cursor-pointer transition-colors duration-150 ${
              activeTab === 'features'
                ? 'text-accent underline decoration-[color-mix(in_srgb,var(--accent)_68%,transparent)] underline-offset-[0.28em] decoration-1'
                : 'text-[color-mix(in_srgb,var(--muted)_74%,var(--foreground)_26%)] hover:text-foreground'
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
