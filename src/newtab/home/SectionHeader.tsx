interface SectionHeaderProps {
  title: string
  count?: number
  actions?: React.ReactNode
}

export function SectionHeader({ title, count, actions }: SectionHeaderProps) {
  return (
    // ── 区域标题：标题 + 分隔线 + 计数 ──
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/70 flex-[0_0_13ch] m-0">{title}</h2>
      <div className="flex-1 h-px bg-border" />
      {actions && <div className="flex items-center gap-2">{actions}</div>}
      {count !== undefined && (
        <div className="text-xs font-medium tracking-[0.02em] text-primary">{count}</div>
      )}
    </div>
  )
}
