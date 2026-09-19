import { useState, useEffect, useRef } from 'react'
import { collection, query, where, getDocs, limit, doc, updateDoc, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import './HomePage.css'
import { Capacitor } from '@capacitor/core'
import TutorialTour, { useTour } from '../components/TutorialTour'
import VIPSection from '../components/VIPSection'
import LuckyWheelModal from '../components/LuckyWheelModal'

import BtnHamburguesa from '../components/BtnHamburguesa'
import BtnHamburguesaUsuario from '../components/BtnHamburguesaUsuario'
import { useUserData } from '../useUserData'
import { CATEGORIES, ALL_SUBCATEGORIES } from '../categories'

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
import logoListo  from '../assets/logo_listo.png'

const testimonials = [
  { nameEs:'María González',  photo: electrica1, rating:5, dateEs:'Hace 2 días',    dateEn:'2 days ago',   specEs:'Electricista', specEn:'Electrician', textEs:'Excelente servicio, llegó puntual y resolvió el problema en menos de una hora. Lo recomiendo 100%.', textEn:'Excellent service, arrived on time and fixed the problem in less than an hour. 100% recommended.' },
  { nameEs:'Juan Pérez',      photo: plomero,    rating:5, dateEs:'Hace 5 días',    dateEn:'5 days ago',   specEs:'Plomero',      specEn:'Plumber',      textEs:'Muy profesional y limpio en su trabajo. El precio fue justo y quedé muy satisfecho con el resultado.', textEn:'Very professional and clean work. The price was fair and I was very satisfied with the result.' },
  { nameEs:'Carmen Díaz',     photo: pintor1,    rating:4, dateEs:'Hace 1 semana',  dateEn:'1 week ago',   specEs:'Pintora',      specEn:'Painter',      textEs:'Buen trabajo en general. La pintura quedó perfecta, aunque tardó un poco más de lo previsto.', textEn:'Good work overall. The paint job was perfect, though it took a bit longer than expected.' },
  { nameEs:'Roberto Núñez',   photo: cerrajero1, rating:5, dateEs:'Hace 2 semanas', dateEn:'2 weeks ago',  specEs:'Cerrajero',    specEn:'Locksmith',    textEs:'Me quedé encerrado a las 11pm y llegó en 20 minutos. Un salvavidas, literalmente. Gracias!', textEn:'I was locked out at 11pm and he arrived in 20 minutes. A lifesaver, literally. Thank you!' },
  { nameEs:'Luisa Martínez',  photo: mecanico1,  rating:5, dateEs:'Hace 3 semanas', dateEn:'3 weeks ago',  specEs:'Mecánico',     specEn:'Mechanic',     textEs:'El mejor mecánico que he encontrado. Honesto, rápido y con precios razonables. Ya es mi mecánico fijo.', textEn:'The best mechanic I have found. Honest, fast and with reasonable prices. Already my go-to mechanic.' },
  { nameEs:'Carlos Herrera',  photo: jardinero,  rating:5, dateEs:'Hace 1 mes',     dateEn:'1 month ago',  specEs:'Jardinero',    specEn:'Gardener',     textEs:'Transformó mi jardín completamente. Muy creativo y trabajador. El resultado superó mis expectativas.', textEn:'He completely transformed my garden. Very creative and hardworking. The result exceeded my expectations.' },
]

const topHomeCategories = [
  { id: 'mecanico',    icon:'🔧', image: '/icons/mecanico.webp', labelEs:'Mecánico',      labelEn:'Mechanic' },
  { id: 'electricista', icon:'⚡', image: '/icons/electricista.webp', labelEs:'Electricista',  labelEn:'Electrician' },
  { id: 'plomero',     icon:'🔩', image: '/icons/plomero.webp', labelEs:'Plomero',       labelEn:'Plumber' },
  { id: 'cerrajero',   icon:'🔑', image: '/icons/cerrajero.webp', labelEs:'Cerrajero',     labelEn:'Locksmith' },
  { id: 'pintor',      icon:'🎨', image: '/icons/pintor.webp', labelEs:'Pintor',        labelEn:'Painter' },
  { id: 'jardinero',   icon:'🌿', image: '/icons/jardinero.webp', labelEs:'Jardinero',     labelEn:'Gardener' },
  { id: 'ninera',      icon:'👶', image: '/icons/ninera.webp', labelEs:'Niñera',        labelEn:'Nanny' },
  { id: 'refrigeracion',icon:'❄️', labelEs:'Refrigeración', labelEn:'A/C' },
  { id: 'limpieza_hogar',icon:'🧹', image: '/icons/limpieza.webp', labelEs:'Limpieza',     labelEn:'Cleaning' },
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
  { id:'mecanico',     image: '/icons/mecanico.webp', icon:'🔧', titleEs:'Mecánico',     titleEn:'Mechanic',    services:[
    { img:mecanico1,  nameEs:'Diagnóstico vehicular', nameEn:'Vehicle diagnostic',  price:'A convenir',   tag:'Popular' },
    { img:mecanico,   nameEs:'Cambio de aceite',      nameEn:'Oil change',          price:'A convenir',   tag:null },
  ]},
  { id:'electricista', image: '/icons/electricista.webp', icon:'⚡', titleEs:'Electricista', titleEn:'Electrician', services:[
    { img:electrica1, nameEs:'Instalación eléctrica',  nameEn:'Electrical install', price:'A convenir',   tag:'Popular' },
    { img:electrica,  nameEs:'Reparación de circuito', nameEn:'Circuit repair',     price:'A convenir',   tag:null },
  ]},
  { id:'plomero',      image: '/icons/plomero.webp', icon:'🔩', titleEs:'Plomero',      titleEn:'Plumber',     services:[
    { img:plomero,    nameEs:'Reparación de tubería', nameEn:'Pipe repair',          price:'A convenir',   tag:'Popular' },
    { img:refrig,     nameEs:'Refrigeración y A/C',   nameEn:'A/C & Refrigeration', price:'A convenir', tag:'24/7' },
  ]},
  { id:'cerrajero',    image: '/icons/cerrajero.webp', icon:'🔑', titleEs:'Cerrajero',    titleEn:'Locksmith',   services:[
    { img:cerrajero,  nameEs:'Apertura de puertas',  nameEn:'Door opening',    price:'A convenir',   tag:'Urgente' },
    { img:cerrajero1, nameEs:'Cambio de cerraduras', nameEn:'Lock replacement', price:'A convenir',   tag:null },
  ]},
  { id:'pintor',       image: '/icons/pintor.webp', icon:'🎨', titleEs:'Pintor',       titleEn:'Painter',     services:[
    { img:pintor,     nameEs:'Pintura interior',   nameEn:'Interior painting', price:'A convenir', tag:'Popular' },
    { img:pintor1,    nameEs:'Pintura de fachada', nameEn:'Exterior painting', price:'A convenir', tag:null },
  ]},
  { id:'jardinero',    image: '/icons/jardinero.webp', icon:'🌿', titleEs:'Jardinero',    titleEn:'Gardener',    services:[
    { img:jardinero,  nameEs:'Poda y mantenimiento', nameEn:'Pruning & maintenance', price:'A convenir',   tag:'Popular' },
    { img:ninera,     nameEs:'Diseño de jardín',     nameEn:'Garden design',         price:'A convenir', tag:null },
  ]},
  { id:'ninera',       image: '/icons/ninera.webp', icon:'👶', titleEs:'Niñera',       titleEn:'Nanny',       services:[
    { img:ninera,     nameEs:'Cuidado de niños', nameEn:'Child care',          price:'A convenir', tag:'Popular' },
    { img:ninera1,    nameEs:'Apoyo educativo',  nameEn:'Educational support', price:'A convenir', tag:null },
  ]},
]

function StarRating({ rating }) {
  if (!rating || rating <= 0) return null;
  return (
    <span className="star-rating">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span className="star-num">{Number(rating).toFixed(1)}</span>
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



/* ── BOTÓN COMPLETAR PERFIL ── */
function CompletarPerfilBtn({ profileComplete, onClick }) {
  const isComplete = profileComplete;
  const label = isComplete ? 'PERFIL COMPLETO' : 'COMPLETAR PERFIL';
  const bgColor = isComplete ? '#10B981' : '#3B82F6';
  
  return (
    <button 
      data-tour="completar-perfil"
      onClick={onClick}
      style={{
        background: bgColor,
        color: '#fff',
        border: 'none',
        borderRadius: '22px',
        padding: '9px 24px',
        fontSize: '13px',
        fontWeight: '900',
        letterSpacing: '0.5px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        transition: 'transform 0.1s',
        textTransform: 'uppercase'
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {isComplete ? '✅ ' : '📝 '}{label}
    </button>
  )
}


function TestimonialsCarousel({ lang, navigate }) {
  const [allTestimonials, setAllTestimonials] = useState(testimonials)

  useEffect(() => {
    const fetchTopReviews = async () => {
      try {
        const q = query(collection(db, 'orders'), where('rated', '==', true))
        const snapshot = await getDocs(q)
        const docs = []
        snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }))
        const topReviews = docs.filter(d => (d.ratingScore >= 4 || d.moderated))
        topReviews.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
        const formatted = topReviews.slice(0, 14).map(d => ({
          id: d.proId || d.professionalId || null,
          nameEs: d.reviewerName || d.clientName || 'Cliente',
          clientPhoto: d.reviewerPhoto || d.clientPhoto || null,
          proPhoto: d.proPhoto || d.professionalPhoto || d.proPhotoURL || null,
          proName: d.proName || d.professionalName || 'Profesional',
          rating: d.ratingScore || 5,
          dateEs: d.dateToken || 'Reciente',
          dateEn: d.dateToken || 'Recent',
          specEs: d.proSpecialty || d.specialty || 'Servicio',
          specEn: d.proSpecialty || d.specialty || 'Service',
          textEs: d.ratingComment?.trim() ? d.ratingComment : (d.ratingScore >= 4 ? '¡Excelente servicio! Muy profesional.' : 'Servicio completado.'),
          textEn: d.ratingComment?.trim() ? d.ratingComment : (d.ratingScore >= 4 ? 'Excellent service! Very professional.' : 'Service completed.')
        }))
        if (formatted.length > 0) setAllTestimonials([...formatted, ...testimonials])
      } catch (e) {
        console.error("Error fetching top reviews", e)
      }
    }
    fetchTopReviews()
  }, [])

  const testimonialsToDisplay = allTestimonials.slice(0, 20)
  const [idx, setIdx]  = useState(0)
  const touchStartX    = useRef(null)
  const touchEndX      = useRef(null)
  const timerRef       = useRef(null)
  const [ref, visible] = useScrollReveal(0.1)

  const startAutoPlay = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setIdx(i => (i + 1) % testimonialsToDisplay.length)
    }, 5500)
  }
  useEffect(() => { startAutoPlay(); return () => clearInterval(timerRef.current) }, [testimonialsToDisplay.length])

  const goTo = (i) => { setIdx(i); startAutoPlay() }
  const prev = () => goTo((idx - 1 + testimonialsToDisplay.length) % testimonialsToDisplay.length)
  const next = () => goTo((idx + 1) % testimonialsToDisplay.length)
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; touchEndX.current = null }
  const onTouchMove  = (e) => { touchEndX.current = e.touches[0].clientX }
  const onTouchEnd   = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    touchStartX.current = null; touchEndX.current = null
  }
  const t = testimonialsToDisplay[idx] || testimonialsToDisplay[0]

  if (!t) return null

  return (
    <section ref={ref} className={`testimonials-section${visible ? ' reveal' : ''}`}>
      <div className="hp-sec-header">
        <h2 className="hp-sec-title">💬 {lang === 'es' ? 'Lo que dicen nuestros clientes' : 'What our clients say'}</h2>
      </div>

      <div 
        className="testimonial-card-new" 
        onTouchStart={onTouchStart} 
        onTouchMove={onTouchMove} 
        onTouchEnd={onTouchEnd}
      >
        <div className="testi-new-body" key={idx}>
          <div 
            className="testi-new-pro-row" 
            style={{ cursor: t.id ? 'pointer' : 'default' }}
            onClick={() => { 
              if(t.id && navigate) {
                const proToBook = { id: t.id, name: t.proName, nameEs: t.proName, img: t.proPhoto || t.photo, photoURL: t.proPhoto || t.photo, avatar: t.proName?.charAt(0)?.toUpperCase(), rating: t.rating, category: t.specEs, specEs: t.specEs };
                navigate('booking', { professional: proToBook });
              }
            }}
          >
            {/* Columna Izquierda: Imagen */}
            <div className="testi-new-photo-wrap">
              {(t.proPhoto || t.photo) ? (
                <img src={t.proPhoto || t.photo} alt={t.proName || t.nameEs} className="testi-new-photo" />
              ) : (
                <div className="testi-new-photo-placeholder">
                  {(t.proName?.charAt(0) || t.nameEs?.charAt(0) || '👤').toUpperCase()}
                </div>
              )}
              
              <div className="testi-new-overlap-group">
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#F26000', marginRight: '2px' }}>★</span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#1a1a2e' }}>Listo</span>
              </div>
            </div>

            {/* Columna Derecha: Detalles del Socio */}
            <div className="testi-new-meta">
              <span className="testi-new-tag-date">{lang === 'es' ? t.dateEs : t.dateEn}</span>
              <p className="testi-new-name">{t.proName || 'Profesional'}</p>
              <p className="testi-new-spec">{lang === 'es' ? t.specEs : t.specEn}</p>
              
              <div className="testi-new-plan-badge">
                <span className="testi-new-plan-icon">💎</span>
                <span>Listo Socio</span>
              </div>

              <div className="testi-new-stars">
                {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
              </div>
              
              <p className="testi-new-heading">{lang === 'es' ? 'Socio Verificado' : 'Verified Partner'}</p>
              
              <div className="testi-new-border-box">
                {lang === 'es' ? 'Servicio 100% garantizado con soporte de Listo Patrón.' : '100% guaranteed service backed by Listo Patrón.'}
              </div>
            </div>
          </div>

          {/* Bloque Naranja de la Reseña (Abajo) */}
          <div className="testi-new-review-block">
            <div className="testi-new-quote-card">
              <span className="quote-card-badge-top">💬 Reseña</span>
              <p className="testi-new-quote-text">
                "{lang === 'es' ? t.textEs : t.textEn}"
              </p>
            </div>

            <div className="testi-new-author-row">
              {t.clientPhoto ? (
                <img src={t.clientPhoto} alt={t.nameEs} className="testi-new-author-photo" />
              ) : (
                <div className="testi-new-author-photo-placeholder">
                  {t.nameEs?.charAt(0).toUpperCase() || 'C'}
                </div>
              )}
              <span className="testi-new-author-text">
                {lang === 'es' ? 'Cliente:' : 'Client:'} <strong className="testi-new-author-highlight">{t.nameEs}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Fila de Navegación y Dots */}
        <div className="testi-new-nav-row">
          <button className="testi-new-arrow-btn" onClick={prev}>‹</button>
          <div className="testi-new-dots">
            {testimonialsToDisplay.map((_, i) => (
              <button 
                key={i} 
                className={`testi-new-dot ${i === idx ? 'active' : ''}`} 
                onClick={() => goTo(i)} 
              />
            ))}
          </div>
          <button className="testi-new-arrow-btn" onClick={next}>›</button>
        </div>

        <p className="testi-new-counter">{idx + 1} / {testimonialsToDisplay.length}</p>
      </div>
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
  const isNative = Capacitor.isNativePlatform()
  const [proFilter, setProFilter] = useState('todos')
  const [showTour, closeTour]     = useTour()
  const [showHamburguesa, setShowHamburguesa] = useState(false)
  const [homeSearch, setHomeSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // ── ESTADOS TEMU / AMAZON FEATURES ──
  const [showLuckyWheel, setShowLuckyWheel] = useState(false)
  const [claimedCoupon, setClaimedCoupon]   = useState(null)

  const handleClaimReward = async (prize, newProgress, earnedContract) => {
    if (!userData?.uid) return;
    try {
      const userRef = doc(db, 'users', userData.uid);
      const currentContracts = userData.contracts || 0;
      const currentSpins = userData.spinsAvailable || 0;
      const updatePayload = {
        wheelProgress: newProgress,
        spinsAvailable: Math.max(0, currentSpins - 1)
      };
      if (earnedContract) {
        updatePayload.contracts = currentContracts + 1;
        
        // Crear notificación oficial en Firestore
        await addDoc(collection(db, 'notificaciones'), {
          userId: userData.uid,
          type: 'reward',
          title: '👑 ¡1 CONTRATO GRATIS OTORGADO!',
          text: '¡Felicidades! Se ha acreditado 1 contrato gratis a tu saldo por completar tu progreso en la Ruleta Listo Patrón.',
          read: false,
          icon: '🎰',
          createdAt: serverTimestamp()
        });

        alert(lang === 'es' 
          ? "🎉 ¡FELICIDADES! Se ha otorgado y acreditado +1 CONTRATO GRATIS automáticamente a tu cuenta de Listo Patrón." 
          : "🎉 CONGRATULATIONS! +1 FREE CONTRACT has been automatically granted to your Listo Patrón account.");
      }
      await updateDoc(userRef, updatePayload);
    } catch (err) {
      console.error("Error updating wheel reward:", err);
    }
  };

  // Flash Sale Live Timer (HH:MM:SS)
  const [flashTime, setFlashTime] = useState({ h: 4, m: 28, s: 45 })
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashTime(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 }
        if (prev.m > 0) return { ...prev, m: 59, s: 59 }
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 }
        return { h: 5, m: 59, s: 59 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Live Hiring Activity Toast Notifications
  const liveActivities = [
    { text: '💬 Carmen S. en Santiago contrató a Plomero Máster hace 2m', pro: 'Plomero Máster' },
    { text: '⚡ José M. en La Vega contrató Mantenimiento A/C hace 4m', pro: 'Mantenimiento A/C' },
    { text: '🔑 Rosa P. en Sto. Domingo contrató Cerrajero 24h hace 1m', pro: 'Cerrajero 24h' },
    { text: '🔧 Carlos R. en Santiago contrató Mecánica Móvil hace 5m', pro: 'Mecánica Móvil' },
    { text: '🎨 María L. en Santiago contrató Pintura de Fachada hace 3m', pro: 'Pintura' }
  ]
  const [liveToastIdx, setLiveToastIdx] = useState(0)
  const [showLiveToast, setShowLiveToast] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setShowLiveToast(false)
      setTimeout(() => {
        setLiveToastIdx(curr => (curr + 1) % liveActivities.length)
        setShowLiveToast(true)
      }, 400)
    }, 8000)
    return () => clearInterval(t)
  }, [liveActivities.length])

  const [featuredRef, featuredVisible] = useScrollReveal()
  const [allProsRef,  allProsVisible]  = useScrollReveal(0.05)
  const [catListRef,  catListVisible]  = useScrollReveal(0.05)

  const [unreadNotifs, setUnreadNotifs] = useState(0)

  useEffect(() => {
    if (!userData?.uid) return
    const targetIds = userData.email === 'listopatron.app@gmail.com' ? [userData.uid, 'admin'] : [userData.uid]
    const q = query(collection(db, 'notificaciones'), where('userId', 'in', targetIds), where('read', '==', false))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const promoNotifs = snapshot.docs.filter(docSnap => {
        const t = docSnap.data().type;
        return t === 'promo' || t === 'offer';
      });
      setUnreadNotifs(promoNotifs.length)
    }, () => {})
    return () => unsubscribe()
  }, [userData])

  const [unreadChats, setUnreadChats] = useState(0)
  const [unreadMsgNotifs, setUnreadMsgNotifs] = useState(0)

  useEffect(() => {
    if (!userData?.uid) return
    const uid = userData.uid

    const qChats = query(collection(db, 'chats'), where('members', 'array-contains', uid))
    const unsubChats = onSnapshot(qChats, snap => {
      let count = 0
      snap.forEach(d => { count += (d.data().unreadCount?.[uid] || 0) })
      setUnreadChats(count)
    }, () => {})

    const targetIds = userData?.email === 'listopatron.app@gmail.com' ? [uid, 'admin'] : [uid]
    const qNotifs = query(collection(db, 'notificaciones'), where('userId', 'in', targetIds), where('read', '==', false))
    const unsubNotifs = onSnapshot(qNotifs, snap => {
      let tempMsgs = 0
      snap.forEach(d => {
        if (d.data().type === 'message') tempMsgs++
      })
      setUnreadMsgNotifs(tempMsgs)
    }, () => {})

    return () => { unsubChats(); unsubNotifs() }
  }, [userData])

  const totalUnreadMessages = unreadChats + unreadMsgNotifs

  const searchPlaceholders = lang === 'es' 
    ? ['¿Buscas a un plomero?', '¿Necesitas un electricista?', 'O quizás un mecánico...', 'Encuentra soluciones aquí'] 
    : ['Looking for a plumber?', 'Need an electrician?', 'Maybe a mechanic...', 'Find solutions here'];
  const [phIdx, setPhIdx] = useState(0);
  const [prevPhIdx, setPrevPhIdx] = useState(null);

  const [showBlueBanner, setShowBlueBanner] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setPhIdx(curr => {
        setPrevPhIdx(curr);
        return (curr + 1) % searchPlaceholders.length;
      });
    }, 3500);
    return () => { clearInterval(t); };
  }, [lang, searchPlaceholders.length]);

  const [allProsReal, setAllProsReal] = useState([])
  const [featuredReal, setFeaturedReal] = useState([])

  const [activeView, setActiveView] = useState(localStorage.getItem('listo_active_view') || null)

  useEffect(() => {
    if (userRole && !localStorage.getItem('listo_active_view')) {
      setActiveView(userRole)
    }
  }, [userRole])

  const isPro = (activeView || userRole) === 'pro'

  const [showLowContractWarning, setShowLowContractWarning] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setShowLowContractWarning(false), 3 * 60 * 1000) // 3 minutes
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchPros = async () => {
      try {
        const q = query(collection(db, 'users'), where('type', '==', 'pro'))
        const querySnapshot = await getDocs(q)
        const prosList = []
        const getMappedProCatId = (catString) => {
          if (!catString) return 'all';
          const cleanStr = catString.toLowerCase();
          const foundSub = ALL_SUBCATEGORIES.find(s => s.id === cleanStr || s.labelEn.toLowerCase() === cleanStr);
          if (foundSub) return foundSub;
          const foundMain = CATEGORIES.find(c => c.id === cleanStr || c.labelEn.toLowerCase() === cleanStr);
          return foundMain || null;
        }
        querySnapshot.forEach((doc) => {
          const data = doc.data()

          // ─ Filtro estricto: Solo mostrar si completó el perfil y tiene plan activo o contratos
          const isComplete = Boolean(data.profileComplete || data.verificacion?.estado === 'aprobada')
          const hasPlan = Boolean(data.planStatus === 'active')
          const hasContracts = Boolean(data.contracts && data.contracts > 0)
          if (!isComplete || (!hasPlan && !hasContracts)) return;

          const catObj = getMappedProCatId(data.category)
          const candidates = [
            data.sector,
            data.municipio || data.ciudad || data.city,
            data.provincia,
            data.direccion,
            data.location,
            data.verificacion?.sector,
            data.verificacion?.municipio,
            data.verificacion?.provincia,
            data.verificacion?.direccion
          ].filter(Boolean);
          const cleanLoc = candidates.filter(str => {
            const s = String(str).trim().toLowerCase();
            return s !== 'rd' && s !== 'rep. dominicana' && s !== 'república dominicana' && s !== 'rep dominicana';
          });
          const finalLoc = cleanLoc.length > 0 ? cleanLoc.slice(0, 2).join(', ') : 'Santo Domingo, D.N.';

          prosList.push({
            id: doc.id,
            nameEs: data.name || 'Sin nombre',
            nameEn: data.name || 'No name',
            specEs: catObj ? catObj.labelEs : 'Servicios Integrales',
            specEn: catObj ? catObj.labelEn : 'General services',
            category: data.category || 'unknown',
            rating: data.rating || 0.0,
            reviews: data.reviewCount || data.reviews || 0,
            location: finalLoc,
            sector: data.sector || data.verificacion?.sector || '',
            municipio: data.municipio || data.ciudad || data.city || data.verificacion?.municipio || '',
            provincia: data.provincia || data.verificacion?.provincia || '',
            direccion: data.direccion || data.verificacion?.direccion || '',
            verificacion: data.verificacion || null,
            experience: (data.experience && !['nuevo', 'verificado'].includes(String(data.experience).trim().toLowerCase())) ? data.experience : '',
            avatar: (data.name || 'P').substring(0, 2).toUpperCase(),
            avail: data.profileComplete && data.available !== false,
            img: data.photoURL || null,
            currentPlan: data.currentPlan || data.planName || data.plan || data.planId || data.planType || data.tipoPlan || data.subscription?.planName || data.subscription?.plan || data.membership || data.verificacion?.plan || null,
            planName: data.planName || data.currentPlan || data.subscription?.planName || data.verificacion?.plan || data.plan || null,
            contracts: data.contracts || 0
          })
        })
        const elitePros = prosList.filter(p => p.rating >= 5.0).sort((a, b) => b.reviews - a.reviews);
        const goodPros  = prosList.filter(p => p.rating >= 4.0 && p.rating < 5.0).sort((a, b) => b.reviews - a.reviews);
        const limitedGoodPros = goodPros.slice(0, 3);
        const finalFeatured = [...elitePros, ...limitedGoodPros].sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.reviews - a.reviews;
        });

        // E-Commerce gamification: Automagically assign Temu/Amazon style badges to top professionals
        const topFeatured = finalFeatured.slice(0, 12);
        topFeatured.forEach((p, idx) => {
          if (!p.badge) {
            if (idx === 0) p.badge = "🔥 TOP 1";
            else if (idx === 1 || idx === 2) p.badge = "⚡ MÁS VENDIDO";
            else if (idx % 3 === 0) p.badge = "🎟️ EN PROMOCIÓN";
            else if (idx % 4 === 0) p.badge = "⏳ MUY BUSCADO";
            else p.badge = "⭐ POPULAR";
          }
        });

        setAllProsReal(prosList)
        setFeaturedReal(topFeatured)
      } catch (err) {
        console.error("Error fetching pros in Home: ", err)
      }
    }
    fetchPros()
  }, [])

  const allProsToUse = allProsReal.filter(p => !userData?.blockedUsers?.includes(p.id))
  const featuredProsToUse = featuredReal.filter(p => !userData?.blockedUsers?.includes(p.id))
  const specs = ['todos', ...new Set(allProsToUse.filter(p=>p.specEs).map(p => p.specEs))]
  const filteredPros = proFilter === 'todos' ? allProsToUse : allProsToUse.filter(p => p.specEs === proFilter)

  // Cálculos para la expiración del plan
  let isExpired = userData?.planStatus === 'expired';
  let showWarning = false;
  let daysRemaining = null;
  
  if (isPro && userData?.planExpirationDate) {
    const expDate = new Date(userData.planExpirationDate);
    const now = new Date();
    const diffTime = expDate - now;
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) {
      isExpired = true;
      daysRemaining = 0;
    } else if (daysRemaining === 1 && userData?.planStatus === 'active') {
      // Avisar al profesional exactamente el día antes (ej. día 29 de 30)
      showWarning = true;
    }
  }

  // Cálculos para disponibilidad y el toggle
  const isAvailable = profileComplete && !isExpired && (userData?.available !== false);
  const isLowContracts = (userData?.contracts || 0) === 1;

  const toggleAvailability = async () => {
    if (!profileComplete) {
      alert(lang === 'es' ? "Debes completar tu perfil para poder activarte y recibir pedidos." : "You must complete your profile to become active and receive orders.");
      return;
    }
    if (isExpired) {
      alert(lang === 'es' 
        ? "Tu cuenta está inactiva. Por favor actualízala en nuestra web para poder ponerte en línea." 
        : "Your account is inactive. Please update it on our website to go online.");
      return;
    }
    const currentAvail = userData?.available !== false;
    if (!currentAvail && (userData?.contracts || 0) <= 0) {
      if (isNative) {
        alert(lang === 'es' 
          ? "No tienes contratos disponibles. Para cambiar o adquirir un plan, ingresa a nuestra plataforma web." 
          : "No contracts available. To change or purchase a plan, please visit our website.");
      } else {
        alert(lang === 'es' 
          ? "No tienes contratos disponibles. Postúlate a un plan para recibir clientes." 
          : "No contracts available. Select a plan to receive clients.");
      }
      return;
    }
    if (!userData?.uid) return;
    try {
      await updateDoc(doc(db, 'users', userData.uid), { available: !currentAvail });
    } catch(e) {
      console.error('Error toggling availability', e);
    }
  };

  return (
    <div className="home-page">

      {/* ── NEW HERO HEADER (GLASSMORPHISM) ── */}
      <div className="hp-header-glass">
        
        {/* Saludo y Títulos */}
        {!isPro ? (
          <div className="hp-greeting" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Pill Ubicación Estilo Amazon Mobile */}
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(10px)',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                width: 'fit-content'
              }}
              onClick={() => alert(lang === 'es' ? 'Ubicación actual: Santiago, D.N. (República Dominicana)' : 'Current location: Santiago, D.N. (Dominican Republic)')}
            >
              <span>📍</span>
              <span>Santiago, D.N.</span>
              <span style={{ fontSize: '10px', opacity: 0.8 }}>▼</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1>👋 {lang === 'es' ? `Hola, ${userData?.name?.split(' ')[0] || 'Cliente'}` : `Hi, ${userData?.name?.split(' ')[0] || 'Client'}`}</h1>
                <p>{lang === 'es' ? '¿Qué necesitas solucionar hoy?' : 'What do you need to fix today?'}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  onClick={() => navigate('notificaciones')}
                  style={{ position:'relative', width:'40px', height:'40px', borderRadius:'50%', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'1px solid rgba(255,255,255,0.2)' }}
                >
                  <span style={{ fontSize:'20px' }}>🔔</span>
                  {unreadNotifs > 0 && (
                    <span style={{ position:'absolute', top:'-2px', right:'-2px', background:'#EF4444', color:'white', fontSize:'11px', fontWeight:'900', borderRadius:'10px', padding:'2px 6px', border:'2px solid #1A1A2E' }}>
                      {unreadNotifs > 9 ? '9+' : unreadNotifs}
                    </span>
                  )}
                </div>
                {/* Botón de hamburguesa ☰ para clientes */}
                <div 
                  onClick={() => setShowHamburguesa(true)}
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    background: '#F26000', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer', 
                    marginLeft: '8px',
                    boxShadow: '0 4px 12px rgba(242,96,0,0.3)',
                    transition: 'transform 0.1s'
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '22px', color: 'white', fontWeight: 'bold' }}>☰</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hp-greeting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>👋 {lang === 'es' ? 'Panel Profesional' : 'Pro Dashboard'}</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#ccc' }}>{lang === 'es' ? `Hola, ${userData?.name?.split(' ')[0] || 'Socio'}` : `Hi, ${userData?.name?.split(' ')[0] || 'Partner'}`}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <div 
                onClick={() => navigate('notificaciones')}
                style={{ position:'relative', width:'40px', height:'40px', borderRadius:'50%', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'1px solid rgba(255,255,255,0.2)' }}
              >
                <span style={{ fontSize:'20px' }}>🔔</span>
                {unreadNotifs > 0 && (
                  <span style={{ position:'absolute', top:'-2px', right:'-2px', background:'#EF4444', color:'white', fontSize:'11px', fontWeight:'900', borderRadius:'10px', padding:'2px 6px', border:'2px solid #1A1A2E' }}>
                    {unreadNotifs > 9 ? '9+' : unreadNotifs}
                  </span>
                )}
              </div>

              <CompletarPerfilBtn 
                profileComplete={profileComplete}
                onClick={() => {
                  navigate('profile', { screen: 'verification' })
                }}
              />

              <button 
                onClick={() => setShowHamburguesa(true)}
                style={{
                  background: '#F26000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginLeft: '8px',
                  boxShadow: '0 4px 10px rgba(242,96,0,0.3)',
                  transition: 'transform 0.1s'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                ☰
              </button>
            </div>
          </div>
        )}

        {/* Buscador Gigante Autocompletable Con Cámara Estilo Amazon */}
        {!isPro && (
          <div className="hp-hero-search-container" style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div className="hp-hero-search-btn" style={{ padding: '0 6px 0 16px', display: 'flex', alignItems: 'center', cursor: 'text' }} onClick={() => document.getElementById('hp-search-input').focus()}>
              <span className="hp-hero-icon">🔍</span>
              {homeSearch.length === 0 && (
                <div className="hp-placeholder-container">
                  {prevPhIdx !== null && prevPhIdx !== phIdx && (
                    <span className="hp-placeholder-text slide-out" key={`out-${prevPhIdx}`}>
                      {searchPlaceholders[prevPhIdx]}
                    </span>
                  )}
                  <span className="hp-placeholder-text slide-in" key={`in-${phIdx}`}>
                    {searchPlaceholders[phIdx]}
                  </span>
                </div>
              )}
              <input 
                id="hp-search-input"
                type="text" 
                value={homeSearch} 
                onChange={(e) => {
                  setHomeSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                style={{ flex: 1, border: 'none', background: 'transparent', height: '100%', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#1a1a2e', padding: '16px 0', zIndex: 2 }}
              />
              
              {/* Botón de Cámara Escáner Estilo Amazon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert(lang === 'es' ? '📷 Escáner de foto / QR activado' : '📷 Photo / QR Scanner activated');
                }}
                title="Búsqueda por Foto / QR"
                style={{
                  background: 'rgba(0,0,0,0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginRight: '6px',
                  zIndex: 3
                }}
              >
                <span style={{ fontSize: '16px' }}>📷</span>
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (homeSearch.trim()) {
                     navigate('search', { state: { searchQuery: homeSearch } });
                  } else {
                     navigate('search');
                  }
                }}
                className="hp-hero-action" style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', zIndex: 3 }}>
                <span style={{ fontSize: '12px', background: 'linear-gradient(135deg, #FF7A1A, #F26000)', color: 'white', padding: '10px 18px', borderRadius: '20px', fontWeight: '900', boxShadow: '0 2px 6px rgba(242,96,0,0.4)', display: 'inline-block' }}>
                  {lang === 'es' ? 'Buscar' : 'Search'}
                </span>
              </button>
            </div>
            
            {/* Dropdown de Resultados (Autocompletado) */}
            {showDropdown && homeSearch.trim().length > 0 && (
              <div className="fade-up" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '10px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 100, border: '1px solid rgba(0,0,0,0.06)', maxHeight: '350px', overflowY: 'auto' }}>
                {allProsToUse.filter(p => p.nameEs?.toLowerCase().includes(homeSearch.toLowerCase()) || p.specEs?.toLowerCase().includes(homeSearch.toLowerCase())).length > 0 ? (
                  allProsToUse.filter(p => p.nameEs?.toLowerCase().includes(homeSearch.toLowerCase()) || p.specEs?.toLowerCase().includes(homeSearch.toLowerCase())).slice(0, 5).map(pro => (
                    <div key={pro.id} onClick={() => navigate('proProfile', pro)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(242,96,0,0.06)'; e.currentTarget.style.paddingLeft = '20px'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '16px'; }}>
                      {pro.img ? (
                        <img src={pro.img} alt={pro.nameEs} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FF8533', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>{pro.avatar}</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1a1a2e' }}>{pro.nameEs}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '600' }}>
                          {pro.specEs}
                          {pro.rating && pro.reviews && pro.reviews > 0 ? (
                            <span style={{color: '#FFD700', marginLeft: '4px'}}>⭐ {Number(pro.rating).toFixed(1)}</span>
                          ) : null}
                        </p>
                      </div>
                      <span style={{ fontSize: '18px', color: '#ccc', fontWeight: 'bold' }}>›</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '32px' }}>🕵️‍♂️</span>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px', fontWeight: '600' }}>
                      {lang === 'es' ? 'No encontramos a nadie con esa búsqueda.' : 'No one found with that search.'}
                    </p>
                  </div>
                )}
                <div onClick={() => navigate('search')} style={{ padding: '12px', textAlign: 'center', background: '#f8f9fa', color: '#F26000', fontSize: '13px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f5'} onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}>
                  {lang === 'es' ? 'Ver todos los profesionales' : 'See all professionals'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MARQUEE TICKER BANNER INFORMATIVO PARA PROFESIONALES Y CLIENTES ── */}
      {!isPro && (
        <div className="amz-marquee-container">
          <div className="amz-marquee-content">
            🏆 Cada vez que un profesional complete un contrato perfecto gana un chance para la tómbola donde podrás tener la oportunidad de ganar un contrato gratis &nbsp;&nbsp;•&nbsp;&nbsp; ⚡ Profesionales verificados listos en menos de 30 minutos &nbsp;&nbsp;•&nbsp;&nbsp; 🛡️ Todos los servicios 100% garantizados con soporte Listo Patrón &nbsp;&nbsp;•&nbsp;&nbsp; 🎁 ¡Completa tus trabajos y acumula recompensas!
          </div>
        </div>
      )}

      {/* ── BARRA DE NAVEGACIÓN AMAZON PILLS CON FOTO DE PERFIL DELANTE (SOBRESALE DEL CUADRO) ── */}
      {!isPro && (
        <div className="amz-top-nav-bar" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 16px', overflow: 'visible' }}>
          {/* Avatar del usuario que SOBRESALE un poco del cuadro azul/oscuro */}
          <div 
            onClick={() => navigate('profile')}
            style={{ position: 'relative', cursor: 'pointer', flexShrink: 0, zIndex: 20, margin: '-6px 2px -6px 0' }}
          >
            <img 
              src={userData?.profilePhoto || userData?.photoURL || logoListo} 
              alt="Perfil" 
              style={{ 
                width: '58px', 
                height: '58px', 
                borderRadius: '50%', 
                objectFit: 'cover', 
                border: '3px solid white', 
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                background: '#FFF'
              }} 
            />

            {/* Ícono de chat flotante en la esquina de la foto de perfil */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                navigate('chat');
              }}
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF7A1A, #F26000)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                cursor: 'pointer',
                border: '2px solid white',
                zIndex: 21
              }}
            >
              <span style={{ fontSize: '13px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                💬
              </span>
              {totalUnreadMessages > 0 && (
                <span 
                  style={{ 
                    position: 'absolute', 
                    top: '-6px', 
                    right: '-6px', 
                    background: '#EF4444', 
                    color: 'white', 
                    fontSize: '9px', 
                    fontWeight: '900', 
                    borderRadius: '8px', 
                    padding: '1px 5px', 
                    border: '1.5px solid white'
                  }}
                >
                  {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                </span>
              )}
            </div>
          </div>

          <button className="amz-nav-pill active" onClick={() => navigate('search')}>
            ⚡ Ofertas Relámpago
          </button>
          <button className="amz-nav-pill" onClick={() => navigate('search', { catToSelect: 'mecanico' })}>
            🔧 Mecánicos
          </button>
          <button className="amz-nav-pill" onClick={() => navigate('search', { catToSelect: 'electricista' })}>
            ⚡ Electricistas
          </button>
          <button className="amz-nav-pill" onClick={() => navigate('search', { catToSelect: 'plomero' })}>
            🔩 Plomeros
          </button>
          <button className="amz-nav-pill" onClick={() => navigate('search', { catToSelect: 'cerrajero' })}>
            🔑 Cerrajeros
          </button>
          <button className="amz-nav-pill" onClick={() => navigate('search', { catToSelect: 'pintor' })}>
            🎨 Pintores
          </button>
          <button className="amz-nav-pill" onClick={() => navigate('search', { catToSelect: 'jardinero' })}>
            🌿 Jardineros
          </button>
          <button className="amz-nav-pill" onClick={() => navigate('search', { catToSelect: 'ninera' })}>
            👶 Niñeras
          </button>
        </div>
      )}

      {/* ── PRIMER ESPACIO PRINCIPAL: CARRUSEL DE TARJETAS VERTICALES DE DOBLE ALTO ── */}
      <VIPSection realVipPros={featuredProsToUse} lang={lang} navigate={navigate} />

      {/* ── CARD SECCIÓN "TUS PEDIDOS" ESTILO AMAZON ── */}
      {!isPro && (
        <div 
          onClick={() => navigate('orders')}
          style={{
            margin: '0 16px 18px',
            background: 'linear-gradient(135deg, #1A1A2E, #282846)',
            borderRadius: '16px',
            padding: '14px 16px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(242,96,0,0.2)', border: '1px solid #F26000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              📦
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#FFFFFF' }}>
                {lang === 'es' ? 'Tus Pedidos & Servicios' : 'Your Orders & Services'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#B3D7FF', fontWeight: '600' }}>
                {lang === 'es' ? 'Revisa el estado de tus contrataciones en vivo' : 'Check status of your live hires'}
              </p>
            </div>
          </div>
          <span style={{ fontSize: '14px', background: '#F26000', color: 'white', padding: '6px 12px', borderRadius: '10px', fontWeight: '800' }}>
            Ver ›
          </span>
        </div>
      )}

      {/* ── GRILLA BENTO 2x2 ESTILO AMAZON "OFERTAS RELÁMPAGO & RECOMENDACIONES" ── */}
      {!isPro && (
        <section style={{ margin: '0 16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1A2E', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚡ {lang === 'es' ? 'Ofertas Relámpago y Destacados' : 'Lightning Deals & Featured'}
              </h2>
              {/* Digital Countdown Timer */}
              <div className="flash-sale-timer">
                <span style={{ fontSize: '11px' }}>⏱️</span>
                <span className="timer-digit">{String(flashTime.h).padStart(2, '0')}</span>:
                <span className="timer-digit">{String(flashTime.m).padStart(2, '0')}</span>:
                <span className="timer-digit">{String(flashTime.s).padStart(2, '0')}</span>
              </div>
            </div>
            <span style={{ background: '#F26000', color: 'white', fontSize: '10px', fontWeight: '900', padding: '4px 9px', borderRadius: '12px', letterSpacing: '0.5px' }}>
              ⭐ MÁS VALORADOS
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {/* Card 1: Ofertas Relámpago */}
            <div 
              onClick={() => navigate('search', { catToSelect: 'plomero' })}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ background: '#FEF2F2', color: '#DC2626', fontSize: '10px', fontWeight: '900', padding: '3px 8px', borderRadius: '10px', border: '1px solid #FECACA' }}>
                  🔥 POPULAR
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#1A1A2E', margin: '8px 0 4px' }}>
                  Plomería Express
                </h3>
                <p style={{ fontSize: '11px', color: '#64748B', margin: 0, fontWeight: '600' }}>
                  Reparaciones 24/7 urgentes
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#F26000' }}>🤝 A convenir</span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>›</span>
              </div>
            </div>

            {/* Card 2: A/C & Refrigeración */}
            <div 
              onClick={() => navigate('search', { catToSelect: 'refrigeracion' })}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ background: '#EFF6FF', color: '#2563EB', fontSize: '10px', fontWeight: '900', padding: '3px 8px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                  ❄️ GARANTIZADO
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#1A1A2E', margin: '8px 0 4px' }}>
                  Mantenimiento A/C
                </h3>
                <p style={{ fontSize: '11px', color: '#64748B', margin: 0, fontWeight: '600' }}>
                  Limpieza y carga de gas
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#F26000' }}>Garantizado</span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>›</span>
              </div>
            </div>

            {/* Card 3: Mecánica a Domicilio */}
            <div 
              onClick={() => navigate('search', { catToSelect: 'mecanico' })}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '10px', fontWeight: '900', padding: '3px 8px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                  🔧 POPULAR
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#1A1A2E', margin: '8px 0 4px' }}>
                  Mecánica Móvil
                </h3>
                <p style={{ fontSize: '11px', color: '#64748B', margin: 0, fontWeight: '600' }}>
                  Diagnóstico en tu ubicación
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#F26000' }}>Respuesta &lt; 30m</span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>›</span>
              </div>
            </div>

            {/* Card 4: Cerrajeros de Emergencia */}
            <div 
              onClick={() => navigate('search', { catToSelect: 'cerrajero' })}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ background: '#F0FDF4', color: '#16A34A', fontSize: '10px', fontWeight: '900', padding: '3px 8px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                  🔑 URGENTE
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#1A1A2E', margin: '8px 0 4px' }}>
                  Cerrajería 24 horas
                </h3>
                <p style={{ fontSize: '11px', color: '#64748B', margin: 0, fontWeight: '600' }}>
                  Apertura de autos y casas
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#F26000' }}>Verificados</span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>›</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {isPro ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '0 16px 20px' }}>
          <div style={{ padding: '20px 24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
               <h2 style={{ fontSize: '20px', margin: 0 }}>👋 ¡Hola, Socio!</h2>
               <div 
                 onClick={toggleAvailability}
                 style={{ 
                   width: '48px', height: '26px', borderRadius: '13px', 
                   background: isAvailable ? (isLowContracts && showLowContractWarning ? '#EF4444' : '#22C55E') : '#E5E7EB', 
                   position: 'relative', cursor: 'pointer', transition: 'background 0.3s',
                   opacity: profileComplete ? 1 : 0.6
                 }}
               >
                 <div style={{
                   width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                   position: 'absolute', top: '3px', left: isAvailable ? '25px' : '3px',
                   transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                 }} />
               </div>
             </div>
             
             {!profileComplete ? (
               <div 
                 onClick={() => navigate('profile', { screen: 'verification' })} 
                 style={{ padding: '12px', background: '#FEF2F2', borderRadius: '10px', border: '1px solid #FECACA', marginTop: '8px', cursor: 'pointer' }}
               >
                 <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#991B1B', fontWeight: 'bold' }}>
                   ⚠️ Tu perfil está incompleto (presiona aquí para verificar).
                 </p>
                 <p style={{ margin: 0, fontSize: '12px', color: '#B91C1C' }}>
                   No puedes recibir pedidos. Cuando termines de completar tu perfil y verificación, actívate.
                 </p>
               </div>
             ) : (
               <p style={{ color: isExpired ? '#B91C1C' : (isAvailable ? (isLowContracts && showLowContractWarning ? '#B91C1C' : '#15803D') : '#6B7280'), fontSize: '14px', margin: 0, fontWeight: '500' }}>
                 {isExpired
                   ? '🔴 Perfil inactivo. Actualízalo en nuestra web.'
                   : (isAvailable 
                       ? (isLowContracts && showLowContractWarning
                           ? (isNative 
                               ? '🔴 Solo te queda un contrato. Para adquirir o mejorar tu plan, ingresa a nuestra plataforma web.'
                               : '🔴 Solo te queda un contrato, postulate a un plan para recibir clientes.')
                           : '🟢 Estás en línea. Los clientes te pueden encontrar.') 
                       : '⚫ Estás desconectado. Ningún cliente te verá.')}
               </p>
             )}
          </div>
          
          {isExpired && (
            <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #F87171', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
                <span style={{ fontWeight: 'bold', color: '#991B1B', fontSize: '15px' }}>Perfil Inactivo</span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#7F1D1D', lineHeight: '1.4' }}>Tu período de prueba ha finalizado. Para mantener tu visibilidad ante los clientes y reactivar tu perfil, actualízalo en nuestra web.</p>
              <button 
                onClick={() => {
                  const email = encodeURIComponent(userData?.email || '');
                  const phone = encodeURIComponent(userData?.phone || '');
                  const name = encodeURIComponent(userData?.name || '');
                  const category = encodeURIComponent(userData?.category || '');
                  window.open(`https://www.listopatron.com.do/?action=buy_plan&email=${email}&phone=${phone}&name=${name}&category=${category}`, '_system');
                }}
                style={{ background: '#DC2626', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}
              >
                Actualizar en la Web
              </button>
            </div>
          )}

          {showWarning && !isExpired && (
            <div style={{ padding: '16px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>⏳</span>
                <span style={{ fontWeight: 'bold', color: '#92400E', fontSize: '15px' }}>Tu prueba expira en {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}</span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#B45309', lineHeight: '1.4' }}>Asegura tu visibilidad en la plataforma. ¿Ya sabes qué plan elegir?</p>
              <button 
                onClick={() => {
                  const email = encodeURIComponent(userData?.email || '');
                  const phone = encodeURIComponent(userData?.phone || '');
                  const name = encodeURIComponent(userData?.name || '');
                  const category = encodeURIComponent(userData?.category || '');
                  window.open(`https://www.listopatron.com.do/?action=buy_plan&email=${email}&phone=${phone}&name=${name}&category=${category}`, '_system');
                }}
                style={{ background: '#D97706', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}
              >
                Ver planes disponibles
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="hp-cats-scroll">
          {topHomeCategories.map((c, i) => (
            <div key={i} className="hp-cat-btn" onClick={() => navigate('search', { catToSelect: c.id || 'all' })}>
              {i === 0 && <span className="cat-flash-badge">🔥 HOT</span>}
              {i === 2 && <span className="cat-flash-badge" style={{background:'#10B981', boxShadow: '0 4px 8px rgba(16, 185, 129, 0.4)'}}>NUEVO</span>}
              <div className="cat-icon-wrap">
                {c.image ? (
                  <img src={c.image} alt={c.labelEs} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                ) : (
                  <span className="hp-cat-icon">{c.icon}</span>
                )}
              </div>
              <span className="hp-cat-label">{lang === 'es' ? c.labelEs : c.labelEn}</span>
            </div>
          ))}
        </div>
      )}


      {/* ── ESTRUCTURA VARIADA 1 ESTILO AMAZON: BENTO GRID CONTENEDOR 2x2 ── */}
      {!isPro && (
        <section className="amz-bento-section">
          <div className="amz-bento-header">
            <h2 className="amz-bento-title">
              🛍️ {lang === 'es' ? 'Abarrotes y servicios con entrega hoy' : 'Same day services'}
            </h2>
            <button className="hp-see-all" onClick={() => navigate('search')}>
              {lang === 'es' ? 'Ver todo' : 'See all'} ›
            </button>
          </div>
          <div className="amz-bento-grid">
            <div className="amz-bento-item" onClick={() => navigate('search', { catToSelect: 'mecanico' })}>
              <div className="amz-bento-img-wrap">
                <span className="amz-bento-item-tag">🔥 MÁS VENDIDO</span>
                <img src={mecanico1} alt="Mecánico" className="amz-bento-img" />
              </div>
              <p className="amz-bento-item-title">{lang === 'es' ? 'Diagnóstico Vehicular' : 'Auto Diagnostic'}</p>
              <p className="amz-bento-item-sub">🤝 {lang === 'es' ? 'A convenir' : 'To agree'}</p>
            </div>

            <div className="amz-bento-item" onClick={() => navigate('search', { catToSelect: 'electricista' })}>
              <div className="amz-bento-img-wrap">
                <span className="amz-bento-item-tag">⚡ 24/7 URGENTE</span>
                <img src={electrica1} alt="Electricista" className="amz-bento-img" />
              </div>
              <p className="amz-bento-item-title">{lang === 'es' ? 'Instalación Eléctrica' : 'Electrical Install'}</p>
              <p className="amz-bento-item-sub">🤝 {lang === 'es' ? 'A convenir' : 'To agree'}</p>
            </div>

            <div className="amz-bento-item" onClick={() => navigate('search', { catToSelect: 'plomero' })}>
              <div className="amz-bento-img-wrap">
                <span className="amz-bento-item-tag">🛡️ GARANTIZADO</span>
                <img src={plomero} alt="Plomero" className="amz-bento-img" />
              </div>
              <p className="amz-bento-item-title">{lang === 'es' ? 'Reparación de Tubería' : 'Pipe Repair'}</p>
              <p className="amz-bento-item-sub">🤝 {lang === 'es' ? 'A convenir' : 'To agree'}</p>
            </div>

            <div className="amz-bento-item" onClick={() => navigate('search', { catToSelect: 'cerrajero' })}>
              <div className="amz-bento-img-wrap">
                <span className="amz-bento-item-tag">🔑 POPULAR</span>
                <img src={cerrajero1} alt="Cerrajero" className="amz-bento-img" />
              </div>
              <p className="amz-bento-item-title">{lang === 'es' ? 'Apertura de Puertas' : 'Door Opening'}</p>
              <p className="amz-bento-item-sub">🤝 {lang === 'es' ? 'A convenir' : 'To agree'}</p>
            </div>
          </div>
        </section>
      )}




      <TestimonialsCarousel lang={lang} navigate={navigate} />

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
                  {pro.reviews && pro.reviews > 0 ? (
                    <p className="featured-reviews">{pro.reviews} {lang === 'es' ? 'reseñas' : 'reviews'}</p>
                  ) : null}
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
          {sections.map((sec, idx) => {
            // Colores temáticos extraidos de los Planes VIP/Platinum/Gold/Basico para dar forma
            const amzThemes = [
              { bg: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)', color: '#1E3A8A', card: '#FFF' }, // VIP Blue
              { bg: 'linear-gradient(145deg, #FFFBEB 0%, #FEF3C7 100%)', color: '#92400E', card: '#FFF' }, // Gold Orange
              { bg: 'linear-gradient(145deg, #F8FAFC 0%, #F1F5F9 100%)', color: '#334155', card: '#FFF' }, // Básico Silver
              { bg: 'linear-gradient(145deg, #FDF4FF 0%, #FCE7F3 100%)', color: '#831843', card: '#FFF' }, // Pink
              { bg: 'linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%)', color: '#166534', card: '#FFF' }, // Green
              { bg: 'linear-gradient(145deg, #FEF2F2 0%, #FEE2E2 100%)', color: '#991B1B', card: '#FFF' }, // Red
              { bg: 'linear-gradient(145deg, #FAF5FF 0%, #F3E8FF 100%)', color: '#4C1D95', card: '#FFF' }, // Purple
            ];
            const theme = amzThemes[idx % amzThemes.length];

            return (
              <section key={sec.id} className="hp-service-section reveal" style={{ background: theme.bg }}>
                <div className="hp-sec-header amz-sec-header">
                  <h2 className="hp-sec-title amz-sec-title" style={{ color: theme.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {sec.image ? <img src={sec.image} alt={sec.titleEs} style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> : sec.icon} 
                    {lang === 'es' ? sec.titleEs : sec.titleEn}
                  </h2>
                  <button className="hp-see-all amz-see-all" style={{ color: theme.color }} onClick={() => navigate('search')}>
                    {lang === 'es' ? 'Ver todo' : 'See all'} ›
                  </button>
                </div>
                <div className="hp-service-cards amz-cards-scroll">
                  {sec.services.map((s, i) => (
                    <div key={i} className="hp-svc-card amz-bento-card" style={{ background: theme.card }} onClick={() => navigate('booking', { specialty: sec.id })}>
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
            );
          })}


          <section ref={catListRef} className={`cat-list-section${catListVisible ? ' reveal' : ''}`}>
            <div className="hp-sec-header">
              <h2 className="hp-sec-title">🗂️ {lang === 'es' ? 'Explorar servicios' : 'Explore services'}</h2>
            </div>
            <div className="cat-list">
              {CATEGORIES.map((c, i) => (
                <button key={i} className="cat-list-item" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => navigate('search', { catToSelect: c.id || 'all' })}>
                  <span className="cat-list-icon">
                    {c.image ? <img src={c.image} alt={c.labelEs} style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> : c.icon}
                  </span>
                  <span className="cat-list-label">{lang === 'es' ? c.labelEs : c.labelEn}</span>
                  <span className="cat-list-arrow">›</span>
                </button>
              ))}
            </div>
          </section>
          <section className="all-professions-section reveal">
            <div className="hp-sec-header" style={{ marginBottom: '16px', padding: '0 16px' }}>
              <h2 className="hp-sec-title">🛠️ {lang === 'es' ? 'Todas las Profesiones' : 'All Professions'}</h2>
            </div>
            <div className="all-professions-grid">
              {ALL_SUBCATEGORIES.map((sub, i) => (
                <div 
                  key={i} 
                  className="profession-item" 
                  onClick={() => navigate('search', { catToSelect: sub.parentId, subCatToSelect: sub.id })}
                >
                  <span className="profession-icon">
                    {sub.image ? <img src={sub.image} alt={sub.labelEs} style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> : sub.icon || '👷'}
                  </span>
                  <span className="profession-name">{lang === 'es' ? sub.labelEs : sub.labelEn}</span>
                </div>
              ))}
            </div>
          </section>

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
                      {i % 4 === 0 && <span className="cat-flash-badge" style={{top: '-8px', right: '-8px', animation: 'ecom-pop 1s infinite alternate'}}>⚡ {lang === 'es' ? 'RÁPIDO' : 'FAST'}</span>}
                    </div>
                    <div className="pro-list-info">
                      <p className="pro-list-name">{pro.nameEs}</p>
                      <p className="pro-list-spec">{pro.specEs}</p>
                      <StarRating rating={pro.rating} />
                      <p className="pro-list-price" style={{ color: '#008F39', fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>
                        🤝 {lang === 'es' ? 'A convenir' : 'To agree'}
                      </p>
                    </div>
                    <button className="pro-list-book">{lang === 'es' ? 'Contratar' : 'Hire'}</button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '40px 20px', color: 'var(--gray)', fontSize: '15px', textAlign: 'center', gridColumn: '1 / -1' }}>
                  {lang === 'es' ? '🔍 No se encontraron profesionales en esta categoría.' : '🔍 No professionals found in this category.'}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <div style={{ height: 90 }} />

      {showTour && <TutorialTour lang={lang} onFinish={closeTour} />}

      {/* ── MENÚ — solo para profesionales ── */}
      {showHamburguesa && !isPro && (
        <BtnHamburguesaUsuario 
          onClose={() => setShowHamburguesa(false)} 
          navigate={navigate} 
          lang={lang} 
          userRole={userRole}
          activeView={activeView}
          setActiveView={setActiveView}
        />
      )}
      {showHamburguesa && isPro && (
        <BtnHamburguesa 
          onClose={() => setShowHamburguesa(false)} 
          navigate={navigate} 
          lang={lang}
          userRole={userRole}
          activeView={activeView}
          setActiveView={setActiveView}
        />
      )}
      {/* ── ELEMENTOS FLOTANTES ESTILO TEMU / AMAZON ── */}
      {/* Live Hiring Activity Toast */}
      {!isPro && showLiveToast && (
        <div className="live-activity-toast">
          <span style={{ fontSize: '18px' }}>🔔</span>
          <p className="live-activity-toast-text">
            {liveActivities[liveToastIdx].text}
          </p>
        </div>
      )}

      {/* Floating Lucky Wheel FAB — Solo se muestra cuando el profesional gana un giro por obtener 4 o 5 estrellas */}
      {(userData?.spinsAvailable > 0 || (userData?.completedContracts % 10 === 0 && userData?.completedContracts > 0)) && (
        <button 
          className="lucky-wheel-fab" 
          onClick={() => setShowLuckyWheel(true)}
        >
          <span style={{ fontSize: '18px' }}>🎁</span>
          <span>Ruleta ({userData?.spinsAvailable || 1} giro{userData?.spinsAvailable > 1 ? 's' : ''})</span>
        </button>
      )}

      {/* Modal de la Ruleta de la Suerte Listo Patrón */}
      <LuckyWheelModal 
        isOpen={showLuckyWheel} 
        onClose={() => setShowLuckyWheel(false)} 
        lang={lang} 
        wheelProgress={userData?.wheelProgress || 0}
        completedContracts={userData?.completedContracts || userData?.contracts || 0}
        onClaimReward={handleClaimReward} 
      />

    </div>
  )
}