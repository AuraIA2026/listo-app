import { useState, useEffect, useRef } from 'react'
import { collection, query, where, getDocs, limit, doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import './HomePage.css'
import TutorialTour, { useTour } from '../components/TutorialTour'
import VIPBanner from '../components/VIPBanner'
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
    { img:mecanico1,  nameEs:'Diagnóstico vehicular', nameEn:'Vehicle diagnostic',  price:'RD$800',   tag:'Popular' },
    { img:mecanico,   nameEs:'Cambio de aceite',      nameEn:'Oil change',          price:'RD$650',   tag:null },
  ]},
  { id:'electricista', image: '/icons/electricista.webp', icon:'⚡', titleEs:'Electricista', titleEn:'Electrician', services:[
    { img:electrica1, nameEs:'Instalación eléctrica',  nameEn:'Electrical install', price:'RD$950',   tag:'Popular' },
    { img:electrica,  nameEs:'Reparación de circuito', nameEn:'Circuit repair',     price:'RD$750',   tag:null },
  ]},
  { id:'plomero',      image: '/icons/plomero.webp', icon:'🔩', titleEs:'Plomero',      titleEn:'Plumber',     services:[
    { img:plomero,    nameEs:'Reparación de tubería', nameEn:'Pipe repair',          price:'RD$700',   tag:'Popular' },
    { img:refrig,     nameEs:'Refrigeración y A/C',   nameEn:'A/C & Refrigeration', price:'RD$1,200', tag:'24/7' },
  ]},
  { id:'cerrajero',    image: '/icons/cerrajero.webp', icon:'🔑', titleEs:'Cerrajero',    titleEn:'Locksmith',   services:[
    { img:cerrajero,  nameEs:'Apertura de puertas',  nameEn:'Door opening',    price:'RD$500',   tag:'Urgente' },
    { img:cerrajero1, nameEs:'Cambio de cerraduras', nameEn:'Lock replacement', price:'RD$650',   tag:null },
  ]},
  { id:'pintor',       image: '/icons/pintor.webp', icon:'🎨', titleEs:'Pintor',       titleEn:'Painter',     services:[
    { img:pintor,     nameEs:'Pintura interior',   nameEn:'Interior painting', price:'RD$2,500', tag:'Popular' },
    { img:pintor1,    nameEs:'Pintura de fachada', nameEn:'Exterior painting', price:'RD$3,500', tag:null },
  ]},
  { id:'jardinero',    image: '/icons/jardinero.webp', icon:'🌿', titleEs:'Jardinero',    titleEn:'Gardener',    services:[
    { img:jardinero,  nameEs:'Poda y mantenimiento', nameEn:'Pruning & maintenance', price:'RD$600',   tag:'Popular' },
    { img:ninera,     nameEs:'Diseño de jardín',     nameEn:'Garden design',         price:'RD$1,800', tag:null },
  ]},
  { id:'ninera',       image: '/icons/ninera.webp', icon:'👶', titleEs:'Niñera',       titleEn:'Nanny',       services:[
    { img:ninera,     nameEs:'Cuidado de niños', nameEn:'Child care',          price:'RD$400/hr', tag:'Popular' },
    { img:ninera1,    nameEs:'Apoyo educativo',  nameEn:'Educational support', price:'RD$500/hr', tag:null },
  ]},
]

