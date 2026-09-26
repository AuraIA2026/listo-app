import React, { useState, useEffect, useRef } from 'react'

const FLASH_OFFERS = [
  { id: 'off_1', titleEs: '🔧 Plomería de Urgencia', titleEn: '🔧 Emergency Plumbing', discount: '25% OFF', descEs: 'Reparación de fugas y tuberías hoy', icon: '🔧', cat: 'plomero' },
  { id: 'off_2', titleEs: '⚡ Electricista Residencial', titleEn: '⚡ Residential Electrician', discount: '20% OFF', descEs: 'Cortocircuitos y tableros 24/7', icon: '⚡', cat: 'electricista' },
  { id: 'off_3', titleEs: '🔑 Cerrajería Express', titleEn: '🔑 Express Locksmith', discount: '30% OFF', descEs: 'Apertura de puertas y autos al instante', icon: '🔑', cat: 'cerrajero' },
  { id: 'off_4', titleEs: '🧹 Limpieza de Oficina/Hogar', titleEn: '🧹 Deep Cleaning', discount: '15% OFF', descEs: 'Personal verificado Listo Patrón', icon: '🧹', cat: 'limpieza' }
]

export default function LightningOfferBannerModal({ isOpen, onClose, navigate, lang = 'es' }) {
  const [timeLeft, setTimeLeft] = useState(60)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    setTimeLeft(60)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const percentage = Math.max(0, Math.min(100, (timeLeft / 60) * 100))

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        padding: '16px',
        animation: 'pwaBannerSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      <style>{`
        @keyframes offerFlashPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255, 122, 26, 0.8)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1)); }
        }
        @keyframes timerBarGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(145deg, #1E1B4B 0%, #0F172A 100%)',
          borderRadius: '26px',
          padding: '20px 18px',
          boxShadow: '0 20px 50px rgba(242, 96, 0, 0.4), 0 0 30px rgba(255, 122, 26, 0.2)',
          border: '2px solid #F26000',
          position: 'relative',
          color: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        {/* Shimmer Light Gradient */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(242, 96, 0, 0.15) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 'bold',
            zIndex: 10
          }}
          title={lang === 'es' ? 'Cerrar banner' : 'Close banner'}
        >
          ✕
        </button>

        {/* Header Badge & Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '14px', zIndex: 2, position: 'relative' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #F26000, #FF7A1A)',
            color: '#FFFFFF',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '900',
            boxShadow: '0 4px 14px rgba(242, 96, 0, 0.5)',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '14px', animation: 'offerFlashPulse 1.5s infinite' }}>⚡</span>
            <span>OFERTA RELÁMPAGO EXCLUSIVA</span>
          </div>

          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            {lang === 'es' ? '🔥 ¡Descuentos Flash Hoy!' : '🔥 Today\'s Flash Deals!'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C7D2FE', fontWeight: '600' }}>
            {lang === 'es' ? 'Aprovecha contratando tus socios de confianza' : 'Book top rated specialists before offer expires'}
          </p>
        </div>

        {/* Live 60-Second Countdown Timer Bar */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          padding: '10px 12px',
          border: '1.5px solid rgba(242, 96, 0, 0.4)',
          marginBottom: '16px',
          zIndex: 2,
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#FF9E66', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>⏱️</span>
              {lang === 'es' ? 'ESTA OFERTA EXPIRA EN:' : 'OFFER EXPIRES IN:'}
            </span>
            <span style={{
              fontSize: '15px',
              fontWeight: 900,
              color: '#FFD700',
              fontFamily: 'monospace',
              background: '#0F172A',
              padding: '2px 8px',
              borderRadius: '8px',
              border: '1px solid #F26000'
            }}>
              {timeLeft}s
            </span>
          </div>

          {/* Progress Bar Track */}
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${percentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #FFD700, #FF7A1A, #F26000)',
              borderRadius: '4px',
              transition: 'width 1s linear'
            }} />
          </div>
        </div>

        {/* Flash Offers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px', zIndex: 2, position: 'relative' }}>
          {FLASH_OFFERS.map(offer => (
            <div
              key={offer.id}
              onClick={() => {
                onClose()
                navigate('search', { catToSelect: offer.cat })
              }}
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
                borderRadius: '16px',
                padding: '12px 10px',
                border: '1px solid rgba(242, 96, 0, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, border-color 0.15s ease'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '22px' }}>{offer.icon}</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '900',
                    background: '#F26000',
                    color: '#FFFFFF',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 6px rgba(242, 96, 0, 0.4)'
                  }}>
                    {offer.discount}
                  </span>
                </div>
                <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '900', color: '#FFFFFF', lineHeight: 1.25 }}>
                  {lang === 'es' ? offer.titleEs : offer.titleEn}
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#94A3B8', fontWeight: '600', lineHeight: 1.2 }}>
                  {offer.descEs}
                </p>
              </div>

              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#FF7A1A' }}>⚡ Reclamar</span>
                <span style={{ fontSize: '12px', color: '#FF7A1A' }}>›</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Main Action Button */}
        <button
          onClick={() => {
            onClose()
            navigate('search')
          }}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #F26000 0%, #FF7A1A 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '18px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '900',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(242, 96, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            zIndex: 2,
            position: 'relative'
          }}
        >
          <span style={{ fontSize: '16px' }}>⚡</span>
          <span>{lang === 'es' ? '¡APROVECHAR OFERTAS RELÁMPAGO AHORA!' : 'CLAIM FLASH DEALS NOW!'}</span>
        </button>
      </div>
    </div>
  )
}
