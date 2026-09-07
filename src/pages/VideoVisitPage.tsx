import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  appointmentsBackPath,
  canAccessVideoVisit,
  jitsiVisitUrl,
} from '../lib/videoVisit'

export function VideoVisitPage() {
  const { id = '' } = useParams()
  const { user, appointments } = useAuth()
  const apt = appointments.find((item) => item.id === id)
  const back = appointmentsBackPath(user?.role)

  if (!user) return <Navigate to="/login" replace />
  if (!apt || !canAccessVideoVisit(user, apt)) {
    return (
      <section className="section">
        <div className="container prose">
          <h1>Video visit unavailable</h1>
          <p>This consultation is not available, or it is an in-person appointment.</p>
          <Link to={back} className="btn btn-primary">
            Back to appointments
          </Link>
        </div>
      </section>
    )
  }

  if (apt.status !== 'approved') {
    return (
      <section className="section">
        <div className="container prose">
          <h1>Waiting for approval</h1>
          <p>
            {apt.patientName} with {apt.doctorName} on {apt.date} at {apt.time}. The video room opens
            after the clinician approves the visit.
          </p>
          <Link to={back} className="btn btn-primary">
            Back to appointments
          </Link>
        </div>
      </section>
    )
  }

  const callUrl = jitsiVisitUrl(apt.id, user.name)

  return (
    <div className="visit-page">
      <header className="visit-bar">
        <div>
          <p className="pill">Video visit</p>
          <h1>
            {apt.patientName} · {apt.doctorName}
          </h1>
          <p>
            {apt.specialty} · {apt.date} at {apt.time}
          </p>
        </div>
        <div className="row-actions">
          <a className="btn btn-outline" href={callUrl} target="_blank" rel="noreferrer">
            Open in new tab
          </a>
          <Link to={back} className="btn btn-primary">
            Leave
          </Link>
        </div>
      </header>
      <iframe
        className="visit-frame"
        title="Ubuzima Bwiza video visit"
        src={callUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
        allowFullScreen
      />
      <p className="visit-note">
        This visit is not for emergencies. If you have chest pain, trouble breathing, or severe
        bleeding, call 112 or SAMU 912.
      </p>
    </div>
  )
}
