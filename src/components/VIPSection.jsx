import React from 'react'
import './VIPSection.css'
import StoryAvatar from './StoryAvatar'
import { getProPlanTheme } from '../planTheme'
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
    experience: '9 años de exp.',
    guarantee: 'Garantía Listo'
  }
]

const innerPhotos = [
  { video: '/assets/delivery_rider_video.mp4', titleEs: 'Pedidos Listo — Entrega de Paquetes & Envíos', titleEn: 'Pedidos Listo — Package & Express Delivery', badge: '📦 ENTREGA EN MANO 24/7' },
  { video: '/assets/delivery_worker_scooter.mp4', titleEs: 'Pedidos Listo — Delivery en Moto a Toda Velocidad', titleEn: 'Pedidos Listo — High Speed Scooter Delivery', badge: '🛵 DELIVERIES EN MOTO 24/7' },
  { titleEs: 'Pedidos Listo — Mandados, Compras & Servicios', titleEn: 'Pedidos Listo — Errands, Shopping & Services', badge: '⚡ TODO EN UN SOLO LUGAR' }
]

export const getProTier = (pro) => {
  if (!pro) return 'standard';
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

  if (rawPlan.includes('vip') || rawPlan.includes('ilimitado') || rawPlan.includes('elite')) {
    return 'vip';
  }
  if (rawPlan.includes('platinum') || rawPlan.includes('platino')) {
    return 'platinum';
  }
  if (rawPlan.includes('gold') || rawPlan.includes('oro')) {
    return 'gold';
  }
  if (rawPlan.includes('standard') || rawPlan.includes('estandar') || rawPlan.includes('estándar')) {
    return 'standard';
  }
  if (rawPlan.includes('basico') || rawPlan.includes('básico') || rawPlan.includes('basic')) {
    return 'basico';
  }

  return 'standard';
};

