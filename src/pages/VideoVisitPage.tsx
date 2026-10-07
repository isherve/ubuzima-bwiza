import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ConsultChat } from '../components/ConsultChat'
import { useAuth } from '../context/AuthContext'
import { useAppText } from '../context/ContentContext'
import {
  appointmentsBackPath,
  canAccessVideoVisit,
  jitsiVisitUrl,
} from '../lib/videoVisit'

export function VideoVisitPage() {
  const { t } = useAppText()
  const { id = '' } = useParams()
  const { user, appointments, ready } = useAuth()
  const apt = appointments.find((item) => item.id === id)
  const back = appointmentsBackPath(user?.role)
  const [live, setLive] = useState(false)
  const [withVideo, setWithVideo] = useState(true)

  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  if (!apt || !canAccessVideoVisit(user, apt)) {
    return (
      <section className="section">
        <div className="container prose">
          <h1>{t('ui.consultUnavailable')}</h1>
          <p>{t('ui.consultUnavailableBody')}</p>
          <Link to={back} className="btn btn-primary">
            {t('ui.backAppointments')}
          </Link>
        </div>
      </section>
    )
  }

  if (apt.status !== 'approved') {
    return (
      <section className="section">
        <div className="container prose">
          <h1>{t('ui.waitingApproval')}</h1>
          <p>
            {t('ui.waitingBody', {
              patient: apt.patientName,
              doctor: apt.doctorName,
              date: apt.date,
              time: apt.time,
            })}
          </p>
          <Link to={back} className="btn btn-primary">
            {t('ui.backAppointments')}
          </Link>
        </div>
      </section>
    )
  }

  const otherName = user.role === 'patient' || user.role === 'admin' ? apt.doctorName : apt.patientName
  const callUrl = jitsiVisitUrl(apt.id, user.name, withVideo)

  return (
    <div className="consult-shell">
      <section className="consult-stage">
        <header className="visit-bar">
          <div>
            <p className="pill">{t('ui.privateConsult')}</p>
            <h1>{t('ui.talkWith', { name: otherName })}</h1>
            <p>
              {t(`specialties.${apt.specialty}`, { defaultValue: apt.specialty })} · {apt.date} {t('ui.at')} {apt.time}
            </p>
          </div>
          <div className="row-actions">
            {live ? (
              <button className="btn btn-outline" type="button" onClick={() => setLive(false)}>
                {t('ui.hideVideo')}
              </button>
            ) : null}
            <Link to={back} className="btn btn-primary">
              {t('ui.endVisit')}
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
            <h2>{t('ui.readyTalk', { name: otherName })}</h2>
            <p>{t('ui.readyBody')}</p>
            <div className="row-actions consult-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  setWithVideo(true)
                  setLive(true)
                }}
              >
                {t('ui.startVideo')}
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => {
                  setWithVideo(false)
                  setLive(true)
                }}
              >
                {t('ui.chatOnly')}
              </button>
            </div>
            <p className="visit-note">{t('ui.notEmergency')}</p>
          </div>
        )}
      </section>

      <aside className="consult-side">
        <div className="consult-side-head">
          <h2>{t('ui.messages')}</h2>
          <p>{t('ui.sharedChat', { name: otherName })}</p>
        </div>
        <ConsultChat appointmentId={apt.id} user={user} />
      </aside>
    </div>
  )
}
