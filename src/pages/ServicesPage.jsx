import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './ServicesPage.css'

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
export default function ServicesPage({ lang = 'es', navigate }) {
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
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          // Filtramos perfiles incompletos si es necesario, pero mostramos todos los 'professional'
          pros.push({
            id: doc.id,
            name: data.name || data.displayName || 'Profesional',
            category: data.specialty || data.category || 'all',
            rating: data.rating || 5.0,
            reviews: data.reviews || 0,
            price: data.basePrice || 'RD$0/hr',
            location: data.city || data.location || 'República Dominicana',
            experience: data.experience || '1 año',
            available: data.available !== false, // Por defecto true
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
          if (!pros.find(p => p.id === doc.id)) {
            pros.push({
              id: doc.id,
              name: data.name || data.displayName || 'Profesional',
              category: data.specialty || data.category || 'all',
              rating: data.rating || 5.0,
              reviews: data.reviews || 0,
              price: data.basePrice || 'RD$0/hr',
              location: data.city || data.location || 'República Dominicana',
              experience: data.experience || '1 año',
              available: data.available !== false,
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
      const matchCat    = activeCategory === 'all' || p.category === activeCategory
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.location.toLowerCase().includes(search.toLowerCase())
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
      <div className="categories-scroll">
        {cats.map(cat => (
          <button
            key={cat.id}
            className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="cat-icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
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
              <p className="pro-cat">
                {cats.find(c => c.id === pro.category)?.icon}{' '}
                {cats.find(c => c.id === pro.category)?.label}
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