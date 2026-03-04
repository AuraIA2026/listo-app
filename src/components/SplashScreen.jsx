import { useEffect, useState } from 'react'
import logoImg from '../assets/logo_listo.png'
import logoBlanco from '../assets/logo listo blanco.png'
import './SplashScreen.css'

const onboardingSlides = [
  {
    titleEs: 'Todos los servicios en un solo lugar',
    titleEn: 'All services in one place',
    subEs: 'Mecánicos, electricistas, plomeros, niñeras y más — cuando los necesitas.',
    subEn: 'Mechanics, electricians, plumbers, nannies and more — when you need them.',
    bg: '#F26000',
  },
  {
    titleEs: 'Profesionales verificados',
    titleEn: 'Verified professionals',
    subEs: 'Cada profesional pasa por un proceso de verificación de identidad y experiencia.',
    subEn: 'Every professional goes through an identity and experience verification process.',
    bg: '#C24D00',
  },
  {
    titleEs: 'Reserva en minutos',
    titleEn: 'Book in minutes',
    subEs: 'Selecciona, agenda y listo. Tu profesional llega a donde estás.',
    subEn: 'Select, schedule and done. Your professional comes to you.',
    bg: '#7A3000',
  },
]

export default function SplashScreen({ onFinish, lang = 'es' }) {
  const [phase, setPhase] = useState('splash') // splash -> onboarding -> done
  const [slideIndex, setSlideIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    // Show splash for 2.2 seconds then go to onboarding
    const t = setTimeout(() => {
      setPhase('onboarding')
    }, 2200)
    return () => clearTimeout(t)
  }, [])

  const goNext = () => {
    if (slideIndex < onboardingSlides.length - 1) {
      setAnimating(true)
      setTimeout(() => {
        setSlideIndex(i => i + 1)
        setAnimating(false)
      }, 300)
    } else {
      onFinish()
    }
  }

  const skip = () => onFinish()

  if (phase === 'splash') {
    return (
      <div className="splash-screen">
        <div className="splash-logo-wrap">
          <img src={logoImg} alt="Listo" className="splash-logo" />
        </div>
        <p className="splash-tagline">Listo, patrón.</p>
        <div className="splash-loader">
          <div className="splash-bar" />
        </div>
      </div>
    )
  }

  const slide = onboardingSlides[slideIndex]
  const isLast = slideIndex === onboardingSlides.length - 1

  return (
    <div className="onboarding-screen" style={{ background: slide.bg }}>
      <button className="skip-btn" onClick={skip}>
        {lang === 'es' ? 'Omitir' : 'Skip'} →
      </button>

      <div className={`onboarding-content ${animating ? 'slide-out' : 'slide-in'}`}>
        {/* Logo blanco grande en lugar del emoji */}
        <div className="onboarding-logo-big-wrap">
          <img src={logoBlanco} alt="Listo" className="onboarding-logo-big" />
        </div>
        <h2 className="onboarding-title">
          {lang === 'es' ? slide.titleEs : slide.titleEn}
        </h2>
        <p className="onboarding-sub">
          {lang === 'es' ? slide.subEs : slide.subEn}
        </p>
      </div>

      <div className="onboarding-footer">
        <div className="onboarding-dots">
          {onboardingSlides.map((_, i) => (
            <div key={i} className={`ob-dot ${i === slideIndex ? 'active' : ''}`} />
          ))}
        </div>

        <button className="onboarding-btn" onClick={goNext}>
          {isLast
            ? (lang === 'es' ? '¡Empezar! 🚀' : 'Get Started! 🚀')
            : (lang === 'es' ? 'Siguiente →' : 'Next →')
          }
        </button>
      </div>
    </div>
  )
}
