import { useState, useEffect } from 'react'
import type { RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BackToTop({ scrollRef }: { scrollRef: RefObject<HTMLDivElement | null> }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function onScroll() {
      setVisible(el!.scrollTop > 320)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [scrollRef])

  function handleClick() {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    // ── 返回顶部按钮 ──
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label="Back to top"
      className={cn(
        'border-border/40 bg-card/85 text-accent hover:bg-muted/50 hover:text-accent fixed right-[max(32px,calc(50vw-630px))] bottom-7 z-50 size-10.5 rounded-full border shadow-lg backdrop-blur-md transition-all duration-200 hover:shadow-xl',
        'max-[500px]:bottom-5 max-[500px]:left-4.5 max-[500px]:size-11',
        visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0'
      )}
    >
      <ChevronUp strokeWidth={2} className="size-4.5" />
    </Button>
  )
}
