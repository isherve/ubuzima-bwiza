import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/dashboard/Shell'
import { useAuth } from '../context/AuthContext'
import { translateSpecialty, useAppText } from '../context/ContentContext'
import { doctors, specialties } from '../data'
import { askHealthAi } from '../lib/aiClient'

export function DoctorsPage() {
  const { t } = useAppText()
  const [params] = useSearchParams()
  const specialty = params.get('specialty')?.toLowerCase() ?? ''
  const query = params.get('q')?.toLowerCase() ?? ''
  const [filter, setFilter] = useState(specialty)

  const filtered = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSpecialty = filter
        ? doctor.specialty.toLowerCase().includes(filter.split(' ')[0] ?? '')
        : true
      const matchesQuery = query
        ? `${doctor.name} ${doctor.hospital} ${doctor.specialty}`.toLowerCase().includes(query)
        : true
      return matchesSpecialty && matchesQuery
    })
  }, [filter, query])

  return (
    <section className="section" style={{ paddingTop: '1.5rem' }}>
      <div className="container">
        <p className="pill">{t('ui.directory')}</p>
        <h1>{t('doctors.title')}</h1>
        <p className="lead">{t('ui.doctorsLead')}</p>

        <div className="filter-bar">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">{t('doctors.allSpecialties')}</option>
            {specialties.map((item) => (
              <option key={item} value={item.toLowerCase()}>
                {translateSpecialty(item, t)}
              </option>
            ))}
          </select>
        </div>

        <div className="doctors">
          {filtered.length === 0 ? (
            <EmptyState text={t('doctors.noMatch')} />
          ) : (
            filtered.map((doctor) => (
              <article className="doctor-card" key={doctor.id}>
                <div className="doctor-top">
                  <div className="avatar">{doctor.initials}</div>
                  <div>
                    <h3>{doctor.name}</h3>
                    <p className="meta">
                      {translateSpecialty(doctor.specialty, t)} | {doctor.hospital}
                    </p>
                    <p className="meta">
                      {doctor.rating} ({doctor.reviews} {t('ui.reviews')}) | {doctor.fee.toLocaleString()} RWF
                    </p>
                    <p className="meta">{doctor.available ? t('doctors.availableToday') : t('ui.nextSlots')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/book/${doctor.id}`} className="btn btn-primary">
                    {t('common.book')}
                  </Link>
                  <Link to={`/doctors/${doctor.id}`} className="btn btn-outline">
                    {t('common.profile')}
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export function DoctorProfilePage() {
  const { t, text } = useAppText()
  const { id } = useParams()
  const doctor = doctors.find((d) => d.id === id)
  if (!doctor) return <EmptyState text={t('ui.doctorNotFound')} />

  return (
    <section className="section">
      <div className="container prose">
        <div className="doctor-top" style={{ marginBottom: '1.25rem' }}>
          <div className="avatar" style={{ width: '4rem', height: '4rem' }}>
            {doctor.initials}
          </div>
          <div>
            <h1>{doctor.name}</h1>
            <p className="meta">
              {translateSpecialty(doctor.specialty, t)} | {doctor.hospital}
            </p>
          </div>
        </div>
        <p>{text(`doctors.${doctor.id}Bio`, doctor.bio)}</p>
        <p className="meta" style={{ marginTop: '0.75rem' }}>
          {t('ui.consultationFee')}: {doctor.fee.toLocaleString()} RWF | {doctor.rating} ({doctor.reviews}{' '}
          {t('ui.reviews')})
        </p>
        <div style={{ marginTop: '1.25rem' }}>
          <Link to={`/book/${doctor.id}`} className="btn btn-primary">
            {t('ui.bookAppointment')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export function BookAppointmentPage() {
  const { t } = useAppText()
  const { id } = useParams()
  const { user, bookAppointment } = useAuth()
  const navigate = useNavigate()
  const doctor = doctors.find((d) => d.id === id)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [type, setType] = useState<'in-person' | 'video'>('video')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')
  const [aiTip, setAiTip] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  if (!doctor) return <EmptyState text={t('ui.doctorNotFound')} />

  const askAiPrep = async () => {
    setAiLoading(true)
    try {
      const result = await askHealthAi([
        {
          role: 'user',
          content: `I am booking ${doctor.name} (${doctor.specialty}). Help me write short visit notes and 3 questions to ask. Reason: ${notes || 'general consultation'}.`,
        },
      ])
      setAiTip(result.reply)
      if (!notes.trim()) {
        setNotes(result.reply.split('\n')[0]?.slice(0, 120) || '')
      }
    } catch {
      setAiTip(t('ui.aiFallback'))
    } finally {
      setAiLoading(false)
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    void bookAppointment({ doctorId: doctor.id, date, time, type, notes }).then((result) => {
    setMessage(result.message)
    if (result.ok) {
      window.setTimeout(
        () => navigate(result.appointmentId ? `/pay/${result.appointmentId}` : '/payments'),
        700,
      )
    }
    })
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <p className="pill">{t('ui.booking')}</p>
        <h1>{t('ui.bookWith', { name: doctor.name })}</h1>
        <p className="lead">
          {translateSpecialty(doctor.specialty, t)} · {doctor.hospital}
        </p>
        <div className="pay-invoice" style={{ marginBottom: '1.25rem' }}>
          <div className="pay-invoice-head">
            <div>
              <p className="eyebrow">{t('ui.consultationFee')}</p>
              <h3>{doctor.name}</h3>
            </div>
            <strong>{doctor.fee.toLocaleString()} RWF</strong>
          </div>
          <p className="field-hint">{t('ui.feeNext')}</p>
        </div>
        <form className="search-card auth-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="date">{t('ui.date')} *</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="time">{t('ui.time')} *</label>
            <select id="time" value={time} onChange={(e) => setTime(e.target.value)}>
              {['09:00', '10:00', '11:00', '14:00', '15:30', '16:30'].map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="type">{t('ui.visitType')} *</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'in-person' | 'video')}
            >
              <option value="video">{t('ui.video')}</option>
              <option value="in-person">{t('ui.inPerson')}</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="notes">{t('ui.notes')}</label>
            <input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('ui.symptoms')} />
          </div>
          <button type="button" className="btn btn-outline" onClick={() => void askAiPrep()} disabled={aiLoading}>
            {aiLoading ? t('ui.aiPreparing') : t('ui.aiPrepare')}
          </button>
          {aiTip ? <p className="success">{aiTip}</p> : null}
          <button className="btn btn-primary btn-full" type="submit">
            {user ? t('ui.confirmPay') : t('ui.loginToBook')}
          </button>
          {message ? <p className="success">{message}</p> : null}
        </form>
      </div>
    </section>
  )
}
