import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { db } from '../firebase'
import { collection, query, getDocs, onSnapshot } from 'firebase/firestore'
import HistoriasViewerModal from './HistoriasViewerModal'
import SubirHistoriaModal from './SubirHistoriaModal'
import './Historias.css'

export default function HistoriasCarrusel({ userData, isPro, onHirePro, navigate }) {
  const [stories, setStories] = useState([])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [has5StarContract, setHas5StarContract] = useState(false)
  const [showLockNotice, setShowLockNotice] = useState(false)

  const trackRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const isProUser = isPro || userData?.role === 'pro' || userData?.type === 'pro' || localStorage.getItem('forceListoPro') === 'true'

  // Verification if the professional has at least one 5-star completed contract
  useEffect(() => {
    const proId = userData?.uid || userData?.id
    if (!proId || !isProUser) return

    const check5StarContract = async () => {
      try {
        const qOrders = query(collection(db, 'orders'), where('proId', '==', proId))
        const snap = await getDocs(qOrders)
        let found5Star = false
        snap.forEach(doc => {
          const data = doc.data()
          if (data.rated && Number(data.ratingScore) >= 5) {
            found5Star = true
          }
        })

        if (Number(userData?.rating) >= 5.0 || userData?.completed5StarCount > 0 || userData?.has5StarContract) {
          found5Star = true
        }

        setHas5StarContract(found5Star)
      } catch (err) {
        console.log('Error checking 5-star contracts:', err)
      }
    }

    check5StarContract()
  }, [userData, isProUser])

  // Real-time listener for stories from Firestore
  useEffect(() => {
    const qStories = query(collection(db, 'historias'))
    const unsubscribe = onSnapshot(qStories, (snapshot) => {
      const fetched = []
      const now = new Date().getTime()

      snapshot.forEach(doc => {
        const data = doc.data()
        const expiresTime = data.expiresAt ? new Date(data.expiresAt).getTime() : now + 86400000
        if (expiresTime > now - 86400000) {
          fetched.push({ id: doc.id, ...data })
        }
      })

      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      const sampleStories = [
        {
          id: 'sample_1',
          proId: 'pro_demo_1',
          proName: 'M&M Smart Phone',
          fullName: 'M&M Smart Phone',
          proAvatar: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80',
          proCategory: 'Reparación de Celulares',
          imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
          caption: '📱 Cambio de pantalla AMOLED & batería para iPhone 15 Pro Max listo en 20 mins.',
          likesCount: 38,
          createdAt: new Date().toISOString()
        },
        {
          id: 'sample_2',
          proId: 'pro_demo_2',
          proName: 'E-Business Store',
          fullName: 'E-Business Store',
          proAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          proCategory: 'Soporte Técnico VIP',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          caption: '💻 Instalación y optimización de redes de fibra óptica en torre residencial.',
          likesCount: 45,
          createdAt: new Date().toISOString()
        },
        {
          id: 'sample_3',
          proId: 'pro_demo_3',
          proName: 'Control Pizza Burger',
          fullName: 'Control Pizza Burger',
          proAvatar: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=200&q=80',
          proCategory: 'Chef & Catering 24h',
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
          caption: '🍕 Servicio VIP de Pizza Artesanal a la leña para eventos corporativos.',
          likesCount: 62,
          createdAt: new Date().toISOString()
        },
        {
          id: 'sample_4',
          proId: 'pro_demo_4',
          proName: 'Carlos Santana',
          fullName: 'Carlos Santana',
          proAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          proCategory: 'Electricista Certificado',
          imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
          caption: '⚡ Montaje de breakers inteligentes y luces LED ocultas en techo flotante.',
          likesCount: 29,
          createdAt: new Date().toISOString()
        },
        {
          id: 'sample_5',
          proId: 'pro_demo_5',
          proName: 'Roan Rafael',
          fullName: 'Roan Rafael',
          proAvatar: 'https://randomuser.me/api/portraits/men/46.jpg',
          proCategory: 'Plomería & Tuberías',
          imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
          caption: '🔧 Detección de fugas de agua no destructiva con escáner ultrasónico.',
          likesCount: 51,
          createdAt: new Date().toISOString()
        },
        {
          id: 'sample_6',
          proId: 'pro_demo_6',
          proName: 'Oscar Alejandro',
          fullName: 'Oscar Alejandro',
          proAvatar: 'https://randomuser.me/api/portraits/men/68.jpg',
          proCategory: 'Mecánica Móvil 24/7',
          imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
          caption: '🚗 Auxilio vial y cambio de alternador directo en la carretera.',
          likesCount: 77,
          createdAt: new Date().toISOString()
        }
      ]

      if (fetched.length > 0) {
        setStories(fetched)
      } else {
        setStories(sampleStories)
      }
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
    if (!isProUser || has5StarContract) {
      setUploadModalOpen(true)
    } else {
      setShowLockNotice(true)
    }
  }

  return (
    <div className="historias-carrusel-wrapper">
      <div className="historias-carrusel-header">
        <div className="historias-title-left">
          <div className="historias-live-pulse" />
          <span className="historias-title-icon">📸</span>
          <span className="historias-title-text">Trabajos Realizados</span>
        </div>
        <div className="historias-title-right">
          <span className="historias-badge-24h">🔥 En Vivo • 24h</span>
        </div>
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
            <div className={`historia-ring add-story-ring ${isProUser && !has5StarContract ? 'locked' : ''}`}>
              <div className="historia-avatar-inner">
                <img
                  src={userData?.photoURL || userData?.avatarUrl || userData?.profilePhoto || 'https://randomuser.me/api/portraits/men/32.jpg'}
                  alt="Tu perfil"
                  className="historia-avatar"
                />
              </div>
              <div className="historia-add-plus">
                {isProUser ? (has5StarContract ? '+' : '🔒') : '+'}
              </div>
            </div>
            <span className="historia-label pro-label">
              {isProUser ? (has5StarContract ? 'Tu Historia' : '⭐ 5 Estrellas') : 'Tu Historia'}
            </span>
          </div>

          {/* Stories List */}
          {stories.map((story, index) => {
            const isSeen = seenStories.includes(story.id)
            return (
              <div
                key={story.id || index}
                className="historia-item"
                onClick={() => handleOpenViewer(index)}
              >
                <div className={`historia-ring ${isSeen ? 'seen' : ''}`}>
                  <div className="historia-avatar-inner">
                    <img
                      src={story.proAvatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
                      alt={story.fullName || story.proName}
                      className="historia-avatar"
                    />
                  </div>
                </div>
                <span className="historia-label" title={story.fullName || story.proName}>
                  {story.proName || story.fullName}
                </span>
              </div>
            )
          })}
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
              Para garantizar la máxima calidad en Listo Patrón, la función de publicar Historias de Trabajo de 24h está reservada exclusivamente para profesionales que hayan obtenido una calificación de <strong style={{ color: '#FBBF24' }}>4 a 5 Estrellas ⭐⭐⭐⭐⭐ por contrato / trabajo finalizado</strong>.
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
    </div>
  )
}
