import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/dashboard/Shell'
import { useAuth } from '../context/AuthContext'
import { doctors, specialties } from '../data'
import { askHealthAi } from '../lib/aiClient'

export function DoctorsPage() {
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
        <p className="pill">Directory</p>
        <h1>Medical specialists you can trust</h1>
        <p className="lead">Browse verified doctors across Rwanda and book in a few clicks.</p>

        <div className="filter-bar">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All specialties</option>
            {specialties.map((item) => (
              <option key={item} value={item.toLowerCase()}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="doctors">
          {filtered.length === 0 ? (
            <EmptyState text="No specialists matched your search." />
          ) : (
            filtered.map((doctor) => (
              <article className="doctor-card" key={doctor.id}>
                <div className="doctor-top">
                  <div className="avatar">{doctor.initials}</div>
                  <div>
                    <h3>{doctor.name}</h3>
                    <p className="meta">
                      {doctor.specialty} · {doctor.hospital}
                    </p>
                    <p className="meta">
                      {doctor.rating} ★ · {doctor.reviews} reviews · {doctor.fee.toLocaleString()} RWF
                    </p>
                    <p className="meta">{doctor.available ? 'Available today' : 'Next slots tomorrow'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/book/${doctor.id}`} className="btn btn-primary">
                    Book
                  </Link>
                  <Link to={`/doctors/${doctor.id}`} className="btn btn-outline">
                    Profile
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
  const { id } = useParams()
  const doctor = doctors.find((d) => d.id === id)
  if (!doctor) return <EmptyState text="Doctor not found." />

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
              {doctor.specialty} · {doctor.hospital}
            </p>
          </div>
        </div>
        <p>{doctor.bio}</p>
        <p className="meta" style={{ marginTop: '0.75rem' }}>
          Consultation fee: {doctor.fee.toLocaleString()} RWF · {doctor.rating} ★ ({doctor.reviews}{' '}
          reviews)
        </p>
        <div style={{ marginTop: '1.25rem' }}>
          <Link to={`/book/${doctor.id}`} className="btn btn-primary">
            Book appointment
          </Link>
        </div>
      </div>
    </section>
  )
}

export function BookAppointmentPage() {
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

  if (!doctor) return <EmptyState text="Doctor not found." />

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
      setAiTip('Bring a list of medications, allergies, and when symptoms started.')
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
    const result = bookAppointment({ doctorId: doctor.id, date, time, type, notes })
    setMessage(result.message)
    if (result.ok) {
      window.setTimeout(
        () => navigate(result.appointmentId ? `/pay/${result.appointmentId}` : '/payments'),
        700,
      )
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <p className="pill">Booking</p>
        <h1>Book with {doctor.name}</h1>
        <p className="lead">
          {doctor.specialty} · {doctor.fee.toLocaleString()} RWF
        </p>
        <form className="search-card auth-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="date">Date *</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="time">Time *</label>
            <select id="time" value={time} onChange={(e) => setTime(e.target.value)}>
              {['09:00', '10:00', '11:00', '14:00', '15:30', '16:30'].map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="type">Visit type *</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'in-person' | 'video')}
            >
              <option value="video">Video consultation</option>
              <option value="in-person">In-person</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="notes">Notes</label>
            <input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Symptoms or reason" />
          </div>
          <button type="button" className="btn btn-outline" onClick={() => void askAiPrep()} disabled={aiLoading}>
            {aiLoading ? 'AI preparing…' : '✦ AI prepare visit notes'}
          </button>
          {aiTip ? <p className="success">{aiTip}</p> : null}
          <button className="btn btn-primary btn-full" type="submit">
            {user ? 'Confirm booking' : 'Login to book'}
          </button>
          {message ? <p className="success">{message}</p> : null}
        </form>
      </div>
    </section>
  )
}
