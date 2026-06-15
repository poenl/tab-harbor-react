import i18n from 'i18next'
import type { LanguageDetectorAsyncModule } from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import { en } from './en'
import { zhCN } from './zh-CN'
import { STORAGE_KEYS } from '@/constants/storage-keys'

function detectFromNavigator(): string {
  return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh-CN' : 'en'
}

const chromeStorageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,

  detect(callback) {
    if (!browser?.storage?.local) {
      callback(detectFromNavigator())
      return
    }
    browser.storage.local
      .get(STORAGE_KEYS.LANGUAGE_PREFERENCE)
      .then((result) => {
        const pref = result[STORAGE_KEYS.LANGUAGE_PREFERENCE] as string | undefined
        if (pref === 'en') return callback('en')
        if (pref === 'zh-CN') return callback('zh-CN')
        callback(detectFromNavigator())
      })
      .catch(() => callback(detectFromNavigator()))
  }
}

i18n
  .use(chromeStorageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'zh-CN': { translation: zhCN }
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })

export { useTranslation }
export default i18n
