import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, StatGrid, StatusBadge } from '../../components/dashboard/Shell'
import { AiChat, MessagesChat } from '../../components/AiChat'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { medications, records } from '../../data'
import { downloadAppointmentIcs } from '../../lib/calendar'
import { askHealthAi } from '../../lib/aiClient'
import {
  appointmentsTableHtml,
  downloadAppointmentsCsv,
  downloadPrintableReport,
} from '../../lib/reports'

export function PatientAppointmentsPage() {
  const { user, appointments } = useAuth()
  const mine = appointments.filter((a) => a.patientName === user?.name)

  return (
    <div className="stack">
      <StatGrid
        items={[
          { label: 'Total', value: mine.length },
          { label: 'Approved', value: mine.filter((a) => a.status === 'approved').length },
          { label: 'Unpaid', value: mine.filter((a) => a.paymentStatus !== 'paid').length },
        ]}
      />
      <div className="toolbar">
        <h2>My appointments</h2>
        <div className="row-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              downloadAppointmentsCsv(mine, `ubuzima-appointments-${Date.now()}.csv`)
              downloadPrintableReport({
                title: 'My appointments report',
                subtitle: `${user?.name ?? 'Patient'} | Ubuzima Bwiza`,
                htmlBody: appointmentsTableHtml(mine),
              })
            }}
          >
            Download report
          </button>
          <Link to="/doctors" className="btn btn-primary">
            Book new
          </Link>
        </div>
      </div>
      <div className="table">
        {mine.length === 0 ? (
          <EmptyState text="No appointments yet. Book a specialist to get started." />
        ) : (
          mine.map((apt) => (
            <div className="table-row" key={apt.id}>
              <div>
                <strong>{apt.doctorName}</strong>
                <p>
                  {apt.specialty} | {apt.date} at {apt.time} | {apt.type} |{' '}
                  {(apt.amount ?? 0).toLocaleString()} RWF
                </p>
              </div>
              <div className="row-actions">
                <StatusBadge status={apt.status} />
                <StatusBadge status={apt.paymentStatus ?? 'unpaid'} />
                {apt.paymentStatus !== 'paid' ? (
                  <Link to={`/pay/${apt.id}`} className="btn btn-primary">
                    Pay
                  </Link>
                ) : (
                  <Link to="/payments" className="btn btn-outline">
                    Receipt
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => downloadAppointmentIcs(apt)}
                >
                  Add to calendar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function MessagesPage() {
  return <MessagesChat />
}

export function MedicationsPage() {
  const [tip, setTip] = useState('')
  const [loading, setLoading] = useState(false)

  const askAboutMeds = async () => {
    setLoading(true)
    try {
      const result = await askHealthAi([
        {
          role: 'user',
          content:
            'I take Amlodipine 5mg daily and Metformin 500mg twice daily. Give short safe reminder tips and when to contact a doctor. Keep it brief.',
        },
      ])
      setTip(result.reply)
    } catch {
      setTip('Take medications as prescribed. Contact a clinician if you get dizziness, swelling, or unusual side effects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stack">
      <div className="toolbar">
        <h2>Medications & prescriptions</h2>
        <button type="button" className="btn btn-outline" onClick={() => void askAboutMeds()} disabled={loading}>
          {loading ? 'Asking AI…' : 'AI med tips'}
        </button>
      </div>
      <div className="table">
        {medications.map((med) => (
          <div className="table-row" key={med.id}>
            <div>
              <strong>{med.name}</strong>
              <p>{med.dose}</p>
            </div>
            <span className="meta">{med.remaining} left</span>
          </div>
        ))}
      </div>
      {tip ? <p className="success">{tip}</p> : null}
    </div>
  )
}

export function MedicalRecordPage() {
  return (
    <div className="stack">
      <h2>Secure health vault</h2>
      <div className="table">
        {records.map((rec) => (
          <div className="table-row" key={rec.id}>
            <div>
              <strong>{rec.title}</strong>
              <p>{rec.doctor}</p>
            </div>
            <span className="meta">{rec.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChronicCarePage() {
  return (
    <div className="stack">
      <h2>Continuous Care Program</h2>
      <p className="lead">
        Dedicated specialist support for diabetes, hypertension, asthma, heart disease and more.
      </p>
      <div className="features">
        {[
          'Assigned dedicated specialist',
          'Continuous chat & video calls',
          'Personalized care plans',
          'Health tracking & monitoring',
        ].map((item) => (
          <article className="feature" key={item}>
            <h3>{item}</h3>
            <p>Included in your chronic care membership.</p>
          </article>
        ))}
      </div>
      <Link to="/patient/chronic-care/apply" className="btn btn-primary">
        Apply / Join now
      </Link>
    </div>
  )
}

export function ChronicCareApplyPage() {
  const { notify } = useToast()
  return (
    <div className="stack">
      <h2>Apply for continuous care</h2>
      <form
        className="search-card auth-form"
        onSubmit={(e) => {
          e.preventDefault()
          notify('Application submitted for review. A care coordinator will contact you.')
        }}
      >
        <div className="field">
          <label htmlFor="condition">Primary condition</label>
          <select id="condition" required defaultValue="Diabetes">
            <option>Diabetes</option>
            <option>Hypertension</option>
            <option>Asthma</option>
            <option>Heart Disease</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="notes">Additional notes</label>
          <input id="notes" placeholder="Medications, recent visits..." />
        </div>
        <button className="btn btn-primary" type="submit">
          Submit application
        </button>
      </form>
    </div>
  )
}

export function AiAssistantPage() {
  return (
    <AiChat
      title="AI Health Assistant"
      subtitle="Ask about symptoms, get triage tips, and book the right Ubuzima Bwiza specialist."
    />
  )
}

export function ProfilePage() {
  const { user } = useAuth()
  return (
    <div className="stack">
      <h2>My profile</h2>
      <div className="feature">
        <p>
          <strong>Name:</strong> {user?.name}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Role:</strong> {user?.role}
        </p>
        {user?.phone ? (
          <p>
            <strong>Phone:</strong> {user.phone}
          </p>
        ) : null}
      </div>
    </div>
  )
}
