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
    <nav className="flex min-w-0 flex-1 flex-wrap gap-2.5">
      {items.map((item) => {
        const label = item.label

        return (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              {variant === 'name' ? (
                <button
                  onClick={() => onNavigate?.(item.id)}
                  aria-label={t('jumpToLabel', { label })}
                  className="text-muted-foreground hover:text-foreground hover:decoration-accent/64 inline-flex h-10 max-w-32 cursor-pointer items-center truncate rounded-none border-none bg-transparent px-1 text-xs font-medium underline decoration-transparent decoration-1 underline-offset-[0.32em] transition-all duration-150"
                >
                  <span className="truncate">{label}</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate?.(item.id)}
                  aria-label={t('jumpToLabel', { label })}
                  draggable={false}
                  className="border-border bg-card hover:border-primary inline-flex h-10 w-10 cursor-grab items-center justify-center rounded-full border transition-[transform,border-color] duration-200 ease-out hover:-translate-y-px"
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
