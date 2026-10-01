import React from 'react'

export default function TombolaCircleWidget({ onOpenTombola, lang = 'es' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, position: 'relative' }}>
      <style>{`
        @keyframes tombolaGlowPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.8), 0 4px 14px rgba(225, 29, 72, 0.4);
            border-color: #FFD700;
          }
          50% {
            box-shadow: 0 0 0 8px rgba(255, 215, 0, 0), 0 4px 18px rgba(255, 133, 51, 0.8);
            border-color: #FFFFFF;
          }
        }
        @keyframes tombolaIconSparkle {
          0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 4px #FFD700); }
          50% { transform: scale(1.18) rotate(10deg); filter: drop-shadow(0 0 12px #FFD700); }
        }
      `}</style>

      {/* CÍRCULO TÓMBOLA EN LA BARRA DE NAVEGACIÓN */}
      <button
        onClick={onOpenTombola}
        title={lang === 'es' ? 'Tómbola de Contratos Gratis - Toca para probar tu suerte 🎰' : 'Free Contracts Wheel - Tap to try your luck 🎰'}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFE600 0%, #FF8533 50%, #E11D48 100%)',
          border: '2px solid #FFD700',
          animation: 'tombolaGlowPulse 2s infinite ease-in-out',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          position: 'relative',
          flexShrink: 0,
          outline: 'none',
          padding: 0,
          transition: 'transform 0.18s ease'
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Ícono de regalo/tómbola chispeante */}
        <span style={{
          fontSize: '20px',
          animation: 'tombolaIconSparkle 1.6s infinite ease-in-out',
          display: 'inline-block',
          lineHeight: 1,
          zIndex: 2
        }}>
          🎰
        </span>

        {/* Badge Flotante "GANA" */}
        <span style={{
          position: 'absolute',
          top: '-3px',
          right: '-6px',
          background: '#FFD700',
          color: '#1A1A2E',
          fontSize: '7.5px',
          fontWeight: '900',
          borderRadius: '10px',
          padding: '1px 4px',
          border: '1px solid #E11D48',
          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
          zIndex: 3,
          letterSpacing: '0.2px',
          textTransform: 'uppercase'
        }}>
          GANA
        </span>
      </button>
    </div>
  )
}
