import { useEffect, useState, useCallback } from 'react'
import { STORAGE_KEYS } from '@/constants/storage-keys'

type ShortcutIconKind = '' | 'emoji' | 'svg' | 'image' | 'website'

export interface QuickShortcut {
  id: string
  url: string
  label: string
  icon: string
  iconKind: ShortcutIconKind
}

function generateId(): string {
  return `shortcut-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeShortcutIcon(value: string): {
  icon: string
  iconKind: QuickShortcut['iconKind']
} {
  const text = (value || '').trim()
  if (!text) return { icon: '', iconKind: '' }

  if (/^<svg[\s\S]*<\/svg>$/i.test(text)) {
    return { icon: text, iconKind: 'svg' }
  }

  if (/^data:image\//i.test(text)) {
    return { icon: text, iconKind: 'image' }
  }

  if (/^https?:\/\//i.test(text) || text.startsWith('/')) {
    return { icon: text, iconKind: 'image' }
  }

  const glyph = text.slice(0, 2)
  return { icon: glyph, iconKind: 'emoji' }
}

function normalize(input: Partial<QuickShortcut>): QuickShortcut | null {
  const url = (input.url || '').trim()
  if (!url) return null

  const label = (input.label || '').trim()
  const rawIcon = input.icon || ''
  const rawKind = input.iconKind as string

  let icon = rawIcon
  let iconKind = rawKind as QuickShortcut['iconKind']

  if (rawKind === 'site' || rawKind === 'website') {
    iconKind = ''
    icon = ''
  }

  const normalized = normalizeShortcutIcon(icon)
  icon = normalized.icon
  iconKind = normalized.iconKind || iconKind || ''

  return {
    id: input.id || generateId(),
    url,
    label,
    icon,
    iconKind
  }
}

function normalizeAll(input: unknown): QuickShortcut[] {
  if (!Array.isArray(input)) return []
  return input.map(normalize).filter(Boolean) as QuickShortcut[]
}

export function useQuickShortcuts() {
  const [shortcuts, setShortcuts] = useState<QuickShortcut[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const result = await browser.storage.local.get(STORAGE_KEYS.QUICK_SHORTCUTS)
      setShortcuts(normalizeAll(result[STORAGE_KEYS.QUICK_SHORTCUTS]))
    } catch {
      setShortcuts([])
    }
    setLoading(false)
  }, [])

  const save = useCallback(async (next: QuickShortcut[]) => {
    await browser.storage.local.set({ [STORAGE_KEYS.QUICK_SHORTCUTS]: next })
    setShortcuts(next)
  }, [])

  const add = useCallback(
    async (partial: Partial<QuickShortcut>) => {
      const entry = normalize({ ...partial, id: generateId() })
      if (!entry) return
      const next = [...shortcuts, entry]
      await save(next)
    },
    [shortcuts, save]
  )

  const update = useCallback(
    async (id: string, partial: Partial<QuickShortcut>) => {
      const next = shortcuts.map((s) => (s.id === id ? { ...s, ...partial } : s))
      await save(next)
    },
    [shortcuts, save]
  )

  const remove = useCallback(
    async (id: string) => {
      const next = shortcuts.filter((s) => s.id !== id)
      await save(next)
    },
    [shortcuts, save]
  )

  useEffect(() => {
    load()

    const listener = (changes: Record<string, { newValue?: unknown }>) => {
      if (STORAGE_KEYS.QUICK_SHORTCUTS in changes) {
        load()
      }
    }
    browser.storage.local.onChanged.addListener(listener)
    return () => browser.storage.local.onChanged.removeListener(listener)
  }, [load])

  return { shortcuts, loading, add, update, remove }
}

export function svgToDataUrl(svgText: string): string {
  const text = (svgText || '').trim()
  if (!text) return ''
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`
}
