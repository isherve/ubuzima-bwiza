import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  CONTENT_STORAGE_KEY,
  EDITABLE_FIELDS,
  type AppLocale,
  type ContentOverrides,
  type LocalizedValue,
} from '../i18n/config'
import { setAppLocale } from '../i18n'

type ContentContextValue = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  text: (key: string, fallback?: string) => string
  overrides: ContentOverrides
  updateOverride: (key: string, locale: AppLocale, value: string) => void
  saveOverrides: () => void
  resetOverrides: () => void
  getLocalizedField: (key: string) => LocalizedValue
  setLocalizedField: (key: string, value: LocalizedValue) => void
  editableFields: typeof EDITABLE_FIELDS
  savedNotice: boolean
  clearSavedNotice: () => void
}

const ContentContext = createContext<ContentContextValue | null>(null)

function readOverrides(): ContentOverrides {
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ContentOverrides) : {}
  } catch {
    return {}
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation()
  const [overrides, setOverrides] = useState<ContentOverrides>(() => readOverrides())
  const [savedNotice, setSavedNotice] = useState(false)

  const locale = (i18n.language === 'rw' || i18n.language === 'fr' ? i18n.language : 'en') as AppLocale

  const setLocale = useCallback((next: AppLocale) => {
    setAppLocale(next)
  }, [])

  const text = useCallback(
    (key: string, fallback?: string) => {
      const override = overrides[key]?.[locale]
      if (override?.trim()) return override
      const translated = t(key, { defaultValue: '' })
      if (translated) return translated
      return fallback ?? key
    },
    [locale, overrides, t],
  )

  const updateOverride = useCallback((key: string, loc: AppLocale, value: string) => {
    setOverrides((prev) => ({
      ...prev,
      [key]: { ...prev[key], [loc]: value },
    }))
  }, [])

  const saveOverrides = useCallback(() => {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(overrides))
    setSavedNotice(true)
  }, [overrides])

  const resetOverrides = useCallback(() => {
    setOverrides({})
    localStorage.removeItem(CONTENT_STORAGE_KEY)
    setSavedNotice(true)
  }, [])

  const getLocalizedField = useCallback(
    (key: string): LocalizedValue => ({
      en: overrides[key]?.en ?? t(key, { lng: 'en', defaultValue: '' }),
      rw: overrides[key]?.rw ?? t(key, { lng: 'rw', defaultValue: '' }),
      fr: overrides[key]?.fr ?? t(key, { lng: 'fr', defaultValue: '' }),
    }),
    [overrides, t],
  )

  const setLocalizedField = useCallback((key: string, value: LocalizedValue) => {
    setOverrides((prev) => ({ ...prev, [key]: value }))
  }, [])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      text,
      overrides,
      updateOverride,
      saveOverrides,
      resetOverrides,
      getLocalizedField,
      setLocalizedField,
      editableFields: EDITABLE_FIELDS,
      savedNotice,
      clearSavedNotice: () => setSavedNotice(false),
    }),
    [
      locale,
      setLocale,
      text,
      overrides,
      updateOverride,
      saveOverrides,
      resetOverrides,
      getLocalizedField,
      setLocalizedField,
      savedNotice,
    ],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}

export function useAppText() {
  const { text, locale, setLocale } = useContent()
  const { t } = useTranslation()
  return { text, t, locale, setLocale }
}

export function translateSpecialty(specialty: string, t: (key: string) => string) {
  return t(`specialties.${specialty}`) || specialty
}
