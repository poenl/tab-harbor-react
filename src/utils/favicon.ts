const FAVICON_CACHE = new Map<string, string>()
const MAX_FAVICON_CACHE = 1000

/** 通过 Chrome 扩展 `/_favicon/` API 获取网站图标的完整 URL */
export function getFaviconUrl(pageUrl: string, size = 32): string {
  const key = `${pageUrl}_${size}`
  const cached = FAVICON_CACHE.get(key)
  if (cached) return cached
  const url = new URL('/_favicon/', browser.runtime.getURL(''))
  url.searchParams.set('pageUrl', pageUrl)
  url.searchParams.set('size', String(size))
  const href = url.href
  if (FAVICON_CACHE.size >= MAX_FAVICON_CACHE) FAVICON_CACHE.clear()
  FAVICON_CACHE.set(key, href)
  return href
}
