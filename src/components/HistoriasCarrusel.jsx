import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { db } from '../firebase'
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
import HistoriasViewerModal from './HistoriasViewerModal'
import SubirHistoriaModal from './SubirHistoriaModal'
import { getProPlanTheme } from '../planTheme'
import './Historias.css'

const PROMO_SLIDES = [
  {
    badge: '🍔 RESTAURANTES',
    title: 'Pizzas, Yaroas & Comida',
    sub: 'Pide tus platos favoritos de Santiago directos a tu mesa',
    tag: '⚡ 25 Min',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80'
  },
  {
    badge: '🛵 MÁNDAME 24/7',
    title: 'Motores & Envíos Express',
    sub: 'Envía paquetes, llaves, medicinas y compras al instante',
    tag: '🛵 Express',
    image: '/assets/van_topdown-DM0HR-Nd.png'
  },
  {
    badge: '🛒 SÚPER & VÍVERES',
    title: 'Mercado & Provisiones',
    sub: 'Víveres frescos criollos, plátanos y bebidas frías',
    tag: '🛍️ Mercado',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'
  },
  {
    badge: '🔒 SEGURIDAD',
    title: 'Rastreo & PIN OTP',
    sub: 'Entregas seguras con código PIN contra entrega',
    tag: '🔑 PIN OTP',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80'
  }
];

