import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { dashboardPath, useAuth } from '../context/AuthContext'
import { useAppText } from '../context/ContentContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  const { user, logout } = useAuth()
  const { t } = useAppText()
  const [open, setOpen] = useState(false)

  return (
    <header className="nav">
        <div className="container nav-inner">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark" aria-hidden>
              +
            </span>
            <span className="brand-text">
              Ubuzima <span className="brand-accent">Bwiza</span>
            </span>
          </Link>
          <nav className={`nav-links${open ? ' open' : ''}`} aria-label="Primary">
            <a href="/#find" onClick={() => setOpen(false)}>
              {t('nav.findDoctor')}
            </a>
            <NavLink to="/doctors" onClick={() => setOpen(false)}>
              {t('nav.doctors')}
            </NavLink>
            <NavLink to="/ai-assistant" onClick={() => setOpen(false)}>
              {t('nav.aiAssistant')}
            </NavLink>
            <NavLink to="/about" onClick={() => setOpen(false)}>
              {t('nav.about')}
            </NavLink>
            <NavLink to="/help" onClick={() => setOpen(false)}>
              {t('nav.help')}
            </NavLink>
            <NavLink to="/contact" onClick={() => setOpen(false)}>
              {t('nav.contact')}
            </NavLink>
            <NavLink to="/patient/chronic-care" onClick={() => setOpen(false)}>
              {t('nav.chronicCare')}
            </NavLink>
          </nav>
          <div className="nav-actions">
            <ThemeToggle compact />
            <LanguageSwitcher compact />
            {user ? (
              <>
                <Link to={dashboardPath(user.role)} className="btn btn-outline" onClick={() => setOpen(false)}>
                  {t('nav.dashboard')}
                </Link>
                <button type="button" className="btn btn-primary" onClick={logout}>
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" onClick={() => setOpen(false)}>
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>
                  {t('nav.getStarted')}
                </Link>
              </>
            )}
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={open}
              aria-label={open ? t('nav.closeMenu') : t('nav.menu')}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? '✕' : '☰'}
            </button>
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
          <p className="footer-meta">{t('footer.academic')}</p>
        </div>
        <div className="footer-links">
          <Link to="/help">{t('nav.help')}</Link>
          <Link to="/about">{t('nav.about')}</Link>
          <Link to="/contact">{t('nav.contact')}</Link>
          <Link to="/privacy-policy">{t('legal.privacyTitle')}</Link>
          <Link to="/terms-of-service">{t('legal.termsTitle')}</Link>
        </div>
      </div>
    </footer>
  )
}
