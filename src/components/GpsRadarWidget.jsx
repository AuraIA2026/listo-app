import React, { useState, useEffect } from 'react'
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
  const [isOpen, setIsOpen] = useState(true) // Desplegable toggle
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPro, setSelectedPro] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [isScanning, setIsScanning] = useState(false)

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

    // 1. Filter real pros provided in props if available
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

    // 2. If filtered real pros is empty or small, supplement with sample pros tailored to the category
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
        // Fallback default set for 'all'
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
    <div style={{
      margin: '0 16px 20px',
      background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
      borderRadius: '24px',
      padding: '16px',
      boxShadow: '0 12px 32px rgba(15, 23, 42, 0.4)',
      border: '1.5px solid rgba(242, 96, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      color: '#FFFFFF',
      transition: 'all 0.3s ease'
    }}>
      {/* Header Bar - Tap to Toggle Desplegable */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none',
          paddingBottom: isOpen ? '12px' : '0px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F26000, #FF7A1A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            boxShadow: '0 4px 12px rgba(242, 96, 0, 0.4)'
          }}>
            🗺️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                {lang === 'es' ? 'Modo Radar GPS' : 'GPS Radar Mode'}
              </h3>
              <span style={{ fontSize: '9.5px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ADE80', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '2px 7px', borderRadius: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', animation: 'radarPulse 1.5s infinite' }} />
                {availablePros.length} {lang === 'es' ? 'CERCA' : 'NEARBY'}
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>
              {selectedCategory !== 'all' 
                ? `${lang === 'es' ? 'Mostrando solo' : 'Showing only'}: ${CATEGORY_FILTERS.find(c => c.id === selectedCategory)?.labelEs}`
                : (lang === 'es' ? 'Toca para abrir/cerrar mapa radar' : 'Tap to expand/collapse radar map')}
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
              borderRadius: '16px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(242, 96, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '12px', animation: isScanning ? 'spin 1s linear infinite' : 'none' }}>
              {isScanning ? '🔄' : '🎯'}
            </span>
            {isScanning ? (lang === 'es' ? 'Escaneando...' : 'Scanning...') : (lang === 'es' ? 'Escanear' : 'Scan')}
          </button>

          {/* Expand / Collapse Indicator Arrow */}
          <span style={{
            fontSize: '14px',
            color: '#FF9E66',
            fontWeight: 'bold',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            marginLeft: '2px'
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* DESPLEGABLE BODY CONTENT */}
      {isOpen && (
        <div style={{ animation: 'pwaBannerSlideUp 0.3s ease' }}>
          {/* SEARCH INPUT FOR SPECIFIC PROFESSIONAL (EJ. PLOMERO, MECÁNICO, CERRAJERO) */}
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            <input
              type="text"
              placeholder={lang === 'es' ? '🔍 Buscar por especialidad (ej. Plomero, Cerrajero, Mecánico...)' : '🔍 Search by service (e.g. Plumber, Locksmith...)'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 36px 9px 12px',
                borderRadius: '14px',
                border: '1.5px solid rgba(242, 96, 0, 0.4)',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '700',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* CATEGORY CHIP FILTERS */}
          <div style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '10px',
            marginBottom: '12px',
            scrollbarWidth: 'none'
          }}>
            {CATEGORY_FILTERS.map(cat => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id)
                    setSearchQuery('')
                  }}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '5px 11px',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: isSelected ? '900' : '700',
                    border: isSelected ? '1.5px solid #F26000' : '1px solid rgba(255, 255, 255, 0.15)',
                    background: isSelected ? 'linear-gradient(135deg, #F26000, #FF7A1A)' : 'rgba(30, 41, 59, 0.8)',
                    color: isSelected ? '#FFFFFF' : '#CBD5E1',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: isSelected ? '0 4px 10px rgba(242, 96, 0, 0.4)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {lang === 'es' ? cat.labelEs : cat.labelEn}
                </button>
              )
            })}
          </div>

          {/* Dynamic Radar Display Box */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '240px',
            borderRadius: '20px',
            background: 'radial-gradient(circle, #1E293B 0%, #090D16 100%)',
            border: '1px solid rgba(242, 96, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
          }}>
            {/* Concentric Radar Distance Rings */}
            <div style={{ position: 'absolute', width: '210px', height: '210px', borderRadius: '50%', border: '1px dashed rgba(242, 96, 0, 0.25)' }} />
            <div style={{ position: 'absolute', width: '150px', height: '150px', borderRadius: '50%', border: '1px solid rgba(242, 96, 0, 0.35)' }} />
            <div style={{ position: 'absolute', width: '90px', height: '90px', borderRadius: '50%', border: '1px dashed rgba(242, 96, 0, 0.45)' }} />

            {/* Crosshair Axes Lines */}
            <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(242, 96, 0, 0.2)' }} />
            <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'rgba(242, 96, 0, 0.2)' }} />

            {/* Radar Scanner Rotating Beam */}
            <div style={{
              position: 'absolute',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg at 50% 50%, rgba(242, 96, 0, 0.35) 0deg, rgba(242, 96, 0, 0) 60deg, transparent 360deg)',
              animation: 'radarBeamSweep 4s linear infinite',
              pointerEvents: 'none'
            }} />

            <style>{`
              @keyframes radarBeamSweep {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes radarPulse {
                0% { transform: scale(0.95); opacity: 0.6; }
                50% { transform: scale(1.15); opacity: 1; }
                100% { transform: scale(0.95); opacity: 0.6; }
              }
              @keyframes proBlipPulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
                50% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
              }
            `}</style>

            {/* Center User Location Pin */}
            <div style={{
              position: 'absolute',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#F26000',
                border: '3px solid #FFFFFF',
                boxShadow: '0 0 16px #F26000, 0 0 8px rgba(255,255,255,0.8)'
              }} />
              <span style={{ fontSize: '9px', fontWeight: 900, color: '#FF7A1A', background: 'rgba(15, 23, 42, 0.9)', padding: '1px 6px', borderRadius: '8px', marginTop: '2px', border: '1px solid rgba(242,96,0,0.4)' }}>
                TÚ
              </span>
            </div>

            {/* Distance Badges */}
            <span style={{ position: 'absolute', top: '18px', right: '22px', fontSize: '9px', color: '#64748B', fontWeight: 800 }}>5 km</span>
            <span style={{ position: 'absolute', top: '48px', right: '52px', fontSize: '9px', color: '#64748B', fontWeight: '800' }}>3 km</span>
            <span style={{ position: 'absolute', top: '78px', right: '82px', fontSize: '9px', color: '#64748B', fontWeight: '800' }}>1 km</span>

            {/* Nearby Professional Radar Dots/Avatars */}
            {availablePros.map((pro, index) => {
              const angleDeg = pro.angle !== undefined ? pro.angle : (index * 60 + 30)
              const radRatio = pro.radiusRatio !== undefined ? pro.radiusRatio : (0.35 + (index * 0.15))
              const distPx = radRatio * 105

              const angleRad = (angleDeg * Math.PI) / 180
              const x = Math.cos(angleRad) * distPx
              const y = Math.sin(angleRad) * distPx

              const isSelected = selectedPro?.id === pro.id

              return (
                <div
                  key={pro.id || index}
                  onClick={(e) => {
                    e.stopPropagation()
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
                    width: isSelected ? '46px' : '36px',
                    height: isSelected ? '46px' : '36px',
                    borderRadius: '50%',
                    border: isSelected ? '3px solid #F26000' : '2px solid #22C55E',
                    overflow: 'hidden',
                    background: '#1E293B',
                    boxShadow: isSelected ? '0 0 18px rgba(242, 96, 0, 0.9)' : '0 4px 10px rgba(0,0,0,0.5)',
                    animation: isSelected ? 'none' : 'proBlipPulse 2.5s infinite',
                    transition: 'all 0.25s ease'
                  }}>
                    <img
                      src={pro.photoURL || pro.img || 'https://randomuser.me/api/portraits/men/32.jpg'}
                      alt={pro.name || pro.nameEs}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <span style={{
                    position: 'absolute',
                    bottom: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '8.5px',
                    fontWeight: 900,
                    background: isSelected ? '#F26000' : 'rgba(15, 23, 42, 0.95)',
                    color: '#FFFFFF',
                    padding: '1px 5px',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    {pro.dist || `${(1.0 + index * 0.6).toFixed(1)} km`}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Selected Pro Quick Card Overlay */}
          {selectedPro && (
            <div style={{
              marginTop: '12px',
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              padding: '12px 14px',
              border: '1.5px solid #F26000',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              gap: '12px',
              animation: 'pwaBannerSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <img
                  src={selectedPro.photoURL || selectedPro.img || 'https://randomuser.me/api/portraits/men/32.jpg'}
                  alt={selectedPro.name || selectedPro.nameEs}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F26000', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 900, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedPro.name || selectedPro.nameEs}
                    </h4>
                    <span style={{ fontSize: '10px', color: '#FFD700', fontWeight: 900 }}>⭐ 5.0</span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#F26000', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ⚡ {selectedPro.category || selectedPro.specEs || 'Profesional Listo'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>
                    📍 {selectedPro.dist || 'A 1.2 km de ti'} • Respuesta en ~10m
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
                <button
                  onClick={() => navigate('booking', { professional: selectedPro })}
                  style={{
                    background: 'linear-gradient(135deg, #F26000, #FF7A1A)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(242, 96, 0, 0.4)'
                  }}
                >
                  ⚡ Contactar
                </button>
                <button
                  onClick={() => navigate('proProfile', selectedPro)}
                  style={{
                    background: 'none',
                    color: '#CBD5E1',
                    border: '1px solid #475569',
                    borderRadius: '14px',
                    padding: '5px 12px',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  👤 Ver Perfil
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
