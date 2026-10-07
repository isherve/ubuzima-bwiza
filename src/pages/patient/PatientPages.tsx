import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, StatGrid, StatusBadge } from '../../components/dashboard/Shell'
import { AiChat, MessagesChat } from '../../components/AiChat'
import { useAuth } from '../../context/AuthContext'
import { useAppText } from '../../context/ContentContext'
import { useToast } from '../../context/ToastContext'
import { medications, records } from '../../data'
import { downloadAppointmentIcs } from '../../lib/calendar'
import { JoinVideoButton } from '../../components/JoinVideoButton'
import { askHealthAi } from '../../lib/aiClient'
import {
  appointmentsTableHtml,
  downloadAppointmentsCsv,
  downloadPrintableReport,
} from '../../lib/reports'

export function PatientAppointmentsPage() {
  const { t } = useAppText()
  const { user, appointments } = useAuth()
  const mine = appointments.filter((a) => a.patientName === user?.name)

  return (
    <div className="stack">
      <StatGrid
        items={[
          { label: t('patient.total'), value: mine.length },
          { label: t('patient.approved'), value: mine.filter((a) => a.status === 'approved').length },
          { label: t('patient.unpaid'), value: mine.filter((a) => a.paymentStatus !== 'paid').length },
        ]}
      />
      <div className="toolbar">
        <h2>{t('patient.myAppointments')}</h2>
        <div className="row-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              downloadAppointmentsCsv(mine, `ubuzima-appointments-${Date.now()}.csv`)
              downloadPrintableReport({
                title: t('patient.myAppointments'),
                subtitle: `${user?.name ?? 'Patient'} | Ubuzima Bwiza`,
                htmlBody: appointmentsTableHtml(mine),
              })
            }}
          >
            {t('common.downloadReport')}
          </button>
          <Link to="/doctors" className="btn btn-primary">
            {t('common.bookNew')}
          </Link>
        </div>
      </div>
      <div className="table">
        {mine.length === 0 ? (
          <EmptyState text={t('ui.noAppointments')} />
        ) : (
          mine.map((apt) => (
            <div className="table-row" key={apt.id}>
              <div>
                <strong>{apt.doctorName}</strong>
                <p>
                  {t(`specialties.${apt.specialty}`, { defaultValue: apt.specialty })} | {apt.date} {t('ui.at')} {apt.time} | {apt.type === 'video' ? t('ui.videoShort') : t('ui.inPersonShort')} |{' '}
                  {(apt.amount ?? 0).toLocaleString()} RWF
                </p>
              </div>
              <div className="row-actions">
                <StatusBadge status={apt.status} />
                <StatusBadge status={apt.paymentStatus ?? 'unpaid'} />
                <JoinVideoButton apt={apt} />
                {apt.paymentStatus !== 'paid' ? (
                  <Link to={`/pay/${apt.id}`} className="btn btn-primary">
                    {t('ui.payInvoice')}
                  </Link>
                ) : (
                  <Link to="/payments" className="btn btn-outline">
                    {t('ui.receipt')}
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => downloadAppointmentIcs(apt)}
                >
                  {t('ui.addCalendar')}
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
  const { t } = useAppText()
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
      setTip(t('ui.medFallback'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stack">
      <div className="toolbar">
        <h2>{t('ui.medicationsTitle')}</h2>
        <button type="button" className="btn btn-outline" onClick={() => void askAboutMeds()} disabled={loading}>
          {loading ? t('ui.askingAi') : t('ui.aiMedTips')}
        </button>
      </div>
      <div className="table">
        {medications.map((med) => (
          <div className="table-row" key={med.id}>
            <div>
              <strong>{med.name}</strong>
              <p>{med.dose}</p>
            </div>
            <span className="meta">{med.remaining}</span>
          </div>
        ))}
      </div>
      {tip ? <p className="success">{tip}</p> : null}
    </div>
  )
}

export function MedicalRecordPage() {
  const { t } = useAppText()
  return (
    <div className="stack">
      <h2>{t('ui.vault')}</h2>
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
  const { t } = useAppText()
  const items = ['home.chronicBullet1', 'home.chronicBullet2', 'home.chronicBullet3', 'home.chronicBullet4']
  return (
    <div className="stack">
      <h2>{t('home.chronicEyebrow')}</h2>
      <p className="lead">{t('ui.chronicLead')}</p>
      <div className="features">
        {items.map((item) => (
          <article className="feature" key={item}>
            <h3>{t(item)}</h3>
            <p>{t('ui.included')}</p>
          </article>
        ))}
      </div>
      <Link to="/patient/chronic-care/apply" className="btn btn-primary">
        {t('ui.applyJoin')}
      </Link>
    </div>
  )
}

export function ChronicCareApplyPage() {
  const { t } = useAppText()
  const { notify } = useToast()
  return (
    <div className="stack">
      <h2>{t('ui.applyTitle')}</h2>
      <form
        className="search-card auth-form"
        onSubmit={(e) => {
          e.preventDefault()
          notify(t('ui.applicationSent'))
        }}
      >
        <div className="field">
          <label htmlFor="condition">{t('ui.condition')}</label>
          <select id="condition" required defaultValue={t('home.chronicTag1')}>
            <option>{t('home.chronicTag1')}</option>
            <option>{t('home.chronicTag2')}</option>
            <option>{t('home.chronicTag3')}</option>
            <option>{t('home.chronicTag4')}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="notes">{t('ui.extraNotes')}</label>
          <input id="notes" placeholder={t('ui.notesPlaceholder')} />
        </div>
        <button className="btn btn-primary" type="submit">
          {t('ui.submitApplication')}
        </button>
      </form>
    </div>
  )
}

export function AiAssistantPage() {
  const { t } = useAppText()
  return <AiChat title={t('ai.title')} subtitle={t('ai.subtitle')} />
}

export function ProfilePage() {
  const { t } = useAppText()
  const { user } = useAuth()
  const roleLabel =
    user?.role === 'doctor'
      ? t('auth.roleDoctor')
      : user?.role === 'hospital'
        ? t('auth.roleHospital')
        : user?.role === 'admin'
          ? t('ui.roleAdmin')
          : t('auth.rolePatient')
  return (
    <div className="stack">
      <h2>{t('ui.myProfile')}</h2>
      <div className="feature">
        <p>
          <strong>{t('ui.name')}:</strong> {user?.name}
        </p>
        <p>
          <strong>{t('ui.email')}:</strong> {user?.email}
        </p>
        <p>
          <strong>{t('ui.role')}:</strong> {roleLabel}
        </p>
        {user?.phone ? (
          <p>
            <strong>{t('ui.phone')}:</strong> {user.phone}
          </p>
        ) : null}
      </div>
    </div>
  )
}
