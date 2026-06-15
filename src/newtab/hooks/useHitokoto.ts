import { useEffect, useState, useRef, useCallback } from 'react'
import { useTheme } from '@/stores/theme'

const HITOKOTO_CACHE_KEY = 'hitokotoCache'
const HITOKOTO_CACHE_LIMIT = 50
const API_URL = 'https://v1.hitokoto.cn/'
const FETCH_TIMEOUT = 3000

interface HitokotoEntry {
  hitokoto: string
  from_who: string
  from: string
}

function normalizeEntry(data: unknown): HitokotoEntry | null {
  if (!data || typeof data !== 'object') return null
  const obj = data as Record<string, unknown>
  const text = String(obj.hitokoto || '').trim()
  if (!text) return null
  return {
    hitokoto: text,
    from_who: String(obj.from_who || '').trim(),
    from: String(obj.from || '').trim()
  }
}

async function fetchHitokoto(timeoutMs = FETCH_TIMEOUT): Promise<HitokotoEntry | null> {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(API_URL, { signal: controller.signal })
    clearTimeout(id)
    if (!res.ok) return null
    return normalizeEntry(await res.json())
  } catch {
    return null
  }
}

async function loadCache(): Promise<HitokotoEntry[]> {
  try {
    const result = await browser.storage.local.get(HITOKOTO_CACHE_KEY)
    const raw = result[HITOKOTO_CACHE_KEY]
    if (!Array.isArray(raw)) return []
    return raw.map(normalizeEntry).filter(Boolean) as HitokotoEntry[]
  } catch {
    return []
  }
}

async function saveCache(entries: HitokotoEntry[]) {
  try {
    await browser.storage.local.set({
      [HITOKOTO_CACHE_KEY]: entries.slice(0, HITOKOTO_CACHE_LIMIT)
    })
  } catch {}
}

async function addToCache(data: unknown): Promise<HitokotoEntry | null> {
  const entry = normalizeEntry(data)
  if (!entry) return null
  const existing = (await loadCache()).filter((e) => e.hitokoto !== entry.hitokoto)
  await saveCache([entry, ...existing])
  return entry
}

export function useHitokoto() {
  const { preferences } = useTheme()
  const enabled = preferences.hitokotoEnabled
  const [entry, setEntry] = useState<HitokotoEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const fetchedRef = useRef(false)

  const refresh = useCallback(async () => {
    if (!enabled) return
    const data = await fetchHitokoto()
    if (!enabled) return
    const e = await addToCache(data)
    if (e) setEntry(e)
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      setEntry(null)
      setLoading(false)
      return
    }

    if (!fetchedRef.current) {
      fetchedRef.current = true
      loadCache()
        .then((cache) => {
          if (cache.length > 0) {
            setEntry(cache[0])
            setLoading(false)
          }
          refresh()
        })
        .catch(() => {
          refresh()
        })
    }
  }, [enabled, refresh])

  return { entry, loading }
}
