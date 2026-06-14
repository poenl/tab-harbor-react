import { cn } from '@/lib/utils'

interface WorkspacePageSwitchProps {
  currentPage: 'home' | 'saved-tabs'
  onPageChange: (page: 'home' | 'saved-tabs') => void
}

export function WorkspacePageSwitch({ currentPage, onPageChange }: WorkspacePageSwitchProps) {
  return (
    // ── 页面切换（Home / Saved tabs） ──
    <nav className="inline-flex items-center gap-3.5 pt-2" aria-label="Workspace pages">
      <button
        onClick={() => onPageChange('home')}
        className={cn(
          'text-xs font-semibold underline underline-offset-[0.32em] decoration-1 transition-colors duration-150',
          currentPage === 'home'
            ? 'text-primary decoration-primary/30'
            : 'text-muted-foreground decoration-transparent hover:text-foreground'
        )}
      >
        Home
      </button>
      <button
        onClick={() => onPageChange('saved-tabs')}
        className={cn(
          'text-xs font-semibold underline underline-offset-[0.32em] decoration-1 transition-colors duration-150',
          currentPage === 'saved-tabs'
            ? 'text-primary decoration-primary/30'
            : 'text-muted-foreground decoration-transparent hover:text-foreground'
        )}
      >
        Saved tabs
      </button>
    </nav>
  )
}
