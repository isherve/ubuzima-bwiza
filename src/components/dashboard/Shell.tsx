import { Link, NavLink, Navigate, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { ThemeToggle } from '../ThemeToggle'
import { dashboardPath, useAuth } from '../../context/AuthContext'
import type { Role } from '../../data'

const patientLinks = [
  ['/my-appointments', 'patient.appointments'],
  ['/payments', 'patient.payments'],
  ['/doctors', 'nav.doctors'],
  ['/messages', 'patient.messages'],
  ['/medications', 'patient.medications'],
  ['/medical-record', 'patient.records'],
  ['/patient/chronic-care', 'nav.chronicCare'],
  ['/ai-assistant', 'nav.aiAssistant'],
  ['/my-profile', 'common.profile'],
]

const doctorLinks = [
  ['/doctor-dashboard', 'doctor.overview'],
  ['/doctor-appointments', 'doctor.appointments'],
  ['/doctor-calendar', 'doctor.calendar'],
  ['/patients', 'doctor.patients'],
  ['/doctor/availability', 'doctor.availability'],
  ['/doctor-reports', 'doctor.reports'],
  ['/doctor-messages', 'patient.messages'],
  ['/doctor-profile', 'common.profile'],
]

const hospitalLinks = [
  ['/hospital-dashboard', 'hospital.overview'],
  ['/hospital-dashboard/doctors', 'hospital.doctors'],
  ['/hospital-dashboard/patients', 'hospital.patients'],
  ['/hospital-dashboard/reception/appointments', 'hospital.appointments'],
  ['/hospital-dashboard/messages', 'patient.messages'],
  ['/hospital-dashboard/reports', 'hospital.reports'],
  ['/hospital-dashboard/settings', 'hospital.settings'],
]

const adminLinks = [
  ['/admin-dashboard', 'admin.overview'],
  ['/manage-users', 'admin.users'],
  ['/admin-content', 'admin.content'],
  ['/doctor-approvals', 'admin.doctorApprovals'],
  ['/hospital-approvals', 'admin.hospitalApprovals'],
  ['/all-appointments', 'admin.allAppointments'],
  ['/payment-approvals', 'admin.payments'],
  ['/announcements', 'admin.announcements'],
  ['/settings', 'admin.settings'],
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

export function DashboardShell({ titleKey }: { titleKey: string }) {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  if (!user) return <Navigate to="/login" replace />
  const links = linksFor(user.role)

  return (
    <div className="dash">
      <aside className="dash-side">
        <Link to="/" className="brand dash-brand">
          <span className="brand-mark" aria-hidden>
            +
          </span>
          <span className="brand-text">
            Ubuzima <span className="brand-accent">Bwiza</span>
          </span>
        </Link>
        <p className="dash-role">{user.role.toUpperCase()}</p>
        <nav className="dash-nav">
          {links.map(([to, labelKey]) => (
            <NavLink key={to} to={to} end={to.split('/').length <= 2}>
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="btn btn-outline dash-logout" onClick={logout}>
          {t('nav.logout')}
        </button>
      </aside>
      <div className="dash-main">
        <header className="dash-top">
          <div>
            <p className="eyebrow">{t('common.brand')}</p>
            <h1>{t(titleKey)}</h1>
          </div>
          <div className="dash-top-actions">
            <LanguageSwitcher compact />
            <ThemeToggle compact />
            <div className="dash-user">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        </header>
        <div className="dash-content" id="main-content">
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
  const { t } = useTranslation()
  const label = t(`status.${status}`, { defaultValue: status })
  return <span className={`badge badge-${status}`}>{label}</span>
}
