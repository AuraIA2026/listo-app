// src/locales/LocalDetalle.jsx
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import './Locales.css'
import { FaClock, FaMoneyBillWave, FaCreditCard, FaExchangeAlt, FaWhatsapp, FaInstagram } from 'react-icons/fa'

function compressImage(file, maxSize = 400) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

const avatarColors = ['#F26000','#C24D00','#FF8533','#7A3000','#FFB380']

function getAvatarColor(str) {
  return avatarColors[Array.from(str || 'L').reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length]
}

const PAGO_LABELS = {
  efectivo: { icon: <FaMoneyBillWave/>, text: 'Efectivo' },
  transferencia: { icon: <FaExchangeAlt/>, text: 'Transferencia' },
  tarjeta: { icon: <FaCreditCard/>, text: 'Tarjetas' },
  paypal: { icon: '📱', text: 'PayPal' }
}

function getStartingPrice(servicios) {
  if (!servicios || servicios.length === 0) return 'A convenir'
  const prices = servicios
    .map(s => {
      if (s.tipoPrecio === 'convenir') return null
      const num = parseFloat(String(s.precio).replace(/[^0-9.]/g, ''))
      return isNaN(num) ? null : num
    })
    .filter(p => p !== null)
  
  if (prices.length === 0) return 'A convenir'
  const min = Math.min(...prices)
  return `Desde RD$ ${min.toLocaleString()}`
}

