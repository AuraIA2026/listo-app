import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { db, auth } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import './Historias.css'

const QUICK_TAGS = ['#Plomería', '#Electricidad', '#Pintura', '#Mecánica', '#Catering', '#Reparación', '#Limpieza', '#TrabajoListo']

const COLOR_PALETTE = [
  '#FFFFFF', '#000000', '#F26000', '#EF4444', '#F59E0B', 
  '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'
]

const STICKER_PRESETS = [
  { id: 'logo_listo', label: '⚡ Pedidos Listo' },
  { id: 'oficial_5s', label: '⭐ Trabajo 5 Estrellas' },
  { id: 'oferta_flash', label: '🔥 Oferta 24h' },
  { id: 'garantia', label: '🛡️ Garantizado' },
  { id: 'cliente_ok', label: '🤝 Cliente Satisfecho' },
  { id: 'herramientas', label: '🛠️ Calidad Profesional' },
  { id: 'ubicacion', label: '📍 Santo Domingo, RD' }
]

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

  // Editor de fotos estilo WhatsApp Ultra-Mejorado
  const [originalImageSrc, setOriginalImageSrc] = useState(null)
  const [activeTool, setActiveTool] = useState(null) // null | 'crop' | 'bg' | 'filter' | 'draw' | 'text' | 'sticker'
  
  // 1. Encuadre, Recorte y Ajuste anti-cortado
  const [cropMode, setCropMode] = useState('fit') // 'fit' (foto completa) | 'cover' (llenar 9:16) | '1:1' | '4:5' | '16:9'
  const [bgStyle, setBgStyle] = useState('blur') // 'blur' (WhatsApp) | 'gradient' | 'dark' | 'light'
  const [editRotation, setEditRotation] = useState(0)
  const [editFlipX, setEditFlipX] = useState(false)
  const [editZoom, setEditZoom] = useState(1.0)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 })

  // 2. Filtros y Ajustes de Color HD
  const [editFilter, setEditFilter] = useState('normal')
  const [editBrightness, setEditBrightness] = useState(100)
  const [editContrast, setEditContrast] = useState(100)
  const [editSaturate, setEditSaturate] = useState(100)

  // 3. Pincel / Dibujo estilo WhatsApp
  const [drawColor, setDrawColor] = useState('#F26000')
  const [drawLineWidth, setDrawLineWidth] = useState(6)
  const [strokesHistory, setStrokesHistory] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const drawCanvasRef = useRef(null)
  const currentStrokeRef = useRef([])

  // 4. Texto Superpuesto estilo WhatsApp
  const [overlayText, setOverlayText] = useState('')
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [textBgStyle, setTextBgStyle] = useState('solid') // 'solid' | 'transparent' | 'semi' | 'outline' | 'neon'
  const [textFont, setTextFont] = useState('sans') // 'sans' | 'serif' | 'script' | 'typewriter' | 'impact'
  const [textPos, setTextPos] = useState('center') // 'top' | 'center' | 'bottom'

  // 5. Stickers / Emojis superpuestos
  const [selectedStickers, setSelectedStickers] = useState([])

  const [caption, setCaption] = useState('')
  const [offerSticker, setOfferSticker] = useState('none')
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [warningMsg, setWarningMsg] = useState('')

  useEffect(() => {
    if (mediaType === 'image' && originalImageSrc) {
      renderMergedPreview()
    }
  }, [
    originalImageSrc, cropMode, bgStyle, editRotation, editFlipX, editZoom, panX, panY,
    editFilter, editBrightness, editContrast, editSaturate,
    strokesHistory, overlayText, textColor, textBgStyle, textFont, textPos, selectedStickers
  ])

  if (!isOpen) return null

  // Renderiza la vista previa combinada en Canvas (Anti-cortado con Blur/Fit + Filtros + Dibujos + Texto + Stickers)
  const renderMergedPreview = () => {
    if (!originalImageSrc) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      
      // Dimensiones estándar de Historia (9:16 -> 720 x 1280)
      const targetW = 720
      const targetH = 1280

      canvas.width = targetW
      canvas.height = targetH

      const ctx = canvas.getContext('2d')

      // A) DIBUJAR FONDO ADAPTATIVO (Evita que la foto quede cortada)
      if (bgStyle === 'blur') {
        // Fondo desenfocado WhatsApp de la misma imagen
        ctx.save()
        if (ctx.filter !== undefined) {
          ctx.filter = 'blur(24px) brightness(0.65) saturate(120%)'
        }
        const bgScale = Math.max(targetW / img.width, targetH / img.height)
        const bgW = img.width * bgScale
        const bgH = img.height * bgScale
        ctx.drawImage(img, (targetW - bgW) / 2, (targetH - bgH) / 2, bgW, bgH)
        ctx.restore()
      } else if (bgStyle === 'gradient') {
        // Degradado estilo Pedidos Listo
        const grad = ctx.createLinearGradient(0, 0, 0, targetH)
        grad.addColorStop(0, '#0F172A')
        grad.addColorStop(0.5, '#1E293B')
        grad.addColorStop(1, '#F26000')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, targetW, targetH)
      } else if (bgStyle === 'light') {
        ctx.fillStyle = '#F8FAFC'
        ctx.fillRect(0, 0, targetW, targetH)
      } else {
        // Fondo negro elegante por defecto
        ctx.fillStyle = '#0B0F19'
        ctx.fillRect(0, 0, targetW, targetH)
      }

      // B) APLICAR FILTROS CSS A LA FOTO PRINCIPAL
      let filterParts = []
      if (editBrightness !== 100) filterParts.push(`brightness(${editBrightness}%)`)
      if (editContrast !== 100) filterParts.push(`contrast(${editContrast}%)`)
      if (editSaturate !== 100) filterParts.push(`saturate(${editSaturate}%)`)

      if (editFilter === 'vivid') {
        filterParts.push('saturate(165%) contrast(115%)')
      } else if (editFilter === 'warm') {
        filterParts.push('sepia(25%) brightness(105%) saturate(125%)')
      } else if (editFilter === 'bw') {
        filterParts.push('grayscale(100%) contrast(115%)')
      } else if (editFilter === 'vintage') {
        filterParts.push('sepia(45%) contrast(120%) brightness(95%)')
      } else if (editFilter === 'cinema') {
        filterParts.push('contrast(135%) saturate(85%) brightness(92%)')
      } else if (editFilter === 'cold') {
        filterParts.push('hue-rotate(180deg) saturate(110%)')
      } else if (editFilter === 'neon') {
        filterParts.push('saturate(200%) contrast(130%) hue-rotate(300deg)')
      } else if (editFilter === 'hdr') {
        filterParts.push('contrast(140%) brightness(110%) saturate(130%)')
      }

      ctx.save()
      if (filterParts.length > 0 && ctx.filter !== undefined) {
        ctx.filter = filterParts.join(' ')
      }

      // C) DIBUJAR IMAGEN PRINCIPAL SEGÚN CROP MODE & TRANSFORMACIONES
      ctx.translate(targetW / 2 + panX, targetH / 2 + panY)
      ctx.rotate((editRotation * Math.PI) / 180)
      ctx.scale(editFlipX ? -editZoom : editZoom, editZoom)

      let drawW = targetW
      let drawH = targetH

      if (cropMode === 'fit') {
        // Anti-cortado: la foto completa encaja dentro sin perder bordes
        const scaleRatio = Math.min(targetW / img.width, targetH / img.height)
        drawW = img.width * scaleRatio
        drawH = img.height * scaleRatio
      } else if (cropMode === 'cover') {
        // Llenar 9:16 completo
        const scaleRatio = Math.max(targetW / img.width, targetH / img.height)
        drawW = img.width * scaleRatio
        drawH = img.height * scaleRatio
      } else if (cropMode === '1:1') {
        // Cuadrado 1:1 en el centro
        const boxSize = 700
        const scaleRatio = Math.min(boxSize / img.width, boxSize / img.height)
        drawW = img.width * scaleRatio
        drawH = img.height * scaleRatio
      } else if (cropMode === '4:5') {
        // Retrato 4:5
        const boxW = 700
        const boxH = 875
        const scaleRatio = Math.min(boxW / img.width, boxH / img.height)
        drawW = img.width * scaleRatio
        drawH = img.height * scaleRatio
      } else if (cropMode === '16:9') {
        // Paisaje 16:9
        const boxW = 700
        const boxH = 394
        const scaleRatio = Math.min(boxW / img.width, boxH / img.height)
        drawW = img.width * scaleRatio
        drawH = img.height * scaleRatio
      }

      // Sombra suave bajo la foto si está en modo fit o marco
      if (cropMode !== 'cover' && bgStyle !== 'blur') {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 20
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
      ctx.restore()

      // Resetear filtro y sombras para capas superiores
      if (ctx.filter !== undefined) ctx.filter = 'none'
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

      // D) DIBUJAR TRAZOS DE PINCEL
      strokesHistory.forEach(stroke => {
        if (!stroke.points || stroke.points.length === 0) return
        ctx.beginPath()
        ctx.strokeStyle = stroke.color
        ctx.lineWidth = (stroke.width * targetW) / 360
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        stroke.points.forEach((pt, idx) => {
          const px = pt.x * targetW
          const py = pt.y * targetH
          if (idx === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        })
        ctx.stroke()
      })

      // E) DIBUJAR STICKERS Y MARCAS
      selectedStickers.forEach(stk => {
        ctx.save()
        const stkX = stk.x * targetW
        const stkY = stk.y * targetH
        ctx.font = '900 34px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        ctx.shadowColor = 'rgba(0,0,0,0.6)'
        ctx.shadowBlur = 10

        const metrics = ctx.measureText(stk.label)
        const bgW = metrics.width + 28
        const bgH = 48
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)'
        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(stkX - bgW / 2, stkY - bgH / 2, bgW, bgH, 16)
        } else {
          ctx.rect(stkX - bgW / 2, stkY - bgH / 2, bgW, bgH)
        }
        ctx.fill()

        ctx.strokeStyle = '#F26000'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(stk.label, stkX, stkY)
        ctx.restore()
      })

      // F) DIBUJAR TEXTO SUPERPUESTO ESTILO WHATSAPP
      if (overlayText.trim()) {
        ctx.save()
        let fontName = 'sans-serif'
        if (textFont === 'serif') fontName = 'Georgia, serif'
        else if (textFont === 'script') fontName = 'cursive, sans-serif'
        else if (textFont === 'typewriter') fontName = 'Courier New, monospace'
        else if (textFont === 'impact') fontName = 'Impact, sans-serif'

        ctx.font = `900 34px ${fontName}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        let textY = targetH / 2
        if (textPos === 'top') textY = targetH * 0.20
        if (textPos === 'bottom') textY = targetH * 0.80

        const metrics = ctx.measureText(overlayText)
        const textW = metrics.width + 34
        const textH = 56

        if (textBgStyle === 'solid') {
          ctx.fillStyle = '#0F172A'
          ctx.beginPath()
          if (ctx.roundRect) {
            ctx.roundRect(targetW / 2 - textW / 2, textY - textH / 2, textW, textH, 16)
          } else {
            ctx.rect(targetW / 2 - textW / 2, textY - textH / 2, textW, textH)
          }
          ctx.fill()
          ctx.fillStyle = textColor
        } else if (textBgStyle === 'semi') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
          ctx.beginPath()
          if (ctx.roundRect) {
            ctx.roundRect(targetW / 2 - textW / 2, textY - textH / 2, textW, textH, 16)
          } else {
            ctx.rect(targetW / 2 - textW / 2, textY - textH / 2, textW, textH)
          }
          ctx.fill()
          ctx.fillStyle = textColor
        } else if (textBgStyle === 'neon') {
          ctx.shadowColor = textColor
          ctx.shadowBlur = 20
          ctx.fillStyle = textColor
        } else if (textBgStyle === 'outline') {
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 7
          ctx.strokeText(overlayText, targetW / 2, textY)
          ctx.fillStyle = textColor
        } else {
          ctx.shadowColor = 'rgba(0,0,0,0.85)'
          ctx.shadowBlur = 12
          ctx.fillStyle = textColor
        }

        ctx.fillText(overlayText, targetW / 2, textY)
        ctx.restore()
      }

      const outputBase64 = canvas.toDataURL('image/jpeg', 0.85)
      setMediaPreview(outputBase64)
    }
    img.src = originalImageSrc
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setErrorMsg('')
    setWarningMsg('')
    setVideoDuration(null)

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1)
    const szStr = file.size >= 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`
    setFileSizeStr(szStr)

    if (file.type.startsWith('video/')) {
      setMediaType('video')
      setActiveTool(null)

      if (file.size > 12 * 1024 * 1024) {
        setErrorMsg(`⚠️ El archivo de video es demasiado pesado (${szStr}). Selecciona un video de máximo 12MB.`)
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
            setWarningMsg(`✂️ Video acortado automáticamente a los primeros 15s estilo WhatsApp. Usa la barra deslizante para elegir el segmento.`)
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
        
        // Reset editor parameters - Anti-cortado fit por defecto
        setCropMode('fit')
        setBgStyle('blur')
        setEditRotation(0)
        setEditFlipX(false)
        setEditZoom(1.0)
        setPanX(0)
        setPanY(0)
        setEditFilter('normal')
        setEditBrightness(100)
        setEditContrast(100)
        setEditSaturate(100)
        setStrokesHistory([])
        setOverlayText('')
        setSelectedStickers([])
        setActiveTool('crop') // Abre directamente la herramienta de encuadre para sugerir opciones
      }
      reader.readAsDataURL(file)
    } else {
      setErrorMsg('Por favor selecciona un archivo de imagen (JPG, PNG) o video (MP4, WEBM).')
    }
  }

  // Lógica de Arrastre de Imagen en Modo Crop (Pan)
  const handleStartPan = (e) => {
    if (activeTool !== 'crop') return
    setIsPanning(true)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    panStartRef.current = { x: clientX, y: clientY, initialPanX: panX, initialPanY: panY }
  }

  const handleMovePan = (e) => {
    if (!isPanning || activeTool !== 'crop') return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const deltaX = clientX - panStartRef.current.x
    const deltaY = clientY - panStartRef.current.y
    setPanX(panStartRef.current.initialPanX + deltaX)
    setPanY(panStartRef.current.initialPanY + deltaY)
  }

  const handleEndPan = () => {
    if (isPanning) setIsPanning(false)
  }

  // Lógica de Trazo de Pincel
  const handleStartDraw = (e) => {
    if (activeTool !== 'draw') return
    setIsDrawing(true)
    const rect = e.target.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    const relX = (clientX - rect.left) / rect.width
    const relY = (clientY - rect.top) / rect.height
    
    currentStrokeRef.current = [{ x: relX, y: relY }]
  }

  const handleMoveDraw = (e) => {
    if (!isDrawing || activeTool !== 'draw') return
    const rect = e.target.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))

    currentStrokeRef.current.push({ x: relX, y: relY })
  }

  const handleEndDraw = () => {
    if (!isDrawing || activeTool !== 'draw') return
    setIsDrawing(false)
    if (currentStrokeRef.current.length > 0) {
      setStrokesHistory(prev => [
        ...prev,
        {
          color: drawColor,
          width: drawLineWidth,
          points: [...currentStrokeRef.current]
        }
      ])
    }
    currentStrokeRef.current = []
  }

  const handleUndoStroke = () => {
    setStrokesHistory(prev => prev.slice(0, -1))
  }

  const handleToggleSticker = (stkObj) => {
    if (selectedStickers.some(s => s.id === stkObj.id)) {
      setSelectedStickers(prev => prev.filter(s => s.id !== stkObj.id))
    } else {
      setSelectedStickers(prev => [
        ...prev,
        { ...stkObj, x: 0.5, y: 0.35 + prev.length * 0.12 }
      ])
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
    } catch (err) {}

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
        caption: caption.trim() || (isClient ? 'Excelente servicio solicitado en Pedidos Listo ⚡' : 'Trabajo realizado con calidad Pedidos Listo ⚡'),
        offerSticker: offerSticker !== 'none' ? offerSticker : null,
        likesCount: 0,
        is5StarVerified: !isClient,
        ratingBadge: isClient ? '⭐ Cliente Listo' : '⭐⭐⭐⭐⭐ Entrega 5 Estrellas',
        status: 'pending',
        moderated: false,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const docRef = await addDoc(collection(db, 'historias'), newStory)

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
        
        {/* Encabezado del Modal */}
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
          <span>⚡</span>
          <span>Editor estilo WhatsApp: Tu foto encaja 100% completa sin recortarse + Herramientas de edición.</span>
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

        {/* BARRA SUPERIOR DE HERRAMIENTAS ESTILO WHATSAPP (SI HAY IMAGEN O VIDEO) */}
        {mediaPreview && (
          <div className="wa-top-toolbar-full">
            <span className="wa-toolbar-title">🛠️ Editor WhatsApp</span>

            <div className="wa-tools-icons-row">
              {mediaType === 'image' && (
                <>
                  {/* Tool 1: Recortar y Encuadre Anti-cortado */}
                  <button
                    type="button"
                    className={`wa-tool-btn ${activeTool === 'crop' ? 'active' : ''}`}
                    onClick={() => setActiveTool(activeTool === 'crop' ? null : 'crop')}
                    title="Encuadre y Recorte Anti-Cortado"
                  >
                    ✂️ <span className="wa-tool-lbl">Encuadre</span>
                  </button>

                  {/* Tool 2: Estilos de Fondo */}
                  <button
                    type="button"
                    className={`wa-tool-btn ${activeTool === 'bg' ? 'active' : ''}`}
                    onClick={() => setActiveTool(activeTool === 'bg' ? null : 'bg')}
                    title="Estilos de Fondo"
                  >
                    🌌 <span className="wa-tool-lbl">Fondo</span>
                  </button>

                  {/* Tool 3: Filtros de Color */}
                  <button
                    type="button"
                    className={`wa-tool-btn ${activeTool === 'filter' ? 'active' : ''}`}
                    onClick={() => setActiveTool(activeTool === 'filter' ? null : 'filter')}
                    title="Filtros de Color HD"
                  >
                    🎨 <span className="wa-tool-lbl">Filtros</span>
                  </button>

                  {/* Tool 4: Pincel / Dibujo */}
                  <button
                    type="button"
                    className={`wa-tool-btn ${activeTool === 'draw' ? 'active' : ''}`}
                    onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')}
                    title="Dibujar con Pincel"
                  >
                    ✏️ <span className="wa-tool-lbl">Dibujar</span>
                  </button>

                  {/* Tool 5: Texto Superpuesto */}
                  <button
                    type="button"
                    className={`wa-tool-btn ${activeTool === 'text' ? 'active' : ''}`}
                    onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
                    title="Añadir Texto"
                  >
                    <span style={{ fontWeight: 900, fontFamily: 'serif' }}>Aa</span> <span className="wa-tool-lbl">Texto</span>
                  </button>

                  {/* Tool 6: Stickers */}
                  <button
                    type="button"
                    className={`wa-tool-btn ${activeTool === 'sticker' ? 'active' : ''}`}
                    onClick={() => setActiveTool(activeTool === 'sticker' ? null : 'sticker')}
                    title="Stickers y Marcas"
                  >
                    😀 <span className="wa-tool-lbl">Sticker</span>
                  </button>
                </>
              )}

              {mediaType === 'video' && (
                <span
                  className="wa-tool-btn"
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  title={isVideoMuted ? "Activar sonido" : "Silenciar"}
                >
                  {isVideoMuted ? '🔇 Silenciado' : '🔊 Con Audio'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* PANEL EXPANDIBLE DE CADA HERRAMIENTA SELECCIONADA */}
        {mediaType === 'image' && activeTool && (
          <div className="wa-active-tool-panel">
            
            {/* 1. PANEL DE ENCUADRE Y ANTI-CORTADO */}
            {activeTool === 'crop' && (
              <div className="wa-panel-content">
                <span className="wa-panel-title">✂️ Modo de Encuadre (Evita que la foto se corte)</span>
                
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'fit', label: '🖼️ Foto Completa (WhatsApp Fit)' },
                    { id: 'cover', label: '📱 Llenar 9:16' },
                    { id: '1:1', label: '🔳 1:1 Cuadrado' },
                    { id: '4:5', label: '📐 4:5 Retrato' },
                    { id: '16:9', label: '↔️ 16:9 Paisaje' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCropMode(m.id)}
                      className={`wa-chip-btn ${cropMode === m.id ? 'active' : ''}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="wa-slider-row">
                  <span>🔍 Zoom: <strong>{editZoom.toFixed(1)}x</strong></span>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.05"
                    value={editZoom}
                    onChange={(e) => setEditZoom(parseFloat(e.target.value))}
                    style={{ accentColor: '#F26000' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="wa-action-btn"
                    onClick={() => setEditRotation((prev) => (prev + 90) % 360)}
                  >
                    🔄 Rotar 90° ({editRotation}°)
                  </button>

                  <button
                    type="button"
                    className="wa-action-btn"
                    onClick={() => setEditFlipX(!editFlipX)}
                  >
                    ↔️ Espejo ({editFlipX ? 'Si' : 'No'})
                  </button>

                  <button
                    type="button"
                    className="wa-action-btn secondary"
                    onClick={() => {
                      setCropMode('fit')
                      setEditZoom(1.0)
                      setPanX(0)
                      setPanY(0)
                      setEditRotation(0)
                      setEditFlipX(false)
                    }}
                  >
                    ↺ Restablecer
                  </button>
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginTop: '4px' }}>
                  💡 Arrasta con el dedo o ratón la foto en la vista previa para ajustar el encuadre exacto.
                </span>
              </div>
            )}

            {/* 2. PANEL DE ESTILOS DE FONDO */}
            {activeTool === 'bg' && (
              <div className="wa-panel-content">
                <span className="wa-panel-title">🌌 Estilo de Fondo (Para imágenes completas)</span>
                
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'blur', label: '🌫️ Blur WhatsApp' },
                    { id: 'gradient', label: '<ctrl42> Degradado Listo' },
                    { id: 'dark', label: '⬛ Negro Elegante' },
                    { id: 'light', label: '⚪ Blanco Puro' }
                  ].map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBgStyle(b.id)}
                      className={`wa-chip-btn ${bgStyle === b.id ? 'active' : ''}`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. PANEL DE FILTROS Y AJUSTES DE COLOR */}
            {activeTool === 'filter' && (
              <div className="wa-panel-content">
                <span className="wa-panel-title">🎨 Filtros de Color HD Estilo WhatsApp</span>
                
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {[
                    { id: 'normal', name: 'Original' },
                    { id: 'vivid', name: '✨ Vívido' },
                    { id: 'warm', name: '☀️ Cálido' },
                    { id: 'bw', name: '🖤 B/N' },
                    { id: 'vintage', name: '🌅 Atardecer' },
                    { id: 'cinema', name: '🍿 Cine' },
                    { id: 'cold', name: '❄️ Frío' },
                    { id: 'neon', name: '⚡ Neón' },
                    { id: 'hdr', name: '📸 HDR Pro' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setEditFilter(f.id)}
                      className={`wa-chip-btn ${editFilter === f.id ? 'active' : ''}`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>

                <div className="wa-slider-row">
                  <span>☀️ Brillo: <strong>{editBrightness}%</strong></span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={editBrightness}
                    onChange={(e) => setEditBrightness(parseInt(e.target.value))}
                    style={{ accentColor: '#F26000' }}
                  />
                </div>

                <div className="wa-slider-row">
                  <span>🌓 Contraste: <strong>{editContrast}%</strong></span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={editContrast}
                    onChange={(e) => setEditContrast(parseInt(e.target.value))}
                    style={{ accentColor: '#F26000' }}
                  />
                </div>

                <div className="wa-slider-row">
                  <span>🎨 Saturación: <strong>{editSaturate}%</strong></span>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={editSaturate}
                    onChange={(e) => setEditSaturate(parseInt(e.target.value))}
                    style={{ accentColor: '#F26000' }}
                  />
                </div>
              </div>
            )}

            {/* 4. PANEL DE DIBUJO CON PINCEL */}
            {activeTool === 'draw' && (
              <div className="wa-panel-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="wa-panel-title">✏️ Pincel de Dibujo Libre (Toca en la foto para dibujar)</span>
                  {strokesHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={handleUndoStroke}
                      className="wa-action-btn secondary"
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                    >
                      ↩️ Deshacer Trazo
                    </button>
                  )}
                </div>

                {/* Paleta de Colores */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto' }}>
                  {COLOR_PALETTE.map(c => (
                    <span
                      key={c}
                      onClick={() => setDrawColor(c)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: drawColor === c ? '3px solid #F26000' : '2px solid rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transform: drawColor === c ? 'scale(1.15)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>

                {/* Grosor de Pincel */}
                <div className="wa-slider-row">
                  <span>🖌️ Grosor: <strong>{drawLineWidth}px</strong></span>
                  <input
                    type="range"
                    min="3"
                    max="24"
                    value={drawLineWidth}
                    onChange={(e) => setDrawLineWidth(parseInt(e.target.value))}
                    style={{ accentColor: '#F26000' }}
                  />
                </div>
              </div>
            )}

            {/* 5. PANEL DE TEXTO SUPERPUESTO */}
            {activeTool === 'text' && (
              <div className="wa-panel-content">
                <span className="wa-panel-title">Aa Texto Superpuesto estilo WhatsApp</span>

                <input
                  type="text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  placeholder="Escribe el texto para la foto (ej: ¡Tubería lista! ⚡)"
                  className="wa-text-input"
                />

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Estilo de Fondo de Texto */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {[
                      { id: 'solid', label: '⬛ Relleno' },
                      { id: 'semi', label: '🌫️ Semitransparente' },
                      { id: 'outline', label: '🔲 Contorno' },
                      { id: 'neon', label: '⚡ Neón' },
                      { id: 'transparent', label: '✨ Sin fondo' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setTextBgStyle(st.id)}
                        className={`wa-chip-btn ${textBgStyle === st.id ? 'active' : ''}`}
                        style={{ fontSize: '10.5px', padding: '3px 8px' }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipografía de Texto */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 700 }}>Fuente:</span>
                  {[
                    { id: 'sans', label: 'Sans' },
                    { id: 'serif', label: 'Serif' },
                    { id: 'script', label: 'Cursiva' },
                    { id: 'typewriter', label: 'Máquina' },
                    { id: 'impact', label: 'Impact' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setTextFont(f.id)}
                      className={`wa-chip-btn ${textFont === f.id ? 'active' : ''}`}
                      style={{ fontSize: '10.5px' }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Posición del texto */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 700 }}>Posición:</span>
                  {[
                    { id: 'top', label: '⬆️ Arriba' },
                    { id: 'center', label: '↔️ Centro' },
                    { id: 'bottom', label: '⬇️ Abajo' }
                  ].map(pos => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setTextPos(pos.id)}
                      className={`wa-chip-btn ${textPos === pos.id ? 'active' : ''}`}
                      style={{ fontSize: '10.5px' }}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>

                {/* Paleta de Color de Texto */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto' }}>
                  <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 700 }}>Color:</span>
                  {COLOR_PALETTE.map(c => (
                    <span
                      key={c}
                      onClick={() => setTextColor(c)}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: textColor === c ? '3px solid #F26000' : '2px solid rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transform: textColor === c ? 'scale(1.15)' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 6. PANEL DE STICKERS Y MARCAS DE LISTO */}
            {activeTool === 'sticker' && (
              <div className="wa-panel-content">
                <span className="wa-panel-title">😀 Stickers y Marcas de Pedidos Listo</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {STICKER_PRESETS.map(stk => {
                    const isSel = selectedStickers.some(s => s.id === stk.id)
                    return (
                      <button
                        key={stk.id}
                        type="button"
                        onClick={() => handleToggleSticker(stk)}
                        className={`wa-chip-btn ${isSel ? 'active' : ''}`}
                      >
                        {isSel ? '✅ ' : '+ '}{stk.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Trimmer de Video (si se selecciona video) */}
        {mediaType === 'video' && mediaPreview && videoRawDuration > 0 && (
          <div className="wa-video-editor-wrapper">
            <div className="wa-top-toolbar">
              <span className="wa-top-icon" onClick={() => setIsVideoMuted(!isVideoMuted)} title={isVideoMuted ? "Activar sonido" : "Silenciar"}>
                {isVideoMuted ? '🔇' : '🔊'}
              </span>
              <div className="wa-top-actions">
                <span className="wa-tool-badge active">✂️ Recortar 15s</span>
              </div>
            </div>

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

        {/* ÁREA DE VISTA PREVIA INTERACTIVA (CON DRAG DE IMAGEN Y CANVAS DE DIBUJO) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '4px 0', gap: '10px' }}>
          <label
            className="subir-historia-preview-area"
            style={{
              touchAction: (activeTool === 'draw' || activeTool === 'crop') ? 'none' : 'auto',
              cursor: activeTool === 'crop' ? 'grab' : (activeTool === 'draw' ? 'crosshair' : 'pointer')
            }}
            onMouseDown={handleStartPan}
            onMouseMove={handleMovePan}
            onMouseUp={handleEndPan}
            onMouseLeave={handleEndPan}
            onTouchStart={handleStartPan}
            onTouchMove={handleMovePan}
            onTouchEnd={handleEndPan}
          >
            <input
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={activeTool === 'draw' || activeTool === 'crop'}
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
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img
                    src={mediaPreview}
                    alt="Vista previa de historia edicion WhatsApp"
                    className="subir-historia-preview-img"
                  />

                  {/* Capa de Dibujo interactivo transparente sobre la foto */}
                  {activeTool === 'draw' && (
                    <canvas
                      ref={drawCanvasRef}
                      onMouseDown={handleStartDraw}
                      onMouseMove={handleMoveDraw}
                      onMouseUp={handleEndDraw}
                      onMouseLeave={handleEndDraw}
                      onTouchStart={handleStartDraw}
                      onTouchMove={handleMoveDraw}
                      onTouchEnd={handleEndDraw}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'crosshair',
                        zIndex: 10
                      }}
                    />
                  )}
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', fontSize: '36px', marginBottom: '8px' }}>
                  <span>📸</span>
                  <span>🎥</span>
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#F26000' }}>Toca para seleccionar Foto o Video</span>
                <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginTop: '6px' }}>
                  Foto completa sin recortar + Editor estilo WhatsApp
                </span>
              </div>
            )}
          </label>
        </div>

        {/* CAMPO DE DESCRIPCIÓN Y PILLS DE TAGS */}
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

        {/* BOTONES DE ACCIÓN (CANCELAR / PUBLICAR) */}
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
