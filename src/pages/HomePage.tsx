import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { translateSpecialty, useAppText } from '../context/ContentContext'
import { doctors, specialties } from '../data'

const FEATURE_KEYS = [
  ['home.feature1Title', 'home.feature1Body'],
  ['home.feature2Title', 'home.feature2Body'],
  ['home.feature3Title', 'home.feature3Body'],
  ['home.feature4Title', 'home.feature4Body'],
] as const

const STORY_KEYS = [
  ['home.story1Quote', 'home.story1Name', 'home.story1Role'],
  ['home.story2Quote', 'home.story2Name', 'home.story2Role'],
  ['home.story3Quote', 'home.story3Name', 'home.story3Role'],
] as const

const CHRONIC_TAGS = ['home.chronicTag1', 'home.chronicTag2', 'home.chronicTag3', 'home.chronicTag4'] as const
const CHRONIC_BULLETS = [
  'home.chronicBullet1',
  'home.chronicBullet2',
  'home.chronicBullet3',
  'home.chronicBullet4',
] as const

export function HomePage() {
  const navigate = useNavigate()
  const { text, t } = useAppText()
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
            <span className="pill">{text('home.pill')}</span>
            <h1>{text('home.title')}</h1>
            <p>{text('home.subtitle')}</p>

            <form className="search-card" id="find" onSubmit={onSearch}>
              <div className="search-grid">
                <div className="search-field">
                  <label htmlFor="specialty">{text('home.specialty')}</label>
                  <select
                    id="specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  >
                    <option value="">{text('home.specialtyPlaceholder')}</option>
                    {specialties.map((item) => (
                      <option key={item} value={item}>
                        {translateSpecialty(item, t)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="search-field">
                  <label htmlFor="careType">{text('home.careType')}</label>
                  <select
                    id="careType"
                    value={careType}
                    onChange={(e) => setCareType(e.target.value)}
                  >
                    <option value="">{text('home.careTypePlaceholder')}</option>
                    <option value="private">{text('home.carePrivate')}</option>
                    <option value="hospital">{text('home.careHospital')}</option>
                  </select>
                </div>

                <div className="search-field">
                  <label htmlFor="query">{text('home.search')}</label>
                  <input
                    id="query"
                    placeholder={text('home.searchPlaceholder')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button className="btn btn-primary btn-full" type="submit">
                  {text('home.findDoctor')}
                </button>
              </div>
            </form>

            <div className="stats">
              <div className="stat">
                <strong>25K+</strong>
                <span>{text('home.statPatients')}</span>
              </div>
              <div className="stat">
                <strong>100+</strong>
                <span>{text('home.statDoctors')}</span>
              </div>
              <div className="stat">
                <strong>24/7</strong>
                <span>{text('home.statAccess')}</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <img src="/assets/header.png" alt={text('common.brand')} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>{text('home.featuresTitle')}</h2>
          <p className="lead">{text('home.featuresLead')}</p>
          <div className="features">
            {FEATURE_KEYS.map(([titleKey, bodyKey]) => (
              <article className="feature" key={titleKey}>
                <h3>{text(titleKey)}</h3>
                <p>{text(bodyKey)}</p>
              </article>
            ))}
          </div>
          <div className="ai-home-cta">
            <div>
              <h3>{text('home.aiCtaTitle')}</h3>
              <p>{text('home.aiCtaBody')}</p>
            </div>
            <Link to="/ai-assistant" className="btn btn-primary">
              {text('home.openAi')}
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="specialists">
        <div className="container">
          <h2>{text('home.specialistsTitle')}</h2>
          <p className="lead">{text('home.specialistsLead')}</p>
          <div className="doctors">
            {doctors.slice(0, 4).map((doctor) => (
              <article className="doctor-card" key={doctor.id}>
                <div className="doctor-top">
                  <div className="avatar">{doctor.initials}</div>
                  <div>
                    <h3>{doctor.name}</h3>
                    <p className="meta">
                      {translateSpecialty(doctor.specialty, t)} · {doctor.hospital}
                    </p>
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
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="care">
        <div className="container">
          <div className="care-panel">
            <img src="/assets/about.png" alt="" />
            <div className="care-copy">
              <p className="eyebrow">{text('home.chronicEyebrow')}</p>
              <h2>{text('home.chronicTitle')}</h2>
              <p>{text('home.chronicBody')}</p>
              <ul>
                {CHRONIC_BULLETS.map((key) => (
                  <li key={key}>{text(key)}</li>
                ))}
              </ul>
              <div className="tags">
                {CHRONIC_TAGS.map((key) => (
                  <span key={key}>{text(key)}</span>
                ))}
              </div>
              <Link to="/register" className="btn btn-primary">
                {text('home.joinNow')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>{text('home.storiesTitle')}</h2>
          <p className="lead">{text('home.storiesLead')}</p>
          <div className="stories">
            {STORY_KEYS.map(([quoteKey, nameKey, roleKey]) => (
              <article className="story" key={quoteKey}>
                <blockquote>{text(quoteKey)}</blockquote>
                <strong>{text(nameKey)}</strong>
                <span>{text(roleKey)}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta">
            <h2>{text('home.ctaTitle')}</h2>
            <p>{text('home.ctaBody')}</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-cta-light">
                {text('home.ctaPrimary')}
              </Link>
              <a href="/#find" className="btn btn-outline btn-cta-outline">
                {text('home.ctaSecondary')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
