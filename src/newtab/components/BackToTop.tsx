import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    // ── 返回顶部按钮 ──
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label="Back to top"
      className={cn(
        'fixed right-[calc(50vw-630px)] bottom-7 size-10.5 rounded-full border border-border/40 bg-card/85 text-accent shadow-lg backdrop-blur-md hover:bg-muted/50 hover:text-accent hover:shadow-xl z-50 transition-all duration-200',
        'max-[500px]:left-4.5 max-[500px]:bottom-5 max-[500px]:size-11',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'
      )}
    >
      <ChevronUp strokeWidth={2} className="size-4.5" />
    </Button>
  )
}
