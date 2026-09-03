import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LOCALE_STORAGE_KEY, type AppLocale } from './config'
import en from './locales/en.json'
import fr from './locales/fr.json'
import rw from './locales/rw.json'

function storedLocale(): AppLocale {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as AppLocale | null
  if (saved === 'en' || saved === 'rw' || saved === 'fr') return saved
  const nav = navigator.language.toLowerCase()
  if (nav.startsWith('rw')) return 'rw'
  if (nav.startsWith('fr')) return 'fr'
  return 'en'
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    rw: { translation: rw },
    fr: { translation: fr },
  },
  lng: storedLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n

export function setAppLocale(locale: AppLocale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  void i18n.changeLanguage(locale)
}

export function getAppLocale(): AppLocale {
  const lng = i18n.language
  if (lng === 'rw' || lng === 'fr') return lng
  return 'en'
}
