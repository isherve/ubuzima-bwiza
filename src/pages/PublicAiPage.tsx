import { AiChat } from '../components/AiChat'

export function PublicAiPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <p className="pill">AI-Powered Triage</p>
        <AiChat
          title="Meet your AI Health Assistant"
          subtitle="Get preliminary advice anytime, then book a verified Ubuzima Bwiza doctor in one click."
        />
      </div>
    </section>
  )
}
