import { useState } from 'react'
import type { OpenTab } from '@/newtab/utils/domain-grouping'
import { getFallbackLabel } from '@/newtab/utils/icon-utils'
import { cn } from '@/lib/utils'

function isLocalhost(url: string) {
  try {
    return new URL(url).hostname === 'localhost'
  } catch {
    return false
  }
}

export function Favicon({
  tab,
  imgCls,
  fallbackCls
}: {
  tab: OpenTab
  imgCls?: string
  fallbackCls?: string
}) {
  const [imgError, setImgError] = useState(false)

  if (tab.favIconUrl && !imgError && !isLocalhost(tab.favIconUrl)) {
    return (
      <img
        src={tab.favIconUrl}
        alt=""
        className={cn('rounded-xs shrink-0 object-contain', imgCls)}
        onError={() => setImgError(true)}
      />
    )
  }

  const fb = getFallbackLabel(tab.title, tab.url)
  return (
    <span
      className={cn(
        'rounded-full inline-flex items-center justify-center font-bold shrink-0 bg-secondary text-primary',
        fallbackCls
      )}
    >
      {fb.slice(0, 2)}
    </span>
  )
}
