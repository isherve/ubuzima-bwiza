import { StatGrid, StatusBadge } from '../../components/dashboard/Shell'
import { useAuth } from '../../context/AuthContext'
import { demoUsers, doctors } from '../../data'
import {
  appointmentsTableHtml,
  downloadAppointmentsCsv,
  downloadPrintableReport,
  formatRwf,
} from '../../lib/reports'

export function HospitalDashboardPage() {
  const { appointments } = useAuth()
  return (
    <div className="stack">
      <StatGrid
        items={[
          { label: 'Doctors', value: doctors.length },
          { label: 'Appointments', value: appointments.length },
          { label: 'Pending', value: appointments.filter((a) => a.status === 'pending').length },
          { label: 'Departments', value: 12 },
        ]}
      />
      <h2>Hospital operations</h2>
      <p className="lead">Coordinate staff, reception, patient flow, and reports from one workspace.</p>
    </div>
  )
}

export function HospitalDoctorsPage() {
  return (
    <div className="stack">
      <h2>Hospital doctors</h2>
      <div className="table">
        {doctors.map((doc) => (
          <div className="table-row" key={doc.id}>
            <div>
              <strong>{doc.name}</strong>
              <p>
                {doc.specialty} · {doc.hospital}
              </p>
            </div>
            <span className="meta">{doc.available ? 'Available' : 'Busy'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HospitalPatientsPage() {
  const patients = demoUsers.filter((u) => u.role === 'patient')
  return (
    <div className="stack">
      <h2>Patients</h2>
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
  const { appointments } = useAuth()
  return (
    <div className="stack">
      <h2>Reception appointments</h2>
      <div className="table">
        {appointments.map((apt) => (
          <div className="table-row" key={apt.id}>
            <div>
              <strong>
                {apt.patientName} → {apt.doctorName}
              </strong>
              <p>
                {apt.date} {apt.time} · {apt.type}
              </p>
            </div>
            <StatusBadge status={apt.status} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function HospitalReportsPage() {
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
      subtitle: `${user?.hospital ?? user?.name ?? 'Workspace'} · Ubuzima Bwiza`,
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
        <h2>Reports</h2>
        <div className="row-actions">
          <button type="button" className="btn btn-outline" onClick={downloadCsv}>
            Download CSV
          </button>
          <button type="button" className="btn btn-primary" onClick={downloadPdf}>
            Download PDF report
          </button>
        </div>
      </div>
      <StatGrid
        items={[
          { label: 'Appointments', value: appointments.length },
          { label: 'Paid revenue', value: formatRwf(paidTotal) },
          { label: 'Unpaid', value: unpaidCount },
          {
            label: 'Video visits',
            value: appointments.filter((a) => a.type === 'video').length,
          },
        ]}
      />
      <div className="features">
        {[
          ['Weekly visits', `${appointments.length} appointments on record`],
          [
            'Teleconsult ratio',
            `${Math.round(
              (appointments.filter((a) => a.type === 'video').length /
                Math.max(appointments.length, 1)) *
                100,
            )}% video consultations`,
          ],
          ['Collections', `${formatRwf(paidTotal)} received · ${unpaidCount} unpaid`],
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
  return (
    <div className="stack">
      <h2>Hospital settings</h2>
      <div className="feature">
        <p>
          <strong>Facility:</strong> CHUK
        </p>
        <p>
          <strong>Timezone:</strong> Africa/Kigali
        </p>
        <p>
          <strong>Notifications:</strong> Email + SMS enabled
        </p>
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const { appointments } = useAuth()
  return (
    <div className="stack">
      <StatGrid
        items={[
          { label: 'Users', value: demoUsers.length },
          { label: 'Doctors', value: doctors.length },
          { label: 'Appointments', value: appointments.length },
          { label: 'Pending approvals', value: 2 },
        ]}
      />
      <h2>Platform admin</h2>
      <p className="lead">Oversee users, provider approvals, announcements, and system health.</p>
    </div>
  )
}

export function ManageUsersPage() {
  return (
    <div className="stack">
      <h2>Manage users</h2>
      <div className="table">
        {demoUsers.map((u) => (
          <div className="table-row" key={u.id}>
            <div>
              <strong>{u.name}</strong>
              <p>
                {u.email} · {u.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ApprovalsPage({ title }: { title: string }) {
  return (
    <div className="stack">
      <h2>{title}</h2>
      <div className="table">
        <div className="table-row">
          <div>
            <strong>Pending application #1042</strong>
            <p>Submitted 2 days ago · awaiting review</p>
          </div>
          <div className="row-actions">
            <button className="btn btn-primary" type="button">
              Approve
            </button>
            <button className="btn btn-outline" type="button">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AllAppointmentsPage() {
  const { appointments } = useAuth()
  return (
    <div className="stack">
      <h2>All appointments</h2>
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
            <StatusBadge status={apt.status} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnnouncementsPage() {
  return (
    <div className="stack">
      <h2>Announcements</h2>
      <div className="feature">
        <h3>Network update</h3>
        <p>Teleconsult capacity expanded for cardiology and pediatrics this week.</p>
      </div>
    </div>
  )
}

export function SettingsPage() {
  return (
    <div className="stack">
      <h2>Settings</h2>
      <div className="feature">
        <p>Language: English / Kinyarwanda</p>
        <p>Theme: Ubuzima Bwiza emerald</p>
        <p>Security: 2FA available in production</p>
      </div>
    </div>
  )
}
