import React, { useState, useEffect, useRef, useCallback } from 'react'
import { detectGpsLocation } from '../utils/gpsLocation'

const CATEGORY_FILTERS = [
  { id: 'all', labelEs: '🌟 Todos', labelEn: '🌟 All', icon: '🌟' },
  { id: 'plomero', labelEs: '🔧 Plomero', labelEn: '🔧 Plumber', icon: '🔧' },
  { id: 'electricista', labelEs: '⚡ Electricista', labelEn: '⚡ Electrician', icon: '⚡' },
  { id: 'cerrajero', labelEs: '🔑 Cerrajero', labelEn: '🔑 Locksmith', icon: '🔑' },
  { id: 'mecanico', labelEs: '🚘 Mecánico', labelEn: '🚘 Mechanic', icon: '🚘' },
  { id: 'limpieza', labelEs: '🧹 Limpieza', labelEn: '🧹 Cleaning', icon: '🧹' },
  { id: 'refrigeracion', labelEs: '❄️ Refrigeración', labelEn: '❄️ A/C Tech', icon: '❄️' },
  { id: 'pintor', labelEs: '🎨 Pintor', labelEn: '🎨 Painter', icon: '🎨' },
  { id: 'ninera', labelEs: '👶 Niñera', labelEn: '👶 Nanny', icon: '👶' },
]

const SAMPLE_PROS_BY_CAT = {
  plomero: [
    { id: 'radar_plomero_1', name: 'Mariano Fco. (Papa Piso)', category: 'Plomero & Pisos', rating: 5.0, photoURL: 'https://randomuser.me/api/portraits/men/32.jpg', dist: '1.2 km', angle: 45, radiusRatio: 0.35 },
    { id: 'radar_plomero_2', name: 'Pedro Castillo', category: 'Plomero Urgencias 24/7', rating: 4.9, photoURL: 'https://randomuser.me/api/portraits/men/44.jpg', dist: '2.8 km', angle: 165, radiusRatio: 0.60 },
    { id: 'radar_plomero_3', name: 'Manuel Reyes', category: 'Plomero e Instalaciones', rating: 5.0, photoURL: 'https://randomuser.me/api/portraits/men/68.jpg', dist: '4.1 km', angle: 280, radiusRatio: 0.82 }
  ],
  electricista: [
    { id: 'radar_elec_1', name: 'María González', category: 'Electricista 24/7', rating: 4.9, photoURL: 'https://randomuser.me/api/portraits/women/44.jpg', dist: '2.1 km', angle: 125, radiusRatio: 0.55 },
    { id: 'radar_elec_2', name: 'Andrés Silva', category: 'Electricista Residencial', rating: 5.0, photoURL: 'https://randomuser.me/api/portraits/men/52.jpg', dist: '3.5 km', angle: 240, radiusRatio: 0.75 }
  ],
  cerrajero: [
    { id: 'radar_cerra_1', name: 'David (La Leyenda)', category: 'Cerrajero Express', rating: 5.0, photoURL: 'https://randomuser.me/api/portraits/men/62.jpg', dist: '0.8 km', angle: 220, radiusRatio: 0.28 },
    { id: 'radar_cerra_2', name: 'José Vargas', category: 'Cerrajero Automotriz', rating: 4.9, photoURL: 'https://randomuser.me/api/portraits/men/71.jpg', dist: '2.9 km', angle: 95, radiusRatio: 0.62 }
  ],
  mecanico: [
    { id: 'radar_meca_1', name: 'Luisa Martínez', category: 'Mecánico Móvil', rating: 4.8, photoURL: 'https://randomuser.me/api/portraits/women/68.jpg', dist: '3.4 km', angle: 310, radiusRatio: 0.72 },
    { id: 'radar_meca_2', name: 'Fernando Ramos', category: 'Mecánico a Domicilio', rating: 5.0, photoURL: 'https://randomuser.me/api/portraits/men/82.jpg', dist: '1.9 km', angle: 140, radiusRatio: 0.48 }
  ],
  limpieza: [
    { id: 'radar_limp_1', name: 'Alexa Martínez', category: 'Limpieza de Oficina y Hogar', rating: 4.9, photoURL: 'https://randomuser.me/api/portraits/women/32.jpg', dist: '1.5 km', angle: 60, radiusRatio: 0.40 },
    { id: 'radar_limp_2', name: 'Carmen Soler', category: 'Limpieza Profunda', rating: 5.0, photoURL: 'https://randomuser.me/api/portraits/women/55.jpg', dist: '3.2 km', angle: 200, radiusRatio: 0.70 }
  ],
  refrigeracion: [
    { id: 'radar_refri_1', name: 'Carlos Herrera', category: 'Técnico de A/C y Refr.', rating: 4.9, photoURL: 'https://randomuser.me/api/portraits/men/85.jpg', dist: '4.1 km', angle: 180, radiusRatio: 0.85 }
  ],
  pintor: [
    { id: 'radar_pintor_1', name: 'Jorge Batista', category: 'Pintor Profesional', rating: 5.0, photoURL: 'https://randomuser.me/api/portraits/men/29.jpg', dist: '2.4 km', angle: 110, radiusRatio: 0.52 }
  ],
  ninera: [
    { id: 'radar_ninera_1', name: 'Ana Isabel', category: 'Niñera y Cuidado Infantil', rating: 5.0, photoURL: 'https://randomuser.me/api/portraits/women/24.jpg', dist: '1.7 km', angle: 330, radiusRatio: 0.42 }
  ]
}

