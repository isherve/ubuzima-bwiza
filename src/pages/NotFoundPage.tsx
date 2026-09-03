import { Link } from 'react-router-dom'
import { Footer, Navbar } from '../components/Layout'
import { useAppText } from '../context/ContentContext'

export function NotFoundPage() {
  const { t } = useAppText()

  return (
    <div>
      <Navbar />
      <main id="main-content" className="section">
        <div className="container prose not-found">
          <p className="pill">404</p>
          <h1>{t('notFound.title')}</h1>
          <p>{t('notFound.body')}</p>
          <div className="row-actions">
            <Link to="/" className="btn btn-primary">
              {t('notFound.home')}
            </Link>
            <Link to="/contact" className="btn btn-outline">
              {t('nav.contact')}
            </Link>
            <Link to="/ai-assistant" className="btn btn-outline">
              {t('nav.aiAssistant')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
