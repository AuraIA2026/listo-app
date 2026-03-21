import { useState, useEffect, useRef } from 'react'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '../firebase'
import './HomePage.css'
import Publicidad from './Publicidad'
import TutorialTour, { useTour } from '../components/TutorialTour'
import VIPBanner from '../components/VIPBanner'
import BtnHamburguesa from '../components/BtnHamburguesa'
import BtnHamburguesaUsuario from '../components/BtnHamburguesaUsuario'
import { useUserData } from '../useUserData'

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
import bannerPros from '../assets/banner_pros.jpg'

const testimonials = [
  { nameEs:'María González',  photo: electrica1, rating:5, dateEs:'Hace 2 días',    dateEn:'2 days ago',   specEs:'Electricista', specEn:'Electrician', textEs:'Excelente servicio, llegó puntual y resolvió el problema en menos de una hora. Lo recomiendo 100%.', textEn:'Excellent service, arrived on time and fixed the problem in less than an hour. 100% recommended.' },
  { nameEs:'Juan Pérez',      photo: plomero,    rating:5, dateEs:'Hace 5 días',    dateEn:'5 days ago',   specEs:'Plomero',      specEn:'Plumber',      textEs:'Muy profesional y limpio en su trabajo. El precio fue justo y quedé muy satisfecho con el resultado.', textEn:'Very professional and clean work. The price was fair and I was very satisfied with the result.' },
  { nameEs:'Carmen Díaz',     photo: pintor1,    rating:4, dateEs:'Hace 1 semana',  dateEn:'1 week ago',   specEs:'Pintora',      specEn:'Painter',      textEs:'Buen trabajo en general. La pintura quedó perfecta, aunque tardó un poco más de lo previsto.', textEn:'Good work overall. The paint job was perfect, though it took a bit longer than expected.' },
  { nameEs:'Roberto Núñez',   photo: cerrajero1, rating:5, dateEs:'Hace 2 semanas', dateEn:'2 weeks ago',  specEs:'Cerrajero',    specEn:'Locksmith',    textEs:'Me quedé encerrado a las 11pm y llegó en 20 minutos. Un salvavidas, literalmente. Gracias!', textEn:'I was locked out at 11pm and he arrived in 20 minutes. A lifesaver, literally. Thank you!' },
  { nameEs:'Luisa Martínez',  photo: mecanico1,  rating:5, dateEs:'Hace 3 semanas', dateEn:'3 weeks ago',  specEs:'Mecánico',     specEn:'Mechanic',     textEs:'El mejor mecánico que he encontrado. Honesto, rápido y con precios razonables. Ya es mi mecánico fijo.', textEn:'The best mechanic I have found. Honest, fast and with reasonable prices. Already my go-to mechanic.' },
  { nameEs:'Carlos Herrera',  photo: jardinero,  rating:5, dateEs:'Hace 1 mes',     dateEn:'1 month ago',  specEs:'Jardinero',    specEn:'Gardener',     textEs:'Transformó mi jardín completamente. Muy creativo y trabajador. El resultado superó mis expectativas.', textEn:'He completely transformed my garden. Very creative and hardworking. The result exceeded my expectations.' },
]

