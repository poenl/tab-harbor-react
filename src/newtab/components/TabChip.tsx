import type { OpenTab } from '@/newtab/utils/domain-grouping.ts'

interface TabChipProps {
  tab: OpenTab
  onClose?: (id: number) => void
  onFocus?: (id: number) => void
}

function Favicon({ tab }: { tab: OpenTab }) {
  const initial = (tab.title || tab.url || '?').charAt(0).toUpperCase()

  if (tab.favIconUrl) {
    return (
      <img
        src={tab.favIconUrl}
        alt=""
        className="size-[14px] rounded-sm shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none'
          const fallback = (e.target as HTMLImageElement).nextElementSibling
          if (fallback) (fallback as HTMLElement).style.display = 'flex'
        }}
      />
    )
  }

  return (
    <span className="size-[14px] rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold"
      style={{ backgroundColor: 'var(--theme-accent-soft)', color: 'var(--accent-amber)' }}
    >
      {initial}
    </span>
  )
}

export function TabChip({ tab, onClose, onFocus }: TabChipProps) {
  return (
    <div className="flex items-center gap-2 px-0.5 py-2 border-b border-[rgba(154,145,138,0.12)] last:border-b-0">
      <Favicon tab={tab} />
      <button
        className="flex-1 text-left text-[13px] leading-[1.4] text-ink truncate min-w-0 hover:text-workspace-accent transition-colors duration-150"
        onClick={() => onFocus?.(tab.id)}
        title={tab.title}
      >
        {tab.title || '(untitled)'}
      </button>
      {tab.discarded && (
        <span className="text-[10px] text-muted-text shrink-0">Sleeping</span>
      )}
      {onClose && (
        <button
          onClick={() => onClose(tab.id)}
          className="size-[30px] flex items-center justify-center text-workspace-chip-text opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity duration-150 rounded-full hover:bg-workspace-accent-soft text-sm"
          title="Close tab"
        >
          ✕
        </button>
      )}
    </div>
  )
}
