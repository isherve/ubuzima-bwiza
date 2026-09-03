import { AiChat } from '../components/AiChat'
import { useAppText } from '../context/ContentContext'

export function PublicAiPage() {
  const { text } = useAppText()

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <p className="pill">{text('ai.title')}</p>
        <AiChat title={text('ai.title')} subtitle={text('ai.subtitle')} />
      </div>
    </section>
  )
}
