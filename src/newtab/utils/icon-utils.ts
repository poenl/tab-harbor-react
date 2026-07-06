function getHostname(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname
  } catch {
    return ''
  }
}

export function getFallbackLabel(label: string, url: string): string {
  const cleanLabel = (label || '').trim()
  if (cleanLabel) {
    const tokens = cleanLabel
      .split(/[\s./:_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((t) => t[0]?.toUpperCase() || '')
    const joined = tokens.join('')
    if (joined) return joined
  }

  const hostname = getHostname(url).replace(/^www\./, '')
  return (hostname.slice(0, 2) || '?').toUpperCase()
}
