import React from 'react'

export default function PhotoNoticeModal({ isOpen, onClose, onContinue, lang = 'es' }) {
  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px 24px',
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1.5px solid #FDBA74',
          position: 'relative'
        }}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#64748B',
            fontWeight: 800
          }}
        >
          ✕
        </button>

        {/* Icono de Alerta */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            border: '2px solid #F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 16px',
            boxShadow: '0 8px 16px rgba(245, 158, 11, 0.25)'
          }}
        >
          ⚠️
        </div>

        {/* Título */}
        <h3
          style={{
            margin: '0 0 12px',
            fontSize: '20px',
            fontWeight: 900,
            color: '#9A3412',
            fontFamily: 'var(--font-display, sans-serif)',
            letterSpacing: '-0.3px'
          }}
        >
          Aviso importante
        </h3>

        {/* Mensaje de la política */}
        <div
          style={{
            background: '#FFF7ED',
            border: '1.5px solid #FFEDD5',
            borderRadius: '16px',
            padding: '16px 18px',
            marginBottom: '20px',
            textAlign: 'left'
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#1E293B',
              fontWeight: 600
            }}
          >
            Tu foto <strong>no puede incluir</strong> números de teléfono, redes sociales ni publicidad. Todos los contactos se realizan únicamente por la plataforma.
          </p>
        </div>

        {/* Botón Continuar */}
        <button
          type="button"
          onClick={() => {
            onClose()
            if (onContinue) onContinue()
          }}
          style={{
            width: '100%',
            padding: '15px 20px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #F26000 0%, #EA580C 100%)',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 900,
            fontFamily: 'var(--font-display, sans-serif)',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(242, 96, 0, 0.35)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
