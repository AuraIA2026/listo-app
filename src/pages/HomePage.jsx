import { useState, useEffect, useRef } from 'react'
import './HomePage.css'
import Publicidad from './Publicidad'
import TutorialTour, { useTour } from '../components/TutorialTour'
import VIPBanner from '../components/VIPBanner'
import BtnHamburguesa from '../components/BtnHamburguesa'
import BtnHamburguesaUsuario from '../components/BtnHamburguesaUsuario'

import mecanico   from '../assets/pros/Mecanico.jpg'
import mecanico1  from '../assets/pros/Mecanico1.jpg'
import electrica  from '../assets/pros/Electricista.jpg'
import electrica1 from '../assets/pros/Electricista1.jpg'
import plomero    from '../assets/pros/Plomero.jpg'
import refrig     from '../assets/pros/Refigeracion.jpg'
import cerrajero  from '../assets/pros/Cerrajero.jpg'
import cerrajero1 from '../assets/pros/Cerrajero1.jpg'
import pintor     from '../assets/pros/Pintor.jpg'
import pintor1    from '../assets/pros/Pintor1.jpg'
import jardinero  from '../assets/pros/Jardinero.jpg'
import ninera     from '../assets/pros/Niñera.jpg'
import ninera1    from '../assets/pros/Niñera1.jpg'

const testimonials = [
  { nameEs:'María González',  photo: electrica1, rating:5, dateEs:'Hace 2 días',    dateEn:'2 days ago',   specEs:'Electricista', specEn:'Electrician', textEs:'Excelente servicio, llegó puntual y resolvió el problema en menos de una hora. Lo recomiendo 100%.', textEn:'Excellent service, arrived on time and fixed the problem in less than an hour. 100% recommended.' },
  { nameEs:'Juan Pérez',      photo: plomero,    rating:5, dateEs:'Hace 5 días',    dateEn:'5 days ago',   specEs:'Plomero',      specEn:'Plumber',      textEs:'Muy profesional y limpio en su trabajo. El precio fue justo y quedé muy satisfecho con el resultado.', textEn:'Very professional and clean work. The price was fair and I was very satisfied with the result.' },
  { nameEs:'Carmen Díaz',     photo: pintor1,    rating:4, dateEs:'Hace 1 semana',  dateEn:'1 week ago',   specEs:'Pintora',      specEn:'Painter',      textEs:'Buen trabajo en general. La pintura quedó perfecta, aunque tardó un poco más de lo previsto.', textEn:'Good work overall. The paint job was perfect, though it took a bit longer than expected.' },
  { nameEs:'Roberto Núñez',   photo: cerrajero1, rating:5, dateEs:'Hace 2 semanas', dateEn:'2 weeks ago',  specEs:'Cerrajero',    specEn:'Locksmith',    textEs:'Me quedé encerrado a las 11pm y llegó en 20 minutos. Un salvavidas, literalmente. Gracias!', textEn:'I was locked out at 11pm and he arrived in 20 minutes. A lifesaver, literally. Thank you!' },
  { nameEs:'Luisa Martínez',  photo: mecanico1,  rating:5, dateEs:'Hace 3 semanas', dateEn:'3 weeks ago',  specEs:'Mecánico',     specEn:'Mechanic',     textEs:'El mejor mecánico que he encontrado. Honesto, rápido y con precios razonables. Ya es mi mecánico fijo.', textEn:'The best mechanic I have found. Honest, fast and with reasonable prices. Already my go-to mechanic.' },
  { nameEs:'Carlos Herrera',  photo: jardinero,  rating:5, dateEs:'Hace 1 mes',     dateEn:'1 month ago',  specEs:'Jardinero',    specEn:'Gardener',     textEs:'Transformó mi jardín completamente. Muy creativo y trabajador. El resultado superó mis expectativas.', textEn:'He completely transformed my garden. Very creative and hardworking. The result exceeded my expectations.' },
]

const categories = [
  { icon:'🔧', labelEs:'Mecánico',     labelEn:'Mechanic' },
  { icon:'⚡', labelEs:'Electricista', labelEn:'Electrician' },
  { icon:'🔩', labelEs:'Plomero',      labelEn:'Plumber' },
  { icon:'🔑', labelEs:'Cerrajero',    labelEn:'Locksmith' },
  { icon:'🎨', labelEs:'Pintor',       labelEn:'Painter' },
  { icon:'🌿', labelEs:'Jardinero',    labelEn:'Gardener' },
  { icon:'👶', labelEs:'Niñera',       labelEn:'Nanny' },
  { icon:'🧹', labelEs:'Limpieza',     labelEn:'Cleaning' },
]

