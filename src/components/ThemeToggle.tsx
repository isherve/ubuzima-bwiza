import { useAppText } from '../context/ContentContext'
import { useTheme, type ThemePreference } from '../context/ThemeContext'

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { preference, resolvedTheme, setPreference, toggleTheme } = useTheme()
  const { t } = useAppText()

  if (compact) {
    return (
      <button
        type="button"
        className="theme-toggle theme-toggle-compact"
        onClick={toggleTheme}
        aria-label={
          resolvedTheme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')
        }
      >
        {resolvedTheme === 'dark' ? t('theme.light') : t('theme.dark')}
      </button>
    )
  }

  return (
    <label className="theme-switch">
      <span className="theme-switch-label">{t('theme.appearance')}</span>
      <select
        value={preference}
        onChange={(e) => setPreference(e.target.value as ThemePreference)}
        aria-label={t('theme.appearance')}
      >
        <option value="light">{t('theme.light')}</option>
        <option value="dark">{t('theme.dark')}</option>
        <option value="system">{t('theme.system')}</option>
      </select>
    </label>
  )
}