const categories = [
  { id: 'mechanic',    icon:'🔧', labelEs:'Mecánico',            labelEn:'Mechanic' },
  { id: 'electrician', icon:'⚡', labelEs:'Electricista',        labelEn:'Electrician' },
  { id: 'plumber',     icon:'🔩', labelEs:'Plomero',             labelEn:'Plumber' },
  { id: 'locksmith',   icon:'🔑', labelEs:'Cerrajero',           labelEn:'Locksmith' },
  { id: 'painter',     icon:'🎨', labelEs:'Pintor',              labelEn:'Painter' },
  { id: 'gardener',    icon:'🌿', labelEs:'Jardinero',          labelEn:'Gardening' },
  { id: 'nanny',       icon:'👶', labelEs:'Niñera',              labelEn:'Nanny' },
  { id: 'cleaner',     icon:'🧹', labelEs:'Limpieza',            labelEn:'Cleaning' },
  { id: 'all',         icon:'❄️', labelEs:'Refrigeración',       labelEn:'Refrigeration' },
  { id: 'all',         icon:'🛵', labelEs:'Mensajeros',          labelEn:'Messengers' },
  { id: 'all',         icon:'🔧', labelEs:'Instalación',         labelEn:'Installation' },
  { id: 'all',         icon:'👕', labelEs:'Lavandería',          labelEn:'Laundry' },
  { id: 'all',         icon:'🛠️', labelEs:'Mantenimiento',       labelEn:'Maintenance' },
  { id: 'all',         icon:'🔩', labelEs:'Montaje',             labelEn:'Assembly' },
  { id: 'all',         icon:'📦', labelEs:'Mudanzas',            labelEn:'Moving' },
  { id: 'all',         icon:'🎯', labelEs:'Personalizado',       labelEn:'Custom' },
  { id: 'all',         icon:'🐛', labelEs:'Plagas',              labelEn:'Pest control' },
  { id: 'all',         icon:'🏗️', labelEs:'Reformas',           labelEn:'Renovations' },
  { id: 'all',         icon:'🔨', labelEs:'Reparación',          labelEn:'Repair' },
]

const featuredStatic = [
  { id: '1', nameEs: 'Juan Pérez', nameEn: 'Juan Pérez', specEs: 'Plomero', specEn: 'Plumber', rating: 5.0, reviews: 124, price: 'A convenir', img: plomero, badge: 'Popular', avail: true },
  { id: '2', nameEs: 'María González', nameEn: 'María González', specEs: 'Electricista', specEn: 'Electrician', rating: 4.8, reviews: 89, price: 'A convenir', img: electrica1, badge: 'Top', avail: true },
  { id: '3', nameEs: 'Carlos Herrera', nameEn: 'Carlos Herrera', specEs: 'Jardinero', specEn: 'Gardener', rating: 4.9, reviews: 45, price: 'A convenir', img: jardinero, badge: '24/7', avail: true },
  { id: '4', nameEs: 'Roberto Núñez', nameEn: 'Roberto Núñez', specEs: 'Cerrajero', specEn: 'Locksmith', rating: 5.0, reviews: 210, price: 'A convenir', img: cerrajero1, badge: 'Urgente', avail: true },
  { id: '5', nameEs: 'Luisa Martínez', nameEn: 'Luisa Martínez', specEs: 'Mecánico', specEn: 'Mechanic', rating: 4.7, reviews: 156, price: 'A convenir', img: mecanico1, badge: null, avail: true },
  { id: '6', nameEs: 'Carmen Díaz', nameEn: 'Carmen Díaz', specEs: 'Pintor', specEn: 'Painter', rating: 4.6, reviews: 78, price: 'A convenir', img: pintor1, badge: null, avail: true }
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
    const fetchTopReviews = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('rated', '==', true)
        )
        const snapshot = await getDocs(q)
        const docs = []
        snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }))
        
        // Exigir una calificación de 4 o 5 y que tengan texto. (Solo mostraríamos moderados idealmente)
        const topReviews = docs.filter(d => (d.ratingScore >= 4 || d.moderated) && d.ratingComment?.trim().length > 0)
        
        // Ordenamos los más recientes primero
        topReviews.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
        
        const formatted = topReviews.slice(0, 10).map(d => ({
          nameEs: d.reviewerName || d.clientName || 'Cliente',
          photo: '', // Avatar vacío para que use la letra inicial
          rating: d.ratingScore || 5,
          dateEs: d.dateToken || 'Reciente',
          dateEn: d.dateToken || 'Recent',
          specEs: d.proSpecialty || d.specialty || 'Servicio',
          specEn: d.proSpecialty || d.specialty || 'Service',
          textEs: d.ratingComment,
          textEn: d.ratingComment
        }))

        if (formatted.length > 0) {
          setAllTestimonials([...formatted, ...testimonials])
        }
      } catch (e) {
        console.error("Error fetching top reviews", e)
      }
    }
    fetchTopReviews()
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

const socialBtnStyle = (bg) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '44px', height: '44px', borderRadius: '14px',
  background: bg, color: '#fff', textDecoration: 'none',
  boxShadow: `0 4px 12px ${bg}40`, transition: 'transform 0.2s',
  flexShrink: 0
})

