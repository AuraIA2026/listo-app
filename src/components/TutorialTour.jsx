import { useState, useEffect, useRef } from 'react'
import './TutorialTour.css'

const TOUR_KEY = 'listo_tour_done'

const steps = {
  es: [
    { emoji: '👋', title: '¡Bienvenido a Listo Patrón!', text: 'Tu app para conectar con los mejores profesionales de tu zona. Te mostramos cómo funciona en segundos.', position: 'center' },
    { emoji: '🔍', title: 'Busca lo que necesitas', text: 'Usa la barra de búsqueda para encontrar el profesional que necesitas. ¡Rápido y fácil!', position: 'top' },
    { emoji: '⭐', title: 'Categorías populares', text: 'Explora por categoría: mecánicos, electricistas, plomeros y mucho más. Toca cualquier ícono.', position: 'top' },
    { emoji: '🏆', title: 'Profesionales destacados', text: 'Ve las calificaciones, reseñas y precios antes de reservar. Todos verificados por Listo.', position: 'center' },
    { emoji: '📱', title: 'Tu menú principal', text: 'Usa la barra de abajo para navegar: Inicio, Servicios, Buscar, Pedidos y tu Perfil.', position: 'bottom' },
    { emoji: '🎉', title: '¡Listo, patrón!', text: 'Ya sabes cómo funciona. Ahora encuentra el profesional que necesitas y reserva en minutos.', position: 'center' },
  ],
  en: [
    { emoji: '👋', title: 'Welcome to Listo Patrón!', text: 'Your app to connect with the best professionals in your area. Let us show you how it works in seconds.', position: 'center' },
    { emoji: '🔍', title: 'Search for what you need', text: 'Use the search bar to find the professional you need. Quick and easy!', position: 'top' },
    { emoji: '⭐', title: 'Popular categories', text: 'Browse by category: mechanics, electricians, plumbers and much more. Tap any icon.', position: 'top' },
    { emoji: '🏆', title: 'Featured professionals', text: 'See ratings, reviews and prices before booking. All verified by Listo.', position: 'center' },
    { emoji: '📱', title: 'Your main menu', text: 'Use the bottom bar to navigate: Home, Services, Search, Orders and your Profile.', position: 'bottom' },
    { emoji: '🎉', title: "You're all set!", text: 'Now you know how it works. Find the professional you need and book in minutes.', position: 'center' },
  ]
}

function TypewriterText({ text, onDone }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const idxRef = useRef(0)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    idxRef.current = 0
    const interval = setInterval(() => {
      if (idxRef.current < text.length) {
        setDisplayed(text.slice(0, idxRef.current + 1))
        idxRef.current++
      } else {
        clearInterval(interval)
        setDone(true)
        onDone && onDone()
      }
    }, 22)
    return () => clearInterval(interval)
  }, [text])

  return (
    <span className="typewriter-text">
      {displayed}
      {!done && <span className="typewriter-cursor">|</span>}
    </span>
  )
}

export default function TutorialTour({ lang = 'es', onFinish }) {
  const [step, setStep] = useState(0)
  const [titleDone, setTitleDone] = useState(false)
  const totalSteps = steps[lang].length
  const current = steps[lang][step]

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setTitleDone(false)
      setStep(s => s + 1)
    } else {
      handleFinish()
    }
  }

  const handleFinish = () => {
    localStorage.setItem(TOUR_KEY, 'true')
    onFinish && onFinish()
  }

  const isLast = step === totalSteps - 1

  return (
    <div className={`tour-overlay tour-pos-${current.position}`}>
      <div className="tour-bubble">

        {/* Header estilo iMessage */}
        <div className="tour-chat-header">
          <div className="tour-avatar">🛠️</div>
          <div className="tour-chat-info">
            <div className="tour-chat-name">Listo Patrón</div>
            <div className="tour-chat-status">● {lang === 'es' ? 'En línea' : 'Online'}</div>
          </div>
          <button className="tour-close-btn" onClick={handleFinish}>✕</button>
        </div>

        {/* Área de mensajes */}
        <div className="tour-messages">
          <div className="tour-msg-received" key={`msg-${step}`}>
            <span className="tour-msg-icon">{current.emoji}</span>
            <div className="tour-msg-bubble">
              <strong>
                <TypewriterText key={`title-${step}`} text={current.title} onDone={() => setTitleDone(true)} />
              </strong>
              {titleDone && (
                <span>
                  <TypewriterText key={`text-${step}`} text={current.text} />
                </span>
              )}
            </div>
          </div>

          {/* Dots de progreso como mensaje enviado */}
          <div className="tour-msg-sent">
            <div className="tour-msg-bubble-sent">
              {steps[lang].map((_, i) => (
                <span key={i} className={`tour-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="tour-actions">
          <button className="tour-skip" onClick={handleFinish}>
            {lang === 'es' ? 'Saltar' : 'Skip'}
          </button>
          <button className="tour-next" onClick={handleNext}>
            {isLast
              ? (lang === 'es' ? '¡Empezar! 🚀' : 'Start! 🚀')
              : (lang === 'es' ? 'Siguiente →' : 'Next →')}
          </button>
        </div>

        <p className="tour-counter">{step + 1} / {totalSteps}</p>
      </div>
    </div>
  )
}

export function useTour() {
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY)
    if (!done) {
      setTimeout(() => setShowTour(true), 800)
    }
  }, [])

  return [showTour, () => setShowTour(false)]
}