import { Link } from 'react-router-dom'
import { useAppText } from '../../context/ContentContext'
import { useToast } from '../../context/ToastContext'

const ABOUT_FEATURES = [
  ['home.feature1Title', 'home.feature1Body'],
  ['home.feature2Title', 'home.feature2Body'],
  ['home.feature3Title', 'home.feature3Body'],
  ['home.feature4Title', 'home.feature4Body'],
] as const

export function AboutPage() {
  const { text } = useAppText()

  return (
    <section className="section">
      <div className="container prose">
        <p className="pill">{text('about.pill')}</p>
        <h1>{text('about.title')}</h1>
        <p>{text('about.body')}</p>
        <div className="features" style={{ marginTop: '2rem' }}>
          {ABOUT_FEATURES.map(([titleKey, bodyKey]) => (
            <article className="feature" key={titleKey}>
              <h3>{text(titleKey)}</h3>
              <p>{text(bodyKey)}</p>
            </article>
          ))}
        </div>
        <div style={{ marginTop: '2rem' }}>
          <Link to="/register" className="btn btn-primary">
            {text('about.join')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export function ContactPage() {
  const { text } = useAppText()
  const { notify } = useToast()

  return (
    <section className="section">
      <div className="container prose">
        <p className="pill">{text('contact.pill')}</p>
        <h1>{text('contact.title')}</h1>
        <p>{text('contact.body')}</p>
        <div className="contact-grid">
          <form
            className="search-card"
            onSubmit={(e) => {
              e.preventDefault()
              notify(text('contact.sentDemo'))
            }}
          >
            <div className="field">
              <label htmlFor="name">{text('contact.fullName')}</label>
              <input id="name" required />
            </div>
            <div className="field">
              <label htmlFor="email">{text('contact.email')}</label>
              <input id="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="message">{text('contact.message')}</label>
              <input id="message" required />
            </div>
            <button className="btn btn-primary btn-full" type="submit">
              {text('contact.send')}
            </button>
          </form>
          <div className="feature">
            <h3>{text('contact.infoTitle')}</h3>
            <p>{text('contact.address')}</p>
            <p>{text('contact.phone')}</p>
            <p>{text('contact.emergency')}</p>
            <p>{text('contact.emailValue')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const { text } = useAppText()
  const titleKey = kind === 'privacy' ? 'legal.privacyTitle' : 'legal.termsTitle'
  const bodyKey = kind === 'privacy' ? 'legal.privacyBody' : 'legal.termsBody'

  return (
    <section className="section">
      <div className="container prose">
        <h1>{text(titleKey)}</h1>
        <p>{text(bodyKey)}</p>
        <p>{text('legal.disclaimer')}</p>
      </div>
    </section>
  )
}
