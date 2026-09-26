import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { db } from '../firebase'
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp, onSnapshot } from 'firebase/firestore'
import recomendarIcon from '../assets/icons/recomendar.png'
import opinionesIcon from '../assets/icons/opiniones.png'
import compartirIcon from '../assets/icons/compartir.png'
import { getProPlanTheme } from '../planTheme'
import './Historias.css'

export default function HistoriasViewerModal({
  isOpen,
  onClose,
  stories = [],
  initialIndex = 0,
  userData,
  onHirePro,
  onViewProfile,
  navigate
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [likedStories, setLikedStories] = useState({})
  const [shareNotice, setShareNotice] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [floatingReaction, setFloatingReaction] = useState(null)
  
  const timerRef = useRef(null)
  const pressTimerRef = useRef(null)
  const recordedViewsRef = useRef(new Set())

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setIsPaused(false)
  }, [initialIndex, isOpen])

  // Load liked state from localStorage
  useEffect(() => {
    try {
      const savedLikes = JSON.parse(localStorage.getItem('listo_story_likes') || '{}')
      setLikedStories(savedLikes)
    } catch (e) {
      console.log('Error reading story likes:', e)
    }
  }, [])

  const [liveProPlan, setLiveProPlan] = useState(null)
  const currentStory = stories[currentIndex] || stories[0]
  const proUidKey = currentStory?.proId || currentStory?.proUid
  const proNameClean = String(currentStory?.proName || currentStory?.fullName || '').toLowerCase().trim()

  // Consulta en tiempo real a la colección users en Firestore para resolver el plan exacto del profesional
  useEffect(() => {
    setLiveProPlan(null)
    if (!proUidKey && !proNameClean) return

    let stored = {}
    try {
      stored = JSON.parse(localStorage.getItem('listoUserData') || '{}')
    } catch (e) {}

    const actUid = userData?.uid || userData?.id || stored?.uid || stored?.id
    const actName = String(userData?.name || stored?.name || '').toLowerCase().trim()

    // 1. Si la historia pertenece al usuario activo o se tienen sus datos directos
    if ((proUidKey && proUidKey === actUid) || (proNameClean && actName && (proNameClean === actName || actName.includes(proNameClean) || proNameClean.includes(actName)))) {
      const uPlan = userData?.currentPlan || userData?.planId || userData?.plan || userData?.membership || userData?.proPlan || userData?.subscription || userData?.userPlan || userData?.planName || userData?.tipoPlan || stored?.currentPlan || stored?.planId || stored?.plan || stored?.membership || stored?.proPlan || stored?.subscription || stored?.userPlan || stored?.planName || stored?.tipoPlan
      if (uPlan) {
        setLiveProPlan(uPlan)
      }
    }

    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      let foundPlan = null
      snap.forEach(uDoc => {
        const u = uDoc.data()
        const fetched = u.currentPlan || u.planId || u.plan || u.membership || u.proPlan || u.subscription || u.userPlan || u.planName || u.tipoPlan || u.tier
        if (!fetched) return

        // Coincidencia exacta por UID
        const uidMatch = Boolean(proUidKey && (uDoc.id === proUidKey || u.uid === proUidKey || u.id === proUidKey))

        if (uidMatch) {
          foundPlan = fetched
          return
        }

        // Coincidencia por Nombre completo solo si no tenemos UID match aún
        if (!foundPlan && proNameClean) {
          const nameClean = String(u.name || u.displayName || u.fullName || u.proName || u.nombre || u.proNombre || '').toLowerCase().trim()
          if (nameClean && nameClean === proNameClean) {
            foundPlan = fetched
          }
        }
      })

      if (foundPlan) {
        setLiveProPlan(foundPlan)
      }
    }, (err) => console.log('Notice reading users for plan:', err))

    return () => unsub()
  }, [proUidKey, proNameClean, userData])

  // PRIORIDAD SUPREMA: liveProPlan de la colección 'users' sobre la propiedad estática de la historia
  const resolvedPlan = liveProPlan || currentStory?.proPlan || currentStory?.plan || currentStory?.currentPlan || currentStory?.planId || currentStory?.membership || currentStory?.subscription || currentStory?.userPlan || currentStory?.planName
  const storyPlanTheme = getProPlanTheme(resolvedPlan, currentStory?.proRating || currentStory?.rating || 0)

  // Record story view counter
  useEffect(() => {
    if (!isOpen || !currentStory || !currentStory.id) return

    if (!recordedViewsRef.current.has(currentStory.id)) {
      recordedViewsRef.current.add(currentStory.id)
      try {
        const storyRef = doc(db, 'historias', currentStory.id)
        updateDoc(storyRef, { viewsCount: increment(1) }).catch(err => console.log('Views count update notice:', err))
      } catch (e) {}
    }
  }, [currentIndex, isOpen, currentStory])

  let storedUser = {}
  try {
    storedUser = JSON.parse(localStorage.getItem('listoUserData') || '{}')
  } catch (e) {}

  const activeUid = userData?.uid || userData?.id || storedUser?.uid || storedUser?.id || localStorage.getItem('listo_user_uid')
  const isOwner = Boolean(
    currentStory && (
      currentStory.proId === activeUid ||
      currentStory.proUid === activeUid ||
      userData?.email === 'listopatron.app@gmail.com'
    )
  )

  const handleDeleteStory = async (e) => {
    if (e) e.stopPropagation()
    if (!currentStory || !currentStory.id) return

    const confirmDelete = window.confirm('🗑️ ¿Estás seguro de que deseas eliminar esta historia de tu perfil?')
    if (!confirmDelete) return

    try {
      const storyRef = doc(db, 'historias', currentStory.id)
      await updateDoc(storyRef, { status: 'deleted', deletedAt: new Date().toISOString() })
      alert('🗑️ Historia eliminada correctamente.')

      if (stories.length <= 1) {
        onClose()
      } else {
        handleNextStory()
      }
    } catch (err) {
      console.error('Error deleting story:', err)
      alert('No se pudo eliminar la historia. Inténtalo de nuevo.')
    }
  }

  const isVideoStory = currentStory?.mediaType === 'video' || Boolean(currentStory?.videoUrl) || String(currentStory?.imageUrl || '').endsWith('.mp4')
  const storyDuration = isVideoStory ? (currentStory?.videoDuration ? currentStory.videoDuration * 1000 : 15000) : 5000

  // Auto-progress timer for stories (paused if user holds screen)
  useEffect(() => {
    if (!isOpen || stories.length === 0 || isPaused) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      handleNextStory()
    }, storyDuration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentIndex, isOpen, stories, storyDuration, isPaused])

  if (!isOpen || !stories || stories.length === 0) return null

  const handleNextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsPaused(false)
    } else {
      onClose()
    }
  }

  const handlePrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setIsPaused(false)
    }
  }

  // ── Hold to Pause Gestures ──
  const handlePressStart = () => {
    pressTimerRef.current = setTimeout(() => {
      setIsPaused(true)
    }, 180)
  }

  const handlePressEnd = () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current)
    if (isPaused) {
      setIsPaused(false)
    }
  }

  const handleLikeStory = async (e) => {
    if (e) e.stopPropagation()
    const storyId = currentStory.id
    const isNowLiked = !likedStories[storyId]

    const nextLikes = { ...likedStories, [storyId]: isNowLiked }
    setLikedStories(nextLikes)
    localStorage.setItem('listo_story_likes', JSON.stringify(nextLikes))

    if (isNowLiked) {
      triggerFloatingReaction('❤️')
      try {
        if (currentStory.id) {
          const storyRef = doc(db, 'historias', currentStory.id)
          updateDoc(storyRef, { likesCount: increment(1) }).catch(err => console.log('Story doc update error:', err))
        }

        const clientName = userData?.name || userData?.displayName || 'Un cliente'
        const proId = currentStory.proId || 'pro_unknown'
        const proName = currentStory.proName || 'un profesional'
        const specEs = currentStory.proCategory || 'Servicio'
        const city = userData?.ciudad || userData?.municipio || 'Santo Domingo'

        await addDoc(collection(db, 'likes'), {
          type: 'story_like',
          clientName: clientName,
          proId: proId,
          proName: proName,
          specEs: specEs,
          city: city,
          createdAt: serverTimestamp()
        })
      } catch (err) {
        console.error('Error recording story like:', err)
      }
    }
  }

  const triggerFloatingReaction = (emoji) => {
    setFloatingReaction(emoji)
    setTimeout(() => {
      setFloatingReaction(null)
    }, 1200)
  }

  const handleEmojiReaction = async (e, reactionObj) => {
    if (e) e.stopPropagation()
    const reactionValue = typeof reactionObj === 'object' ? reactionObj.icon : reactionObj
    const displayLabel = typeof reactionObj === 'object' ? (reactionObj.name || 'Reacción') : reactionObj

    triggerFloatingReaction(reactionValue)

    try {
      const clientName = userData?.name || userData?.displayName || 'Un cliente'
      const proId = currentStory.proId || 'pro_unknown'
      const proName = currentStory.proName || 'un profesional'
      const specEs = currentStory.proCategory || 'Servicio'
      const city = userData?.ciudad || userData?.municipio || 'Santo Domingo'

      await addDoc(collection(db, 'likes'), {
        type: 'story_reaction',
        reactionName: displayLabel,
        reactionIcon: reactionValue,
        clientName: clientName,
        proId: proId,
        proName: proName,
        specEs: specEs,
        city: city,
        createdAt: serverTimestamp()
      })

      await addDoc(collection(db, 'notificaciones'), {
        userId: proId,
        type: 'system',
        title: `Reacción ${displayLabel} en tu Historia`,
        text: `¡${clientName} reaccionó "${displayLabel}" a tu historia de trabajo de ${currentStory.proCategory}!`,
        date: new Date().toISOString(),
        read: false
      })
    } catch (err) {
      console.log('Error sending emoji reaction:', err)
    }
  }

  const handleShareStory = async (e) => {
    if (e) e.stopPropagation()
    const shareText = `Mira este trabajo realizado por ${currentStory.proName} (${currentStory.proCategory}) en Listo Patrón:`
    const shareUrl = window.location.origin

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Historia de Trabajo - ${currentStory.proName}`,
          text: shareText,
          url: shareUrl
        })
      } catch (err) {
        console.log('Share error:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
        setShareNotice(true)
        setTimeout(() => setShareNotice(false), 3000)
      } catch (err) {
        console.log('Clipboard error:', err)
      }
    }
  }

  const handleContratarClick = (e) => {
    if (e) e.stopPropagation()
    onClose()
    if (onHirePro) {
      onHirePro(currentStory.proId || currentStory.proUid, currentStory)
    }
  }

  const handleProClick = (e) => {
    if (e) e.stopPropagation()
    onClose()
    if (onViewProfile) {
      onViewProfile(currentStory)
    } else if (navigate) {
      const proData = {
        id: currentStory.proId || currentStory.proUid || currentStory.id,
        uid: currentStory.proId || currentStory.proUid || currentStory.id,
        name: currentStory.fullName || currentStory.proName,
        category: currentStory.proCategory,
        avatarUrl: currentStory.proAvatar,
        photoURL: currentStory.proAvatar
      }
      navigate('proProfile', proData)
    }
  }

  return createPortal(
    <div className="historias-viewer-overlay" onClick={onClose}>
      <div 
        className="historias-viewer-card" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      >
        {/* Paused Floating Indicator */}
        {isPaused && (
          <div className="historias-paused-indicator">
            <span>⏸️ Pausado</span>
          </div>
        )}

        {/* Floating Emoji Reaction Animation */}
        {floatingReaction && (
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(1)',
            fontSize: '80px',
            zIndex: 50,
            pointerEvents: 'none',
            animation: 'reactionPop 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }}>
            <style>{`
              @keyframes reactionPop {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
                40% { opacity: 1; transform: translate(-50%, -65%) scale(1.4); }
                100% { opacity: 0; transform: translate(-50%, -100%) scale(1.8); }
              }
            `}</style>
            {typeof floatingReaction === 'string' && (floatingReaction.startsWith('/emoji/') || floatingReaction.endsWith('.png')) ? (
              <img src={floatingReaction} alt="Reacción" style={{ width: '95px', height: '95px', objectFit: 'contain', filter: 'drop-shadow(0 6px 20px rgba(242,96,0,0.6))' }} />
            ) : (
              <span>{floatingReaction}</span>
            )}
          </div>
        )}

        {/* Top 5s / 15s progress bars */}
        <div className="historias-timer-container">
          {stories.map((story, idx) => {
            let statusClass = ''
            if (idx < currentIndex) statusClass = 'completed'
            else if (idx === currentIndex) statusClass = `active ${isPaused ? 'paused' : ''}`

            return (
              <div key={story.id || idx} className="historias-timer-segment">
                <div
                  className={`historias-timer-fill ${statusClass}`}
                  style={idx === currentIndex ? { animationDuration: `${storyDuration / 1000}s` } : {}}
                />
              </div>
            )
          })}
        </div>

        {/* Top Pro Info Header (Difuminado con color del plan del profesional) */}
        <div 
          className={`historias-viewer-header ${isPaused ? 'hidden-on-pause' : ''}`}
          style={{
            background: storyPlanTheme.headerGradient,
            borderBottom: storyPlanTheme.headerBorder,
            boxShadow: storyPlanTheme.headerGlow,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)'
          }}
        >
          <div className="historias-pro-info" onClick={handleProClick} style={{ cursor: 'pointer' }}>
            <img
              src={currentStory.proAvatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
              alt={currentStory.proName}
              className="historias-header-avatar"
              style={{ borderColor: storyPlanTheme.color, boxShadow: `0 0 10px ${storyPlanTheme.color}` }}
            />
            <div className="historias-header-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span className="historias-header-name">{currentStory.proName}</span>
                <span style={{ fontSize: '10px', background: storyPlanTheme.badgeBg, color: storyPlanTheme.badgeColor, padding: '2px 8px', borderRadius: '10px', fontWeight: 900, boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                  {storyPlanTheme.badge}
                </span>
                {(() => {
                  let expiresMs = 0
                  if (currentStory?.expiresAt) {
                    expiresMs = new Date(currentStory.expiresAt).getTime()
                  } else if (currentStory?.createdAt) {
                    expiresMs = new Date(currentStory.createdAt).getTime() + (24 * 60 * 60 * 1000)
                  } else {
                    expiresMs = Date.now() + (24 * 60 * 60 * 1000)
                  }
                  const remainingMs = expiresMs - Date.now()
                  if (remainingMs <= 0) return null
                  const h = Math.floor(remainingMs / (1000 * 60 * 60))
                  const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
                  const timeStr = h >= 1 ? `${h}h` : `${m}m`
                  return (
                    <span style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.25)', border: '1px solid rgba(245, 158, 11, 0.6)', color: '#FBBF24', padding: '2px 8px', borderRadius: '10px', fontWeight: 900 }}>
                      ⏱️ {timeStr} restantes
                    </span>
                  )
                })()}
                {isVideoStory && (
                  <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                    🎥 Video
                  </span>
                )}
              </div>
              <span className="historias-header-spec" style={{ color: 'rgba(255,255,255,0.9)' }}>
                ⚡ {currentStory.proCategory} {currentStory.proRating ? `• ⭐ ${currentStory.proRating}` : ''}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isOwner && (
              <button
                onClick={handleDeleteStory}
                style={{
                  background: 'rgba(239, 68, 68, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                  transition: 'transform 0.2s ease'
                }}
                title="Eliminar esta historia de tu perfil"
              >
                🗑️
              </button>
            )}
            <button className="historias-close-btn" onClick={onClose} title="Cerrar">
              ✕
            </button>
          </div>
        </div>

        {/* Story Media (Image or Video) */}
        <div className="historias-viewer-image-container">
          {/* Sello '⭐ Top Profesional' exclusivamente para usuarios con Plan VIP */}
          {storyPlanTheme.id === 'vip' && !isPaused && (
            <div style={{
              position: 'absolute',
              top: '85px',
              left: '16px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #F26000 100%)',
              color: '#FFFFFF',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '900',
              zIndex: 25,
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.6), 0 0 10px rgba(242, 96, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.3px'
            }}>
              <span>⭐</span>
              <span>Top Profesional</span>
            </div>
          )}

          {/* Offer Sticker (Sticker de Oferta Flash 24h) */}
          {currentStory?.offerSticker && (
            <div style={{
              position: 'absolute',
              top: '80px',
              right: '16px',
              background: 'linear-gradient(135deg, #EF4444, #F26000)',
              color: '#FFFFFF',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '900',
              zIndex: 30,
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.6), 0 0 12px rgba(242, 96, 0, 0.5)',
              border: '2px solid #FFFFFF',
              animation: 'stickerPulse 1.6s ease-in-out infinite alternate',
              letterSpacing: '0.4px'
            }}>
              <style>{`
                @keyframes stickerPulse {
                  0% { transform: scale(0.96) rotate(-2deg); }
                  100% { transform: scale(1.06) rotate(2deg); }
                }
              `}</style>
              {currentStory.offerSticker}
            </div>
          )}

          {isVideoStory ? (
            <video
              src={currentStory.videoUrl || currentStory.imageUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="historias-viewer-image"
              onLoadedMetadata={(e) => {
                if (currentStory.trimStart && currentStory.trimStart > 0) {
                  e.target.currentTime = currentStory.trimStart
                }
              }}
              onTimeUpdate={(e) => {
                if (currentStory.trimEnd && e.target.currentTime >= currentStory.trimEnd) {
                  e.target.currentTime = currentStory.trimStart || 0
                }
              }}
            />
          ) : (
            <img
              src={currentStory.imageUrl}
              alt="Trabajo realizado"
              className="historias-viewer-image"
            />
          )}

          {/* Mute / Unmute Floating Control for Video Stories */}
          {isVideoStory && !isPaused && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
              style={{
                position: 'absolute',
                top: '75px',
                right: '16px',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                color: '#fff',
                fontSize: '16px',
                cursor: 'pointer',
                zIndex: 25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          )}

          {/* Left/Right Touch Controls for navigation */}
          <div className="historias-nav-touch-left" onClick={handlePrevStory} />
          <div className="historias-nav-touch-right" onClick={handleNextStory} />
        </div>

        {/* Copied Notice Banner */}
        {shareNotice && (
          <div style={{
            position: 'absolute',
            bottom: '180px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            zIndex: 40
          }}>
            📋 ¡Enlace copiado al portapapeles!
          </div>
        )}

        {/* Bottom Actions Container (Caption + Views + Reactions + Contratar, Like, Share) */}
        <div className={`historias-bottom-container ${isPaused ? 'hidden-on-pause' : ''}`}>

          {/* Caption Box Overlay */}
          {currentStory.caption && (
            <div className="historias-caption-box">
              <p className="historias-caption-text">{currentStory.caption}</p>
            </div>
          )}

          {/* Contador de Vistas (Informativo y Privado sin comunicación directa) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            margin: '0 2px 2px 2px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '6px' }}>
              👁️ {currentStory.viewsCount || 1} { (currentStory.viewsCount === 1) ? 'persona ha visto tu historia' : 'personas han visto tu historia' }
            </span>
            <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>
              🔒 Registro Privado
            </span>
          </div>
          
          {/* Fast Reaction Emojis Bar (WhatsApp Style - All 19 Custom PNG Emojis) */}
          <div className="historias-reactions-bar">
            {[
              { id: 'like', name: 'Me gusta', icon: '/emoji/like.png' },
              { id: 'trato', name: 'Trato Hecho', icon: '/emoji/trato hecho.png' },
              { id: 'estrellas', name: '5 Estrellas', icon: '/emoji/5 estrella.png' },
              { id: 'contratar', name: 'Contratar', icon: '/emoji/contratar.png' },
              { id: 'listo', name: 'Listo Patrón', icon: '/emoji/listo patron.png' },
              { id: 'listo2', name: 'Listo Patrón 2', icon: '/emoji/listo patron 2.png' },
              { id: 'e1', name: 'Emoji 1', icon: '/emoji/1.png' },
              { id: 'e2', name: 'Emoji 2', icon: '/emoji/2.png' },
              { id: 'e3', name: 'Emoji 3', icon: '/emoji/3.png' },
              { id: 'e4', name: 'Emoji 4', icon: '/emoji/4.png' },
              { id: 'e5', name: 'Emoji 5', icon: '/emoji/5.png' },
              { id: 'e6', name: 'Emoji 6', icon: '/emoji/6.png' },
              { id: 'e7', name: 'Emoji 7', icon: '/emoji/7.png' },
              { id: 'e8', name: 'Emoji 8', icon: '/emoji/8.png' },
              { id: 'e9', name: 'Emoji 9', icon: '/emoji/9.png' },
              { id: 'e10', name: 'Emoji 10', icon: '/emoji/10.png' },
              { id: 'e11', name: 'Emoji 11', icon: '/emoji/11.png' },
              { id: 'e12', name: 'Emoji 12', icon: '/emoji/12.png' },
              { id: 'e13', name: 'Emoji 13', icon: '/emoji/13.png' }
            ].map((item) => (
              <button
                key={item.id}
                className="btn-emoji-reaction"
                onClick={(e) => handleEmojiReaction(e, item)}
                title={item.name}
              >
                <img src={item.icon} alt={item.name} className="emoji-png-icon" />
              </button>
            ))}
          </div>

          {/* Main Action Buttons */}
          <div className="historias-bottom-bar">
            <button
              className="btn-historia-action perfil"
              onClick={handleProClick}
            >
              <span style={{ fontSize: '15px' }}>👤</span>
              Ver Perfil
            </button>

            <button
              className="btn-historia-action contratar-filled"
              onClick={handleContratarClick}
            >
              <span style={{ fontSize: '15px' }}>⚡</span>
              Contratar
            </button>

            <button
              className={`btn-historia-action like ${likedStories[currentStory.id] ? 'liked' : ''}`}
              onClick={handleLikeStory}
            >
              <img src={opinionesIcon} alt="Me gusta" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
              Me gusta
            </button>

            <button
              className="btn-historia-action share"
              onClick={handleShareStory}
            >
              <img src={compartirIcon} alt="Compartir" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
              Compartir
            </button>
          </div>

        </div>

      </div>
    </div>,
    document.body
  )
}
