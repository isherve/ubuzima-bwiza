import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

export function ForgotPasswordPage() {
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
              <p className="eyebrow">Account recovery</p>
              <h2>Forgot password?</h2>
              <p className="sub">Enter your email and we&apos;ll send a reset link (demo).</p>
            </div>
            <div className="auth-form">
              <div className="field">
                <label htmlFor="email">Email *</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button className="login-btn" type="submit">
                Send reset link
              </button>
              {sent ? <p className="success">Reset link sent to {email} (demo only).</p> : null}
              <p className="auth-switch">
                <Link to="/login">Back to login</Link>
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