export const isProVip = (pro) => {
  return getProTier(pro) === 'vip';
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
    text = lang === 'es' ? '⭐ PROFESIONAL DESTACADO' : '⭐ FEATURED PRO';
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
  const effectiveRating = hasReviews ? Number(pro.rating || 0) : 5.0
  const isFiveStar = effectiveRating >= 4.8 || !hasReviews

  return (
    <div 
      ref={cardRef}
      className={`vip-card-hero ${isInView ? 'is-in-view' : ''}`}
      onClick={() => navigate('booking', { professional: pro })}
    >
      {/* CONTENEDOR FOTO GRANDE DEL PROFESIONAL */}
      <div className="vip-photo-wrapper">
        <div className="listo-brand-watermark" style={{ top: '12px', right: '12px' }}>
          <img src={logoListo} alt="Pedidos Listo" className="listo-brand-watermark-img" />
        </div>

        <img 
          src={pro.img || pro.photoURL} 
          alt={pro.nameEs || pro.name} 
          className="vip-photo-large"
        />
        <div className="vip-photo-gradient" />

        {/* BADGES EN LA PARTE SUPERIOR DE LA FOTO */}
        <div className="vip-top-badges">
          {(() => {
            const planInfo = getProPlanBadge(pro, lang);
            return (
              <span className={`vip-tag-platinum ${planInfo.badgeClass}`} title={planInfo.text}>
                {planInfo.text}
              </span>
            );
          })()}
        </div>

        {/* SI TIENE HISTORIA EN VIVO 24H: MOSTRAR EL CÍRCULO CON ANILLO DE LA HISTORIA SOBRE LA FOTO */}
        {hasStory && (() => {
          const planTheme = getProPlanTheme(pro.currentPlan || pro.planName || pro.plan || pro.planId, pro.rating);
          return (
            <>
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at center, ${planTheme.color}22 0%, rgba(15, 23, 42, 0.25) 70%, rgba(0,0,0,0.5) 100%)`,
                  zIndex: 4,
                  pointerEvents: 'none'
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -48%)',
                  zIndex: 10,
                  filter: `drop-shadow(0 4px 14px ${planTheme.color}55)`
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenStory && onOpenStory(storyData.firstIndex)
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
            </>
          );
        })()}

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
              <span className="vip-rating-score">{effectiveRating.toFixed(1)}</span>
            </div>
            <span className="vip-reviews-count">
              ({numReviews > 0 ? numReviews : 120} {lang === 'es' ? 'reseñas' : 'reviews'})
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
  strictVipOnly = true,
  getProStoryData,
  onOpenStory
}) {
  const filterVipOnly = true;

  const realFiltered = (realVipPros || []).filter(pro => {
    if (!isProVip(pro)) return false
    const nRev = Number(pro.reviews !== undefined ? pro.reviews : (pro.reviewsCount || 0))
    const eRate = nRev > 0 ? Number(pro.rating || 0) : 0.0
    return nRev > 0 && eRate >= 4.9
  })

  const rawProsList = realFiltered.length > 0 ? realFiltered : demoVipPros
  const displayPros = rawProsList.filter(pro => {
    if (String(pro.id || '').startsWith('vip_')) return true
    if (!isProVip(pro)) return false
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
    }, 8000)

    const innerTimer = setInterval(() => {
      if (isHeroPlaying) {
        setActiveInnerSlide((prev) => (prev + 1) % innerPhotos.length)
      }
    }, 6000) // Duración de al menos 6 segundos antes de cambiar el slide

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
              {lang === 'es' ? 'DESTACADOS' : 'FEATURED'}
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
        {/* TARJETA 1: TARJETA PROMO EXCLUSIVA DE PEDIDOS LISTO (COLOR MAMEY CON VIDEOS Y BOTÓN DIRECTO) */}
        <div 
          className="vip-card-hero amz-blue-hero-card"
          onClick={() => {
            navigate('mandame');
          }}
          style={{
            background: 'linear-gradient(160deg, #FF7A1A 0%, #F26000 60%, #C24D00 100%)',
            color: 'white',
            borderColor: '#FF8533',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            padding: '18px 16px',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '360px',
            boxShadow: '0 10px 30px rgba(242, 96, 0, 0.35)'
          }}
        >
          {/* Shimmer Effect */}
          <div className="amz-shimmer-effect" />

          {/* Top Tag & Logo Listo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span style={{ 
              background: '#1A1A2E', 
              color: '#FFD700', 
              padding: '4px 10px', 
              borderRadius: '20px', 
              fontSize: '10px', 
              fontWeight: '900', 
              letterSpacing: '0.5px',
              border: '1px solid #FFD700',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              📦 PEDIDOS LISTO
            </span>
            <img 
              src={logoListo} 
              alt="Pedidos Listo Logo" 
              style={{ 
                height: '28px', 
                width: 'auto', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' 
              }} 
            />
          </div>

          {/* Banner Oferta Especial Pedidos Listo */}
          <div style={{
            margin: '8px 0 0',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: '10px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            zIndex: 2,
            backdropFilter: 'blur(4px)'
          }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#FFFFFF' }}>
              ⚡ ENVIOS & DELIVERIES
            </span>
            <span style={{ fontSize: '10px', fontWeight: '900', color: '#1A1A2E', background: '#FFD700', padding: '2px 6px', borderRadius: '6px' }}>
              ENTREGA HOY
            </span>
          </div>

          {/* Carrusel Deslizante Interno de Fotos y Video exclusivo de Pedidos Listo */}
          <div className="amz-inner-carousel-wrapper" style={{ zIndex: 2 }}>
            <div 
              className="amz-inner-carousel-track"
              style={{ transform: `translateX(-${activeInnerSlide * 100}%)` }}
            >
              {innerPhotos.map((item, idx) => (
                <div key={idx} className="amz-inner-slide">
                  {item.video ? (
                    <video 
                      src={item.video} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="amz-inner-slide-img" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <img src={item.img} alt={item.titleEs} className="amz-inner-slide-img" />
                  )}
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

          {/* Typography exclusivo de Pedidos Listo */}
          <div style={{ margin: '2px 0 8px', zIndex: 2 }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', margin: 0, lineHeight: '1.15', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              Pedidos Listo
            </h3>
            <p style={{ fontSize: '11px', color: '#FFF8F2', fontWeight: '700', margin: '4px 0 0', lineHeight: '1.3' }}>
              ⭐ 5.0 • {lang === 'es' ? 'Entregas express y servicios al instante' : 'Express deliveries & instant services'}
            </p>
          </div>

          {/* Bottom Action Button de Pedidos Listo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 2, marginTop: 'auto' }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate('mandame');
              }}
              style={{
                background: '#FFFFFF',
                color: '#F26000',
                border: 'none',
                borderRadius: '22px',
                padding: '10px 18px',
                fontSize: '12px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                width: '100%',
                transition: 'transform 0.15s ease'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ⚡ {lang === 'es' ? 'Ir a Pedidos Listo ›' : 'Go to Pedidos Listo ›'}
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

