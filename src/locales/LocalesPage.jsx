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
  return `RD$ ${min.toLocaleString()}`
}

function LocalGridCard({ local, onPress }) {
  const initials = (local.nombre || 'L').substring(0, 2).toUpperCase()
  const avatarBg = getAvatarColor(local.id || local.nombre)
  const priceStr = getStartingPrice(local.servicios)

  return (
    <div className="local-grid-card marketplace-card" onClick={() => onPress(local)}>
      <div className="local-grid-portada-wrap">
        {local.portadaURL
          ? <img src={local.portadaURL} alt={local.nombre} className="local-grid-portada" />
          : <div className="local-grid-portada-placeholder">🏢</div>
        }
        <span className="local-grid-vip-crown">👑 VIP</span>
        <div className="local-grid-price-badge">{priceStr}</div>
        <div className="local-grid-logo-wrap">
          {local.logoURL
            ? <img src={local.logoURL} alt="logo" className="local-grid-logo" />
            : <div className="local-grid-logo-placeholder" style={{ background: avatarBg }}>{initials}</div>
          }
        </div>
      </div>
      <div className="local-grid-body">
        <p className="local-grid-nombre">{local.nombre}</p>
        <div className="local-grid-details-row">
          <span className="local-grid-cat">🔧 {local.categoria || 'Servicios'}</span>
          <div className="local-grid-rating-wrap">
            <span style={{ color:'#FFD700', fontSize: 11 }}>★</span>
            <span className="local-grid-rating-text">{Number(local.rating || 5).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LocalesPage({ lang = 'es', navigate }) {
  const [locales, setLocales] = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  useEffect(() => {
    const fetchLocales = async () => {
      try {
        const q = query(collection(db, 'locales'), where('activo', '==', true))
        const snap = await getDocs(q)
        const lista = []
        snap.forEach(doc => lista.push({ id: doc.id, ...doc.data() }))
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

  // Extraer las categorías disponibles dinámicamente
  const categories = ['Todos', ...new Set(locales.map(l => l.categoria).filter(Boolean))]

  const filtered = locales.filter(l => {
    const matchesSearch = l.nombre?.toLowerCase().includes(search.toLowerCase()) ||
                          l.categoria?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || l.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="locales-page marketplace-view">

      {/* Header Estilo Marketplace */}
      <div className="locales-page-header">
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
          <button
            onClick={() => navigate('search')}
            style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', borderRadius:'50%', width:36, height:36, fontSize:16, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >←</button>
          <h1>👑 {lang === 'es' ? 'Directorio Élite VIP' : 'Elite VIP Directory'}</h1>
        </div>
        <p>{lang === 'es' ? 'Explora y contrata los locales de servicios profesionales más prestigiosos' : 'Explore and hire from the most prestigious professional service shops'}</p>
      </div>

      {/* Búsqueda */}
      <div className="locales-page-search">
        <span className="locales-page-search-icon" style={{ color: '#D4AF37' }}>🔍</span>
        <input
          type="text"
          placeholder={lang === 'es' ? '¿Qué servicio VIP buscas hoy?' : 'What VIP service are you looking for today?'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filtro de Categorías Tipo Píldora */}
      {!loading && categories.length > 1 && (
        <div className="marketplace-categories-scroll">
          {categories.map(cat => (
            <button
              key={cat}
              className={`marketplace-category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Contador */}
      {!loading && (
        <p style={{ padding:'0 16px', fontSize:12, color:'#999', fontWeight:700, margin:'8px 0 12px' }}>
          {filtered.length} {lang === 'es' ? 'locales VIP activos' : 'active VIP shops'}
        </p>
      )}

      {/* Grid de Productos/Profesionales */}
      {loading ? (
        <p style={{ textAlign:'center', padding:40, color:'#bbb', fontSize:14 }}>
          {lang === 'es' ? 'Cargando Mercado VIP...' : 'Loading VIP Marketplace...'}
        </p>
      ) : filtered.length === 0 ? (
        <div className="locales-empty">
          <div className="locales-empty-icon">🏪</div>
          <p className="locales-empty-text">
            {lang === 'es' ? 'No hay locales en esta categoría' : 'No shops found in this category'}
          </p>
        </div>
      ) : (
        <div className="locales-grid marketplace-grid">
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