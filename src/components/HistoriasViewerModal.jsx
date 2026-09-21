import React, { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import './Historias.css'

export default function HistoriasViewerModal({
  isOpen,
  onClose,
  stories = [],
  initialIndex = 0,
  userData,
  onHirePro
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [likedStories, setLikedStories] = useState({})
  const [shareNotice, setShareNotice] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    setCurrentIndex(initialIndex)
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

  // Auto-progress timer for stories (5 seconds per story)
  useEffect(() => {
    if (!isOpen || stories.length === 0) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      handleNextStory()
    }, 5000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentIndex, isOpen, stories])

  if (!isOpen || !stories || stories.length === 0) return null

  const currentStory = stories[currentIndex] || stories[0]

  const handleNextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      onClose()
    }
  }

  const handlePrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
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
      try {
        // Increment story likes in doc
        if (currentStory.id) {
          const storyRef = doc(db, 'historias', currentStory.id)
          updateDoc(storyRef, { likesCount: increment(1) }).catch(err => console.log('Story doc update error:', err))
        }

        // Add to real-time likes feed for toast notification on home/search pages
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

  return (
    <div className="historias-viewer-overlay" onClick={onClose}>
      <div className="historias-viewer-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Top 5-second progress bars */}
        <div className="historias-timer-container">
          {stories.map((story, idx) => {
            let statusClass = ''
            if (idx < currentIndex) statusClass = 'completed'
            else if (idx === currentIndex) statusClass = 'active'

            return (
              <div key={story.id || idx} className="historias-timer-segment">
                <div className={`historias-timer-fill ${statusClass}`} />
              </div>
            )
          })}
        </div>

        {/* Top Pro Info Header */}
        <div className="historias-viewer-header">
          <div className="historias-pro-info">
            <img
              src={currentStory.proAvatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
              alt={currentStory.proName}
              className="historias-header-avatar"
            />
            <div className="historias-header-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="historias-header-name">{currentStory.proName}</span>
                <span style={{ fontSize: '10px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                  ⭐ 5.0
                </span>
              </div>
              <span className="historias-header-spec">⚡ {currentStory.proCategory} • Entrega 5★</span>
            </div>
          </div>
          <button className="historias-close-btn" onClick={onClose} title="Cerrar">
            ✕
          </button>
        </div>

        {/* Story Image */}
        <div className="historias-viewer-image-container">
          <img
            src={currentStory.imageUrl}
            alt="Trabajo realizado"
            className="historias-viewer-image"
          />

          {/* Left/Right Touch Controls for navigation */}
          <div className="historias-nav-touch-left" onClick={handlePrevStory} />
          <div className="historias-nav-touch-right" onClick={handleNextStory} />
        </div>

        {/* Caption Box Overlay */}
        {currentStory.caption && (
          <div className="historias-caption-box">
            <p className="historias-caption-text">{currentStory.caption}</p>
          </div>
        )}

        {/* Copied Notice Banner */}
        {shareNotice && (
          <div style={{
            position: 'absolute',
            bottom: '85px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            zIndex: 30
          }}>
            📋 ¡Enlace copiado al portapapeles!
          </div>
        )}

        {/* STRICTLY 3 ACTION BUTTONS AT BOTTOM (CONTRATAR, ME GUSTA, COMPARTIR) - NO MESSAGE OPTION */}
        <div className="historias-bottom-bar">
          <button
            className="btn-historia-action contratar"
            onClick={handleContratarClick}
          >
            ⚡ Contratar
          </button>

          <button
            className={`btn-historia-action like ${likedStories[currentStory.id] ? 'liked' : ''}`}
            onClick={handleLikeStory}
          >
            {likedStories[currentStory.id] ? '❤️ Me gusta' : '🤍 Me gusta'}
          </button>

          <button
            className="btn-historia-action share"
            onClick={handleShareStory}
          >
            🔗 Compartir
          </button>
        </div>

      </div>
    </div>
  )
}
