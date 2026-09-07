import type { Appointment, Role, User } from '../data'

export function videoRoomName(appointmentId: string) {
  return `UbuzimaBwiza${appointmentId.replace(/[^a-zA-Z0-9]/g, '')}`
}

export function videoVisitPath(appointmentId: string) {
  return `/visit/${appointmentId}`
}

export function jitsiVisitUrl(appointmentId: string, displayName: string, video = true) {
  const room = videoRoomName(appointmentId)
  const name = encodeURIComponent(displayName || 'Guest')
  const videoMuted = video ? 'false' : 'true'
  return `https://meet.jit.si/${room}#userInfo.displayName="${name}"&config.prejoinPageEnabled=false&config.startWithVideoMuted=${videoMuted}&config.startWithAudioMuted=false&config.disableInviteFunctions=true&config.requireDisplayName=false`
}

export function canJoinVideoVisit(apt: Appointment) {
  return apt.type === 'video' && apt.status === 'approved'
}

export function canAccessVideoVisit(user: User | null, apt: Appointment | undefined) {
  if (!user || !apt || apt.type !== 'video') return false
  if (user.role === 'admin' || user.role === 'hospital') return true
  if (user.role === 'patient') return apt.patientName === user.name
  return apt.doctorName === user.name || apt.doctorId === 'doc1'
}

export function appointmentsBackPath(role: Role | undefined) {
  if (role === 'doctor') return '/doctor-appointments'
  if (role === 'hospital') return '/hospital-dashboard/reception/appointments'
  if (role === 'admin') return '/all-appointments'
  return '/my-appointments'
}
