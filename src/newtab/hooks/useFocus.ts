import { useEffect, useState } from 'react'

// 页面聚焦是重新设置值
export const useFocus = <T>(getValue: () => T | Promise<T>) => {
  const [val, setVal] = useState<T>()

  const updateVal = async () => {
    if (document.visibilityState !== 'visible') return
    const value = await getValue()
    value && setVal(value)
  }

  useEffect(() => {
    updateVal()

    document.addEventListener('visibilitychange', updateVal)

    return () => {
      document.removeEventListener('visibilitychange', updateVal)
    }
  }, [updateVal])

  return [val, updateVal] as const
}
