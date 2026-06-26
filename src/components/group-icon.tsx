import { useState } from 'react'
import { getFallbackLabel } from '@/newtab/utils/icon-utils'
import { cn } from '@/lib/utils'

export interface GroupIconTab {
  url: string
  favIconUrl?: string
}

export function GroupIcon({
  tabs,
  label,
  imgCls,
  fallbackCls
}: {
  tabs: GroupIconTab[]
  label: string
  imgCls?: string
  fallbackCls?: string
}) {
  const [imgError, setImgError] = useState(false)

  const preferredTab =
    tabs.find((t) => {
      const url = t.favIconUrl || ''
      return url.startsWith('https://') || url.startsWith('data:')
    }) ||
    tabs.find((t) => t.url) ||
    tabs[0]

  const isLocalhost = (() => {
    try {
      return new URL(preferredTab?.url || '').hostname === 'localhost'
    } catch {
      return false
    }
  })()

  if (preferredTab?.favIconUrl && !imgError && !isLocalhost) {
    return (
      <img
        src={preferredTab.favIconUrl}
        alt=""
        draggable={false}
        onError={() => setImgError(true)}
        className={cn('object-contain', imgCls)}
      />
    )
  }

  const fb = getFallbackLabel(label, preferredTab?.url || '')
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-bold bg-secondary text-primary',
        fallbackCls
      )}
    >
      {fb.slice(0, 2)}
    </span>
  )
}