export default function LocalDetalle({ lang = 'es', navigate, local: propLocal, userData, userRole }) {
  const [currentLocal, setCurrentLocal] = useState(propLocal)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [tempTeam, setTempTeam] = useState([])
  const [savingTeam, setSavingTeam] = useState(false)

  const [resenas,        setResenas]        = useState([])
  const [loadingResenas, setLoadingResenas] = useState(true)
  const [activeTab,      setActiveTab]      = useState('servicios')

  useEffect(() => {
    setCurrentLocal(propLocal)
  }, [propLocal])

  const local = currentLocal
  const isOwner = userData && local && (local.proId === userData.uid)

  const initials = (local?.nombre || 'L').substring(0, 2).toUpperCase()
  const avatarBg = getAvatarColor(local?.id || local?.nombre || 'L')

  const handleSaveTeam = async () => {
    setSavingTeam(true)
    try {
      const filteredTeam = tempTeam.filter(p => p.nombre.trim())
      await updateDoc(doc(db, 'locales', local.id), {
        profesionales: filteredTeam
      })
      setCurrentLocal(prev => ({ ...prev, profesionales: filteredTeam }))
      setShowTeamModal(false)
      alert(lang === 'es' ? '¡Equipo de profesionales guardado con éxito!' : 'Team of professionals saved successfully!')
    } catch (err) {
      console.error(err)
      alert(lang === 'es' ? 'Error al guardar el equipo.' : 'Error saving the team.')
    } finally {
      setSavingTeam(false)
    }
  }

  const handleEliminarLocal = async () => {
    const confirmDel = window.confirm(lang === 'es'
      ? '¿Estás seguro de que deseas eliminar permanentemente tu Local VIP? Esta acción no se puede deshacer.'
      : 'Are you sure you want to permanently delete your VIP Local? This action cannot be undone.'
    )
    if (!confirmDel) return
    try {
      await deleteDoc(doc(db, 'locales', local.id))
      alert(lang === 'es' ? '¡Local VIP eliminado con éxito!' : 'VIP Local deleted successfully!')
      navigate('profile')
    } catch (err) {
      console.error(err)
      alert(lang === 'es' ? 'Error al eliminar el local.' : 'Error deleting the local.')
    }
  }

  const handleWhatsappClick = () => {
    if (!local?.whatsapp) return
    let number = local.whatsapp.replace(/[^0-9]/g, '')
    if (number.length === 10 && (number.startsWith('809') || number.startsWith('829') || number.startsWith('849'))) {
      number = '1' + number
    }
    window.open(`https://wa.me/${number}`, '_blank')
  }

  useEffect(() => {
    if (!local?.proId) { setLoadingResenas(false); return }
    const fetchResenas = async () => {
      try {
        const q = query(collection(db, 'orders'), where('proId', '==', local.proId), where('rated', '==', true))
        const snap = await getDocs(q)
        const lista = []
        snap.forEach(doc => {
          const d = doc.data()
          if (d.ratingComment?.trim()) {
            lista.push({
              id:          doc.id,
              clientName:  d.clientName  || 'Cliente',
              clientPhoto: d.clientPhoto || null,
              comment:     d.ratingComment,
              score:       d.ratingScore || 5,
            })
          }
        })
        setResenas(lista.slice(0, 10))
      } catch (e) { console.error(e) } finally { setLoadingResenas(false) }
    }
    fetchResenas()
  }, [local?.proId])

  if (!local) return null

  const servicios = local.servicios || []
  const rating    = local.rating    || 5
  const contratos = local.contratos || 0
  const pagos = local.pagos || []
  const fotosTrabajos = local.fotosTrabajos || []
  const startingPrice = getStartingPrice(servicios)
  const profesionales = local.profesionales || []

  return (
    <div className="local-detalle-page marketplace-detail">

      {/* PORTADA Y HEADER */}
      <div className="local-detalle-header">
        {local.portadaURL
          ? <img src={local.portadaURL} alt={local.nombre} className="local-detalle-portada" />
          : <div className="local-detalle-portada-placeholder">🏢</div>}
        <button className="local-detalle-back" onClick={() => navigate('locales')}>←</button>
      </div>

      {/* INFO CARD PRINCIPAL ESTILO MARKETPLACE */}
      <div className="local-detalle-info-card marketplace-info-block">
        <div className="local-detalle-logo-row">
          {local.logoURL
            ? <img src={local.logoURL} alt="logo" className="local-detalle-logo" />
            : <div className="local-detalle-logo-placeholder" style={{ background: avatarBg }}>{initials}</div>}
          <div style={{ flex: 1 }} />
          {isOwner && (
            <div style={{ display: 'flex', gap: '6px', marginRight: '8px' }}>
              <button className="ld-btn-owner-edit" onClick={() => navigate('editarLocal', local)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}>
                ✏️ Editar
              </button>
              <button className="ld-btn-owner-delete" onClick={handleEliminarLocal} style={{ background: 'rgba(255,77,77,0.12)', border: '1px solid rgba(255,77,77,0.3)', color: '#ff4d4d', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}>
                🗑️ Eliminar
              </button>
            </div>
          )}
          <span className="local-detalle-vip-badge glow">👑 Local VIP</span>
        </div>

        <h1 className="local-detalle-nombre">{local.nombre || 'Local VIP'}</h1>
        <p className="local-detalle-categoria">🔧 {local.categoria || 'Servicios Especializados'}</p>
        
        {/* Precio Prominente Estilo Facebook Marketplace */}
        <div className="local-detalle-precio-tag">{startingPrice}</div>

        <div className="local-detalle-stats">
          <div className="local-detalle-stat"><span className="ld-num">★ {Number(rating||5).toFixed(1)}</span><span className="ld-lbl">Calificación</span></div>
          <div className="local-detalle-stat"><span className="ld-num">{contratos}</span><span className="ld-lbl">Contratos</span></div>
          <div className="local-detalle-stat"><span className="ld-num">{servicios.length}</span><span className="ld-lbl">Servicios</span></div>
        </div>

        {profesionales.length > 0 && (
          <div className="ld-ver-equipo-banner" onClick={() => setActiveTab('equipo')} style={{ cursor: 'pointer', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '10px', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '14px', fontSize: '13px', fontWeight: 'bold', color: 'var(--vip-gold)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            <span>👥 Ver Equipo y Reservar con Profesionales ({profesionales.length}) ➔</span>
          </div>
        )}

        <div className="ld-actions-row">
          <button className="ld-btn-primary glow" style={{ flex: 1 }} onClick={() => navigate('booking', { id: local.proId, name: local.proNombre || local.nombre, ...local })}>
            🤝 {lang === 'es' ? 'Contratar servicio' : 'Hire now'}
          </button>
        </div>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="ld-tabs-container">
        <button className={`ld-tab ${activeTab==='servicios'?'active':''}`} onClick={()=>setActiveTab('servicios')}>🛠️ Catálogo</button>
        {fotosTrabajos.length > 0 && <button className={`ld-tab ${activeTab==='galeria'?'active':''}`} onClick={()=>setActiveTab('galeria')}>📷 Trabajos</button>}
        {(profesionales.length > 0 || isOwner) && <button className={`ld-tab ${activeTab==='equipo'?'active':''}`} onClick={()=>setActiveTab('equipo')}>👥 Equipo</button>}
        <button className={`ld-tab ${activeTab==='acerca'?'active':''}`} onClick={()=>setActiveTab('acerca')}>ℹ️ Detalles</button>
        <button className={`ld-tab ${activeTab==='resenas'?'active':''}`} onClick={()=>setActiveTab('resenas')}>💬 Reseñas ({resenas.length})</button>
      </div>

      {/* CONTENIDO DEL TAB ACTIVO */}
      <div className="ld-tab-content">
        
        {/* TAB 1: SERVICIOS */}
        {activeTab === 'servicios' && (
          <div className="ld-servicios-list marketplace-services">
            {servicios.length === 0 ? (
              <p className="ld-empty-txt">No hay servicios registrados.</p>
            ) : (
              servicios.map((srv, i) => {
                const srvPrice = srv.tipoPrecio === 'convenir' ? 'A convenir' : `RD$ ${parseFloat(srv.precio || 0).toLocaleString()}`
                return (
                  <div key={i} className="local-servicio-card premium marketplace-service-card">
                    <div className="local-servicio-icon glow-soft">{srv.icono || '🔧'}</div>
                    <div className="local-servicio-info">
                      <p className="local-servicio-nombre">{srv.nombre}</p>
                      {srv.descripcion && <p className="local-servicio-desc">{srv.descripcion}</p>}
                    </div>
                    <div className="local-servicio-price-col">
                      {srv.tipoPrecio === 'desde' && <span className="ls-price-hint">Desde</span>}
                      <span className="local-servicio-precio-highlight">{srvPrice}</span>
                    </div>
                  </div>
                )
              })
            )}

            {profesionales.length > 0 && (
              <div className="ld-equipo-cta-banner" onClick={() => setActiveTab('equipo')} style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(212, 175, 55, 0.3)', borderRadius: '10px', padding: '14px', textAlign: 'center', fontSize: '13px', color: '#ccc', marginTop: '16px', fontWeight: '600', transition: 'all 0.2s' }}>
                <span>🔎 ¿Prefieres reservar con un miembro específico de nuestro equipo? Ver Profesionales ➔</span>
              </div>
            )}
          </div>
        )}

        {/* TAB GALERIA */}
        {activeTab === 'galeria' && (
          <div className="ld-galeria-grid marketplace-gallery">
            {fotosTrabajos.map((foto, i) => (
              <img key={i} src={foto} alt={`Trabajo ${i+1}`} className="ld-galeria-img" />
            ))}
          </div>
        )}

        {/* TAB EQUIPO */}
        {activeTab === 'equipo' && (
          <div style={{ animation: 'vip-slide-in 0.3s forwards' }}>
            {isOwner && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', background: 'rgba(212,175,55,0.04)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.1)' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--vip-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚙️ Panel de Equipo</span>
                <button onClick={() => { setTempTeam(profesionales); setShowTeamModal(true); }} style={{ background: 'var(--vip-gold-grad)', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 8px rgba(212,175,55,0.3)' }}>
                  Gestionar Equipo
                </button>
              </div>
            )}

            {profesionales.length === 0 ? (
              isOwner ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', background: 'var(--vip-dark-card)', border: '1px dashed rgba(212, 175, 55, 0.3)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>👥</span>
                  <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--vip-gold)', fontWeight: 800 }}>Gestiona tu Equipo de Trabajo</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--vip-text-secondary)', maxWidth: '280px', lineHeight: 1.5 }}>Agrega hasta 3 profesionales diferentes para que tus clientes puedan reservar servicios directamente con ellos.</p>
                  <button onClick={() => { setTempTeam(profesionales); setShowTeamModal(true); }} style={{ background: 'var(--vip-gold-grad)', border: 'none', color: '#000', padding: '10px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 850, cursor: 'pointer' }}>
                    ➕ Añadir Profesional
                  </button>
                </div>
              ) : (
                <p className="ld-empty-txt">No hay profesionales registrados.</p>
              )
            ) : (
              <div className="ld-equipo-list" style={{ display: 'flex', flexDirection: 'row', gap: '14px', overflowX: 'auto', paddingBottom: '14px', scrollSnapType: 'x mandatory' }}>
                {profesionales.map((prof, i) => {
                  const profInitials = (prof.nombre || 'P').substring(0, 2).toUpperCase()
                  const profAvatarBg = getAvatarColor(prof.nombre || 'P')
                  return (
                    <div key={i} className="ld-profesional-card vertical" style={{ flexShrink: 0, width: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px', scrollSnapAlign: 'start' }}>
                      <div className="ld-profesional-avatar-wrap" style={{ marginBottom: '12px' }}>
                        {prof.fotoURL ? (
                          <img src={prof.fotoURL} alt={prof.nombre} className="ld-profesional-photo" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--vip-gold)', objectFit: 'cover' }} />
                        ) : (
                          <div className="ld-profesional-avatar-placeholder" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--vip-gold)', background: profAvatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '850', color: '#0b0b0f' }}>
                            {profInitials}
                          </div>
                        )}
                      </div>
                      <div className="ld-profesional-info" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px', width: '100%' }}>
                        <h4 className="ld-profesional-name" style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--vip-text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prof.nombre || 'Profesional'}</h4>
                        <p className="ld-profesional-spec" style={{ fontSize: '11px', color: 'var(--vip-text-secondary)', margin: 0, fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prof.especialidad || 'Especialista'}</p>
                      </div>
                      <div className="ld-profesional-actions" style={{ width: '100%' }}>
                        <button className="ld-prof-btn-book" onClick={() => navigate('booking', {
                          id: local.proId,
                          name: `${prof.nombre} (en ${local.nombre})`,
                          category: prof.especialidad,
                          avatar: profInitials,
                          phone: local.whatsapp || '',
                          ...local
                        })} style={{ width: '100%' }}>
                          🤝 {lang === 'es' ? 'Reservar' : 'Book'}
                        </button>
                      </div>
                    </div>
                  )
                })}
                {isOwner && (
                  <div className="ld-profesional-card vertical" style={{ flexShrink: 0, width: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '16px', background: 'rgba(212, 175, 55, 0.03)', border: '1px dashed rgba(212,175,55,0.4)', borderRadius: '12px', cursor: 'pointer', scrollSnapAlign: 'start' }} onClick={() => { setTempTeam(profesionales); setShowTeamModal(true); }}>
                    <span style={{ fontSize: '28px', color: 'var(--vip-gold)', marginBottom: '8px' }}>⚙️</span>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--vip-gold)', margin: '0 0 4px' }}>Gestionar Equipo</h4>
                    <p style={{ fontSize: '10px', color: 'var(--vip-text-secondary)', margin: 0 }}>Crear / Editar</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACERCA DE */}
        {activeTab === 'acerca' && (
          <div className="ld-acerca-grid">
            <div className="ld-acerca-card">
              <h3>📝 Descripción del Local</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{local.descripcion || 'Sin descripción disponible.'}</p>
            </div>

            <div className="ld-acerca-card">
              <h3>🕒 Horario de Atención</h3>
              <p style={{ display:'flex', alignItems:'center', gap:8, fontWeight:600 }}><FaClock color="#D4AF37"/> {local.horario || 'No especificado'}</p>
            </div>

            {/* Contacto Directo removido por requerimiento de contratación obligatoria */}

            {pagos.length > 0 && (
              <div className="ld-acerca-card">
                <h3>💳 Métodos de Pago Aceptados</h3>
                <div className="ld-pagos-list">
                  {pagos.map(p => PAGO_LABELS[p] ? (
                    <span key={p} className="ld-pago-badge">
                      {PAGO_LABELS[p].icon} {PAGO_LABELS[p].text}
                    </span>
                  ) : null)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RESEÑAS */}
        {activeTab === 'resenas' && (
          <div className="ld-resenas-list">
            {loadingResenas ? <p className="ld-empty-txt">Cargando...</p> : resenas.length === 0 ? (
              <p className="ld-empty-txt">Aún no hay reseñas de clientes.</p>
            ) : (
              resenas.map((r, i) => (
                <div key={i} className="local-servicio-card premium" style={{ alignItems: 'flex-start' }}>
                  {r.clientPhoto
                    ? <img src={r.clientPhoto} alt={r.clientName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: getAvatarColor(r.clientName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>
                        {(r.clientName || 'C').charAt(0).toUpperCase()}
                      </div>
                  }
                  <div className="local-servicio-info">
                    <p className="local-servicio-nombre">{r.clientName}</p>
                    <div style={{ color: '#FFD700', fontSize: 11, marginBottom: 4 }}>
                      {'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}
                    </div>
                    <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.4 }}>"{r.comment}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── MODAL: GESTIONAR EQUIPO DIRECTAMENTE ── */}
        {showTeamModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(8px)' }}>
            <div style={{ background: '#0f0f15', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '420px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'var(--vip-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>👥 Gestionar Equipo</h3>
                <button onClick={() => setShowTeamModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>
              
              <p style={{ margin: 0, fontSize: '12px', color: '#888', lineHeight: 1.5 }}>
                Administra los profesionales que trabajan en tu local. Puedes tener hasta 3 profesionales diferentes.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tempTeam.map((prof, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', position: 'relative' }}>
                    <button onClick={() => setTempTeam(prev => prev.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,0,0,0.1)', border: 'none', color: '#ff4d4d', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✕</button>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <label style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px dashed rgba(212,175,55,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
                        {prof.fotoURL ? (
                          <img src={prof.fotoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '14px' }}>📷</span>
                            <span style={{ fontSize: '8px', color: '#888', marginTop: '2px' }}>Foto</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files[0]
                            if (file) {
                              try {
                                const base64 = await compressImage(file, 400)
                                setTempTeam(prev => prev.map((p, i) => i === idx ? { ...p, fotoURL: base64 } : p))
                              } catch (err) { console.error(err) }
                            }
                          }}
                        />
                      </label>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '13px', outline: 'none' }} placeholder="Nombre del profesional" value={prof.nombre} onChange={e => setTempTeam(prev => prev.map((p, i) => i === idx ? { ...p, nombre: e.target.value } : p))} />
                        <input style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '12px', outline: 'none' }} placeholder="Especialidad (Ej: Barbero, Estilista)" value={prof.especialidad} onChange={e => setTempTeam(prev => prev.map((p, i) => i === idx ? { ...p, especialidad: e.target.value } : p))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {tempTeam.length < 3 && (
                <button onClick={() => setTempTeam(prev => [...prev, { nombre: '', especialidad: '', fotoURL: '' }])} style={{ background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.2)', color: '#fff', padding: '10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>
                  ➕ Añadir Profesional
                </button>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => setShowTeamModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleSaveTeam} disabled={savingTeam} style={{ flex: 1, background: 'var(--vip-gold-grad)', border: 'none', color: '#000', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: '850', cursor: 'pointer' }}>
                  {savingTeam ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      <div style={{ height: 100 }} />
    </div>
  )
}