import { useState, useEffect } from 'react'

const planes = [
  {
    emoji: '🥇', nombre: 'Pack Gold',     precio: 'RD$1,000',
    bg: 'linear-gradient(135deg, #F5C842 0%, #D4940A 50%, #B8780A 100%)',
    glow: 'rgba(212,160,23,0.6)', color: '#F5C842', stars: '#FFD700',
  },
  {
    emoji: '🥈', nombre: 'Pack Platinum', precio: 'RD$1,500',
    bg: 'linear-gradient(135deg, #C8D4E0 0%, #8E9BAF 50%, #6B7A8D 100%)',
    glow: 'rgba(122,143,168,0.6)', color: '#C8D4E0', stars: '#B0C4DE',
  },
  {
    emoji: '💎', nombre: 'VIP Ilimitado', precio: 'RD$2,000/mes',
    bg: 'linear-gradient(135deg, #FF8C42 0%, #F26000 50%, #C94E00 100%)',
    glow: 'rgba(242,96,0,0.7)', color: '#FF8C42', stars: '#FF8C42',
  },
]

const STAR_COUNT = 8

export default function VIPBanner({ onOpenPlanes }) {
  const [current, setCurrent] = useState(0)
  const [fade, setFade]       = useState(true)
  const [stars, setStars]     = useState([])

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrent(p => (p + 1) % planes.length)
        setFade(true)
      }, 300)
    }, 2800)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setStars(
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        id: i,
        top: `${Math.random() * 80 + 5}%`,
        left: `${Math.random() * 90 + 2}%`,
        size: `${Math.random() * 10 + 8}px`,
        delay: `${Math.random() * 2}s`,
        duration: `${Math.random() * 1.5 + 0.8}s`,
      }))
    )
  }, [])

  const plan = planes[current]

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%,100% { opacity: 0.2; transform: scale(0.6) rotate(-15deg); }
          50%      { opacity: 1;   transform: scale(1.3) rotate(15deg); }
        }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 4px 20px var(--glow); }
          50%      { box-shadow: 0 4px 36px var(--glow), 0 0 28px var(--glow); }
        }
        .vip-banner-btn { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      <button
        className="vip-banner-btn"
        onClick={onOpenPlanes}
        style={{
          '--glow': plan.glow,
          display: 'flex', alignItems: 'center', gap: '12px',
          margin: '12px 16px 4px', width: 'calc(100% - 32px)',
          padding: '13px 16px', borderRadius: '18px', border: 'none',
          background: 'linear-gradient(135deg, #1C1C1C 0%, #2A0F00 50%, #1C1C1C 100%)',
          cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Estrellas animadas */}
        {stars.map(s => (
          <span key={s.id} style={{
            position: 'absolute', top: s.top, left: s.left,
            fontSize: s.size, pointerEvents: 'none',
            animation: `twinkle ${s.duration} ${s.delay} ease-in-out infinite`,
            color: plan.stars,
          }}>✦</span>
        ))}

        {/* Emoji con fondo de color */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
          background: plan.bg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '24px',
          boxShadow: `0 4px 12px ${plan.glow}`,
          opacity: fade ? 1 : 0,
          transform: fade ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 0.3s, transform 0.3s',
        }}>
          {plan.emoji}
        </div>

        {/* Texto */}
        <div style={{ flex: 1, zIndex: 1 }}>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '600' }}>
            👑 ¡Potencia tu cuenta y gana más!
          </p>
          <p style={{
            margin: '3px 0 0', fontSize: '14px', fontWeight: '900',
            color: plan.color,
            opacity: fade ? 1 : 0,
            transition: 'opacity 0.3s',
          }}>
            {plan.nombre} · {plan.precio}
          </p>
          <div style={{ display: 'flex', gap: '4px', marginTop: '5px' }}>
            {planes.map((_, i) => (
              <div key={i} style={{
                height: '4px', borderRadius: '2px',
                width: i === current ? '14px' : '4px',
                background: i === current ? plan.color : 'rgba(255,255,255,0.25)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>

        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '22px', zIndex: 1 }}>›</span>
      </button>
    </>
  )
}