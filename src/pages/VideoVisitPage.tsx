import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ConsultChat } from '../components/ConsultChat'
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
  const [live, setLive] = useState(false)
  const [withVideo, setWithVideo] = useState(true)

  if (!user) return <Navigate to="/login" replace />
  if (!apt || !canAccessVideoVisit(user, apt)) {
    return (
      <section className="section">
        <div className="container prose">
          <h1>Consultation unavailable</h1>
          <p>This visit is not available, or it is an in-person appointment.</p>
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
            {apt.patientName} with {apt.doctorName} on {apt.date} at {apt.time}. Chat and video open
            after the clinician approves the visit.
          </p>
          <Link to={back} className="btn btn-primary">
            Back to appointments
          </Link>
        </div>
      </section>
    )
  }

  const otherName = user.role === 'patient' || user.role === 'admin' ? apt.doctorName : apt.patientName
  const otherRole = user.role === 'patient' ? 'your doctor' : 'the patient'
  const callUrl = jitsiVisitUrl(apt.id, user.name, withVideo)

  return (
    <div className="consult-shell">
      <section className="consult-stage">
        <header className="visit-bar">
          <div>
            <p className="pill">Private consultation</p>
            <h1>Talk with {otherName}</h1>
            <p>
              {apt.specialty} · {apt.date} at {apt.time}
            </p>
          </div>
          <div className="row-actions">
            {live ? (
              <button className="btn btn-outline" type="button" onClick={() => setLive(false)}>
                Hide video
              </button>
            ) : null}
            <Link to={back} className="btn btn-primary">
              End visit
            </Link>
          </div>
        </header>

        {live ? (
          <iframe
            className="visit-frame"
            title="Ubuzima Bwiza video visit"
            src={callUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
            allowFullScreen
          />
        ) : (
          <div className="consult-waiting">
            <div className="avatar consult-avatar">{otherName.slice(0, 2).toUpperCase()}</div>
            <h2>Ready to talk with {otherName}</h2>
            <p>
              Message {otherRole} on the right, then start video when both of you are ready. You stay
              in the same private room.
            </p>
            <div className="row-actions consult-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  setWithVideo(true)
                  setLive(true)
                }}
              >
                Start video call
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => {
                  setWithVideo(false)
                  setLive(true)
                }}
              >
                Join with chat only
              </button>
            </div>
            <p className="visit-note">
              Not for emergencies. Call 112 or SAMU 912 for chest pain, breathing trouble, or severe
              bleeding.
            </p>
          </div>
        )}
      </section>

      <aside className="consult-side">
        <div className="consult-side-head">
          <h2>Messages</h2>
          <p>You and {otherName} see this conversation.</p>
        </div>
        <ConsultChat appointmentId={apt.id} user={user} />
      </aside>
    </div>
  )
}