const allCategories = [
  { icon:'🔑', labelEs:'Cerrajero',           labelEn:'Locksmith' },
  { icon:'💆', labelEs:'Masajes',             labelEn:'Massages' },
  { icon:'🔧', labelEs:'Mecánico',            labelEn:'Mechanic' },
  { icon:'❄️', labelEs:'Refrigeración',       labelEn:'Refrigeration' },
  { icon:'🛵', labelEs:'Mensajeros',          labelEn:'Messengers' },
  { icon:'🏠', labelEs:'Limpieza del hogar',  labelEn:'Home cleaning' },
  { icon:'🏢', labelEs:'Limpieza de oficina', labelEn:'Office cleaning' },
  { icon:'💼', labelEs:'Secretaria',          labelEn:'Secretary' },
  { icon:'🇺🇸', labelEs:'Profesor de inglés', labelEn:'English teacher' },
  { icon:'🪚', labelEs:'Ebanista',            labelEn:'Cabinetmaker' },
  { icon:'🧱', labelEs:'Albañil',             labelEn:'Mason' },
  { icon:'📸', labelEs:'Fotógrafo',           labelEn:'Photographer' },
  { icon:'⚡', labelEs:'Eficiencia energética', labelEn:'Energy efficiency' },
  { icon:'🔧', labelEs:'Instalación',         labelEn:'Installation' },
  { icon:'🌿', labelEs:'Jardinería',          labelEn:'Gardening' },
  { icon:'👕', labelEs:'Lavandería',          labelEn:'Laundry' },
  { icon:'🧹', labelEs:'Limpieza',            labelEn:'Cleaning' },
  { icon:'🛠️', labelEs:'Mantenimiento',       labelEn:'Maintenance' },
  { icon:'🔩', labelEs:'Montaje',             labelEn:'Assembly' },
  { icon:'📦', labelEs:'Mudanzas',            labelEn:'Moving' },
  { icon:'🎯', labelEs:'Personalizado',       labelEn:'Custom' },
  { icon:'🐛', labelEs:'Plagas',              labelEn:'Pest control' },
  { icon:'🏗️', labelEs:'Reformas',           labelEn:'Renovations' },
  { icon:'🔨', labelEs:'Reparación',          labelEn:'Repair' },
]

const featuredPros = [
  { img:mecanico1,  nameEs:'Carlos Méndez',  specEs:'Mecánico Automotriz', specEn:'Auto Mechanic',  rating:4.9, reviews:128, price:'RD$800',   badge:'Top' },
  { img:electrica1, nameEs:'Ana Rodríguez',  specEs:'Electricista',        specEn:'Electrician',    rating:4.8, reviews:95,  price:'RD$950',   badge:'Popular' },
  { img:plomero,    nameEs:'José Martínez',  specEs:'Plomero',             specEn:'Plumber',        rating:4.9, reviews:210, price:'RD$700',   badge:'Top' },
  { img:pintor1,    nameEs:'María Torres',   specEs:'Pintora',             specEn:'Painter',        rating:4.7, reviews:67,  price:'RD$2,500', badge:null },
  { img:cerrajero1, nameEs:'Pedro García',   specEs:'Cerrajero',           specEn:'Locksmith',      rating:5.0, reviews:44,  price:'RD$500',   badge:'Nuevo' },
  { img:jardinero,  nameEs:'Luis Fernández', specEs:'Jardinero',           specEn:'Gardener',       rating:4.8, reviews:83,  price:'RD$600',   badge:null },
]

const allPros = [
  { img:mecanico,   nameEs:'Roberto Sánchez',  specEs:'Mecánico',      rating:4.6, price:'RD$650',    avail:true },
  { img:electrica,  nameEs:'Sandra López',     specEs:'Electricista',  rating:4.7, price:'RD$750',    avail:true },
  { img:cerrajero,  nameEs:'Miguel Díaz',      specEs:'Cerrajero',     rating:4.5, price:'RD$500',    avail:false },
  { img:pintor,     nameEs:'Carmen Vega',      specEs:'Pintor',        rating:4.8, price:'RD$2,200',  avail:true },
  { img:ninera,     nameEs:'Patricia Ruiz',    specEs:'Niñera',        rating:4.9, price:'RD$400/hr', avail:true },
  { img:ninera1,    nameEs:'Daniela Mora',     specEs:'Niñera',        rating:4.7, price:'RD$450/hr', avail:true },
  { img:refrig,     nameEs:'Héctor Cruz',      specEs:'A/C & Refrig.', rating:4.8, price:'RD$1,200',  avail:false },
  { img:jardinero,  nameEs:'Antonio Reyes',    specEs:'Jardinero',     rating:4.6, price:'RD$550',    avail:true },
  { img:mecanico1,  nameEs:'Ramón Castillo',   specEs:'Mecánico',      rating:4.5, price:'RD$700',    avail:true },
  { img:plomero,    nameEs:'Francisco Núñez',  specEs:'Plomero',       rating:4.7, price:'RD$680',    avail:true },
  { img:electrica1, nameEs:'Gabriela Suárez',  specEs:'Electricista',  rating:4.9, price:'RD$900',    avail:false },
  { img:cerrajero1, nameEs:'Jorge Herrera',    specEs:'Cerrajero',     rating:4.4, price:'RD$480',    avail:true },
]

