import { useTranslation } from '@/i18n'
import { useOpenTabsStore } from '@/stores/openTabs'
import { useThemeStore } from '@/stores/theme'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { playCloseSound } from '@/newtab/utils/sound'

export function TabOutDupeBanner() {
  const { t } = useTranslation()
  const tabOutCount = useOpenTabsStore(
    (s) => s.allTabs.filter((t) => t.url === s.newTabUrl && t.status !== 'loading').length
  )

  async function handleCloseExtras() {
    const count = await useOpenTabsStore.getState().closeDuplicateExtras()
    if (count > 0) {
      playCloseSound()
      toast(t('toastClosedExtraTabHarborTabs'))
    }
  }

  const autoClose = useThemeStore((s) => s.preferences.closeDuplicateNewTabsEnabled)

  // 自动关闭开启时横幅是冗余的手动入口，且会在自动关闭完成前闪现，直接不渲染
  if (autoClose || tabOutCount <= 1) return null

  return (
    // ── 多余 Tab Harbor 标签页横幅 ──
    <div className="animate-in fade-in-0 slide-in-from-top-2 bg-accent/5 border-accent/15 mb-4 flex items-center justify-between gap-3 rounded-xl border px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="bg-accent/10 flex size-9 shrink-0 items-center justify-center rounded-full">
          <Copy strokeWidth={1.5} className="text-accent size-4.5 shrink-0" />
        </div>
        <span className="text-foreground text-sm leading-normal">
          {t('tabOutDupeBannerText', { count: tabOutCount })}
        </span>
      </div>
      <Button
        variant="default"
        size="sm"
        onClick={handleCloseExtras}
        className="min-h-9 shrink-0 rounded-md text-xs"
      >
        {t('tabOutDupeBannerCloseExtras')}
      </Button>
    </div>
  )
}
