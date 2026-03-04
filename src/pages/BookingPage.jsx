import { useState } from 'react'
import './BookingPage.css'

import { bookingTxt }                         from './bookingTexts'
import { avatarColors, timeSlots, busySlots } from './bookingData'
import { getDays }                            from './bookingUtils'



// ─────────────────────────────────────────────────────────────────────────────
export default function BookingPage({ lang = 'es', navigate, professional }) {
  const T    = bookingTxt[lang]
  const days = getDays(lang)

  // Datos del profesional (fallback de ejemplo si no viene como prop)
  const pro = professional || {
    name:     'Carlos Méndez',
    category: 'mechanic',
    avatar:   'CM',
    rating:   4.9,
    price:    'RD$800/hr',
    location: 'Santo Domingo',
  }

  // ── Estado ────────────────────────────────────────────────────────────────
  const [step,         setStep]         = useState(1)
  const [selectedDay,  setSelectedDay]  = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [address,      setAddress]      = useState('')
  const [notes,        setNotes]        = useState('')
  const [urgency,      setUrgency]      = useState(0)
  const [confirmed,    setConfirmed]    = useState(false)


  const canNext1 = selectedDay !== null && selectedTime !== null
  const canNext2 = address.trim().length > 0

  // ── Pantalla de éxito ─────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="booking-page">
        <div className="booking-success fade-up">
          <div className="success-icon">✓</div>
          <h2 className="success-title">{T.successTitle}</h2>
          <p className="success-sub">{T.successSub}</p>

          <div className="success-card">
            <div className="success-pro">
              <div className="success-avatar" style={{ background: avatarColors[0] }}>{pro.avatar}</div>
              <div>
                <div className="success-name">{pro.name}</div>
                <div className="success-date">
                  {days[selectedDay]?.dayName} {days[selectedDay]?.dayNum} · {selectedTime}
                </div>
              </div>
            </div>
            <div className="eta-box">
              <span className="eta-label">{T.successEta}</span>
              <span className="eta-time">~25 min</span>
              <div className="eta-bar"><div className="eta-progress" /></div>
            </div>
          </div>

          <div className="success-actions">
            <button className="btn-track" onClick={() => navigate('tracking', pro)}>
              📍 {T.track}
            </button>
            <button className="btn-new" onClick={() => {
              setConfirmed(false)
              setStep(1)
              setSelectedDay(null)
              setSelectedTime(null)
              setAddress('')
              setNotes('')
              setUrgency(0)
            }}>
              {T.newBooking}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Layout principal ──────────────────────────────────────────────────────
  return (
    <div className="booking-page">
      <div className="booking-container fade-up">

        {/* Header */}
        <div className="booking-header">
          <button className="back-btn" onClick={() => navigate && navigate('services')}>←</button>
          <div className="booking-pro-pill">
            <div className="bp-avatar" style={{ background: avatarColors[0] }}>{pro.avatar}</div>
            <span className="bp-name">{pro.name}</span>
            <span className="bp-price">{pro.price}</span>
          </div>
        </div>

        {/* Barra de pasos */}
        <div className="steps-bar">
          {T.steps.map((s, i) => (
            <div key={i} className={`step-item ${step > i + 1 ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
              <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
              <span className="step-label">{s}</span>
              {i < T.steps.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {/* ── Paso 1: Fecha y hora ── */}
        {step === 1 && (
          <div className="step-content fade-up">
            <h2 className="step-title">{T.step1}</h2>

            <div className="date-scroll">
              {days.map((d, i) => (
                <button
                  key={i}
                  className={`day-card ${selectedDay === i ? 'selected' : ''} ${d.isToday ? 'today' : ''}`}
                  onClick={() => setSelectedDay(i)}
                >
                  <span className="day-name">{d.dayName}</span>
                  <span className="day-num">{d.dayNum}</span>
                  <span className="day-month">{d.month}</span>
                  {d.isToday && <span className="today-dot" />}
                </button>
              ))}
            </div>

            {selectedDay !== null && (
              <div className="time-grid fade-up">
                <p className="time-label">{T.selectTime}</p>
                <div className="time-slots">
                  {timeSlots.map(t => {
                    const isBusy = busySlots.includes(t)
                    return (
                      <button
                        key={t}
                        className={`time-slot ${selectedTime === t ? 'selected' : ''} ${isBusy ? 'busy' : ''}`}
                        onClick={() => !isBusy && setSelectedTime(t)}
                      >
                        {t}
                        {isBusy && <span className="busy-tag">{lang === 'es' ? 'Ocupado' : 'Busy'}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="step-nav">
              <button className="btn-next" disabled={!canNext1} onClick={() => setStep(2)}>
                {T.next} →
              </button>
            </div>
          </div>
        )}

        {/* ── Paso 2: Detalles (sin pagos) ── */}
        {step === 2 && (
          <div className="step-content fade-up">
            <h2 className="step-title">{T.step2}</h2>

            {/* Dirección */}
            <div className="detail-field">
              <label>📍 {T.address}</label>
              <input
                type="text"
                placeholder={T.addressPlaceholder}
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            {/* Urgencia */}
            <div className="detail-field">
              <label>⚡ {T.urgency}</label>
              <div className="urgency-group">
                {T.urgencyOpts.map((opt, i) => (
                  <button
                    key={i}
                    className={`urgency-btn ${urgency === i ? 'selected' : ''}`}
                    onClick={() => setUrgency(i)}
                  >
                    {[['🕐', '⚡', '🚨'][i]]} {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div className="detail-field">
              <label>📝 {T.notes}</label>
              <textarea
                placeholder={T.notesPlaceholder}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="step-nav">
              <button className="btn-back" onClick={() => setStep(1)}>{T.back}</button>
              <button className="btn-next" disabled={!canNext2} onClick={() => setStep(3)}>
                {T.next} →
              </button>
            </div>
          </div>
        )}

        {/* ── Paso 3: Confirmar ── */}
        {step === 3 && (
          <div className="step-content fade-up">
            <h2 className="step-title">{T.step3}</h2>
            <div className="summary-card">
              <h3 className="summary-title">{T.summary}</h3>

              <div className="summary-row">
                <span className="summary-label">{T.professional}</span>
                <span className="summary-value">{pro.name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">{T.date}</span>
                <span className="summary-value">{days[selectedDay]?.dayName} {days[selectedDay]?.dayNum}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">{T.time}</span>
                <span className="summary-value">{selectedTime}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">📍</span>
                <span className="summary-value">{address}</span>
              </div>
              {notes && (
                <div className="summary-row">
                  <span className="summary-label">📝</span>
                  <span className="summary-value notes-val">{notes}</span>
                </div>
              )}

              <div className="summary-divider" />
              <div className="summary-price-row">
                <span className="summary-price-label">{T.price}</span>
                <span className="summary-price">{pro.price}</span>
              </div>
              <p className="price-note">{T.priceNote}</p>
            </div>

            <div className="step-nav">
              <button className="btn-back" onClick={() => setStep(2)}>{T.back}</button>
              <button className="btn-confirm" onClick={() => setConfirmed(true)}>
                ✓ {T.confirm}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
