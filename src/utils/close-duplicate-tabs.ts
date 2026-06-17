import { STORAGE_KEYS } from '@/constants/storage-keys'

function getNewTabUrls() {
  return new Set([browser.runtime.getURL('/newtab.html')])
}

function isNewTabBlank(
  tab: { url?: string; pendingUrl?: string; status?: string },
  newTabUrls: Set<string>
): boolean {
  const url = tab?.url || ''
  const pendingUrl = tab?.pendingUrl || ''
  if (pendingUrl && !newTabUrls.has(pendingUrl) && pendingUrl !== 'chrome://newtab/') {
    return false
  }
  return (
    url === 'chrome://newtab/' ||
    newTabUrls.has(url) ||
    pendingUrl === 'chrome://newtab/' ||
    newTabUrls.has(pendingUrl) ||
    url === '' ||
    (tab.status === 'loading' && !url)
  )
}

export async function closeDuplicateNewTabs(): Promise<number> {
  try {
    const stored = await browser.storage.local.get(STORAGE_KEYS.THEME_PREFERENCES)
    const prefs = stored[STORAGE_KEYS.THEME_PREFERENCES] as Record<string, unknown> | undefined
    if (prefs?.closeDuplicateNewTabsEnabled !== true) return 0

    const newTabUrls = getNewTabUrls()
    const allTabs = await browser.tabs.query({})
    const blankTabs = allTabs.filter((tab) => isNewTabBlank(tab, newTabUrls))

    if (blankTabs.length <= 1) return 0

    const activeTab = blankTabs.find((tab) => tab.active)
    const toKeep = activeTab || blankTabs.reduce((a, b) => ((a.id ?? 0) > (b.id ?? 0) ? a : b))
    const toClose = blankTabs.filter((tab) => tab.id !== toKeep.id).map((tab) => tab.id!)

    if (toClose.length > 0) await browser.tabs.remove(toClose)
    return toClose.length
  } catch (err) {
    console.warn('[tab-harbor] closeDuplicateNewTabs error:', err)
    return 0
  }
}
