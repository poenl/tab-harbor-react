import type { FormEvent } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from '@/i18n'

async function runDefaultSearch(query: string) {
  const text = query.trim()
  if (!text) return

  const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      await browser.tabs.update(tab.id, { url: fallbackUrl })
    }
  } catch {}
}

export function SearchBar() {
  const { t } = useTranslation()

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const query = (data.get('q') as string) || ''
    runDefaultSearch(query)
  }

  return (
    // ── 搜索框 ──
    <form onSubmit={handleSubmit} className="mt-3.5">
      {/* ── 圆角外壳（聚焦时高亮边框 + 阴影） ── */}
      <div className="flex items-center gap-2.5 w-full min-h-12 px-3.5 rounded-full border border-border bg-card transition-all duration-200 focus-within:border-ring focus-within:shadow-[0_14px_28px_var(--tw-shadow-color)] focus-within:shadow-primary/15">
        <Search strokeWidth={1.8} className="w-4 h-4 text-primary shrink-0" />
        <input
          name="q"
          type="search"
          placeholder={t('searchPlaceholder')}
          autoComplete="off"
          spellCheck={false}
          aria-label={t('searchAriaLabel')}
          className="flex-1 text-[15px] text-foreground bg-transparent border-none outline-none min-w-0 placeholder:text-muted-foreground/80"
        />
      </div>
    </form>
  )
}
