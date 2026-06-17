import { browser } from 'wxt/browser'
import type { TabScope } from '@/constants/preferences'

export function getTabQuery(tabScope: TabScope): { currentWindow?: boolean } {
  return tabScope === 'all-windows' ? {} : { currentWindow: true }
}

export async function discardTabs(tabIds: number[]): Promise<number> {
  let count = 0
  for (const id of tabIds) {
    try {
      await browser.tabs.discard(id)
      count++
    } catch {}
  }
  return count
}
