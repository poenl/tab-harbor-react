import { useState, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import { useTheme } from '@/stores/theme'
import { THEME_PALETTES } from '@/constants/preferences'
import type { ThemePaletteId, ThemeMode } from '@/constants/preferences'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'

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
    <div className="flex flex-1 flex-wrap justify-end gap-[10px_14px]">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`min-h-auto cursor-pointer border-none bg-transparent p-0 text-xs font-semibold transition-colors duration-150 ${
            value === opt.key
              ? 'text-accent underline decoration-[color-mix(in_srgb,var(--accent)_68%,transparent)] decoration-1 underline-offset-[0.24em]'
              : 'hover:text-foreground text-[color-mix(in_srgb,var(--muted)_74%,var(--foreground)_26%)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function PaletteCard({
  paletteId,
  name,
  active,
  colors,
  onClick
}: {
  paletteId: string
  name: string
  active: boolean
  colors: { paper: string; accent: string }
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-[14px] border px-2.5 py-1.5 transition-all duration-150 ${
        active
          ? 'border-accent/30 bg-accent/10'
          : 'border-border hover:border-accent/20 hover:-translate-y-px'
      }`}
    >
      <span
        className="ring-border/30 h-3.5 w-6 shrink-0 rounded-full ring-1 ring-inset"
        style={{ background: `linear-gradient(90deg, ${colors.paper} 50%, ${colors.accent} 50%)` }}
      />
      <span className="text-foreground text-xs font-semibold whitespace-nowrap">{name}</span>
      <span
        className={`ml-auto flex size-3.5 shrink-0 items-center justify-center rounded-full border transition-all duration-150 ${
          active ? 'bg-accent/10 border-accent/30 text-accent' : 'border-border text-transparent'
        }`}
      >
        <Check strokeWidth={3} className="size-2" />
      </span>
    </button>
  )
}

const PALETTE_COLORS: Record<ThemePaletteId, { paper: string; accent: string }> = {
  paper: { paper: '#f8f5f0', accent: '#c8713a' },
  sage: { paper: '#eef2eb', accent: '#8b7146' },
  mist: { paper: '#eef2f5', accent: '#927255' },
  blush: { paper: '#f6efec', accent: '#a06d4f' }
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
          <Label className="text-muted-foreground pt-1 pl-0.5 text-xs font-bold tracking-[0.16em] uppercase">
            {t('appearanceMode')}
          </Label>
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
        <Separator className="my-3.5" />

        <Label className="text-muted-foreground pt-1 pl-0.5 text-xs font-bold tracking-[0.16em] uppercase">
          {t('deskPalette')}
        </Label>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-2">
          {(Object.entries(THEME_PALETTES) as [ThemePaletteId, { name: string }][]).map(
            ([id, palette]) => (
              <PaletteCard
                key={id}
                paletteId={id}
                name={palette.name}
                active={preferences.paletteId === id}
                colors={PALETTE_COLORS[id]}
                onClick={() => updatePreferences({ paletteId: id })}
              />
            )
          )}
        </div>
      </div>

      {/* ── 桌面背景 ── */}
      <div className="theme-menu-section">
        <Separator className="my-3.5" />

        <Label className="text-muted-foreground pt-1 pl-0.5 text-xs font-bold tracking-[0.16em] uppercase">
          {t('deskBackdrop')}
        </Label>
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
            className="text-muted-foreground hover:text-foreground flex-1"
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
        <Separator className="my-3.5" />

        <div className="flex items-center justify-between gap-2.5">
          <Label className="text-muted-foreground pt-1 pl-0.5 text-xs font-bold tracking-[0.16em] uppercase">
            {t('languageLabel')}
          </Label>
          <div className="flex flex-1 flex-wrap justify-end gap-[10px_14px]">
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
                className={`min-h-auto cursor-pointer border-none bg-transparent p-0 text-xs font-semibold transition-colors duration-150 ${
                  currentLang === lang.key
                    ? 'text-accent underline decoration-[color-mix(in_srgb,var(--accent)_68%,transparent)] decoration-1 underline-offset-[0.24em]'
                    : 'hover:text-foreground text-[color-mix(in_srgb,var(--muted)_74%,var(--foreground)_26%)]'
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
        <Separator className="my-3.5" />

        <div className="flex items-center justify-between gap-2.5">
          <Label className="text-muted-foreground pt-1 pl-0.5 text-xs font-bold tracking-[0.16em] uppercase">
            {t('surfaceOpacity')}
          </Label>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Slider
              value={[preferences.surfaceOpacity]}
              onValueChange={([v]) =>
                updatePreferences({ surfaceOpacity: Math.min(100, Math.max(0, v)) })
              }
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-foreground min-w-7.5 text-right text-xs font-semibold">
              {preferences.surfaceOpacity}%
            </span>
          </div>
        </div>
      </div>

      {/* ── 文字大小 ── */}
      <div className="theme-menu-section">
        <Separator className="my-3.5" />

        <div className="flex items-center justify-between gap-2.5">
          <Label className="text-muted-foreground pt-1 pl-0.5 text-xs font-bold tracking-[0.16em] uppercase">
            {t('uiScaleLabel')}
          </Label>
          <div className="flex flex-1 items-center justify-end gap-2">
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
            <span className="text-foreground min-w-7.5 text-right text-xs font-semibold">
              {preferences.uiScale}%
            </span>
          </div>
        </div>
      </div>

      {/* ── 快捷键大小 ── */}
      <div className="theme-menu-section">
        <Separator className="my-3.5" />

        <div className="flex items-center justify-between gap-2.5">
          <Label className="text-muted-foreground pt-1 pl-0.5 text-xs font-bold tracking-[0.16em] uppercase">
            {t('shortcutScaleLabel')}
          </Label>
          <div className="flex flex-1 items-center justify-end gap-2">
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
            <span className="text-foreground min-w-7.5 text-right text-xs font-semibold">
              {preferences.shortcutScale}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
