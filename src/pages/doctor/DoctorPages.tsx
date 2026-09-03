import { EmptyState, StatGrid, StatusBadge } from '../../components/dashboard/Shell'
import { useAuth } from '../../context/AuthContext'
import { doctors } from '../../data'

export function DoctorDashboardPage() {
  const { appointments, user } = useAuth()
  const mine = appointments.filter((a) => a.doctorName === user?.name || a.doctorId === 'doc1')

  return (
    <div className="stack">
      <StatGrid
        items={[
          { label: 'Appointments', value: mine.length },
          { label: 'Pending approvals', value: mine.filter((a) => a.status === 'pending').length },
          { label: 'Completed', value: mine.filter((a) => a.status === 'completed').length },
          { label: 'Patients today', value: mine.filter((a) => a.date === '2026-07-23').length || 1 },
        ]}
      />
      <h2>Today&apos;s overview</h2>
      <p className="lead">Manage consultations, approvals, notes, and patient follow-ups.</p>
    </div>
  )
}

export function DoctorAppointmentsPage() {
  const { appointments, user, updateAppointmentStatus } = useAuth()
  const mine = appointments.filter((a) => a.doctorName === user?.name || a.doctorId === 'doc1')

  return (
    <div className="stack">
      <h2>Doctor appointments</h2>
      <div className="table">
        {mine.length === 0 ? (
          <EmptyState text="No appointments assigned." />
        ) : (
          mine.map((apt) => (
            <div className="table-row" key={apt.id}>
              <div>
                <strong>{apt.patientName}</strong>
                <p>
                  {apt.date} at {apt.time} | {apt.type}
                  {apt.notes ? ` | ${apt.notes}` : ''}
                </p>
              </div>
              <div className="row-actions">
                <StatusBadge status={apt.status} />
                {apt.status === 'pending' ? (
                  <>
                    <button className="btn btn-primary" type="button" onClick={() => updateAppointmentStatus(apt.id, 'approved')}>
                      Approve
                    </button>
                    <button className="btn btn-outline" type="button" onClick={() => updateAppointmentStatus(apt.id, 'rejected')}>
                      Reject
                    </button>
                  </>
                ) : null}
                {apt.status === 'approved' ? (
                  <button className="btn btn-outline" type="button" onClick={() => updateAppointmentStatus(apt.id, 'completed')}>
                    Complete
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
  const { appointments, user } = useAuth()
  const mine = appointments.filter((a) => a.doctorName === user?.name || a.doctorId === 'doc1')
  return (
    <div className="stack">
      <h2>Calendar</h2>
      <div className="table">
        {mine.map((apt) => (
          <div className="table-row" key={apt.id}>
            <div>
              <strong>
                {apt.date} | {apt.time}
              </strong>
              <p>
                {apt.patientName} | {apt.type}
              </p>
            </div>
            <StatusBadge status={apt.status} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DoctorPatientsPage() {
  const { appointments, user } = useAuth()
  const mine = appointments.filter((a) => a.doctorName === user?.name || a.doctorId === 'doc1')
  const names = [...new Set(mine.map((a) => a.patientName))]
  return (
    <div className="stack">
      <h2>Patients</h2>
      <div className="table">
        {names.map((name) => (
          <div className="table-row" key={name}>
            <div>
              <strong>{name}</strong>
              <p>{mine.filter((a) => a.patientName === name).length} visits on record</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DoctorAvailabilityPage() {
  return (
    <div className="stack">
      <h2>Availability</h2>
      <div className="features">
        {['Mon to Fri 09:00 to 16:30', 'Sat 09:00 to 12:00', 'Teleconsult slots daily', 'Emergency callback on-call'].map(
          (slot) => (
            <article className="feature" key={slot}>
              <h3>{slot}</h3>
              <p>Editable in production scheduling settings.</p>
            </article>
          ),
        )}
      </div>
    </div>
  )
}

export function DoctorProfilePageDash() {
  const { user } = useAuth()
  const doctor = doctors.find((d) => d.name === user?.name) ?? doctors[0]
  return (
    <div className="stack">
      <h2>Doctor profile</h2>
      <div className="feature">
        <p>
          <strong>{doctor.name}</strong>
        </p>
        <p>
          {doctor.specialty} | {doctor.hospital}
        </p>
        <p>{doctor.bio}</p>
        <p>Fee: {doctor.fee.toLocaleString()} RWF</p>
      </div>
    </div>
  )
}
