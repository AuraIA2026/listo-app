import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, onSnapshot } from 'firebase/firestore'
import HistoriasViewerModal from './HistoriasViewerModal'
import SubirHistoriaModal from './SubirHistoriaModal'
import './Historias.css'

export default function HistoriasCarrusel({ userData, isPro, onHirePro }) {
  const [stories, setStories] = useState([])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // Real-time listener for stories from Firestore
  useEffect(() => {
    const qStories = query(collection(db, 'historias'))
    const unsubscribe = onSnapshot(qStories, (snapshot) => {
      const fetched = []
      const now = new Date().getTime()

      snapshot.forEach(doc => {
        const data = doc.data()
        const expiresTime = data.expiresAt ? new Date(data.expiresAt).getTime() : now + 86400000
        // Filter valid non-expired stories (or within 24h)
        if (expiresTime > now - 86400000) {
          fetched.push({ id: doc.id, ...data })
        }
      })

      // Sort newest first
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      if (fetched.length > 0) {
        setStories(fetched)
      } else {
        // Fallback sample active stories for instant rich UX demonstration
        setStories([
          {
            id: 'sample_1',
            proId: 'pro_demo_1',
            proName: 'Carlos Plumbing',
            proAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            proCategory: 'Plomería & Tuberías',
            imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            caption: '💧 Instalación de sistema hidráulico en residencia Bella Vista con acabado impecable.',
            likesCount: 14,
            createdAt: new Date().toISOString()
          },
          {
            id: 'sample_2',
            proId: 'pro_demo_2',
            proName: 'ElectroTech RD',
            proAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            proCategory: 'Electricista VIP',
            imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
            caption: '⚡ Montaje de panel eléctrico inteligente y luces LED empotradas en Piantini.',
            likesCount: 29,
            createdAt: new Date().toISOString()
          },
          {
            id: 'sample_3',
            proId: 'pro_demo_3',
            proName: 'Lic. Ana Reyes',
            proAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            proCategory: 'Diseño & Pintura',
            imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
            caption: '🎨 Remodelación y pintura satinada lavable en apartamento de lujo Naco.',
            likesCount: 42,
            createdAt: new Date().toISOString()
          }
        ])
      }
    }, (error) => {
      console.log('Error reading historias snapshot:', error)
    })

    return () => unsubscribe()
  }, [])

  const handleOpenViewer = (index) => {
    setSelectedStoryIndex(index)
    setViewerOpen(true)
  }

  return (
    <div className="historias-carrusel-wrapper">
      <div className="historias-carrusel-title">
        <span>📸 Trabajos Realizados Recientemente</span>
        <span>24h Stories</span>
      </div>

      <div className="historias-track">
        {/* If User is Professional, show Add Story item first */}
        {(isPro || userData?.role === 'pro') && (
          <div className="historia-item" onClick={() => setUploadModalOpen(true)}>
            <div className="historia-ring add-story-ring">
              <img
                src={userData?.photoURL || userData?.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg'}
                alt="Tu perfil"
                className="historia-avatar"
              />
              <div className="historia-add-plus">+</div>
            </div>
            <span className="historia-label" style={{ fontWeight: 700, color: '#ff5e00' }}>
              Tu Historia
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
              <img
                src={story.proAvatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
                alt={story.proName}
                className="historia-avatar"
              />
            </div>
            <span className="historia-label">{story.proName}</span>
          </div>
        ))}
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

      {/* Upload Story Modal for Professionals */}
      <SubirHistoriaModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        userData={userData}
        onStoryUploaded={() => console.log('Nueva historia subida con éxito.')}
      />
    </div>
  )
}
