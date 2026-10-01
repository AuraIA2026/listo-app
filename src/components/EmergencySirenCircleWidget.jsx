import React from 'react'

export default function EmergencySirenCircleWidget({ isExpanded, onToggle, lang = 'es' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, position: 'relative' }}>
      <style>{`
        @keyframes firefighterSirenGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.9), 0 0 14px rgba(239, 68, 68, 0.7), 0 4px 14px rgba(185, 28, 28, 0.5);
            border-color: #EF4444;
          }
          50% {
            box-shadow: 0 0 0 9px rgba(245, 158, 11, 0), 0 0 28px rgba(245, 158, 11, 1), 0 4px 18px rgba(220, 38, 38, 0.9);
            border-color: #FFD700;
          }
        }
        @keyframes firefighterSirenRotate {
          0% { transform: scale(1) rotate(-10deg); filter: drop-shadow(0 0 6px #FF3333); }
          25% { transform: scale(1.22) rotate(12deg); filter: drop-shadow(0 0 16px #FFD700); }
          50% { transform: scale(1.05) rotate(-8deg); filter: drop-shadow(0 0 8px #FF3333); }
          75% { transform: scale(1.25) rotate(12deg); filter: drop-shadow(0 0 20px #FFD700); }
          100% { transform: scale(1) rotate(-10deg); filter: drop-shadow(0 0 6px #FF3333); }
        }
        @keyframes firefighterBeaconPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.4; }
        }
      `}</style>

      {/* CÍRCULO SIRENA BOMBERO EN LA BARRA DE NAVEGACIÓN */}
      <button
        onClick={onToggle}
        title={lang === 'es' ? '¿Qué problema tienes hoy? Toca para desplegar 8 emergencias en 1-Clic 🚨' : 'What problem do you have today? Tap for 1-Click emergencies 🚨'}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 50%, #991B1B 100%)',
          border: isExpanded ? '2.5px solid #FFD700' : '2px solid #EF4444',
          animation: 'firefighterSirenGlow 1.6s infinite ease-in-out',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
          outline: 'none',
          padding: 0,
          transform: isExpanded ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 0.2s ease'
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
        onMouseUp={e => e.currentTarget.style.transform = isExpanded ? 'scale(1.06)' : 'scale(1)'}
      >
        {/* Halo de luz de destello rotatorio tipo sirena de bombero */}
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          right: '-2px',
          bottom: '-2px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(239,68,68,0) 70%)',
          animation: 'firefighterBeaconPulse 1s infinite alternate',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* Ícono de Sirena Animado alusando */}
        <span style={{
          fontSize: '20px',
          animation: 'firefighterSirenRotate 1.2s infinite ease-in-out',
          display: 'inline-block',
          lineHeight: 1,
          zIndex: 2
        }}>
          🚨
        </span>

        {/* Badge Flotante SOS */}
        <span style={{
          position: 'absolute',
          top: '-3px',
          right: '-4px',
          background: '#FFD700',
          color: '#7F1D1D',
          fontSize: '8px',
          fontWeight: '900',
          borderRadius: '10px',
          padding: '1px 5px',
          border: '1px solid #7F1D1D',
          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
          zIndex: 3,
          letterSpacing: '0.3px'
        }}>
          SOS
        </span>
      </button>
    </div>
  )
}
