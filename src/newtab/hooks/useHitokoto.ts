import { useTheme } from '@/stores/theme'
import { useFocus } from './useFocus'

const HITOKOTO_CACHE_KEY = 'hitokotoCache'
const API_URL = 'https://v1.hitokoto.cn/'

interface HitokotoEntry {
  hitokoto: string
  from_who: string
  from: string
}

async function fetchHitokoto() {
  try {
    const res = await fetch(API_URL)
    if (!res.ok) return
    const data: HitokotoEntry = await res.json()
    if (!data?.hitokoto) return
    return data
  } catch {
    return
  }
}

export function useHitokoto() {
  const { preferences } = useTheme()
  const [entry] = useFocus(async () => {
    if (!preferences.hitokotoEnabled) return
    const result = await browser.storage.local.get(HITOKOTO_CACHE_KEY)
    fetchHitokoto().then((res) => {
      browser.storage.local.set({ [HITOKOTO_CACHE_KEY]: res })
    })
    return result[HITOKOTO_CACHE_KEY] as HitokotoEntry | undefined
  })

  return { entry }
}
