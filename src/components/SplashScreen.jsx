import { useEffect, useRef, useState } from 'react'
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
    video: '/videos/servicios1.mp4',
  },
  {
    titleEs: 'Profesionales verificados',
    titleEn: 'Verified professionals',
    subEs: 'Cada profesional pasa por un proceso de verificación de identidad y experiencia.',
    subEn: 'Every professional goes through an identity and experience verification process.',
    bg: '#F26000',
    video: '/videos/profesionales1.mp4',
  },
  {
    titleEs: 'Reserva en minutos',
    titleEn: 'Book in minutes',
    subEs: 'Selecciona, agenda y listo. Tu profesional llega a donde estás.',
    subEn: 'Select, schedule and done. Your professional comes to you.',
    bg: '#F26000',
    video: '/videos/servicios3.mp4',
  },
  {
    titleEs: 'Trabajo de primera',
    titleEn: 'Top-notch work',
    subEs: 'Resultados impecables y garantizados. Estamos comprometidos con tu satisfacción.',
    subEn: 'Flawless and guaranteed results. We are committed to your satisfaction.',
    bg: '#F26000',
    video: '/videos/profesionales3.mp4',
  },
  {
    titleEs: 'Síguelo en el mapa',
    titleEn: 'Track on the map',
    subEs: 'Observa en tiempo real cómo tu profesional llega directo a tu ubicación.',
    subEn: 'Watch in real-time as your professional arrives straight to your location.',
    bg: '#F26000',
    video: '/videos/reserva1.mp4',
  },
  {
    titleEs: 'Paga sin complicaciones',
    titleEn: 'Hassle-free payments',
    subEs: 'Transacciones 100% seguras y al instante, directamente desde la app.',
    subEn: '100% secure and instant transactions, right from the app.',
    bg: '#F26000',
    video: '/videos/reserva2.mp4',
  },
]

const SLIDE_DURATION = 8000

export default function SplashScreen({ onFinish, lang = 'es' }) {
  const [phase, setPhase] = useState('splash')
  const [slideIndex, setSlideIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const audioRef = useRef(null)
  const autoTimer = useRef(null)
  const videoRefs = useRef([])

  useEffect(() => {
    if (phase === 'onboarding') {
      videoRefs.current.forEach(v => {
        if (v) v.play().catch(() => {})
      })
    }
  }, [phase])

  // Precargar los 3 videos al montar
  useEffect(() => {
    onboardingSlides.forEach(s => {
      const v = document.createElement('video')
      v.src = s.video
      v.preload = 'auto'
      v.muted = true
      v.load()
    })
  }, [])

  useEffect(() => {
    const tryAutoplay = () => {
      if (audioRef.current && !musicOn) {
        audioRef.current.volume = 0.35
        audioRef.current.play().then(() => setMusicOn(true)).catch(() => {})
      }
    }
    
    // Intentar al montar
    tryAutoplay()
    
    // Intentar reproducir al primer toque si el navegador lo bloqueó
    document.addEventListener('touchstart', tryAutoplay, { once: true })
    document.addEventListener('click', tryAutoplay, { once: true })

    const t = setTimeout(() => setPhase('onboarding'), 2200)
    return () => {
      clearTimeout(t)
      document.removeEventListener('touchstart', tryAutoplay)
      document.removeEventListener('click', tryAutoplay)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'onboarding') return
    autoTimer.current = setTimeout(() => {
      if (slideIndex < onboardingSlides.length - 1) {
        goTo(slideIndex + 1)
      } else {
        stopMusic()
        onFinish()
      }
    }, SLIDE_DURATION)
    return () => clearTimeout(autoTimer.current)
  }, [phase, slideIndex])

  const toggleMusic = (e) => {
    e.stopPropagation()
    if (!audioRef.current) return
    if (musicOn) {
      audioRef.current.pause()
      setMusicOn(false)
    } else {
      audioRef.current.volume = 0.35
      audioRef.current.play().then(() => setMusicOn(true)).catch(() => {})
    }
  }

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const goTo = (index) => {
    clearTimeout(autoTimer.current)
    setAnimating(true)
    setTimeout(() => {
      setSlideIndex(index)
      setAnimating(false)
    }, 300)
  }

  const goNext = () => {
    if (slideIndex < onboardingSlides.length - 1) {
      goTo(slideIndex + 1)
    } else {
      stopMusic()
      onFinish()
    }
  }

  const skip = () => {
    stopMusic()
    clearTimeout(autoTimer.current)
    onFinish()
  }

  const slide = onboardingSlides[slideIndex]
  const isLast = slideIndex === onboardingSlides.length - 1

  return (
    <>
      <audio ref={audioRef} loop preload="auto" autoPlay>
        <source src="/audio/the_mountain-acoustic-131417.mp3" type="audio/mpeg" />
      </audio>

      {phase === 'splash' ? (
        <div className="splash-screen">
          <div className="splash-logo-wrap">
            <img src={logoImg} alt="Listo" className="splash-logo" />
          </div>
          <p className="splash-tagline">Listo, patrón.</p>
          <div className="splash-loader">
            <div className="splash-bar" />
          </div>
        </div>
      ) : (
        <div className="onboarding-screen">

      {onboardingSlides.map((s, index) => (
        <video
          key={s.video}
          ref={el => videoRefs.current[index] = el}
          src={s.video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="onboarding-video-bg"
          style={{
            opacity: index === slideIndex ? 1 : 0,
            transition: 'opacity 0.6s ease-in-out',
            zIndex: index === slideIndex ? 0 : -1
          }}
        />
      ))}

      <div
        className="onboarding-overlay"
        style={{ background: slide.bg + '99' }}
      />

      <button className="music-btn" onClick={toggleMusic}>
        {musicOn ? '🔊' : '🔇'}
      </button>

      <button className="skip-btn" onClick={skip}>
        {lang === 'es' ? 'Omitir' : 'Skip'} →
      </button>

      <div className={`onboarding-content ${animating ? 'slide-out' : 'slide-in'}`}>
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
        <div className="onboarding-progress">
          <div
            className="onboarding-progress-bar"
            key={slideIndex}
            style={{ animationDuration: `${SLIDE_DURATION}ms` }}
          />
        </div>
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
      )}
    </>
  )
}