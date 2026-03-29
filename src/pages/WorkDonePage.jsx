import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, updateDoc, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import listoLogo from '../assets/logo listo blanco.png'

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

  useEffect(() => {
    if (!finalUserData?.uid) return
    const fetchLatestOrder = async () => {
      try {
        // 1. Si venimos directamente desde el proceso de pago con el ID exacto del pedido:
        if (professional?.orderId) {
          const snap = await getDoc(doc(db, 'orders', professional.orderId))
          if (snap.exists()) {
            setLatestOrder({ id: snap.id, ...snap.data() })
            if (!isPro) {
              setFormData(prev => ({ ...prev, nombreProfesional: snap.data().proName || snap.data().pro || proName }))
            }
            return // Terminamos aquí sin buscar el "último pedido genérico"
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
        
        if (docs.length > 0) {
          setLatestOrder(docs[0])
          if (!isPro) {
            setFormData(prev => ({
              ...prev,
              nombreProfesional: docs[0].proName || docs[0].pro || ''
            }))
          }
        }
      } catch (err) {
        console.error("Error fetching latest order:", err)
      }
    }
    fetchLatestOrder()
  }, [isPro, finalUserData])

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
    setFormData({ nombreProfesional: proName, fechaFinalizacion:'', calificacion:0, completado:'', puntualidad:'', recomendaria:'', montoAcordado:'', montoFinal:'', formaPago:'', gastosAdicionales:'', experiencia:'' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!latestOrder) {
      alert("No tienes trabajos recientes para evaluar.")
      return
    }

    if (formData.calificacion >= 4 || formData.calificacion > 0) {
      setIsUploading(true)
      try {
        // Auto-completar reseñas vacías para que no sean invisibles en el Home
        let finalComment = formData.experiencia?.trim() || ''
        if (!finalComment && formData.calificacion >= 4) {
          finalComment = "¡Excelente servicio! Muy recomendado."
        } else if (!finalComment && formData.calificacion > 0) {
          finalComment = "Servicio completado."
        }

        // Actualizar Firestore orders
        await updateDoc(doc(db, 'orders', latestOrder.id), {
          rated: true,
          ratingScore: formData.calificacion,
          ratingComment: finalComment,
          reviewerName: finalUserData?.name || 'Cliente',
          checkoutMontoAcordado: formData.montoAcordado || '',
          checkoutMontoFinal: formData.montoFinal || '',
          checkoutFormaPago: formData.formaPago || ''
        })

        // Notificar al profesional con push nativo
        if (latestOrder.proId) {
          await addDoc(collection(db, 'notificaciones'), {
            userId:    latestOrder.proId,
            orderId:   latestOrder.id,
            type:      'new_review',
            title:     lang==='es' ? '⭐ ¡Nueva Reseña!' : '⭐ New Review!',
            text:      lang==='es' ? `Recibiste ${formData.calificacion} estrellas por Trabajo Listo.` : `You received a ${formData.calificacion} star rating.`,
            read:      false,
            icon:      '⭐',
            createdAt: serverTimestamp()
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
      // Subir cada foto a Firebase Storage (evita corromper la DB con base64 gigante)
      const uploadPromises = fotos.map(async (fotoObj) => {
        if (!fotoObj.file) return fotoObj.url;
        const storageRef = ref(storage, `work_evidences/${latestOrder.id}_${Date.now()}_${fotoObj.file.name}`)
        const uploadTask = await uploadBytesResumable(storageRef, fotoObj.file)
        return await getDownloadURL(uploadTask.ref)
      })
      
      const downloadedURLs = await Promise.all(uploadPromises)
      
      // Guardar links en Firestore
      await updateDoc(doc(db, 'orders', latestOrder.id), {
        evidences: downloadedURLs,
        evidenceText: formData.experiencia
      })
      
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

  if (submitted) {
    return (
      <div style={s.page}>
        <div style={s.successBox}>
          <div style={s.successIcon}>✓</div>
          <h2 style={s.successTitle}>¡Trabajo registrado!</h2>
          <p style={s.successSub}>Tu evaluación fue enviada correctamente.</p>
          <button style={s.btnPrimary} onClick={resetForm}>
            Registrar otro
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
    borderRadius: '20px',
    background: '#FAFAFA',
    fontSize: '13px',
    color: '#5A5A5A',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  optActive: {
    padding: '8px 16px',
    border: '1.5px solid #F26000',
    borderRadius: '20px',
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