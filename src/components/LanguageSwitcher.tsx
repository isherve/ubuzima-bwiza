import { LOCALES } from '../i18n/config'
import { useAppText } from '../context/ContentContext'

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useAppText()

  return (
    <label className={`lang-switch ${compact ? 'lang-switch-compact' : ''}`}>
      {!compact && <span className="lang-switch-label">{t('nav.language')}</span>}
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        aria-label={t('nav.language')}
      >
        {LOCALES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}
