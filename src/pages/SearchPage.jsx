import { useState, useEffect, useRef } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { CATEGORIES, FILTERS } from '../categories'
import './SearchPage.css'

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

const proMessages = {
  es: [
    'Solo los profesionales con 4 o 5 estrellas aparecen en el carrusel de destacados. Cumple cada contrato con excelencia y mejora tu visibilidad.',
    'Cumple cada contrato con excelencia. Las buenas reseñas generan confianza y te traen más clientes.',
    'Tu esfuerzo se convierte en oportunidades. Un cliente satisfecho deja mejores reseñas y más contratos.',
    'Más calidad = más contratos. Destácate, recibe 5 estrellas y aumenta tus ingresos.',
  ],
  en: [
    'Only professionals with 4 or 5 stars appear in the featured carousel. Complete every job with excellence.',
    'Complete every contract with excellence. Good reviews build trust and bring you more clients.',
    'Your effort turns into opportunities. A satisfied client leaves better reviews and more contracts.',
    'More quality = more contracts. Stand out, get 5 stars and increase your income.',
  ]
}

const clientMessages = {
  es: ['¡Tu opinión manda! Califica con estrellas a los profesionales para ayudar a otros a elegir siempre lo mejor.'],
  en: ['Your voice matters! Rate professionals with stars to help everyone choose the best.'],
}

// ── Banner animado ──────────────────────────────────────────────
function PromoBanner({ lang, userRole }) {
  const messages = userRole === 'pro' ? proMessages[lang] : clientMessages[lang]
  const [current, setCurrent] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % messages.length)
      setAnimKey(prev => prev + 1)
    }, 5200)
    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <>
      <style>{`
        @keyframes listo-starPop {
          0%,100% { transform: scale(1) rotate(0deg); }
          50%      { transform: scale(1.4) rotate(20deg); }
        }
        @keyframes listo-starFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-4px); }
        }
        @keyframes listo-shimmer {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        @keyframes listo-fadeSlide {
          0%   { opacity: 0; transform: translateY(10px); }
          12%  { opacity: 1; transform: translateY(0); }
          85%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .listo-promo-banner {
          background: linear-gradient(135deg, #FF6B00, #FF8C00);
          margin: 0 16px 16px;
          border-radius: 14px;
          padding: 14px 16px;
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          box-shadow: 0 4px 16px rgba(255,107,0,0.25);
          overflow: hidden;
        }
        .listo-promo-spark {
          position: absolute;
          font-size: 10px;
          color: #fff;
          opacity: 0.3;
          animation: listo-shimmer 2s ease-in-out infinite;
          pointer-events: none;
        }
        .listo-promo-star {
          font-size: 28px;
          flex-shrink: 0;
          margin-top: 4px;
          animation: listo-starPop 2s ease-in-out infinite, listo-starFloat 3s ease-in-out infinite;
          filter: drop-shadow(0 0 6px rgba(255,220,0,0.8));
        }
        .listo-promo-body {
          flex: 1;
          min-height: 58px;
          position: relative;
        }
        .listo-promo-msg {
          animation: listo-fadeSlide 5s ease-in-out forwards;
        }
        .listo-mini-stars {
          display: flex;
          gap: 2px;
          margin-bottom: 4px;
        }
        .listo-mini-star {
          font-size: 11px;
          animation: listo-shimmer 1.5s ease-in-out infinite;
        }
        .listo-promo-text {
          margin: 0;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          line-height: 1.5;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      `}</style>

      <div className="listo-promo-banner">
        <span className="listo-promo-spark" style={{ top:'8px',  left:'35%', animationDelay:'0.3s' }}>★</span>
        <span className="listo-promo-spark" style={{ top:'55%', left:'60%', animationDelay:'0.9s' }}>★</span>
        <span className="listo-promo-spark" style={{ top:'15%', left:'80%', animationDelay:'0.5s' }}>★</span>
        <span className="listo-promo-spark" style={{ top:'70%', left:'25%', animationDelay:'1.2s' }}>★</span>
        <span className="listo-promo-spark" style={{ top:'65%', left:'75%', animationDelay:'0.1s' }}>★</span>
        <span className="listo-promo-star">⭐</span>
        <div className="listo-promo-body">
          <div key={animKey} className="listo-promo-msg">
            <div className="listo-mini-stars">
              {[0,1,2,3,4].map(i => (
                <span key={i} className="listo-mini-star" style={{ animationDelay:`${i*0.2}s` }}>⭐</span>
              ))}
            </div>
            <p className="listo-promo-text">{messages[current]}</p>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Profesional del Mes ─────────────────────────────────────────
