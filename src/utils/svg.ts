export function svgToDataUrl(svgText: string): string {
  const text = (svgText || '').trim()
  if (!text) return ''
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`
}
