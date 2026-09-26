import React, { useState, useEffect, useRef, useCallback } from 'react'

export default function RebookCircleWidget({ hiredProsList = [], navigate, lang = 'es' }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedPro, setSelectedPro] = useState(null)
  const [countdown, setCountdown] = useState(5)

  const inactivityTimerRef = useRef(null)
  const countdownIntervalRef = useRef(null)

  useEffect(() => {
    if (hiredProsList.length > 0 && !selectedPro) {
      setSelectedPro(hiredProsList[0])
    }
  }, [hiredProsList, selectedPro])

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

    setCountdown(5)

    let currentSec = 5
    countdownIntervalRef.current = setInterval(() => {
      currentSec -= 1
      if (currentSec >= 0) {
        setCountdown(currentSec)
      }
    }, 1000)

    inactivityTimerRef.current = setTimeout(() => {
      setIsExpanded(false)
    }, 5000)
  }, [])

  useEffect(() => {
    if (isExpanded) {
      resetInactivityTimer()
    } else {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [isExpanded, resetInactivityTimer])

  if (!hiredProsList || hiredProsList.length === 0) return null

  const activePro = selectedPro || hiredProsList[0]

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, position: 'relative' }}>
      <style>{`
        @keyframes orbitRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rebookGlowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7), 0 4px 14px rgba(49, 46, 129, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0), 0 4px 14px rgba(49, 46, 129, 0.4); }
        }
      `}</style>

      {/* COMPACT ORBITING CIRCULAR LOGO BUTTON IN THE NAV RIBBON */}
      <button
        onClick={() => setIsExpanded(true)}
        title={lang === 'es' ? 'Toca para desplegar Re-Contratación 1-Clic' : 'Tap for 1-Click Rebooking'}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
          border: '2px solid #818CF8',
          animation: 'rebookGlowPulse 2.5s infinite',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          position: 'relative',
          flexShrink: 0,
          outline: 'none',
          padding: 0
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Orbiting Satellite Sub-Circle around Logo */}
        <div style={{
          position: 'absolute',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          animation: 'orbitRotate 3s linear infinite',
          pointerEvents: 'none',
          zIndex: 4
        }}>
          <div style={{
            position: 'absolute',
            top: '-3px',
            left: 'calc(50% - 4px)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#F26000',
            border: '1px solid #FFFFFF',
            boxShadow: '0 0 10px #F26000, 0 0 4px #FF7A1A'
          }} />
        </div>

        {/* Center Logo Icon */}
        <span style={{ fontSize: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', zIndex: 2 }}>
          🔄
        </span>

        {/* Counter Badge */}
        <span style={{
          position: 'absolute',
          top: '-3px',
          right: '-4px',
          background: '#F26000',
          color: '#FFFFFF',
          fontSize: '8.5px',
          fontWeight: '900',
          borderRadius: '10px',
          padding: '1px 5px',
          border: '1px solid #1E1B4B',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          zIndex: 5
        }}>
          {hiredProsList.length}
        </span>
      </button>

      {/* OVERLAY MODAL / EXPANDED REBOOKING WINDOW */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
              resetInactivityTimer()
            }}
            onMouseMove={resetInactivityTimer}
            onTouchStart={resetInactivityTimer}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
              borderRadius: '24px',
              padding: '18px 16px',
              boxShadow: '0 20px 50px rgba(49, 46, 129, 0.6), 0 0 30px rgba(129, 140, 248, 0.3)',
              border: '2px solid #818CF8',
              position: 'relative',
              overflow: 'hidden',
              color: '#FFFFFF',
              animation: 'pwaBannerSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {/* Header Window Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F26000, #FF7A1A)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  fontSize: '18px',
                  boxShadow: '0 4px 12px rgba(242, 96, 0, 0.4)'
                }}>
                  🔄
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', background: 'rgba(242, 96, 0, 0.3)', color: '#FF9E66', padding: '2px 8px', borderRadius: '10px', fontWeight: '800', border: '1px solid rgba(242, 96, 0, 0.4)' }}>
                      ⚡ RE-CONTRATACIÓN 1-CLIC
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#C7D2FE', fontWeight: '600' }}>
                    {lang === 'es' ? `Cierra en ${countdown}s si no interactúas` : `Auto-collapses in ${countdown}s`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Carrusel Horizontal de Círculos de Todos los Profesionales Contratados */}
            <div style={{
              display: 'flex',
              gap: '14px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '14px',
              scrollbarWidth: 'none',
              alignItems: 'center'
            }}>
              {hiredProsList.map((item, idx) => {
                const isSelected = (activePro?.proId && activePro.proId === item.proId) || (activePro?.proName && activePro.proName === item.proName) || (idx === 0 && !selectedPro)

                return (
                  <div
                    key={item.id || item.proId || idx}
                    onClick={() => {
                      resetInactivityTimer()
                      setSelectedPro(item)
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'transform 0.2s ease'
                    }}
                    title={`Toca para seleccionar a ${item.proName}`}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={item.proPhotoURL || item.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg'}
                        alt={item.proName}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isSelected ? '3px solid #F26000' : '2px solid rgba(255,255,255,0.4)',
                          boxShadow: isSelected ? '0 0 16px rgba(242, 96, 0, 0.9)' : '0 2px 8px rgba(0,0,0,0.3)',
                          transition: 'all 0.2s ease'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        background: isSelected ? '#F26000' : '#475569',
                        color: '#FFF',
                        fontSize: '10px',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        fontWeight: 'bold',
                        border: '1.5px solid #1E1B4B'
                      }}>
                        🔄
                      </span>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: isSelected ? '900' : '700',
                      color: isSelected ? '#FFFFFF' : '#C7D2FE',
                      marginTop: '4px',
                      maxWidth: '68px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center'
                    }}>
                      {item.proName?.split(' ')[0]}
                    </span>

                    <span style={{
                      fontSize: '9.5px',
                      color: '#93C5FD',
                      fontWeight: '600',
                      maxWidth: '68px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.proSpecialty?.split(' ')[0] || 'Socio'}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Tarjeta Detalle del Profesional Seleccionado con Botón 1-Clic Volver a Contratar */}
            {activePro && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                gap: '10px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ¿Necesitas a {activePro.proName}?
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#C7D2FE', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ⚡ {activePro.proSpecialty || 'Socio contratado anteriormente'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsExpanded(false)
                    const proToBook = {
                      id: activePro.proId,
                      name: activePro.proName,
                      nameEs: activePro.proName,
                      category: activePro.proSpecialty,
                      specEs: activePro.proSpecialty,
                      photoURL: activePro.proPhotoURL || activePro.photoURL,
                      img: activePro.proPhotoURL || activePro.photoURL,
                      avatar: (activePro.proName || 'P').charAt(0).toUpperCase()
                    }
                    navigate('booking', { professional: proToBook })
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #F26000 0%, #FF7A1A 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '9px 15px',
                    fontSize: '12.5px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(242, 96, 0, 0.5)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>⚡</span>
                  <span>Volver a Contratar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
