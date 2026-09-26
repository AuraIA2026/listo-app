import React, { useState } from 'react'

export default function BeforeAfterSlider({ beforeImg, afterImg, beforeLabel = 'Antes', afterLabel = 'Después' }) {
  const [sliderPos, setSliderPos] = useState(50)

  const handleMove = (clientX, rect) => {
    const x = clientX - rect.left
    let pct = (x / rect.width) * 100
    if (pct < 0) pct = 0
    if (pct > 100) pct = 100
    setSliderPos(pct)
  }

  const handleTouch = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    handleMove(e.touches[0].clientX, rect)
  }

  const handleMouse = (e) => {
    if (e.buttons !== 1) return
    const rect = e.currentTarget.getBoundingClientRect()
    handleMove(e.clientX, rect)
  }

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        userSelect: 'none',
        touchAction: 'none',
        cursor: 'ew-resize',
        border: '1px solid rgba(0,0,0,0.08)'
      }}
      onMouseMove={handleMouse}
      onTouchMove={handleTouch}
    >
      {/* Imagen Después (Fondo) */}
      <img 
        src={afterImg} 
        alt={afterLabel} 
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      <span style={{
        position: 'absolute',
        top: 12,
        right: 12,
        background: 'rgba(16, 185, 129, 0.9)',
        color: '#fff',
        fontSize: '11px',
        fontWeight: '900',
        padding: '4px 10px',
        borderRadius: '20px',
        backdropFilter: 'blur(4px)',
        zIndex: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        ✨ {afterLabel}
      </span>

      {/* Imagen Antes (Recortada) */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${sliderPos}%`,
          overflow: 'hidden',
          zIndex: 3
        }}
      >
        <img 
          src={beforeImg} 
          alt={beforeLabel} 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            maxWidth: 'none',
            // Aseguramos que la imagen antes encaje exactamente con el contenedor base
            width: '100%',
            objectFit: 'cover'
          }}
        />
        <span style={{
          position: 'absolute',
          top: 12,
          left: 12,
          background: 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          fontSize: '11px',
          fontWeight: '900',
          padding: '4px 10px',
          borderRadius: '20px',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          🛠️ {beforeLabel}
        </span>
      </div>

      {/* Barra divisora y tirador */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPos}%`,
          width: '3px',
          background: '#FFFFFF',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          zIndex: 4,
          transform: 'translateX(-50%)'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#F26000',
          color: '#FFFFFF',
          border: '3px solid #FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(242,96,0,0.5)'
        }}>
          ↔
        </div>
      </div>
    </div>
  )
}
