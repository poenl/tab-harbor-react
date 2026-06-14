function getHostname(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname
  } catch {
    return ''
  }
}

function getGoogleFaviconUrl(domain: string, size: number): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`
}

export function getIconSources(url: string, size = 32): string[] {
  const hostname = getHostname(url)
  if (!hostname) return []

  const sources: string[] = []

  try {
    const pageOrigin = new URL(url).origin
    sources.push(`${pageOrigin}/favicon.ico`)
  } catch {}

  sources.push(getGoogleFaviconUrl(hostname, size))

  const primary = hostname.replace(/^www\./, '')
  if (primary !== hostname) {
    sources.push(getGoogleFaviconUrl(primary, size))
  }

  return sources.filter(Boolean)
}

export function getFallbackLabel(label: string, url: string): string {
  const cleanLabel = (label || '').trim()
  if (cleanLabel) {
    const tokens = cleanLabel
      .split(/[\s./:_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(t => t[0]?.toUpperCase() || '')
    const joined = tokens.join('')
    if (joined) return joined
  }

  const hostname = getHostname(url).replace(/^www\./, '')
  return (hostname.slice(0, 2) || '?').toUpperCase()
}
