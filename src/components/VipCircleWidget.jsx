import React from 'react'

export default function VipCircleWidget({ navigate, lang = 'es' }) {
  const handleOpenVip = () => {
    if (navigate) {
      navigate('search', { state: { filterVip: true } })
    } else {
      window.location.href = '/?search=vip'
    }
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, position: 'relative' }}>
      <style>{`
        @keyframes vipCircleGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.8), 0 4px 14px rgba(255, 215, 0, 0.5);
            border-color: #FFD700;
          }
          50% {
            box-shadow: 0 0 0 8px rgba(255, 215, 0, 0), 0 4px 20px rgba(245, 158, 11, 0.9);
            border-color: #FFF;
          }
        }
        @keyframes vipIconCrown {
          0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 4px #FFD700); }
          50% { transform: scale(1.18) rotate(6deg); filter: drop-shadow(0 0 14px #FFD700); }
        }
      `}</style>

      {/* CÍRCULO VIP EN LA BARRA DE NAVEGACIÓN */}
      <button
        onClick={handleOpenVip}
        title={lang === 'es' ? 'Explorar Profesionales VIP Élite 👑' : 'Explore VIP Professionals 👑'}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1A1A2E 0%, #D4AF37 60%, #FFD700 100%)',
          border: '2px solid #FFD700',
          animation: 'vipCircleGlow 2s infinite ease-in-out',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
          outline: 'none',
          padding: 0,
          transition: 'transform 0.18s ease'
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Ícono de Corona VIP */}
        <span style={{
          fontSize: '20px',
          animation: 'vipIconCrown 1.8s infinite ease-in-out',
          display: 'inline-block',
          lineHeight: 1,
          zIndex: 2
        }}>
          👑
        </span>

        {/* Badge Flotante "VIP" */}
        <span style={{
          position: 'absolute',
          top: '-3px',
          right: '-6px',
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          color: '#1A1A2E',
          fontSize: '8px',
          fontWeight: '900',
          borderRadius: '10px',
          padding: '1px 5px',
          border: '1px solid #1A1A2E',
          boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
          zIndex: 3,
          letterSpacing: '0.3px',
          textTransform: 'uppercase'
        }}>
          VIP
        </span>
      </button>
    </div>
  )
}
