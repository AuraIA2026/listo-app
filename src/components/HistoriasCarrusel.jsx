import React, { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
import HistoriasViewerModal from './HistoriasViewerModal'
import SubirHistoriaModal from './SubirHistoriaModal'
import './Historias.css'

export default function HistoriasCarrusel({ userData, isPro, onHirePro }) {
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
          proName: 'mym_smart...',
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
          proName: 'ebusinesst...',
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
          proName: 'controlpiz...',
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
          proName: 'santanaxoo',
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
          proName: 'roanrafael',
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
          proName: 'oscaraleja...',
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
    setSelectedStoryIndex(index)
    setViewerOpen(true)
  }

  const handleAddStoryClick = () => {
    if (has5StarContract) {
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
          <span className="historias-title-text">Trabajos Realizados Recientemente</span>
        </div>
        <div className="historias-title-right">
          <span className="historias-badge-24h">⚡ 24h Stories</span>
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
          {/* If User is Professional, show Add Story item first */}
          {isProUser && (
            <div className="historia-item" onClick={handleAddStoryClick}>
              <div className={`historia-ring add-story-ring ${!has5StarContract ? 'locked' : ''}`}>
                <div className="historia-avatar-inner">
                  <img
                    src={userData?.photoURL || userData?.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg'}
                    alt="Tu perfil"
                    className="historia-avatar"
                  />
                </div>
                <div className="historia-add-plus">
                  {has5StarContract ? '+' : '🔒'}
                </div>
              </div>
              <span className="historia-label pro-label">
                {has5StarContract ? 'Tu Historia' : '⭐ 5 Estrellas'}
              </span>
            </div>
          )}

          {/* Stories List */}
          {stories.map((story, index) => (
            <div
              key={story.id || index}
              className="historia-item"
              onClick={() => handleOpenViewer(index)}
            >
              <div className="historia-ring">
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
          ))}
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
      />

      {/* Upload Story Modal for 5-Star Eligible Professionals */}
      <SubirHistoriaModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        userData={userData}
        onStoryUploaded={() => console.log('Nueva historia subida con éxito.')}
      />

      {/* Lock Notice Modal for Professionals without 5-star completed contracts */}
      {showLockNotice && (
        <div className="subir-historia-modal-overlay" onClick={() => setShowLockNotice(false)}>
          <div className="subir-historia-modal-card" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
              ⭐ Requiere 1 Contrato Perfecto (5 Estrellas)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
              Para garantizar la máxima calidad en Listo Patrón, la función de publicar historias de 24h está reservada exclusivamente para profesionales que hayan completado al menos 1 trabajo con calificación perfecta de <strong>5 estrellas ⭐⭐⭐⭐⭐</strong>.
              <br /><br />
              ¡Completa tu próximo trabajo con responsabilidad y excelencia para recibir 5 estrellas de tu cliente y desbloquear tus Historias!
            </p>
            <button
              onClick={() => setShowLockNotice(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #ff5e00, #ff8c00)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 94, 0, 0.3)'
              }}
            >
              ¡Entendido! 👍
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


