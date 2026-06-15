import { useState, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { playCloseSound } from '@/newtab/utils/sound'

export function TabOutDupeBanner() {
  const { t } = useTranslation()
  const [tabOutCount, setTabOutCount] = useState(0)

  useEffect(() => {
    async function check() {
      const extensionUrl = browser.runtime.getURL('/newtab.html')
      const allTabs = await browser.tabs.query({ currentWindow: true })
      const count = allTabs.filter(
        (tab) => tab.url === extensionUrl || tab.url === 'chrome://newtab/'
      ).length
      setTabOutCount(count)
    }
    check()
  }, [])

  async function handleCloseExtras() {
    const extensionUrl = browser.runtime.getURL('/newtab.html')
    const currentWindow = await browser.windows.getCurrent()
    const allTabs = await browser.tabs.query({ currentWindow: true })
    const tabOutTabs = allTabs.filter(
      (tab) => tab.url === extensionUrl || tab.url === 'chrome://newtab/'
    )
    if (tabOutTabs.length <= 1) return
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
    setTabOutCount(1)
  }

  if (tabOutCount <= 1) return null

  return (
    // ── 多余 Tab Harbor 标签页横幅 ──
    <div className="flex items-center justify-between gap-3 bg-accent/5 border border-accent/15 rounded-xl px-5 py-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
          <Copy strokeWidth={1.5} className="size-4.5 text-accent shrink-0" />
        </div>
        <span className="text-sm text-foreground leading-normal">
          {t('tabOutDupeBannerText', { count: tabOutCount })}
        </span>
      </div>
      <Button
        variant="default"
        size="sm"
        onClick={handleCloseExtras}
        className="shrink-0 text-xs rounded-md min-h-9"
      >
        {t('tabOutDupeBannerCloseExtras')}
      </Button>
    </div>
  )
}
