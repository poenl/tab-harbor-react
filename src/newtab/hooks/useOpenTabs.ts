import { useCallback, useEffect, useState } from 'react'
import {
  type DomainGroup,
  normalizeTab,
  buildDomainGroups
} from '@/newtab/utils/domain-grouping.ts'
import { useTheme } from '@/stores/theme'

export function useOpenTabs() {
  const { preferences } = useTheme()
  const [groups, setGroups] = useState<DomainGroup[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTabs = useCallback(async () => {
    try {
      const query = preferences.tabScope === 'all-windows' ? {} : { currentWindow: true }
      const result = await browser.tabs.query(query)
      setGroups(buildDomainGroups(result.map(normalizeTab)))
    } catch {
      setGroups([])
    } finally {
      setLoading(false)
    }
  }, [preferences.tabScope])

  useEffect(() => {
    fetchTabs()

    browser.tabs.onCreated.addListener(fetchTabs)
    browser.tabs.onRemoved.addListener(fetchTabs)
    browser.tabs.onUpdated.addListener(fetchTabs)
    browser.tabs.onAttached.addListener(fetchTabs)
    browser.tabs.onDetached.addListener(fetchTabs)

    return () => {
      browser.tabs.onCreated.removeListener(fetchTabs)
      browser.tabs.onRemoved.removeListener(fetchTabs)
      browser.tabs.onUpdated.removeListener(fetchTabs)
      browser.tabs.onAttached.removeListener(fetchTabs)
      browser.tabs.onDetached.removeListener(fetchTabs)
    }
  }, [fetchTabs])

  return { groups, loading, refresh: fetchTabs }
}
