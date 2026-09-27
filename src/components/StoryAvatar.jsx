import React from 'react'

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

  const handleAvatarClick = (e) => {
    if (hasStory && onOpenStory) {
      e.stopPropagation()
      onOpenStory(storyData.firstIndex)
    }
  }

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
        {src ? (
          <img src={src} alt={alt || 'Foto'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #FF7A1A, #F26000)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: `${Math.max(12, Math.floor(size * 0.4))}px` }}>
            {fallbackAvatar}
          </div>
        )}
      </div>
    )
  }

  // Si TIENE HISTORIA: Anillo degradado grueso estilo Instagram / TikTok sobre la foto
  const ringPadding = 4
  const outerSize = size + (ringPadding * 2) + 6

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
      {/* Anillo Degradado Ultra Resplandeciente (Dorado - Naranja - Neón - Rosa) */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          padding: `${ringPadding}px`,
          background: isAllSeen
            ? 'rgba(148, 163, 184, 0.6)'
            : 'linear-gradient(45deg, #FFD700 0%, #F26000 25%, #FF007A 50%, #00F0FF 75%, #FFD700 100%)',
          boxShadow: isAllSeen 
            ? 'none' 
            : '0 0 16px #FFD700, 0 0 30px #F26000, 0 0 45px #FF007A, inset 0 0 12px #FFD700',
          animation: isAllSeen ? 'none' : 'ringRotateAnim 3.2s linear infinite, resplandorGlowPulse 1.8s ease-in-out infinite alternate',
          zIndex: 1
        }}
      >
        <style>{`
          @keyframes ringRotateAnim {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes resplandorGlowPulse {
            0% {
              box-shadow: 0 0 14px #FFD700, 0 0 28px #F26000, 0 0 42px #FF007A, inset 0 0 10px #FFD700;
              filter: brightness(1);
            }
            50% {
              box-shadow: 0 0 24px #FFD700, 0 0 48px #FF7A1A, 0 0 70px #FF007A, 0 0 90px #00F0FF, inset 0 0 20px #FFD700;
              filter: brightness(1.3);
            }
            100% {
              box-shadow: 0 0 14px #FFD700, 0 0 28px #F26000, 0 0 42px #FF007A, inset 0 0 10px #FFD700;
              filter: brightness(1);
            }
          }
          @keyframes storyBadgePulse {
            0%, 100% { transform: translateX(-50%) scale(1); filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6)); }
            50% { transform: translateX(-50%) scale(1.15); filter: drop-shadow(0 0 12px #FFD700); }
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
        {src ? (
          <img 
            src={src} 
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
              background: 'linear-gradient(135deg, #FF7A1A, #F26000)', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 'bold',
              fontSize: `${Math.max(12, Math.floor(size * 0.4))}px`
            }}
          >
            {fallbackAvatar}
          </div>
        )}
      </div>

      {/* Badge resplandeciente HISTORIA en la parte inferior */}
      <span
        style={{
          position: 'absolute',
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: isAllSeen
            ? 'linear-gradient(135deg, #64748B, #475569)'
            : 'linear-gradient(135deg, #FFD700 0%, #F26000 100%)',
          color: isAllSeen ? '#FFFFFF' : '#1A1A2E',
          fontSize: `${Math.max(9, Math.floor(size * 0.15))}px`,
          fontWeight: '900',
          padding: '2px 8px',
          borderRadius: '12px',
          letterSpacing: '0.4px',
          whiteSpace: 'nowrap',
          border: '1.5px solid #FFFFFF',
          zIndex: 5,
          boxShadow: isAllSeen ? '0 2px 6px rgba(0,0,0,0.3)' : '0 0 10px rgba(255,215,0,0.8), 0 2px 8px rgba(242,96,0,0.6)',
          animation: isAllSeen ? 'none' : 'storyBadgePulse 1.5s ease-in-out infinite'
        }}
      >
        🔥 HISTORIA
      </span>
    </div>
  )
}
