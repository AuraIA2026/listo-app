import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, updateDoc, doc, getDoc, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import listoLogo from '../assets/logo listo blanco.png'
import ReciboDigitalModal from '../components/ReciboDigitalModal'

const compressImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 600
      let { width, height } = img
      if (width > height) { if (width > MAX) { height = Math.round(height * MAX / width); width = MAX } }
      else { if (height > MAX) { width = Math.round(width * MAX / height); height = MAX } }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = reject; img.src = e.target.result
  }
  reader.onerror = reject; reader.readAsDataURL(file)
})

export default function WorkDonePage({ lang = 'es', navigate, professional, userRole, userData }) {
  console.log('WorkDonePage montado. userRole:', userRole, 'userData:', userData)
  const storedUserStr = localStorage.getItem('listoUserData') || '{}'
  let storedUser = {}
  try { storedUser = JSON.parse(storedUserStr) } catch (e) {}
  
  const finalUserData = userData || storedUser || {}
  const typeStr = String(userRole || finalUserData?.type || finalUserData?.role || '').toLowerCase()
  
  // Parche supremo: permitir forzado manual
  const forcePro = localStorage.getItem('forceListoPro') === 'true'
  const isPro = forcePro || typeStr.includes('pro') || typeStr === 'profesional' || typeStr === 'profecional' || !!finalUserData?.category
  
  console.log('WorkDonePage montado -> typeStr:', typeStr, '| isPro final:', isPro, '| finalUserData:', finalUserData)
  
  const proName = professional?.name || professional?.nombre || ''

  const [hasMoreUnrated, setHasMoreUnrated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetchTrigger, setFetchTrigger] = useState(0)

  const [formData, setFormData] = useState({
    nombreProfesional: proName,
    fechaFinalizacion: '',
    calificacion: 0,
    completado: '',
    puntualidad: '',
    recomendaria: '',
    montoAcordado: '',
    montoFinal: '',
    formaPago: '',
    gastosAdicionales: '',
    experiencia: '',
  })
  const [fotos, setFotos] = useState([]) // max 3 previews
  const [submitted, setSubmitted] = useState(false)
  const [latestOrder, setLatestOrder] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [quejaTexto, setQuejaTexto] = useState('')
  const [showReciboModal, setShowReciboModal] = useState(false)
  const [pendingRequests, setPendingRequests] = useState([])

  useEffect(() => {
    if (!isPro || !finalUserData?.uid) return
    const q = query(
      collection(db, 'profile_edit_requests'),
      where('userId', '==', finalUserData.uid),
      where('status', '==', 'pending')
    )
    const unsub = onSnapshot(q, (snap) => {
      setPendingRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, (err) => console.error(err))

    return () => unsub()
  }, [isPro, finalUserData?.uid])

  const handleDirectProfilePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const base64 = await compressImage(file)
      const docRef1 = await addDoc(collection(db, 'profile_edit_requests'), {
        userId: finalUserData.uid,
        userName: finalUserData.name || 'Profesional',
        requestedChanges: { photoURL: base64 },
        status: 'pending',
        createdAt: serverTimestamp(),
        type: 'photo'
      })
      await addDoc(collection(db, 'notificaciones'), {
        userId: 'admin',
        fromUserId: finalUserData.uid,
        editRequestId: docRef1.id,
        userEmail: finalUserData.email || '',
        userName: finalUserData.name || 'Profesional',
        requestedChanges: { photoURL: base64 },
        type: 'new_edit_request_photo',
        title: '📷 SOLICITUD DE CAMBIO DE FOTO DE PERFIL',
        text: `El profesional ${finalUserData.name || 'Un profesional'} ha solicitado actualizar su foto de perfil.`,
        read: false,
        createdAt: serverTimestamp(),
        date: new Date().toISOString()
      })
      alert(lang === 'es'
        ? '¡Solicitud enviada! Tu nueva foto de perfil ha sido enviada a la Central de Mando para su autorización.'
        : 'Request sent! Your new profile photo has been sent for approval.'
      )
    } catch (err) {
      console.error(err)
      alert(lang === 'es' ? 'Error al subir la foto de perfil.' : 'Error uploading profile photo.')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDirectCoverPhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const base64 = await compressImage(file)
      const docRef2 = await addDoc(collection(db, 'profile_edit_requests'), {
        userId: finalUserData.uid,
        userName: finalUserData.name || 'Profesional',
        requestedChanges: { coverURL: base64 },
        status: 'pending',
        createdAt: serverTimestamp(),
        type: 'cover'
      })
      await addDoc(collection(db, 'notificaciones'), {
        userId: 'admin',
        fromUserId: finalUserData.uid,
        editRequestId: docRef2.id,
        userEmail: finalUserData.email || '',
        userName: finalUserData.name || 'Profesional',
        requestedChanges: { coverURL: base64 },
        type: 'new_edit_request_cover',
        title: '🖼️ SOLICITUD DE CAMBIO DE PORTADA',
        text: `El profesional ${finalUserData.name || 'Un profesional'} ha solicitado actualizar su foto de portada.`,
        read: false,
        createdAt: serverTimestamp(),
        date: new Date().toISOString()
      })
      alert(lang === 'es'
        ? '¡Solicitud enviada! Tu nueva foto de portada ha sido enviada a la Central de Mando para su autorización.'
        : 'Request sent! Your new cover photo has been sent for approval.'
      )
    } catch (err) {
      console.error(err)
      alert(lang === 'es' ? 'Error al subir la foto de portada.' : 'Error uploading cover photo.')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDirectWorkPhotoUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setIsUploading(true)
    try {
      const uploadPromises = Array.from(files).map(file => compressImage(file))
      const base64Images = await Promise.all(uploadPromises)
      
      const currentPhotos = finalUserData.photos || []
      const updatedPhotos = [...currentPhotos, ...base64Images]

      const docRef3 = await addDoc(collection(db, 'profile_edit_requests'), {
        userId: finalUserData.uid,
        userName: finalUserData.name || 'Profesional',
        requestedChanges: { photos: updatedPhotos },
        status: 'pending',
        createdAt: serverTimestamp(),
        type: 'work_photo'
      })

      await addDoc(collection(db, 'notificaciones'), {
        userId: 'admin',
        fromUserId: finalUserData.uid,
        editRequestId: docRef3.id,
        userEmail: finalUserData.email || '',
        userName: finalUserData.name || 'Profesional',
        requestedChanges: { photos: updatedPhotos },
        type: 'new_edit_request_work',
        title: '💼 SOLICITUD DE NUEVAS FOTOS DE TRABAJOS',
        text: `El profesional ${finalUserData.name || 'Un profesional'} ha solicitado agregar fotos de trabajos realizados.`,
        read: false,
        createdAt: serverTimestamp(),
        date: new Date().toISOString()
      })

      alert(lang === 'es'
        ? '¡Solicitud enviada! Las fotos de tus trabajos realizados han sido enviadas a la Central de Mando para su autorización.'
        : 'Request sent! Your work photos have been sent for approval.'
      )
    } catch (err) {
      console.error(err)
      alert(lang === 'es' ? 'Error al subir fotos de trabajos.' : 'Error uploading work photos.')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  useEffect(() => {
    if (!finalUserData?.uid) {
      setLoading(false)
      return
    }
    const fetchLatestOrder = async () => {
      setLoading(true)
      try {
        // 1. Si venimos directamente desde el proceso de pago con el ID exacto del pedido:
        if (professional?.orderId) {
          const snap = await getDoc(doc(db, 'orders', professional.orderId))
          if (snap.exists()) {
            const currentOrder = { id: snap.id, ...snap.data() }
            setLatestOrder(currentOrder)
            if (!isPro) {
              setFormData(prev => ({ ...prev, nombreProfesional: snap.data().proName || snap.data().pro || proName }))
            }
            
            // Buscar si hay otros pedidos pendientes de calificar
            let q = query(collection(db, 'orders'), where('clientId', '==', finalUserData.uid))
            const snapAll = await getDocs(q)
            const allDocs = []
            snapAll.forEach(d => {
              if (d.id !== professional.orderId) {
                allDocs.push({ id: d.id, ...d.data() })
              }
            })
            const otherUnrated = allDocs.filter(d => d.status === 'done' && !d.rated)
            setHasMoreUnrated(otherUnrated.length > 0)
            setLoading(false)
            return
          }
        }
        
        // 2. Comportamiento por defecto: buscar el último pedido
        let q;
        if (isPro) {
          q = query(collection(db, 'orders'), where('proId', '==', finalUserData.uid))
        } else {
          q = query(collection(db, 'orders'), where('clientId', '==', finalUserData.uid))
        }
        
        const snap = await getDocs(q)
        const docs = []
        snap.forEach(d => docs.push({ id: d.id, ...d.data() }))
        docs.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
        
        if (isPro) {
          if (docs.length > 0) {
            setLatestOrder(docs[0])
          } else {
            setLatestOrder(null)
          }
          setHasMoreUnrated(false)
        } else {
          const unratedOrders = docs.filter(d => d.status === 'done' && !d.rated)
          if (unratedOrders.length > 0) {
            setLatestOrder(unratedOrders[0])
            setHasMoreUnrated(unratedOrders.length > 1)
            setFormData(prev => ({
              ...prev,
              nombreProfesional: unratedOrders[0].proName || unratedOrders[0].pro || ''
            }))
          } else {
            setLatestOrder(null)
            setHasMoreUnrated(false)
          }
        }
      } catch (err) {
        console.error("Error fetching latest order:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLatestOrder()
  }, [isPro, finalUserData, fetchTrigger])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleStar = (n) => {
    setFormData({ ...formData, calificacion: n })
  }

  const handleFotos = (e) => {
    const files = Array.from(e.target.files)
    const remaining = 3 - fotos.length
    const newFiles = files.slice(0, remaining)
    // Guardamos el obj file original para subir a Firebase Storage
    const previews = newFiles.map(f => ({ file: f, url: URL.createObjectURL(f), name: f.name }))
    setFotos(prev => [...prev, ...previews])
  }

  const removePhoto = (idx) => {
    setFotos(prev => prev.filter((_, i) => i !== idx))
  }

  const resetForm = () => {
    setSubmitted(false)
    setFotos([])
    setQuejaTexto('')
    setFormData({ nombreProfesional: proName, fechaFinalizacion:'', calificacion:0, completado:'', puntualidad:'', recomendaria:'', montoAcordado:'', montoFinal:'', formaPago:'', gastosAdicionales:'', experiencia:'' })
    setFetchTrigger(prev => prev + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!latestOrder) {
      alert("No tienes trabajos recientes para evaluar.")
      return
    }

    if (formData.calificacion <= 0) {
      alert("Por favor selecciona una calificación de estrellas para finalizar.")
      return
    }

    setIsUploading(true)
    try {
      // Auto-completar reseñas vacías para que no sean invisibles en el Home
      let finalComment = formData.experiencia?.trim() || ''
      if (!finalComment && formData.calificacion >= 4) {
        finalComment = "¡Excelente servicio! Muy recomendado."
      } else if (!finalComment && formData.calificacion > 0) {
        finalComment = "Servicio completado."
      }

      const tipVal = parseFloat(formData.propina || 0)

      // Actualizar Firestore orders
      await updateDoc(doc(db, 'orders', latestOrder.id), {
        rated: true,
        ratingScore: formData.calificacion,
        ratingComment: finalComment,
        reviewerName: finalUserData?.name || 'Cliente',
        checkoutMontoAcordado: formData.montoAcordado || '',
        checkoutMontoFinal: formData.montoFinal || '',
        checkoutFormaPago: formData.formaPago || '',
        tipAmount: tipVal,
        propina: tipVal
      })

      // Notificar al profesional con push nativo y otorgar progreso/contrato gratis
      if (latestOrder.proId) {
        let notifText = lang==='es' ? `Recibiste ${formData.calificacion} estrellas por Trabajo Listo.` : `You received a ${formData.calificacion} star rating.`
        if (tipVal > 0) {
          notifText += lang==='es' ? ` 🎁 ¡Además recibiste RD$ ${tipVal} de propina!` : ` 🎁 Plus you received a RD$ ${tipVal} tip!`
        }

        await addDoc(collection(db, 'notificaciones'), {
          userId:    latestOrder.proId,
          orderId:   latestOrder.id,
          type:      'new_review',
          title:     tipVal > 0 ? (lang==='es' ? '⭐ ¡Reseña + 🎁 Propina Recibida!' : '⭐ Review + 🎁 Tip Received!') : (lang==='es' ? '⭐ ¡Nueva Reseña!' : '⭐ New Review!'),
          text:      notifText,
          read:      false,
          icon:      tipVal > 0 ? '🎁' : '⭐',
          createdAt: serverTimestamp()
        })

        // Auto-acreditar contrato gratis al profesional por 100% progreso / 10 contratos
        try {
          const proRef = doc(db, 'users', latestOrder.proId);
          const proSnap = await getDoc(proRef);
          if (proSnap.exists()) {
            const proData = proSnap.data();
            const currentCompleted = proData.completedContracts || 0;
            const newCompleted = currentCompleted + 1;
            const proUpdate = { completedContracts: newCompleted };
            if (formData.calificacion >= 4) {
              proUpdate.has5StarContract = true;
              proUpdate.completed5StarCount = (proData.completed5StarCount || 0) + 1;
            }
            
            if (newCompleted % 10 === 0) {
              proUpdate.contracts = (proData.contracts || 0) + 1;
              proUpdate.spinsAvailable = (proData.spinsAvailable || 0) + 1;
              proUpdate.wheelProgress = 100;
              await addDoc(collection(db, 'notificaciones'), {
                userId: latestOrder.proId,
                type: 'reward',
                title: '🎰 ¡RULETA Y CONTRATO GRATIS OTORGADOS!',
                text: `¡Felicidades! Has completado ${newCompleted} trabajos y la Ruleta Listo Patrón se ha activado. Te acreditamos +1 contrato gratis automáticamente a tu saldo.`,
                read: false,
                icon: '🎰',
                createdAt: serverTimestamp()
              });
            } else {
              const currentProgress = proData.wheelProgress || 0;
              const nextProgress = currentProgress + 10;
              // Si obtuvo 4 o 5 estrellas, le otorgamos 1 giro de ruleta
              if (formData.calificacion >= 4) {
                proUpdate.spinsAvailable = (proData.spinsAvailable || 0) + 1;
                await addDoc(collection(db, 'notificaciones'), {
                  userId: latestOrder.proId,
                  type: 'reward',
                  title: '🎰 ¡RULETA DESBLOQUEADA!',
                  text: `¡Felicidades por tu excelente trabajo! Recibiste ${formData.calificacion} estrellas ⭐ y desbloqueaste 1 giro en la Ruleta Listo Patrón.`,
                  read: false,
                  icon: '🎰',
                  createdAt: serverTimestamp()
                });
              }

              if (nextProgress >= 100) {
                proUpdate.contracts = (proData.contracts || 0) + 1;
                proUpdate.wheelProgress = nextProgress - 100;
                await addDoc(collection(db, 'notificaciones'), {
                  userId: latestOrder.proId,
                  type: 'reward',
                  title: '🎰 ¡1 CONTRATO GRATIS OTORGADO!',
                  text: '¡Felicidades! Tu barra de la Ruleta Listo Patrón se llenó al 100%. Te acreditamos +1 contrato gratis automáticamente a tu saldo.',
                  read: false,
                  icon: '🎰',
                  createdAt: serverTimestamp()
                });
              } else {
                proUpdate.wheelProgress = nextProgress;
              }
            }
            await updateDoc(proRef, proUpdate);
          }
        } catch (errPro) {
          console.error("Error auto-granting contract reward:", errPro);
        }
      }

      // AGREGAR REPORTE A ADMIN SI TIENE QUEJA
      if (quejaTexto.trim()) {
        await addDoc(collection(db, 'reports'), {
          reporterId: finalUserData.uid || 'unknown',
          reporterName: finalUserData.name || 'Cliente',
          reportedId: latestOrder.proId || 'unknown',
          reportedName: latestOrder.proName || 'Profesional',
          reason: quejaTexto.trim(),
          severity: 'moderada',
          action: 'reported',
          createdAt: serverTimestamp(),
          status: 'pending'
        })
      }

      setSubmitted(true)
    } catch (err) {
      console.error("Error submitting review:", err)
      alert("Error al enviar evaluación. Revisa tu conexión.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmitProPhotos = async (e) => {
    e.preventDefault && e.preventDefault()
    if (fotos.length === 0) {
      alert('Sube al menos 1 foto como comprobante de tu trabajo.')
      return
    }
    if (!latestOrder) {
      alert("No se encontró un pedido activo para subir evidencias.")
      return
    }
    
    setIsUploading(true)
    try {
      // Subir cada foto a Firebase Storage con fallback a base64 si falla Storage
      const uploadPromises = fotos.map(async (fotoObj) => {
        if (!fotoObj.file) return fotoObj.url;
        try {
          const storageRef = ref(storage, `work_evidences/${latestOrder.id}_${Date.now()}_${fotoObj.file.name}`)
          const uploadTask = await uploadBytesResumable(storageRef, fotoObj.file)
          return await getDownloadURL(uploadTask.ref)
        } catch (errStorage) {
          console.warn("[Storage Fallback] Error subiendo evidencia:", errStorage);
          return await compressImage(fotoObj.file);
        }
      })
      
      const downloadedURLs = await Promise.all(uploadPromises)
      
      // Guardar links en Firestore
      await updateDoc(doc(db, 'orders', latestOrder.id), {
        evidences: downloadedURLs,
        evidenceText: formData.experiencia
      })
      
      if (latestOrder.proId) {
        try {
          const proRef = doc(db, 'users', latestOrder.proId);
          const proSnap = await getDoc(proRef);
          if (proSnap.exists()) {
            const proData = proSnap.data();
            const currentCompleted = proData.completedContracts || 0;
            const newCompleted = currentCompleted + 1;
            const proUpdate = { completedContracts: newCompleted };
            
            if (newCompleted % 10 === 0) {
              proUpdate.contracts = (proData.contracts || 0) + 1;
              proUpdate.wheelProgress = 100;
              await addDoc(collection(db, 'notificaciones'), {
                userId: latestOrder.proId,
                type: 'reward',
                title: '🎰 ¡1 CONTRATO GRATIS OTORGADO!',
                text: `¡Felicidades! Has completado ${newCompleted} evidencias y la Ruleta Listo Patrón alcanzó el 100%. Te acreditamos +1 contrato gratis automáticamente a tu saldo.`,
                read: false,
                icon: '🎰',
                createdAt: serverTimestamp()
              });
            } else {
              const currentProgress = proData.wheelProgress || 0;
              const nextProgress = currentProgress + 10;
              if (nextProgress >= 100) {
                proUpdate.contracts = (proData.contracts || 0) + 1;
                proUpdate.wheelProgress = nextProgress - 100;
                await addDoc(collection(db, 'notificaciones'), {
                  userId: latestOrder.proId,
                  type: 'reward',
                  title: '🎰 ¡1 CONTRATO GRATIS OTORGADO!',
                  text: '¡Felicidades! Tu barra de la Ruleta Listo Patrón se llenó al 100%. Te acreditamos +1 contrato gratis automáticamente a tu saldo.',
                  read: false,
                  icon: '🎰',
                  createdAt: serverTimestamp()
                });
              } else {
                proUpdate.wheelProgress = nextProgress;
              }
            }
            await updateDoc(proRef, proUpdate);
          }
        } catch (errPro) {
          console.error("Error auto-granting contract reward on evidence upload:", errPro);
        }
      }
      
      if (finalUserData?.uid) {
        localStorage.removeItem('hideUpgrade_Listo_' + finalUserData.uid)
        localStorage.setItem('showUpgradeOverride_Listo_' + finalUserData.uid, 'true')
      }
      
      setSubmitted(true)
    } catch (err) {
      console.error("Upload error:", err)
      alert("Error subiendo evidencias. Revisa tu conexión de red o Storage rules.")
    } finally {
      setIsUploading(false)
    }
  }

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ color: '#F26000', fontSize: '18px', fontWeight: 'bold' }}>Cargando...</div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={s.page}>
        <div style={s.successBox}>
          <div style={s.successIcon}>✓</div>
          <h2 style={s.successTitle}>¡Trabajo registrado!</h2>
          <p style={s.successSub}>Tu evaluación fue enviada correctamente.</p>
          
          <button 
            style={{ ...s.btnPrimary, background: 'linear-gradient(135deg, #10B981, #059669)', marginBottom: '10px' }} 
            onClick={() => setShowReciboModal(true)}
          >
            🧾 {lang === 'es' ? 'Generar Comprobante Listo' : 'Generate Listo Receipt'}
          </button>

          {!isPro && hasMoreUnrated ? (
            <button style={s.btnPrimary} onClick={resetForm}>
              Registrar otro
            </button>
          ) : (
            <button style={{ ...s.btnPrimary, background: '#1A1A2E' }} onClick={() => navigate('home')}>
              Ir al inicio
            </button>
          )}
        </div>

        {showReciboModal && (
          <ReciboDigitalModal 
            lang={lang} 
            onClose={() => setShowReciboModal(false)} 
            orderData={latestOrder || { proName, clientName: finalUserData?.name, montoFinal: formData.montoFinal || formData.montoAcordado }} 
          />
        )}
      </div>
    )
  }

  if (!isPro && !latestOrder) {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.headerIcon}>
            <img src={listoLogo} alt="Listo" style={{ width: '88px', height: '88px', objectFit: 'contain', marginLeft: '-12px', marginTop: '-10px' }} />
          </div>
          <div>
            <h1 style={s.headerTitle}>Trabajo Listo</h1>
            <p style={s.headerSub}>Registra el cierre del servicio</p>
          </div>
        </div>
        <div style={{ ...s.successBox, minHeight: 'calc(100vh - 164px)' }}>
          <div style={{ ...s.successIcon, background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 8px 32px rgba(16,185,129,0.35)' }}>✓</div>
          <h2 style={s.successTitle}>¡Todo al día!</h2>
          <p style={s.successSub}>No tienes trabajos recientes pendientes por evaluar.</p>
          <button style={{ ...s.btnPrimary, background: '#1A1A2E' }} onClick={() => navigate('home')}>
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  // Si el usuario es PROFESIONAL, cortamos aquí y devolvemos SU pantalla visual única.
  if (isPro) {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.headerIcon}>
             <img src={listoLogo} alt="Listo" style={{ width: '88px', height: '88px', objectFit: 'contain', marginLeft: '-12px', marginTop: '-10px' }} />
          </div>
          <div>
            <h1 style={s.headerTitle}>Trabajo Listo</h1>
            <p style={s.headerSub}>Sube evidencia y revisa tu calificación</p>
          </div>
        </div>

        <div style={s.form}>
          {/* Card de Gestión de Fotos del Profesional (Perfil, Portada, Trabajos Realizados) */}
          <div style={{ ...s.card, background: 'linear-gradient(135deg, #1A1A2E, #252542)', color: 'white', border: '1px solid rgba(242,96,0,0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <p style={{ ...s.sectionLabel, color: '#FF7A1A', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span>📸</span> {lang === 'es' ? 'Gestor de Fotos del Profesional' : 'Pro Photo Manager'}
            </p>
            <p style={{ fontSize: '12px', color: '#CCC', margin: '0 0 14px 0', lineHeight: '1.4' }}>
              {lang === 'es' 
                ? 'Actualiza tu perfil público. Cambia tu foto de perfil, foto de portada o sube una foto por cada trabajo realizado a tu portafolio.'
                : 'Update your public profile. Change your profile photo, cover photo, or upload photos of your completed work.'}
            </p>

            {pendingRequests.length > 0 && (
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #F59E0B', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', fontSize: '12px', color: '#FCD34D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⏳</span>
                <span>{lang === 'es' ? `Tienes ${pendingRequests.length} solicitud(es) de fotos en revisión por la Central de Mando.` : `${pendingRequests.length} photo request(s) under review by Central de Mando.`}</span>
              </div>
            )}

            <input id="pro-direct-avatar" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleDirectProfilePhotoUpload} />
            <input id="pro-direct-cover" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleDirectCoverPhotoUpload} />
            <input id="pro-direct-work" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleDirectWorkPhotoUpload} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                type="button"
                onClick={() => document.getElementById('pro-direct-avatar').click()}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #F26000, #C24E00)', color: 'white', fontWeight: '800', fontSize: '13px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(242,96,0,0.4)' }}
              >
                <span>📷</span> {lang === 'es' ? 'Cambiar Foto de Perfil' : 'Change Profile Photo'}
              </button>

              <button 
                type="button"
                onClick={() => document.getElementById('pro-direct-cover').click()}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: 'white', fontWeight: '800', fontSize: '13px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(59,130,246,0.4)' }}
              >
                <span>🖼️</span> {lang === 'es' ? 'Cambiar Foto de Portada' : 'Change Cover Photo'}
              </button>

              <button 
                type="button"
                onClick={() => document.getElementById('pro-direct-work').click()}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #047857)', color: 'white', fontWeight: '800', fontSize: '13px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}
              >
                <span>💼</span> {lang === 'es' ? 'Subir Foto de Trabajo Realizado (1 por trabajo)' : 'Upload Completed Work Photo (1 per job)'}
              </button>
            </div>
          </div>

          {/* Tarjeta Cliente Asignado */}
          <div style={s.proCard}>
            <div style={s.proAvatar}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="10" r="5.5" fill="white" fillOpacity="0.9"/>
                <path d="M3.5 24c0-5.247 4.253-9.5 9.5-9.5s9.5 4.253 9.5 9.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={s.proLabel}>Cliente atendido</p>
              <p style={s.proName}>{latestOrder?.clientName || 'Cliente Reciente'}</p>
            </div>
          </div>

          <div style={s.card}>
            <p style={s.sectionLabel}>⭐ Reseña del Cliente</p>
            <div style={s.stars}>
              {[1, 2, 3, 4, 5].map(star => (
                 <span key={star} style={{ fontSize: '32px', color: (latestOrder?.ratingScore >= star ? '#F26000' : '#E0D0C0'), padding: '0 4px', stroke: (latestOrder?.ratingScore >= star ? '#F26000' : '#C0B0A0'), strokeWidth: 1 }}>★</span>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginTop: '12px', fontStyle: (latestOrder?.rated && latestOrder?.ratingComment) ? 'normal' : 'italic' }}>
              {latestOrder?.rated && latestOrder?.ratingComment 
                ? `"${latestOrder.ratingComment}"\n— ${latestOrder.clientName || 'Cliente'}` 
                : 'Aún no hay reseña del cliente para este trabajo. ¡Asegúrate de pedirle que te evalúe!'}
            </p>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ ...s.sectionLabel, marginBottom: 0 }}>📷 Evidencia del trabajo finalizado</p>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Máximo 3 fotos</span>
            </div>
            
            <div style={s.photoRow}>
              {fotos.map((foto, idx) => (
                <div key={idx} style={s.photoThumb}>
                  <img src={foto.url} alt={`foto-${idx}`} style={s.photoImg} />
                  <button type="button" onClick={() => removePhoto(idx)} style={s.photoRemove}>✕</button>
                </div>
              ))}
              
              {fotos.length < 3 && (
                <label style={s.photoAdd}>
                  <input type="file" accept="image/*" multiple onChange={handleFotos} style={{ display: 'none' }} />
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M14 6v16M6 14h16" stroke="#F26000" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: '12px', color: '#F26000', fontWeight: '600', marginTop: '4px' }}>
                      {fotos.length === 0 ? 'Agregar foto' : 'Otra foto'}
                    </span>
                </label>
              )}
            </div>
          </div>

          <div style={s.card}>
            <p style={s.sectionLabel}>📝 Detalles del servicio</p>
            <textarea
              name="experiencia"
              value={formData.experiencia}
              onChange={handleChange}
              placeholder="Escribe brevemente los detalles técnicos del trabajo que realizaste..."
              rows={4}
              style={{ ...s.input, resize: 'vertical', minHeight: '80px', marginTop: '4px' }}
            />
          </div>

          <button
            onClick={handleSubmitProPhotos}
            style={s.btnPrimary}
            disabled={submitted || isUploading}
          >
            {isUploading ? 'Subiendo fotos a la nube...' : (submitted ? 'Evidencias Guardadas ✓' : 'Subir Fotos y Terminar ✓')}
          </button>
          <div style={{ height: '100px' }} />
        </div>
      </div>
    )
  }

  // ─── FLUJO CLIENTE (por defecto) ───
  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerIcon}>
          <img src={listoLogo} alt="Listo" style={{ width: '88px', height: '88px', objectFit: 'contain', marginLeft: '-12px', marginTop: '-10px' }} />
        </div>
        <div>
          <h1 style={s.headerTitle}>Trabajo Listo</h1>
          <p style={s.headerSub}>Registra el cierre del servicio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={s.form}>

        {/* Nombre del profesional - fijo */}
        <div style={s.proCard}>
          <div style={s.proAvatar}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="10" r="5.5" fill="white" fillOpacity="0.9"/>
              <path d="M3.5 24c0-5.247 4.253-9.5 9.5-9.5s9.5 4.253 9.5 9.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={s.proLabel}>Profesional asignado</p>
            {proName ? (
              <p style={s.proName}>{proName}</p>
            ) : (
              <input
                type="text"
                name="nombreProfesional"
                placeholder="Nombre del profesional..."
                value={formData.nombreProfesional}
                onChange={handleChange}
                required
                style={s.proInput}
              />
            )}
          </div>
          {proName && <span style={s.proBadge}>✓</span>}
        </div>

        {/* Fecha */}
        <div style={s.card}>
          <p style={s.sectionLabel}>📅 Fecha de finalización</p>
          <input
            type="date"
            name="fechaFinalizacion"
            value={formData.fechaFinalizacion}
            onChange={handleChange}
            required
            style={s.input}
          />
        </div>

        {/* Si NO ES PRO, mostramos el formulario del CLIENTE */}
        {!isPro && (
          <>
            {/* Preguntas rápidas */}
            <div style={s.card}>
              <p style={s.sectionLabel}>✅ Evaluación del servicio</p>
              
              <div style={s.field}>
                <label style={s.label}>¿El trabajo se completó según lo acordado?</label>
                <div style={s.optRow}>
                  {['Sí', 'Parcialmente', 'No'].map(opt => (
                    <button key={opt} type="button"
                      style={formData.completado === opt ? s.optActive : s.opt}
                      onClick={() => setFormData({...formData, completado: opt})}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>¿Fue puntual?</label>
                <div style={s.optRow}>
                  {['Sí', 'No'].map(opt => (
                    <button key={opt} type="button"
                      style={formData.puntualidad === opt ? s.optActive : s.opt}
                      onClick={() => setFormData({...formData, puntualidad: opt})}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>¿Recomendarías al profesional?</label>
                <div style={s.optRow}>
                  {['Sí', 'No'].map(opt => (
                    <button key={opt} type="button"
                      style={formData.recomendaria === opt ? s.optActive : s.opt}
                      onClick={() => setFormData({...formData, recomendaria: opt})}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Costos */}
            <div style={s.card}>
              <p style={s.sectionLabel}>💰 Información de pago</p>

              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Monto acordado</label>
                  <div style={s.inputWrapper}>
                    <span style={s.inputPrefix}>$</span>
                    <input type="number" name="montoAcordado" placeholder="0.00"
                      value={formData.montoAcordado} onChange={handleChange}
                      style={{...s.input, paddingLeft: '28px'}} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Monto final pagado</label>
                  <div style={s.inputWrapper}>
                    <span style={s.inputPrefix}>$</span>
                    <input type="number" name="montoFinal" placeholder="0.00"
                      value={formData.montoFinal} onChange={handleChange}
                      style={{...s.input, paddingLeft: '28px'}} />
                  </div>
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Forma de pago</label>
                <div style={s.optRow}>
                  {['Efectivo', 'Transferencia', 'Tarjeta'].map(opt => (
                    <button key={opt} type="button"
                      style={formData.formaPago === opt ? s.optActive : s.opt}
                      onClick={() => setFormData({...formData, formaPago: opt})}>
                      {opt === 'Efectivo' ? '💵' : opt === 'Transferencia' ? '🏦' : '💳'} {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Gastos adicionales (opcional)</label>
                <input type="text" name="gastosAdicionales" placeholder="Ej: materiales extra..."
                  value={formData.gastosAdicionales} onChange={handleChange}
                  style={s.input} />
              </div>

              {/* 🎁 Selector de Propina Digital */}
              <div style={{ marginTop: '16px', background: 'linear-gradient(135deg, #FFF3EC 0%, #FFE4D6 100%)', padding: '14px', borderRadius: '16px', border: '1.5px solid #FFD4B0' }}>
                <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '800', color: '#C24D00', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎁</span> {lang === 'es' ? 'Propina al Profesional (Opcional)' : 'Tip the Professional (Optional)'}
                </p>
                <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#883A00' }}>
                  {lang === 'es' ? 'Recompensa su buen servicio. El 100% de la propina va directo al técnico.' : '100% of the tip goes directly to the technician.'}
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[0, 100, 200, 500].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData({ ...formData, propina: val })}
                      style={{
                        flex: 1,
                        minWidth: '65px',
                        padding: '8px 10px',
                        borderRadius: '12px',
                        border: formData.propina === val ? '2px solid #F26000' : '1px solid #FFC299',
                        background: formData.propina === val ? '#F26000' : '#ffffff',
                        color: formData.propina === val ? '#ffffff' : '#C24D00',
                        fontWeight: '800',
                        fontSize: '12px',
                        cursor: 'pointer',
                        boxShadow: formData.propina === val ? '0 4px 10px rgba(242,96,0,0.25)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {val === 0 ? (lang === 'es' ? 'Sin propina' : 'No tip') : `RD$ ${val}`}
                    </button>
                  ))}
                </div>
                {formData.propina > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: '800', color: '#059669', background: '#ECFDF5', padding: '8px 12px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                    <span>Total con propina incluida:</span>
                    <span>RD$ {(parseFloat(formData.montoFinal || formData.montoAcordado || 0) + formData.propina).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Experiencia (Solo Cliente) */}
            <div style={s.card}>
              <p style={s.sectionLabel}>💬 Cuéntanos tu experiencia</p>
              <textarea
                name="experiencia"
                rows="4"
                placeholder="Describe cómo fue el servicio, qué se hizo, detalles importantes..."
                value={formData.experiencia}
                onChange={handleChange}
                style={s.textarea}
              />
            </div>

            {/* Calificación estrellas */}
            <div style={s.card}>
              <p style={s.sectionLabel}>⭐ Calificación del profesional</p>
              <div style={s.stars}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => handleStar(n)} style={s.starBtn}>
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <path
                        d="M18 4L21.8 13.6H32L23.8 19.6L26.9 29.6L18 23.6L9.1 29.6L12.2 19.6L4 13.6H14.2L18 4Z"
                        fill={n <= formData.calificacion ? '#F26000' : '#E0D0C0'}
                        stroke={n <= formData.calificacion ? '#F26000' : '#C0B0A0'}
                        strokeWidth="1"
                      />
                    </svg>
                  </button>
                ))}
              </div>
              <p style={s.starLabel}>
                {formData.calificacion === 0 ? 'Toca para calificar' :
                 formData.calificacion === 1 ? 'Muy malo' :
                 formData.calificacion === 2 ? 'Regular' :
                 formData.calificacion === 3 ? 'Bueno' :
                 formData.calificacion === 4 ? 'Muy bueno' : 'Excelente ✨'}
              </p>
            </div>

            {/* ¿Alguna queja? (Opcional) */}
            <div style={s.card}>
              <p style={{ ...s.sectionLabel, display: 'flex', alignItems: 'center', gap: '8px', color: '#B91C1C', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>🚨</span> ¿Alguna queja? (Opcional)
              </p>
              <label style={{ ...s.label, marginBottom: '10px', lineHeight: 1.4 }}>
                Si el profesional tuvo un comportamiento extraño, inusual o sospechoso, escribe tu reporte aquí para que la Central de Mando lo audite de inmediato:
              </label>
              <textarea
                value={quejaTexto}
                onChange={(e) => setQuejaTexto(e.target.value)}
                placeholder="Escribe aquí tu reporte o queja..."
                rows={3}
                style={s.textarea}
              />
            </div>
          </>
        )}
        <button type="submit" style={s.btnPrimary} disabled={submitted || isUploading}>
          {isUploading ? 'Enviando...' : (submitted ? 'Evaluación enviada ✓' : 'Finalizar y Enviar ✓')}
        </button>

        <div style={{ height: '100px' }} />
      </form>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#FAF7F5',
    fontFamily: "'DM Sans', sans-serif",
    paddingBottom: '80px',
  },
  header: {
    background: 'linear-gradient(135deg, #F26000, #FF8533)',
    padding: '48px 24px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: '22px',
    fontWeight: '700',
    fontFamily: "'Syne', sans-serif",
    margin: 0,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '13px',
    margin: 0,
    marginTop: '2px',
  },
  form: {
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '18px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  sectionLabel: {
    fontWeight: '700',
    fontSize: '14px',
    color: '#1C1C1C',
    marginBottom: '14px',
    fontFamily: "'Syne', sans-serif",
  },
  field: {
    marginBottom: '14px',
  },
  label: {
    fontSize: '13px',
    color: '#5A5A5A',
    marginBottom: '8px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #EEE',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1C1C1C',
    background: '#FAFAFA',
    boxSizing: 'border-box',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputPrefix: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#5A5A5A',
    fontSize: '14px',
    pointerEvents: 'none',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #EEE',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1C1C1C',
    background: '#FAFAFA',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
  },
  stars: {
    display: 'flex',
    gap: '4px',
    marginBottom: '8px',
  },
  starBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
  },
  starLabel: {
    fontSize: '13px',
    color: '#F26000',
    fontWeight: '600',
    textAlign: 'center',
  },
  optRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  opt: {
    padding: '8px 16px',
    border: '1.5px solid #EEE',
    borderRadius: '8px',
    background: '#FAFAFA',
    fontSize: '13px',
    color: '#5A5A5A',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  optActive: {
    padding: '8px 16px',
    border: '1.5px solid #F26000',
    borderRadius: '8px',
    background: '#FFF0E6',
    fontSize: '13px',
    color: '#F26000',
    cursor: 'pointer',
    fontWeight: '600',
    fontFamily: "'DM Sans', sans-serif",
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #F26000, #FF8533)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
    boxShadow: '0 4px 16px rgba(242,96,0,0.35)',
  },
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '40px',
    gap: '16px',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #F26000, #FF8533)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    color: 'white',
    fontWeight: '700',
    boxShadow: '0 8px 32px rgba(242,96,0,0.35)',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '800',
    fontFamily: "'Syne', sans-serif",
    color: '#1C1C1C',
  },
  successSub: {
    fontSize: '15px',
    color: '#5A5A5A',
    textAlign: 'center',
  },
  proCard: {
    background: 'linear-gradient(135deg, #F26000, #FF8533)',
    borderRadius: '16px',
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 4px 16px rgba(242,96,0,0.3)',
  },
  proAvatar: {
    width: '46px',
    height: '46px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  proLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.75)',
    margin: 0,
    marginBottom: '3px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  proName: {
    fontSize: '17px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    fontFamily: "'Syne', sans-serif",
  },
  proInput: {
    background: 'rgba(255,255,255,0.2)',
    border: '1.5px solid rgba(255,255,255,0.4)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '15px',
    color: 'white',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
  },
  proBadge: {
    width: '28px',
    height: '28px',
    background: 'rgba(255,255,255,0.25)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
  },
  photoRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  photoThumb: {
    width: '90px',
    height: '90px',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
    border: '2px solid #F26000',
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoRemove: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '22px',
    height: '22px',
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },
  photoAdd: {
    width: '90px',
    height: '90px',
    borderRadius: '12px',
    border: '2px dashed #F26000',
    background: '#FFF0E6',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    gap: '2px',
  },
}