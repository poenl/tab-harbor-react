import { useState } from 'react'
import type { QuickShortcut } from '@/stores/quickShortcuts'
import { getIconSources, getFallbackLabel } from '@/newtab/utils/icon-utils'
import { svgToDataUrl } from '@/utils/svg'

export function ShortcutIcon({ shortcut }: { shortcut: QuickShortcut }) {
  const { icon, iconKind, url, label } = shortcut
  const [imgError, setImgError] = useState(false)

  if (iconKind === 'emoji') {
    return <span className="text-lg leading-none">{icon}</span>
  }

  if (iconKind === 'svg' && icon) {
    return (
      <img
        src={svgToDataUrl(icon)}
        alt=""
        draggable={false}
        onError={() => setImgError(true)}
        className="h-5.5 w-5.5 rounded-md object-contain"
      />
    )
  }

  if (iconKind === 'image' && icon && !imgError) {
    return (
      <img
        src={icon}
        alt=""
        draggable={false}
        onError={() => setImgError(true)}
        className="h-5.5 w-5.5 rounded-md object-contain"
      />
    )
  }

  if (!imgError && url) {
    const sources = getIconSources(url, 32)
    const firstSrc = sources[0]
    if (firstSrc) {
      return (
        <img
          src={firstSrc}
          alt=""
          draggable={false}
          data-fallback-src={sources[1]}
          onError={(e) => {
            const fb = (e.currentTarget as HTMLImageElement).getAttribute('data-fallback-src')
            if (fb) {
              e.currentTarget.src = fb
              e.currentTarget.removeAttribute('data-fallback-src')
            } else setImgError(true)
          }}
          className="h-5.5 w-5.5 rounded-md object-contain"
        />
      )
    }
  }

  const fallbackText = getFallbackLabel(label, url)
  return <span className="text-primary text-sm font-bold">{fallbackText}</span>
}
