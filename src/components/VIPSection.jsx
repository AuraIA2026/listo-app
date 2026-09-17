import React from 'react'
import './VIPSection.css'

import mecanico1  from '../assets/pros/Mecanico1.jpg'
import electrica1 from '../assets/pros/Electricista1.jpg'
import plomero    from '../assets/pros/Plomero.jpg'
import cerrajero1 from '../assets/pros/Cerrajero1.jpg'
import jardinero  from '../assets/pros/Jardinero.jpg'

const demoVipPros = [
  {
    id: 'vip_1',
    nameEs: 'Juan Pérez',
    nameEn: 'Juan Pérez',
    specEs: 'Plomero Máster',
    specEn: 'Master Plumber',
    rating: 5.0,
    reviews: 142,
    location: 'Santo Domingo',
    jobs: 180,
    badgeTitle: '👑 SOCIO PLATINUM',
    avail: true,
    img: plomero,
    experience: '8 años de exp.',
    guarantee: 'Garantía Listo'
  },
  {
    id: 'vip_2',
    nameEs: 'María González',
    nameEn: 'María González',
    specEs: 'Electricista Certificada',
    specEn: 'Certified Electrician',
    rating: 4.9,
    reviews: 98,
    location: 'Santiago',
    jobs: 125,
    badgeTitle: '👑 SOCIO VIP',
    avail: true,
    img: electrica1,
    experience: '6 años de exp.',
    guarantee: 'Certificación 24/7'
  },
  {
    id: 'vip_3',
    nameEs: 'Roberto Núñez',
    nameEn: 'Roberto Núñez',
    specEs: 'Cerrajero de Emergencia',
    specEn: 'Emergency Locksmith',
    rating: 5.0,
    reviews: 215,
    location: 'Santo Domingo Este',
    jobs: 260,
    badgeTitle: '👑 SOCIO PLATINUM',
    avail: true,
    img: cerrajero1,
    experience: '10 años de exp.',
    guarantee: 'Respuesta < 20 min'
  },
  {
    id: 'vip_4',
    nameEs: 'Carlos Herrera',
    nameEn: 'Carlos Herrera',
    specEs: 'Paisajista y Jardinero',
    specEn: 'Landscape Gardener',
    rating: 4.8,
    reviews: 76,
    location: 'La Vega',
    jobs: 90,
    badgeTitle: '👑 SOCIO VIP',
    avail: true,
    img: jardinero,
    experience: '5 años de exp.',
    guarantee: 'Diseño Personalizado'
  },
  {
    id: 'vip_5',
    nameEs: 'Luisa Martínez',
    nameEn: 'Luisa Martínez',
    specEs: 'Mecánica Automotriz',
    specEn: 'Auto Mechanic',
    rating: 4.9,
    reviews: 164,
    location: 'Puerto Plata',
    jobs: 210,
    badgeTitle: '👑 SOCIO PLATINUM',
    avail: true,
    img: mecanico1,
    experience: '9 años de exp.',
    guarantee: 'Diagnóstico Computarizado'
  }
]

