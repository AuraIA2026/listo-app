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
  const ringPadding = 3.5
  const outerSize = size + (ringPadding * 2) + 4

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
      title={`📸 Ver Historia de ${pro?.name || pro?.nameEs || 'Profesional'} (24h)`}
    >
      {/* Anillo Degradado estilo Instagram (Naranja - Rosa - Violeta) */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          padding: `${ringPadding}px`,
          background: isAllSeen
            ? 'rgba(148, 163, 184, 0.5)'
            : 'linear-gradient(45deg, #F26000 0%, #FF007A 45%, #7928CA 75%, #FF7A1A 100%)',
          boxShadow: isAllSeen ? 'none' : '0 4px 16px rgba(242, 96, 0, 0.6), 0 0 12px rgba(255, 0, 122, 0.5)',
          animation: isAllSeen ? 'none' : 'ringRotateAnim 3.5s linear infinite',
          zIndex: 1
        }}
      >
        <style>{`
          @keyframes ringRotateAnim {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
    </div>
  )
}
