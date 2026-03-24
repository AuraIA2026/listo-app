// src/locales/LocalDetalle.jsx
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './Locales.css'

const avatarColors = ['#F26000','#C24D00','#FF8533','#7A3000','#FFB380']

function getAvatarColor(str) {
  return avatarColors[
    Array.from(str || 'L').reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length
  ]
}

export default function LocalDetalle({ lang = 'es', navigate, local }) {
  const [resenas,        setResenas]        = useState([])
  const [loadingResenas, setLoadingResenas] = useState(true)

  const initials = (local?.nombre || 'L').substring(0, 2).toUpperCase()
  const avatarBg = getAvatarColor(local?.id || local?.nombre || 'L')

  useEffect(() => {
    if (!local?.proId) { setLoadingResenas(false); return }
    const fetchResenas = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('proId', '==', local.proId),
          where('rated', '==', true)
        )
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
      } catch (e) {
        console.error('Error cargando reseñas:', e)
      } finally {
        setLoadingResenas(false)
      }
    }
    fetchResenas()
  }, [local?.proId])

  if (!local) return null

  const servicios = local.servicios || []
  const rating    = local.rating    || 5
  const contratos = local.contratos || 0

  return (
    <div className="local-detalle-page">

      {/* Portada + botón volver */}
      <div className="local-detalle-header">
        {local.portadaURL
          ? <img src={local.portadaURL} alt={local.nombre} className="local-detalle-portada" />
          : <div className="local-detalle-portada-placeholder">🏢</div>
        }
        {/* ✅ Vuelve a locales, no a search */}
        <button className="local-detalle-back" onClick={() => navigate('locales')}>
          ←
        </button>
      </div>

      {/* Info card */}
      <div className="local-detalle-info-card">
        <div className="local-detalle-logo-row">
          {local.logoURL
            ? <img src={local.logoURL} alt="logo" className="local-detalle-logo" />
            : <div className="local-detalle-logo-placeholder" style={{ background: avatarBg }}>
                {initials}
              </div>
          }
          <span className="local-detalle-vip-badge">👑 Local VIP</span>
        </div>

        <p className="local-detalle-nombre">{local.nombre || 'Local VIP'}</p>
        <p className="local-detalle-categoria">🔧 {local.categoria || 'Servicios'}</p>

        {local.descripcion && (
          <p className="local-detalle-desc">{local.descripcion}</p>
        )}

        {/* Stats */}
        <div className="local-detalle-stats">
          <div className="local-detalle-stat">
            <span className="local-detalle-stat-num">★ {rating.toFixed(1)}</span>
            <span className="local-detalle-stat-label">{lang === 'es' ? 'Calificación' : 'Rating'}</span>
          </div>
          <div className="local-detalle-stat">
            <span className="local-detalle-stat-num">{contratos}</span>
            <span className="local-detalle-stat-label">{lang === 'es' ? 'Contratos' : 'Jobs'}</span>
          </div>
          <div className="local-detalle-stat">
            <span className="local-detalle-stat-num">{servicios.length}</span>
            <span className="local-detalle-stat-label">{lang === 'es' ? 'Servicios' : 'Services'}</span>
          </div>
          <div className="local-detalle-stat">
            <span className="local-detalle-stat-num">{resenas.length}</span>
            <span className="local-detalle-stat-label">{lang === 'es' ? 'Reseñas' : 'Reviews'}</span>
          </div>
        </div>

        <button
          className="local-detalle-contratar-btn"
          onClick={() => navigate('booking', { id: local.proId, name: local.proNombre || local.nombre, ...local })}
        >
          🤝 {lang === 'es' ? 'Contratar ahora' : 'Hire now'}
        </button>
      </div>

      {/* Servicios */}
      {servicios.length > 0 && (
        <div className="local-detalle-servicios">
          <p className="local-detalle-seccion-titulo">
            🛠️ {lang === 'es' ? 'Nuestros servicios' : 'Our services'}
          </p>
          {servicios.map((srv, i) => (
            <div key={i} className="local-servicio-card">
              <div className="local-servicio-icon">{srv.icono || '🔧'}</div>
              <div className="local-servicio-info">
                <p className="local-servicio-nombre">{srv.nombre}</p>
                {srv.descripcion && (
                  <p className="local-servicio-desc">{srv.descripcion}</p>
                )}
              </div>
              {srv.precio && (
                <span className="local-servicio-precio">
                  {srv.precio === 'A convenir' ? '🤝' : `RD$${srv.precio}`}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reseñas */}
      {!loadingResenas && resenas.length > 0 && (
        <div className="local-detalle-servicios">
          <p className="local-detalle-seccion-titulo">
            💬 {lang === 'es' ? 'Lo que dicen' : 'Reviews'}
          </p>
          {resenas.map((r, i) => (
            <div key={i} className="local-servicio-card" style={{ alignItems:'flex-start' }}>
              {r.clientPhoto
                ? <img src={r.clientPhoto} alt={r.clientName} style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
                : <div style={{
                    width:36, height:36, borderRadius:'50%', flexShrink:0,
                    background: getAvatarColor(r.clientName),
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:13, fontWeight:800, color:'#fff'
                  }}>
                    {(r.clientName || 'C').charAt(0).toUpperCase()}
                  </div>
              }
              <div className="local-servicio-info">
                <p className="local-servicio-nombre">{r.clientName}</p>
                <div style={{ color:'#FFD700', fontSize:11, marginBottom:2 }}>
                  {'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}
                </div>
                <p style={{ fontSize:12, color:'#666', margin:0, lineHeight:1.4 }}>"{r.comment}"</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 80 }} />
    </div>
  )
}