function StarRating({ rating }) {
  return (
    <span className="star-rating">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span className="star-num">{Number(rating || 5).toFixed(1)}</span>
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

/* ── BOTÓN POSTULARME — solo para profesionales ── */
function PostularmeBtn({ isPro, userData, onClick }) {
  const [pressed, setPressed] = useState(false)

  const label = isPro
    ? (userData?.planStatus === 'active' ? '👑 Mis Planes' : '🚀 Postularme')
    : '💼 Postularme'

  return (
    <>
      <style>{`
        @keyframes pm-glow {
          0%,100% { box-shadow: 0 4px 0 #a33800, 0 0 12px rgba(242,96,0,0.4); }
          50%      { box-shadow: 0 4px 0 #a33800, 0 0 28px rgba(255,180,0,0.8); }
        }
        @keyframes pm-star1 {
          0%,100% { transform: translate(0,0) scale(1);   opacity: 0.9; }
          50%      { transform: translate(-3px,-4px) scale(1.3); opacity: 1; }
        }
        @keyframes pm-star2 {
          0%,100% { transform: translate(0,0) scale(1);   opacity: 0.7; }
          50%      { transform: translate(3px,-3px) scale(1.2); opacity: 1; }
        }
        @keyframes pm-star3 {
          0%,100% { transform: translate(0,0) scale(0.8); opacity: 0.6; }
          50%      { transform: translate(4px,2px) scale(1.1); opacity: 1; }
        }
        @keyframes pm-shimmer {
          0%   { left: -60%; }
          100% { left: 130%; }
        }
        .pm-btn-wrap { position: relative; flex-shrink: 0; }
        .pm-spark {
          position: absolute;
          font-size: 11px;
          pointer-events: none;
          line-height: 1;
        }
        .pm-spark-1 { top: -6px; left: -4px;  animation: pm-star1 1.4s ease-in-out infinite; }
        .pm-spark-2 { top: -4px; right: -5px; animation: pm-star2 1.8s ease-in-out infinite; }
        .pm-spark-3 { bottom: -4px; right: 2px; animation: pm-star3 2.1s ease-in-out infinite; }
        .pm-btn {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #FF7A1A, #F26000, #C94E00);
          color: #fff;
          border: none;
          border-radius: 22px;
          padding: 9px 16px;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.3px;
          cursor: pointer;
          white-space: nowrap;
          animation: pm-glow 2s ease-in-out infinite;
          transition: transform 0.08s, box-shadow 0.08s;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .pm-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 #a33800 !important; }
        .pm-shimmer {
          position: absolute;
          top: 0; left: -60%;
          width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-15deg);
          animation: pm-shimmer 2.4s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>
      <div className="pm-btn-wrap">
        <span className="pm-spark pm-spark-1">✦</span>
        <span className="pm-spark pm-spark-2">★</span>
        <span className="pm-spark pm-spark-3">✦</span>
        <button className="pm-btn" onClick={onClick}>
          <span className="pm-shimmer" />
          {label}
        </button>
      </div>
    </>
  )
}

/* ── BOTÓN COMPLETAR PERFIL ── */
function CompletarPerfilBtn({ profileComplete, onClick }) {
  const isComplete = profileComplete;
  const label = isComplete ? '✅ Perfil completo' : '📝 Completar perfil';
  
  // Si está completo usa colores verdes, si no, usa colores azules
  const color1 = isComplete ? '#10B981' : '#3B82F6';
  const color2 = isComplete ? '#059669' : '#2563EB';
  const color3 = isComplete ? '#047857' : '#1D4ED8';
  const shadowBase = isComplete ? '#064E3B' : '#1E3A8A';
  const glow1 = isComplete ? 'rgba(16,185,129,0.4)' : 'rgba(59,130,246,0.4)';
  const glow2 = isComplete ? 'rgba(5,150,105,0.8)' : 'rgba(37,99,235,0.8)';

  return (
    <>
      <style>{`
        @keyframes cp-glow {
          0%,100% { box-shadow: 0 4px 0 ${shadowBase}, 0 0 12px ${glow1}; }
          50%      { box-shadow: 0 4px 0 ${shadowBase}, 0 0 28px ${glow2}; }
        }
        .cp-btn-wrap { position: relative; flex-shrink: 0; }
        .cp-btn {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, ${color1}, ${color2}, ${color3});
          color: #fff;
          border: none;
          border-radius: 22px;
          padding: 9px 16px;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.3px;
          cursor: pointer;
          white-space: nowrap;
          animation: cp-glow 2s ease-in-out infinite;
          transition: transform 0.08s, box-shadow 0.08s;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .cp-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 ${shadowBase} !important; }
      `}</style>
      <div className="cp-btn-wrap">
        {!isComplete && <span className="pm-spark pm-spark-1">✦</span>}
        {!isComplete && <span className="pm-spark pm-spark-2">★</span>}
        {!isComplete && <span className="pm-spark pm-spark-3">✦</span>}
        <button className="cp-btn" onClick={onClick}>
          {!isComplete && <span className="pm-shimmer" />}
          {label}
        </button>
      </div>
    </>
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
        const formatted = topReviews.slice(0, 10).map(d => ({
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

  const [idx, setIdx]  = useState(0)
  const touchStartX    = useRef(null)
  const touchEndX      = useRef(null)
  const timerRef       = useRef(null)
  const [ref, visible] = useScrollReveal(0.1)

  const startAutoPlay = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % allTestimonials.length), 5000)
  }
  useEffect(() => { startAutoPlay(); return () => clearInterval(timerRef.current) }, [])

  const goTo = (i) => { setIdx(i); startAutoPlay() }
  const prev = () => goTo((idx - 1 + allTestimonials.length) % allTestimonials.length)
  const next = () => goTo((idx + 1) % allTestimonials.length)
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; touchEndX.current = null }
  const onTouchMove  = (e) => { touchEndX.current = e.touches[0].clientX }
  const onTouchEnd   = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    touchStartX.current = null; touchEndX.current = null
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
          <div className="testi-header" style={{ position: 'relative', cursor: t.id ? 'pointer' : 'default' }} onClick={() => { 
            if(t.id && navigate) {
              const proToBook = { id: t.id, name: t.proName, nameEs: t.proName, img: t.proPhoto || t.photo, photoURL: t.proPhoto || t.photo, avatar: t.proName?.charAt(0)?.toUpperCase(), rating: t.rating, category: t.specEs, specEs: t.specEs };
              navigate('booking', { professional: proToBook });
            }
          }}>
            <div className="testi-photo-wrap" style={{ position: 'relative' }}>
              {(t.proPhoto || t.photo)
                ? <img src={t.proPhoto || t.photo} alt={t.proName || t.nameEs} className="testi-photo" style={{ border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                : <div className="testi-photo" style={{background:'linear-gradient(135deg, #FF7A1A, #F26000)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'28px',fontWeight:'800', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>{(t.proName?.charAt(0) || t.nameEs?.charAt(0) || '👤').toUpperCase()}</div>
              }
              <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#10B981', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, border: '2px solid white' }}>✓</div>
            </div>
            <div className="testi-meta" style={{ flex: 1, paddingLeft: 6 }}>
              <p className="testi-name" style={{ fontSize: '15px' }}>{t.proName || 'Profesional'}</p>
              <p className="testi-spec" style={{ fontSize: '12px', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lang === 'es' ? t.specEs : t.specEn}</p>
              <div className="testi-stars" style={{ marginTop: '2px', fontSize: '13px' }}>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
            </div>
            <span className="testi-date" style={{ position: 'absolute', top: 0, right: 0 }}>{lang === 'es' ? t.dateEs : t.dateEn}</span>
          </div>
          
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.95)', borderRadius: 12, marginTop: 12, position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
             <span style={{ position: 'absolute', top: -8, left: 16, fontSize: 28, opacity: 0.15, color: '#f26000' }}>❝</span>
             <p className="testi-text" style={{ fontStyle: 'italic', fontSize: 13, color: '#444', margin: '0 0 10px', lineHeight: 1.5, position: 'relative', zIndex: 2 }}>"{lang === 'es' ? t.textEs : t.textEn}"</p>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 10 }}>
               {t.clientPhoto ? 
                 <img src={t.clientPhoto} alt={t.nameEs} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: '1px solid #ffd700' }} /> :
                 <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1a1a2e', color: '#FFD700', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{t.nameEs?.charAt(0).toUpperCase() || 'C'}</div>
               }
               <span style={{ fontSize: 11, fontWeight: 700, color: '#666' }}>{lang === 'es' ? 'Reseña de:' : 'Review from:'} <strong style={{color: '#1a1a2e'}}>{t.nameEs}</strong></span>
             </div>
          </div>
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
  const [homeSearch, setHomeSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const [featuredRef, featuredVisible] = useScrollReveal()
  const [allProsRef,  allProsVisible]  = useScrollReveal(0.05)
  const [catListRef,  catListVisible]  = useScrollReveal(0.05)

  const [unreadNotifs, setUnreadNotifs] = useState(0)

  useEffect(() => {
    if (!userData?.uid) return
    const targetIds = userData.email === 'listopatron.app@gmail.com' ? [userData.uid, 'admin'] : [userData.uid]
    const q = query(collection(db, 'notificaciones'), where('userId', 'in', targetIds), where('read', '==', false))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadNotifs(snapshot.docs.length)
    }, () => {})
    return () => unsubscribe()
  }, [userData])

  const searchPlaceholders = lang === 'es' 
    ? ['¿Buscas a un plomero?', '¿Necesitas un electricista?', 'O quizás un mecánico...', 'Encuentra soluciones aquí'] 
    : ['Looking for a plumber?', 'Need an electrician?', 'Maybe a mechanic...', 'Find solutions here'];
  const [phIdx, setPhIdx] = useState(0);

  const clientTips = lang === 'es' ? [
    { icon: '⭐', text: 'Al finalizar un trabajo, valora a tu profesional. Tu opinión garantiza la mejor calidad.' },
    { icon: '🛡️', text: 'Comunícate y agenda directamente en la plataforma para mayor seguridad.' },
    { icon: '🤝', text: 'Acuerda el precio siempre antes de que el trabajo inicie, ¡evita sorpresas!' }
  ] : [
    { icon: '⭐', text: 'Rate your pro when the job is done. Your feedback ensures better quality.' },
    { icon: '🛡️', text: 'Keep direct communication via the platform for better security.' },
    { icon: '🤝', text: 'Always agree on the price before the job starts, avoid surprises!' }
  ];
  const [tipIdx, setTipIdx] = useState(0);

  const [showBlackTips, setShowBlackTips] = useState(true);
  const [showBlueBanner, setShowBlueBanner] = useState(true);
  const [blueBannerMsg, setBlueBannerMsg] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setPhIdx(i => (i + 1) % searchPlaceholders.length), 3500);
    const t2 = setInterval(() => setTipIdx(i => (i + 1) % clientTips.length), 4500);
    const tipsTimer = setTimeout(() => setShowBlackTips(false), 60000);
    return () => { clearInterval(t); clearInterval(t2); clearTimeout(tipsTimer); };
  }, [lang]);

  const handleBlueBannerClick = () => {
    setBlueBannerMsg(lang === 'es' 
      ? 'ℹ️ Debes cambiar a perfil de profesional en el menú' 
      : 'ℹ️ You must switch to your professional profile in the menu');
    setTimeout(() => {
      setShowBlueBanner(false);
    }, 4500);
  };

  const [allProsReal, setAllProsReal] = useState([])
  const [featuredReal, setFeaturedReal] = useState([])

  const isPro = userRole === 'pro'

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
          prosList.push({
            id: doc.id,
            nameEs: data.name || 'Sin nombre',
            nameEn: data.name || 'No name',
            specEs: catObj ? catObj.labelEs : 'Servicios Integrales',
            specEn: catObj ? catObj.labelEn : 'General services',
            category: data.category || 'unknown',
            rating: data.rating || 5.0,
            reviews: data.reviewCount || data.reviews || 0,
            location: data.location || 'RD',
            experience: data.experience || '1 año',
            avatar: (data.name || 'P').substring(0, 2).toUpperCase(),
            avail: data.profileComplete && data.available !== false,
            img: data.photoURL || null
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

  const allProsToUse = allProsReal.length > 0 ? allProsReal : featuredStatic
  const featuredProsToUse = featuredReal.length > 0 ? featuredReal : featuredStatic
  const specs = ['todos', ...new Set(allProsToUse.filter(p=>p.specEs).map(p => p.specEs))]
  const filteredPros = proFilter === 'todos' ? allProsToUse : allProsToUse.filter(p => p.specEs === proFilter)

  // Cálculos para disponibilidad y el toggle
  const isAvailable = profileComplete && (userData?.available !== false);
  const isLowContracts = (userData?.contracts || 0) === 1;

  const toggleAvailability = async () => {
    if (!profileComplete) {
      alert(lang === 'es' ? "Debes completar tu perfil para poder activarte y recibir pedidos." : "You must complete your profile to become active and receive orders.");
      return;
    }
    const currentAvail = userData?.available !== false;
    if (!currentAvail && (userData?.contracts || 0) <= 0) {
      alert(lang === 'es' ? "No tienes contratos disponibles. Postúlate a un plan para recibir clientes." : "No contracts available. Select a plan to receive clients.");
      return;
    }
    if (!userData?.uid) return;
    try {
      await updateDoc(doc(db, 'users', userData.uid), { available: !currentAvail });
    } catch(e) {
      console.error('Error toggling availability', e);
    }
  };

  // Cálculos para la expiración del plan
  let showWarning = false;
  let isExpired = false;
  let daysRemaining = null;
  
  if (isPro && userData?.planExpirationDate) {
    const expDate = new Date(userData.planExpirationDate);
    const now = new Date();
    const diffTime = expDate - now;
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) {
      isExpired = true;
      daysRemaining = 0;
    } else if (daysRemaining <= 7) {
      showWarning = true;
    }
  }

  return (
    <div className="home-page">

      {/* ── NEW HERO HEADER (GLASSMORPHISM) ── */}
      <div className="hp-header-glass">
        
        {/* Saludo y Títulos */}
        {!isPro ? (
          <div className="hp-greeting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              {/* Foto de perfil del cliente arriba a la derecha */}
              {userData?.profilePhoto || userData?.photoURL ? (
                <img src={userData.profilePhoto || userData.photoURL} alt="Profile" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor:'pointer' }} onClick={() => navigate('profile')} />
              ) : (
                <div onClick={() => navigate('profile')} style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1A1A2E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer' }}>
                  {(userData?.name || 'C').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hp-greeting" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div 
                onClick={() => navigate('notificaciones')}
                style={{ position:'relative', width:'42px', height:'42px', borderRadius:'50%', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                <span style={{ fontSize:'20px' }}>🔔</span>
                {unreadNotifs > 0 && (
                  <span style={{ position:'absolute', top:'-4px', right:'-4px', background:'#EF4444', color:'white', fontSize:'11px', fontWeight:'900', borderRadius:'10px', padding:'3px 7px', border:'2px solid #1A1A2E' }}>
                    {unreadNotifs > 9 ? '9+' : unreadNotifs}
                  </span>
                )}
              </div>
              <div style={{ textAlign: 'left' }}>
                <h1 style={{ margin: 0, fontSize: '20px' }}>👋 {lang === 'es' ? 'Panel Profesional' : 'Pro Dashboard'}</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#ccc' }}>{lang === 'es' ? `Hola, ${userData?.name?.split(' ')[0] || 'Socio'}` : `Hi, ${userData?.name?.split(' ')[0] || 'Partner'}`}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
              
              <CompletarPerfilBtn 
                profileComplete={profileComplete}
                onClick={() => {
                  navigate('profile', { screen: 'verification' })
                }}
              />

              <PostularmeBtn isPro={isPro} userData={userData} onClick={() => {
                if (!profileComplete) {
                  alert("⚠️ Debes completar tu perfil para postularte en un plan.");
                  return;
                }
                setShowHamburguesa(true);
              }} />
            </div>
          </div>
        )}

        {/* Buscador Gigante Autocompletable */}
        {!isPro && (
          <div className="hp-hero-search-container" style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div className="hp-hero-search-btn" style={{ padding: '0 6px 0 16px', display: 'flex', alignItems: 'center', cursor: 'text' }} onClick={() => document.getElementById('hp-search-input').focus()}>
              <span className="hp-hero-icon">🔍</span>
              {homeSearch.length === 0 && (
                <div className="hp-search-placeholder-wrap" style={{ position: 'absolute', left: '46px', pointerEvents: 'none' }}>
                  <span className="hp-search-placeholder text-slide-anim" key={phIdx}>
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
                        <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '600' }}>{pro.specEs} <span style={{color: '#FFD700', marginLeft: '4px'}}>⭐ {Number(pro.rating).toFixed(1)}</span></p>
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

      {/* ── BOTONES DE ONBOARDING ELIMINADOS POR PETICIÓN ── */}

      {/* ── VIP BANNER — solo para profesionales ── */}
      {isPro && <VIPBanner onOpenPlanes={() => setShowHamburguesa(true)} />}

      <div className="hp-banner-container" style={{ margin: '0 16px 20px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', height: '220px', position: 'relative' }}>
        <img src={bannerPros} alt="Un profesional siempre cerca de ti" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%', display: 'block' }} />
        
        {/* Animated Tip Overlay */}
        {!isPro && showBlackTips && (
          <div className="hp-tip-overlay" style={{ transition: 'opacity 0.8s' }}>
            <div className="hp-tip-card" key={tipIdx}>
              <span className="hp-tip-icon">{clientTips[tipIdx].icon}</span>
              <p className="hp-tip-text">{clientTips[tipIdx].text}</p>
            </div>
          </div>
        )}

        {/* Recruitment Banner (Only for Clients) */}
        {!isPro && showBlueBanner && (
          <div className="hp-recruitment-banner" onClick={handleBlueBannerClick} style={{ transition: 'all 0.5s ease-out' }}>
            <div className="shimmer-effect"></div>
            {blueBannerMsg ? (
              <div className="recruitment-text" style={{ flex: 1, textAlign: 'center', animation: 'tip-fade-slide 0.4s ease' }}>
                <strong style={{ fontSize: '13.5px', color: '#FFF' }}>{blueBannerMsg}</strong>
              </div>
            ) : (
              <>
                <span className="recruitment-icon">🚀</span>
                <div className="recruitment-text">
                  <strong>{lang === 'es' ? '¿Quieres generar ingresos?' : 'Want to generate income?'}</strong>
                  <span>{lang === 'es' ? '¡Postúlate como profesional!' : 'Apply as a professional!'} ›</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <SocialLinks />

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
               <p style={{ color: isAvailable ? (isLowContracts && showLowContractWarning ? '#B91C1C' : '#15803D') : '#6B7280', fontSize: '14px', margin: 0, fontWeight: '500' }}>
                 {isAvailable 
                   ? (isLowContracts && showLowContractWarning
                       ? '🔴 Solo te queda un contrato, postulate para que no pierdas clientes.'
                       : '🟢 Estás en línea. Los clientes te pueden encontrar.') 
                   : '⚫ Estás desconectado. Ningún cliente te verá.'}
               </p>
             )}
          </div>
          
          {isExpired && (
            <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #F87171', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
                <span style={{ fontWeight: 'bold', color: '#991B1B', fontSize: '15px' }}>Tu período de prueba ha expirado</span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#7F1D1D', lineHeight: '1.4' }}>Selecciona un plan para mantener tu perfil activo y visible para los clientes.</p>
              <button 
                onClick={() => setShowHamburguesa(true)}
                style={{ background: '#DC2626', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}
              >
                Elegir mi próximo plan
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
                onClick={() => setShowHamburguesa(true)}
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
        </>
      )}

      <div style={{ height: 90 }} />

      {showTour && <TutorialTour lang={lang} onFinish={closeTour} />}

      {/* ── MENÚ — solo para profesionales ── */}
      {showHamburguesa && isPro && (
        <BtnHamburguesa onClose={() => setShowHamburguesa(false)} navigate={navigate} />
      )}

    </div>
  )
}