export default function GpsRadarWidget({ pros = [], navigate, lang = 'es' }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPro, setSelectedPro] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const inactivityTimerRef = useRef(null)
  const countdownIntervalRef = useRef(null)

  // Reset 3-second inactivity auto-collapse timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

    setCountdown(3)

    let currentSec = 3
    countdownIntervalRef.current = setInterval(() => {
      currentSec -= 1
      if (currentSec >= 0) {
        setCountdown(currentSec)
      }
    }, 1000)

    inactivityTimerRef.current = setTimeout(() => {
      setIsExpanded(false)
    }, 3000)
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

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {},
        { timeout: 5000 }
      )
    }
  }, [])

  const handleScanGps = async (e) => {
    if (e) e.stopPropagation()
    resetInactivityTimer()
    setIsScanning(true)
    try {
      const loc = await detectGpsLocation()
      setUserLocation({ lat: loc.lat, lng: loc.lng })
    } catch (err) {
      console.log('Notice scanning GPS:', err)
    } finally {
      setTimeout(() => setIsScanning(false), 1200)
    }
  }

  // Filter pros based on selectedCategory & searchQuery
  const getFilteredPros = () => {
    let filtered = []

    if (pros && pros.length > 0) {
      filtered = pros.filter(pro => {
        const cat = (pro.category || pro.specEs || pro.specEn || '').toLowerCase()
        const name = (pro.name || pro.nameEs || pro.nameEn || '').toLowerCase()
        const query = searchQuery.toLowerCase().trim()

        const matchesCat = (selectedCategory === 'all') || cat.includes(selectedCategory)
        const matchesQuery = !query || cat.includes(query) || name.includes(query)

        return matchesCat && matchesQuery
      })
    }

    if (filtered.length === 0) {
      if (selectedCategory !== 'all' && SAMPLE_PROS_BY_CAT[selectedCategory]) {
        filtered = SAMPLE_PROS_BY_CAT[selectedCategory]
      } else if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim()
        let matchingSamples = []
        Object.keys(SAMPLE_PROS_BY_CAT).forEach(catKey => {
          if (catKey.includes(query) || query.includes(catKey)) {
            matchingSamples = [...matchingSamples, ...SAMPLE_PROS_BY_CAT[catKey]]
          }
        })
        filtered = matchingSamples.length > 0 ? matchingSamples : [
          { id: 'radar_generic', name: 'Socio Verificado', category: `Especialista en ${searchQuery}`, rating: 5.0, photoURL: 'https://randomuser.me/api/portraits/men/32.jpg', dist: '1.1 km', angle: 45, radiusRatio: 0.35 }
        ]
      } else {
        filtered = [
          { id: 'radar_1', name: 'Juan Pérez', category: 'Plomero Máster', rating: 5.0, photoURL: 'https://randomuser.me/api/portraits/men/32.jpg', dist: '1.2 km', angle: 45, radiusRatio: 0.35 },
          { id: 'radar_2', name: 'María González', category: 'Electricista 24/7', rating: 4.9, photoURL: 'https://randomuser.me/api/portraits/women/44.jpg', dist: '2.1 km', angle: 125, radiusRatio: 0.55 },
          { id: 'radar_3', name: 'David (La Leyenda)', category: 'Cerrajero Express', rating: 5.0, photoURL: 'https://randomuser.me/api/portraits/men/62.jpg', dist: '0.8 km', angle: 220, radiusRatio: 0.28 },
          { id: 'radar_4', name: 'Luisa Martínez', category: 'Mecánico Móvil', rating: 4.8, photoURL: 'https://randomuser.me/api/portraits/women/68.jpg', dist: '3.4 km', angle: 310, radiusRatio: 0.72 },
          { id: 'radar_5', name: 'Alexa Martínez', category: 'Limpieza de Oficina', rating: 4.9, photoURL: 'https://randomuser.me/api/portraits/women/32.jpg', dist: '1.5 km', angle: 180, radiusRatio: 0.45 }
        ]
      }
    }

    return filtered
  }

  const availablePros = getFilteredPros()

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, position: 'relative' }}>
      <style>{`
        @keyframes radarRibbonPulse {
          0% { box-shadow: 0 0 0 0 rgba(242, 96, 0, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(242, 96, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(242, 96, 0, 0); }
        }
        @keyframes radarBeamSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes proBlipPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
          50% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
        }
      `}</style>

      {/* COMPACT CIRCLE BUTTON INLINE IN THE RIBBON */}
      <button
        onClick={() => setIsExpanded(true)}
        title={lang === 'es' ? 'Toca para abrir Radar GPS en pantalla' : 'Tap to open GPS Radar'}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          border: '2px solid #F26000',
          animation: 'radarRibbonPulse 2s infinite',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          position: 'relative',
          boxShadow: '0 4px 14px rgba(242, 96, 0, 0.4)',
          flexShrink: 0,
          outline: 'none',
          padding: 0
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Rotating Beam inside Circle */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg at 50% 50%, rgba(242, 96, 0, 0.5) 0deg, transparent 60deg, transparent 360deg)',
          animation: 'radarBeamSweep 3s linear infinite',
          pointerEvents: 'none'
        }} />

        <span style={{ fontSize: '19px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', zIndex: 2 }}>
          🗺️
        </span>

        <span style={{
          position: 'absolute',
          top: '-3px',
          right: '-4px',
          background: '#22C55E',
          color: '#FFFFFF',
          fontSize: '8.5px',
          fontWeight: '900',
          borderRadius: '10px',
          padding: '1px 5px',
          border: '1px solid #0F172A',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          zIndex: 3
        }}>
          {availablePros.length}
        </span>
      </button>

      {/* OVERLAY MODAL / EXPANDED RADAR WINDOW (FULL DISPLAY WITH 3s AUTO-COLLAPSE) */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
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
              background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
              borderRadius: '24px',
              padding: '18px 16px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              border: '2px solid #F26000',
              position: 'relative',
              overflow: 'hidden',
              color: '#FFFFFF',
              animation: 'pwaBannerSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {/* Header Window with Inactivity Timer Badge & Close Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
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
                  🗺️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#FFFFFF' }}>
                    {lang === 'es' ? 'Modo Radar GPS' : 'GPS Radar Mode'}
                  </h3>
                  <p style={{ margin: '1px 0 0', fontSize: '10.5px', color: '#94A3B8', fontWeight: '600' }}>
                    {lang === 'es' ? `Cierra sin interacción (${countdown}s)` : `Auto-collapses in ${countdown}s`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleScanGps}
                  disabled={isScanning}
                  style={{
                    background: 'linear-gradient(135deg, #F26000, #FF7A1A)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '12px', animation: isScanning ? 'spin 1s linear infinite' : 'none' }}>
                    {isScanning ? '🔄' : '🎯'}
                  </span>
                  {isScanning ? '...' : (lang === 'es' ? 'Escanear' : 'Scan')}
                </button>

                <button
                  onClick={() => setIsExpanded(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#FF9E66',
                    border: '1px solid rgba(242, 96, 0, 0.4)',
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
                  title={lang === 'es' ? 'Cerrar Radar' : 'Close Radar'}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Buscador por especialidad */}
            <div style={{ marginBottom: '10px', position: 'relative' }}>
              <input
                type="text"
                placeholder={lang === 'es' ? '🔍 Buscar por especialidad (ej. Plomero, Cerrajero...)' : '🔍 Search service...'}
                value={searchQuery}
                onChange={(e) => {
                  resetInactivityTimer()
                  setSearchQuery(e.target.value)
                }}
                style={{
                  width: '100%',
                  padding: '8px 32px 8px 12px',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(242, 96, 0, 0.4)',
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#FFFFFF',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    resetInactivityTimer()
                    setSearchQuery('')
                  }}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Chips de filtro por categoría */}
            <div style={{
              display: 'flex',
              gap: '5px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '10px',
              scrollbarWidth: 'none'
            }}>
              {CATEGORY_FILTERS.map(cat => {
                const isSelected = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      resetInactivityTimer()
                      setSelectedCategory(cat.id)
                      setSearchQuery('')
                    }}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '4px 10px',
                      borderRadius: '14px',
                      fontSize: '10.5px',
                      fontWeight: isSelected ? '900' : '700',
                      border: isSelected ? '1.5px solid #F26000' : '1px solid rgba(255, 255, 255, 0.15)',
                      background: isSelected ? 'linear-gradient(135deg, #F26000, #FF7A1A)' : 'rgba(30, 41, 59, 0.8)',
                      color: isSelected ? '#FFFFFF' : '#CBD5E1',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {lang === 'es' ? cat.labelEs : cat.labelEn}
                  </button>
                )
              })}
            </div>

            {/* Contenedor del Mapa Radar Dynamic */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '230px',
              borderRadius: '18px',
              background: 'radial-gradient(circle, #1E293B 0%, #090D16 100%)',
              border: '1px solid rgba(242, 96, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
            }}>
              {/* Concentric Radar Distance Rings */}
              <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', border: '1px dashed rgba(242, 96, 0, 0.25)' }} />
              <div style={{ position: 'absolute', width: '140px', height: '140px', borderRadius: '50%', border: '1px solid rgba(242, 96, 0, 0.35)' }} />
              <div style={{ position: 'absolute', width: '80px', height: '80px', borderRadius: '50%', border: '1px dashed rgba(242, 96, 0, 0.45)' }} />

              {/* Crosshair Axes Lines */}
              <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(242, 96, 0, 0.2)' }} />
              <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'rgba(242, 96, 0, 0.2)' }} />

              {/* Radar Scanner Rotating Beam */}
              <div style={{
                position: 'absolute',
                width: '230px',
                height: '230px',
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg at 50% 50%, rgba(242, 96, 0, 0.35) 0deg, rgba(242, 96, 0, 0) 60deg, transparent 360deg)',
                animation: 'radarBeamSweep 4s linear infinite',
                pointerEvents: 'none'
              }} />

              {/* Center User Pin */}
              <div style={{
                position: 'absolute',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#F26000',
                  border: '2.5px solid #FFFFFF',
                  boxShadow: '0 0 14px #F26000'
                }} />
                <span style={{ fontSize: '8.5px', fontWeight: 900, color: '#FF7A1A', background: 'rgba(15, 23, 42, 0.9)', padding: '1px 5px', borderRadius: '6px', marginTop: '2px' }}>
                  TÚ
                </span>
              </div>

              {/* Distance Markers */}
              <span style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '8.5px', color: '#64748B', fontWeight: 800 }}>5 km</span>
              <span style={{ position: 'absolute', top: '44px', right: '48px', fontSize: '8.5px', color: '#64748B', fontWeight: '800' }}>3 km</span>
              <span style={{ position: 'absolute', top: '72px', right: '76px', fontSize: '8.5px', color: '#64748B', fontWeight: '800' }}>1 km</span>

              {/* Professional Radar Pins */}
              {availablePros.map((pro, index) => {
                const angleDeg = pro.angle !== undefined ? pro.angle : (index * 60 + 30)
                const radRatio = pro.radiusRatio !== undefined ? pro.radiusRatio : (0.35 + (index * 0.15))
                const distPx = radRatio * 100

                const angleRad = (angleDeg * Math.PI) / 180
                const x = Math.cos(angleRad) * distPx
                const y = Math.sin(angleRad) * distPx

                const isSelected = selectedPro?.id === pro.id

                return (
                  <div
                    key={pro.id || index}
                    onClick={(e) => {
                      e.stopPropagation()
                      resetInactivityTimer()
                      setSelectedPro(pro)
                    }}
                    style={{
                      position: 'absolute',
                      transform: `translate(${x}px, ${y}px)`,
                      cursor: 'pointer',
                      zIndex: isSelected ? 30 : 20,
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                    title={`${pro.name || pro.nameEs} • ${pro.category || pro.specEs}`}
                  >
                    <div style={{
                      width: isSelected ? '44px' : '34px',
                      height: isSelected ? '44px' : '34px',
                      borderRadius: '50%',
                      border: isSelected ? '3px solid #F26000' : '2px solid #22C55E',
                      overflow: 'hidden',
                      background: '#1E293B',
                      boxShadow: isSelected ? '0 0 16px rgba(242, 96, 0, 0.9)' : '0 4px 10px rgba(0,0,0,0.5)',
                      animation: isSelected ? 'none' : 'proBlipPulse 2.5s infinite'
                    }}>
                      <img
                        src={pro.photoURL || pro.img || 'https://randomuser.me/api/portraits/men/32.jpg'}
                        alt={pro.name || pro.nameEs}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <span style={{
                      position: 'absolute',
                      bottom: '-11px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '8px',
                      fontWeight: 900,
                      background: isSelected ? '#F26000' : 'rgba(15, 23, 42, 0.95)',
                      color: '#FFFFFF',
                      padding: '1px 4px',
                      borderRadius: '5px',
                      whiteSpace: 'nowrap',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      {pro.dist || `${(1.0 + index * 0.6).toFixed(1)} km`}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Tarjeta de profesional seleccionado */}
            {selectedPro && (
              <div style={{
                marginTop: '10px',
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '14px',
                padding: '10px 12px',
                border: '1.5px solid #F26000',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <img
                    src={selectedPro.photoURL || selectedPro.img || 'https://randomuser.me/api/portraits/men/32.jpg'}
                    alt={selectedPro.name || selectedPro.nameEs}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F26000', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedPro.name || selectedPro.nameEs}
                      </h4>
                      <span style={{ fontSize: '9.5px', color: '#FFD700', fontWeight: 900 }}>⭐ 5.0</span>
                    </div>
                    <p style={{ margin: '1px 0 0', fontSize: '10.5px', color: '#F26000', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      ⚡ {selectedPro.category || selectedPro.specEs || 'Profesional Listo'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => {
                      setIsExpanded(false)
                      navigate('booking', { professional: selectedPro })
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #F26000, #FF7A1A)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '5px 10px',
                      fontSize: '10.5px',
                      fontWeight: 900,
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Contactar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
