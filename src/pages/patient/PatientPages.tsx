import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, StatGrid, StatusBadge } from '../../components/dashboard/Shell'
import { AiChat, MessagesChat } from '../../components/AiChat'
import { useAuth } from '../../context/AuthContext'
import { medications, records } from '../../data'
import { askHealthAi } from '../../lib/aiClient'

export function PatientAppointmentsPage() {
  const { user, appointments } = useAuth()
  const mine = appointments.filter((a) => a.patientName === user?.name)

  return (
    <div className="stack">
      <StatGrid
        items={[
          { label: 'Total', value: mine.length },
          { label: 'Approved', value: mine.filter((a) => a.status === 'approved').length },
          { label: 'Pending', value: mine.filter((a) => a.status === 'pending').length },
        ]}
      />
      <div className="toolbar">
        <h2>My appointments</h2>
        <Link to="/doctors" className="btn btn-primary">
          Book new
        </Link>
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
                  {apt.specialty} · {apt.date} at {apt.time} · {apt.type}
                </p>
              </div>
              <StatusBadge status={apt.status} />
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
          {loading ? 'Asking AI…' : '✦ AI med tips'}
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
  return (
    <div className="stack">
      <h2>Apply for continuous care</h2>
      <form
        className="search-card auth-form"
        onSubmit={(e) => {
          e.preventDefault()
          alert('Application submitted (demo).')
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
