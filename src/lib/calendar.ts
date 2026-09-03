import type { Appointment } from '../data'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toIcsStamp(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  if (!year || !month || !day) return ''
  return `${year}${pad(month)}${pad(day)}T${pad(hour || 9)}${pad(minute || 0)}00`
}

export function downloadAppointmentIcs(apt: Appointment) {
  const start = toIcsStamp(apt.date, apt.time)
  if (!start) return
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ubuzima Bwiza//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE',
    'TZID:Africa/Kigali',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0200',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${apt.id}@ubuzimabwiza.com`,
    `DTSTAMP:${start}`,
    `DTSTART;TZID=Africa/Kigali:${start}`,
    `SUMMARY:Ubuzima Bwiza — ${apt.doctorName}`,
    `DESCRIPTION:${apt.specialty} (${apt.type}) visit. Amount: ${apt.amount ?? 0} RWF.`,
    'LOCATION:Rwanda / Ubuzima Bwiza',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ubuzima-${apt.id}.ics`
  link.click()
  URL.revokeObjectURL(url)
}
