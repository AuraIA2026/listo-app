import React from 'react'
import { getProPlanTheme } from '../planTheme'

export default function StoryAvatar({
  pro,
  src,
  alt,
  size = 64,
  storyData,
  onOpenStory,
  className = '',
  style = {},
  fallbackAvatar = 'P'
}) {
  const hasStory = Boolean(storyData && storyData.stories && storyData.stories.length > 0)
  const isAllSeen = storyData?.isAllSeen || false
  const validSrc = (src && typeof src === 'string' && src.trim() !== '' && !src.includes('randomuser.me') && !src.includes('pravatar.cc') && !src.includes('ui-avatars.com')) ? src.trim() : null

  const handleAvatarClick = (e) => {
    if (hasStory && onOpenStory) {
      e.stopPropagation()
      onOpenStory(storyData.firstIndex)
    }
  }

  // Obtener el tema exacto del plan del profesional (VIP, Platinum, Gold, Estándar, Cliente)
  const planRaw = pro?.currentPlan || pro?.planId || pro?.plan || pro?.planName || pro?.membership || pro?.verificacion?.plan
  const theme = getProPlanTheme(planRaw, pro?.rating)

  // Si no tiene historia activa, renderizamos la imagen normal sin anillo
  if (!hasStory) {
    return (
      <div 
        className={`story-avatar-container ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8FAFC',
          flexShrink: 0,
          ...style
        }}
      >
        {validSrc ? (
          <img src={validSrc} alt={alt || 'Foto'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #E2E8F0 0%, #CBD5E1 100%)', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '68%', height: '68%', marginTop: '12%' }}>
              <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
            </svg>
          </div>
        )}
      </div>
    )
  }

  // Si TIENE HISTORIA: Anillo degradado del color del plan del profesional
  const ringPadding = 3.5
  const outerSize = size + (ringPadding * 2) + 5

  return (
    <div 
      className={`story-avatar-container has-active-story ${className}`}
      onClick={handleAvatarClick}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        width: `${outerSize}px`,
        height: `${outerSize}px`,
        flexShrink: 0,
        ...style
      }}
      title={`📸 Ver Historia de ${pro?.name || pro?.nameEs || pro?.displayName || 'Usuario'} (24h)`}
    >
      {/* Anillo Degradado Resplandeciente armónico del Color del Plan */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          padding: `${ringPadding}px`,
          background: isAllSeen
            ? 'rgba(148, 163, 184, 0.6)'
            : (theme.ringGradient || 'linear-gradient(45deg, #FF7A1A 0%, #F26000 50%, #FFD700 100%)'),
          boxShadow: isAllSeen 
            ? 'none' 
            : `0 0 8px ${theme.color}88, 0 2px 8px rgba(0,0,0,0.25)`,
          animation: isAllSeen ? 'none' : 'ringRotateAnim 4.5s linear infinite',
          zIndex: 1
        }}
      >
        <style>{`
          @keyframes ringRotateAnim {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes storyBadgePulse {
            0%, 100% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.08); }
          }
        `}</style>
        {/* Borde blanco interno separador */}
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#FFFFFF' }} />
      </div>

      {/* Avatar / Foto del profesional adentro del anillo */}
      <div 
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          zIndex: 2,
          background: '#0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}
      >
        {validSrc ? (
          <img 
            src={validSrc} 
            alt={alt || 'Foto'} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover'
            }}
          />
        ) : (
          <div 
            style={{ 
              width: '100%', 
              height: '100%', 
              background: 'linear-gradient(180deg, #E2E8F0 0%, #CBD5E1 100%)', 
              color: '#64748B', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '68%', height: '68%', marginTop: '12%' }}>
              <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
            </svg>
          </div>
        )}
      </div>

      {/* Badge resplandeciente HISTORIA del color del plan */}
      <span
        style={{
          position: 'absolute',
          bottom: '-5px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: isAllSeen
            ? 'linear-gradient(135deg, #64748B, #475569)'
            : (theme.badgeBg || 'linear-gradient(135deg, #F26000 0%, #FF7A1A 100%)'),
          color: isAllSeen ? '#FFFFFF' : (theme.badgeColor || '#FFFFFF'),
          fontSize: `${Math.max(8.5, Math.floor(size * 0.14))}px`,
          fontWeight: '900',
          padding: '2px 7px',
          borderRadius: '12px',
          letterSpacing: '0.4px',
          whiteSpace: 'nowrap',
          border: '1.5px solid #FFFFFF',
          zIndex: 5,
          boxShadow: isAllSeen ? '0 2px 6px rgba(0,0,0,0.3)' : `0 2px 8px ${theme.color || 'rgba(242,96,0,0.6)'}`,
          animation: isAllSeen ? 'none' : 'storyBadgePulse 2s ease-in-out infinite'
        }}
      >
        🔥 HISTORIA
      </span>
    </div>
  )
}
