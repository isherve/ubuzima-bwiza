import { Link, NavLink, Navigate, Outlet } from 'react-router-dom'
import { dashboardPath, useAuth } from '../../context/AuthContext'
import type { Role } from '../../data'

const patientLinks = [
  ['/my-appointments', 'Appointments'],
  ['/doctors', 'Find doctors'],
  ['/messages', 'Messages'],
  ['/medications', 'Medications'],
  ['/medical-record', 'Records'],
  ['/patient/chronic-care', 'Chronic care'],
  ['/ai-assistant', 'AI assistant'],
  ['/my-profile', 'Profile'],
]

const doctorLinks = [
  ['/doctor-dashboard', 'Overview'],
  ['/doctor-appointments', 'Appointments'],
  ['/doctor-calendar', 'Calendar'],
  ['/patients', 'Patients'],
  ['/doctor/availability', 'Availability'],
  ['/doctor-messages', 'Messages'],
  ['/doctor-profile', 'Profile'],
]

const hospitalLinks = [
  ['/hospital-dashboard', 'Overview'],
  ['/hospital-dashboard/doctors', 'Doctors'],
  ['/hospital-dashboard/patients', 'Patients'],
  ['/hospital-dashboard/reception/appointments', 'Appointments'],
  ['/hospital-dashboard/messages', 'Messages'],
  ['/hospital-dashboard/reports', 'Reports'],
  ['/hospital-dashboard/settings', 'Settings'],
]

const adminLinks = [
  ['/admin-dashboard', 'Overview'],
  ['/manage-users', 'Users'],
  ['/doctor-approvals', 'Doctor approvals'],
  ['/hospital-approvals', 'Hospital approvals'],
  ['/all-appointments', 'All appointments'],
  ['/announcements', 'Announcements'],
  ['/settings', 'Settings'],
]

function linksFor(role: Role) {
  if (role === 'doctor') return doctorLinks
  if (role === 'hospital') return hospitalLinks
  if (role === 'admin') return adminLinks
  return patientLinks
}

export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={dashboardPath(user.role)} replace />
  }
  return <Outlet />
}

export function DashboardShell({ title }: { title: string }) {
  const { user, logout } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const links = linksFor(user.role)

  return (
    <div className="dash">
      <aside className="dash-side">
        <Link to="/" className="brand dash-brand">
          <span className="brand-mark" aria-hidden>
            +
          </span>
          <span className="brand-text">Ubuzima Bwiza</span>
        </Link>
        <p className="dash-role">{user.role.toUpperCase()}</p>
        <nav className="dash-nav">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to.split('/').length <= 2}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="btn btn-outline dash-logout" onClick={logout}>
          Logout
        </button>
      </aside>
      <div className="dash-main">
        <header className="dash-top">
          <div>
            <p className="eyebrow">Ubuzima Bwiza</p>
            <h1>{title}</h1>
          </div>
          <div className="dash-user">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        </header>
        <div className="dash-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export function StatGrid({
  items,
}: {
  items: Array<{ label: string; value: string | number }>
}) {
  return (
    <div className="stat-grid">
      {items.map((item) => (
        <div className="stat-card" key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ text }: { text: string }) {
  return <p className="empty">{text}</p>
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}
