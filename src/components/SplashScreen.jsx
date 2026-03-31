import { useEffect, useRef, useState } from 'react'
import logoImg from '../assets/logo_listo.png'
import logoBlanco from '../assets/logo listo blanco.png'
import letrasLogo from '../assets/letras_listo_patron.png'
import './SplashScreen.css'

const onboardingSlides = [
  {
    titleEs: 'Todos los servicios',
    titleEn: 'All services',
    subEs: 'Plomeros, electricistas, niñeras y más — cuando los necesitas.',
    subEn: 'Plumbers, electricians, nannies & more — when you need them.',
    overlay: 'rgba(242, 96, 0, 0.45)', // Naranja (Mamey)
    video: '/videos/servicios1.mp4',
  },
  {
    titleEs: 'Profesionales seguros',
    titleEn: 'Verified pros',
    subEs: 'Cada experto está 100% verificado para brindarte total seguridad.',
    subEn: 'Every expert is 100% verified for your peace of mind.',
    overlay: 'rgba(16, 185, 129, 0.45)', // Verde
    video: '/videos/profesionales1.mp4',
  },
  {
    titleEs: 'Reserva rápido',
    titleEn: 'Quick booking',
    subEs: 'Elige, cotiza y el profesional llega a tu puerta en minutos.',
    subEn: 'Choose, quote and the pro arrives at your door in minutes.',
    overlay: 'rgba(59, 130, 246, 0.45)', // Azul
    video: '/videos/servicios3.mp4',
  },
  {
    titleEs: 'Trabajo de primera',
    titleEn: 'Top-notch work',
    subEs: 'Resultados impecables y garantizados. Estamos comprometidos a cumplirte.',
    subEn: 'Flawless and guaranteed results. We are committed to you.',
    overlay: 'rgba(168, 85, 247, 0.45)', // Morado
    video: '/videos/profesionales3.mp4',
  },
  {
    titleEs: 'Síguelo en el mapa',
    titleEn: 'Track on the map',
    subEs: 'Observa en tiempo real cómo tu profesional llega directo a tu ubicación.',
    subEn: 'Watch in real-time as your professional arrives straight to your location.',
    overlay: 'rgba(236, 72, 153, 0.45)', // Rosa
    video: '/videos/reserva1.mp4',
  },
  {
    titleEs: 'Paga sin complicaciones',
    titleEn: 'Hassle-free payments',
    subEs: 'Transacciones 100% seguras y al instante, directamente desde la app.',
    subEn: '100% secure and instant transactions, right from the app.',
    overlay: 'rgba(245, 158, 11, 0.45)', // Amarillo ámbar
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

  // Ref para rastrear si ya encendimos la música por primera vez automáticamente
  const playedRef = useRef(false)

  const handleScreenTap = () => {
    if (playedRef.current || musicOn) return
    playedRef.current = true
    if (audioRef.current) {
      audioRef.current.volume = 0.35
      audioRef.current.play().then(() => setMusicOn(true)).catch(() => {
        playedRef.current = false // Si falla, intentarlo en el próximo toque
      })
    }
  }

  useEffect(() => {
    if (audioRef.current && !playedRef.current) {
      audioRef.current.volume = 0.35
      audioRef.current.play().then(() => {
        playedRef.current = true
        setMusicOn(true)
      }).catch(() => {})
    }

    const t = setTimeout(() => setPhase('onboarding'), 2200)
    return () => clearTimeout(t)
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
      audioRef.current.play().then(() => {
        playedRef.current = true
        setMusicOn(true)
      }).catch(() => {})
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
      <audio ref={audioRef} loop preload="auto">
        <source src="/audio/intro_suno.mp3" type="audio/mpeg" />
      </audio>

      {phase === 'splash' ? (
        <div className="splash-screen" onClick={handleScreenTap} onTouchStart={handleScreenTap}>
          <div className="splash-logo-wrap">
            <img src={logoBlanco} alt="Listo" className="splash-logo" />
          </div>
          <img src={letrasLogo} alt="Listo Patrón" className="splash-letras" />
          <div className="splash-loader">
            <div className="splash-bar" />
          </div>
        </div>
      ) : (
        <div className="onboarding-screen" onClick={handleScreenTap} onTouchStart={handleScreenTap}>

      {onboardingSlides.map((s, index) => (
        <video
          key={s.video}
          ref={el => videoRefs.current[index] = el}
          src={s.video}
          autoPlay
          muted
          loop
          playsInline
          className="onboarding-video-bg"
          style={{
            opacity: index === slideIndex ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            zIndex: index === slideIndex ? 0 : -1,
            pointerEvents: 'none'
          }}
          onLoadedData={(e) => {
             if (index === slideIndex) e.target.play().catch(() => {})
          }}
        />
      ))}

      <div
        className="onboarding-overlay"
        style={{ background: slide.overlay || 'rgba(242, 96, 0, 0.45)' }}
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