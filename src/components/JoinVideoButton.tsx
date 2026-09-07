import { Link } from 'react-router-dom'
import type { Appointment } from '../data'
import { canJoinVideoVisit, videoVisitPath } from '../lib/videoVisit'

export function JoinVideoButton({ apt }: { apt: Appointment }) {
  if (apt.type !== 'video') return null
  if (!canJoinVideoVisit(apt)) {
    return <span className="meta">Video after approval</span>
  }

  return (
    <Link to={videoVisitPath(apt.id)} className="btn btn-primary">
      Join video visit
    </Link>
  )
}
