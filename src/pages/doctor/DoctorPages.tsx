import { EmptyState, StatGrid, StatusBadge } from '../../components/dashboard/Shell'
import { JoinVideoButton } from '../../components/JoinVideoButton'
import { useAuth } from '../../context/AuthContext'
import { translateSpecialty, useAppText } from '../../context/ContentContext'
import { doctors } from '../../data'

export function DoctorDashboardPage() {
  const { t } = useAppText()
  const { appointments, user } = useAuth()
  const mine = appointments.filter((a) => a.doctorName === user?.name || a.doctorId === 'doc1')

  return (
    <div className="stack">
      <StatGrid
        items={[
          { label: t('doctor.appointments'), value: mine.length },
          { label: t('ui.pendingApprovals'), value: mine.filter((a) => a.status === 'pending').length },
          { label: t('status.completed'), value: mine.filter((a) => a.status === 'completed').length },
          { label: t('ui.patientsToday'), value: mine.filter((a) => a.date === '2026-07-23').length || 1 },
        ]}
      />
      <h2>{t('doctor.todayOverview')}</h2>
      <p className="lead">{t('ui.doctorLead')}</p>
    </div>
  )
}

export function DoctorAppointmentsPage() {
  const { t } = useAppText()
  const { appointments, user, updateAppointmentStatus } = useAuth()
  const mine = appointments.filter((a) => a.doctorName === user?.name || a.doctorId === 'doc1')

  return (
    <div className="stack">
      <h2>{t('ui.doctorAppointments')}</h2>
      <div className="table">
        {mine.length === 0 ? (
          <EmptyState text={t('ui.noneAssigned')} />
        ) : (
          mine.map((apt) => (
            <div className="table-row" key={apt.id}>
              <div>
                <strong>{apt.patientName}</strong>
                <p>
                  {apt.date} {t('ui.at')} {apt.time} | {apt.type === 'video' ? t('ui.videoShort') : t('ui.inPersonShort')}
                  {apt.notes ? ` | ${apt.notes}` : ''}
                </p>
              </div>
              <div className="row-actions">
                <StatusBadge status={apt.status} />
                <JoinVideoButton apt={apt} />
                {apt.status === 'pending' ? (
                  <>
                    <button className="btn btn-primary" type="button" onClick={() => updateAppointmentStatus(apt.id, 'approved')}>
                      {t('common.approve')}
                    </button>
                    <button className="btn btn-outline" type="button" onClick={() => updateAppointmentStatus(apt.id, 'rejected')}>
                      {t('common.reject')}
                    </button>
                  </>
                ) : null}
                {apt.status === 'approved' ? (
                  <button className="btn btn-outline" type="button" onClick={() => updateAppointmentStatus(apt.id, 'completed')}>
                    {t('common.complete')}
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function DoctorCalendarPage() {
  const { t } = useAppText()
  const { appointments, user } = useAuth()
  const mine = appointments.filter((a) => a.doctorName === user?.name || a.doctorId === 'doc1')
  return (
    <div className="stack">
      <h2>{t('doctor.calendar')}</h2>
      <div className="table">
        {mine.map((apt) => (
          <div className="table-row" key={apt.id}>
            <div>
              <strong>
                {apt.date} | {apt.time}
              </strong>
              <p>
                {apt.patientName} | {apt.type === 'video' ? t('ui.videoShort') : t('ui.inPersonShort')}
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

export function DoctorPatientsPage() {
  const { t } = useAppText()
  const { appointments, user } = useAuth()
  const mine = appointments.filter((a) => a.doctorName === user?.name || a.doctorId === 'doc1')
  const names = [...new Set(mine.map((a) => a.patientName))]
  return (
    <div className="stack">
      <h2>{t('doctor.patients')}</h2>
      <div className="table">
        {names.map((name) => (
          <div className="table-row" key={name}>
            <div>
              <strong>{name}</strong>
              <p>{t('ui.visitsOnRecord', { count: mine.filter((a) => a.patientName === name).length })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DoctorAvailabilityPage() {
  const { t } = useAppText()
  const slots = ['ui.slot1', 'ui.slot2', 'ui.slot3', 'ui.slot4']
  return (
    <div className="stack">
      <h2>{t('doctor.availability')}</h2>
      <div className="features">
        {slots.map((slot) => (
          <article className="feature" key={slot}>
            <h3>{t(slot)}</h3>
            <p>{t('ui.availabilityNote')}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

export function DoctorProfilePageDash() {
  const { t, text } = useAppText()
  const { user } = useAuth()
  const doctor = doctors.find((d) => d.name === user?.name) ?? doctors[0]
  return (
    <div className="stack">
      <h2>{t('ui.doctorProfile')}</h2>
      <div className="feature">
        <p>
          <strong>{doctor.name}</strong>
        </p>
        <p>
          {translateSpecialty(doctor.specialty, t)} | {doctor.hospital}
        </p>
        <p>{text(`doctors.${doctor.id}Bio`, doctor.bio)}</p>
        <p>{t('ui.fee')}: {doctor.fee.toLocaleString()} RWF</p>
      </div>
    </div>
  )
}
