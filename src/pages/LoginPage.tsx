import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { dashboardPath, useAuth } from '../context/AuthContext'
import { useAppText } from '../context/ContentContext'

export function LoginPage() {
  const { t } = useAppText()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('patient@ubuzimabwiza.com')
  const [password, setPassword] = useState('patient123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    void login(email, password).then((result) => {
      setLoading(false)
      if (!result.ok || !result.role) {
        setError(result.message)
        return
      }
      navigate(dashboardPath(result.role))
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-toolbar">
        <LanguageSwitcher compact />
        <ThemeToggle compact />
      </div>
      <div className="auth-bg" aria-hidden>
        <img src="/assets/appointment.png" alt="" />
      </div>
      <div className="auth-grid">
        <aside className="auth-aside">
          <div>
            <p className="eyebrow">{t('ui.secureAccess')}</p>
            <h1>{t('auth.welcomeBack')}</h1>
            <p className="intro">{t('ui.welcomeIntro')}</p>
          </div>
          <div className="role-cards">
            <div className="role-card">
              <p className="label">{t('ui.forPatients')}</p>
              <p>{t('ui.patientCard')}</p>
            </div>
            <div className="role-card">
              <p className="label">{t('ui.forDoctors')}</p>
              <p>{t('ui.doctorCard')}</p>
            </div>
            <div className="role-card">
              <p className="label">{t('ui.forHospitals')}</p>
              <p>{t('ui.hospitalCard')}</p>
            </div>
          </div>
        </aside>

        <main className="auth-main">
          <form className="auth-card" onSubmit={onSubmit}>
            <div>
              <p className="eyebrow">{t('ui.unifiedAccess')}</p>
              <h2>{t('ui.accessAccount')}</h2>
              <p className="sub">{t('ui.accessSubtitle')}</p>
            </div>

            <div className="demo-box">
              <strong>{t('auth.demoAccounts')}</strong>
              <button type="button" onClick={() => { setEmail('patient@ubuzimabwiza.com'); setPassword('patient123') }}>
                {t('auth.rolePatient')} | patient@ubuzimabwiza.com / patient123
              </button>
              <button type="button" onClick={() => { setEmail('doctor@ubuzimabwiza.com'); setPassword('doctor123') }}>
                {t('auth.roleDoctor')} | doctor@ubuzimabwiza.com / doctor123
              </button>
              <button type="button" onClick={() => { setEmail('hospital@ubuzimabwiza.com'); setPassword('hospital123') }}>
                {t('auth.roleHospital')} | hospital@ubuzimabwiza.com / hospital123
              </button>
              <button type="button" onClick={() => { setEmail('admin@ubuzimabwiza.com'); setPassword('admin123') }}>
                {t('ui.roleAdmin')} | admin@ubuzimabwiza.com / admin123
              </button>
            </div>

            <div className="auth-form">
              <div className="field">
                <label htmlFor="email">{t('ui.email')} *</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="password">{t('ui.password')} *</label>
                <div className="password-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? t('ui.hide') : t('ui.show')}
                  </button>
                </div>
                <div className="forgot">
                  <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
                </div>
              </div>
              {error ? <p className="error">{error}</p> : null}
              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? t('ui.processing') : t('ui.login')}
              </button>
              <div className="or-row"><span>{t('ui.or')}</span></div>
              <button type="button" className="google-btn" onClick={() => setError(t('auth.googleDemo'))}>
                {t('auth.loginGoogle')}
              </button>
              <p className="auth-switch">
                {t('ui.noAccount')} <Link to="/register">{t('ui.signUpHere')}</Link>
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
