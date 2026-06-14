import { useCallback, useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

export function useStorage<T>(key: string, defaultValue: T): [T, (value: T) => Promise<void>, boolean] {
  const [data, setData] = useState<T>(defaultValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    browser.storage.local.get(key).then((result) => {
      if (result[key] !== undefined) {
        setData(result[key] as T);
      }
      setReady(true);
    });

    const listener = (changes: Record<string, { newValue?: unknown }>) => {
      if (key in changes) {
        setData(changes[key].newValue as T);
      }
    };
    browser.storage.local.onChanged.addListener(listener);
    return () => browser.storage.local.onChanged.removeListener(listener);
  }, [key]);

  const set = useCallback(async (value: T) => {
    await browser.storage.local.set({ [key]: value });
    setData(value);
  }, [key]);

  return [data, set, ready];
}
