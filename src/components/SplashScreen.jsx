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
    videos: ['/videos/servicios.mp4', '/videos/servicios1.mp4', '/videos/servicios2.mp4', '/videos/servicios3.mp4'],
  },
  {
    titleEs: 'Profesionales verificados',
    titleEn: 'Verified professionals',
    subEs: 'Cada profesional pasa por un proceso de verificación de identidad y experiencia.',
    subEn: 'Every professional goes through an identity and experience verification process.',
    bg: '#C24D00',
    videos: ['/videos/profesionales.mp4', '/videos/profesionales1.mp4', '/videos/profesionales2.mp4', '/videos/profesionales3.mp4'],
  },
  {
    titleEs: 'Reserva en minutos',
    titleEn: 'Book in minutes',
    subEs: 'Selecciona, agenda y listo. Tu profesional llega a donde estás.',
    subEn: 'Select, schedule and done. Your professional comes to you.',
    bg: '#7A3000',
    videos: ['/videos/reserva.mp4', '/videos/reserva1.mp4', '/videos/reserva2.mp4', '/videos/reserva3.mp4'],
  },
]

const SLIDE_DURATION = 8000  // duración total del slide
const VIDEO_DURATION = 2000  // cada video dura 2 segundos

export default function SplashScreen({ onFinish, lang = 'es' }) {
  const [phase, setPhase] = useState('splash')
  const [slideIndex, setSlideIndex] = useState(0)
  const [videoIndex, setVideoIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [musicStarted, setMusicStarted] = useState(false)
  const audioRef = useRef(null)
  const autoTimer = useRef(null)
  const videoTimer = useRef(null)

  // Splash -> onboarding
  useEffect(() => {
    const t = setTimeout(() => setPhase('onboarding'), 2200)
    return () => clearTimeout(t)
  }, [])

  // Auto-avance de slide cada SLIDE_DURATION
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

  // Rotar videos dentro del slide cada VIDEO_DURATION
  useEffect(() => {
    if (phase !== 'onboarding') return
    setVideoIndex(0)
    videoTimer.current = setInterval(() => {
      setVideoIndex(i => {
        const total = onboardingSlides[slideIndex].videos.length
        return (i + 1) % total
      })
    }, VIDEO_DURATION)
    return () => clearInterval(videoTimer.current)
  }, [phase, slideIndex])

  const startMusic = () => {
    if (!musicStarted && audioRef.current) {
      audioRef.current.volume = 0.35
      audioRef.current.play().then(() => setMusicStarted(true)).catch(() => {})
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
    clearInterval(videoTimer.current)
    setAnimating(true)
    setTimeout(() => {
      setSlideIndex(index)
      setVideoIndex(0)
      setAnimating(false)
    }, 300)
  }

  const goNext = () => {
    startMusic()
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
    clearInterval(videoTimer.current)
    onFinish()
  }

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
  const currentVideo = slide.videos[videoIndex]

  return (
    <div className="onboarding-screen" onClick={startMusic}>

      {/* MÚSICA */}
      <audio ref={audioRef} loop preload="auto">
        <source src="/audio/the_mountain-acoustic-131417.mp3" type="audio/mpeg" />
      </audio>

      {/* VIDEO DE FONDO — cambia cada 2 segundos */}
      <video
        key={currentVideo}
        autoPlay
        muted
        loop
        playsInline
        className="onboarding-video-bg"
      >
        <source src={currentVideo} type="video/mp4" />
      </video>

      {/* OVERLAY COLOR */}
      <div
        className="onboarding-overlay"
        style={{ background: slide.bg + 'CC' }}
      />

      {/* CONTENIDO */}
      <button className="skip-btn" onClick={(e) => { e.stopPropagation(); skip() }}>
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
        {/* BARRA DE PROGRESO */}
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
  )
}