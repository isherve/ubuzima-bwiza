import { useTranslation } from 'react-i18next'
import { StatGrid, StatusBadge } from '../../components/dashboard/Shell'
import { JoinVideoButton } from '../../components/JoinVideoButton'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { useAppText } from '../../context/ContentContext'
import { demoUsers, doctors } from '../../data'
import {
  appointmentsTableHtml,
  downloadAppointmentsCsv,
  downloadPrintableReport,
  formatRwf,
} from '../../lib/reports'

export function HospitalDashboardPage() {
  const { t } = useTranslation()
  const { appointments } = useAuth()
  return (
    <div className="stack">
      <StatGrid
        items={[
          { label: t('hospital.doctors'), value: doctors.length },
          { label: t('hospital.appointments'), value: appointments.length },
          { label: t('status.pending'), value: appointments.filter((a) => a.status === 'pending').length },
          { label: t('ui.departments'), value: 12 },
        ]}
      />
      <h2>{t('hospital.operations')}</h2>
      <p className="lead">{t('ui.hospitalLead')}</p>
    </div>
  )
}

export function HospitalDoctorsPage() {
  const { t } = useTranslation()
  return (
    <div className="stack">
      <h2>{t('ui.hospitalDoctors')}</h2>
      <div className="table">
        {doctors.map((doc) => (
          <div className="table-row" key={doc.id}>
            <div>
              <strong>{doc.name}</strong>
              <p>
                {t(`specialties.${doc.specialty}`, { defaultValue: doc.specialty })} | {doc.hospital}
              </p>
            </div>
            <span className="meta">{doc.available ? t('ui.available') : t('ui.busy')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HospitalPatientsPage() {
  const { t } = useTranslation()
  const patients = demoUsers.filter((u) => u.role === 'patient')
  return (
    <div className="stack">
      <h2>{t('hospital.patients')}</h2>
      <div className="table">
        {patients.map((p) => (
          <div className="table-row" key={p.id}>
            <div>
              <strong>{p.name}</strong>
              <p>{p.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HospitalAppointmentsPage() {
  const { t } = useTranslation()
  const { appointments } = useAuth()
  return (
    <div className="stack">
      <h2>{t('ui.reception')}</h2>
      <div className="table">
        {appointments.map((apt) => (
          <div className="table-row" key={apt.id}>
            <div>
              <strong>
                {apt.patientName} {t('ui.with')} {apt.doctorName}
              </strong>
              <p>
                {apt.date} {apt.time} | {apt.type}
              </p>
            </div>
            <div className="row-actions">
              <StatusBadge status={apt.status} />
              <JoinVideoButton apt={apt} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HospitalReportsPage() {
  const { t } = useTranslation()
  const { appointments, user } = useAuth()
  const paidTotal = appointments
    .filter((a) => a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.amount || 0), 0)
  const unpaidCount = appointments.filter((a) => a.paymentStatus !== 'paid').length

  const downloadCsv = () =>
    downloadAppointmentsCsv(appointments, `ubuzima-report-${Date.now()}.csv`)

  const downloadPdf = () =>
    downloadPrintableReport({
      title: 'Operations report',
      subtitle: `${user?.hospital ?? user?.name ?? 'Workspace'} | Ubuzima Bwiza`,
      htmlBody: `
        <p class="meta"><strong>Total appointments:</strong> ${appointments.length}</p>
        <p class="meta"><strong>Paid revenue:</strong> ${formatRwf(paidTotal)}</p>
        <p class="meta"><strong>Unpaid invoices:</strong> ${unpaidCount}</p>
        ${appointmentsTableHtml(appointments)}
      `,
    })

  return (
    <div className="stack">
      <div className="toolbar">
        <h2>{t('hospital.reports')}</h2>
        <div className="row-actions">
          <button type="button" className="btn btn-outline" onClick={downloadCsv}>
            {t('ui.downloadCsv')}
          </button>
          <button type="button" className="btn btn-primary" onClick={downloadPdf}>
            {t('ui.downloadPdf')}
          </button>
        </div>
      </div>
      <StatGrid
        items={[
          { label: t('hospital.appointments'), value: appointments.length },
          { label: t('ui.paidRevenue'), value: formatRwf(paidTotal) },
          { label: t('patient.unpaid'), value: unpaidCount },
          {
            label: t('ui.videoVisits'),
            value: appointments.filter((a) => a.type === 'video').length,
          },
        ]}
      />
      <div className="features">
        {[
          [t('ui.weeklyVisits'), t('ui.appointmentsOnRecord', { count: appointments.length })],
          [
            t('ui.teleconsultRatio'),
            t('ui.videoShare', {
              percent: Math.round(
                (appointments.filter((a) => a.type === 'video').length /
                  Math.max(appointments.length, 1)) *
                  100,
              ),
            }),
          ],
          [t('ui.collections'), t('ui.collectionsBody', { paid: formatRwf(paidTotal), unpaid: unpaidCount })],
        ].map(([title, body]) => (
          <article className="feature" key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

export function HospitalSettingsPage() {
  const { t } = useTranslation()
  return (
    <div className="stack">
      <h2>{t('ui.hospitalSettings')}</h2>
      <div className="feature">
        <ThemeToggle />
        <p>
          <strong>{t('ui.facility')}:</strong> CHUK
        </p>
        <p>
          <strong>{t('ui.timezone')}:</strong> Africa/Kigali
        </p>
        <p>
          <strong>{t('ui.notifications')}:</strong> {t('ui.notificationsOn')}
        </p>
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const { appointments } = useAuth()
  const { t } = useTranslation()
  return (
    <div className="stack">
      <StatGrid
        items={[
          { label: t('admin.users'), value: demoUsers.length },
          { label: t('hospital.doctors'), value: doctors.length },
          { label: t('admin.allAppointments'), value: appointments.length },
          { label: t('admin.doctorApprovals'), value: 2 },
        ]}
      />
      <h2>{t('admin.platformAdmin')}</h2>
      <p className="lead">{t('admin.platformLead')}</p>
    </div>
  )
}

export function ManageUsersPage() {
  const { t } = useTranslation()
  return (
    <div className="stack">
      <h2>{t('admin.manageUsers')}</h2>
      <div className="table">
        {demoUsers.map((u) => (
          <div className="table-row" key={u.id}>
            <div>
              <strong>{u.name}</strong>
              <p>
                {u.email} | {u.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ApprovalsPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation()
  return (
    <div className="stack">
      <h2>{t(titleKey)}</h2>
      <div className="table">
        <div className="table-row">
          <div>
            <strong>{t('admin.pendingApp')}</strong>
            <p>{t('admin.pendingMeta')}</p>
          </div>
          <div className="row-actions">
            <button className="btn btn-primary" type="button">
              {t('common.approve')}
            </button>
            <button className="btn btn-outline" type="button">
              {t('common.reject')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AllAppointmentsPage() {
  const { appointments } = useAuth()
  const { t } = useTranslation()
  return (
    <div className="stack">
      <h2>{t('admin.allAppointments')}</h2>
      <div className="table">
        {appointments.map((apt) => (
          <div className="table-row" key={apt.id}>
            <div>
              <strong>
                {apt.patientName} / {apt.doctorName}
              </strong>
              <p>
                {apt.date} {apt.time}
              </p>
            </div>
            <div className="row-actions">
              <StatusBadge status={apt.status} />
              <JoinVideoButton apt={apt} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnnouncementsPage() {
  const { text } = useAppText()
  const { t } = useTranslation()
  return (
    <div className="stack">
      <h2>{t('admin.announcements')}</h2>
      <div className="feature">
        <h3>{text('announcement.title')}</h3>
        <p>{text('announcement.body')}</p>
      </div>
      <p className="lead">
        <a href="/admin-content">{t('admin.content')}</a>
      </p>
    </div>
  )
}

export function SettingsPage() {
  const { t } = useTranslation()
  return (
    <div className="stack">
      <h2>{t('admin.settings')}</h2>
      <div className="feature">
        <ThemeToggle />
        <LanguageSwitcher />
        <p>{t('admin.themeNote')}</p>
        <p>{t('admin.securityNote')}</p>
      </div>
    </div>
  )
}
