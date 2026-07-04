import i18n from '@/i18n'

// 标准化的标签页数据
export interface OpenTab {
  id: number
  url: string
  title: string
  favIconUrl: string
  windowId: number
  active: boolean
  discarded: boolean
  pinned: boolean
}

// 按域名分组后的集合
export interface DomainGroup {
  domain: string
  label?: string
  tabs: OpenTab[]
  isManual?: boolean
}

// 将 hostname 转为可读标签
function friendlyDomain(hostname: string): string {
  if (!hostname) return ''

  if (hostname.endsWith('.substack.com') && hostname !== 'substack.com') {
    const name = hostname.replace('.substack.com', '')
    return name.charAt(0).toUpperCase() + name.slice(1) + "'s Substack"
  }
  if (hostname.endsWith('.github.io')) {
    const name = hostname.replace('.github.io', '')
    return name.charAt(0).toUpperCase() + name.slice(1) + ' (GitHub Pages)'
  }

  const clean = hostname
    .replace(/^www\./, '')
    .replace(/\.(co\.uk|co\.jp|com|org|net|io|co|ai|dev|app|so|me|xyz|info|us|uk)$/, '')

  return clean
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

interface ChromeTab {
  id?: number
  url?: string
  title?: string
  favIconUrl?: string
  windowId?: number
  active?: boolean
  discarded?: boolean
  pinned?: boolean
}

// 提取主域名（处理 .co.uk 等双段 TLD）
function getPrimaryDomain(hostname: string): string {
  const parts = hostname.split('.')
  if (parts.length <= 2) return hostname
  const knownTwoPartTLDs = new Set(['co.uk', 'co.jp', 'com.au', 'org.uk', 'ac.uk'])
  const lastTwo = parts.slice(-2).join('.')
  if (knownTwoPartTLDs.has(lastTwo)) {
    return parts.slice(-3).join('.')
  }
  return parts.slice(-2).join('.')
}

// 补全标签页缺失字段
export function normalizeTab(t: ChromeTab): OpenTab {
  return {
    id: t.id ?? 0,
    url: t.url || '',
    title: t.title || '',
    favIconUrl: t.favIconUrl || '',
    windowId: t.windowId ?? 0,
    active: t.active ?? false,
    discarded: t.discarded ?? false,
    pinned: t.pinned ?? false
  }
}

// 按主域名分组，组间按浏览器标签栏顺序排列
export function buildDomainGroups(tabs: OpenTab[]): DomainGroup[] {
  const seen = new Set<number>()
  const realTabs = tabs.filter((t) => {
    if (t.id == null || seen.has(t.id)) return false
    seen.add(t.id)
    return true
  })

  const groupMap: Record<string, DomainGroup> = {}
  const domainOrder = new Map<string, number>()
  let orderIdx = 0

  for (const tab of realTabs) {
    try {
      let hostname: string
      if (
        tab.url.startsWith('file://') ||
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('about:') ||
        tab.url.startsWith('edge://') ||
        tab.url.startsWith('brave://')
      ) {
        hostname = 'internal'
        if (!groupMap[hostname]) {
          groupMap[hostname] = { domain: hostname, tabs: [], label: i18n.t('internalPagesLabel') }
          domainOrder.set(hostname, orderIdx++)
        }
        groupMap[hostname].tabs.push(tab)
        continue
      } else {
        hostname = getPrimaryDomain(new URL(tab.url).hostname)
      }

      if (!groupMap[hostname]) {
        groupMap[hostname] = { domain: hostname, tabs: [] }
        domainOrder.set(hostname, orderIdx++)
      }
      groupMap[hostname].tabs.push(tab)
    } catch {
      // skip malformed URLs
    }
  }

  const groups = Object.values(groupMap).sort(
    (a, b) => (domainOrder.get(a.domain) ?? 0) - (domainOrder.get(b.domain) ?? 0)
  )

  for (const group of groups) {
    if (!group.label) {
      group.label = friendlyDomain(group.domain)
    }
  }

  return groups
}
