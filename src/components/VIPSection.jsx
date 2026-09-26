import React from 'react'
import './VIPSection.css'
import StoryAvatar from './StoryAvatar'
import { CATEGORIES, ALL_SUBCATEGORIES } from '../categories'

import mecanico1  from '../assets/pros/Mecanico1.jpg'
import electrica1 from '../assets/pros/Electricista1.jpg'
import plomero    from '../assets/pros/Plomero.jpg'
import cerrajero1 from '../assets/pros/Cerrajero1.jpg'
import jardinero  from '../assets/pros/Jardinero.jpg'
import logoListo  from '../assets/logo_listo.png'

const demoVipPros = [
  {
    id: 'vip_1',
    nameEs: 'Juan Pérez',
    nameEn: 'Juan Pérez',
    specEs: 'Plomero Máster VIP',
    specEn: 'Master VIP Plumber',
    rating: 5.0,
    reviews: 142,
    location: 'Santo Domingo',
    jobs: 180,
    currentPlan: 'VIP',
    planName: 'VIP',
    badgeTitle: '👑 SOCIO VIP',
    avail: true,
    img: plomero,
    experience: '8 años de exp.',
    guarantee: 'Garantía Listo VIP'
  },
  {
    id: 'vip_2',
    nameEs: 'María González',
    nameEn: 'María González',
    specEs: 'Electricista Certificada VIP',
    specEn: 'Certified VIP Electrician',
    rating: 5.0,
    reviews: 98,
    location: 'Santiago',
    jobs: 125,
    currentPlan: 'VIP',
    planName: 'VIP',
    badgeTitle: '👑 SOCIO VIP',
    avail: true,
    img: electrica1,
    experience: '6 años de exp.',
    guarantee: 'Certificación VIP 24/7'
  },
  {
    id: 'vip_3',
    nameEs: 'Roberto Núñez',
    nameEn: 'Roberto Núñez',
    specEs: 'Cerrajero de Emergencia VIP',
    specEn: 'Emergency VIP Locksmith',
    rating: 5.0,
    reviews: 215,
    location: 'Santo Domingo Este',
    jobs: 260,
    currentPlan: 'VIP',
    planName: 'VIP',
    badgeTitle: '👑 SOCIO VIP',
    avail: true,
    img: cerrajero1,
    experience: '10 años de exp.',
    guarantee: 'Respuesta VIP < 20 min'
  },
  {
    id: 'vip_4',
    nameEs: 'Carlos Herrera',
    nameEn: 'Carlos Herrera',
    specEs: 'Paisajista VIP',
    specEn: 'VIP Landscape Gardener',
    rating: 4.9,
    reviews: 76,
    location: 'La Vega',
    jobs: 90,
    currentPlan: 'VIP',
    planName: 'VIP',
    badgeTitle: '👑 SOCIO VIP',
    avail: true,
    img: jardinero,
    experience: '5 años de exp.',
    guarantee: 'Diseño VIP'
  },
  {
    id: 'vip_5',
    nameEs: 'Luisa Martínez',
    nameEn: 'Luisa Martínez',
    specEs: 'Mecánica Automotriz VIP',
    specEn: 'VIP Auto Mechanic',
    rating: 4.9,
    reviews: 164,
    location: 'Puerto Plata',
    jobs: 210,
    currentPlan: 'VIP',
    planName: 'VIP',
    badgeTitle: '👑 SOCIO VIP',
    avail: true,
    img: mecanico1,
    experience: '9 años de exp.',
    guarantee: 'Diagnóstico VIP'
  }
]

const innerPhotos = [
  { img: plomero, titleEs: 'Juan Pérez — Plomero Máster VIP', titleEn: 'Juan Pérez — Master VIP Plumber', badge: '💧 Plomería VIP 24/7' },
  { img: electrica1, titleEs: 'María González — Electricista VIP', titleEn: 'María González — VIP Electrician', badge: '⚡ Electricidad VIP' },
  { img: mecanico1, titleEs: 'Luisa Martínez — Mecánica VIP', titleEn: 'Luisa Martínez — VIP Auto Mechanic', badge: '🔧 Mecánica VIP' },
  { img: cerrajero1, titleEs: 'Roberto Núñez — Cerrajero VIP', titleEn: 'Roberto Núñez — VIP Locksmith', badge: '🔑 Cerrajería VIP' }
]

