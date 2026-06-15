import { closeDuplicateNewTabs } from '@/utils/close-duplicate-tabs'

async function notifyTabHarborPages(eventMeta: Record<string, unknown> = {}) {
  try {
    const extensionUrl = browser.runtime.getURL('/newtab.html')
    const allTabs = await browser.tabs.query({})
    const dashboardTabs = allTabs.filter(tab => {
      if (!tab.url) return false
      return (
        tab.url === extensionUrl ||
        (tab.url === 'chrome://newtab/' && tab.title === 'Tab Harbor')
      )
    })

    if (dashboardTabs.length === 0) return

    for (const tab of dashboardTabs) {
      if (!tab.id) continue
      try {
        await browser.tabs.sendMessage(tab.id, {
          action: 'tabs-changed',
          source: eventMeta.source || 'tabs.changed',
          triggerTabId: eventMeta.triggerTabId ?? null,
        })
      } catch {}
    }
  } catch {}
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.action.setBadgeText({ text: '' })
  })

  browser.runtime.onStartup.addListener(() => {
    browser.action.setBadgeText({ text: '' })
  })

  browser.tabs.onCreated.addListener(tab => {
    browser.action.setBadgeText({ text: '' })
    notifyTabHarborPages({ source: 'tabs.onCreated', triggerTabId: tab?.id })
    closeDuplicateNewTabs()
  })

  browser.tabs.onRemoved.addListener(tabId => {
    browser.action.setBadgeText({ text: '' })
    notifyTabHarborPages({ source: 'tabs.onRemoved', triggerTabId: tabId })
  })

  browser.tabs.onUpdated.addListener(tabId => {
    browser.action.setBadgeText({ text: '' })
    notifyTabHarborPages({ source: 'tabs.onUpdated', triggerTabId: tabId })
  })

  browser.action.setBadgeText({ text: '' })
})
