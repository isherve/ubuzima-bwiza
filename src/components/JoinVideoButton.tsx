import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Appointment } from '../data'
import { canJoinVideoVisit, videoVisitPath } from '../lib/videoVisit'

export function JoinVideoButton({ apt }: { apt: Appointment }) {
  const { user } = useAuth()
  if (apt.type !== 'video') return null
  if (!canJoinVideoVisit(apt)) {
    return <span className="meta">Talk after approval</span>
  }

  const label = user?.role === 'doctor' ? 'Talk with patient' : 'Talk with doctor'

  return (
    <Link to={videoVisitPath(apt.id)} className="btn btn-primary">
      {label}
    </Link>
  )
}