export const isProVip = (pro) => {
  if (!pro) return false;
  const rawPlan = String(
    pro.currentPlan || 
    pro.planName || 
    pro.plan || 
    pro.planId || 
    pro.planType ||
    pro.tipoPlan ||
    pro.subscription?.planName ||
    pro.subscription?.plan || 
    pro.membership ||
    pro.verificacion?.plan ||
    ''
  ).toLowerCase().trim();

  return rawPlan.includes('vip') || rawPlan.includes('ilimitado') || rawPlan.includes('elite');
};

export const getProPlanBadge = (pro, lang = 'es') => {
  const rawPlan = String(
    pro.planName || 
    pro.currentPlan || 
    pro.plan || 
    pro.planId || 
    pro.planType ||
    pro.tipoPlan ||
    pro.subscription?.planName ||
    pro.subscription?.plan || 
    pro.membership ||
    pro.verificacion?.plan ||
    ''
  ).toLowerCase().trim();

  let text = '';
  let badgeClass = 'plan-badge-basico';

  if (rawPlan.includes('vip') || rawPlan.includes('ilimitado') || rawPlan.includes('elite')) {
    text = lang === 'es' ? '👑 SOCIO VIP' : '👑 VIP PARTNER';
    badgeClass = 'plan-badge-vip';
  } else if (rawPlan.includes('platinum') || rawPlan.includes('platino')) {
    text = lang === 'es' ? '💎 SOCIO PLATINUM' : '💎 PLATINUM PARTNER';
    badgeClass = 'plan-badge-platinum';
  } else if (rawPlan.includes('gold') || rawPlan.includes('oro')) {
    text = lang === 'es' ? '⭐ SOCIO GOLD' : '⭐ GOLD PARTNER';
    badgeClass = 'plan-badge-gold';
  } else if (rawPlan.includes('standard') || rawPlan.includes('estandar') || rawPlan.includes('estándar')) {
    text = lang === 'es' ? '🔹 SOCIO VERIFICADO' : '🔹 VERIFIED PARTNER';
    badgeClass = 'plan-badge-standard';
  } else if (rawPlan.includes('basico') || rawPlan.includes('básico') || rawPlan.includes('basic')) {
    text = lang === 'es' ? '⚪ SOCIO REGISTRADO' : '⚪ REGISTERED PARTNER';
    badgeClass = 'plan-badge-basico';
  } else if (rawPlan.length > 0) {
    text = `🔹 SOCIO ${rawPlan.toUpperCase()}`;
    badgeClass = 'plan-badge-standard';
  } else {
    // Si no tiene plan explícito en Firestore, determinar dinámicamente según sus contratos reales
    const contracts = Number(pro.contracts || 0);
    if (contracts >= 20) {
      text = lang === 'es' ? '💎 SOCIO PLATINUM' : '💎 PLATINUM PARTNER';
      badgeClass = 'plan-badge-platinum';
    } else if (contracts > 0) {
      text = lang === 'es' ? '🔹 SOCIO VERIFICADO' : '🔹 VERIFIED PARTNER';
      badgeClass = 'plan-badge-standard';
    } else {
      text = lang === 'es' ? '⚪ PLAN BÁSICO' : '⚪ BASIC PLAN';
      badgeClass = 'plan-badge-basico';
    }
  }

  return { text, badgeClass };
}

