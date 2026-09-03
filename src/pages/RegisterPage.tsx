import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { dashboardPath, useAuth } from '../context/AuthContext'
import type { Role } from '../data'

const roles: Role[] = ['patient', 'doctor', 'hospital']

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('patient')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (password.length < 8) {
      setError('Use at least 8 characters for a stronger password.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    const result = register({ name: fullName, email, password, role })
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
            <p className="eyebrow">GET STARTED</p>
            <h1>Create your Ubuzima Bwiza account</h1>
            <p className="intro">
              Join Rwanda&apos;s trusted medical network for telemedicine, appointments, and secure
              health records.
            </p>
          </div>
        </aside>
        <main className="auth-main">
          <form className="auth-card" onSubmit={onSubmit}>
            <div>
              <p className="eyebrow">Unified Access</p>
              <h2>Create your Ubuzima Bwiza account</h2>
              <p className="sub">Choose your role and register in a few steps.</p>
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
                    {item[0].toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </div>
              <div className="field">
                <label htmlFor="fullName">Full name *</label>
                <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="email">Email *</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="password">Password *</label>
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
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="field">
                <label htmlFor="confirm">Confirm password *</label>
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
                Sign up
              </button>
              <p className="auth-switch">
                Already have an account? <Link to="/login">Login here</Link>
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
