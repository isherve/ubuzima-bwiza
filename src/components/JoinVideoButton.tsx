import { Link } from 'react-router-dom'
import { useAppText } from '../context/ContentContext'
import { useAuth } from '../context/AuthContext'
import type { Appointment } from '../data'
import { canJoinVideoVisit, videoVisitPath } from '../lib/videoVisit'

export function JoinVideoButton({ apt }: { apt: Appointment }) {
  const { t } = useAppText()
  const { user } = useAuth()
  if (apt.type !== 'video') return null
  if (!canJoinVideoVisit(apt)) {
    return <span className="meta">{t('ui.talkAfter')}</span>
  }

  const label = user?.role === 'doctor' ? t('ui.talkPatient') : t('ui.talkDoctor')

  return (
    <Link to={videoVisitPath(apt.id)} className="btn btn-primary">
      {label}
    </Link>
  )
}
