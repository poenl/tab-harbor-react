import i18n from 'i18next'
import type { LanguageDetectorAsyncModule } from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import { en } from './en'
import { zhCN } from './zh-CN'

const LANG_KEY = 'languagePreference'

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
    browser.storage.local.get(LANG_KEY)
      .then(result => {
        const pref = result[LANG_KEY] as string | undefined
        if (pref === 'en') return callback('en')
        if (pref === 'zh-CN') return callback('zh-CN')
        callback(detectFromNavigator())
      })
      .catch(() => callback(detectFromNavigator()))
  },
}

i18n.use(chromeStorageDetector).use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'zh-CN': { translation: zhCN }
  },
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export { useTranslation }
export default i18n
