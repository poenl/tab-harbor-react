import { useState } from 'react'
import { cn } from '@/lib/utils'

interface FaviconImageProps {
  /** 直接图标 URL */
  src?: string
  /** 失败时显示的回退文字（取前 2 个字符） */
  fallback?: string
  /** img 标签的 className */
  imgCls?: string
  /** 回退文字的 className */
  fallbackCls?: string
}

export function FaviconImage({ src, fallback, imgCls, fallbackCls }: FaviconImageProps) {
  const [imgError, setImgError] = useState(false)

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt=""
        className={cn('shrink-0 object-contain', imgCls)}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <span
      className={cn(
        'bg-secondary text-primary inline-flex shrink-0 items-center justify-center font-bold',
        fallbackCls
      )}
    >
      {(fallback || '?').slice(0, 2)}
    </span>
  )
}