const SocialLinks = () => (
  <div style={{ padding: '0 16px', marginBottom: '24px' }}>
    <p style={{ fontSize: '13px', fontWeight: '700', color: '#666', marginBottom: '12px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      Síguenos en nuestras redes
    </p>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
      <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" style={socialBtnStyle('#1877F2')}>
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.66-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.794.715-1.794 1.763v2.309h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.326V1.326C24 .593 23.407 0 22.675 0z"/></svg>
      </a>
      <a href="https://www.instagram.com/listopatronofficial?igsh=OGQ5ZDc2ODk2ZA==" target="_blank" rel="noreferrer" style={socialBtnStyle('#E4405F')}>
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </a>
      <a href="https://www.tiktok.com/@listopatron?_r=1&_t=ZS-94ntViURmdQ" target="_blank" rel="noreferrer" style={socialBtnStyle('#000')}>
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.15 4.54-3.08 5.75-2.06 1.28-4.8 1.47-7 .42-2.14-1.02-3.66-3.2-3.83-5.55-.17-2.39.91-4.86 2.88-6.19 1.8-1.21 4.24-1.47 6.27-.67v4.29c-.83-.4-1.84-.46-2.7-.22-.84.24-1.57.91-1.87 1.74-.32.88-.2 1.94.31 2.7.53.79 1.49 1.25 2.45 1.23.97-.02 1.9-.54 2.43-1.34.46-.69.66-1.54.67-2.37V.02h-1.6z"/></svg>
      </a>
      <a href="https://www.youtube.com/@listopatron" target="_blank" rel="noreferrer" style={socialBtnStyle('#FF0000')}>
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
      </a>
    </div>
  </div>
)

export default function HomePage({ lang, navigate, userRole }) {
  const { userData, profileComplete } = useUserData()
  const [proFilter, setProFilter] = useState('todos')
  const [showTour, closeTour]     = useTour()
  const [showHamburguesa, setShowHamburguesa] = useState(false)

  const [featuredRef, featuredVisible] = useScrollReveal()
  const [allProsRef,  allProsVisible]  = useScrollReveal(0.05)
  const [catListRef,  catListVisible]  = useScrollReveal(0.05)

  const [allProsReal, setAllProsReal] = useState([])
  const [featuredReal, setFeaturedReal] = useState([])

  const isPro = userRole === 'pro'

  useEffect(() => {
    const fetchPros = async () => {
      try {
        const q = query(collection(db, 'users'), where('type', '==', 'pro'))
        const querySnapshot = await getDocs(q)
        const prosList = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          prosList.push({
            id: doc.id,
            nameEs: data.name || 'Sin nombre',
            nameEn: data.name || 'No name',
            specEs: categories.find(c => c.id === data.category)?.labelEs || 'Servicio General',
            specEn: categories.find(c => c.id === data.category)?.labelEn || 'General service',
            category: data.category || 'unknown',
            rating: data.rating || 5.0,
            reviews: data.reviewCount || data.reviews || 0,
            location: data.location || 'RD',
            experience: data.experience || '1 año',
            avatar: (data.name || 'P').substring(0, 2).toUpperCase(),
            avail: data.available !== false, // Default a true
            img: data.photoURL || null
          })
        })
        
        // Ordenar destacados por estrellas y cantidad de reseñas
        const sortedFeatured = [...prosList].sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.reviews - a.reviews;
        });

        setAllProsReal(prosList)
        setFeaturedReal(sortedFeatured.slice(0, 6)) // Top 6 mejores calificados
      } catch (err) {
        console.error("Error fetching pros in Home: ", err)
      }
    }
    fetchPros()
  }, [])

  const allProsToUse = allProsReal.length > 0 ? allProsReal : featuredStatic
  const featuredProsToUse = featuredReal.length > 0 ? featuredReal : featuredStatic

  const specs = ['todos', ...new Set(allProsToUse.filter(p=>p.specEs).map(p => p.specEs))]
  const filteredPros = proFilter === 'todos' ? allProsToUse : allProsToUse.filter(p => p.specEs === proFilter)

  return (
    <div className="home-page">

      {/* ── SEARCH BAR / HEADER ── */}
      <div className="hp-search-bar" style={{ background: isPro ? '#1A1A2E' : '#FFF' }}>
        <style>{`
          @keyframes floatTip { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
          @keyframes pulseBtn { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(242,96,0,0); } 50% { transform: scale(1.1); box-shadow: 0 0 15px rgba(242,96,0,0.6); borderRadius: 50%; background: rgba(242,96,0,0.1); } }
        `}</style>
        <button className="hp-notif" onClick={() => setShowHamburguesa(true)} style={{ 
          position: 'relative', 
          color: isPro ? '#FFF' : '#333',
          animation: userData && ((isPro && userData.planStatus !== 'active') || (!isPro)) ? 'pulseBtn 2s infinite' : 'none'
        }}>
          
          {/* TOOLTIP COMPRAR PLAN / POSTULARSE (PARA PROS Y USUARIOS) */}
          {userData && (
            <div style={{
              position: 'absolute', top: '130%', left: '0', background: '#F26000', color: '#FFF',
              padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
              whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(242,96,0,0.4)',
              animation: 'floatTip 2s ease-in-out infinite', zIndex: 100,
              display: (isPro && userData.planStatus === 'active') ? 'none' : 'block' // Ocultar si ya es pro activo
            }}>
              <div style={{
                position: 'absolute', top: '-4px', left: '12px', width: '10px', height: '10px',
                background: '#F26000', transform: 'rotate(45deg)'
              }} />
              {isPro 
                ? (userData.approved ? '🎁 Activa tu plan aquí' : '📝 Termina tu postulación') 
                : '💼 Postúlate aquí'
              }
            </div>
          )}

          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        {!isPro ? (
          <button className="hp-search-btn" onClick={() => navigate('search')}>
            <span>🔍</span>
            <span className="hp-search-placeholder">
              {lang === 'es' ? '¿Cómo podemos ayudar?' : 'How can we help?'}
            </span>
          </button>
        ) : (
          <div style={{ flex: 1, color: '#FFF', fontWeight: 'bold', fontSize: '18px', textAlign: 'center', marginRight: '32px' }}>
            {lang === 'es' ? 'Panel Profesional' : 'Pro Dashboard'}
          </div>
        )}
      </div>

      {/* ── VIP BANNER — solo para profesionales ── */}
      {isPro && <VIPBanner onOpenPlanes={() => setShowHamburguesa(true)} />}

      <div style={{ margin: '0 16px 20px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '220px', position: 'relative' }}>
        <img src={bannerPros} alt="Un profesional siempre cerca de ti" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
      </div>

      <Publicidad lang={lang} />
      
      <SocialLinks />

      {isPro ? (
        <div style={{ padding: '20px 24px', background: 'white', margin: '0 16px 20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
           <h2 style={{ fontSize: '20px', margin: '0 0 8px' }}>👋 ¡Hola, Socio!</h2>
           <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Tienes la agenda abierta. Los clientes te pueden encontrar.</p>
        </div>
      ) : (
        <div className="hp-cats-scroll">
          {categories.map((c, i) => (
            <button key={i} className="hp-cat-btn" onClick={() => navigate('search', { catToSelect: c.id || 'all' })}>
              <span className="hp-cat-icon">{c.icon}</span>
              <span className="hp-cat-label">{lang === 'es' ? c.labelEs : c.labelEn}</span>
            </button>
          ))}
        </div>
      )}

      <TestimonialsCarousel lang={lang} />

      <section ref={featuredRef} className={`featured-section${featuredVisible ? ' reveal' : ''}`}>
        <div className="hp-sec-header">
          <h2 className="hp-sec-title">⭐ {lang === 'es' ? 'Profesionales Destacados' : 'Featured Professionals'}</h2>
          <button className="hp-see-all" onClick={() => navigate('search')}>{lang === 'es' ? 'Ver todos' : 'See all'}</button>
        </div>
        <div className="featured-scroll">
          {featuredProsToUse.length > 0 ? (
            featuredProsToUse.map((pro, i) => (
              <div key={i} className="featured-card" style={{ animationDelay: `${i * 0.08}s` }} onClick={() => navigate('booking', { professional: pro })}>
                {pro.badge && <span className={`featured-badge badge-${pro.badge.toLowerCase()}`}>{pro.badge}</span>}
                {pro.img ? (
                   <img src={pro.img} alt={pro.nameEs} className="featured-img" />
                ) : (
                   <div className="featured-img" style={{background:'#FF8533',display:'flex',justifyContent:'center',alignItems:'center',color:'white',fontSize:24,fontWeight:'bold'}}>{pro.avatar}</div>
                )}
                <div className="featured-info">
                  <p className="featured-name">{pro.nameEs}</p>
                  <p className="featured-spec">{lang === 'es' ? pro.specEs : pro.specEn}</p>
                  <StarRating rating={pro.rating} />
                  <p className="featured-reviews">{pro.reviews} {lang === 'es' ? 'reseñas' : 'reviews'}</p>
                  <p className="featured-price" style={{ color: '#008F39', fontSize: '13px', fontWeight: 'bold' }}>
                    🤝 {lang === 'es' ? 'A convenir' : 'To agree'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', color: 'var(--gray)', fontSize: '14px', textAlign: 'center', width: '100%' }}>
              {lang === 'es' ? 'Aún no hay profesionales destacados.' : 'No featured professionals yet.'}
            </div>
          )}
        </div>
      </section>

      {!isPro && (
        <>

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
              {filteredPros.length > 0 ? (
                filteredPros.map((pro, i) => (
                  <div key={i} className="pro-list-card" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => navigate('booking', { professional: pro })}>
                    <div className="pro-list-img-wrap">
                      {pro.img ? (
                         <img src={pro.img} alt={pro.nameEs} className="pro-list-img" />
                      ) : (
                         <div style={{width: 80, height: 80, borderRadius: 12, background: '#FF8533', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 'bold'}}>{pro.avatar}</div>
                      )}
                      <span className={`pro-avail-dot${pro.avail ? ' online' : ''}`} />
                    </div>
                    <div className="pro-list-info">
                      <p className="pro-list-name">{pro.nameEs}</p>
                      <p className="pro-list-spec">{pro.specEs}</p>
                      <StarRating rating={pro.rating} />
                      <p className="pro-list-price" style={{ color: '#008F39', fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>
                        🤝 {lang === 'es' ? 'A convenir' : 'To agree'}
                      </p>
                    </div>
                    <button className="pro-list-book">{lang === 'es' ? 'Reservar' : 'Book'}</button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '40px 20px', color: 'var(--gray)', fontSize: '15px', textAlign: 'center', gridColumn: '1 / -1' }}>
                  {lang === 'es' ? '🔍 No se encontraron profesionales en esta categoría.' : '🔍 No professionals found in this category.'}
                </div>
              )}
            </div>
          </section>

          <section ref={catListRef} className={`cat-list-section${catListVisible ? ' reveal' : ''}`}>
            <div className="hp-sec-header">
              <h2 className="hp-sec-title">🗂️ {lang === 'es' ? 'Explorar servicios' : 'Explore services'}</h2>
            </div>
            <div className="cat-list">
              {categories.map((c, i) => (
                <button key={i} className="cat-list-item" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => navigate('search', { catToSelect: c.id || 'all' })}>
                  <span className="cat-list-icon">{c.icon}</span>
                  <span className="cat-list-label">{lang === 'es' ? c.labelEs : c.labelEn}</span>
                  <span className="cat-list-arrow">›</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      <div style={{ height: 90 }} />

      {showTour && <TutorialTour lang={lang} onFinish={closeTour} />}

      {/* ── MENÚ HAMBURGUESA — profesional o usuario según rol ── */}
      {showHamburguesa && (
        isPro
          ? <BtnHamburguesa        onClose={() => setShowHamburguesa(false)} navigate={navigate} />
          : <BtnHamburguesaUsuario onClose={() => setShowHamburguesa(false)} navigate={navigate} />
      )}

    </div>
  )
}