function ProDelMes({ lang, navigate }) {
  const [proDelMes, setProDelMes] = useState(null)
  const [totalEstrellas, setTotalEstrellas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mes] = useState(() => {
    const now = new Date()
    return new Intl.DateTimeFormat(lang === 'es' ? 'es-DO' : 'en-US', { month: 'long', year: 'numeric' }).format(now)
  })

  useEffect(() => {
    const calcularProDelMes = async () => {
      try {
        // Obtener inicio del mes actual
        const now = new Date()
        const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)
        const inicioMesTs = Math.floor(inicioMes.getTime() / 1000)

        // Traer todas las órdenes calificadas del mes
        const q = query(collection(db, 'orders'), where('rated', '==', true))
        const snapshot = await getDocs(q)

        const conteo = {} // { proId: { estrellas, nombre, foto, especialidad } }

        snapshot.forEach(doc => {
          const d = doc.data()
          const createdTs = d.createdAt?.seconds || 0
          if (createdTs < inicioMesTs) return // solo este mes

          const proId = d.proId || d.professionalId
          if (!proId) return

          if (!conteo[proId]) {
            conteo[proId] = {
              id: proId,
              nombre: d.proName || d.professionalName || 'Profesional',
              foto: d.proPhoto || d.professionalPhoto || null,
              especialidad: d.proSpecialty || d.specialty || 'Servicios',
              estrellas: 0,
              contratos: 0,
            }
          }
          conteo[proId].estrellas += (d.ratingScore || 5)
          conteo[proId].contratos += 1
        })

        const lista = Object.values(conteo)
        if (lista.length === 0) {
          // Si no hay datos del mes, buscar el mejor pro general
          const qPros = query(collection(db, 'users'), where('type', '==', 'pro'))
          const snapPros = await getDocs(qPros)
          let mejor = null
          snapPros.forEach(doc => {
            const d = doc.data()
            if (!mejor || (d.rating || 0) > (mejor.rating || 0)) {
              mejor = { id: doc.id, ...d }
            }
          })
          if (mejor) {
            setProDelMes({
              id: mejor.id,
              nombre: mejor.name || 'Profesional',
              foto: mejor.photoURL || null,
              especialidad: mejor.category || 'Servicios',
              estrellas: Math.round((mejor.rating || 5) * (mejor.reviews || 1)),
              contratos: mejor.reviews || 0,
              avatar: (mejor.name || 'P').substring(0, 2).toUpperCase(),
            })
            setTotalEstrellas(Math.round((mejor.rating || 5) * (mejor.reviews || 1)))
          }
        } else {
          lista.sort((a, b) => b.estrellas - a.estrellas)
          const ganador = lista[0]
          ganador.avatar = ganador.nombre.substring(0, 2).toUpperCase()
          setProDelMes(ganador)
          setTotalEstrellas(ganador.estrellas)
        }
      } catch (e) {
        console.error('Error calculando pro del mes:', e)
      } finally {
        setLoading(false)
      }
    }
    calcularProDelMes()
  }, [])

  if (loading || !proDelMes) return null

  const avatarBg = avatarColors[
    Array.from(proDelMes.id || 'pro').reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length
  ]

  return (
    <>
      <style>{`
        @keyframes pdm-shine {
          0%   { left: -80%; }
          100% { left: 130%; }
        }
        @keyframes pdm-crown {
          0%,100% { transform: translateY(0) rotate(-5deg) scale(1); }
          50%      { transform: translateY(-5px) rotate(5deg) scale(1.15); }
        }
        @keyframes pdm-glow {
          0%,100% { box-shadow: 0 6px 24px rgba(255,180,0,0.35), 0 2px 8px rgba(0,0,0,0.12); }
          50%      { box-shadow: 0 8px 32px rgba(255,180,0,0.6),  0 2px 8px rgba(0,0,0,0.12); }
        }
        @keyframes pdm-badge-pop {
          0%  { transform: scale(0.7); opacity: 0; }
          70% { transform: scale(1.1); }
          100%{ transform: scale(1);   opacity: 1; }
        }
        @keyframes pdm-star-spin {
          0%   { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(20deg) scale(1.3); }
          100% { transform: rotate(0deg) scale(1); }
        }
        .pdm-wrapper {
          margin: 0 16px 20px;
          border-radius: 20px;
          overflow: hidden;
          animation: pdm-glow 2.5s ease-in-out infinite;
          position: relative;
        }
        .pdm-header {
          background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
          padding: 10px 16px 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pdm-crown {
          font-size: 22px;
          animation: pdm-crown 2s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(255,215,0,0.9));
        }
        .pdm-header-text {
          flex: 1;
        }
        .pdm-label {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,215,0,0.8);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .pdm-mes {
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          margin: 0;
          text-transform: capitalize;
        }
        .pdm-body {
          background: linear-gradient(135deg, #fff9ee, #fff3d6);
          padding: 16px;
          display: flex;
          gap: 14px;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        .pdm-shine {
          position: absolute;
          top: 0; left: -80%;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          transform: skewX(-15deg);
          animation: pdm-shine 3s ease-in-out infinite;
          pointer-events: none;
        }
        .pdm-photo-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .pdm-photo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #FFD700;
          box-shadow: 0 0 0 3px rgba(255,215,0,0.3);
        }
        .pdm-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          border: 3px solid #FFD700;
          box-shadow: 0 0 0 3px rgba(255,215,0,0.3);
        }
        .pdm-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: linear-gradient(135deg, #FFD700, #FFA500);
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          border: 2px solid #fff;
          animation: pdm-badge-pop 0.5s ease-out forwards, pdm-star-spin 3s ease-in-out 0.5s infinite;
        }
        .pdm-info {
          flex: 1;
        }
        .pdm-nombre {
          font-size: 17px;
          font-weight: 800;
          color: #1a1a2e;
          margin: 0 0 2px;
        }
        .pdm-spec {
          font-size: 13px;
          color: #666;
          margin: 0 0 6px;
        }
        .pdm-stars-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }
        .pdm-stars {
          color: #FFD700;
          font-size: 15px;
          letter-spacing: 1px;
        }
        .pdm-star-count {
          font-size: 12px;
          font-weight: 700;
          color: #F26000;
          background: rgba(242,96,0,0.1);
          padding: 2px 8px;
          border-radius: 20px;
        }
        .pdm-contratos {
          font-size: 12px;
          color: #888;
          margin: 0 0 10px;
        }
        .pdm-btn {
          background: linear-gradient(135deg, #F26000, #C94E00);
          color: #fff;
          border: none;
          border-radius: 22px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(242,96,0,0.35);
          transition: transform 0.1s;
        }
        .pdm-btn:active { transform: scale(0.96); }
      `}</style>

      <div className="pdm-wrapper">
        <div className="pdm-header">
          <span className="pdm-crown">👑</span>
          <div className="pdm-header-text">
            <p className="pdm-label">{lang === 'es' ? 'Profesional del Mes' : 'Professional of the Month'}</p>
            <p className="pdm-mes">{mes}</p>
          </div>
          <span style={{ fontSize: '20px' }}>🏆</span>
        </div>

        <div className="pdm-body">
          <div className="pdm-shine" />
          <div className="pdm-photo-wrap">
            {proDelMes.foto
              ? <img src={proDelMes.foto} alt={proDelMes.nombre} className="pdm-photo" />
              : <div className="pdm-avatar" style={{ background: avatarBg }}>{proDelMes.avatar}</div>
            }
            <span className="pdm-badge">⭐</span>
          </div>

          <div className="pdm-info">
            <p className="pdm-nombre">{proDelMes.nombre}</p>
            <p className="pdm-spec">🔧 {proDelMes.especialidad}</p>
            <div className="pdm-stars-row">
              <span className="pdm-stars">★★★★★</span>
              <span className="pdm-star-count">
                {totalEstrellas} {lang === 'es' ? 'estrellas' : 'stars'}
              </span>
            </div>
            <p className="pdm-contratos">
              ✅ {proDelMes.contratos} {lang === 'es' ? 'contratos este mes' : 'contracts this month'}
            </p>
            <button className="pdm-btn" onClick={() => navigate('booking', proDelMes)}>
              {lang === 'es' ? '🤝 Contratar ahora' : '🤝 Hire now'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
// ───────────────────────────────────────────────────────────────

export default function SearchPage({ lang = 'es', navigate, initialCategory = 'all', userRole = 'client' }) {
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

  const getMappedProCatId = (catString) => {
    if (!catString) return 'all';
    const cleanStr = catString.toLowerCase();
    const allSubs = CATEGORIES.flatMap(c => c.subcategories);
    const foundSub = allSubs.find(s => s.id === cleanStr || s.labelEn.toLowerCase() === cleanStr);
    if (foundSub) return foundSub.id;
    const foundMain = CATEGORIES.find(c => c.id === cleanStr || c.labelEn.toLowerCase() === cleanStr);
    if (foundMain) return foundMain.id;
    return catString;
  }

  const currentCat = CATEGORIES.find(c => c.id === activeCategory)

  const filtered = professionals
    .filter(p => {
      const mappedCat = getMappedProCatId(p.category);
      const isSubInMain = currentCat && currentCat.subcategories.some(s => s.id === mappedCat);
      const matchCat = activeCategory === 'all' || mappedCat === activeCategory || mappedCat === activeSubcategory || isSubInMain;
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

      {/* ── BANNER ANIMADO ── */}
      <PromoBanner lang={lang} userRole={userRole} />

      {/* ── PROFESIONAL DEL MES ── */}
      <ProDelMes lang={lang} navigate={navigate} />

      {/* Filtros de disponibilidad */}
      <div className="quick-filters" style={{ padding: '0 16px', display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
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

      {/* Categorías Principales */}
      <div className="categories-wrapper">
        <div className="categories-scroll">
          <button
            className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('all')}
          >
            <span className="cat-icon">✦</span> {T.allCats}
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <span className="cat-icon">{cat.icon}</span>
              {lang === 'es' ? cat.labelEs : cat.labelEn}
            </button>
          ))}
        </div>

        {currentCat && currentCat.subcategories && currentCat.subcategories.length > 0 && (
          <div className="subcategories-scroll">
            <button
              className={`sub-pill ${activeSubcategory === 'all' ? 'active' : ''}`}
              onClick={() => handleSubcategoryClick('all')}
            >
              ✓ Todas en {lang === 'es' ? currentCat.labelEs : currentCat.labelEn}
            </button>
            {currentCat.subcategories.map(sub => (
              <button
                key={sub.id}
                className={`sub-pill ${activeSubcategory === sub.id ? 'active' : ''}`}
                onClick={() => handleSubcategoryClick(sub.id)}
              >
                <span>{sub.icon}</span> {lang === 'es' ? sub.labelEs : sub.labelEn}
              </button>
            ))}
          </div>
        )}
      </div>

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
          const mappedCat = getMappedProCatId(pro.category)
          const allSubs = CATEGORIES.flatMap(c => c.subcategories)
          const subCat  = allSubs.find(s => s.id === mappedCat)
          const mainCat = CATEGORIES.find(c => c.id === mappedCat || c.subcategories.some(s => s.id === mappedCat))

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