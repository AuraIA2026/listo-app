import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { db, auth } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import './Historias.css'

const QUICK_TAGS = ['#Plomería', '#Electricidad', '#Pintura', '#Mecánica', '#Catering', '#Reparación', '#Limpieza', '#TrabajoListo']

export default function SubirHistoriaModal({ isOpen, onClose, userData, onStoryUploaded }) {
  const [mediaType, setMediaType] = useState('image') // 'image' | 'video'
  const [mediaPreview, setMediaPreview] = useState(null)
  const [videoDuration, setVideoDuration] = useState(null)
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [warningMsg, setWarningMsg] = useState('')

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setErrorMsg('')
    setWarningMsg('')
    setVideoDuration(null)

    if (file.type.startsWith('video/')) {
      setMediaType('video')

      // Check raw file size limit for Firestore base64 storage (max 800KB)
      if (file.size > 800 * 1024) {
        setErrorMsg(`⚠️ El archivo de video es demasiado pesado (${Math.round(file.size / 1024)}KB). Para garantizar velocidad y guardado en vivo sin fallos, selecciona un video corto (5-15s) de máximo 750KB.`)
        return
      }

      // Convert video file to persistent Data URL (base64) so it saves permanently in Firestore
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64Video = event.target.result
        setMediaPreview(base64Video)

        // Calculate video duration
        const tempVideo = document.createElement('video')
        tempVideo.src = base64Video
        tempVideo.onloadedmetadata = () => {
          const dur = Math.round(tempVideo.duration)
          setVideoDuration(dur)

          if (dur > 30) {
            setErrorMsg(`El video dura ${dur}s. El límite máximo para historias es de 30 segundos. Por favor selecciona un video más corto.`)
          } else if (dur > 15) {
            setWarningMsg(`⚡ Recomendación: Este video dura ${dur}s. Las historias de 15 segundos cargan más rápido y tienen mayor impacto.`)
          }
        }
      }
      reader.readAsDataURL(file)

    } else if (file.type.startsWith('image/')) {
      setMediaType('image')
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          // Compress image to max 800px & 0.65 quality to ensure payload is <200KB (well within 1MB Firestore limit)
          const canvas = document.createElement('canvas')
          const MAX_DIM = 800
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width)
              width = MAX_DIM
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height)
              height = MAX_DIM
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65)
          setMediaPreview(compressedBase64)
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    } else {
      setErrorMsg('Por favor selecciona un archivo de imagen (JPG, PNG) o video (MP4, WEBM).')
    }
  }

  const handleAddTag = (tag) => {
    if (caption.includes(tag)) return
    setCaption(prev => (prev ? `${prev} ${tag}` : tag))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!mediaPreview) {
      setErrorMsg('Debes seleccionar una foto o video del trabajo realizado.')
      return
    }

    if (mediaType === 'video' && videoDuration > 30) {
      setErrorMsg('Por favor recorta o selecciona un video de máximo 30 segundos.')
      return
    }

    const activeUser = auth.currentUser;
    if (!activeUser) {
      setErrorMsg('Debes iniciar sesión con tu cuenta para publicar historias de trabajo.')
      return
    }

    setIsUploading(true)
    setErrorMsg('')

    try {
      const isClient = !(userData?.role === 'pro' || userData?.type === 'pro')
      const newStory = {
        proId: activeUser.uid,
        proName: userData?.name || userData?.displayName || activeUser.displayName || (isClient ? 'Cliente Listo' : 'Profesional de Listo'),
        proAvatar: userData?.avatarUrl || userData?.photoURL || userData?.profilePhoto || activeUser.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg',
        proCategory: isClient ? 'Cliente Satisfecho 🤝' : (userData?.especialidad || userData?.category || userData?.specEs || 'Profesional Registrado'),
        mediaType: mediaType,
        imageUrl: mediaType === 'image' ? mediaPreview : null,
        videoUrl: mediaType === 'video' ? mediaPreview : null,
        videoDuration: videoDuration || 15,
        caption: caption.trim() || (isClient ? 'Excelente servicio solicitado en Listo Patrón ⚡' : 'Trabajo realizado con calidad Listo Patrón ⚡'),
        likesCount: 0,
        is5StarVerified: !isClient,
        ratingBadge: isClient ? '⭐ Cliente Listo' : '⭐⭐⭐⭐⭐ Entrega 5 Estrellas',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 Horas
      }

      await addDoc(collection(db, 'historias'), newStory)

      setIsUploading(false)
      if (onStoryUploaded) onStoryUploaded()
      onClose()
    } catch (err) {
      console.error('Error publicando historia:', err)
      const errStr = String(err?.message || err)
      if (errStr.toLowerCase().includes('size') || errStr.toLowerCase().includes('exceeds')) {
        setErrorMsg('El archivo seleccionado es muy pesado para la base de datos (límite 1MB). Por favor selecciona una imagen o video más ligero.')
      } else if (errStr.toLowerCase().includes('permission') || errStr.toLowerCase().includes('insufficient')) {
        setErrorMsg('Debes iniciar sesión con tu cuenta de usuario o profesional para publicar historias de trabajo.')
      } else {
        setErrorMsg(`No se pudo publicar la historia: ${err?.message || 'Error de conexión. Intenta nuevamente.'}`)
      }
      setIsUploading(false)
    }
  }

  return createPortal(
    <div className="subir-historia-modal-overlay" onClick={onClose}>
      <div className="subir-historia-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
            📸 / 🎥 Publicar Historia de Trabajo
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', border: '1px solid #F59E0B', padding: '8px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#B45309', fontWeight: 700 }}>
          <span>⭐</span>
          <span>¡Muestra la calidad de tu trabajo a toda la comunidad de Listo Patrón!</span>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 12px', background: '#FEF2F2', color: '#EF4444', borderRadius: '12px', fontSize: '12.5px', fontWeight: 700, border: '1px solid #FECACA' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {warningMsg && (
          <div style={{ padding: '8px 12px', background: '#FFFBE6', color: '#D97706', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600, border: '1px solid #FDE68A' }}>
            💡 {warningMsg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '4px 0' }}>
          <label className="subir-historia-preview-area">
            <input
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {mediaPreview ? (
              mediaType === 'video' ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                  <video
                    src={mediaPreview}
                    controls
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {videoDuration && (
                    <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
                      ⏱️ {videoDuration}s
                    </span>
                  )}
                </div>
              ) : (
                <img src={mediaPreview} alt="Vista previa del trabajo" className="subir-historia-preview-img" />
              )
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', fontSize: '36px', marginBottom: '8px' }}>
                  <span>📸</span>
                  <span>🎥</span>
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#F26000' }}>Toca para seleccionar Foto o Video</span>
                <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginTop: '6px' }}>
                  Formato Historia 9:16 estilo Instagram
                </span>
              </div>
            )}
          </label>
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
            Descripción del trabajo realizado:
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Ej: Instalación de tubería en Piantini con acabado impecable ⚡"
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none'
            }}
          />

          {/* Quick Tag Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
            {QUICK_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                style={{
                  background: caption.includes(tag) ? '#F26000' : '#F1F5F9',
                  color: caption.includes(tag) ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '3px 9px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '14px',
              border: '1px solid #CBD5E1',
              background: '#ffffff',
              color: '#475569',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading || !mediaPreview || (mediaType === 'video' && videoDuration > 30)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '14px',
              border: 'none',
              background: (mediaPreview && !(mediaType === 'video' && videoDuration > 30)) ? 'linear-gradient(135deg, #F26000, #FF7A1A)' : '#CBD5E1',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '14px',
              cursor: (mediaPreview && !(mediaType === 'video' && videoDuration > 30)) ? 'pointer' : 'not-allowed',
              boxShadow: (mediaPreview && !(mediaType === 'video' && videoDuration > 30)) ? '0 4px 14px rgba(242, 96, 0, 0.4)' : 'none'
            }}
          >
            {isUploading ? 'Publicando...' : '🚀 Publicar Historia'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
