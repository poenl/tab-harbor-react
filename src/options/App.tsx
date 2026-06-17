import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { AppearancePanel } from './AppearancePanel'
import { FeaturesPanel } from './FeaturesPanel'

function OptionsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'appearance' | 'features'>('appearance')

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased p-6">
      <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl p-6 shadow-lg space-y-6">
        <h1 className="text-lg font-semibold">{t('deskSettings')}</h1>

        {/* ── 标签栏 ── */}
        <div className="flex items-center gap-4.5 pb-2.5 border-b border-border/20">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`border-none bg-transparent p-0 pb-0.5 text-xs font-bold cursor-pointer transition-colors duration-150 ${
              activeTab === 'appearance'
                ? 'text-accent underline decoration-[color-mix(in_srgb,var(--accent)_68%,transparent)] underline-offset-[0.28em] decoration-1'
                : 'text-[color-mix(in_srgb,var(--muted)_74%,var(--foreground)_26%)] hover:text-foreground'
            }`}
          >
            {t('settingsTabAppearance')}
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`border-none bg-transparent p-0 pb-0.5 text-xs font-bold cursor-pointer transition-colors duration-150 ${
              activeTab === 'features'
                ? 'text-accent underline decoration-[color-mix(in_srgb,var(--accent)_68%,transparent)] underline-offset-[0.28em] decoration-1'
                : 'text-[color-mix(in_srgb,var(--muted)_74%,var(--foreground)_26%)] hover:text-foreground'
            }`}
          >
            {t('settingsTabFeatures')}
          </button>
        </div>

        {activeTab === 'appearance' && <AppearancePanel />}
        {activeTab === 'features' && <FeaturesPanel />}
      </div>
    </div>
  )
}

export default OptionsPage
