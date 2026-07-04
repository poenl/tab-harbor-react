import type { FormEvent } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { Input } from '@/components/ui/input'

async function runDefaultSearch(query: string) {
  const text = query.trim()
  if (!text) return

  const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`
  try {
    await browser.search.query({ text })
  } catch {
    await browser.tabs.create({ url: fallbackUrl })
  }
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
      <div className="border-border bg-card focus-within:border-ring focus-within:shadow-primary/15 flex min-h-12 w-full items-center gap-2.5 rounded-full border px-3.5 transition-all duration-200 focus-within:shadow-[0_14px_28px_var(--tw-shadow-color)]">
        <Search strokeWidth={1.8} className="text-primary h-4 w-4 shrink-0" />
        <Input
          name="q"
          type="search"
          placeholder={t('searchPlaceholder')}
          autoComplete="off"
          spellCheck={false}
          aria-label={t('searchAriaLabel')}
          className="text-foreground placeholder:text-muted-foreground/80 min-w-0 flex-1 border-none bg-transparent text-base shadow-none outline-none focus-visible:ring-0"
        />
      </div>
    </form>
  )
}