const sections = [
  { id:'mecanico',     titleEs:'🔧 Mecánico',     titleEn:'🔧 Mechanic',    services:[
    { img:mecanico1,  nameEs:'Diagnóstico vehicular', nameEn:'Vehicle diagnostic',  price:'RD$800',   tag:'Popular' },
    { img:mecanico,   nameEs:'Cambio de aceite',      nameEn:'Oil change',          price:'RD$650',   tag:null },
  ]},
  { id:'electricista', titleEs:'⚡ Electricista', titleEn:'⚡ Electrician', services:[
    { img:electrica1, nameEs:'Instalación eléctrica',  nameEn:'Electrical install', price:'RD$950',   tag:'Popular' },
    { img:electrica,  nameEs:'Reparación de circuito', nameEn:'Circuit repair',     price:'RD$750',   tag:null },
  ]},
  { id:'plomero',      titleEs:'🔩 Plomero',      titleEn:'🔩 Plumber',     services:[
    { img:plomero,    nameEs:'Reparación de tubería', nameEn:'Pipe repair',          price:'RD$700',   tag:'Popular' },
    { img:refrig,     nameEs:'Refrigeración y A/C',   nameEn:'A/C & Refrigeration', price:'RD$1,200', tag:'24/7' },
  ]},
  { id:'cerrajero',    titleEs:'🔑 Cerrajero',    titleEn:'🔑 Locksmith',   services:[
    { img:cerrajero,  nameEs:'Apertura de puertas',  nameEn:'Door opening',    price:'RD$500',   tag:'Urgente' },
    { img:cerrajero1, nameEs:'Cambio de cerraduras', nameEn:'Lock replacement', price:'RD$650',   tag:null },
  ]},
  { id:'pintor',       titleEs:'🎨 Pintor',       titleEn:'🎨 Painter',     services:[
    { img:pintor,     nameEs:'Pintura interior',   nameEn:'Interior painting', price:'RD$2,500', tag:'Popular' },
    { img:pintor1,    nameEs:'Pintura de fachada', nameEn:'Exterior painting', price:'RD$3,500', tag:null },
  ]},
  { id:'jardinero',    titleEs:'🌿 Jardinero',    titleEn:'🌿 Gardener',    services:[
    { img:jardinero,  nameEs:'Poda y mantenimiento', nameEn:'Pruning & maintenance', price:'RD$600',   tag:'Popular' },
    { img:ninera,     nameEs:'Diseño de jardín',     nameEn:'Garden design',         price:'RD$1,800', tag:null },
  ]},
  { id:'ninera',       titleEs:'👶 Niñera',       titleEn:'👶 Nanny',       services:[
    { img:ninera,     nameEs:'Cuidado de niños', nameEn:'Child care',          price:'RD$400/hr', tag:'Popular' },
    { img:ninera1,    nameEs:'Apoyo educativo',  nameEn:'Educational support', price:'RD$500/hr', tag:null },
  ]},
]

