import { useEffect, useState } from 'react'
import { type DomainGroup, normalizeTab, buildDomainGroups } from '@/newtab/utils/domain-grouping.ts'

export function useOpenTabs() {
  const [groups, setGroups] = useState<DomainGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTabs() {
      try {
        const result = await browser.tabs.query({})
        setGroups(buildDomainGroups(result.map(normalizeTab)))
      } catch {
        setGroups([])
      } finally {
        setLoading(false)
      }
    }

    fetchTabs()

    const handler = (message: { action?: string }) => {
      if (message.action === 'tabs-changed') fetchTabs()
    }

    browser.runtime.onMessage.addListener(handler)
    return () => browser.runtime.onMessage.removeListener(handler)
  }, [])

  return { groups, loading }
}
