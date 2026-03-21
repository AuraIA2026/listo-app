import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './ServicesPage.css'

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

const txt = {
  es: {
    title:       'Buscar servicios',
    search:      '¿Qué necesitas?',
    available:   'Disponible',
    busy:        'Ocupado',
    book:        'Reservar',
    profile:     'Ver perfil',
    reviews:     'reseñas',
    exp:         'experiencia',
    filterAvail: 'Solo disponibles',
    results:     'profesionales encontrados',
    empty:       'No se encontraron profesionales',
    topRated:    'Mejor valorados',
    nearest:     'Cerca de ti',
  },
  en: {
    title:       'Search services',
    search:      'What do you need?',
    available:   'Available',
    busy:        'Busy',
    book:        'Book',
    profile:     'View profile',
    reviews:     'reviews',
    exp:         'experience',
    filterAvail: 'Available only',
    results:     'professionals found',
    empty:       'No professionals found',
    topRated:    'Top rated',
    nearest:     'Near you',
  }
}

const avatarColors = ['#F26000','#C24D00','#FF8533','#7A3000','#FFB380']

export default function ServicesPage({ lang = 'es', navigate, initialCategory = 'all' }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [search,         setSearch]         = useState('')
  const [onlyAvailable,  setOnlyAvailable]  = useState(false)
  const [sortBy,         setSortBy]         = useState('all')
  const [professionals,  setProfessionals]  = useState([])
  const [loading,        setLoading]        = useState(true)

  const cats = categories[lang]
  const T    = txt[lang]

  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true)
      try {
        // temporalmente permitimos pros incompletos para poblar en pruebas
        const q = query(
          collection(db, 'users'),
          where('type', '==', 'pro')
        )
        const querySnapshot = await getDocs(q)
        const prosList = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          prosList.push({
            id:         doc.id,
            name:       data.name       || 'Sin nombre',
            category:   data.category   || 'unknown',
            rating:     data.rating     || 5.0,
            reviews:    data.reviews    || 0,
            location:   data.location   || 'República Dominicana',
            experience: data.experience || '1 año',
            avatar:     (data.name || 'P').substring(0, 2).toUpperCase(),
            available:  data.available !== false,
            photoURL:   data.photoURL   || null,
            phone:      data.phone      || null,
          })
        })
        setProfessionals(prosList)
      } catch (err) {
        console.error('Error fetching pro users: ', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfessionals()
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

      {/* Header */}
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

      {/* Filtros rápidos */}
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

      {/* Categorías */}
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

      {/* Contador */}
      <div className="results-bar">
        {loading
          ? <span className="results-count">Cargando...</span>
          : <span className="results-count">{filtered.length} {T.results}</span>
        }
      </div>

      {/* Grid */}
      <div className="professionals-grid">
        {filtered.map((pro, i) => (
          <div
            key={pro.id}
            className="pro-card"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="card-photo">
              {pro.photoURL ? (
                <img src={pro.photoURL} alt={pro.name} className="pro-photo" />
              ) : (
                <div
                  className="pro-avatar-big"
                  style={{ background: avatarColors[(Array.from(pro.id).reduce((acc, char) => acc + char.charCodeAt(0), 0)) % avatarColors.length] }}
                >
                  {pro.avatar}
                </div>
              )}
              <span className={`status-badge ${pro.available ? 'avail' : 'busy'}`}>
                {pro.available ? T.available : T.busy}
              </span>
            </div>

            <div className="card-body">
              <h3 className="pro-name">{pro.name}</h3>
              <p className="pro-cat">
                {cats.find(c => c.id === pro.category)?.icon}{' '}
                {cats.find(c => c.id === pro.category)?.label}
              </p>
              <p className="pro-location">📍 {pro.location}</p>
              <div className="pro-meta">
                <span className="pro-rating">★ {pro.rating.toFixed(1)} <em>({pro.reviews} {T.reviews})</em></span>
                <span className="pro-exp">⏱ {pro.experience}</span>
              </div>
            </div>

            <div className="card-footer">
              <span className="pro-exp-badge" style={{ color:'#666', fontSize:'13px', fontWeight:'600', padding:'4px 8px', background:'#eee', borderRadius:'6px' }}>
                🤝 Precio a convenir
              </span>
              <div className="card-actions">
                <button className="btn-profile" onClick={() => navigate('profile', pro)}>
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

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <span>🔍</span>
          <p>{T.empty}</p>
        </div>
      )}

      <div style={{ height: 80 }} />
    </div>
  )
}