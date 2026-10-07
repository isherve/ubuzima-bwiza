import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useAppText } from '../context/ContentContext'

export function ForgotPasswordPage() {
  const { t } = useAppText()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSent(true)
  }

  return (
    <div className="auth-page">
      <div className="auth-toolbar">
        <LanguageSwitcher compact />
        <ThemeToggle compact />
      </div>
      <div className="auth-bg" aria-hidden>
        <img src="/assets/about.png" alt="" />
      </div>
      <div className="auth-grid" style={{ gridTemplateColumns: '1fr' }}>
        <main className="auth-main">
          <form className="auth-card" onSubmit={onSubmit}>
            <div>
              <p className="eyebrow">{t('ui.accountRecovery')}</p>
              <h2>{t('auth.forgotTitle')}</h2>
              <p className="sub">{t('auth.forgotSubtitle')}</p>
            </div>
            <div className="auth-form">
              <div className="field">
                <label htmlFor="email">{t('ui.email')} *</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button className="login-btn" type="submit">
                {t('auth.sendReset')}
              </button>
              {sent ? <p className="success">{t('ui.resetSent', { email })}</p> : null}
              <p className="auth-switch">
                <Link to="/login">{t('ui.backToLogin')}</Link>
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
