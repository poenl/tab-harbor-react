import { useTranslation } from '@/i18n'
import { useOpenTabsStore } from '@/stores/openTabs'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { playCloseSound } from '@/newtab/utils/sound'

export function TabOutDupeBanner() {
  const { t } = useTranslation()
  const tabOutCount = useOpenTabsStore((s) => s.tabOutCount)

  async function handleCloseExtras() {
    const { rawTabs } = useOpenTabsStore.getState()
    const extensionUrl = browser.runtime.getURL('/newtab.html')
    const tabOutTabs = rawTabs.filter(
      (tab) => tab.url === extensionUrl || tab.url === 'chrome://newtab/'
    )
    if (tabOutTabs.length <= 1) return
    const currentWindow = await browser.windows.getCurrent()
    const keep =
      tabOutTabs.find((t) => t.active && t.windowId === currentWindow.id) ||
      tabOutTabs.find((t) => t.active) ||
      tabOutTabs[0]
    const toClose = tabOutTabs.filter((t) => t.id !== keep.id).map((t) => t.id!)
    if (toClose.length > 0) {
      await browser.tabs.remove(toClose)
      playCloseSound()
    }
    toast(t('toastClosedExtraTabHarborTabs'))
  }

  if (tabOutCount <= 1) return null

  return (
    // ── 多余 Tab Harbor 标签页横幅 ──
    <div className="bg-accent/5 border-accent/15 mb-4 flex items-center justify-between gap-3 rounded-xl border px-5 py-4">
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