function StarRating({ rating }) {
  return (
    <span className="star-rating">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span className="star-num">{rating.toFixed(1)}</span>
    </span>
  )
}

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function TestimonialsCarousel({ lang }) {
  const [allTestimonials, setAllTestimonials] = useState(testimonials)

  useEffect(() => {
    try {
      const dynamic = JSON.parse(localStorage.getItem('listo_resenas') || '[]')
      const filtered = dynamic.filter(r => r.rating >= 4 && r.textEs && r.textEs.trim() !== '')
      if (filtered.length > 0) setAllTestimonials([...filtered, ...testimonials])
    } catch(e) {}
  }, [])

  const [idx, setIdx]  = useState(0)
  const touchStartX    = useRef(null)
  const touchEndX      = useRef(null)
  const timerRef       = useRef(null)
  const [ref, visible] = useScrollReveal(0.1)

  const startAutoPlay = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % allTestimonials.length), 5000)
  }

  useEffect(() => {
    startAutoPlay()
    return () => clearInterval(timerRef.current)
  }, [])

  const goTo = (i) => { setIdx(i); startAutoPlay() }
  const prev = () => goTo((idx - 1 + allTestimonials.length) % allTestimonials.length)
  const next = () => goTo((idx + 1) % allTestimonials.length)

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; touchEndX.current = null }
  const onTouchMove  = (e) => { touchEndX.current = e.touches[0].clientX }
  const onTouchEnd   = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    touchStartX.current = null
    touchEndX.current   = null
  }

  const t = allTestimonials[idx] || allTestimonials[0]

  return (
    <section ref={ref} className={`testimonials-section${visible ? ' reveal' : ''}`}>
      <div className="hp-sec-header">
        <h2 className="hp-sec-title">💬 {lang === 'es' ? 'Lo que dicen nuestros clientes' : 'What our clients say'}</h2>
      </div>
      <div className="testimonial-card" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <button className="testi-arrow testi-arrow-left" onClick={prev}>‹</button>
        <div className="testi-body" key={idx}>
          <div className="testi-header">
            <div className="testi-photo-wrap">
              {t.photo
                ? <img src={t.photo} alt={t.nameEs} className="testi-photo" />
                : <div className="testi-photo" style={{background:'#FF8533',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'22px',fontWeight:'700'}}>{t.nameEs?.charAt(0) || '👤'}</div>
              }
            </div>
            <div className="testi-meta">
              <p className="testi-name">{t.nameEs}</p>
              <p className="testi-spec">{lang === 'es' ? t.specEs : t.specEn}</p>
            </div>
            <span className="testi-date">{lang === 'es' ? t.dateEs : t.dateEn}</span>
          </div>
          <div className="testi-stars">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
          <p className="testi-text">"{lang === 'es' ? t.textEs : t.textEn}"</p>
        </div>
        <button className="testi-arrow testi-arrow-right" onClick={next}>›</button>
      </div>
      <div className="testi-dots">
        {allTestimonials.map((_, i) => (
          <button key={i} className={`testi-dot${i === idx ? ' active' : ''}`} onClick={() => goTo(i)} />
        ))}
      </div>
      <p className="testi-counter">{idx + 1} / {allTestimonials.length}</p>
    </section>
  )
}

