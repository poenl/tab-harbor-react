interface SectionHeaderProps {
  title: string
  count?: number
  actions?: React.ReactNode
}

export function SectionHeader({ title, count, actions }: SectionHeaderProps) {
  return (
    // ── 区域标题：标题 + 分隔线 + 计数 ──
    <div className="mb-4 flex h-8 items-center gap-3">
      <h2 className="text-primary/70 m-0 flex-[0_0_13ch] text-xs font-bold tracking-[0.18em] uppercase">
        {title}
      </h2>
      <div className="bg-border h-px flex-1" />
      {actions && <div className="flex items-center gap-2">{actions}</div>}
      {count !== undefined && (
        <div className="text-primary text-xs font-medium tracking-[0.02em]">{count}</div>
      )}
    </div>
  )
}
