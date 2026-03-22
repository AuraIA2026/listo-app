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
    videos: ['/videos/servicios1.mp4', '/videos/servicios3.mp4'],
  },
  {
    titleEs: 'Profesionales verificados',
    titleEn: 'Verified professionals',
    subEs: 'Cada profesional pasa por un proceso de verificación de identidad y experiencia.',
    subEn: 'Every professional goes through an identity and experience verification process.',
    bg: '#F26000',
    videos: ['/videos/profesionales1.mp4', '/videos/profesionales3.mp4'],
  },
  {
    titleEs: 'Reserva en minutos',
    titleEn: 'Book in minutes',
    subEs: 'Selecciona, agenda y listo. Tu profesional llega a donde estás.',
    subEn: 'Select, schedule and done. Your professional comes to you.',
    bg: '#F26000',
    videos: ['/videos/reserva1.mp4', '/videos/reserva2.mp4'],
  },
]

const ALL_VIDEOS = onboardingSlides.flatMap(s => s.videos)
const SLIDE_DURATION = 8000
const VIDEO_DURATION = 4000

export default function SplashScreen({ onFinish, lang = 'es' }) {
  const [phase, setPhase] = useState('splash')
  const [slideIndex, setSlideIndex] = useState(0)
  const [videoIndex, setVideoIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const audioRef = useRef(null)
  const autoTimer = useRef(null)
  const videoTimer = useRef(null)

  useEffect(() => {
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
    clearInterval(videoTimer.current)
    setAnimating(true)
    setTimeout(() => {
      setSlideIndex(index)
      setVideoIndex(0)
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
    clearInterval(videoTimer.current)
    onFinish()
  }

  if (phase === 'splash') {
    return (
      <div className="splash-screen">
        <audio ref={audioRef} loop preload="auto">
          <source src="/audio/the_mountain-acoustic-131417.mp3" type="audio/mpeg" />
        </audio>
        <div style={{ display: 'none' }}>
          {ALL_VIDEOS.map(src => (
            <video key={src} src={src} preload="auto" muted playsInline />
          ))}
        </div>
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
    <div className="onboarding-screen">

      <audio ref={audioRef} loop preload="auto">
        <source src="/audio/the_mountain-acoustic-131417.mp3" type="audio/mpeg" />
      </audio>

      {ALL_VIDEOS.map(src => (
        <video
          key={src}
          autoPlay={src === currentVideo}
          muted
          loop
          playsInline
          preload="auto"
          className="onboarding-video-bg"
          style={{ display: src === currentVideo ? 'block' : 'none' }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ))}

      <div
        className="onboarding-overlay"
        style={{ background: slide.bg + '99' }}
      />

      {/* BOTÓN DE MÚSICA */}
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
  )
}