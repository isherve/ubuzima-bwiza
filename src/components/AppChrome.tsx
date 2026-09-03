import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppText } from '../context/ContentContext'

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function SkipLink() {
  const { t } = useAppText()
  return (
    <a className="skip-link" href="#main-content">
      {t('a11y.skip')}
    </a>
  )
}

export function EmergencyBar() {
  const { t } = useAppText()
  return (
    <div className="emergency-bar" role="note">
      <span>
        <strong>{t('emergency.label')}</strong> {t('emergency.body')}
      </span>
      <span className="emergency-actions">
        <a href="tel:112">112</a>
        <a href="tel:912">SAMU 912</a>
      </span>
    </div>
  )
}
