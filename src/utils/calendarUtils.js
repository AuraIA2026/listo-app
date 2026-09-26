// ── Generador de enlaces para Google Calendar e ICS ──────────────────────────

export function getGoogleCalendarUrl({ title, description, location, startDate }) {
  const start = startDate ? new Date(startDate) : new Date()
  const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hora de duración estimada

  const fmt = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Cita de Servicio - Listo Patrón',
    details: description || 'Servicio contratado mediante Listo Patrón.',
    location: location || 'Santo Domingo, República Dominicana',
    dates: `${fmt(start)}/${fmt(end)}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadIcsFile({ title, description, location, startDate }) {
  const start = startDate ? new Date(startDate) : new Date()
  const end = new Date(start.getTime() + 60 * 60 * 1000)

  const fmt = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '')

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Listo Patron//Cita de Servicio//ES',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@listopatron.app`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title || 'Cita de Servicio - Listo Patrón'}`,
    `DESCRIPTION:${(description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${location || 'República Dominicana'}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Cita_ListoPatron_${Date.now()}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
