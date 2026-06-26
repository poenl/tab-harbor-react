import { useTranslation } from '@/i18n'
import { GroupIcon } from '@/components/group-icon'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export interface NavItem {
  id: string
  label: string
  tabs: Array<{ url: string; favIconUrl?: string }>
}

interface GroupNavProps {
  items: NavItem[]
  onNavigate?: (id: string) => void
  variant?: 'icon' | 'name'
}

export function GroupNav({ items, onNavigate, variant = 'icon' }: GroupNavProps) {
  const { t } = useTranslation()

  if (!items.length) return null

  return (
    // ── 分组导航圆点 ──
    <nav className="flex gap-2.5 flex-wrap flex-1 min-w-0">
      {items.map((item) => {
        const label = item.label

        return (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              {variant === 'name' ? (
                <button
                  onClick={() => onNavigate?.(item.id)}
                  aria-label={t('jumpToLabel', { label })}
                  className="inline-flex items-center max-w-32 h-10 px-1 bg-transparent border-none rounded-none text-xs font-medium text-muted-foreground underline decoration-transparent underline-offset-[0.32em] decoration-1 hover:text-foreground hover:decoration-accent/64 transition-all duration-150 cursor-pointer truncate"
                >
                  <span className="truncate">{label}</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate?.(item.id)}
                  aria-label={t('jumpToLabel', { label })}
                  draggable={false}
                  className="w-10 h-10 rounded-full border border-border bg-card inline-flex items-center justify-center cursor-grab hover:-translate-y-px hover:border-primary transition-[transform,border-color] duration-200 ease-out"
                >
                  <GroupIcon
                    tabs={item.tabs}
                    label={item.label}
                    imgCls="w-5 h-5 rounded-xs"
                    fallbackCls="w-5 h-5 rounded-full text-[9px]"
                  />
                </button>
              )}
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8}>
              {label}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </nav>
  )
}