export default function HomePage({ lang, navigate, userRole }) {
  const [proFilter, setProFilter] = useState('todos')
  const [showTour, closeTour]     = useTour()
  const [showHamburguesa, setShowHamburguesa] = useState(false)

  const [featuredRef, featuredVisible] = useScrollReveal()
  const [allProsRef,  allProsVisible]  = useScrollReveal(0.05)
  const [catListRef,  catListVisible]  = useScrollReveal(0.05)

  const isPro = userRole === 'pro'

  const specs = ['todos', ...new Set(allPros.map(p => p.specEs))]
  const filteredPros = proFilter === 'todos' ? allPros : allPros.filter(p => p.specEs === proFilter)

  return (
    <div className="home-page">

      {/* ── SEARCH BAR ── */}
      <div className="hp-search-bar">
        <button className="hp-notif" onClick={() => setShowHamburguesa(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <button className="hp-search-btn" onClick={() => navigate('search')}>
          <span>🔍</span>
          <span className="hp-search-placeholder">
            {lang === 'es' ? '¿Cómo podemos ayudar?' : 'How can we help?'}
          </span>
        </button>
      </div>

      {/* ── VIP BANNER — solo para profesionales ── */}
      {isPro && <VIPBanner onOpenPlanes={() => setShowHamburguesa(true)} />}

      <Publicidad lang={lang} />

      <div className="hp-cats-scroll">
        {categories.map((c, i) => (
          <button key={i} className="hp-cat-btn" onClick={() => navigate('search')}>
            <span className="hp-cat-icon">{c.icon}</span>
            <span className="hp-cat-label">{lang === 'es' ? c.labelEs : c.labelEn}</span>
          </button>
        ))}
      </div>

      <TestimonialsCarousel lang={lang} />

      <section ref={featuredRef} className={`featured-section${featuredVisible ? ' reveal' : ''}`}>
        <div className="hp-sec-header">
          <h2 className="hp-sec-title">⭐ {lang === 'es' ? 'Profesionales Destacados' : 'Featured Professionals'}</h2>
          <button className="hp-see-all" onClick={() => navigate('search')}>{lang === 'es' ? 'Ver todos' : 'See all'}</button>
        </div>
        <div className="featured-scroll">
          {featuredPros.map((pro, i) => (
            <div key={i} className="featured-card" style={{ animationDelay: `${i * 0.08}s` }} onClick={() => navigate('booking', { specialty: pro.specEs.toLowerCase() })}>
              {pro.badge && <span className={`featured-badge badge-${pro.badge.toLowerCase()}`}>{pro.badge}</span>}
              <img src={pro.img} alt={pro.nameEs} className="featured-img" />
              <div className="featured-info">
                <p className="featured-name">{pro.nameEs}</p>
                <p className="featured-spec">{lang === 'es' ? pro.specEs : pro.specEn}</p>
                <StarRating rating={pro.rating} />
                <p className="featured-reviews">{pro.reviews} {lang === 'es' ? 'reseñas' : 'reviews'}</p>
                <p className="featured-price">{lang === 'es' ? 'Desde' : 'From'} <strong>{pro.price}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {sections.map(sec => (
        <section key={sec.id} className="hp-service-section">
          <div className="hp-sec-header">
            <h2 className="hp-sec-title">{lang === 'es' ? sec.titleEs : sec.titleEn}</h2>
            <button className="hp-see-all" onClick={() => navigate('search')}>{lang === 'es' ? 'Ver todo' : 'See all'}</button>
          </div>
          <div className="hp-service-cards">
            {sec.services.map((s, i) => (
              <div key={i} className="hp-svc-card" onClick={() => navigate('booking', { specialty: sec.id })}>
                <div className="hp-svc-img-wrap">
                  {s.tag && <span className="hp-svc-tag">{s.tag}</span>}
                  <img src={s.img} alt={s.nameEs} className="hp-svc-img" />
                </div>
                <div className="hp-svc-info">
                  <p className="hp-svc-name">{lang === 'es' ? s.nameEs : s.nameEn}</p>
                  <p className="hp-svc-price">{s.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section ref={allProsRef} className={`all-pros-section${allProsVisible ? ' reveal' : ''}`}>
        <div className="hp-sec-header" style={{ marginBottom: 12 }}>
          <h2 className="hp-sec-title">👥 {lang === 'es' ? 'Todos los Profesionales' : 'All Professionals'}</h2>
          <span className="pros-count">{filteredPros.length} {lang === 'es' ? 'disponibles' : 'available'}</span>
        </div>
        <div className="pros-filter-scroll">
          {specs.map((s, i) => (
            <button key={i} className={`pros-filter-btn${proFilter === s ? ' active' : ''}`} onClick={() => setProFilter(s)}>
              {s === 'todos' ? (lang === 'es' ? 'Todos' : 'All') : s}
            </button>
          ))}
        </div>
        <div className="all-pros-grid">
          {filteredPros.map((pro, i) => (
            <div key={i} className="pro-list-card" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => navigate('booking', { specialty: pro.specEs.toLowerCase() })}>
              <div className="pro-list-img-wrap">
                <img src={pro.img} alt={pro.nameEs} className="pro-list-img" />
                <span className={`pro-avail-dot${pro.avail ? ' online' : ''}`} />
              </div>
              <div className="pro-list-info">
                <p className="pro-list-name">{pro.nameEs}</p>
                <p className="pro-list-spec">{pro.specEs}</p>
                <StarRating rating={pro.rating} />
                <p className="pro-list-price">{lang === 'es' ? 'Desde' : 'From'} <strong>{pro.price}</strong></p>
              </div>
              <button className="pro-list-book">{lang === 'es' ? 'Reservar' : 'Book'}</button>
            </div>
          ))}
        </div>
      </section>

      <section ref={catListRef} className={`cat-list-section${catListVisible ? ' reveal' : ''}`}>
        <div className="hp-sec-header">
          <h2 className="hp-sec-title">🗂️ {lang === 'es' ? 'Explorar servicios' : 'Explore services'}</h2>
        </div>
        <div className="cat-list">
          {allCategories.map((c, i) => (
            <button key={i} className="cat-list-item" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => navigate('search')}>
              <span className="cat-list-icon">{c.icon}</span>
              <span className="cat-list-label">{lang === 'es' ? c.labelEs : c.labelEn}</span>
              <span className="cat-list-arrow">›</span>
            </button>
          ))}
        </div>
      </section>

      <div style={{ height: 90 }} />

      {showTour && <TutorialTour lang={lang} onFinish={closeTour} />}

      {/* ── MENÚ HAMBURGUESA — profesional o usuario según rol ── */}
      {showHamburguesa && (
        isPro
          ? <BtnHamburguesa        onClose={() => setShowHamburguesa(false)} />
          : <BtnHamburguesaUsuario onClose={() => setShowHamburguesa(false)} />
      )}

    </div>
  )
}