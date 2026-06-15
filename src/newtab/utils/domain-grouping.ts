export interface OpenTab {
  id: number
  url: string
  title: string
  favIconUrl: string
  windowId: number
  active: boolean
  discarded: boolean
}

export interface DomainGroup {
  domain: string
  label?: string
  tabs: OpenTab[]
  isManual?: boolean
}

const FRIENDLY_DOMAINS: Record<string, string> = {
  'github.com': 'GitHub',
  'mail.google.com': 'Gmail',
  'x.com': 'X',
  'twitter.com': 'X',
  'www.youtube.com': 'YouTube',
  'www.linkedin.com': 'LinkedIn',
  'www.reddit.com': 'Reddit',
  'news.ycombinator.com': 'Hacker News',
  'stackoverflow.com': 'Stack Overflow',
  'discord.com': 'Discord',
  'chatgpt.com': 'ChatGPT',
  'chat.openai.com': 'ChatGPT',
  'claude.ai': 'Claude',
  'notion.so': 'Notion',
  'linear.app': 'Linear',
  'figma.com': 'Figma',
  'vercel.com': 'Vercel',
  'netlify.com': 'Netlify',
  'medium.com': 'Medium',
  'dev.to': 'Dev.to',
  'dribbble.com': 'Dribbble',
  'npmjs.com': 'npm',
  'docs.google.com': 'Google Docs',
  'drive.google.com': 'Google Drive',
  'meet.google.com': 'Google Meet',
  'calendar.google.com': 'Google Calendar',
  'slack.com': 'Slack',
  'trello.com': 'Trello',
  'miro.com': 'Miro',
  'codepen.io': 'CodePen',
  'codesandbox.io': 'CodeSandbox',
  'observablehq.com': 'Observable',
  'wikipedia.org': 'Wikipedia'
}

function friendlyDomain(hostname: string): string {
  if (!hostname) return ''

  if (FRIENDLY_DOMAINS[hostname]) return FRIENDLY_DOMAINS[hostname]

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

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const WEEKDAYS = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
] as const
const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC'
] as const

export function getDateDisplay(): string {
  const d = new Date()
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

interface ChromeTab {
  id?: number
  url?: string
  title?: string
  favIconUrl?: string
  windowId?: number
  active?: boolean
  discarded?: boolean
}

interface LandingPattern {
  hostname?: string
  hostnameEndsWith?: string
  test?: (pathname: string, url: string) => boolean
  pathPrefix?: string
  pathExact?: string[]
}

const LANDING_PAGE_PATTERNS: LandingPattern[] = [
  {
    hostname: 'mail.google.com',
    test: (p, h) => !h.includes('#inbox/') && !h.includes('#sent/') && !h.includes('#search/')
  },
  { hostname: 'x.com', pathExact: ['/home'] },
  { hostname: 'www.linkedin.com', pathExact: ['/'] },
  { hostname: 'github.com', pathExact: ['/'] },
  { hostname: 'www.youtube.com', pathExact: ['/'] }
]

function isLandingPage(url: string): boolean {
  try {
    const parsed = new URL(url)
    return LANDING_PAGE_PATTERNS.some((p) => {
      const hostnameMatch = p.hostname
        ? parsed.hostname === p.hostname
        : p.hostnameEndsWith
          ? parsed.hostname.endsWith(p.hostnameEndsWith)
          : false
      if (!hostnameMatch) return false
      if (p.test) return p.test(parsed.pathname, url)
      if (p.pathPrefix) return parsed.pathname.startsWith(p.pathPrefix)
      if (p.pathExact) return p.pathExact.includes(parsed.pathname)
      return parsed.pathname === '/'
    })
  } catch {
    return false
  }
}

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

function isRealTab(tab: OpenTab): boolean {
  const url = tab.url || ''
  return (
    !url.startsWith('chrome://') &&
    !url.startsWith('chrome-extension://') &&
    !url.startsWith('about:') &&
    !url.startsWith('edge://') &&
    !url.startsWith('brave://')
  )
}

export function normalizeTab(t: ChromeTab): OpenTab {
  return {
    id: t.id ?? 0,
    url: t.url || '',
    title: t.title || '',
    favIconUrl: t.favIconUrl || '',
    windowId: t.windowId ?? 0,
    active: t.active ?? false,
    discarded: t.discarded ?? false
  }
}

export function buildDomainGroups(tabs: OpenTab[]): DomainGroup[] {
  const seen = new Set<number>()
  const realTabs = tabs.filter((t) => {
    if (t.id == null || seen.has(t.id)) return false
    seen.add(t.id)
    return isRealTab(t)
  })

  const groupMap: Record<string, DomainGroup> = {}
  const landingTabs: OpenTab[] = []

  for (const tab of realTabs) {
    if (isLandingPage(tab.url)) {
      landingTabs.push(tab)
      continue
    }

    try {
      let hostname: string
      if (tab.url.startsWith('file://')) {
        hostname = 'local-files'
        groupMap[hostname] = { domain: hostname, tabs: [], label: 'Local Files' }
        groupMap[hostname].tabs.push(tab)
        continue
      } else {
        hostname = getPrimaryDomain(new URL(tab.url).hostname)
      }

      if (!groupMap[hostname]) {
        groupMap[hostname] = { domain: hostname, tabs: [] }
      }
      groupMap[hostname].tabs.push(tab)
    } catch {
      // skip malformed URLs
    }
  }

  if (landingTabs.length > 0) {
    groupMap['__landing-pages__'] = {
      domain: '__landing-pages__',
      tabs: landingTabs,
      label: 'Landing Pages'
    }
  }

  const landingHostnames = new Set(LANDING_PAGE_PATTERNS.map((p) => p.hostname).filter(Boolean))

  const groups = Object.values(groupMap).sort((a, b) => {
    if (a.domain === '__landing-pages__') return -1
    if (b.domain === '__landing-pages__') return 1

    const aIsPriority = landingHostnames.has(a.domain)
    const bIsPriority = landingHostnames.has(b.domain)
    if (aIsPriority !== bIsPriority) return aIsPriority ? -1 : 1

    return b.tabs.length - a.tabs.length
  })

  for (const group of groups) {
    if (!group.label) {
      group.label = friendlyDomain(group.domain)
    }
  }

  return groups
}
