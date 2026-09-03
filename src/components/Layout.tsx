import { Link, NavLink } from 'react-router-dom'
import { dashboardPath, useAuth } from '../context/AuthContext'
import { useAppText } from '../context/ContentContext'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Navbar() {
  const { user, logout } = useAuth()
  const { t } = useAppText()

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden>
            +
          </span>
          <span className="brand-text">
            Ubuzima <span className="brand-accent">Bwiza</span>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <a href="/#find">{t('nav.findDoctor')}</a>
          <NavLink to="/doctors">{t('nav.doctors')}</NavLink>
          <NavLink to="/ai-assistant">{t('nav.aiAssistant')}</NavLink>
          <NavLink to="/about">{t('nav.about')}</NavLink>
          <NavLink to="/contact">{t('nav.contact')}</NavLink>
          <NavLink to="/patient/chronic-care">{t('nav.chronicCare')}</NavLink>
        </nav>
        <div className="nav-actions">
          <LanguageSwitcher compact />
          {user ? (
            <>
              <Link to={dashboardPath(user.role)} className="btn btn-outline">
                {t('nav.dashboard')}
              </Link>
              <button type="button" className="btn btn-primary" onClick={logout}>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn btn-primary">
                {t('nav.getStarted')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  const { t } = useAppText()

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p>
            © {new Date().getFullYear()} Ubuzima Bwiza {t('footer.rights')}
          </p>
          <p>{t('footer.hosted')}</p>
        </div>
        <div className="footer-links">
          <Link to="/about">{t('nav.about')}</Link>
          <Link to="/contact">{t('nav.contact')}</Link>
          <Link to="/privacy-policy">{t('legal.privacyTitle')}</Link>
          <Link to="/terms-of-service">{t('legal.termsTitle')}</Link>
        </div>
      </div>
    </footer>
  )
}
