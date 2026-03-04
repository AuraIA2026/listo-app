import { useState, useEffect } from 'react'
import './ServicesPage.css'

// ── Fotos de profesionales ────────────────────────────────────────────────────
import imgMecanico    from '../assets/pros/Mecanico.jpg'
import imgMecanico1   from '../assets/pros/Mecanico1.jpg'
import imgElectricista  from '../assets/pros/Electricista.jpg'
import imgElectricista1 from '../assets/pros/Electricista1.jpg'
import imgJardinero   from '../assets/pros/Jardinero.jpg'
import imgNinera      from '../assets/pros/Niñera.jpg'
import imgNinera1     from '../assets/pros/Niñera1.jpg'
import imgPintor      from '../assets/pros/Pintor.jpg'
import imgCerrajero   from '../assets/pros/Cerrajero.jpg'
import imgCerrajero1  from '../assets/pros/Cerrajero1.jpg'

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

// ── Profesionales ─────────────────────────────────────────────────────────────
const professionals = [
  { id: 1,  name: 'Carlos Méndez',    category: 'mechanic',    rating: 4.9, reviews: 128, price: 'RD$800/hr',  location: 'Santo Domingo', experience: '8 años',  avatar: 'CM', available: true,  photo: imgMecanico    },
  { id: 2,  name: 'Ana Rodríguez',    category: 'electrician', rating: 4.8, reviews: 94,  price: 'RD$950/hr',  location: 'Santiago',      experience: '6 años',  avatar: 'AR', available: true,  photo: imgElectricista },
  { id: 3,  name: 'Pedro Sánchez',    category: 'plumber',     rating: 4.7, reviews: 211, price: 'RD$750/hr',  location: 'Santo Domingo', experience: '12 años', avatar: 'PS', available: false, photo: null           },
  { id: 4,  name: 'María López',      category: 'nanny',       rating: 5.0, reviews: 67,  price: 'RD$400/hr',  location: 'La Romana',     experience: '5 años',  avatar: 'ML', available: true,  photo: imgNinera      },
  { id: 5,  name: 'Luis García',      category: 'painter',     rating: 4.6, reviews: 45,  price: 'RD$600/hr',  location: 'Santiago',      experience: '9 años',  avatar: 'LG', available: true,  photo: imgPintor      },
  { id: 6,  name: 'Carmen Díaz',      category: 'cleaner',     rating: 4.9, reviews: 302, price: 'RD$350/hr',  location: 'Santo Domingo', experience: '7 años',  avatar: 'CD', available: true,  photo: null           },
  { id: 7,  name: 'Roberto Torres',   category: 'carpenter',   rating: 4.8, reviews: 88,  price: 'RD$700/hr',  location: 'Puerto Plata',  experience: '15 años', avatar: 'RT', available: false, photo: null           },
  { id: 8,  name: 'Sofía Martínez',   category: 'gardener',    rating: 4.7, reviews: 53,  price: 'RD$500/hr',  location: 'Santo Domingo', experience: '4 años',  avatar: 'SM', available: true,  photo: imgJardinero   },
  { id: 9,  name: 'Juan Herrera',     category: 'electrician', rating: 4.5, reviews: 139, price: 'RD$900/hr',  location: 'Santo Domingo', experience: '10 años', avatar: 'JH', available: true,  photo: imgElectricista1 },
  { id: 10, name: 'Elena Castillo',   category: 'nanny',       rating: 4.9, reviews: 41,  price: 'RD$450/hr',  location: 'Santiago',      experience: '3 años',  avatar: 'EC', available: true,  photo: imgNinera1     },
  { id: 11, name: 'Miguel Ángel Ruiz',category: 'mechanic',    rating: 4.6, reviews: 77,  price: 'RD$850/hr',  location: 'La Vega',       experience: '11 años', avatar: 'MR', available: true,  photo: imgMecanico1   },
  { id: 12, name: 'Patricia Núñez',   category: 'cleaner',     rating: 4.8, reviews: 189, price: 'RD$380/hr',  location: 'Santo Domingo', experience: '6 años',  avatar: 'PN', available: false, photo: null           },
  { id: 13, name: 'José Reyes',       category: 'locksmith',   rating: 4.7, reviews: 63,  price: 'RD$650/hr',  location: 'Santo Domingo', experience: '8 años',  avatar: 'JR', available: true,  photo: imgCerrajero   },
  { id: 14, name: 'Diana Peña',       category: 'locksmith',   rating: 4.8, reviews: 34,  price: 'RD$600/hr',  location: 'Santiago',      experience: '5 años',  avatar: 'DP', available: true,  photo: imgCerrajero1  },
]

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

  const cats = categories[lang]
  const T    = txt[lang]

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
        <span className="results-count">{filtered.length} {T.results}</span>
      </div>

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
                  style={{ background: avatarColors[pro.id % avatarColors.length] }}
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