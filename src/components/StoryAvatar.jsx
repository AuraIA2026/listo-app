import React from 'react'

export default function StoryAvatar({
  pro,
  src,
  alt,
  size = 50,
  storyData,
  onOpenStory,
  className = '',
  style = {},
  fallbackAvatar = 'P',
  badgePosition = 'top-right'
}) {
  const hasStory = Boolean(storyData && storyData.stories && storyData.stories.length > 0)
  const isAllSeen = storyData?.isAllSeen || false

  const handleAvatarClick = (e) => {
    if (hasStory && onOpenStory) {
      e.stopPropagation()
      onOpenStory(storyData.firstIndex)
    }
  }

  // Dimensiones
  const outerSize = hasStory ? size + 8 : size

  return (
    <div 
      className={`story-avatar-container ${hasStory ? 'has-active-story' : ''} ${className}`}
      onClick={handleAvatarClick}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: hasStory ? 'pointer' : 'default',
        width: `${outerSize}px`,
        height: `${outerSize}px`,
        flexShrink: 0,
        ...style
      }}
      title={hasStory ? `📸 Ver Historia de ${pro?.name || pro?.nameEs || 'Profesional'} (24h)` : (alt || 'Perfil')}
    >
      {/* Ring exterior degradado estilo Instagram para historias activas */}
      {hasStory && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            padding: '2.5px',
            background: isAllSeen
              ? 'rgba(148, 163, 184, 0.4)'
              : 'linear-gradient(45deg, #F26000 0%, #FF007A 40%, #7928CA 70%, #FF7A1A 100%)',
            boxShadow: isAllSeen ? 'none' : '0 0 12px rgba(242, 96, 0, 0.5), 0 0 6px rgba(255, 0, 122, 0.4)',
            animation: isAllSeen ? 'none' : 'storyRingGlow 2.5s ease-in-out infinite alternate',
            zIndex: 1
          }}
        >
          <style>{`
            @keyframes storyRingGlow {
              0% { transform: scale(1) rotate(0deg); filter: hue-rotate(0deg); }
              50% { transform: scale(1.03) rotate(180deg); filter: hue-rotate(25deg); }
              100% { transform: scale(1) rotate(360deg); filter: hue-rotate(0deg); }
            }
            @keyframes storyPulseBadge {
              0% { transform: scale(0.92); opacity: 0.85; }
              100% { transform: scale(1.1); opacity: 1; }
            }
          `}</style>
          {/* Fondo blanco interior para separar el ring de la foto */}
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#FFFFFF' }} />
        </div>
      )}

      {/* Foto / Avatar real */}
      <div 
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          zIndex: 2,
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {src ? (
          <img 
            src={src} 
            alt={alt || 'Foto'} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
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

      {/* Badge Flotante "📸 HISTORIA 24H" */}
      {hasStory && (
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            background: 'linear-gradient(135deg, #F26000, #FF007A)',
            color: 'white',
            borderRadius: '12px',
            padding: '2px 6px',
            fontSize: '9px',
            fontWeight: '900',
            zIndex: 5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            border: '1.5px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            animation: isAllSeen ? 'none' : 'storyPulseBadge 1.5s infinite alternate'
          }}
        >
          <span>📸</span>
          <span style={{ fontSize: '8px', textTransform: 'uppercase' }}>En vivo</span>
        </div>
      )}
    </div>
  )
}
