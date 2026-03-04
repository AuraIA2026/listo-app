// ── Genera los próximos 14 días para el selector de fecha ────────────────────
export function getDays(lang = 'es') {
  const dayNames = lang === 'es'
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const monthNames = lang === 'es'
    ? ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const today = new Date()
  const days  = []

  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      date:     d,
      dayName:  dayNames[d.getDay()],
      dayNum:   d.getDate(),
      month:    monthNames[d.getMonth()],
      isToday:  i === 0,
    })
  }

  return days
}