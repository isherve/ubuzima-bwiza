import { Link, NavLink } from 'react-router-dom'
import { dashboardPath, useAuth } from '../context/AuthContext'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden>
            +
          </span>
          <span className="brand-text">Ubuzima Bwiza</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <a href="/#find">Find a doctor</a>
          <NavLink to="/doctors">Doctors</NavLink>
          <NavLink to="/ai-assistant">AI assistant</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/patient/chronic-care">Chronic care</NavLink>
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <Link to={dashboardPath(user.role)} className="btn btn-outline">
                Dashboard
              </Link>
              <button type="button" className="btn btn-primary" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p>© {new Date().getFullYear()} Ubuzima Bwiza All Rights Reserved</p>
          <p>Data protected &amp; hosted by AOS</p>
        </div>
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/terms-of-service">Terms</Link>
        </div>
      </div>
    </footer>
  )
}
