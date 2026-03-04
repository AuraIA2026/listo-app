import { useState, useEffect, useRef } from 'react'
import './Publicidad.css'

import adrianaAd  from '../assets/ads/adriana.png'
import arteAd     from '../assets/ads/arte.png'
import fcoAd      from '../assets/ads/fco.png'
import arteMedios from '../assets/ads/artemedios.png'

/* ─── DATA DE ADS ───────────────────────────────────────────── */
const adBanners = [
  { img: adrianaAd,  alt: 'La Casita de Adriana' },
  { img: arteAd,     alt: 'Arte Urbano' },
  { img: fcoAd,      alt: 'FCO Ren Cars' },
  { img: arteMedios, alt: 'Arte Medios' },
]

/* ─── COMPONENTE ────────────────────────────────────────────── */
export default function Publicidad({ lang }) {
  const [idx,      setIdx]    = useState(0)
  const timerRef              = useRef(null)
  const touchStartX           = useRef(null)
  const touchEndX             = useRef(null)

  const startAutoPlay = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % adBanners.length), 10000)
  }

  useEffect(() => {
    startAutoPlay()
    return () => clearInterval(timerRef.current)
  }, [])

  const goTo = (i) => { setIdx(i); startAutoPlay() }
  const prev = () => goTo((idx - 1 + adBanners.length) % adBanners.length)
  const next = () => goTo((idx + 1) % adBanners.length)

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; touchEndX.current = null }
  const onTouchMove  = (e) => { touchEndX.current = e.touches[0].clientX }
  const onTouchEnd   = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    touchStartX.current = null
    touchEndX.current   = null
  }

  const ad = adBanners[idx]

  return (
    <div
      className="publicidad-hero"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <img
        key={idx}
        src={ad.img}
        alt={ad.alt}
        className="publicidad-img"
      />

      <div className="publicidad-overlay" />

      <span className="publicidad-pill">
        {lang === 'es' ? 'Publicidad' : 'Sponsored'}
      </span>

      <button className="pub-arrow pub-arrow-left" onClick={prev}>‹</button>
      <button className="pub-arrow pub-arrow-right" onClick={next}>›</button>

      <div className="publicidad-dots">
        {adBanners.map((_, i) => (
          <button
            key={i}
            className={`pub-dot${i === idx ? ' active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  )
}