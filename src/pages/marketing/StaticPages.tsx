import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <section className="section">
      <div className="container prose">
        <p className="pill">About Us</p>
        <h1>Healthcare Connected For Every Profession.</h1>
        <p>
          Whether you&apos;re a doctor, a constructor, a farmer, or an artist, Ubuzima Bwiza
          brings world-class medical consultation to your fingertips. We bridge the gap between
          professional care and daily life through seamless digital accessibility across Rwanda.
        </p>
        <div className="features" style={{ marginTop: '2rem' }}>
          {[
            ['Verified Specialists', 'Every clinician is credential-checked before joining.'],
            ['24/7 Digital Access', 'Chat, video, and emergency routing when care cannot wait.'],
            ['Secure Health Vault', 'Encrypted records and prescriptions in one place.'],
            ['AI-Powered Triage', 'Guided next steps before you meet a clinician.'],
          ].map(([title, body]) => (
            <article className="feature" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div style={{ marginTop: '2rem' }}>
          <Link to="/register" className="btn btn-primary">
            Join the network
          </Link>
        </div>
      </div>
    </section>
  )
}

export function ContactPage() {
  return (
    <section className="section">
      <div className="container prose">
        <p className="pill">Contact</p>
        <h1>Book An Appointment / Get in touch</h1>
        <p>
          Please feel welcome to contact our friendly reception staff with any general or medical
          enquiry. Our doctors will receive or return any urgent calls.
        </p>
        <div className="contact-grid">
          <form
            className="search-card"
            onSubmit={(e) => {
              e.preventDefault()
              alert('Message sent (demo).')
            }}
          >
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <input id="message" required />
            </div>
            <button className="btn btn-primary btn-full" type="submit">
              Send message
            </button>
          </form>
          <div className="feature">
            <h3>Contact information</h3>
            <p>KG 123 St, Kigali, Rwanda</p>
            <p>+250 788 123 456</p>
            <p>Emergency: +250 788 999 911</p>
            <p>info@ubuzimabwiza.com</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LegalPage({ title, body }: { title: string; body: string }) {
  return (
    <section className="section">
      <div className="container prose">
        <h1>{title}</h1>
        <p>{body}</p>
        <p>
          This local copy mirrors Ubuzima Bwiza policies for demonstration. Replace with
          your legal counsel&apos;s final language before production use.
        </p>
      </div>
    </section>
  )
}