function VIPProCard({ pro, lang, navigate, getProStoryData, onOpenStory }) {
  const cardRef = React.useRef(null)
  const [isInView, setIsInView] = React.useState(false)
  const [animKey, setAnimKey] = React.useState(0)

  const storyData = getProStoryData ? getProStoryData(pro) : null
  const hasStory = Boolean(storyData && storyData.stories && storyData.stories.length > 0)

  React.useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          setAnimKey((prev) => prev + 1)
        } else {
          setIsInView(false)
        }
      },
      {
        threshold: 0.35
      }
    )

    const currentEl = cardRef.current
    if (currentEl) {
      observer.observe(currentEl)
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl)
      }
    }
  }, [])

  const numReviews = Number(pro.reviews !== undefined ? pro.reviews : (pro.reviewsCount || 0))
  const hasReviews = numReviews > 0
  const effectiveRating = hasReviews ? Number(pro.rating || 0) : 0.0
  const isFiveStar = hasReviews && effectiveRating >= 4.9

  return (
    <div 
      ref={cardRef}
      className={`vip-card-hero ${isInView ? 'is-in-view' : ''}`}
      onClick={() => navigate('booking', { professional: pro })}
    >
      {/* CONTENEDOR FOTO GRANDE */}
      <div className="vip-photo-wrapper">
        <img 
          src={pro.img || pro.photoURL} 
          alt={pro.nameEs || pro.name} 
          className="vip-photo-large"
          style={hasStory ? { border: '3px solid transparent', outline: '3px solid #F26000' } : {}}
        />
        <div className="vip-photo-gradient" />

        {/* BADGES Y LOGO LISTO EN LA PARTE SUPERIOR DE LA FOTO */}
        <div className="vip-top-badges">
          {(() => {
            const planInfo = getProPlanBadge(pro, lang);
            return (
              <span className={`vip-tag-platinum ${planInfo.badgeClass}`} title={planInfo.text}>
                {planInfo.text}
              </span>
            );
          })()}
          <img 
            src={logoListo} 
            alt="Listo Patrón Logo" 
            style={{ 
              height: '28px', 
              width: 'auto', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' 
            }} 
          />
        </div>

        {/* SI TIENE HISTORIA EN VIVO 24H: MOSTRAR EL CÍRCULO CON ANILLO DE LA HISTORIA SOBRE LA FOTO (ESTILO INSTAGRAM) */}
        {hasStory && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -45%)',
              zIndex: 10,
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.65))'
            }}
          >
            <StoryAvatar 
              pro={pro}
              src={pro.img || pro.photoURL}
              alt={pro.nameEs || pro.name}
              size={84}
              storyData={storyData}
              onOpenStory={onOpenStory}
              fallbackAvatar={(pro.nameEs || pro.name || 'P').charAt(0)}
            />
          </div>
        )}

        {/* DISPONIBLE Y BOTÓN "VER PERFIL" SOBRE LA FOTO */}
        <div style={{ position: 'absolute', top: '46px', right: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', zIndex: 4 }}>
          <span className="vip-tag-online">
            <span className="vip-online-pulse" />
            {lang === 'es' ? 'DISPONIBLE' : 'AVAILABLE'}
          </span>
          <button 
            className="vip-photo-view-profile-btn"
            style={{ position: 'static' }}
            onClick={(e) => {
              e.stopPropagation();
              navigate('proProfile', pro);
            }}
            title={lang === 'es' ? 'Ver perfil completo' : 'View full profile'}
          >
            👁️ {lang === 'es' ? 'Ver perfil' : 'View profile'}
          </button>
        </div>

        {/* DETALLES ÉPICOS AL PIE DE LA FOTO */}
        <div className="vip-photo-bottom-info">
          <div className="vip-name-spec-wrap">
            <p className={`vip-pro-name ${isInView ? 'epic-name-anim' : ''}`}>
              {pro.nameEs || pro.name}
              {isFiveStar && (
                <span className={`vip-epic-crown-icon ${isInView ? 'crown-active' : ''}`} title="Profesional 5 Estrellas">👑</span>
              )}
            </p>
            <p className={`vip-pro-spec ${isInView ? 'epic-spec-anim' : ''}`}>
              {lang === 'es' ? pro.specEs : (pro.specEn || pro.specialty)}
            </p>
          </div>

          <div className="vip-rating-row">
            <div className={`vip-stars-badge ${isFiveStar ? 'epic-5star-badge' : ''}`}>
              {hasReviews ? (
                isInView && (
                  <div key={animKey} className="vip-animated-stars">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <span 
                        key={starIdx} 
                        className="vip-star-pop" 
                        style={{ animationDelay: `${starIdx * 0.10}s` }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )
              ) : (
                <div style={{ color: '#94A3B8', fontSize: '12px', display: 'flex', gap: '2px', letterSpacing: '-1px' }}>
                  ★ ★ ★ ★ ★
                </div>
              )}
              <span className="vip-rating-score">{effectiveRating.toFixed(1)}</span>
            </div>
            <span className="vip-reviews-count">
              ({numReviews} {lang === 'es' ? 'reseñas' : 'reviews'})
            </span>
          </div>
        </div>
      </div>

      {/* CUERPO Y ACCIONES DE LA TARJETA */}
      <div className="vip-card-body">
        <div className="vip-highlights-row">
          <span className="vip-pill">📍 {(() => {
            const candidates = [
              pro.sector,
              pro.municipio || pro.ciudad || pro.city,
              pro.provincia,
              pro.direccion,
              pro.location,
              pro.verificacion?.sector,
              pro.verificacion?.municipio,
              pro.verificacion?.provincia,
              pro.verificacion?.direccion
            ].filter(Boolean);
            const clean = candidates.filter(str => {
              const s = String(str).trim().toLowerCase();
              return s !== 'rd' && s !== 'rep. dominicana' && s !== 'república dominicana' && s !== 'rep dominicana';
            });
            return clean.length > 0 ? clean.slice(0, 2).join(', ') : 'Santo Domingo, D.N.';
          })()}</span>
          {pro.experience && !['nuevo', 'verificado'].includes(String(pro.experience).trim().toLowerCase()) && (
            <span className="vip-pill">🛠️ {pro.experience}</span>
          )}
          {pro.guarantee && <span className="vip-pill" style={{ background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }}>🛡️ {pro.guarantee}</span>}
        </div>

        <div className="vip-actions-row">
          <button 
            className="vip-btn-profile-secondary"
            onClick={(e) => {
              e.stopPropagation()
              navigate('proProfile', pro)
            }}
          >
            👤 {lang === 'es' ? 'Ver Perfil' : 'Profile'}
          </button>
          <button 
            className="vip-btn-book"
            onClick={(e) => {
              e.stopPropagation()
              navigate('booking', { professional: pro })
            }}
          >
            ⚡ {lang === 'es' ? 'Contratar' : 'Hire'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VIPSection({ 
  realVipPros = [], 
  lang = 'es', 
  navigate,
  sectionTitle,
  sectionSub,
  showSeeAll = true,
  strictVipOnly = false,
  getProStoryData,
  onOpenStory
}) {
  const filterVipOnly = strictVipOnly || Boolean(sectionSub);

  // Filtrar la lista de profesionales reales según el contexto (Inicio vs Buscar VIP)
  const realFiltered = (realVipPros || []).filter(pro => {
    if (filterVipOnly && !isProVip(pro)) return false
    const nRev = Number(pro.reviews !== undefined ? pro.reviews : (pro.reviewsCount || 0))
    const eRate = nRev > 0 ? Number(pro.rating || 0) : 0.0
    return nRev > 0 && eRate >= 4.9
  })

  const rawProsList = realFiltered.length > 0 ? realFiltered : demoVipPros
  const displayPros = rawProsList.filter(pro => {
    if (String(pro.id || '').startsWith('vip_')) return true
    if (filterVipOnly && !isProVip(pro)) return false
    const nRev = Number(pro.reviews !== undefined ? pro.reviews : (pro.reviewsCount || 0))
    const eRate = nRev > 0 ? Number(pro.rating || 0) : 0.0
    return nRev > 0 && eRate >= 4.9
  })
  const containerRef = React.useRef(null)
  const isInteracting = React.useRef(false)
  const [activeInnerSlide, setActiveInnerSlide] = React.useState(0)
  const [isHeroPlaying, setIsHeroPlaying] = React.useState(true)

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
    }, 7000)

    const innerTimer = setInterval(() => {
      if (isHeroPlaying) {
        setActiveInnerSlide((prev) => (prev + 1) % innerPhotos.length)
      }
    }, 3200)

    return () => {
      clearInterval(timer)
      clearInterval(innerTimer)
    }
  }, [isHeroPlaying])

  return (
    <section className="vip-hero-section">
      <div className="vip-sec-header" style={{ flexDirection: sectionSub ? 'column' : 'row', alignItems: sectionSub ? 'flex-start' : 'center', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div className="vip-sec-title-wrap">
            <h2 className="vip-sec-title">
              {sectionTitle || (lang === 'es' ? '🌟 Profesionales Destacados' : '🌟 Featured Professionals')}
            </h2>
            <span className="vip-crown-badge">
              {lang === 'es' ? 'VERIFICADOS' : 'VERIFIED'}
            </span>
          </div>
          {showSeeAll && (
            <button 
              className="hp-see-all" 
              onClick={() => navigate('search')}
              style={{ cursor: 'pointer' }}
            >
              {lang === 'es' ? 'Ver todos' : 'See all'} ›
            </button>
          )}
        </div>
        {sectionSub && (
          <p style={{ margin: '4px 0 2px', fontSize: '13px', fontWeight: '800', color: '#F26000', letterSpacing: '-0.1px' }}>
            {sectionSub}
          </p>
        )}
      </div>

      <div 
        ref={containerRef}
        className="vip-cards-container"
        onTouchStart={() => { isInteracting.current = true }}
        onTouchEnd={() => { setTimeout(() => { isInteracting.current = false }, 2500) }}
        onMouseEnter={() => { isInteracting.current = true }}
        onMouseLeave={() => { isInteracting.current = false }}
      >
        {/* TARJETA 1: HERO AZUL ESTILO AMAZON PRIME — PROFESIONAL MÁS POPULAR DEL MES */}
        <div 
          className="vip-card-hero amz-blue-hero-card"
          onClick={() => {
            const currentItem = innerPhotos[activeInnerSlide];
            navigate('search', { state: { query: currentItem.badge } });
          }}
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
            minHeight: '360px'
          }}
        >
          {/* Shimmer Effect */}
          <div className="amz-shimmer-effect" />

          {/* Top Tag & Logo Listo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #FFD700, #FFA500)', 
              color: '#1A1A2E', 
              padding: '4px 10px', 
              borderRadius: '20px', 
              fontSize: '10px', 
              fontWeight: '900', 
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🏆 MÁS POPULAR DEL MES
            </span>
            <img 
              src={logoListo} 
              alt="Listo Patrón Logo" 
              style={{ 
                height: '28px', 
                width: 'auto', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' 
              }} 
            />
          </div>

          {/* Banner Oferta Especial Amazon Prime Style */}
          <div style={{
            margin: '8px 0 0',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '10px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
            backdropFilter: 'blur(4px)'
          }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#FFD700' }}>
              ⚡ SERVICIO DESTACADO
            </span>
            <span style={{ fontSize: '10px', fontWeight: '900', color: '#FFFFFF', background: '#F26000', padding: '2px 6px', borderRadius: '6px' }}>
              ¡GARANTIZADO!
            </span>
          </div>

          {/* Carrusel Deslizante Interno de Fotos del Profesional Popular */}
          <div className="amz-inner-carousel-wrapper" style={{ zIndex: 2 }}>
            <div 
              className="amz-inner-carousel-track"
              style={{ transform: `translateX(-${activeInnerSlide * 100}%)` }}
            >
              {innerPhotos.map((item, idx) => (
                <div key={idx} className="amz-inner-slide">
                  <img src={item.img} alt={item.titleEs} className="amz-inner-slide-img" />
                  <div className="amz-inner-slide-overlay">
                    <span className="amz-inner-slide-badge">{item.badge}</span>
                    <span className="amz-inner-slide-title">{lang === 'es' ? item.titleEs : item.titleEn}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots de navegación del carrusel interno */}
            <div className="amz-inner-dots">
              {innerPhotos.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`amz-inner-dot ${idx === activeInnerSlide ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveInnerSlide(idx)
                  }}
                />
              ))}
            </div>
          </div>

          {/* Typography del Profesional del Mes */}
          <div style={{ margin: '2px 0 8px', zIndex: 2 }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', margin: 0, lineHeight: '1.15', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {lang === 'es' ? 'Profesionales VIP' : 'VIP Professionals'}
            </h3>
            <p style={{ fontSize: '11px', color: '#B3D7FF', fontWeight: '700', margin: '4px 0 0', lineHeight: '1.3' }}>
              ⭐ 5.0 (200+ contrataciones) • {lang === 'es' ? 'Garantía de servicio 100%' : '100% Guaranteed'}
            </p>
          </div>

          {/* Bottom Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 2, marginTop: 'auto' }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate('search');
              }}
              style={{
                background: 'linear-gradient(135deg, #FF7A1A, #F26000)',
                color: 'white',
                border: 'none',
                borderRadius: '22px',
                padding: '10px 18px',
                fontSize: '12px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(242, 96, 0, 0.4)',
                width: '100%'
              }}
            >
              ⚡ {lang === 'es' ? 'Contratar Ahora ›' : 'Hire Now ›'}
            </button>
          </div>
        </div>

        {displayPros.map((pro, idx) => (
          <VIPProCard 
            key={pro.id || idx}
            pro={pro}
            lang={lang}
            navigate={navigate}
            getProStoryData={getProStoryData}
            onOpenStory={onOpenStory}
          />
        ))}
      </div>
    </section>
  )
}
