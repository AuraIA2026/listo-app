import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { db, auth } from '../firebase'
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore'
import HistoriasViewerModal from './HistoriasViewerModal'
import SubirHistoriaModal from './SubirHistoriaModal'
import { getProPlanTheme } from '../planTheme'
import { getStoryExpirationMs, parseStoryTimeMs, deleteExpiredStoryFromDb } from '../hooks/useStories'
import './Historias.css'

const HAND_TEXTS_DELIVERY = [
  '🍔 ¿Tienes hambre?',
  '👇 ¡Presiona aquí!',
  '🛵 Delivery Listo Patrón',
  '🛍️ Víveres & Súper'
];

const HAND_TEXTS_SERVICES = [
  '🛠️ ¿Buscas un técnico?',
  '👇 Volver a Listo Patrón',
  '⚡ Electricistas & Plomeros',
  '🤝 Servicios Profesionales'
];

export default function HistoriasCarrusel({ userData, isPro, onHirePro, navigate, isMandameView = false, hideRibbon = false }) {
  const [stories, setStories] = useState([])
  const [allAdminStories, setAllAdminStories] = useState([])
  const [adminControlOpen, setAdminControlOpen] = useState(false)
  const [adminStoryFilter, setAdminStoryFilter] = useState('pending')
  const [adminZoomStory, setAdminZoomStory] = useState(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [has5StarContract, setHas5StarContract] = useState(false)
  const [showLockNotice, setShowLockNotice] = useState(false)
  const [showIncompleteProfileNotice, setShowIncompleteProfileNotice] = useState(false)

  let storedUser = {}
  try {
    storedUser = JSON.parse(localStorage.getItem('listoUserData') || '{}')
  } catch (e) {}

  const currentEmail = String(userData?.email || auth?.currentUser?.email || storedUser?.email || '').toLowerCase().trim()
  const currentRole = String(userData?.role || storedUser?.role || '').toLowerCase().trim()

  const isAdminUser = Boolean(
    currentEmail === 'listopatron.app@gmail.com' ||
    currentRole === 'admin' ||
    userData?.isAdmin === true ||
    storedUser?.isAdmin === true
  )

  // Estado para la animación del texto alternante de la mano indicadora
  const [handTextIndex, setHandTextIndex] = useState(0)
  const [showHandPointer, setShowHandPointer] = useState(true)

  const activeHandTexts = isMandameView ? HAND_TEXTS_SERVICES : HAND_TEXTS_DELIVERY;

  // Timer para alternar el texto animado de la mano cada 2.4 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setHandTextIndex(prev => (prev + 1) % activeHandTexts.length)
    }, 2400)
    return () => clearInterval(timer)
  }, [activeHandTexts.length])

  // Timer para ocultar la mano animada automáticamente a los 7 segundos de abrir la app
  useEffect(() => {
    const hideTimer = setTimeout(() => {
      setShowHandPointer(false)
    }, 7000)
    return () => clearTimeout(hideTimer)
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

  // Mapa en tiempo real de planes y fotos de usuarios en Firestore para garantizar que cada historia muestre su plan y foto real (o perfil sin foto)
  const [usersPlanMap, setUsersPlanMap] = useState({})
  const [usersPhotoMap, setUsersPhotoMap] = useState({})

  const isRealProfilePhoto = (url) => Boolean(
    url &&
    typeof url === 'string' &&
    url.trim() !== '' &&
    !url.includes('randomuser.me') &&
    !url.includes('pravatar.cc') &&
    !url.includes('ui-avatars.com')
  )

  const normKey = (str) => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim()

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const map = {}
      const photoMap = {}
      snap.forEach(uDoc => {
        const u = uDoc.data()
        const resolved = u.currentPlan || u.planId || u.plan || u.membership || u.proPlan || u.subscription || u.userPlan || u.planName || u.tipoPlan || u.tier
        const rawName = u.name || u.displayName || u.fullName || u.proName || u.nombre || u.proNombre || u.verificacion?.nombre || ''
        const nameClean = String(rawName).toLowerCase().trim()
        const nameNorm = normKey(rawName)

        if (resolved) {
          map[uDoc.id] = resolved
          if (u.uid) map[u.uid] = resolved
          if (u.id) map[u.id] = resolved
          if (nameClean) map[nameClean] = resolved
          if (nameNorm) map[nameNorm] = resolved
        }

        const rawPhoto = u.photoURL || u.avatarUrl || u.profilePhoto || u.img || u.logo || ''
        const realPhoto = isRealProfilePhoto(rawPhoto) ? rawPhoto.trim() : null
        if (realPhoto) {
          photoMap[uDoc.id] = realPhoto
          if (u.uid) photoMap[u.uid] = realPhoto
          if (u.id) photoMap[u.id] = realPhoto
          if (nameClean) photoMap[nameClean] = realPhoto
          if (nameNorm) photoMap[nameNorm] = realPhoto
        }
      })
      setUsersPlanMap(map)
      setUsersPhotoMap(photoMap)
    }, (err) => console.log('Notice reading users for plan map:', err))

    return () => unsubscribeUsers()
  }, [])

  // Regla de Bienvenida (Grace Period): Pro de planes Gold, Platinum o VIP registrados en los últimos 30 días pueden subir 1 historia gratis
  const userPlanRaw = String(userData?.plan || userData?.currentPlan || userData?.planId || userData?.planName || userData?.subscription || '').toLowerCase()
  const userCreatedAt = userData?.createdAt ? new Date(userData.createdAt).getTime() : 0
  const isWithin30Days = userCreatedAt > 0 ? (Date.now() - userCreatedAt <= 30 * 24 * 60 * 60 * 1000) : true
  const isGoldOrAbove = userPlanRaw.includes('gold') || userPlanRaw.includes('platinum') || userPlanRaw.includes('vip') || userPlanRaw.includes('élite')
  const isGracePeriodEligible = isProUser && isGoldOrAbove && isWithin30Days

  // Historias desbloqueadas temporalmente para todos los usuarios
  const canPublishStory = true

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

  // Real-time listener for stories from Firestore + auto-borrado de imagen/documento al cumplir 24h
  useEffect(() => {
    const qStories = query(collection(db, 'historias'))
    const unsubscribe = onSnapshot(qStories, (snapshot) => {
      const fetched = []
      const adminList = []
      const now = Date.now()

      snapshot.forEach(docSnap => {
        const data = docSnap.data()
        const isExpiredOrDeleted = data.status === 'expired' || data.status === 'deleted'
        const isPending = data.status === 'pending' || (data.approved === false && data.status !== 'rejected')
        const isRejected = data.status === 'rejected' || data.moderated === 'rejected' || data.rejected === true
        const isApproved = !isPending && !isRejected && (data.status === 'approved' || data.approved === true || data.validada === true)
        
        // Calcular tiempo exacto de expiración (máximo 24 horas)
        const expiresTime = getStoryExpirationMs(data)

        // Si está marcada expirada/eliminada, o ya fue aprobada y pasaron sus 24 horas, borrar automáticamente
        if (isExpiredOrDeleted || (isApproved && (expiresTime <= 0 || expiresTime <= now))) {
          deleteExpiredStoryFromDb(docSnap.id)
          return
        }

        const storyObj = { id: docSnap.id, ...data }
        adminList.push(storyObj)

        // Historia válida ÚNICAMENTE dentro de sus 24 horas y aprobada sin rechazo
        if (isApproved && !isRejected && expiresTime > now) {
          fetched.push(storyObj)
        }
      })

      fetched.sort((a, b) => parseStoryTimeMs(b.createdAt) - parseStoryTimeMs(a.createdAt))
      adminList.sort((a, b) => parseStoryTimeMs(b.createdAt) - parseStoryTimeMs(a.createdAt))
      setStories(fetched)
      setAllAdminStories(adminList)
    }, (error) => {
      console.log('Error reading historias snapshot:', error)
    })

    // Revisión periódica cada 60s para borrar historias cuya imagen cumpla 24h mientras la app está abierta
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setStories(prev => prev.filter(s => {
        const exp = getStoryExpirationMs(s)
        if (exp <= 0 || exp <= now) {
          deleteExpiredStoryFromDb(s.id)
          return false
        }
        return true
      }))
    }, 60000)

    return () => {
      unsubscribe()
      clearInterval(cleanupInterval)
    }
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
    setUploadModalOpen(true)
  }

  const handleRibbonClick = () => {
    if (typeof navigate === 'function') {
      navigate(isMandameView ? 'home' : 'mandame');
    } else {
      const el = document.getElementById('hp-categories-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="historias-carrusel-wrapper">
      {/* ── CINTA MAMEY LLAMATIVA CON DESTELLOS Y MANO ANIMADA CON TEXTO ── */}
      {!hideRibbon && (
        <div className="cinta-pedidos-listo-container">
          {/* Mano animada presionando la cinta con texto alternante (Solo dura 7s al abrir la app) */}
          {showHandPointer && (
            <div 
              className="animated-hand-pointer"
              onClick={handleRibbonClick}
              title={isMandameView ? "¡Haz clic para volver a Listo Patrón!" : "¡Haz clic para entrar a Pedidos Listo!"}
            >
              <div className="hand-badge animated-fade-text" key={handTextIndex}>
                {activeHandTexts[handTextIndex]}
              </div>
              <span className="hand-emoji">👇</span>
            </div>
          )}

          <div 
            className="cinta-pedidos-listo-wrapper"
            onClick={handleRibbonClick}
          >
            <div className="cinta-pedidos-listo" style={isMandameView ? { background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 40%, #1d4ed8 80%, #1e40af 100%)', boxShadow: '0 5px 16px rgba(37, 99, 235, 0.45), 0 0 10px rgba(255, 255, 255, 0.35) inset' } : {}}>
              {isMandameView ? (
                <span className="cinta-icon moto-speed-wrap">
                  <span className="moto-emoji">🤝</span>
                </span>
              ) : (
                <span className="cinta-icon moto-speed-wrap" title="¡Delivery a toda velocidad!">
                  <span className="moto-emoji">🛵</span>
                  <span className="moto-smoke-trail">💨</span>
                  <span className="moto-speed-lines">⚡</span>
                </span>
              )}
              <div className="cinta-text-container">
                <span className="cinta-text">{isMandameView ? 'LISTO PATRÓN' : 'PEDIDOS LISTO'}</span>
                <span className="cinta-subtext">{isMandameView ? 'SERVICIOS & TÉCNICOS' : 'DELIVERY LISTO PATRÓN'}</span>
              </div>
              <span className="cinta-icon">{isMandameView ? '🛠️' : '🛍️'}</span>
              <span className="sparkle-right">✨</span>
              <div className="cinta-shine"></div>
            </div>
          </div>
        </div>
      )}


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
                {(() => {
                  const myPhoto = [userData?.photoURL, userData?.avatarUrl, userData?.profilePhoto].find(isRealProfilePhoto)
                  return myPhoto ? (
                    <img
                      src={myPhoto}
                      alt="Tu perfil"
                      className="historia-avatar"
                    />
                  ) : (
                    <div className="historia-avatar no-photo-placeholder" aria-label="Perfil sin foto">
                      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '68%', height: '68%', marginTop: '12%' }}>
                        <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                      </svg>
                    </div>
                  )
                })()}
              </div>
              <div className="historia-add-plus">
                {canPublishStory ? '+' : '🔒'}
              </div>
            </div>
            <span className="historia-label pro-label">
              Tu Historia
            </span>
          </div>

          {/* Botón de Control y Aprobación de Historias exclusivo para el Administrador */}
          {isAdminUser && (() => {
            const pendingCount = allAdminStories.filter(s => s.status === 'pending' || (s.approved === false && s.status !== 'rejected')).length
            return (
              <div
                className="historia-item"
                onClick={() => {
                  setAdminStoryFilter(pendingCount > 0 ? 'pending' : 'all')
                  setAdminControlOpen(true)
                }}
                title="Herramienta de Control y Aprobación de Historias"
              >
                <div
                  className="historia-ring"
                  style={{
                    background: pendingCount > 0
                      ? 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'
                      : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: pendingCount > 0
                      ? '0 4px 16px rgba(245, 158, 11, 0.6)'
                      : '0 4px 14px rgba(16, 185, 129, 0.45)'
                  }}
                >
                  <div
                    className="historia-avatar-inner"
                    style={{
                      background: 'linear-gradient(145deg, #0F172A, #1E293B)',
                      color: '#FFF',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}
                  >
                    🛡️
                  </div>
                  <span
                    className="historia-plan-badge-tag"
                    style={{
                      background: pendingCount > 0 ? '#EF4444' : '#10B981',
                      color: '#FFFFFF'
                    }}
                  >
                    {pendingCount > 0 ? `⏳ ${pendingCount} POR APROBAR` : `CONTROL (${allAdminStories.length})`}
                  </span>
                </div>
                <span className="historia-label" style={{ color: '#F26000', fontWeight: 900 }}>
                  Aprobar ({allAdminStories.length})
                </span>
              </div>
            )
          })()}

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
                const proNameNorm = normKey(story.proName || story.fullName || '')
                const words = proNameClean.split(' ').filter(Boolean)
                const twoWords = words.length >= 2 ? `${words[0]} ${words[1]}` : ''
                const firstWord = words.length >= 1 && words[0].length >= 3 ? words[0] : ''

                const livePlan = (proUidKey && usersPlanMap[proUidKey]) ||
                                 (proNameClean && usersPlanMap[proNameClean]) ||
                                 (proNameNorm && usersPlanMap[proNameNorm])

                const finalPlan = livePlan || story.proPlan || story.plan || story.currentPlan || story.planId || story.membership || story.subscription || story.userPlan || story.planName

                const currentUserNameNorm = normKey(userData?.name || userData?.displayName || '')
                const isCurrentUserStory = Boolean(
                  (proUidKey && (proUidKey === userData?.uid || proUidKey === userData?.id)) ||
                  (proNameNorm && currentUserNameNorm && proNameNorm === currentUserNameNorm)
                )
                const isListoBrand = proNameClean.includes('listo patron') || proNameNorm.includes('listo patron') || proNameClean.includes('listo patrón')

                const currentUserPhoto = isCurrentUserStory
                  ? [userData?.photoURL, userData?.avatarUrl, userData?.profilePhoto, localStorage.getItem('user_photo_url'), isListoBrand ? '/logo192.png' : null].find(isRealProfilePhoto)
                  : null

                const resolvedProAvatar =
                  (proUidKey && usersPhotoMap[proUidKey]) ||
                  currentUserPhoto ||
                  (proNameClean && usersPhotoMap[proNameClean]) ||
                  (proNameNorm && usersPhotoMap[proNameNorm]) ||
                  (isRealProfilePhoto(story.proAvatar) ? story.proAvatar : null) ||
                  (isListoBrand ? '/logo192.png' : null) ||
                  null

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
                  proAvatar: resolvedProAvatar,
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
                      {pro.proAvatar ? (
                        <img
                          src={pro.proAvatar}
                          alt={pro.proName}
                          className="historia-avatar"
                        />
                      ) : (
                        <div className="historia-avatar no-photo-placeholder" aria-label="Perfil sin foto">
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '68%', height: '68%', marginTop: '12%' }}>
                            <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                          </svg>
                        </div>
                      )}
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
              Para garantizar la máxima calidad en <strong>Listo Patrón</strong>, la función de publicar Historias de Trabajo de 24h está reservada exclusivamente para profesionales que hayan obtenido una calificación de <strong style={{ color: '#FBBF24' }}>4 a 5 Estrellas ⭐⭐⭐⭐⭐ por contrato / trabajo finalizado</strong>.
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
              Para garantizar la seguridad, autenticidad y confianza en la comunidad de <strong>Listo Patrón</strong>, <strong style={{ color: '#F87171' }}>solo los usuarios con su Perfil Completo (Nombre y Teléfono)</strong> pueden publicar Historias de Trabajo de 24h.
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

      {/* ── HERRAMIENTA DE CONTROL Y APROBACIÓN DE HISTORIAS EN GRANDE (EXCLUSIVO ADMIN) ── */}
      {isAdminUser && adminControlOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(2, 6, 23, 0.92)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '16px'
          }}
          onClick={() => setAdminControlOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '920px',
              margin: '0 auto',
              background: '#0F172A',
              borderRadius: '24px',
              border: '1.5px solid rgba(242, 96, 0, 0.45)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
              padding: '20px',
              color: '#FFFFFF'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🛡️ Control y Aprobación de Historias (Admin)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94A3B8' }}>
                  Revisa la foto o video en grande antes de publicarla. Tú decides qué historia se aprueba y cuál no se aprueba.
                </p>
              </div>
              <button
                onClick={() => setAdminControlOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: '#FFF',
                  border: 'none',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  fontSize: '18px',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Filtros */}
            {(() => {
              const isStPending = (s) => s.status === 'pending' || (s.approved === false && s.status !== 'rejected')
              const isStRejected = (s) => s.status === 'rejected' || s.moderated === 'rejected' || s.rejected === true
              const isStApproved = (s) => !isStPending(s) && !isStRejected(s) && (s.status === 'approved' || s.approved === true || s.validada === true)

              const pendingList = allAdminStories.filter(isStPending)
              const approvedList = allAdminStories.filter(isStApproved)
              const rejectedList = allAdminStories.filter(isStRejected)

              const filteredStories = allAdminStories.filter(s => {
                if (adminStoryFilter === 'pending') return isStPending(s)
                if (adminStoryFilter === 'approved') return isStApproved(s)
                if (adminStoryFilter === 'rejected') return isStRejected(s)
                return true
              })

              const handleAdminApprove = async (st) => {
                try {
                  await updateDoc(doc(db, 'historias', st.id), {
                    status: 'approved',
                    approved: true,
                    validada: true,
                    moderated: true,
                    rejected: false,
                    approvedAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                  })
                  if (st.proId) {
                    await addDoc(collection(db, 'notificaciones'), {
                      userId: st.proId,
                      type: 'system',
                      title: '📸 ¡Tu Historia fue Aprobada!',
                      text: 'El administrador aprobó tu historia y ya está visible por 24 horas en Listo Patrón.',
                      date: new Date().toISOString(),
                      createdAt: new Date().toISOString(),
                      read: false
                    }).catch(() => {})
                  }
                } catch (err) {
                  alert('Error al aprobar historia: ' + err.message)
                }
              }

              const handleAdminReject = async (st) => {
                try {
                  await updateDoc(doc(db, 'historias', st.id), {
                    status: 'rejected',
                    approved: false,
                    validada: false,
                    moderated: 'rejected',
                    rejected: true,
                    rejectedAt: new Date().toISOString()
                  })
                  if (st.proId) {
                    await addDoc(collection(db, 'notificaciones'), {
                      userId: st.proId,
                      type: 'system',
                      title: '❌ Historia no aprobada',
                      text: 'Tu historia no fue aprobada por moderación en Listo Patrón.',
                      date: new Date().toISOString(),
                      createdAt: new Date().toISOString(),
                      read: false
                    }).catch(() => {})
                  }
                } catch (err) {
                  alert('Error al rechazar historia: ' + err.message)
                }
              }

              const handleAdminDelete = async (st) => {
                if (!window.confirm(`🗑️ ¿Eliminar definitivamente la historia de ${st.proName || 'este usuario'}?`)) return
                try {
                  await deleteDoc(doc(db, 'historias', st.id))
                  if (adminZoomStory?.id === st.id) setAdminZoomStory(null)
                } catch (err) {
                  alert('Error al eliminar historia: ' + err.message)
                }
              }

              return (
                <>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                    <button
                      onClick={() => setAdminStoryFilter('pending')}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '14px',
                        border: adminStoryFilter === 'pending' ? '2px solid #F59E0B' : '1px solid rgba(255,255,255,0.15)',
                        background: adminStoryFilter === 'pending' ? '#F59E0B' : '#1E293B',
                        color: '#FFF',
                        fontWeight: 900,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      🟡 Por Aprobar ({pendingList.length})
                    </button>
                    <button
                      onClick={() => setAdminStoryFilter('approved')}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '14px',
                        border: adminStoryFilter === 'approved' ? '2px solid #10B981' : '1px solid rgba(255,255,255,0.15)',
                        background: adminStoryFilter === 'approved' ? '#10B981' : '#1E293B',
                        color: '#FFF',
                        fontWeight: 900,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      🟢 Aprobadas ({approvedList.length})
                    </button>
                    <button
                      onClick={() => setAdminStoryFilter('rejected')}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '14px',
                        border: adminStoryFilter === 'rejected' ? '2px solid #EF4444' : '1px solid rgba(255,255,255,0.15)',
                        background: adminStoryFilter === 'rejected' ? '#EF4444' : '#1E293B',
                        color: '#FFF',
                        fontWeight: 900,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      🔴 No Aprobadas ({rejectedList.length})
                    </button>
                    <button
                      onClick={() => setAdminStoryFilter('all')}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '14px',
                        border: adminStoryFilter === 'all' ? '2px solid #F26000' : '1px solid rgba(255,255,255,0.15)',
                        background: adminStoryFilter === 'all' ? '#F26000' : '#1E293B',
                        color: '#FFF',
                        fontWeight: 900,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      📋 Todas ({allAdminStories.length})
                    </button>
                  </div>

                  {filteredStories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: '#1E293B', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: '42px', marginBottom: '10px' }}>📸</div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '16px', color: '#FFF' }}>No hay historias en esta categoría</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>Cambia de pestaña arriba para ver todas las historias.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {filteredStories.map(st => {
                        const media = st.imageUrl || st.videoUrl || st.mediaUrl || st.url
                        const isVid = st.mediaType === 'video' || st.type === 'video' || Boolean(st.videoUrl)
                        const pending = isStPending(st)
                        const rejected = isStRejected(st)
                        const approved = isStApproved(st)

                        return (
                          <div
                            key={st.id}
                            style={{
                              background: '#1E293B',
                              borderRadius: '20px',
                              border: pending ? '2px solid #F59E0B' : approved ? '2px solid #10B981' : '2px solid #EF4444',
                              overflow: 'hidden',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                            }}
                          >
                            {/* Cabecera del usuario */}
                            <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                              <div>
                                <div style={{ fontSize: '16px', fontWeight: 900, color: '#FFF' }}>
                                  👤 {st.proName || st.fullName || 'Usuario'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                                  {st.proCategory || 'Historia 24h'}
                                </div>
                              </div>
                              <span
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: 900,
                                  background: pending ? '#F59E0B' : approved ? '#10B981' : '#EF4444',
                                  color: '#FFF'
                                }}
                              >
                                {pending ? '🟡 PENDIENTE DE APROBAR' : approved ? '🟢 APROBADA (VISIBLE)' : '🔴 NO APROBADA'}
                              </span>
                            </div>

                            {/* FOTO EN GRANDE COMPLETA */}
                            <div
                              onClick={() => setAdminZoomStory(st)}
                              style={{
                                width: '100%',
                                minHeight: '380px',
                                maxHeight: '560px',
                                background: '#020617',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                cursor: 'zoom-in',
                                padding: '10px'
                              }}
                              title="Toca para abrir en pantalla completa"
                            >
                              {isVid ? (
                                <video
                                  src={media}
                                  controls
                                  playsInline
                                  style={{ width: '100%', maxHeight: '530px', objectFit: 'contain', borderRadius: '12px' }}
                                  onClick={e => e.stopPropagation()}
                                />
                              ) : (
                                <img
                                  src={media}
                                  alt={st.proName || 'Historia'}
                                  style={{ width: '100%', maxHeight: '530px', objectFit: 'contain', borderRadius: '12px' }}
                                />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setAdminZoomStory(st)
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '14px',
                                  right: '14px',
                                  background: 'rgba(15, 23, 42, 0.85)',
                                  color: '#FFF',
                                  border: '1.5px solid rgba(255,255,255,0.35)',
                                  padding: '8px 14px',
                                  borderRadius: '20px',
                                  fontWeight: 900,
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                🔍 Ver en Pantalla Completa
                              </button>
                            </div>

                            {/* Pie de foto */}
                            {st.caption && (
                              <div style={{ padding: '12px 18px', background: '#0B132B', color: '#E2E8F0', fontSize: '13.5px', fontWeight: 600 }}>
                                💬 "{st.caption}"
                              </div>
                            )}

                            {/* Botones Grandes de Control: APROBAR / NO APROBAR / ELIMINAR */}
                            <div style={{ padding: '16px 18px', display: 'flex', gap: '10px', flexWrap: 'wrap', background: '#1E293B' }}>
                              <button
                                onClick={() => handleAdminApprove(st)}
                                style={{
                                  flex: 1,
                                  minWidth: '170px',
                                  padding: '14px 18px',
                                  borderRadius: '14px',
                                  border: 'none',
                                  background: approved ? 'rgba(16, 185, 129, 0.25)' : 'linear-gradient(135deg, #10B981, #059669)',
                                  color: '#FFF',
                                  fontWeight: 900,
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  boxShadow: approved ? 'none' : '0 6px 18px rgba(16, 185, 129, 0.4)'
                                }}
                              >
                                {approved ? '✅ Aprobada (Renovar 24h)' : '✅ APROBAR HISTORIA'}
                              </button>

                              <button
                                onClick={() => handleAdminReject(st)}
                                style={{
                                  flex: 1,
                                  minWidth: '170px',
                                  padding: '14px 18px',
                                  borderRadius: '14px',
                                  border: 'none',
                                  background: rejected ? 'rgba(239, 68, 68, 0.25)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
                                  color: '#FFF',
                                  fontWeight: 900,
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  boxShadow: rejected ? 'none' : '0 6px 18px rgba(239, 68, 68, 0.4)'
                                }}
                              >
                                ❌ NO APROBAR (OCULTAR)
                              </button>

                              <button
                                onClick={() => handleAdminDelete(st)}
                                style={{
                                  padding: '14px 18px',
                                  borderRadius: '14px',
                                  border: '1px solid rgba(239, 68, 68, 0.45)',
                                  background: 'rgba(239, 68, 68, 0.12)',
                                  color: '#F87171',
                                  fontWeight: 900,
                                  fontSize: '13.5px',
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Lightbox Zoom 100% Pantalla Completa */}
                  {adminZoomStory && (
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100005,
                        background: 'rgba(0, 0, 0, 0.97)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px'
                      }}
                      onClick={() => setAdminZoomStory(null)}
                    >
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1100px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ color: '#FFF', fontWeight: 900, fontSize: '16px' }}>
                          🔍 Vista Grande: {adminZoomStory.proName || 'Historia'}
                        </div>
                        <button
                          onClick={() => setAdminZoomStory(null)}
                          style={{ background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', fontWeight: 900, cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '12px 0' }} onClick={e => e.stopPropagation()}>
                        {(adminZoomStory.mediaType === 'video' || adminZoomStory.videoUrl) ? (
                          <video
                            src={adminZoomStory.videoUrl || adminZoomStory.imageUrl}
                            controls
                            autoPlay
                            playsInline
                            style={{ maxWidth: '96vw', maxHeight: '78vh', objectFit: 'contain', borderRadius: '14px' }}
                          />
                        ) : (
                          <img
                            src={adminZoomStory.imageUrl || adminZoomStory.mediaUrl}
                            alt="Zoom Historia"
                            style={{ maxWidth: '96vw', maxHeight: '78vh', objectFit: 'contain', borderRadius: '14px' }}
                          />
                        )}
                      </div>

                      <div style={{ width: '100%', maxWidth: '720px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            handleAdminApprove(adminZoomStory)
                            setAdminZoomStory(null)
                          }}
                          style={{ flex: 1, minWidth: '180px', padding: '14px 20px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFF', fontWeight: 900, fontSize: '15px', cursor: 'pointer' }}
                        >
                          ✅ APROBAR HISTORIA
                        </button>
                        <button
                          onClick={() => {
                            handleAdminReject(adminZoomStory)
                            setAdminZoomStory(null)
                          }}
                          style={{ flex: 1, minWidth: '180px', padding: '14px 20px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#FFF', fontWeight: 900, fontSize: '15px', cursor: 'pointer' }}
                        >
                          ❌ NO APROBAR
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