export default function HistoriasCarrusel({ userData, isPro, onHirePro, navigate }) {
  const [stories, setStories] = useState([])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [has5StarContract, setHas5StarContract] = useState(false)
  const [showLockNotice, setShowLockNotice] = useState(false)
  const [showIncompleteProfileNotice, setShowIncompleteProfileNotice] = useState(false)

  // Estado para la publicidad animada y el modal instructivo
  const [promoSlideIndex, setPromoSlideIndex] = useState(0)
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false)

  // Auto-carrusel publicitario animado para la tarjeta de Pedidos Listo
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoSlideIndex(prev => (prev + 1) % PROMO_SLIDES.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [])

  const trackRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const isProUser = isPro || userData?.role === 'pro' || userData?.type === 'pro' || localStorage.getItem('forceListoPro') === 'true'

  // Verificación estricta de Perfil Completo (Nombre y Teléfono requeridos para Clientes y Profesionales)
  const isProfileComplete = Boolean(
    userData?.profileComplete ||
    (
      (userData?.name || userData?.displayName || userData?.fullName || userData?.proName) &&
      (userData?.phone || userData?.telefono || userData?.phoneNumber) &&
      (!isProUser || userData?.category || userData?.especialidad || userData?.verificacion?.estado === 'aprobada' || userData?.verificacion?.estado === 'verificado')
    )
  )

  // Mapa en tiempo real de planes de usuarios en Firestore para garantizar que cada historia muestre su plan real
  const [usersPlanMap, setUsersPlanMap] = useState({})

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const map = {}
      snap.forEach(uDoc => {
        const u = uDoc.data()
        const resolved = u.currentPlan || u.planId || u.plan || u.membership || u.proPlan || u.subscription || u.userPlan || u.planName || u.tipoPlan || u.tier
        if (resolved) {
          map[uDoc.id] = resolved
          if (u.uid) map[u.uid] = resolved
          if (u.id) map[u.id] = resolved

          const nameClean = String(u.name || u.displayName || u.fullName || u.proName || u.nombre || u.proNombre || '').toLowerCase().trim()
          if (nameClean) {
            map[nameClean] = resolved
          }
        }
      })
      setUsersPlanMap(map)
    }, (err) => console.log('Notice reading users for plan map:', err))

    return () => unsubscribeUsers()
  }, [])

  // Regla de Bienvenida (Grace Period): Pro de planes Gold, Platinum o VIP registrados en los últimos 30 días pueden subir 1 historia gratis
  const userPlanRaw = String(userData?.plan || userData?.currentPlan || userData?.planId || userData?.planName || userData?.subscription || '').toLowerCase()
  const userCreatedAt = userData?.createdAt ? new Date(userData.createdAt).getTime() : 0
  const isWithin30Days = userCreatedAt > 0 ? (Date.now() - userCreatedAt <= 30 * 24 * 60 * 60 * 1000) : true
  const isGoldOrAbove = userPlanRaw.includes('gold') || userPlanRaw.includes('platinum') || userPlanRaw.includes('vip') || userPlanRaw.includes('élite')
  const isGracePeriodEligible = isProUser && isGoldOrAbove && isWithin30Days

  // ÚNICAMENTE usuarios con Perfil Completo pueden publicar historias
  const canPublishStory = isProfileComplete && (!isProUser || has5StarContract || isGracePeriodEligible)

  // Real-time verification if the professional has at least one 4-5 star completed contract
  useEffect(() => {
    const proId = userData?.uid || userData?.id
    if (!proId || !isProUser) return

    // Fast check via local user state
    if (
      Number(userData?.rating) >= 4.0 ||
      userData?.completed5StarCount > 0 ||
      userData?.has5StarContract === true ||
      localStorage.getItem('force5StarUnlock') === 'true'
    ) {
      setHas5StarContract(true)
    }

    const qOrders = query(collection(db, 'orders'), where('proId', '==', proId))
    const unsubscribeOrders = onSnapshot(qOrders, (snap) => {
      let found5Star = false
      snap.forEach(doc => {
        const data = doc.data()
        const score = Number(data.ratingScore || data.rating || data.calificacion || 0)
        if (data.rated && score >= 4) {
          found5Star = true
        }
      })

      if (
        found5Star ||
        Number(userData?.rating) >= 4.0 ||
        (userData?.completed5StarCount && userData?.completed5StarCount > 0) ||
        userData?.has5StarContract === true
      ) {
        setHas5StarContract(true)
      } else {
        setHas5StarContract(false)
      }
    }, (err) => {
      console.log('Error listening to 5-star orders:', err)
    })

    return () => unsubscribeOrders()
  }, [userData, isProUser])

  // Real-time listener for stories from Firestore
  useEffect(() => {
    const qStories = query(collection(db, 'historias'))
    const unsubscribe = onSnapshot(qStories, (snapshot) => {
      const fetched = []
      const now = Date.now()

      snapshot.forEach(doc => {
        const data = doc.data()
        const isRejected = data.status === 'rejected' || data.moderated === 'rejected' || data.approved === false || data.rejected === true
        const isApproved = (data.status === 'approved' || data.approved === true || (data.moderated === true && data.status !== 'rejected')) && !isRejected
        
        // Calcular tiempo exacto de expiración (24 horas)
        let expiresTime = 0
        if (data.expiresAt) {
          expiresTime = new Date(data.expiresAt).getTime()
        } else if (data.createdAt) {
          expiresTime = new Date(data.createdAt).getTime() + (24 * 60 * 60 * 1000)
        }

        // Historia válida ÚNICAMENTE dentro de sus 24 horas y aprobada sin rechazo
        if (isApproved && !isRejected && expiresTime > now) {
          fetched.push({ id: doc.id, ...data })
        }
      })

      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setStories(fetched)
    }, (error) => {
      console.log('Error reading historias snapshot:', error)
    })

    return () => unsubscribe()
  }, [])

  const [seenStories, setSeenStories] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('listo_seen_stories') || '[]')
    } catch {
      return []
    }
  })

  const checkScroll = () => {
    if (trackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = trackRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
    }
  }

  const handleScroll = (direction) => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      setTimeout(checkScroll, 300)
    }
  }

  const handleOpenViewer = (index) => {
    const story = stories[index]
    if (story?.id) {
      setSeenStories((prev) => {
        if (!prev.includes(story.id)) {
          const updated = [...prev, story.id]
          localStorage.setItem('listo_seen_stories', JSON.stringify(updated))
          return updated
        }
        return prev
      })
    }
    setSelectedStoryIndex(index)
    setViewerOpen(true)
  }

  const handleAddStoryClick = () => {
    if (!isProfileComplete) {
      setShowIncompleteProfileNotice(true)
      return
    }
    if (canPublishStory) {
      setUploadModalOpen(true)
    } else {
      setShowLockNotice(true)
    }
  }

  return (
    <div className="historias-carrusel-wrapper">
      {/* ── CINTA MAMEY LLAMATIVA "PEDIDOS LISTO" CON DESTELLOS Y MANO ANIMADA ── */}
      <div className="cinta-pedidos-listo-container">
        {/* Mano animada presionando la cinta */}
        <div 
          className="animated-hand-pointer"
          onClick={() => setIsTutorialModalOpen(true)}
          title="¡Toca para ver cómo funciona Pedidos Listo!"
        >
          <div className="hand-badge">👇 ¡Toca aquí!</div>
          <span className="hand-emoji">👇</span>
        </div>

        <div 
          className="cinta-pedidos-listo-wrapper"
          onClick={() => {
            if (typeof navigate === 'function') {
              navigate('mandame');
            } else {
              const el = document.getElementById('hp-categories-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <div className="cinta-pedidos-listo">
            <span className="sparkle-left">✨</span>
            <span className="cinta-icon">🛵</span>
            <div className="cinta-text-container">
              <span className="cinta-text">PEDIDOS LISTO</span>
              <span className="cinta-subtext">DELIVERY & MÁNDAME</span>
            </div>
            <span className="cinta-icon">🛍️</span>
            <span className="sparkle-right">✨</span>
            <div className="cinta-shine"></div>
          </div>
        </div>

        <button 
          className="btn-como-usar-badge"
          onClick={(e) => {
            e.stopPropagation();
            setIsTutorialModalOpen(true);
          }}
        >
          ❓ ¿Cómo Funciona Pedidos Listo?
        </button>
      </div>

      <div className="historias-track-container">
        {canScrollLeft && (
          <button
            className="historias-scroll-btn left"
            onClick={() => handleScroll('left')}
            aria-label="Anterior"
          >
            ‹
          </button>
        )}

        <div
          className="historias-track"
          ref={trackRef}
          onScroll={checkScroll}
        >
          {/* Add Story Button for both Clients and Professionals */}
          <div className="historia-item" onClick={handleAddStoryClick}>
            <div className={`historia-ring add-story-ring ${!canPublishStory ? 'locked' : ''}`}>
              <div className="historia-avatar-inner">
                <img
                  src={userData?.photoURL || userData?.avatarUrl || userData?.profilePhoto || 'https://randomuser.me/api/portraits/men/32.jpg'}
                  alt="Tu perfil"
                  className="historia-avatar"
                />
              </div>
              <div className="historia-add-plus">
                {canPublishStory ? '+' : '🔒'}
              </div>
            </div>
            <span className="historia-label pro-label">
              {!isProfileComplete ? '🔒 Completar' : (canPublishStory ? 'Tu Historia' : '⭐ 5 Estrellas')}
            </span>
          </div>

          {/* TARJETA PUBLICITARIA ANIMADA DE PEDIDOS LISTO (RESTAURANTES, DELIVERIES Y TUTORIAL) */}
          <div 
            className="historia-item pedis-listo-promo-card-item"
            onClick={() => {
              if (typeof navigate === 'function') {
                navigate('mandame');
              } else {
                setIsTutorialModalOpen(true);
              }
            }}
          >
            <div className="pedidos-promo-card-inner">
              <div className="pedidos-promo-badge">
                <span>{PROMO_SLIDES[promoSlideIndex].badge}</span>
              </div>

              <div className="pedidos-promo-image-box">
                <img 
                  src={PROMO_SLIDES[promoSlideIndex].image} 
                  alt="Pedidos Listo Promo" 
                  className="pedidos-promo-img"
                />
                <div className="pedidos-promo-overlay-tag">
                  {PROMO_SLIDES[promoSlideIndex].tag}
                </div>
              </div>

              <div className="pedidos-promo-info">
                <div className="pedidos-promo-title">{PROMO_SLIDES[promoSlideIndex].title}</div>
                <div className="pedidos-promo-sub">{PROMO_SLIDES[promoSlideIndex].sub}</div>
              </div>

              <div className="pedidos-promo-dots">
                {PROMO_SLIDES.map((_, i) => (
                  <span 
                    key={i} 
                    className={`promo-dot ${i === promoSlideIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
            <span className="historia-label pro-label" style={{ color: '#ff6b00', fontWeight: 900 }}>
              🍔 Pedidos Listo
            </span>
          </div>

          {/* Unique Professionals Stories List with Custom Plan Color Themes */}
          {(() => {
            const uniquePros = []
            const seenKeys = new Set()

            stories.forEach((story, idx) => {
              const key = story.proId || story.proUid || story.proName || story.fullName || story.id
              if (!seenKeys.has(key)) {
                seenKeys.add(key)
                const allStoryIds = stories.filter(s => (s.proId || s.proUid || s.proName || s.fullName || s.id) === key).map(s => s.id)
                const proUidKey = story.proId || story.proUid
                const proNameClean = String(story.proName || story.fullName || '').toLowerCase().trim()
                const words = proNameClean.split(' ').filter(Boolean)
                const twoWords = words.length >= 2 ? `${words[0]} ${words[1]}` : ''
                const firstWord = words.length >= 1 && words[0].length >= 3 ? words[0] : ''

                const livePlan = (proUidKey && usersPlanMap[proUidKey]) ||
                                 (proNameClean && usersPlanMap[proNameClean])

                const finalPlan = livePlan || story.proPlan || story.plan || story.currentPlan || story.planId || story.membership || story.subscription || story.userPlan || story.planName

                // Detectar si el usuario o alguna de sus historias tiene una oferta activa
                const proStories = stories.filter(s => (s.proId || s.proUid || s.proName || s.fullName || s.id) === key)
                const offerStory = proStories.find(s => s.sticker || s.hasOffer || s.type === 'oferta_flash' || s.offerText)
                const rawSticker = offerStory?.sticker || story.sticker || story.offerSticker || ''
                const percentMatch = rawSticker.match(/\d+%/)?.[0]
                const offerBadgeText = percentMatch ? `${percentMatch} OFF` : '% OFF'
                const hasOffer = Boolean(offerStory || story.hasOffer || rawSticker || story.type === 'oferta_flash')

                uniquePros.push({
                  key,
                  firstIndex: idx,
                  proName: story.proName || story.fullName,
                  proAvatar: story.proAvatar,
                  proPlan: finalPlan,
                  proRating: story.proRating || story.rating || story.calificacion || 5.0,
                  allStoryIds,
                  hasOffer,
                  offerBadgeText,
                  rawSticker
                })
              }
            })

            return uniquePros.map((pro) => {
              const isAllSeen = pro.allStoryIds.every(id => seenStories.includes(id))
              const theme = getProPlanTheme(pro.proPlan, pro.proRating)

              return (
                <div
                  key={pro.key}
                  className="historia-item"
                  onClick={() => handleOpenViewer(pro.firstIndex)}
                >
                  <div
                    className={`historia-ring ${isAllSeen ? 'seen' : ''}`}
                    style={isAllSeen ? {
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: `2px solid ${theme.color}`,
                      boxShadow: `0 2px 8px ${theme.color}44`
                    } : {
                      background: theme.ringGradient,
                      boxShadow: `0 4px 14px ${theme.color}55`
                    }}
                  >
                    <div className="historia-avatar-inner">
                      <img
                        src={pro.proAvatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
                        alt={pro.proName}
                        className="historia-avatar"
                      />
                    </div>
                    {/* STICKER CIRCULAR ANIMADO % OFF CUANDO EL USUARIO TIENE OFERTA */}
                    {pro.hasOffer && (
                      <div 
                        className="historia-offer-badge-circle"
                        title={pro.rawSticker || '¡Este usuario tiene una oferta activa!'}
                      >
                        <span>{pro.offerBadgeText}</span>
                      </div>
                    )}
                    {/* El distintivo de plan (GOLD, PLATINUM, VIP, BÁSICO) SIEMPRE permanece visible */}
                    <span 
                      className="historia-plan-badge-tag" 
                      style={{ 
                        background: theme.badgeBg, 
                        color: theme.badgeColor,
                        opacity: isAllSeen ? 0.85 : 1
                      }}
                    >
                      {theme.tag}
                    </span>
                  </div>
                  <span className="historia-label" title={pro.proName}>
                    {pro.proName}
                  </span>
                </div>
              )
            })
          })()}
        </div>

        {canScrollRight && (
          <button
            className="historias-scroll-btn right"
            onClick={() => handleScroll('right')}
            aria-label="Siguiente"
          >
            ›
          </button>
        )}
      </div>

      {/* Fullscreen Story Viewer Modal */}
      <HistoriasViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        stories={stories}
        initialIndex={selectedStoryIndex}
        userData={userData}
        onHirePro={onHirePro}
        navigate={navigate}
      />

      {/* Upload Story Modal for 5-Star Eligible Professionals */}
      <SubirHistoriaModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        userData={userData}
        onStoryUploaded={() => console.log('Historia subida')}
      />

      {/* Exotic Floating Lock Notice Modal for Professionals needing 4-5 stars */}
      {showLockNotice && createPortal(
        <div className="subir-historia-modal-overlay" onClick={() => setShowLockNotice(false)}>
          <div 
            className="subir-historia-modal-card" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              textAlign: 'center', 
              padding: '28px 22px', 
              background: 'linear-gradient(145deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(245, 158, 11, 0.25)',
              borderRadius: '24px',
              color: '#FFFFFF'
            }}
          >
            {/* Exotic Animated Trophy & Star Badge */}
            <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 12px' }}>
              <div style={{ fontSize: '54px', filter: 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.6))' }}>
                🏆
              </div>
              <span style={{ position: 'absolute', bottom: '-4px', right: '-8px', fontSize: '20px' }}>⭐</span>
            </div>

            <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(242, 96, 0, 0.2))', border: '1px solid rgba(245, 158, 11, 0.5)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', color: '#FBBF24', letterSpacing: '0.5px', marginBottom: '10px' }}>
              👑 REQUISITO DE SOCIO VIP
            </div>

            <h3 style={{ margin: '0 0 10px 0', fontSize: '19px', fontWeight: '900', background: 'linear-gradient(135deg, #FFFFFF, #FDE68A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Desbloquea tus Historias de 24h
            </h3>

            <p style={{ fontSize: '13.5px', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '22px' }}>
              Para garantizar la máxima calidad en Pedidos Listo, la función de publicar Historias de Trabajo de 24h está reservada exclusivamente para profesionales que hayan obtenido una calificación de <strong style={{ color: '#FBBF24' }}>4 a 5 Estrellas ⭐⭐⭐⭐⭐ por contrato / trabajo finalizado</strong>.
              <br /><br />
              ¡Completa tu próximo contrato con responsabilidad, puntualidad y excelencia para recibir de 4 a 5 estrellas de tu cliente y desbloquear tus Historias!
            </p>

            <button
              onClick={() => setShowLockNotice(false)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #F59E0B 0%, #F26000 100%)',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '14.5px',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(242, 96, 0, 0.5)',
                transition: 'all 0.2s ease'
              }}
            >
              ⭐ ¡Entendido, a dar un servicio de 5 Estrellas!
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Exotic Floating Lock Notice Modal for Incomplete Profile */}
      {showIncompleteProfileNotice && createPortal(
        <div className="subir-historia-modal-overlay" onClick={() => setShowIncompleteProfileNotice(false)}>
          <div 
            className="subir-historia-modal-card" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              textAlign: 'center', 
              padding: '28px 22px', 
              background: 'linear-gradient(145deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
              border: '1.5px solid rgba(239, 68, 68, 0.5)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(239, 68, 68, 0.25)',
              borderRadius: '24px',
              color: '#FFFFFF'
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 12px' }}>
              <div style={{ fontSize: '54px', filter: 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.6))' }}>
                📝
              </div>
              <span style={{ position: 'absolute', bottom: '-4px', right: '-8px', fontSize: '20px' }}>🔒</span>
            </div>

            <div style={{ display: 'inline-block', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', color: '#F87171', letterSpacing: '0.5px', marginBottom: '10px' }}>
              🔒 PERFIL INCOMPLETO
            </div>

            <h3 style={{ margin: '0 0 10px 0', fontSize: '19px', fontWeight: '900', color: '#FFFFFF' }}>
              ¡Completa tu Perfil para publicar Historias!
            </h3>

            <p style={{ fontSize: '13.5px', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '22px' }}>
              Para garantizar la seguridad, autenticidad y confianza en la comunidad de Pedidos Listo, <strong style={{ color: '#F87171' }}>solo los usuarios con su Perfil Completo (Nombre y Teléfono)</strong> pueden publicar Historias de Trabajo de 24h.
            </p>

            <button
              onClick={() => {
                setShowIncompleteProfileNotice(false)
                if (navigate) navigate('profile')
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #F26000 0%, #FF7A1A 100%)',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '14.5px',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(242, 96, 0, 0.5)',
                transition: 'all 0.2s ease'
              }}
            >
              👉 ¡Ir a Completar mi Perfil Ahora!
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL TUTORIAL INTERACTIVO: CÓMO USAR PEDIDOS LISTO */}
      {isTutorialModalOpen && createPortal(
        <div className="pedidos-tutorial-modal-overlay" onClick={() => setIsTutorialModalOpen(false)}>
          <div className="pedidos-tutorial-modal-card" onClick={e => e.stopPropagation()}>
            <div className="pedidos-tutorial-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 26 }}>🛵</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#ff6b00' }}>
                    ¿Cómo Usar Pedidos Listo & Mándame?
                  </h3>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Guía rápida paso a paso en Santiago RD</span>
                </div>
              </div>
              <button className="pedidos-tutorial-close" onClick={() => setIsTutorialModalOpen(false)}>&times;</button>
            </div>

            <div className="pedidos-tutorial-steps">
              <div className="tutorial-step-card">
                <div className="step-num">1</div>
                <div className="step-content">
                  <h4>🍔 Elige tu Antojo o Servicio</h4>
                  <p>Restaurantes (Pizzas, Yaroas, Pollo), Víveres de Supermercado o Motores Mándame Express.</p>
                </div>
              </div>

              <div className="tutorial-step-card">
                <div className="step-num">2</div>
                <div className="step-content">
                  <h4>📍 Confirma tu Dirección de Entrega</h4>
                  <p>Indica el local de recogida y la casa/local de entrega con GPS rápido.</p>
                </div>
              </div>

              <div className="tutorial-step-card">
                <div className="step-num">3</div>
                <div className="step-content">
                  <h4>🛵 Motorizado Asignado con PIN OTP</h4>
                  <p>Rastrea a tu driver Mándame en tiempo real y entrega tu PIN de seguridad al recibir tu pedido.</p>
                </div>
              </div>
            </div>

            <div className="pedidos-tutorial-actions">
              <button 
                className="btn-probar-pedidos-listo"
                onClick={() => {
                  setIsTutorialModalOpen(false);
                  if (typeof navigate === 'function') navigate('mandame');
                }}
              >
                🚀 ¡Ir a Pedidos Listo Ahora!
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
