import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { db } from '../firebase'
import { collection, addDoc, doc, updateDoc, deleteDoc, increment, serverTimestamp, onSnapshot } from 'firebase/firestore'
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
  const [floatingParticles, setFloatingParticles] = useState([])
  const [liveLikesCount, setLiveLikesCount] = useState(0)
  const [liveProPlan, setLiveProPlan] = useState(null)
  const [liveProAvatar, setLiveProAvatar] = useState(undefined)

  const timerRef = useRef(null)
  const pressTimerRef = useRef(null)
  const recordedViewsRef = useRef(new Set())
  const lastTapRef = useRef(0)

  // Filtro estricto de seguridad: Solo permitir visualizar historias APROBADAS por el Administrador
  const validStories = (stories || []).filter(s => {
    if (!s) return false
    const isRejected = s.status === 'rejected' || s.moderated === 'rejected' || s.rejected === true
    const isPending = !isRejected && (s.status === 'pending' || s.approved !== true || s.status !== 'approved' || s.validada === false || s.moderated === false)
    return !isRejected && !isPending && s.status === 'approved' && s.approved === true
  })

  const currentStory = validStories[currentIndex] || validStories[0] || null
  const currentStoryId = currentStory?.id || null
  const proUidKey = currentStory?.proId || currentStory?.proUid
  const normKey = (str) => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim()
  const proNameClean = normKey(currentStory?.proName || currentStory?.fullName || '')

  const isRealProfilePhoto = (url) => Boolean(
    url &&
    typeof url === 'string' &&
    url.trim() !== '' &&
    !url.includes('randomuser.me') &&
    !url.includes('pravatar.cc') &&
    !url.includes('ui-avatars.com')
  )

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setIsPaused(false)
  }, [initialIndex, isOpen])

  // Escuchar en tiempo real los likes y reacciones de la historia actual en Firestore
  useEffect(() => {
    if (!currentStoryId) {
      setLiveLikesCount(0)
      return
    }
    setLiveLikesCount(currentStory?.likesCount || 0)
    const storyDocRef = doc(db, 'historias', currentStoryId)
    const unsub = onSnapshot(storyDocRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data()
        if (typeof d?.likesCount === 'number') {
          setLiveLikesCount(d.likesCount)
        }
      }
    }, () => {})
    return () => unsub()
  }, [currentStoryId])

  // Load liked state from localStorage
  useEffect(() => {
    try {
      const savedLikes = JSON.parse(localStorage.getItem('listo_story_likes') || '{}')
      setLikedStories(savedLikes)
    } catch (e) {
      console.log('Error reading story likes:', e)
    }
  }, [])

  // Consulta en tiempo real a la colección users en Firestore para resolver el plan y la foto real del profesional
  useEffect(() => {
    setLiveProPlan(null)
    setLiveProAvatar(undefined)
    if (!proUidKey && !proNameClean) return

    let stored = {}
    try {
      stored = JSON.parse(localStorage.getItem('listoUserData') || '{}')
    } catch (e) {}

    const actUid = userData?.uid || userData?.id || stored?.uid || stored?.id
    const actName = normKey(userData?.name || stored?.name || '')

    // 1. Si la historia pertenece al usuario activo o se tienen sus datos directos
    if ((proUidKey && proUidKey === actUid) || (proNameClean && actName && (proNameClean === actName || actName.includes(proNameClean) || proNameClean.includes(actName)))) {
      const uPlan = userData?.currentPlan || userData?.planId || userData?.plan || userData?.membership || userData?.proPlan || userData?.subscription || userData?.userPlan || userData?.planName || userData?.tipoPlan || stored?.currentPlan || stored?.planId || stored?.plan || stored?.membership || stored?.proPlan || stored?.subscription || stored?.userPlan || stored?.planName || stored?.tipoPlan
      if (uPlan) {
        setLiveProPlan(uPlan)
      }
      const actRawPhoto = userData?.photoURL || userData?.avatarUrl || userData?.profilePhoto || stored?.photoURL || stored?.avatarUrl || ''
      if (isRealProfilePhoto(actRawPhoto)) {
        setLiveProAvatar(actRawPhoto.trim())
      }
    }

    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      let foundPlan = null
      let foundPhoto = null
      snap.forEach(uDoc => {
        const u = uDoc.data()
        const fetched = u.currentPlan || u.planId || u.plan || u.membership || u.proPlan || u.subscription || u.userPlan || u.planName || u.tipoPlan || u.tier
        const rawPhoto = u.photoURL || u.avatarUrl || u.profilePhoto || u.img || u.logo || ''
        const realPhoto = isRealProfilePhoto(rawPhoto) ? rawPhoto.trim() : null

        // Coincidencia exacta por UID
        const uidMatch = Boolean(proUidKey && (uDoc.id === proUidKey || u.uid === proUidKey || u.id === proUidKey))

        if (uidMatch) {
          if (fetched) foundPlan = fetched
          if (realPhoto) foundPhoto = realPhoto
          return
        }

        // Coincidencia por Nombre completo (sin tildes) solo si no tenemos match aún
        if (proNameClean) {
          const nameClean = normKey(u.name || u.displayName || u.fullName || u.proName || u.nombre || u.proNombre || u.verificacion?.nombre || '')
          if (nameClean && nameClean === proNameClean) {
            if (fetched && !foundPlan) foundPlan = fetched
            if (realPhoto && !foundPhoto) foundPhoto = realPhoto
          }
        }
      })

      if (foundPlan) {
        setLiveProPlan(foundPlan)
      }
      if (foundPhoto) {
        setLiveProAvatar(foundPhoto)
      }
    }, (err) => console.log('Notice reading users for plan:', err))

    return () => unsub()
  }, [proUidKey, proNameClean, userData])

  // PRIORIDAD SUPREMA: liveProPlan de la colección 'users' sobre la propiedad estática de la historia
  const resolvedPlan = liveProPlan || currentStory?.proPlan || currentStory?.plan || currentStory?.currentPlan || currentStory?.planId || currentStory?.membership || currentStory?.subscription || currentStory?.userPlan || currentStory?.planName
  const storyPlanTheme = getProPlanTheme(resolvedPlan, currentStory?.proRating || currentStory?.rating || 0)
  const isListoBrand = proNameClean.includes('listo patron') || proNameClean.includes('listo patrón')
  const resolvedProAvatar = liveProAvatar || (isRealProfilePhoto(currentStory?.proAvatar) ? currentStory.proAvatar : null) || (isListoBrand ? '/logo192.png' : null)

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
  const storyOwnerUid = currentStory?.proId || currentStory?.proUid || currentStory?.userId || currentStory?.uid

  const isOwner = Boolean(
    currentStory && (
      (activeUid && storyOwnerUid && String(activeUid).trim() === String(storyOwnerUid).trim()) ||
      (userData?.email === 'listopatron.app@gmail.com' || userData?.role === 'admin')
    )
  )

  const handleDeleteStory = async (e) => {
    if (e) e.stopPropagation()
    if (!currentStory || !currentStory.id) return

    const confirmDelete = window.confirm('🗑️ ¿Estás seguro de que deseas eliminar esta historia de tu perfil antes de que transcurran las 24 horas?')
    if (!confirmDelete) return

    try {
      const storyRef = doc(db, 'historias', currentStory.id)
      await updateDoc(storyRef, { 
        status: 'deleted', 
        moderated: false,
        deletedAt: new Date().toISOString(),
        expiresAt: new Date(0).toISOString()
      })

      deleteDoc(storyRef).catch(() => {})

      alert('🗑️ Tu historia ha sido eliminada correctamente de la plataforma.')

      if (validStories.length <= 1) {
        onClose()
      } else {
        handleNextStory()
      }
    } catch (err) {
      console.error('Error deleting story:', err)
      try {
        await deleteDoc(doc(db, 'historias', currentStory.id))
        alert('🗑️ Historia eliminada correctamente.')
        if (validStories.length <= 1) onClose()
        else handleNextStory()
      } catch (e2) {
        alert('No se pudo eliminar la historia. Inténtalo de nuevo.')
      }
    }
  }

  const isVideoStory = currentStory?.mediaType === 'video' || Boolean(currentStory?.videoUrl) || String(currentStory?.imageUrl || '').endsWith('.mp4')
  const storyDuration = isVideoStory ? (currentStory?.videoDuration ? currentStory.videoDuration * 1000 : 15000) : 4000

  // Auto-progress timer for stories (paused if user holds screen)
  useEffect(() => {
    if (!isOpen || validStories.length === 0 || isPaused) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      handleNextStory()
    }, storyDuration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentIndex, isOpen, validStories, storyDuration, isPaused])

  if (!isOpen || !validStories || validStories.length === 0) return null

  const handleNextStory = () => {
    if (currentIndex < validStories.length - 1) {
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
    if (!currentStory?.id) return
    const storyId = currentStory.id
    const isNowLiked = !likedStories[storyId]

    const nextLikes = { ...likedStories, [storyId]: isNowLiked }
    setLikedStories(nextLikes)
    localStorage.setItem('listo_story_likes', JSON.stringify(nextLikes))
    setLiveLikesCount(prev => Math.max(0, isNowLiked ? prev + 1 : prev - 1))

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
    } else {
      if (currentStory.id) {
        const storyRef = doc(db, 'historias', currentStory.id)
        updateDoc(storyRef, { likesCount: increment(-1) }).catch(() => {})
      }
    }
  }

  const triggerFloatingReaction = (emoji) => {
    // 1. Pop central grande en pantalla
    setFloatingReaction(emoji)
    setTimeout(() => {
      setFloatingReaction(null)
    }, 1200)

    // 2. Stream de 9 partículas flotantes que suben y se desvanecen estilo WhatsApp / Instagram
    const count = 9
    const newParticles = Array.from({ length: count }).map((_, idx) => {
      const randomLeft = 18 + Math.random() * 64 // De 18% a 82% en horizontal
      const randomSway = (Math.random() - 0.5) * 80
      const randomDuration = 1.4 + Math.random() * 0.7
      const randomDelay = idx * 0.08
      const randomSize = 36 + Math.random() * 24
      const randomRotStart = (Math.random() - 0.5) * 30
      const randomRotEnd = (Math.random() - 0.5) * 60

      return {
        id: `${Date.now()}_${idx}_${Math.random()}`,
        emoji,
        left: `${randomLeft}%`,
        sway: `${randomSway}px`,
        duration: `${randomDuration}s`,
        delay: `${randomDelay}s`,
        size: `${randomSize}px`,
        rotStart: `${randomRotStart}deg`,
        rotEnd: `${randomRotEnd}deg`
      }
    })

    setFloatingParticles(prev => [...prev, ...newParticles])
    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)))
    }, 2800)
  }

  const handleEmojiReaction = async (e, reactionObj) => {
    if (e) e.stopPropagation()
    const reactionValue = typeof reactionObj === 'object' ? reactionObj.icon : reactionObj
    const displayLabel = typeof reactionObj === 'object' ? (reactionObj.name || 'Reacción') : reactionObj

    triggerFloatingReaction(reactionValue)

    // Sumar interacción en tiempo real y en Firestore
    setLiveLikesCount(prev => prev + 1)
    if (currentStory?.id) {
      const storyRef = doc(db, 'historias', currentStory.id)
      updateDoc(storyRef, { likesCount: increment(1) }).catch(() => {})
    }

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

        {/* Stream de Emojis/Corazones Flotantes estilo WhatsApp (suben y se desvanecen hacia arriba) */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 65 }}>
          <style>{`
            @keyframes whatsappFloatUpFade {
              0% {
                opacity: 0;
                transform: translateY(0) scale(0.3) rotate(var(--rot-start, 0deg));
              }
              15% {
                opacity: 1;
                transform: translateY(-50px) scale(1.15) rotate(var(--rot-start, -10deg));
              }
              50% {
                opacity: 0.95;
                transform: translateY(-220px) translateX(var(--sway, 0px)) scale(1.05);
              }
              80% {
                opacity: 0.75;
                transform: translateY(-400px) translateX(calc(var(--sway, 0px) * 1.4)) scale(0.9);
              }
              100% {
                opacity: 0;
                transform: translateY(-600px) translateX(calc(var(--sway, 0px) * 1.8)) scale(0.65) rotate(var(--rot-end, 15deg));
              }
            }
          `}</style>
          {floatingParticles.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                bottom: '120px',
                left: p.left,
                fontSize: p.size,
                '--sway': p.sway,
                '--rot-start': p.rotStart,
                '--rot-end': p.rotEnd,
                animation: `whatsappFloatUpFade ${p.duration} cubic-bezier(0.25, 1, 0.5, 1) ${p.delay} forwards`,
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
              }}
            >
              {typeof p.emoji === 'string' && (p.emoji.startsWith('/emoji/') || p.emoji.endsWith('.png')) ? (
                <img src={p.emoji} alt="Reacción" style={{ width: p.size, height: p.size, objectFit: 'contain' }} />
              ) : (
                <span>{p.emoji}</span>
              )}
            </div>
          ))}
        </div>

        {/* Floating Emoji Reaction Pop Central */}
        {floatingReaction && (
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(1)',
            fontSize: '85px',
            zIndex: 66,
            pointerEvents: 'none',
            animation: 'reactionPop 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }}>
            <style>{`
              @keyframes reactionPop {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
                40% { opacity: 1; transform: translate(-50%, -65%) scale(1.35); }
                100% { opacity: 0; transform: translate(-50%, -110%) scale(1.7); }
              }
            `}</style>
            {typeof floatingReaction === 'string' && (floatingReaction.startsWith('/emoji/') || floatingReaction.endsWith('.png')) ? (
              <img src={floatingReaction} alt="Reacción" style={{ width: '100px', height: '100px', objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(242,96,0,0.7))' }} />
            ) : (
              <span>{floatingReaction}</span>
            )}
          </div>
        )}

        {/* Top 5s / 15s progress bars */}
        <div className="historias-timer-container">
          {validStories.map((story, idx) => {
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
            {resolvedProAvatar ? (
              <img
                src={resolvedProAvatar}
                alt={currentStory.proName}
                className="historias-header-avatar"
                style={{ borderColor: storyPlanTheme.color, boxShadow: `0 0 10px ${storyPlanTheme.color}` }}
              />
            ) : (
              <div
                className="historias-header-avatar no-photo-placeholder"
                style={{ borderColor: storyPlanTheme.color, boxShadow: `0 0 10px ${storyPlanTheme.color}` }}
                aria-label="Perfil sin foto"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '68%', height: '68%', marginTop: '12%' }}>
                  <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                </svg>
              </div>
            )}
            <div className="historias-header-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span className="historias-header-name">{currentStory.proName}</span>
                <span style={{ fontSize: '10px', background: storyPlanTheme.badgeBg, color: storyPlanTheme.badgeColor, padding: '2px 8px', borderRadius: '10px', fontWeight: 900, boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                  {storyPlanTheme.badge}
                </span>
                {liveLikesCount > 0 && (
                  <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.35)', border: '1px solid rgba(239, 68, 68, 0.7)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '10px', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '3px', boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)' }}>
                    ❤️ {liveLikesCount} {liveLikesCount === 1 ? 'me gusta' : 'me gusta'}
                  </span>
                )}
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
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.6)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 14px rgba(239, 68, 68, 0.85), 0 4px 12px rgba(0, 0, 0, 0.4)',
                  transition: 'transform 0.2s ease',
                  zIndex: 35
                }}
                title="🗑️ Eliminar tu historia antes de las 24 horas"
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
        <div className="historias-viewer-image-container" onDoubleClick={handleLikeStory}>
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
            <div 
              onClick={handleContratarClick}
              style={{
                position: 'absolute',
                top: '80px',
                right: '16px',
                background: 'linear-gradient(135deg, #EF4444, #F26000)',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: '24px',
                fontSize: '12px',
                fontWeight: '900',
                zIndex: 35,
                boxShadow: '0 6px 22px rgba(239, 68, 68, 0.7), 0 0 16px rgba(242, 96, 0, 0.6)',
                border: '2px solid #FFFFFF',
                animation: 'stickerPulse 1.6s ease-in-out infinite alternate',
                letterSpacing: '0.4px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Toca para solicitar esta oferta directamente"
            >
              <style>{`
                @keyframes stickerPulse {
                  0% { transform: scale(0.96) rotate(-2deg); }
                  100% { transform: scale(1.06) rotate(2deg); }
                }
              `}</style>
              <span>{currentStory.offerSticker}</span>
              <span style={{
                background: '#FFFFFF',
                color: '#DC2626',
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '900',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}>
                ⚡ Solicitar esta Oferta ›
              </span>
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

          {/* Contador de Vistas y Likes (SOLO VISIBLE PARA EL DUEÑO DE LA HISTORIA) */}
          {isOwner && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              margin: '0 2px 4px 2px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  👁️ {currentStory.viewsCount || 1} { (currentStory.viewsCount === 1) ? 'vista' : 'vistas' }
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#F87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ❤️ {liveLikesCount} { liveLikesCount === 1 ? 'me gusta' : 'me gusta' }
                </span>
              </div>
              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>
                🔒 Estadísticas
              </span>
            </div>
          )}
          
          {/* Fast Reaction Emojis Bar (WhatsApp Style - Emojis y PNGs) */}
          <div className="historias-reactions-bar">
            {[
              { id: 'heart', name: 'Corazón', icon: '❤️' },
              { id: 'fire', name: 'Fuego', icon: '🔥' },
              { id: 'applause', name: 'Aplausos', icon: '👏' },
              { id: 'star', name: 'Estrellas', icon: '⭐' },
              { id: 'party', name: 'Fiesta', icon: '🎉' },
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
                {typeof item.icon === 'string' && (item.icon.startsWith('/emoji/') || item.icon.endsWith('.png')) ? (
                  <img src={item.icon} alt={item.name} className="emoji-png-icon" />
                ) : (
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.icon}</span>
                )}
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
              className={`btn-historia-action like ${Boolean(currentStory?.id && likedStories[currentStory.id]) ? 'liked' : ''}`}
              onClick={handleLikeStory}
              style={Boolean(currentStory?.id && likedStories[currentStory.id]) ? {
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(220, 38, 38, 0.5))',
                borderColor: '#EF4444',
                color: '#FFFFFF'
              } : {}}
            >
              <span style={{ fontSize: '18px', transform: Boolean(currentStory?.id && likedStories[currentStory.id]) ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                {Boolean(currentStory?.id && likedStories[currentStory.id]) ? '❤️' : '🤍'}
              </span>
              <span>{liveLikesCount > 0 ? `${liveLikesCount} ` : ''}Me gusta</span>
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
