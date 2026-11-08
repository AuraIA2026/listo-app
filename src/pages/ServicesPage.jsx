import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './ServicesPage.css'

const CategorySvgIcon = ({ id, active }) => {
  const strokeColor = active ? '#FFFFFF' : '#F26000'
  const fillAccent  = active ? 'rgba(255,255,255,0.28)' : 'rgba(242,96,0,0.16)'
  const badgeBg     = active ? 'rgba(255,255,255,0.22)' : 'linear-gradient(135deg, #FFF3EC 0%, #FFE4D1 100%)'
  const badgeBorder = active ? '1.5px solid rgba(255,255,255,0.45)' : '1.5px solid rgba(242,96,0,0.28)'

  const renderGlyph = () => {
    switch (id) {
      case 'all':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill={strokeColor} stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="19" cy="5" r="1.5" fill={strokeColor} />
            <circle cx="5" cy="19" r="1.2" fill={strokeColor} />
          </svg>
        )
      case 'mechanic':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill={fillAccent} />
          </svg>
        )
      case 'electrician':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={fillAccent} />
          </svg>
        )
      case 'plumber':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill={fillAccent} />
            <path d="M9.5 14a3.5 3.5 0 0 0 5 0" />
          </svg>
        )
      case 'nanny':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" fill={fillAccent} />
            <path d="M9 10h.01" strokeWidth="2.8" />
            <path d="M15 10h.01" strokeWidth="2.8" />
            <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
            <path d="M12 3c-1.5 1.5-1.5 3 0 4" />
          </svg>
        )
      case 'painter':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="14" height="7" rx="2" fill={fillAccent} />
            <path d="M17 6.5h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-7a2 2 0 0 0-2 2v1.5" />
            <rect x="8.5" y="17" width="3" height="5" rx="1" fill={strokeColor} />
          </svg>
        )
      case 'carpenter':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" fill={fillAccent} />
            <path d="M17.64 15 22 10.64" />
            <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
          </svg>
        )
      case 'cleaner':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" fill={fillAccent} />
            <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" fill={strokeColor} />
            <path d="M5 17l.6 1.4L7 19l-1.4.6L5 21l-.6-1.4L3 19l1.4-.6L5 17z" />
          </svg>
        )
      case 'gardener':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" fill={fillAccent} />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
        )
      case 'locksmith':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7.5" cy="15.5" r="5.5" fill={fillAccent} />
            <path d="m21 2-9.6 9.6" />
            <path d="m15.5 7.5 3 3L22 7l-3-3" fill={fillAccent} />
          </svg>
        )
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" fill={fillAccent} />
          </svg>
        )
    }
  }

  return (
    <span
      className="cat-mamey-icon-badge"
      style={{
        width: '34px',
        height: '34px',
        borderRadius: '11px',
        background: badgeBg,
        border: badgeBorder,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: active
          ? 'inset 0 1px 2px rgba(255,255,255,0.35), 0 2px 6px rgba(0,0,0,0.12)'
          : '0 3px 8px rgba(242, 96, 0, 0.14)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {renderGlyph()}
    </span>
  )
}

// ── Categorías ────────────────────────────────────────────────────────────────
const categories = {
  es: [
    { id: 'all',          label: 'Todos',        icon: '✦' },
    { id: 'mechanic',     label: 'Mecánico',     icon: '🔧' },
    { id: 'electrician',  label: 'Electricista', icon: '⚡' },
    { id: 'plumber',      label: 'Plomero',      icon: '🔩' },
    { id: 'nanny',        label: 'Niñera',       icon: '👶' },
    { id: 'painter',      label: 'Pintor',       icon: '🎨' },
    { id: 'carpenter',    label: 'Carpintero',   icon: '🪵' },
    { id: 'cleaner',      label: 'Limpieza',     icon: '🧹' },
    { id: 'gardener',     label: 'Jardinero',    icon: '🌿' },
    { id: 'locksmith',    label: 'Cerrajero',    icon: '🔑' },
  ],
  en: [
    { id: 'all',          label: 'All',          icon: '✦' },
    { id: 'mechanic',     label: 'Mechanic',     icon: '🔧' },
    { id: 'electrician',  label: 'Electrician',  icon: '⚡' },
    { id: 'plumber',      label: 'Plumber',      icon: '🔩' },
    { id: 'nanny',        label: 'Nanny',        icon: '👶' },
    { id: 'painter',      label: 'Painter',      icon: '🎨' },
    { id: 'carpenter',    label: 'Carpenter',    icon: '🪵' },
    { id: 'cleaner',      label: 'Cleaning',     icon: '🧹' },
    { id: 'gardener',     label: 'Gardener',     icon: '🌿' },
    { id: 'locksmith',    label: 'Locksmith',    icon: '🔑' },
  ]
}

// ── Profesionales (lista de fallback local removida) ──────────────────────────

// ── Textos ────────────────────────────────────────────────────────────────────
const txt = {
  es: {
    title:        'Buscar servicios',
    search:       '¿Qué necesitas?',
    available:    'Disponible',
    busy:         'Ocupado',
    book:         'Reservar',
    profile:      'Ver perfil',
    reviews:      'reseñas',
    exp:          'experiencia',
    filterAvail:  'Solo disponibles',
    results:      'profesionales encontrados',
    empty:        'No se encontraron profesionales',
    topRated:     'Mejor valorados',
    nearest:      'Cerca de ti',
  },
  en: {
    title:        'Search services',
    search:       'What do you need?',
    available:    'Available',
    busy:         'Busy',
    book:         'Book',
    profile:      'View profile',
    reviews:      'reviews',
    exp:          'experience',
    filterAvail:  'Available only',
    results:      'professionals found',
    empty:        'No professionals found',
    topRated:     'Top rated',
    nearest:      'Near you',
  }
}

const avatarColors = ['#F26000','#C24D00','#FF8533','#7A3000','#FFB380']

// ── Componente principal ──────────────────────────────────────────────────────
export default function ServicesPage({ lang = 'es', navigate, userData }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search,         setSearch]         = useState('')
  const [onlyAvailable,  setOnlyAvailable]  = useState(false)
  const [sortBy,         setSortBy]         = useState('all') // all | topRated | nearest
  const [professionals,  setProfessionals]  = useState([])
  const [loading,        setLoading]        = useState(true)

  const cats = categories[lang]
  const T    = txt[lang]

  useEffect(() => {
    const fetchPros = async () => {
      try {
        setLoading(true)
        const q = query(collection(db, 'users'), where('role', '==', 'professional'))
        const querySnapshot = await getDocs(q)
        const pros = []
        const isProComplete = (data) => {
          if (!data) return false;
          const vf = data.verificacion || {};
          const vfDocs = vf.docs || {};
          const hasFront = Boolean(vfDocs.cedulaFrontal || data.cedulaFrontal);
          const hasBack  = Boolean(vfDocs.cedulaTrasera || data.cedulaTrasera);
          const hasSelfie = Boolean(vfDocs.selfie || data.selfie);
          const hasConducta = Boolean(vfDocs.buenaConducta || data.buenaConducta);
          const hasProf = Boolean(data.category || vf.especialidad || data.especialidad);
          const hasAllDocs = hasFront && hasBack && hasSelfie && hasConducta && hasProf;
          const isApproved = vf.estado === 'aprobada' || vf.estado === 'verificado' || data.approved === true;
          return Boolean(hasAllDocs && isApproved);
        };

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          // Filtro estricto: Solo mostrar si completó el perfil y tiene plan activo o contratos
          const isComplete = isProComplete(data)
          const hasPlan = Boolean(data.planStatus === 'active')
          const hasContracts = Boolean(data.contracts && data.contracts > 0)
          if (!isComplete || (!hasPlan && !hasContracts)) return;
          
          pros.push({
            id: doc.id,
            name: data.name || data.displayName || 'Profesional',
            category: data.specialty || data.category || 'all',
            rating: data.rating || 0.0,
            reviews: data.reviews || 0,
            price: data.basePrice || 'RD$0/hr',
            location: data.verificacion?.municipio || data.verificacion?.provincia || data.city || data.location || 'República Dominicana',
            experience: data.experience || '1 año',
            available: isComplete && data.available !== false,
            photo: data.photoURL || data.avatar || null,
            avatar: (data.name || 'P').substring(0,2).toUpperCase(),
            phone: data.phone || data.telefono || '',
            ...data
          })
        })
        
        // Unificar con 'pro' (algunos podrían tener role 'pro' en vez de 'professional')
        const q2 = query(collection(db, 'users'), where('role', '==', 'pro'))
        const querySnapshot2 = await getDocs(q2)
        querySnapshot2.forEach((doc) => {
          const data = doc.data()
          
          const isComplete = isProComplete(data)
          const hasPlan = Boolean(data.planStatus === 'active')
          const hasContracts = Boolean(data.contracts && data.contracts > 0)
          if (!isComplete || (!hasPlan && !hasContracts)) return;

          if (!pros.find(p => p.id === doc.id)) {
            pros.push({
              id: doc.id,
              name: data.name || data.displayName || 'Profesional',
              category: data.specialty || data.category || 'all',
              rating: data.rating || 0.0,
              reviews: data.reviews || 0,
              price: data.basePrice || 'RD$0/hr',
              location: data.verificacion?.municipio || data.verificacion?.provincia || data.city || data.location || 'República Dominicana',
              experience: data.experience || '1 año',
              available: isComplete && data.available !== false,
              photo: data.photoURL || data.avatar || null,
              avatar: (data.name || 'P').substring(0,2).toUpperCase(),
              phone: data.phone || data.telefono || '',
              ...data
            })
          }
        })

        setProfessionals(pros)
      } catch (error) {
        console.error("Error fetching professionals:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPros()
  }, [])

  const filtered = professionals
    .filter(p => {
      if (userData?.blockedUsers?.includes(p.id)) return false
      const matchCat    = activeCategory === 'all' || p.category === activeCategory
      const s = (search || '').toLowerCase()
      const matchSearch = (p.name || '').toLowerCase().includes(s) ||
                          (p.location || '').toLowerCase().includes(s)
      const matchAvail  = !onlyAvailable || p.available
      return matchCat && matchSearch && matchAvail
    })
    .sort((a, b) => {
      if (sortBy === 'topRated') return b.rating - a.rating
      if (sortBy === 'nearest')  return a.location.localeCompare(b.location)
      return 0
    })

  return (
    <div className="services-page">

      {/* ── Header con buscador ── */}
      <div className="search-header">
        <h1 className="search-title">{T.title}</h1>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={T.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* ── Filtros rápidos ── */}
      <div className="quick-filters">
        {['all', 'topRated', 'nearest'].map(f => (
          <button
            key={f}
            className={`qf-btn ${sortBy === f ? 'active' : ''}`}
            onClick={() => setSortBy(f)}
          >
            {f === 'all' ? (lang === 'es' ? 'Todos' : 'All') : T[f]}
          </button>
        ))}
        <label className="avail-toggle">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={e => setOnlyAvailable(e.target.checked)}
          />
          <span className="toggle-track" />
          <span className="toggle-label">{T.filterAvail}</span>
        </label>
      </div>

      {/* ── Categorías ── */}
      <div className="categories-scroll" style={{ padding: '8px 16px' }}>
        {cats.map(cat => {
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              className={`cat-pill ${isActive ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '8px 16px 8px 10px',
                borderRadius: '14px',
                border: isActive ? '1.5px solid #F26000' : '1.5px solid rgba(242, 96, 0, 0.2)',
                background: isActive ? 'linear-gradient(135deg, #FF7A1A 0%, #F26000 100%)' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#1E293B',
                boxShadow: isActive ? '0 6px 16px rgba(242, 96, 0, 0.35)' : '0 2px 8px rgba(242, 96, 0, 0.08)',
                gap: '10px',
                fontWeight: '800'
              }}
            >
              <CategorySvgIcon id={cat.id} active={isActive} />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Contador ── */}
      <div className="results-bar">
        <span className="results-count">
          {loading ? (lang === 'es' ? 'Cargando profesionales...' : 'Loading professionals...') : `${filtered.length} ${T.results}`}
        </span>
      </div>

      {loading && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: 30, height: 30, borderRadius: '50%', border: '3px solid #F26000', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Grid de profesionales ── */}
      <div className="professionals-grid">
        {filtered.map((pro, i) => (
          <div
            key={pro.id}
            className="pro-card"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {/* Foto o avatar */}
            <div className="card-photo">
              {pro.photo ? (
                <img src={pro.photo} alt={pro.name} className="pro-photo" />
              ) : (
                <div
                  className="pro-avatar-big"
                  style={{ background: avatarColors[(pro.id.length || pro.id) % avatarColors.length] || avatarColors[0] }}
                >
                  {pro.avatar}
                </div>
              )}
              <span className={`status-badge ${pro.available ? 'avail' : 'busy'}`}>
                {pro.available ? T.available : T.busy}
              </span>
            </div>

            {/* Info */}
            <div className="card-body">
              <h3 className="pro-name">{pro.name}</h3>
              <p className="pro-cat" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CategorySvgIcon id={pro.category} active={false} />
                <span>{cats.find(c => c.id === pro.category)?.label}</span>
              </p>
              <p className="pro-location">📍 {pro.location}</p>

              <div className="pro-meta">
                <span className="pro-rating">★ {pro.rating} <em>({pro.reviews} {T.reviews})</em></span>
                <span className="pro-exp">⏱ {pro.experience}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="card-footer">
              <span className="pro-price">{pro.price}</span>
              <div className="card-actions">
                <button className="btn-profile" onClick={() => navigate('proProfile', pro)}>
                  👤 {T.profile}
                </button>
                <button className="btn-book" onClick={() => navigate('booking', pro)}>
                  {T.book}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <span>🔍</span>
          <p>{T.empty}</p>
        </div>
      )}

      <div style={{ height: 80 }} />
    </div>
  )
}