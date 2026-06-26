import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

interface WorkspacePageSwitchProps {
  currentPage: 'home' | 'saved-tabs'
  onPageChange: (page: 'home' | 'saved-tabs') => void
}

export function WorkspacePageSwitch({ currentPage, onPageChange }: WorkspacePageSwitchProps) {
  const { t } = useTranslation()

  return (
    // ── 页面切换（Home / Saved tabs） ──
    <nav className="inline-flex items-center gap-3.5" aria-label={t('workspacePagesAriaLabel')}>
      <button
        onClick={() => onPageChange('home')}
        className={cn(
          'text-xs font-semibold underline decoration-1 underline-offset-[0.32em] transition-colors duration-150',
          currentPage === 'home'
            ? 'text-primary decoration-primary/30'
            : 'text-muted-foreground hover:text-foreground decoration-transparent'
        )}
      >
        {t('workspacePageHome')}
      </button>
      <button
        onClick={() => onPageChange('saved-tabs')}
        className={cn(
          'text-xs font-semibold underline decoration-1 underline-offset-[0.32em] transition-colors duration-150',
          currentPage === 'saved-tabs'
            ? 'text-primary decoration-primary/30'
            : 'text-muted-foreground hover:text-foreground decoration-transparent'
        )}
      >
        {t('workspacePageSavedTabs')}
      </button>
    </nav>
  )
}
