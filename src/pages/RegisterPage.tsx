import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { dashboardPath, useAuth } from '../context/AuthContext'
import { useAppText } from '../context/ContentContext'
import type { Role } from '../data'

const roles: Role[] = ['patient', 'doctor', 'hospital']

export function RegisterPage() {
  const { t } = useAppText()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('patient')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (password.length < 8) {
      setError(t('ui.passwordShort'))
      return
    }
    if (password !== confirm) {
      setError(t('ui.passwordMismatch'))
      return
    }
    const result = await register({ name: fullName, email, password, role })
    if (!result.ok) {
      setError(result.message)
      return
    }
    navigate(dashboardPath(role))
  }

  return (
    <div className="auth-page">
      <div className="auth-toolbar">
        <LanguageSwitcher compact />
        <ThemeToggle compact />
      </div>
      <div className="auth-bg" aria-hidden>
        <img src="/assets/header.png" alt="" />
      </div>
      <div className="auth-grid">
        <aside className="auth-aside">
          <div>
            <p className="eyebrow">{t('ui.getStarted')}</p>
            <h1>{t('auth.createAccount')}</h1>
            <p className="intro">{t('ui.registerIntro')}</p>
          </div>
        </aside>
        <main className="auth-main">
          <form className="auth-card" onSubmit={onSubmit}>
            <div>
              <p className="eyebrow">{t('ui.unifiedAccess')}</p>
              <h2>{t('auth.createAccount')}</h2>
              <p className="sub">{t('ui.chooseRole')}</p>
            </div>
            <div className="auth-form">
              <div className="role-tabs">
                {roles.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={role === item ? 'active' : ''}
                    onClick={() => setRole(item)}
                  >
                    {t(item === 'patient' ? 'auth.rolePatient' : item === 'doctor' ? 'auth.roleDoctor' : 'auth.roleHospital')}
                  </button>
                ))}
              </div>
              <div className="field">
                <label htmlFor="fullName">{t('ui.fullName')} *</label>
                <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
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
                    minLength={8}
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? t('ui.hide') : t('ui.show')}
                  </button>
                </div>
              </div>
              <div className="field">
                <label htmlFor="confirm">{t('ui.confirmPassword')} *</label>
                <input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              {error ? <p className="error">{error}</p> : null}
              <button className="login-btn" type="submit">
                {t('auth.signUp')}
              </button>
              <p className="auth-switch">
                {t('ui.haveAccount')} <Link to="/login">{t('ui.loginHere')}</Link>
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
