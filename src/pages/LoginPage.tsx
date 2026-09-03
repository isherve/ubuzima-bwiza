import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { dashboardPath, useAuth } from '../context/AuthContext'

export function LoginPage() {
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
    window.setTimeout(() => {
      const result = login(email, password)
      setLoading(false)
      if (!result.ok || !result.role) {
        setError(result.message)
        return
      }
      navigate(dashboardPath(result.role))
    }, 400)
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
            <p className="eyebrow">SECURE ACCESS</p>
            <h1>Welcome back to Ubuzima Bwiza</h1>
            <p className="intro">
              Access your healthcare dashboard, manage appointments, and connect with trusted
              medical professionals across Rwanda.
            </p>
          </div>
          <div className="role-cards">
            <div className="role-card">
              <p className="label">FOR PATIENTS</p>
              <p>Book appointments with verified doctors, access records, and manage care.</p>
            </div>
            <div className="role-card">
              <p className="label">FOR DOCTORS</p>
              <p>Manage your practice, communicate with patients, and grow digitally.</p>
            </div>
            <div className="role-card">
              <p className="label">FOR HOSPITALS</p>
              <p>Coordinate patient care, manage staff, and streamline operations.</p>
            </div>
          </div>
        </aside>

        <main className="auth-main">
          <form className="auth-card" onSubmit={onSubmit}>
            <div>
              <p className="eyebrow">Unified Access</p>
              <h2>Access your Ubuzima Bwiza account</h2>
              <p className="sub">Use one secure login to access every Ubuzima Bwiza workspace.</p>
            </div>

            <div className="demo-box">
              <strong>Demo accounts</strong>
              <button type="button" onClick={() => { setEmail('patient@ubuzimabwiza.com'); setPassword('patient123') }}>
                Patient | patient@ubuzimabwiza.com / patient123
              </button>
              <button type="button" onClick={() => { setEmail('doctor@ubuzimabwiza.com'); setPassword('doctor123') }}>
                Doctor | doctor@ubuzimabwiza.com / doctor123
              </button>
              <button type="button" onClick={() => { setEmail('hospital@ubuzimabwiza.com'); setPassword('hospital123') }}>
                Hospital | hospital@ubuzimabwiza.com / hospital123
              </button>
              <button type="button" onClick={() => { setEmail('admin@ubuzimabwiza.com'); setPassword('admin123') }}>
                Admin | admin@ubuzimabwiza.com / admin123
              </button>
            </div>

            <div className="auth-form">
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
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="forgot">
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
              </div>
              {error ? <p className="error">{error}</p> : null}
              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Login'}
              </button>
              <div className="or-row"><span>OR</span></div>
              <button type="button" className="google-btn" onClick={() => setError('Google sign-in is temporarily unavailable. Please use your email and password.')}>
                Login with Google
              </button>
              <p className="auth-switch">
                Don&apos;t have an account? <Link to="/register">Sign up here</Link>
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
