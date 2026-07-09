import { useTranslation } from '@/i18n'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AppearancePanel } from '@/components/settings/AppearancePanel'
import { FeaturesPanel } from '@/components/settings/FeaturesPanel'

export function SettingsDropdown() {
  const { t } = useTranslation()

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
        className="border-border w-80 rounded-2xl border p-4 shadow-lg ring-0 blur-bg"
      >
        <Tabs defaultValue="appearance" className="flex flex-col">
          {/* ── 标签栏 ── */}
          <TabsList
            variant="line"
            className="border-border/18 mb-4 justify-start gap-4.5 border-b pb-2.5 h-auto"
          >
            <TabsTrigger
              value="appearance"
              className="cursor-pointer border-none bg-transparent p-0 pb-0.75 text-xs font-bold data-active:bg-transparent data-active:text-accent data-active:shadow-none data-[state=inactive]:text-[color-mix(in_srgb,var(--muted)_74%,var(--foreground)_26%)] hover:text-foreground after:bg-accent after:inset-x-0 after:-bottom-1.25 after:h-0.5 after:opacity-0 data-active:after:opacity-100"
            >
              {t('settingsTabAppearance')}
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="cursor-pointer border-none bg-transparent p-0 pb-0.75 text-xs font-bold data-active:bg-transparent data-active:text-accent data-active:shadow-none data-[state=inactive]:text-[color-mix(in_srgb,var(--muted)_74%,var(--foreground)_26%)] hover:text-foreground after:bg-accent after:inset-x-0 after:-bottom-1.25 after:h-0.5 after:opacity-0 data-active:after:opacity-100"
            >
              {t('settingsTabFeatures')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="flex-none">
            <AppearancePanel />
          </TabsContent>
          <TabsContent value="features" className="flex-none">
            <FeaturesPanel />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
