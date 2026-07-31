// src/locales/LocalDetalle.jsx
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './Locales.css'
import { FaClock, FaMoneyBillWave, FaCreditCard, FaExchangeAlt, FaWhatsapp, FaInstagram } from 'react-icons/fa'

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

export default function LocalDetalle({ lang = 'es', navigate, local }) {
  const [resenas,        setResenas]        = useState([])
  const [loadingResenas, setLoadingResenas] = useState(true)
  const [activeTab,      setActiveTab]      = useState('servicios')

  const initials = (local?.nombre || 'L').substring(0, 2).toUpperCase()
  const avatarBg = getAvatarColor(local?.id || local?.nombre || 'L')

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

        <div className="ld-actions-row">
          <button className="ld-btn-primary glow" style={{ flex: 1 }} onClick={() => navigate('booking', { id: local.proId, name: local.proNombre || local.nombre, ...local })}>
            🤝 {lang === 'es' ? 'Contratar servicio' : 'Hire now'}
          </button>
          {local.whatsapp && (
            <button className="ld-btn-wa" onClick={handleWhatsappClick} title="Chat WhatsApp">
              <FaWhatsapp style={{ fontSize: 24 }} />
            </button>
          )}
        </div>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="ld-tabs-container">
        <button className={`ld-tab ${activeTab==='servicios'?'active':''}`} onClick={()=>setActiveTab('servicios')}>🛠️ Catálogo</button>
        {fotosTrabajos.length > 0 && <button className={`ld-tab ${activeTab==='galeria'?'active':''}`} onClick={()=>setActiveTab('galeria')}>📷 Trabajos</button>}
        {profesionales.length > 0 && <button className={`ld-tab ${activeTab==='equipo'?'active':''}`} onClick={()=>setActiveTab('equipo')}>👥 Equipo</button>}
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
          <div className="ld-equipo-list">
            {profesionales.map((prof, i) => {
              const profInitials = (prof.nombre || 'P').substring(0, 2).toUpperCase()
              const profAvatarBg = getAvatarColor(prof.nombre || 'P')
              return (
                <div key={i} className="ld-profesional-card">
                  <div className="ld-profesional-avatar-wrap">
                    {prof.fotoURL ? (
                      <img src={prof.fotoURL} alt={prof.nombre} className="ld-profesional-photo" />
                    ) : (
                      <div className="ld-profesional-avatar-placeholder" style={{ background: profAvatarBg }}>
                        {profInitials}
                      </div>
                    )}
                  </div>
                  <div className="ld-profesional-info">
                    <h4 className="ld-profesional-name">{prof.nombre || 'Profesional'}</h4>
                    <p className="ld-profesional-spec">{prof.especialidad || 'Especialista'}</p>
                  </div>
                  <div className="ld-profesional-actions">
                    {prof.whatsapp && (
                      <button className="ld-prof-btn-wa" onClick={() => {
                        let number = prof.whatsapp.replace(/[^0-9]/g, '')
                        if (number.length === 10 && (number.startsWith('809') || number.startsWith('829') || number.startsWith('849'))) {
                          number = '1' + number
                        }
                        window.open(`https://wa.me/${number}`, '_blank')
                      }} title="Chat WhatsApp">
                        <FaWhatsapp />
                      </button>
                    )}
                    <button className="ld-prof-btn-book" onClick={() => navigate('booking', {
                      id: local.proId,
                      name: `${prof.nombre} (en ${local.nombre})`,
                      category: prof.especialidad,
                      avatar: profInitials,
                      phone: prof.whatsapp || local.whatsapp,
                      ...local
                    })}>
                      🤝 {lang === 'es' ? 'Reservar' : 'Book'}
                    </button>
                  </div>
                </div>
              )
            })}
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

            {(local.whatsapp || local.instagram) && (
              <div className="ld-acerca-card">
                <h3>📱 Contacto Directo</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {local.whatsapp && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }} onClick={handleWhatsappClick}>
                      <span style={{ color: '#25D366', fontSize: 18, display: 'flex', alignItems: 'center' }}><FaWhatsapp /></span>
                      <span style={{ fontWeight: 700 }}>WhatsApp:</span>
                      <span style={{ color: '#A0AEC0' }}>{local.whatsapp}</span>
                    </div>
                  )}
                  {local.instagram && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }} onClick={() => window.open(`https://instagram.com/${local.instagram.replace('@', '')}`, '_blank')}>
                      <span style={{ color: '#E1306C', fontSize: 18, display: 'flex', alignItems: 'center' }}><FaInstagram /></span>
                      <span style={{ fontWeight: 700 }}>Instagram:</span>
                      <span style={{ color: '#A0AEC0' }}>{local.instagram}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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

      </div>
      <div style={{ height: 100 }} />
    </div>
  )
}