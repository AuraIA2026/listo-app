import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { CATEGORIES, FILTERS } from '../categories'
import './ServicesPage.css'

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
    allCats:     'Todos',
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
    allCats:     'All',
  }
}

const avatarColors = ['#F26000','#C24D00','#FF8533','#7A3000','#FFB380']

export default function SearchPage({ lang = 'es', navigate, initialCategory = 'all' }) {
  const [activeCategory,    setActiveCategory]    = useState('all')
  const [activeSubcategory, setActiveSubcategory] = useState('all')
  const [openCategory,      setOpenCategory]      = useState(null)
  const [search,            setSearch]            = useState('')
  const [onlyAvailable,     setOnlyAvailable]     = useState(false)
  const [sortBy,            setSortBy]            = useState('all')
  const [activeFilter,      setActiveFilter]      = useState(null)
  const [professionals,     setProfessionals]     = useState([])
  const [loading,           setLoading]           = useState(true)

  const T = txt[lang]

  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true)
      try {
        const q = query(collection(db, 'users'), where('type', '==', 'pro'))
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
        console.error('Error fetching pros: ', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfessionals()
  }, [])

  const handleCategoryClick = (catId) => {
    if (catId === 'all') {
      setActiveCategory('all')
      setActiveSubcategory('all')
      setOpenCategory(null)
      return
    }
    if (openCategory === catId) {
      setOpenCategory(null)
    } else {
      setOpenCategory(catId)
      setActiveCategory(catId)
      setActiveSubcategory('all')
    }
  }

  const handleSubcategoryClick = (subId) => {
    setActiveSubcategory(subId)
    setOpenCategory(null)
  }

  const filtered = professionals
    .filter(p => {
      const matchCat    = activeCategory === 'all' || p.category === activeCategory || p.category === activeSubcategory
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

  const currentCat = CATEGORIES.find(c => c.id === activeCategory)

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
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`qf-btn ${activeFilter === f.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
          >
            {f.icon} {lang === 'es' ? f.labelEs : f.labelEn}
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

      {/* Categorías desplegables */}
      <div className="categories-accordion">

        {/* Botón "Todos" */}
        <button
          className={`cat-main-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('all')}
        >
          <span className="cat-icon">✦</span>
          <span className="cat-main-label">{T.allCats}</span>
        </button>

        {/* Categorías principales */}
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="cat-accordion-item">
            <button
              className={`cat-main-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-main-label">{lang === 'es' ? cat.labelEs : cat.labelEn}</span>
              <span className={`cat-arrow ${openCategory === cat.id ? 'open' : ''}`}>›</span>
            </button>

            {/* Subcategorías desplegables */}
            {openCategory === cat.id && (
              <div className="cat-subcategories">
                {cat.subcategories.map(sub => (
                  <button
                    key={sub.id}
                    className={`cat-sub-btn ${activeSubcategory === sub.id ? 'active' : ''}`}
                    onClick={() => handleSubcategoryClick(sub.id)}
                  >
                    <span>{sub.icon}</span>
                    <span>{lang === 'es' ? sub.labelEs : sub.labelEn}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Subcategoría activa */}
      {activeSubcategory !== 'all' && (
        <div className="active-sub-badge">
          <span>
            {currentCat?.subcategories.find(s => s.id === activeSubcategory)?.icon}{' '}
            {lang === 'es'
              ? currentCat?.subcategories.find(s => s.id === activeSubcategory)?.labelEs
              : currentCat?.subcategories.find(s => s.id === activeSubcategory)?.labelEn
            }
          </span>
          <button onClick={() => setActiveSubcategory('all')}>✕</button>
        </div>
      )}

      {/* Contador */}
      <div className="results-bar">
        {loading
          ? <span className="results-count">Cargando...</span>
          : <span className="results-count">{filtered.length} {T.results}</span>
        }
      </div>

      {/* Grid de profesionales */}
      <div className="professionals-grid">
        {filtered.map((pro, i) => {
          const allSubs = CATEGORIES.flatMap(c => c.subcategories)
          const subCat  = allSubs.find(s => s.id === pro.category)
          const mainCat = CATEGORIES.find(c => c.id === pro.category || c.subcategories.some(s => s.id === pro.category))

          return (
            <div key={pro.id} className="pro-card" style={{ animationDelay: `${i * 0.06}s` }}>
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
                  {subCat?.icon || mainCat?.icon || '🔧'}{' '}
                  {lang === 'es' ? (subCat?.labelEs || mainCat?.labelEs || pro.category) : (subCat?.labelEn || mainCat?.labelEn || pro.category)}
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
                  <button className="btn-profile" onClick={() => navigate('proProfile', pro)}>
                    👤 {T.profile}
                  </button>
                  <button className="btn-book" onClick={() => navigate('booking', pro)}>
                    {T.book}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
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