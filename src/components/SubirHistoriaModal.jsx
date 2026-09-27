import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { db, auth } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import './Historias.css'

const QUICK_TAGS = ['#Plomería', '#Electricidad', '#Pintura', '#Mecánica', '#Catering', '#Reparación', '#Limpieza', '#TrabajoListo']

export default function SubirHistoriaModal({ isOpen, onClose, userData, onStoryUploaded }) {
  const [mediaType, setMediaType] = useState('image') // 'image' | 'video'
  const [mediaPreview, setMediaPreview] = useState(null)
  const [videoDuration, setVideoDuration] = useState(null)
  const [videoRawDuration, setVideoRawDuration] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(15)
  const [fileSizeStr, setFileSizeStr] = useState('')
  const [isVideoMuted, setIsVideoMuted] = useState(false)
  const videoRef = useRef(null)

  // Editor de imágenes
  const [originalImageSrc, setOriginalImageSrc] = useState(null)
  const [isEditingPhoto, setIsEditingPhoto] = useState(false)
  const [editRotation, setEditRotation] = useState(0)
  const [editFilter, setEditFilter] = useState('normal')
  const [editBrightness, setEditBrightness] = useState(100)
  const [editContrast, setEditContrast] = useState(100)
  const [editZoom, setEditZoom] = useState(1.0)

  const [caption, setCaption] = useState('')
  const [offerSticker, setOfferSticker] = useState('none')
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [warningMsg, setWarningMsg] = useState('')

  if (!isOpen) return null

  // Función de procesamiento en Canvas para aplicar rotación, filtros y ajustes de imagen
  const applyPhotoEdits = (rawSrc, rotation, filterName, brightness, contrast, zoom) => {
    if (!rawSrc) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX_DIM = 900
      let w = img.width
      let h = img.height

      if (w > h) {
        if (w > MAX_DIM) {
          h = Math.round((h * MAX_DIM) / w)
          w = MAX_DIM
        }
      } else {
        if (h > MAX_DIM) {
          w = Math.round((w * MAX_DIM) / h)
          h = MAX_DIM
        }
      }

      const isQuarterRotated = rotation === 90 || rotation === 270
      canvas.width = isQuarterRotated ? h : w
      canvas.height = isQuarterRotated ? w : h

      const ctx = canvas.getContext('2d')

      let filterParts = []
      if (brightness !== 100) filterParts.push(`brightness(${brightness}%)`)
      if (contrast !== 100) filterParts.push(`contrast(${contrast}%)`)

      if (filterName === 'vivid') {
        filterParts.push('saturate(150%) contrast(110%)')
      } else if (filterName === 'warm') {
        filterParts.push('sepia(35%) brightness(105%)')
      } else if (filterName === 'bw') {
        filterParts.push('grayscale(100%)')
      } else if (filterName === 'vintage') {
        filterParts.push('sepia(45%) contrast(120%) brightness(95%)')
      }

      if (filterParts.length > 0 && ctx.filter !== undefined) {
        ctx.filter = filterParts.join(' ')
      }

      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(zoom, zoom)
      ctx.drawImage(img, -w / 2, -h / 2, w, h)
      ctx.restore()

      const outputBase64 = canvas.toDataURL('image/jpeg', 0.75)
      setMediaPreview(outputBase64)
    }
    img.src = rawSrc
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setErrorMsg('')
    setWarningMsg('')
    setVideoDuration(null)

    // Calculate file size label
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1)
    const szStr = file.size >= 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`
    setFileSizeStr(szStr)

    if (file.type.startsWith('video/')) {
      setMediaType('video')
      setIsEditingPhoto(false)

      // Check raw file size limit for Firestore base64 storage (max 12MB)
      if (file.size > 12 * 1024 * 1024) {
        setErrorMsg(`⚠️ El archivo de video es demasiado pesado (${szStr}). Para garantizar velocidad y guardado sin fallos, selecciona un video de máximo 12MB.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64Video = event.target.result
        setMediaPreview(base64Video)

        const tempVideo = document.createElement('video')
        tempVideo.src = base64Video
        tempVideo.onloadedmetadata = () => {
          const rawDur = tempVideo.duration || 15
          setVideoRawDuration(rawDur)

          const initialEnd = Math.min(15, rawDur)
          setTrimStart(0)
          setTrimEnd(initialEnd)
          setVideoDuration(Math.round(initialEnd))

          if (rawDur > 15) {
            setWarningMsg(`✂️ Video de ${Math.round(rawDur)}s acortado automáticamente a los primeros 15s estilo WhatsApp. Usa la barra deslizante para recortar el segmento deseado.`)
          }
        }
      }
      reader.readAsDataURL(file)

    } else if (file.type.startsWith('image/')) {
      setMediaType('image')
      const reader = new FileReader()
      reader.onload = (event) => {
        const rawBase64 = event.target.result
        setOriginalImageSrc(rawBase64)
        setEditRotation(0)
        setEditFilter('normal')
        setEditBrightness(100)
        setEditContrast(100)
        setEditZoom(1.0)
        applyPhotoEdits(rawBase64, 0, 'normal', 100, 100, 1.0)
      }
      reader.readAsDataURL(file)
    } else {
      setErrorMsg('Por favor selecciona un archivo de imagen (JPG, PNG) o video (MP4, WEBM).')
    }
  }

  const handleStartChange = (val) => {
    const s = Math.max(0, Math.min(val, videoRawDuration - 1))
    setTrimStart(s)

    let e = trimEnd
    if (e <= s || e - s > 15) {
      e = Math.min(videoRawDuration, s + 15)
    }
    setTrimEnd(e)
    setVideoDuration(Math.round(e - s))

    if (videoRef.current) {
      videoRef.current.currentTime = s
    }
  }

  const handleEndChange = (val) => {
    const e = Math.min(videoRawDuration, Math.max(val, trimStart + 1))
    let s = trimStart
    if (e - s > 15) {
      s = Math.max(0, e - 15)
    }
    setTrimStart(s)
    setTrimEnd(e)
    setVideoDuration(Math.round(e - s))

    if (videoRef.current) {
      videoRef.current.currentTime = s
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime >= trimEnd || videoRef.current.currentTime < trimStart) {
        videoRef.current.currentTime = trimStart
      }
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

    const selectedSegmentDuration = Math.round(trimEnd - trimStart)
    if (mediaType === 'video' && selectedSegmentDuration > 15) {
      setErrorMsg('Por favor recorta el video a un segmento máximo de 15 segundos.')
      return
    }

    let storedUser = {}
    try {
      storedUser = JSON.parse(localStorage.getItem('listoUserData') || '{}')
    } catch (e) {}

    const activeUser = auth.currentUser;
    const isProfileComplete = Boolean(
      userData?.profileComplete ||
      (
        (userData?.name || userData?.displayName || userData?.fullName || storedUser?.name || activeUser?.displayName) &&
        (userData?.phone || userData?.telefono || userData?.phoneNumber || storedUser?.phone)
      )
    )

    if (!isProfileComplete) {
      setErrorMsg('🔒 Solo los usuarios con su Perfil Completo (Nombre y Teléfono) pueden publicar historias. Por favor completa tu perfil en la sección de usuario.')
      return
    }
    const activeUid = activeUser?.uid || userData?.uid || userData?.id || storedUser?.uid || storedUser?.id || localStorage.getItem('listo_user_uid') || `pro_${Date.now()}`;
    const isClient = !(userData?.role === 'pro' || userData?.type === 'pro' || storedUser?.role === 'pro' || storedUser?.type === 'pro')

    const name = userData?.name || userData?.displayName || activeUser?.displayName || storedUser?.name || (isClient ? 'Cliente Listo' : 'Profesional de Listo');
    const avatar = userData?.avatarUrl || userData?.photoURL || userData?.profilePhoto || activeUser?.photoURL || storedUser?.avatarUrl || storedUser?.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg';
    const category = isClient ? 'Cliente Satisfecho 🤝' : (userData?.especialidad || userData?.category || userData?.specEs || storedUser?.especialidad || storedUser?.category || 'Profesional Registrado');

    const proPlan = isClient ? 'cliente' : (userData?.currentPlan || userData?.planId || userData?.plan || userData?.membership || userData?.proPlan || userData?.subscription || userData?.userPlan || userData?.planName || userData?.tipoPlan || storedUser?.currentPlan || storedUser?.planId || storedUser?.plan || storedUser?.membership || storedUser?.proPlan || storedUser?.subscription || storedUser?.userPlan || storedUser?.planName || storedUser?.tipoPlan || 'estandar');
    const proRating = Number(userData?.rating || storedUser?.rating || 5.0);

    setIsUploading(true)
    setErrorMsg('')

    try {
      const newStory = {
        proId: activeUid,
        proName: name,
        proAvatar: avatar,
        proCategory: category,
        proPlan: proPlan,
        proRating: proRating,
        mediaType: mediaType,
        imageUrl: mediaType === 'image' ? mediaPreview : null,
        videoUrl: mediaType === 'video' ? mediaPreview : null,
        trimStart: mediaType === 'video' ? trimStart : 0,
        trimEnd: mediaType === 'video' ? trimEnd : 15,
        videoDuration: mediaType === 'video' ? (selectedSegmentDuration || 15) : 15,
        caption: caption.trim() || (isClient ? 'Excelente servicio solicitado en Listo Patrón ⚡' : 'Trabajo realizado con calidad Listo Patrón ⚡'),
        offerSticker: offerSticker !== 'none' ? offerSticker : null,
        likesCount: 0,
        is5StarVerified: !isClient,
        ratingBadge: isClient ? '⭐ Cliente Listo' : '⭐⭐⭐⭐⭐ Entrega 5 Estrellas',
        status: 'pending',
        moderated: false,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 Horas
      }

      const docRef = await addDoc(collection(db, 'historias'), newStory)

      // Alert Admin
      await addDoc(collection(db, 'notificaciones'), {
        userId: 'admin',
        type: 'new_story_review',
        title: '📸 NUEVA HISTORIA EN ESPERA DE VALIDACIÓN',
        text: `El profesional ${name} (${category}) ha enviado una historia de trabajo para su revisión.`,
        storyDocId: docRef.id,
        read: false,
        createdAt: new Date().toISOString()
      }).catch(() => {})

      alert('🎉 ¡Historia enviada a revisión!\n\nTu historia ha sido enviada al equipo de administración para su validación. Una vez aprobada, aparecerá visible en la plataforma.')

      setIsUploading(false)
      if (onStoryUploaded) onStoryUploaded()
      onClose()
    } catch (err) {
      console.error('Error publicando historia:', err)
      const errStr = String(err?.message || err)
      if (errStr.toLowerCase().includes('size') || errStr.toLowerCase().includes('exceeds')) {
        setErrorMsg('El archivo seleccionado es muy pesado para la base de datos (límite 1MB). Por favor selecciona una imagen o video más ligero.')
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

        <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '9px 12px', borderRadius: '12px', fontSize: '11.5px', color: '#92400E', fontWeight: 600, lineHeight: 1.4 }}>
          ⚠️ <strong>Regla de la comunidad:</strong> Las historias son solo para mostrar tus resultados. No compartas teléfonos, enlaces ni anuncios externos; los clientes te contactarán directo por tu perfil de Listo Patrón.
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

        {/* WhatsApp Video Editor Bar & Trimmer (rendered when video is selected) */}
        {mediaType === 'video' && mediaPreview && videoRawDuration > 0 && (
          <div className="wa-video-editor-wrapper">
            {/* Top Toolbar WhatsApp Icons */}
            <div className="wa-top-toolbar">
              <span className="wa-top-icon" onClick={() => setIsVideoMuted(!isVideoMuted)} title={isVideoMuted ? "Activar sonido" : "Silenciar"}>
                {isVideoMuted ? '🔇' : '🔊'}
              </span>
              <div className="wa-top-actions">
                <span className="wa-tool-badge">🎵</span>
                <span className="wa-tool-badge active">✂️ 15s</span>
                <span className="wa-tool-badge">🏷️</span>
                <span className="wa-tool-badge">Aa</span>
                <span className="wa-tool-badge">✏️</span>
              </div>
            </div>

            {/* Trimmer Filmstrip Bar with handles */}
            <div className="wa-filmstrip-bar">
              <div className="wa-filmstrip-track">
                <div 
                  className="wa-filmstrip-highlight"
                  style={{
                    left: `${(trimStart / videoRawDuration) * 100}%`,
                    width: `${Math.max(10, ((trimEnd - trimStart) / videoRawDuration) * 100)}%`
                  }}
                >
                  <div className="wa-handle left">‹</div>
                  <div className="wa-handle right">›</div>
                </div>
              </div>
            </div>

            {/* Trimmer Sliders */}
            <div className="wa-trimmer-controls">
              <div className="wa-trim-item">
                <span>Inicio: <strong>{trimStart.toFixed(1)}s</strong></span>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, videoRawDuration - 1)}
                  step="0.1"
                  value={trimStart}
                  onChange={(e) => handleStartChange(parseFloat(e.target.value))}
                />
              </div>
              <div className="wa-trim-item">
                <span>Fin: <strong>{trimEnd.toFixed(1)}s</strong></span>
                <input
                  type="range"
                  min="0.5"
                  max={videoRawDuration}
                  step="0.1"
                  value={trimEnd}
                  onChange={(e) => handleEndChange(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '4px 0', gap: '10px' }}>
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
                    ref={videoRef}
                    src={mediaPreview}
                    autoPlay
                    loop
                    muted={isVideoMuted}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className="wa-video-overlay-badge">
                    ⏱️ 0:{Math.round(trimEnd - trimStart).toString().padStart(2, '0')} • {fileSizeStr || '2.9 MB'}
                  </span>
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

          {/* Interactive Photo Editor Toolbar & Expanded Controls */}
          {mediaType === 'image' && mediaPreview && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                  style={{
                    background: isEditingPhoto ? 'linear-gradient(135deg, #F26000, #FF7A1A)' : '#F1F5F9',
                    color: isEditingPhoto ? '#FFFFFF' : '#334155',
                    border: isEditingPhoto ? '1px solid #F26000' : '1px solid #CBD5E1',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: isEditingPhoto ? '0 4px 12px rgba(242, 96, 0, 0.3)' : 'none'
                  }}
                >
                  <span>🎨</span> {isEditingPhoto ? 'Cerrar Edición' : 'Editar Foto (Filtros, Giro, Brillo)'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextRot = (editRotation + 90) % 360
                    setEditRotation(nextRot)
                    applyPhotoEdits(originalImageSrc, nextRot, editFilter, editBrightness, editContrast, editZoom)
                  }}
                  style={{
                    background: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Rotar 90 grados"
                >
                  <span>🔄</span> Rotar {editRotation}°
                </button>
              </div>

              {/* Panel extendido de edición de imagen */}
              {isEditingPhoto && (
                <div 
                  style={{
                    width: '100%',
                    background: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '1px solid rgba(242, 96, 0, 0.4)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#FF7A1A' }}>
                      🛠️ Panel de Edición de Foto
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditRotation(0)
                        setEditFilter('normal')
                        setEditBrightness(100)
                        setEditContrast(100)
                        setEditZoom(1.0)
                        applyPhotoEdits(originalImageSrc, 0, 'normal', 100, 100, 1.0)
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        border: 'none',
                        color: '#CBD5E1',
                        borderRadius: '10px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ↺ Restablecer
                    </button>
                  </div>

                  {/* Filtros de color estilo Instagram */}
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                      🎨 Filtros de color:
                    </label>
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {[
                        { id: 'normal', name: 'Original' },
                        { id: 'vivid', name: '✨ Vívido' },
                        { id: 'warm', name: '☀️ Cálido' },
                        { id: 'bw', name: '🖤 B/N' },
                        { id: 'vintage', name: '🌅 Atardecer' }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setEditFilter(f.id)
                            applyPhotoEdits(originalImageSrc, editRotation, f.id, editBrightness, editContrast, editZoom)
                          }}
                          style={{
                            background: editFilter === f.id ? 'linear-gradient(135deg, #F26000, #FF7A1A)' : 'rgba(255,255,255,0.1)',
                            color: editFilter === f.id ? '#FFFFFF' : '#CBD5E1',
                            border: editFilter === f.id ? '1px solid #F26000' : '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deslizadores de Brillo, Contraste y Zoom */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: '#CBD5E1', fontWeight: 700 }}>☀️ Brillo: <strong>{editBrightness}%</strong></span>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={editBrightness}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setEditBrightness(val)
                          applyPhotoEdits(originalImageSrc, editRotation, editFilter, val, editContrast, editZoom)
                        }}
                        style={{ width: '55%', accentColor: '#F26000' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: '#CBD5E1', fontWeight: 700 }}>🌓 Contraste: <strong>{editContrast}%</strong></span>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={editContrast}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setEditContrast(val)
                          applyPhotoEdits(originalImageSrc, editRotation, editFilter, editBrightness, val, editZoom)
                        }}
                        style={{ width: '55%', accentColor: '#F26000' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: '#CBD5E1', fontWeight: 700 }}>🔍 Zoom / Encuadre: <strong>{editZoom.toFixed(1)}x</strong></span>
                      <input
                        type="range"
                        min="1.0"
                        max="1.8"
                        step="0.05"
                        value={editZoom}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setEditZoom(val)
                          applyPhotoEdits(originalImageSrc, editRotation, editFilter, editBrightness, editContrast, val)
                        }}
                        style={{ width: '55%', accentColor: '#F26000' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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

          {/* Sticker de Oferta Flash 24h */}
          <div style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
              🏷️ Sticker de Oferta Flash 24h (Opcional):
            </label>
            
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {[
                { id: 'none', label: 'Sin sticker' },
                { id: '🔥 Oferta del día - RD$ 500 off', label: '🔥 Oferta del día - RD$ 500 off' },
                { id: '🔥 Oferta 15% OFF', label: '🔥 Oferta 15% OFF' },
                { id: '⚡ Disponible Hoy', label: '⚡ Disponible Hoy' },
                { id: '🎁 Descuento Especial', label: '🎁 Descuento Especial' },
                { id: '⭐ Trabajo Garantizado', label: '⭐ Trabajo Garantizado' },
              ].map(stk => (
                <button
                  key={stk.id}
                  type="button"
                  onClick={() => setOfferSticker(stk.id)}
                  style={{
                    background: offerSticker === stk.id ? 'linear-gradient(135deg, #F26000, #EF4444)' : '#F1F5F9',
                    color: offerSticker === stk.id ? '#FFFFFF' : '#475569',
                    border: offerSticker === stk.id ? '1px solid #F26000' : '1px solid #CBD5E1',
                    borderRadius: '14px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {stk.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={offerSticker === 'none' ? '' : offerSticker}
              onChange={(e) => setOfferSticker(e.target.value || 'none')}
              placeholder="O escribe tu oferta personalizada (ej: 🔥 Oferta del día - RD$ 500 off)"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '12px',
                fontWeight: 700,
                outline: 'none'
              }}
            />
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
