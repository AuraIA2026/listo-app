// src/locales/LocalesPage.jsx
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

function LocalGridCard({ local, onPress }) {
  const initials = (local.nombre || 'L').substring(0, 2).toUpperCase()
  const avatarBg = getAvatarColor(local.id || local.nombre)

  return (
    <div className="local-grid-card" onClick={() => onPress(local)}>
      <div className="local-grid-portada-wrap">
        {local.portadaURL
          ? <img src={local.portadaURL} alt={local.nombre} className="local-grid-portada" />
          : <div className="local-grid-portada-placeholder">🏢</div>
        }
        <span className="local-grid-vip">👑 VIP</span>
        <div className="local-grid-logo-wrap">
          {local.logoURL
            ? <img src={local.logoURL} alt="logo" className="local-grid-logo" />
            : <div className="local-grid-logo-placeholder" style={{ background: avatarBg }}>{initials}</div>
          }
        </div>
      </div>
      <div className="local-grid-body">
        <p className="local-grid-nombre">{local.nombre}</p>
        <p className="local-grid-cat">🔧 {local.categoria || 'Servicios'}</p>
        <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:6 }}>
          <span style={{ color:'#FFD700', fontSize:10 }}>{'★'.repeat(Math.round(local.rating || 0))}</span>
          <span style={{ fontSize:10, fontWeight:800, color:'#F26000' }}>{Number(local.rating||0).toFixed(1)}</span>
        </div>
        <button className="local-grid-btn">🏪 Ver Local</button>
      </div>
    </div>
  )
}

export default function LocalesPage({ lang = 'es', navigate }) {
  const [locales, setLocales] = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    const fetchLocales = async () => {
      try {
        const q = query(collection(db, 'locales'), where('activo', '==', true))
        const snap = await getDocs(q)
        const lista = []
        snap.forEach(doc => lista.push({ id: doc.id, ...doc.data() }))
        // Ordenar por rating descendente
        lista.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        setLocales(lista)
      } catch (e) {
        console.error('Error cargando locales:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchLocales()
  }, [])

  const filtered = locales.filter(l =>
    l.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    l.categoria?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="locales-page">

      {/* Header */}
      <div className="locales-page-header">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <button
            onClick={() => navigate('search')}
            style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer', flexShrink:0 }}
          >←</button>
          <h1>👑 {lang === 'es' ? 'Locales VIP' : 'VIP Shops'}</h1>
        </div>
        <p>{lang === 'es' ? 'Los mejores profesionales con su espacio exclusivo' : 'Top professionals with their exclusive space'}</p>
      </div>

      {/* Búsqueda */}
      <div className="locales-page-search">
        <span className="locales-page-search-icon">🔍</span>
        <input
          type="text"
          placeholder={lang === 'es' ? 'Buscar local o categoría...' : 'Search shop or category...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Contador */}
      {!loading && (
        <p style={{ padding:'0 16px', fontSize:12, color:'#bbb', fontWeight:600, margin:'0 0 12px' }}>
          {filtered.length} {lang === 'es' ? 'locales encontrados' : 'shops found'}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <p style={{ textAlign:'center', padding:40, color:'#bbb', fontSize:14 }}>
          {lang === 'es' ? 'Cargando locales...' : 'Loading shops...'}
        </p>
      ) : filtered.length === 0 ? (
        <div className="locales-empty">
          <div className="locales-empty-icon">🏢</div>
          <p className="locales-empty-text">
            {lang === 'es' ? 'No se encontraron locales' : 'No shops found'}
          </p>
        </div>
      ) : (
        <div className="locales-grid">
          {filtered.map(local => (
            <LocalGridCard
              key={local.id}
              local={local}
              onPress={() => navigate('localDetalle', local)}
            />
          ))}
        </div>
      )}

      <div style={{ height: 80 }} />
    </div>
  )
}