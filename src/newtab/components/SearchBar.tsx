import { useRef, type FormEvent } from 'react'

async function runDefaultSearch(query: string) {
  const text = query.trim()
  if (!text) return

  if (chrome.search?.query) {
    await chrome.search.query({ text, disposition: 'CURRENT_TAB' })
    return
  }

  const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      await browser.tabs.update(tab.id, { url: fallbackUrl })
    }
  } catch {}
}

export function SearchBar() {
  const shellRef = useRef<HTMLDivElement>(null)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const query = (data.get('q') as string) || ''
    runDefaultSearch(query)
  }

  function handleFocus() {
    const shell = shellRef.current
    if (!shell) return
    shell.style.borderColor = 'var(--workspace-accent-border)'
    shell.style.boxShadow = '0 14px 28px color-mix(in srgb, var(--workspace-accent) 14%, transparent)'
    shell.style.backgroundColor = 'color-mix(in srgb, var(--card-bg) calc(var(--custom-surface-opacity) + 78%), var(--workspace-accent-soft) 4%)'
  }

  function handleBlur() {
    const shell = shellRef.current
    if (!shell) return
    shell.style.borderColor = ''
    shell.style.boxShadow = ''
    shell.style.backgroundColor = ''
  }

  return (
    <form onSubmit={handleSubmit} className="w-full self-stretch mt-[14px]">
      <label htmlFor="headerSearchInput" className="sr-only">
        Search the web
      </label>
      <div
        ref={shellRef}
        className="flex items-center gap-[10px] w-full rounded-full px-[14px] min-h-[48px] border transition-all duration-180"
        style={{
          borderColor: 'color-mix(in srgb, var(--workspace-accent-border) calc(var(--custom-border-opacity) + 40%), var(--warm-gray) 38%)',
          backgroundColor: 'color-mix(in srgb, var(--card-bg) calc(var(--custom-surface-opacity) + 74%), transparent)',
          boxShadow: '0 10px 22px color-mix(in srgb, var(--workspace-accent) 5%, transparent)',
        }}
      >
        <svg
          className="size-4 shrink-0"
          style={{ color: 'var(--workspace-accent)' }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.8"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
        </svg>
        <input
          id="headerSearchInput"
          name="q"
          type="search"
          placeholder="Search with your default engine..."
          autoComplete="off"
          spellCheck={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full border-none outline-none bg-transparent text-[15px] text-ink font-inherit placeholder:text-[color-mix(in_srgb,var(--muted)_88%,var(--workspace-accent)_12%)]"
        />
      </div>
    </form>
  )
}
