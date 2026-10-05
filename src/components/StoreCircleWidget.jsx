import React from 'react'

export default function StoreCircleWidget({ lang = 'es' }) {
  const handleOpenStore = () => {
    window.open('https://listopatron.com.do/?page=shop', '_blank')
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, position: 'relative' }}>
      <style>{`
        @keyframes storeCircleGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.8), 0 4px 14px rgba(139, 92, 246, 0.4);
            border-color: #F472B6;
          }
          50% {
            box-shadow: 0 0 0 8px rgba(236, 72, 153, 0), 0 4px 18px rgba(245, 158, 11, 0.8);
            border-color: #FFD700;
          }
        }
        @keyframes storeIconBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2.5px) scale(1.12); }
        }
      `}</style>

      {/* CÍRCULO TIENDA EN LA BARRA DE NAVEGACIÓN */}
      <button
        onClick={handleOpenStore}
        title={lang === 'es' ? 'Visitar la Tienda Web de Pedidos Listo 🛍️' : 'Visit Pedidos Listo Web Store 🛍️'}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F26000 100%)',
          border: '2px solid #F472B6',
          animation: 'storeCircleGlow 2.2s infinite ease-in-out',
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
        {/* Ícono de compras rebotando */}
        <span style={{
          fontSize: '20px',
          animation: 'storeIconBounce 1.8s infinite ease-in-out',
          display: 'inline-block',
          lineHeight: 1,
          zIndex: 2,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }}>
          🛍️
        </span>

        {/* Badge Flotante "TIENDA" */}
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
          border: '1px solid #8B5CF6',
          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
          zIndex: 3,
          letterSpacing: '0.2px',
          textTransform: 'uppercase'
        }}>
          TIENDA
        </span>
      </button>
    </div>
  )
}
