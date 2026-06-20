import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { AppearancePanel } from '@/components/settings/AppearancePanel'
import { FeaturesPanel } from '@/components/settings/FeaturesPanel'

export function SettingsDropdown() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'appearance' | 'features'>('appearance')
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <>
      {/* ── 设置触发按钮 ── */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={triggerRef}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={t('deskSettings')}
            className={`p-1 rounded-full border-none bg-transparent cursor-pointer transition-colors duration-150 ${
              open
                ? 'text-accent bg-accent/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
            }`}
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
        </TooltipTrigger>
        <TooltipContent side="top">{t('deskSettings')}</TooltipContent>
      </Tooltip>

      {/* ── 设置下拉面板 ── */}
      {open && (
        <div
          ref={panelRef}
          className="absolute top-full right-0 mt-2.5 w-80 backdrop-blur-xl border border-border rounded-2xl shadow-lg p-4 z-30"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--card) calc(40% + var(--custom-surface-opacity, 50%) * 0.6), transparent)'
          }}
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
        </div>
      )}
    </>
  )
}
