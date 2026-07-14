import { useEffect, useState } from 'react'

// 页面聚焦时重新取值
export const useFocus = <T>(getValue: () => T | Promise<T>) => {
  const [val, setVal] = useState<T>()

  useEffect(() => {
    let cancelled = false

    const handle = async () => {
      if (document.visibilityState !== 'visible') return
      const value = await getValue()
      if (!cancelled && value) setVal(value)
    }

    handle()

    document.addEventListener('visibilitychange', handle)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handle)
    }
  }, [getValue])

  return [val] as const
}