export default function VIPSection({ realVipPros = [], lang = 'es', navigate }) {
  const displayPros = realVipPros.length > 0 ? realVipPros : demoVipPros
  const containerRef = React.useRef(null)
  const isInteracting = React.useRef(false)

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (containerRef.current && !isInteracting.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
        const maxScroll = scrollWidth - clientWidth
        if (scrollLeft + 15 >= maxScroll) {
          containerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          containerRef.current.scrollBy({ left: 230, behavior: 'smooth' })
        }
      }
    }, 3200)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="vip-hero-section">
      <div className="vip-sec-header">
        <div className="vip-sec-title-wrap">
          <h2 className="vip-sec-title">
            🌟 {lang === 'es' ? 'Profesionales VIP' : 'VIP Professionals'}
          </h2>
          <span className="vip-crown-badge">
            {lang === 'es' ? 'VERIFICADOS' : 'VERIFIED'}
          </span>
        </div>
        <button 
          className="hp-see-all" 
          onClick={() => navigate('search')}
          style={{ cursor: 'pointer' }}
        >
          {lang === 'es' ? 'Ver todos' : 'See all'} ›
        </button>
      </div>

      <div 
        ref={containerRef}
        className="vip-cards-container"
        onTouchStart={() => { isInteracting.current = true }}
        onTouchEnd={() => { setTimeout(() => { isInteracting.current = false }, 2500) }}
        onMouseEnter={() => { isInteracting.current = true }}
        onMouseLeave={() => { isInteracting.current = false }}
      >
        {/* TARJETA 1: HERO AZUL ESTILO AMAZON PRIME DE TU VIDEO CON FOTOS DENTRO */}
        <div 
          className="vip-card-hero amz-blue-hero-card"
          onClick={() => navigate('search')}
          style={{
            background: 'linear-gradient(160deg, #0073EC 0%, #0045B5 60%, #002B7A 100%)',
            color: 'white',
            borderColor: '#0052C2',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '18px 16px',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '350px'
          }}
        >
          {/* Shimmer Effect */}
          <div className="amz-shimmer-effect" />

          {/* Top Tag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span style={{ background: 'rgba(255,255,255,0.25)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px' }}>
              👑 LISTO PATRÓN
            </span>
            <span style={{ fontSize: '16px' }}>✨</span>
          </div>

          {/* Rejilla de fotos de profesionales dentro de la tarjeta azul */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '6px', 
            margin: '10px 0', 
            zIndex: 2,
            background: 'rgba(255,255,255,0.12)',
            padding: '6px',
            borderRadius: '16px',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <img src={plomero} alt="Plomero" style={{ width: '100%', height: '65px', objectFit: 'cover', borderRadius: '10px' }} />
            <img src={electrica1} alt="Electricista" style={{ width: '100%', height: '65px', objectFit: 'cover', borderRadius: '10px' }} />
            <img src={mecanico1} alt="Mecánico" style={{ width: '100%', height: '65px', objectFit: 'cover', borderRadius: '10px' }} />
            <img src={cerrajero1} alt="Cerrajero" style={{ width: '100%', height: '65px', objectFit: 'cover', borderRadius: '10px' }} />
          </div>

          {/* Typography */}
          <div style={{ margin: '2px 0 10px', zIndex: 2 }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', margin: 0, lineHeight: '1.15', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {lang === 'es' ? 'Bienvenido a Listo Patrón' : 'Welcome to Listo Patrón'}
            </h3>
            <p style={{ fontSize: '11px', color: '#B3D7FF', fontWeight: '700', margin: '4px 0 0', lineHeight: '1.3' }}>
              {lang === 'es' ? 'Profesionales VIP verificados a tu disposición' : 'Verified VIP professionals available'}
            </p>
          </div>

          {/* Bottom Controls Overlay (Pause/Sound icons like Amazon video screenshot) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2, marginTop: 'auto' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', background: 'rgba(0,0,0,0.35)', padding: '4px 8px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
              <span style={{ fontSize: '10px', color: 'white' }}>⏸️</span>
              <span style={{ fontSize: '10px', color: 'white' }}>🔊</span>
              <span style={{ fontSize: '9px', color: '#E0F2FE', fontWeight: '900', marginLeft: '2px' }}>VERIFICADO</span>
            </div>

            <button 
              style={{
                background: '#FF7A1A',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '11px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}
            >
              {lang === 'es' ? 'Explorar ›' : 'Explore ›'}
            </button>
          </div>
        </div>


        {displayPros.map((pro, idx) => (
          <div 
            key={pro.id || idx} 
            className="vip-card-hero"
            onClick={() => navigate('booking', { professional: pro })}
          >

            {/* CONTENEDOR FOTO GRANDE */}
            <div className="vip-photo-wrapper">
              <img 
                src={pro.img || pro.photoURL} 
                alt={pro.nameEs || pro.name} 
                className="vip-photo-large"
              />
              <div className="vip-photo-gradient" />

              {/* BADGES EN LA PARTE SUPERIOR DE LA FOTO */}
              <div className="vip-top-badges">
                <span className="vip-tag-platinum">
                  {pro.badgeTitle || (
                    (() => {
                      const planStr = (pro.currentPlan || pro.plan || '').toLowerCase();
                      if (planStr.includes('platinum') || planStr.includes('platino')) return '💎 SOCIO PLATINUM';
                      if (planStr.includes('gold')) return '⭐ SOCIO GOLD';
                      return '👑 SOCIO VIP';
                    })()
                  )}
                </span>
                <span className="vip-tag-online">
                  <span className="vip-online-pulse" />
                  {lang === 'es' ? 'DISPONIBLE' : 'AVAILABLE'}
                </span>
              </div>

              {/* DETALLES AL PIE DE LA FOTO */}
              <div className="vip-photo-bottom-info">
                <p className="vip-pro-name">{pro.nameEs || pro.name}</p>
                <p className="vip-pro-spec">{lang === 'es' ? pro.specEs : (pro.specEn || pro.specialty)}</p>

                <div className="vip-rating-row">
                  <div className="vip-stars-badge">
                    <span style={{ color: '#F26000' }}>★</span>
                    <span>{Number(pro.rating || 5.0).toFixed(1)}</span>
                  </div>
                  <span className="vip-reviews-count">
                    ({pro.reviews || 50} {lang === 'es' ? 'reseñas' : 'reviews'})
                  </span>
                </div>
              </div>
            </div>

            {/* CUERPO Y ACCIONES DE LA TARJETA */}
            <div className="vip-card-body">
              <div className="vip-highlights-row">
                <span className="vip-pill">📍 {pro.location || 'Rep. Dominicana'}</span>
                <span className="vip-pill">🛠️ {pro.experience || 'Verificado'}</span>
                {pro.guarantee && <span className="vip-pill" style={{ background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }}>🛡️ {pro.guarantee}</span>}
              </div>

              <div className="vip-actions-row">
                <button 
                  className="vip-btn-book"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('booking', { professional: pro })
                  }}
                >
                  ⚡ {lang === 'es' ? 'Contratar Ahora' : 'Hire Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
