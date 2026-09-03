import { Link } from 'react-router-dom'
import { useAppText } from '../context/ContentContext'

const FAQS = [
  ['help.q1', 'help.a1'],
  ['help.q2', 'help.a2'],
  ['help.q3', 'help.a3'],
  ['help.q4', 'help.a4'],
  ['help.q5', 'help.a5'],
  ['help.q6', 'help.a6'],
] as const

export function HelpPage() {
  const { t } = useAppText()

  return (
    <section className="section">
      <div className="container prose">
        <p className="pill">{t('help.pill')}</p>
        <h1>{t('help.title')}</h1>
        <p>{t('help.lead')}</p>
        <div className="faq-list">
          {FAQS.map(([q, a]) => (
            <details className="faq-item" key={q}>
              <summary>{t(q)}</summary>
              <p>{t(a)}</p>
            </details>
          ))}
        </div>
        <div className="row-actions" style={{ marginTop: '1.5rem' }}>
          <Link to="/contact" className="btn btn-primary">
            {t('nav.contact')}
          </Link>
          <Link to="/ai-assistant" className="btn btn-outline">
            {t('nav.aiAssistant')}
          </Link>
        </div>
      </div>
    </section>
  )
}
