import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import App from './App'
import { AiFloatingWidget } from './components/AiChat'
import { DemoNotice, EmergencyBar, ScrollToTop, SkipLink } from './components/AppChrome'
import { AuthProvider } from './context/AuthContext'
import { ContentProvider } from './context/ContentContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import i18n from './i18n'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <ContentProvider>
            <AuthProvider>
              <ToastProvider>
                <SkipLink />
                <EmergencyBar />
                <ScrollToTop />
                <App />
                <AiFloatingWidget />
                <DemoNotice />
              </ToastProvider>
            </AuthProvider>
          </ContentProvider>
        </BrowserRouter>
      </I18nextProvider>
    </ThemeProvider>
  </StrictMode>,
)
