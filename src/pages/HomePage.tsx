import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doctors, specialties } from '../data'

export function HomePage() {
  const navigate = useNavigate()
  const [specialty, setSpecialty] = useState('')
  const [careType, setCareType] = useState('')
  const [query, setQuery] = useState('')

  const onSearch = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (specialty) params.set('specialty', specialty)
    if (careType) params.set('type', careType)
    if (query.trim()) params.set('q', query.trim())
    navigate(`/doctors?${params.toString()}`)
  }

  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-grid">
          <div>
            <span className="pill">Trusted digital care</span>
            <h1>Book appointments with trusted doctors and hospitals</h1>
            <p>
              Find the right specialist, compare options and schedule your visit in just a few
              clicks – wherever you are in Rwanda.
            </p>

            <form className="search-card" id="find" onSubmit={onSearch}>
              <div className="search-grid">
                <div className="search-field">
                  <label htmlFor="specialty">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                    Speciality
                  </label>
                  <select
                    id="specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  >
                    <option value="">Select a speciality (e.g. cardiology, pediatrics...)</option>
                    {specialties.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="search-field">
                  <label htmlFor="careType">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4z" />
                    </svg>
                    Care type
                  </label>
                  <select
                    id="careType"
                    value={careType}
                    onChange={(e) => setCareType(e.target.value)}
                  >
                    <option value="">Choose Our doctors or hospital</option>
                    <option value="private">Our doctors</option>
                    <option value="hospital">Hospital</option>
                  </select>
                </div>

                <div className="search-field">
                  <label htmlFor="query">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Doctor or hospital
                  </label>
                  <input
                    id="query"
                    placeholder="Search by doctor or hospital name"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button className="btn btn-primary btn-full" type="submit">
                  Find a doctor
                </button>
              </div>
            </form>

            <div className="stats">
              <div className="stat">
                <strong>25K+</strong>
                <span>Happy patients</span>
              </div>
              <div className="stat">
                <strong>100+</strong>
                <span>Top-rated doctors</span>
              </div>
              <div className="stat">
                <strong>24/7</strong>
                <span>Digital access</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <img src="/assets/header.png" alt="Ubuzima Bwiza care" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Healthcare Connected For Every Profession.</h2>
          <p className="lead">
            Whether you&apos;re a doctor, a constructor, a farmer, or an artist, Ubuzima Bwiza
            Connect brings world-class medical consultation to your fingertips.
          </p>
          <div className="features">
            {[
              ['Verified Specialists', 'Credential-checked clinicians across major specialties.'],
              ['24/7 Digital Access', 'Chat, video visits, and emergency routing around the clock.'],
              ['Secure Health Vault', 'Encrypted history, prescriptions, and follow-ups in one place.'],
              ['AI-Powered Triage', 'Clear next steps before you meet a clinician.'],
            ].map(([title, body]) => (
              <article className="feature" key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <div className="ai-home-cta">
            <div>
              <h3>Try the AI Health Assistant</h3>
              <p>Describe symptoms in English or Kinyarwanda and get triage tips plus specialist booking suggestions.</p>
            </div>
            <Link to="/ai-assistant" className="btn btn-primary">
              Open AI assistant
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="specialists">
        <div className="container">
          <h2>Medical specialists you can trust</h2>
          <p className="lead">
            For every family member — our team of highly qualified and experienced doctors are
            committed to providing the best healthcare services.
          </p>
          <div className="doctors">
            {doctors.slice(0, 4).map((doctor) => (
              <article className="doctor-card" key={doctor.id}>
                <div className="doctor-top">
                  <div className="avatar">{doctor.initials}</div>
                  <div>
                    <h3>{doctor.name}</h3>
                    <p className="meta">
                      {doctor.specialty} · {doctor.hospital}
                    </p>
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
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="care">
        <div className="container">
          <div className="care-panel">
            <img src="/assets/about.png" alt="" />
            <div className="care-copy">
              <p className="eyebrow">Continuous Care Program</p>
              <h2>Do you have a chronic disease?</h2>
              <p>
                Connect with a dedicated doctor for continuous care and support diabetes,
                hypertension, asthma, heart disease and more.
              </p>
              <ul>
                <li>Assigned dedicated specialist</li>
                <li>Continuous chat &amp; video calls</li>
                <li>Personalized care plans</li>
                <li>Health tracking &amp; monitoring</li>
              </ul>
              <div className="tags">
                {['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease'].map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <Link to="/register" className="btn btn-primary">
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>What families are saying</h2>
          <p className="lead">
            Real stories from patients who use Ubuzima Bwiza to get trusted care faster.
          </p>
          <div className="stories">
            <article className="story">
              <blockquote>
                “Nabonye umuganga byihuse kandi byoroshye. Uko bampaye ubufasha kuri chat no gufata
                gahunda byatumye numva ntekanye.”
              </blockquote>
              <strong>Mukamana Aline</strong>
              <span>Patient · Kigali</span>
            </article>
            <article className="story">
              <blockquote>
                “Teleconsultation saved us hours of travel when my son had a fever. Care reached our
                home within hours.”
              </blockquote>
              <strong>Claudine Niyonzima</strong>
              <span>Mother of two</span>
            </article>
            <article className="story">
              <blockquote>
                “I booked a specialist without leaving my district. Continuous care for hypertension
                finally feels simple.”
              </blockquote>
              <strong>Patrick Habimana</strong>
              <span>Farmer · Musanze</span>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta">
            <h2>Join Rwanda&apos;s Most Trusted Medical Network</h2>
            <p>
              Create a free account today to access telemedicine, track your medical history, and
              book appointments with top-tier Rwandan specialists.
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn" style={{ background: '#fff', color: '#059669', padding: '0.9rem 1.5rem' }}>
                Get Started Now
              </Link>
              <a href="/#find" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
