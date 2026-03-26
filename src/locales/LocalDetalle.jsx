// src/locales/LocalDetalle.jsx
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './Locales.css'
import { FaWhatsapp, FaInstagram, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaCreditCard, FaExchangeAlt } from 'react-icons/fa'

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

export default function LocalDetalle({ lang = 'es', navigate, local }) {
  const [resenas,        setResenas]        = useState([])
  const [loadingResenas, setLoadingResenas] = useState(true)
  const [activeTab,      setActiveTab]      = useState('servicios')

  const initials = (local?.nombre || 'L').substring(0, 2).toUpperCase()
  const avatarBg = getAvatarColor(local?.id || local?.nombre || 'L')

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

  const handleWhatsapp = () => {
    if (local.whatsapp) {
      const num = local.whatsapp.replace(/\D/g, '')
      window.open(`https://wa.me/${num}`, '_blank')
    }
  }

  return (
    <div className="local-detalle-page">

      {/* PORTADA Y HEADER */}
      <div className="local-detalle-header">
        {local.portadaURL
          ? <img src={local.portadaURL} alt={local.nombre} className="local-detalle-portada" />
          : <div className="local-detalle-portada-placeholder">🏢</div>}
        <button className="local-detalle-back" onClick={() => navigate('locales')}>←</button>
      </div>

      {/* INFO CARD PRINCIPAL */}
      <div className="local-detalle-info-card">
        <div className="local-detalle-logo-row">
          {local.logoURL
            ? <img src={local.logoURL} alt="logo" className="local-detalle-logo" />
            : <div className="local-detalle-logo-placeholder" style={{ background: avatarBg }}>{initials}</div>}
          <div style={{ flex: 1 }} />
          <span className="local-detalle-vip-badge glow">👑 Local VIP</span>
        </div>

        <h1 className="local-detalle-nombre">{local.nombre || 'Local VIP'}</h1>
        <p className="local-detalle-categoria">🔧 {local.categoria || 'Servicios Especializados'}</p>

        <div className="local-detalle-stats">
          <div className="local-detalle-stat"><span className="ld-num">★ {rating.toFixed(1)}</span><span className="ld-lbl">{lang==='es'?'Rating':'Rating'}</span></div>
          <div className="local-detalle-stat"><span className="ld-num">{contratos}</span><span className="ld-lbl">{lang==='es'?'Contratos':'Jobs'}</span></div>
          <div className="local-detalle-stat"><span className="ld-num">{servicios.length}</span><span className="ld-lbl">{lang==='es'?'Servicios':'Services'}</span></div>
          <div className="local-detalle-stat"><span className="ld-num">{resenas.length}</span><span className="ld-lbl">{lang==='es'?'Reseñas':'Reviews'}</span></div>
        </div>

        <div className="ld-actions-row">
          <button className="ld-btn-primary glow" onClick={() => navigate('booking', { id: local.proId, name: local.proNombre || local.nombre, ...local })}>
            🤝 {lang === 'es' ? 'Contratar ahora' : 'Hire now'}
          </button>
          {local.whatsapp && (
            <button className="ld-btn-wa" onClick={handleWhatsapp}><FaWhatsapp size={20}/></button>
          )}
        </div>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="ld-tabs-container">
        <button className={`ld-tab ${activeTab==='servicios'?'active':''}`} onClick={()=>setActiveTab('servicios')}>🛠️ Servicios</button>
        <button className={`ld-tab ${activeTab==='acerca'?'active':''}`} onClick={()=>setActiveTab('acerca')}>ℹ️ Acerca de</button>
        <button className={`ld-tab ${activeTab==='resenas'?'active':''}`} onClick={()=>setActiveTab('resenas')}>💬 Reseñas</button>
      </div>

      {/* CONTENIDO DEL TAB ACTIVO */}
      <div className="ld-tab-content">
        
        {/* TAB 1: SERVICIOS */}
        {activeTab === 'servicios' && (
          <div className="ld-servicios-list">
            {servicios.length === 0 ? (
              <p className="ld-empty-txt">No hay servicios registrados.</p>
            ) : (
              servicios.map((srv, i) => (
                <div key={i} className="local-servicio-card premium">
                  <div className="local-servicio-icon glow-soft">{srv.icono || '🔧'}</div>
                  <div className="local-servicio-info">
                    <p className="local-servicio-nombre">{srv.nombre}</p>
                    {srv.descripcion && <p className="local-servicio-desc">{srv.descripcion}</p>}
                  </div>
                  <div className="local-servicio-price-col">
                    {srv.tipoPrecio === 'desde' && <span className="ls-price-hint">Desde</span>}
                    <span className={`local-servicio-precio ${srv.tipoPrecio==='convenir'?'sm':''}`}>
                      {srv.tipoPrecio === 'convenir' ? '🤝 A convenir' : `RD$${srv.precio}`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: ACERCA DE */}
        {activeTab === 'acerca' && (
          <div className="ld-acerca-grid">
            <div className="ld-acerca-card">
              <h3>📝 Descripción</h3>
              <p>{local.descripcion || 'Sin descripción.'}</p>
            </div>

            <div className="ld-acerca-card">
              <h3>🕒 Horario de Atención</h3>
              <p style={{ display:'flex', alignItems:'center', gap:8, fontWeight:600 }}><FaClock color="#F26000"/> {local.horario || 'No especificado'}</p>
            </div>

            {pagos.length > 0 && (
              <div className="ld-acerca-card">
                <h3>💳 Pagos Aceptados</h3>
                <div className="ld-pagos-list">
                  {pagos.map(p => PAGO_LABELS[p] ? (
                    <span key={p} className="ld-pago-badge">
                      {PAGO_LABELS[p].icon} {PAGO_LABELS[p].text}
                    </span>
                  ) : null)}
                </div>
              </div>
            )}

            {local.instagram && (
              <div className="ld-acerca-card">
                <h3>📸 Redes Sociales</h3>
                <p style={{ display:'flex', alignItems:'center', gap:8, fontWeight:600, color:'#E1306C' }}><FaInstagram size={18}/> {local.instagram}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RESEÑAS */}
        {activeTab === 'resenas' && (
          <div className="ld-resenas-list">
            {loadingResenas ? <p className="ld-empty-txt">Cargando...</p> : resenas.length === 0 ? (
              <p className="ld-empty-txt">Aún no hay reseñas.</p>
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