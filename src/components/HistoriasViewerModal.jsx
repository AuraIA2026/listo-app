import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { db } from '../firebase'
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
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

  const currentStory = stories[currentIndex] || stories[0]
  const storyPlanTheme = getProPlanTheme(
    currentStory?.proPlan || currentStory?.plan || currentStory?.subscription,
    currentStory?.proRating || currentStory?.rating || 0
  )

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

  const handleEmojiReaction = async (e, emoji) => {
    if (e) e.stopPropagation()
    triggerFloatingReaction(emoji)

    try {
      const clientName = userData?.name || userData?.displayName || 'Un cliente'
      const proId = currentStory.proId || 'pro_unknown'
      const proName = currentStory.proName || 'un profesional'

      await addDoc(collection(db, 'notificaciones'), {
        userId: proId,
        type: 'system',
        title: `Reacción ${emoji} en tu Historia`,
        text: `¡${clientName} reaccionó ${emoji} a tu historia de trabajo "${currentStory.proCategory}"!`,
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
            {floatingReaction}
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

        {/* Caption Box Overlay */}
        {currentStory.caption && (
          <div className={`historias-caption-box ${isPaused ? 'hidden-on-pause' : ''}`}>
            <p className="historias-caption-text">{currentStory.caption}</p>
          </div>
        )}

        {/* Copied Notice Banner */}
        {shareNotice && (
          <div style={{
            position: 'absolute',
            bottom: '125px',
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

        {/* Bottom Actions Container (Reactions + Contratar, Like, Share) */}
        <div className={`historias-bottom-container ${isPaused ? 'hidden-on-pause' : ''}`}>

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
          
          {/* Fast Reaction Emojis Bar (1-Tap) */}
          <div className="historias-reactions-bar">
            {['❤️', '🔥', '👏', '💯', '⭐'].map((emoji) => (
              <button
                key={emoji}
                className="btn-emoji-reaction"
                onClick={(e) => handleEmojiReaction(e, emoji)}
                title={`Reaccionar ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Main Action Buttons */}
          <div className="historias-bottom-bar">
            <button
              className="btn-historia-action contratar"
              onClick={handleContratarClick}
            >
              <img src={recomendarIcon} alt="Contratar" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              Contratar
            </button>

            <button
              className={`btn-historia-action like ${likedStories[currentStory.id] ? 'liked' : ''}`}
              onClick={handleLikeStory}
            >
              <img src={opinionesIcon} alt="Me gusta" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              Me gusta
            </button>

            <button
              className="btn-historia-action share"
              onClick={handleShareStory}
            >
              <img src={compartirIcon} alt="Compartir" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              Compartir
            </button>
          </div>

        </div>

      </div>
    </div>,
    document.body
  )
}
