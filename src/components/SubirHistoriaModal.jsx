import React, { useState } from 'react'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import './Historias.css'

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
      const videoUrl = URL.createObjectURL(file)
      setMediaPreview(videoUrl)

      // Calculate video duration
      const tempVideo = document.createElement('video')
      tempVideo.src = videoUrl
      tempVideo.onloadedmetadata = () => {
        const dur = Math.round(tempVideo.duration)
        setVideoDuration(dur)

        if (dur > 30) {
          setErrorMsg(`El video dura ${dur}s. El límite máximo para historias es de 30 segundos. Por favor selecciona un video más corto.`)
        } else if (dur > 15) {
          setWarningMsg(`⚡ Recomendación: Este video dura ${dur}s. Las historias de 15 segundos cargan más rápido y tienen mayor impacto.`)
        }
      }
    } else if (file.type.startsWith('image/')) {
      setMediaType('image')
      const reader = new FileReader()
      reader.onload = (event) => {
        // Compress image preview to max width 1080 for high quality & fast upload
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 1080
          const scaleSize = MAX_WIDTH / img.width
          let width = img.width
          let height = img.height

          if (width > MAX_WIDTH) {
            width = MAX_WIDTH
            height = img.height * scaleSize
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82)
          setMediaPreview(compressedBase64)
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    } else {
      setErrorMsg('Por favor selecciona un archivo de imagen (JPG, PNG) o video (MP4, WEBM).')
    }
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

    setIsUploading(true)
    setErrorMsg('')

    try {
      const newStory = {
        proId: userData?.uid || userData?.id || 'pro_unknown',
        proName: userData?.name || userData?.displayName || 'Profesional de Listo',
        proAvatar: userData?.avatarUrl || userData?.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg',
        proCategory: userData?.especialidad || userData?.category || userData?.specEs || 'Profesional Registrado',
        mediaType: mediaType,
        imageUrl: mediaType === 'image' ? mediaPreview : null,
        videoUrl: mediaType === 'video' ? mediaPreview : null,
        videoDuration: videoDuration || 15,
        caption: caption.trim() || 'Trabajo realizado con calidad Listo Patrón ⚡',
        likesCount: 0,
        is5StarVerified: true,
        ratingBadge: '⭐⭐⭐⭐⭐ Entrega 5 Estrellas',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 Horas
      }

      await addDoc(collection(db, 'historias'), newStory)

      setIsUploading(false)
      if (onStoryUploaded) onStoryUploaded()
      onClose()
    } catch (err) {
      console.error('Error publicando historia:', err)
      setErrorMsg('Ocurrió un error al subir la historia. Intenta nuevamente.')
      setIsUploading(false)
    }
  }

  return (
    <div className="subir-historia-modal-overlay" onClick={onClose}>
      <div className="subir-historia-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
            📸 / 🎥 Publicar Historia de Trabajo
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', border: '1px solid #F59E0B', padding: '6px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#B45309', fontWeight: 700 }}>
          <span>⭐</span>
          <span>¡Desbloqueado por Contrato Perfecto de 5 Estrellas!</span>
        </div>

        <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.4 }}>
          Muestra a tus clientes potenciales tus trabajos en <strong>Foto 📷</strong> o <strong>Video corto 🎥 (15s recomendado)</strong>. Visible 24 horas.
        </p>

        {errorMsg && (
          <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {warningMsg && (
          <div style={{ padding: '8px 12px', background: '#fffbe6', color: '#d97706', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, border: '1px solid #fde68a' }}>
            💡 {warningMsg}
          </div>
        )}

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
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
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
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', fontSize: '32px', marginBottom: '8px' }}>
                <span>📷</span>
                <span>🎥</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#ff5e00' }}>Toca para seleccionar Foto o Video</span>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                Recomendación: Videos de 15 a 30 segundos máximo
              </span>
            </div>
          )}
        </label>

        <div>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
            Descripción del trabajo realizado:
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Ej: Instalación de tubería premium en Piantini con acabado garantizado."
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
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
              borderRadius: '12px',
              border: 'none',
              background: (mediaPreview && !(mediaType === 'video' && videoDuration > 30)) ? 'linear-gradient(135deg, #ff5e00, #ff8c00)' : '#cbd5e1',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              cursor: (mediaPreview && !(mediaType === 'video' && videoDuration > 30)) ? 'pointer' : 'not-allowed',
              boxShadow: (mediaPreview && !(mediaType === 'video' && videoDuration > 30)) ? '0 4px 12px rgba(255, 94, 0, 0.3)' : 'none'
            }}
          >
            {isUploading ? 'Publicando...' : '🚀 Publicar Historia'}
          </button>
        </div>
      </div>
    </div>
  )
}

