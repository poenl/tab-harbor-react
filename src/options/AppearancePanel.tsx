import { useState, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import { useTheme } from '@/stores/theme'
import { THEME_PALETTES } from '@/constants/preferences'
import type { ThemePaletteId, ThemeMode } from '@/constants/preferences'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

export function SectionDivider() {
  return (
    <div className="border-t border-[color-mix(in_srgb,var(--accent)_18%,transparent)] mt-3.5 pt-3.5" />
  )
}

export function InlineSelect({
  options,
  value,
  onChange
}: {
  options: { key: string; label: string }[]
  value: string
  onChange: (key: string) => void
}) {
  return (
    <div className="flex flex-1 justify-end flex-wrap gap-[10px_14px]">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`border-none bg-transparent p-0 text-xs font-semibold cursor-pointer transition-colors duration-150 min-h-auto ${
            value === opt.key
              ? 'text-accent underline decoration-[color-mix(in_srgb,var(--accent)_68%,transparent)] underline-offset-[0.24em] decoration-1'
              : 'text-[color-mix(in_srgb,var(--muted)_74%,var(--foreground)_26%)] hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function ThemeLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.16em] pl-0.5 pt-1">
      {children}
    </span>
  )
}

function PaletteCard({
  paletteId,
  name,
  active,
  swatchColor,
  onClick
}: {
  paletteId: string
  name: string
  active: boolean
  swatchColor: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`border rounded-[14px] px-2.5 py-1.5 flex items-center gap-2 cursor-pointer transition-all duration-150 min-h-11 ${
        active
          ? 'border-accent/30 bg-accent/10'
          : 'border-border hover:border-accent/20 hover:-translate-y-px'
      }`}
    >
      <span
        className="w-6 h-3.5 rounded-full shrink-0 ring-1 ring-inset ring-border/30"
        style={{ background: swatchColor }}
      />
      <span className="text-xs font-semibold text-foreground whitespace-nowrap">{name}</span>
      <span
        className={`ml-auto size-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-150 ${
          active ? 'bg-accent/10 border-accent/30 text-accent' : 'border-border text-transparent'
        }`}
      >
        <Check strokeWidth={3} className="size-2" />
      </span>
    </button>
  )
}

const PALETTE_SWATCHES: Record<ThemePaletteId, string> = {
  paper: '#8a653f',
  sage: '#4f7657',
  mist: '#4f6d88',
  blush: '#a5656f'
}

export function AppearancePanel() {
  const { t } = useTranslation()
  const { preferences, updatePreferences } = useTheme()
  const [currentLang, setCurrentLang] = useState<string>('auto')

  useEffect(() => {
    browser.storage.local.get('languagePreference').then((result) => {
      const pref = result.languagePreference as string | undefined
      setCurrentLang(pref || 'auto')
    })
  }, [])

  return (
    <div className="flex flex-col gap-0">
      {/* ── 外观模式 ── */}
      <div className="theme-menu-section">
        <div className="flex items-center justify-between gap-2.5">
          <ThemeLabel>{t('appearanceMode')}</ThemeLabel>
          <InlineSelect
            options={[
              { key: 'system', label: t('themeModeSystem') },
              { key: 'light', label: t('themeModeLight') },
              { key: 'dark', label: t('themeModeDark') }
            ]}
            value={preferences.mode}
            onChange={(v) => updatePreferences({ mode: v as ThemeMode })}
          />
        </div>
      </div>

      {/* ── 桌面配色 ── */}
      <div className="theme-menu-section">
        <SectionDivider />

        <ThemeLabel>{t('deskPalette')}</ThemeLabel>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-2">
          {(Object.entries(THEME_PALETTES) as [ThemePaletteId, { name: string }][]).map(
            ([id, palette]) => (
              <PaletteCard
                key={id}
                paletteId={id}
                name={palette.name}
                active={preferences.paletteId === id}
                swatchColor={PALETTE_SWATCHES[id]}
                onClick={() => updatePreferences({ paletteId: id })}
              />
            )
          )}
        </div>
      </div>

      {/* ── 桌面背景 ── */}
      <div className="theme-menu-section">
        <SectionDivider />

        <ThemeLabel>{t('deskBackdrop')}</ThemeLabel>
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => document.getElementById('themeBackgroundInput')?.click()}
            className="flex-1"
          >
            {t('uploadImage')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updatePreferences({ customBackground: '' })}
            className="flex-1 text-muted-foreground hover:text-foreground"
          >
            {t('clearText')}
          </Button>
        </div>
        <input
          type="file"
          id="themeBackgroundInput"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = async () => {
              await updatePreferences({ customBackground: reader.result as string })
            }
            reader.readAsDataURL(file)
          }}
        />
      </div>

      {/* ── 语言 ── */}
      <div className="theme-menu-section">
        <SectionDivider />

        <div className="flex items-center justify-between gap-2.5">
          <ThemeLabel>{t('languageLabel')}</ThemeLabel>
          <div className="flex flex-1 justify-end flex-wrap gap-[10px_14px]">
            {[
              { key: 'auto', label: t('languageAuto') },
              { key: 'en', label: t('languageEnglish') },
              { key: 'zh-CN', label: t('languageChinese') }
            ].map((lang) => (
              <button
                key={lang.key}
                onClick={async () => {
                  const pref = lang.key === 'auto' ? '' : lang.key
                  await browser.storage.local.set({ languagePreference: pref })
                  window.location.reload()
                }}
                className={`border-none bg-transparent p-0 text-xs font-semibold cursor-pointer transition-colors duration-150 min-h-auto ${
                  currentLang === lang.key
                    ? 'text-accent underline decoration-[color-mix(in_srgb,var(--accent)_68%,transparent)] underline-offset-[0.24em] decoration-1'
                    : 'text-[color-mix(in_srgb,var(--muted)_74%,var(--foreground)_26%)] hover:text-foreground'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 透明度 ── */}
      <div className="theme-menu-section">
        <SectionDivider />

        <div className="flex items-center justify-between gap-2.5">
          <ThemeLabel>{t('surfaceDepth')}</ThemeLabel>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Slider
              value={[preferences.surfaceOpacity]}
              onValueChange={([v]) =>
                updatePreferences({ surfaceOpacity: Math.min(60, Math.max(2, v)) })
              }
              min={2}
              max={60}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-foreground font-semibold min-w-7.5 text-right">
              {preferences.surfaceOpacity}%
            </span>
          </div>
        </div>
      </div>

      {/* ── 文字大小 ── */}
      <div className="theme-menu-section">
        <SectionDivider />

        <div className="flex items-center justify-between gap-2.5">
          <ThemeLabel>{t('uiScaleLabel')}</ThemeLabel>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Slider
              value={[preferences.uiScale]}
              onValueChange={([v]) =>
                updatePreferences({ uiScale: Math.min(120, Math.max(100, v)) })
              }
              min={100}
              max={120}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-foreground font-semibold min-w-7.5 text-right">
              {preferences.uiScale}%
            </span>
          </div>
        </div>
      </div>

      {/* ── 快捷键大小 ── */}
      <div className="theme-menu-section">
        <SectionDivider />

        <div className="flex items-center justify-between gap-2.5">
          <ThemeLabel>{t('shortcutScaleLabel')}</ThemeLabel>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Slider
              value={[preferences.shortcutScale]}
              onValueChange={([v]) =>
                updatePreferences({ shortcutScale: Math.min(130, Math.max(100, v)) })
              }
              min={100}
              max={130}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-foreground font-semibold min-w-7.5 text-right">
              {preferences.shortcutScale}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
