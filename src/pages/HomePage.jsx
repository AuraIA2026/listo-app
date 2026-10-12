import { useState, useEffect, useRef } from 'react'
import { collection, query, where, getDocs, limit, doc, updateDoc, onSnapshot, addDoc, serverTimestamp, or } from 'firebase/firestore'
import { db } from '../firebase'
import './HomePage.css'
import { Capacitor } from '@capacitor/core'
import TutorialTour, { useTour } from '../components/TutorialTour'
import VIPSection from '../components/VIPSection'
import LuckyWheelModal from '../components/LuckyWheelModal'
import HistoriasCarrusel from '../components/HistoriasCarrusel'
import HistoriasViewerModal from '../components/HistoriasViewerModal'
import StoryAvatar from '../components/StoryAvatar'
import { useStories } from '../hooks/useStories'
import { getProPlanTheme } from '../planTheme'
import PlanSelectionModal from '../components/PlanSelectionModal'

import SolicitudExpressModal from '../components/SolicitudExpressModal'
import PedidosListoHub from '../components/PedidosListoHub'
import BtnHamburguesa from '../components/BtnHamburguesa'
import BtnHamburguesaUsuario from '../components/BtnHamburguesaUsuario'
import { useUserData } from '../useUserData'
import { CATEGORIES, ALL_SUBCATEGORIES, PROVINCES_LIST } from '../categories'
import { detectGpsLocation } from '../utils/gpsLocation'
import ProPlanAlertWidget from '../components/ProPlanAlertWidget'
import GpsRadarWidget from '../components/GpsRadarWidget'
import RebookCircleWidget from '../components/RebookCircleWidget'
import EmergencySirenCircleWidget from '../components/EmergencySirenCircleWidget'
import StoreCircleWidget from '../components/StoreCircleWidget'
import TombolaCircleWidget from '../components/TombolaCircleWidget'
import VipCircleWidget from '../components/VipCircleWidget'
import LightningOfferBannerModal from '../components/LightningOfferBannerModal'

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
import logoListo  from '../assets/logo-mamey.png'
import pedidosListo2Img from '../assets/pedidos-listo-2.png'

const testimonials = [
  { proName: 'MARIANO FCO. (papa piso)', nameEs:'María Isabel Pimentel', proPhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80', photo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80', rating:5, dateEs:'MAR 28', dateEn:'MAR 28', specEs:'PISOS', specEn:'FLOORING', textEs:'Gracias por su servicio quedó todo muy bien puntual resolver lo recomiendo', textEn:'Thanks for your service everything was great punctual solved I recommend him.' },
  { proName: 'Juan Pablo', nameEs:'Adriana F.', photo: plomero, rating:5, dateEs:'MAR 25', dateEn:'MAR 25', specEs:'PLOMERO', specEn:'PLUMBER', textEs:'Muy profesional y limpio en su trabajo. El precio fue justo y quedé muy satisfecha con el resultado.', textEn:'Very professional and clean work. The price was fair and I was very satisfied with the result.' },
  { proName: 'Ramón Matías', nameEs:'Mayerlin Fco.', photo: electrica1, rating:5, dateEs:'MAR 22', dateEn:'MAR 22', specEs:'ELECTRICISTA', specEn:'ELECTRICIAN', textEs:'Excelente labor muy dedicado en su trabajo, rápido y puntual.', textEn:'Excellent work, very dedicated to his work, fast and punctual.' },
  { proName: 'David (La Leyenda)', nameEs:'Camila Gutiérrez', photo: cerrajero1, rating:5, dateEs:'MAR 18', dateEn:'MAR 18', specEs:'CERRAJERO', specEn:'LOCKSMITH', textEs:'Me quedé fuera de casa y llegó en 20 minutos. Un salvavidas, lo recomiendo.', textEn:'I got locked out and he arrived in 20 minutes. A lifesaver, I recommend him.' },
  { proName: 'Fernando Franco', nameEs:'María Isabel Pimentel', photo: refrig, rating:5, dateEs:'MAR 15', dateEn:'MAR 15', specEs:'REFRIGERACIÓN', specEn:'REFRIGERATION', textEs:'Mi aire quedó nuevo, responsable, honesto y muy limpio en su trabajo.', textEn:'My A/C is like new, responsible, honest and very clean in his work.' },
  { proName: 'Jose Peguero', nameEs:'Adriana F.', photo: mecanico1, rating:5, dateEs:'MAR 10', dateEn:'MAR 10', specEs:'TAPICERO', specEn:'UPHOLSTERY', textEs:'Me encantó cómo quedaron los muebles, puntual, eficiente y profesional.', textEn:'Loved how the furniture turned out, punctual, efficient and professional.' },
]
const topHomeCategories = [
  { id: 'mecanico',    icon:'🔧', image: '/icons/mecanico.webp', labelEs:'Mecánico',      labelEn:'Mechanic' },
  { id: 'electricista', icon:'⚡', image: '/icons/electricista.webp', labelEs:'Electricista',  labelEn:'Electrician' },
  { id: 'plomero',     icon:'🔩', image: '/icons/plomero.webp', labelEs:'Plomero',       labelEn:'Plumber' },
  { id: 'cerrajero',   icon:'🔑', image: '/icons/cerrajero.webp', labelEs:'Cerrajero',     labelEn:'Locksmith' },
  { id: 'pintor',      icon:'🎨', image: '/icons/pintor.webp', labelEs:'Pintor',        labelEn:'Painter' },
  { id: 'sheetrock',   icon:'🏗️', labelEs:'Instalación de Shirrok', labelEn:'Drywall' },
  { id: 'jardinero',   icon:'🌿', image: '/icons/jardinero.webp', labelEs:'Jardinero',     labelEn:'Gardener' },
  { id: 'ninera',      icon:'👶', image: '/icons/ninera.webp', labelEs:'Niñera',        labelEn:'Nanny' },
  { id: 'refrigeracion',icon:'❄️', labelEs:'Refrigeración', labelEn:'A/C' },
  { id: 'limpieza_hogar',icon:'🧹', image: '/icons/limpieza.webp', labelEs:'Limpieza',     labelEn:'Cleaning' },
]

const REAL_PROBLEMS = [
  { id: 'plomero', icon: '🚰', tag: 'URGENTE', labelEs: 'Se me desbordó la tubería', labelEn: 'Overflowing pipe emergency', descEs: 'Plomero 24/7 a tu puerta' },
  { id: 'mecanico', icon: '🚗', tag: 'EN RUTA', labelEs: 'Mi carro no enciende', labelEn: 'Car won\'t start', descEs: 'Mecánico móvil a domicilio' },
  { id: 'electricista', icon: '⚡', tag: 'SIN LUZ', labelEs: 'Se fue la luz en la casa', labelEn: 'Power outage at home', descEs: 'Electricista para emergencias' },
  { id: 'cerrajero', icon: '🔑', tag: 'LLAVES', labelEs: 'Me quedé fuera de la casa', labelEn: 'Locked out of home', descEs: 'Cerrajero abre sin daño' },
  { id: 'refrigeracion', icon: '❄️', tag: 'A/C', labelEs: 'El aire acondicionado gotea', labelEn: 'A/C is leaking', descEs: 'Técnico en refrigeración' },
  { id: 'limpieza_hogar', icon: '🧹', tag: 'HOGAR', labelEs: 'Necesito limpieza profunda', labelEn: 'Need deep cleaning', descEs: 'Personal de limpieza experto' },
  { id: 'pintor', icon: '🎨', tag: 'PARED', labelEs: 'Quiero pintar una pared', labelEn: 'Want to paint a wall', descEs: 'Pintor profesional' },
  { id: 'ninera', icon: '👶', tag: 'CUIDADO', labelEs: 'Necesito niñera de urgencia', labelEn: 'Need urgent nanny', descEs: 'Niñeras verificadas' },
]

const featuredStatic = [
  { id: '1', nameEs: 'Juan Pérez', nameEn: 'Juan Pérez', specEs: 'Plomero', specEn: 'Plumber', rating: 5.0, reviews: 124, price: 'A convenir', img: plomero, badge: 'Popular', avail: true },
  { id: '2', nameEs: 'María González', nameEn: 'María González', specEs: 'Electricista', specEn: 'Electrician', rating: 4.8, reviews: 89, price: 'A convenir', img: electrica1, badge: 'Top', avail: true },
  { id: '3', nameEs: 'Carlos Herrera', nameEn: 'Carlos Herrera', specEs: 'Jardinero', specEn: 'Gardener', rating: 4.9, reviews: 45, price: 'A convenir', img: jardinero, badge: '24/7', avail: true },
  { id: '4', nameEs: 'Roberto Núñez', nameEn: 'Roberto Núñez', specEs: 'Cerrajero', specEn: 'Locksmith', rating: 5.0, reviews: 210, price: 'A convenir', img: cerrajero1, badge: 'Urgente', avail: true },
  { id: '5', nameEs: 'Luisa Martínez', nameEn: 'Luisa Martínez', specEs: 'Mecánico', specEn: 'Mechanic', rating: 4.7, reviews: 156, price: 'A convenir', img: mecanico1, badge: null, avail: true },
  { id: '6', nameEs: 'Carmen Díaz', nameEn: 'Carmen Díaz', specEs: 'Pintor', specEn: 'Painter', rating: 4.6, reviews: 78, price: 'A convenir', img: pintor1, badge: null, avail: true }
]

export const getProPrimaryCategory = (pro) => {
  if (!pro) return null;
  const name = String(pro.name || pro.verificacion?.nombre || '').toLowerCase().trim();
  const cat = String(pro.category || '').toLowerCase().trim();
  const esp = String(pro.especialidad || '').toLowerCase().trim();
  const vesp = String(pro.verificacion?.especialidad || '').toLowerCase().trim();

  // 1. Prioridad por nombre explícito (ej: "Juan Plomero")
  if (name.includes('plomer') || name.includes('plumb')) return 'plomero';
  if (name.includes('electri')) return 'electricista';
  if (name.includes('mecanic') || name.includes('mechanic')) return 'mecanico';
  if (name.includes('cerraj')) return 'cerrajero';
  if (name.includes('pintor')) return 'pintor';
  if (name.includes('jardin')) return 'jardinero';
  if (name.includes('niner') || name.includes('nann')) return 'ninera';
  if (name.includes('refrig') || name.includes('aire')) return 'refrigeracion';

  // 2. Desambiguación Refrigeración vs Mecánico
  if (cat.includes('refrig') || cat.includes('aire') || esp.includes('refrig') || esp.includes('aire') || vesp.includes('aire')) {
    return 'refrigeracion';
  }

  // 3. Mapeo estricto por campos de categoría y especialidad
  const combined = `${cat} ${esp} ${vesp}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  if (combined.includes('plomer') || combined.includes('plumb') || combined.includes('fontan')) return 'plomero';
  if (combined.includes('electri')) return 'electricista';
  if (combined.includes('refrig') || combined.includes('ac ') || combined.includes('aire')) return 'refrigeracion';
  if (combined.includes('mecanic') || combined.includes('mechanic') || combined.includes('automotriz') || combined.includes('taller')) return 'mecanico';
  if (combined.includes('cerraj') || combined.includes('locksmith')) return 'cerrajero';
  if (combined.includes('pintor') || combined.includes('painter') || combined.includes('pintura')) return 'pintor';
  if (combined.includes('jardin') || combined.includes('garden') || combined.includes('poda')) return 'jardinero';
  if (combined.includes('niner') || combined.includes('nann') || combined.includes('babysit') || combined.includes('cuidado de nin')) return 'ninera';

  return null;
};

export const matchesCategorySlug = (pro, slug) => {
  if (!pro || !slug) return false;
  return getProPrimaryCategory(pro) === slug.toLowerCase().trim();
};

const sections = [
  { id:'mecanico',     image: '/icons/mecanico.webp', icon:'🔧', titleEs:'Mecánico',     titleEn:'Mechanic',    services:[
    { img:mecanico1,  nameEs:'Diagnóstico vehicular', nameEn:'Vehicle diagnostic',  price:'A convenir',   tag:'POPULAR', showListoBadge: true },
    { img:mecanico,   nameEs:'Cambio de aceite',      nameEn:'Oil change',          price:'A convenir',   tag:null },
  ]},
  { id:'electricista', image: '/icons/electricista.webp', icon:'⚡', titleEs:'Electricista', titleEn:'Electrician', services:[
    { img:electrica1, nameEs:'Instalación eléctrica',  nameEn:'Electrical install', price:'A convenir',   tag:null },
    { img:electrica,  nameEs:'Reparación de circuito', nameEn:'Circuit repair',     price:'A convenir',   tag:null },
  ]},
  { id:'plomero',      image: '/icons/plomero.webp', icon:'🔩', titleEs:'Plomero',      titleEn:'Plumber',     services:[
    { img:plomero,    nameEs:'Reparación de tubería', nameEn:'Pipe repair',          price:'A convenir',   tag:'POPULAR', showListoBadge: true },
    { img:plomero,    nameEs:'Instalación sanitaria', nameEn:'Plumbing install',     price:'A convenir',   tag:null },
  ]},
  { id:'refrigeracion',image: '/icons/refrigeracion.webp', icon:'❄️', titleEs:'Refrigeración y A/C', titleEn:'A/C & Refrigeration', services:[
    { img:refrig,     nameEs:'Instalación de A/C',    nameEn:'A/C Installation',    price:'A convenir',   tag:'POPULAR', showListoBadge: true },
    { img:refrig,     nameEs:'Mantenimiento de Aire', nameEn:'A/C Maintenance',     price:'A convenir',   tag:'24/7' },
  ]},
  { id:'cerrajero',    image: '/icons/cerrajero.webp', icon:'🔑', titleEs:'Cerrajero',    titleEn:'Locksmith',   services:[
    { img:cerrajero,  nameEs:'Apertura de puertas',  nameEn:'Door opening',    price:'A convenir',   tag:'URGENTE', showListoBadge: true },
    { img:cerrajero1, nameEs:'Cambio de cerraduras', nameEn:'Lock replacement', price:'A convenir',   tag:null },
  ]},
  { id:'pintor',       image: '/icons/pintor.webp', icon:'🎨', titleEs:'Pintor',       titleEn:'Painter',     services:[
    { img:pintor,     nameEs:'Pintura interior',   nameEn:'Interior painting', price:'A convenir', tag:'POPULAR', showListoBadge: true },
    { img:pintor1,    nameEs:'Pintura de fachada', nameEn:'Exterior painting', price:'A convenir', tag:null },
  ]},
  { id:'jardinero',    image: '/icons/jardinero.webp', icon:'🌿', titleEs:'Jardinero',    titleEn:'Gardener',    services:[
    { img:jardinero,  nameEs:'Poda y mantenimiento', nameEn:'Pruning & maintenance', price:'A convenir',   tag:'POPULAR', showListoBadge: true },
  ]},
  { id:'ninera',       image: '/icons/ninera.webp', icon:'👶', titleEs:'Niñera',       titleEn:'Nanny',       services:[
    { img:ninera,     nameEs:'Cuidado de niños', nameEn:'Child care',          price:'A convenir', tag:'POPULAR', showListoBadge: true },
    { img:ninera1,    nameEs:'Apoyo educativo',  nameEn:'Educational support', price:'A convenir', tag:null },
  ]},
];

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
        const formatted = topReviews.slice(0, 20).map(d => {
          let dateTag = 'RECIENTE';
          if (d.dateToken && d.dateToken.trim()) {
            dateTag = d.dateToken.trim().toUpperCase();
          } else if (d.createdAt?.seconds) {
            const dt = new Date(d.createdAt.seconds * 1000);
            const m = dt.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
            dateTag = `${m} ${dt.getDate()}`;
          }

          return {
            id: d.proId || d.professionalId || null,
            nameEs: (d.reviewerName || d.clientName || 'Cliente').trim(),
            clientPhoto: d.reviewerPhoto || d.clientPhoto || null,
            proPhoto: d.proPhoto || d.professionalPhoto || d.proPhotoURL || null,
            proName: (d.proName || d.professionalName || 'Profesional').trim(),
            rating: d.ratingScore || 5,
            dateEs: dateTag,
            dateEn: dateTag,
            specEs: (d.proSpecialty || d.specialty || 'Servicio').toUpperCase(),
            specEn: (d.proSpecialty || d.specialty || 'Service').toUpperCase(),
            textEs: d.ratingComment?.trim() ? d.ratingComment.trim() : (d.ratingScore >= 4 ? '¡Excelente servicio! Muy profesional.' : 'Servicio completado.'),
            textEn: d.ratingComment?.trim() ? d.ratingComment.trim() : (d.ratingScore >= 4 ? 'Excellent service! Very professional.' : 'Service completed.')
          };
        });
        if (formatted.length > 0) {
          const combined = [...formatted];
          testimonials.forEach(t => {
            if (combined.length < 20) combined.push(t);
          });
          setAllTestimonials(combined.slice(0, 20));
        }
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
    <section ref={ref} className={`testimonials-section${visible ? ' reveal' : ''}`} style={{ marginTop: 0, marginBottom: 0, padding: 0 }}>
      <div className="hp-sec-header" style={{ margin: '0 0 2px 0', padding: '0 2px' }}>
        <h2 className="hp-sec-title" style={{ fontSize: '15px', fontWeight: 800, margin: 0, padding: 0, lineHeight: 1.1 }}>💬 {lang === 'es' ? 'Lo que dicen nuestros clientes' : 'What our clients say'}</h2>
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
                {'★'.repeat(Math.max(0, Math.min(5, Math.floor(t.rating || 0))))}{'☆'.repeat(Math.max(0, Math.min(5, 5 - Math.floor(t.rating || 0))))}
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
  const [showSolicitudExpress, setShowSolicitudExpress] = useState(false)

  // ── ESTADOS TEMU / AMAZON FEATURES ──
  const [allProsReal, setAllProsReal] = useState([])
  const [featuredReal, setFeaturedReal] = useState([])
  const [showLuckyWheel, setShowLuckyWheel] = useState(false)
  const [claimedCoupon, setClaimedCoupon]   = useState(null)
  const [lastHiredPro, setLastHiredPro]     = useState(null)
  const [hiredProsList, setHiredProsList]   = useState([])
  const [selectedRebookPro, setSelectedRebookPro] = useState(null)
  const [showFlashOfferModal, setShowFlashOfferModal] = useState(false)
  const [isProblemsExpanded, setIsProblemsExpanded] = useState(false)

  useEffect(() => {
    if (!userData?.uid) return
    const fetchLastOrder = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('clientId', '==', userData.uid),
          limit(20)
        )
        const snap = await getDocs(q)
        let completedPros = []
        if (!snap.empty) {
          const completedDocs = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(d => d.status === 'done' || d.status === 'completed' || d.status === 'finalizado')

          const seen = new Set()
          completedDocs.forEach(item => {
            const key = item.proId || item.proName
            if (key && !seen.has(key)) {
              seen.add(key)
              completedPros.push(item)
            }
          })
        }

        if (completedPros.length === 0) {
          completedPros = [
            {
              id: 'rebook_sample_1',
              proId: 'pro_alexa',
              proName: 'Alexa Martínez',
              proSpecialty: 'Limpieza de Oficina',
              proPhotoURL: 'https://randomuser.me/api/portraits/women/32.jpg'
            },
            {
              id: 'rebook_sample_2',
              proId: 'pro_mariano',
              proName: 'Mariano Fco. (Papa Piso)',
              proSpecialty: 'Pisos & Marmolería',
              proPhotoURL: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            {
              id: 'rebook_sample_3',
              proId: 'pro_david',
              proName: 'David (La Leyenda)',
              proSpecialty: 'Cerrajero Express',
              proPhotoURL: 'https://randomuser.me/api/portraits/men/62.jpg'
            }
          ]
        }

        setHiredProsList(completedPros)
        setLastHiredPro(completedPros[0])
        setSelectedRebookPro(completedPros[0])
      } catch (e) {
        console.log("Notice fetching orders:", e)
      }
    }
    fetchLastOrder()
  }, [userData?.uid])

  useEffect(() => {
    if (localStorage.getItem('open_tombola_trigger') === 'true') {
      if ((userData?.spinsAvailable || 0) > 0) {
        setShowLuckyWheel(true);
      }
      localStorage.removeItem('open_tombola_trigger');
    }
  }, [userData?.spinsAvailable]);

  const handleClaimReward = async (prize, newProgress, earnedContract) => {
    if (!userData?.uid) return;
    try {
      const userRef = doc(db, 'users', userData.uid);
      const currentContracts = userData.contracts || 0;
      const currentSpins = userData.spinsAvailable || 0;
      const currentSpinCount = userData.wheelSpinCount || 0;
      const currentFreeStories = userData.freeStories || 0;

      const updatePayload = {
        wheelProgress: newProgress,
        spinsAvailable: Math.max(0, currentSpins - 1),
        wheelSpinCount: currentSpinCount + 1
      };

      if (prize && prize.isStory) {
        updatePayload.freeStories = currentFreeStories + 1;

        await addDoc(collection(db, 'notificaciones'), {
          userId: userData.uid,
          type: 'reward',
          title: '📸 ¡1 HISTORIA GRATIS OTORGADA!',
          text: '¡Felicidades! Se ha acreditado +1 Historia Gratis de 24h a tu saldo en Pedidos Listo.',
          read: false,
          icon: '📸',
          createdAt: serverTimestamp()
        });

        alert(lang === 'es' 
          ? "🎉 ¡FELICIDADES! Se ha acreditado +1 HISTORIA GRATIS a tu saldo de publicaciones." 
          : "🎉 CONGRATULATIONS! +1 FREE STORY has been granted to your account.");
      } else if (earnedContract) {
        updatePayload.contracts = currentContracts + 1;
        
        // Crear notificación oficial en Firestore
        await addDoc(collection(db, 'notificaciones'), {
          userId: userData.uid,
          type: 'reward',
          title: '👑 ¡1 CONTRATO GRATIS OTORGADO!',
          text: '¡Felicidades! Se ha acreditado 1 contrato gratis a tu saldo por completar tu progreso en la Ruleta Pedidos Listo.',
          read: false,
          icon: '🎰',
          createdAt: serverTimestamp()
        });

        alert(lang === 'es' 
          ? "🎉 ¡FELICIDADES! Se ha otorgado y acreditado +1 CONTRATO GRATIS automáticamente a tu cuenta de Pedidos Listo." 
          : "🎉 CONGRATULATIONS! +1 FREE CONTRACT has been automatically granted to your Pedidos Listo account.");
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

  // Dynamic Live Hiring Toast Generator using Real Registered Pros from Firestore + Dominican Pool
  const clientNamesPool = [
    'Carmen S.', 'José M.', 'Rosa P.', 'Carlos R.', 'María L.', 'Rafael T.', 'Elena V.', 'Manuel G.', 
    'Ana B.', 'Pedro H.', 'Laura M.', 'Francisco K.', 'Patricia D.', 'Gabriel F.', 'Yolanda R.', 
    'Luz M.', 'Ramón V.', 'Teresa S.', 'Miguel A.', 'Isabel C.', 'Juan B.', 'Esperanza M.', 'Domingo R.'
  ];
  const citiesPool = ['Santiago', 'Santo Domingo, D.N.', 'La Vega', 'San Cristóbal', 'Puerto Plata', 'San Pedro', 'La Romana', 'Moca', 'Bonao', 'Baní', 'Higüey'];

  const getCleanCity = (raw, seedStr = '') => {
    if (raw && typeof raw === 'string' && raw.trim() && 
        !raw.toLowerCase().includes('república') && 
        !raw.toLowerCase().includes('dominicana') && 
        raw.trim().toUpperCase() !== 'RD' &&
        raw.trim().toUpperCase() !== 'DOMINICAN REPUBLIC') {
      return raw.trim();
    }
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash += seedStr.charCodeAt(i);
    }
    return citiesPool[Math.abs(hash) % citiesPool.length];
  };

  const [currentLiveToastObj, setCurrentLiveToastObj] = useState({ icon: '🔔', text: '' });
  const [showLiveToast, setShowLiveToast] = useState(false);
  const hideTimerRef = useRef(null);
  const lastEventIdRef = useRef(null);

  // Escuchador en TIEMPO REAL para notificaciones verdaderas: Historias (Likes/Reacciones) y Trabajo Finalizado (Reseñas/Estrellas)
  useEffect(() => {
    let ordersEvents = [];
    let likesEvents = [];
    let cycleInterval = null;
    let eventListRef = [];
    let eventIndex = 0;

    const showEvent = (eventObj) => {
      if (!eventObj || !eventObj.text) return;
      lastEventIdRef.current = eventObj.id;
      setCurrentLiveToastObj(eventObj);
      setShowLiveToast(true);

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setShowLiveToast(false);
      }, 5500);
    };

    const processEvents = () => {
      const allEvents = [...ordersEvents, ...likesEvents];
      allEvents.sort((a, b) => b.timestamp - a.timestamp);
      eventListRef = allEvents;

      if (allEvents.length > 0) {
        const latest = allEvents[0];
        if (latest.id !== lastEventIdRef.current) {
          showEvent(latest);
        }
      }
    };

    // Rotación automática continua cada 12 segundos si hay eventos en la lista
    cycleInterval = setInterval(() => {
      if (eventListRef.length > 0) {
        eventIndex = (eventIndex + 1) % eventListRef.length;
        showEvent(eventListRef[eventIndex]);
      }
    }, 12000);

    // 1. Escuchar Contratos Completados, Reseñas y Calificación de Estrellas en Trabajo Finalizado
    const qOrders = query(collection(db, 'orders'), limit(30));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      if (!snapshot.empty) {
        ordersEvents = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(d => 
            d.status === 'done' || 
            d.status === 'completed' || 
            d.status === 'finalizado' || 
            d.status === 'completado' ||
            d.rated === true ||
            (d.ratingScore && Number(d.ratingScore) > 0)
          )
          .map(d => {
            const client = d.reviewerName || d.clientName || d.client || 'Un cliente';
            const pro = d.proName || d.pro || 'un profesional';
            const spec = d.specEs || d.specialty || d.category || 'Servicio';
            const rawCity = d.city || d.provincia || d.location || d.ciudad;
            const city = getCleanCity(rawCity, d.id || client);
            const isReview = d.rated || (d.ratingScore && Number(d.ratingScore) > 0);
            const scoreVal = d.ratingScore ? Number(d.ratingScore) : 5;

            let icon = '💬';
            let text = '';
            if (isReview && d.ratingComment?.trim()) {
              icon = '💬';
              text = `${client} en ${city} dejó una reseña ⭐ ${scoreVal} a ${pro} (${spec})`;
            } else if (isReview) {
              icon = '⭐';
              text = `${client} en ${city} dio ${scoreVal} estrellas a ${pro} (${spec}) en Trabajo Finalizado`;
            } else {
              icon = '✅';
              text = `${client} en ${city} finalizó un trabajo con ${pro} (${spec})`;
            }

            const rawTime = d.updatedAt || d.completedAt || d.ratedAt || d.createdAt;
            const timestamp = rawTime ? new Date(rawTime.seconds ? rawTime.seconds * 1000 : rawTime).getTime() : Date.now();

            return { id: `order_${d.id}_${d.updatedAt || d.ratedAt || d.status || scoreVal}`, icon, text, timestamp };
          });

        processEvents();
      }
    }, (error) => {
      console.log('Realtime orders listener notice:', error);
    });

    // 2. Escuchar Me Gusta (Likes) y Reacciones a Historias en 'likes'
    const qLikes = query(collection(db, 'likes'), limit(30));
    const unsubLikes = onSnapshot(qLikes, (snapshot) => {
      if (!snapshot.empty) {
        likesEvents = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .map(d => {
            const client = d.clientName || d.client || 'Un cliente';
            const pro = d.proName || d.pro || 'un profesional';
            const spec = d.specEs || d.specialty || d.category || 'Servicio';
            const rawCity = d.city || d.provincia || d.location || d.ciudad;
            const city = getCleanCity(rawCity, d.id || client);
            const type = d.type || 'profile_like';
            const reactionName = d.reactionName || d.reactionIcon || 'Reacción';

            let icon = '❤️';
            let text = '';
            if (type === 'story_like') {
              icon = '📸';
              text = `${client} en ${city} dio me gusta a la Historia de ${pro} (${spec})`;
            } else if (type === 'story_reaction') {
              icon = '💬';
              text = `${client} en ${city} reaccionó "${reactionName}" a la Historia de ${pro} (${spec})`;
            } else {
              icon = '❤️';
              text = `${client} en ${city} dio me gusta al perfil de ${pro} (${spec})`;
            }

            const rawTime = d.createdAt;
            const timestamp = rawTime ? new Date(rawTime.seconds ? rawTime.seconds * 1000 : rawTime).getTime() : Date.now();

            return { id: `like_${d.id}_${type}`, icon, text, timestamp };
          });

        processEvents();
      }
    }, (error) => {
      console.log('Realtime likes listener notice:', error);
    });

    return () => {
      unsubOrders();
      unsubLikes();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (cycleInterval) clearInterval(cycleInterval);
    };
  }, []);

  const [featuredRef, featuredVisible] = useScrollReveal()
  const [allProsRef,  allProsVisible]  = useScrollReveal(0.05)
  const [catListRef,  catListVisible]  = useScrollReveal(0.05)

  const [unreadNotifs, setUnreadNotifs] = useState(0)

  const [photoRejectionNotif, setPhotoRejectionNotif] = useState(null)

  useEffect(() => {
    if (!userData?.uid) return
    const targetIds = [userData.uid]
    if (userData.email) targetIds.push(userData.email.toLowerCase().trim())
    if (userData.email === 'listopatron.app@gmail.com') targetIds.push('admin')
    const q = query(collection(db, 'notificaciones'), where('userId', 'in', targetIds), where('read', '==', false))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appNotifs = snapshot.docs.filter(docSnap => {
        return docSnap.data().type !== 'message';
      });
      setUnreadNotifs(appNotifs.length)

      const rejectionDoc = snapshot.docs.find(docSnap => {
        const data = docSnap.data();
        return data.title === 'Tu foto no fue aprobada' || (data.text && data.text.includes('Tu foto no fue aprobada'));
      });
      if (rejectionDoc) {
        setPhotoRejectionNotif({ id: rejectionDoc.id, ...rejectionDoc.data() });
      } else {
        setPhotoRejectionNotif(null);
      }
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

    const targetIds = [uid]
    if (userData?.email) targetIds.push(userData.email.toLowerCase().trim())
    if (userData?.email === 'listopatron.app@gmail.com') targetIds.push('admin')
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

  const [isLocatingGps, setIsLocatingGps] = useState(false)

  const handleDetectGps = async () => {
    setIsLocatingGps(true)
    try {
      const location = await detectGpsLocation()
      navigate('search', { provinceToSelect: location.provinceId })
    } catch (err) {
      alert(`⚠️ ${err.message || 'No se pudo obtener la ubicación por GPS.'}`)
    } finally {
      setIsLocatingGps(false)
    }
  }

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
    // ─ Escuchar en tiempo real con onSnapshot: tanto profesionales activos como nuevos postulantes
    const q = query(
      collection(db, 'users'),
      or(
        where('type', '==', 'pro'),
        where('role', '==', 'professional'),
        where('role', '==', 'pro'),
        where('verificacion.estado', '==', 'en_revision'),
        where('verificacion.estado', '==', 'aprobada')
      )
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const prosList = []
        const getMappedProCatId = (catString) => {
          if (!catString) return null;
          const cleanStr = catString.toLowerCase().trim();
          const foundSub = ALL_SUBCATEGORIES.find(s => s.id === cleanStr || s.labelEn?.toLowerCase() === cleanStr || s.labelEs?.toLowerCase() === cleanStr);
          if (foundSub) return foundSub;
          const foundMain = CATEGORIES.find(c => c.id === cleanStr || c.labelEn?.toLowerCase() === cleanStr || c.labelEs?.toLowerCase() === cleanStr);
          return foundMain || null;
        }

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data()

          // Determinar si es profesional activo o postulante
          const isPostulated = Boolean(data.verificacion?.estado === 'en_revision' || data.isPostulante);
          const isComplete = Boolean(data.profileComplete || data.verificacion?.estado === 'aprobada' || data.verificacion?.estado === 'verificado');
          const hasPlan = Boolean(data.planStatus === 'active');
          const hasContracts = Boolean(data.contracts && data.contracts > 0);

          // Si no tiene categoría ni está postulado/activo, omitir
          const hasAnyCategory = Boolean(data.category || data.especialidad || data.verificacion?.especialidad);
          if (!hasAnyCategory) return;
          if (!isPostulated && !isComplete && !hasPlan && !hasContracts) return;

          const catObj = getMappedProCatId(data.category || data.especialidad || data.verificacion?.especialidad)
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

          const isVerified = Boolean(data.verificacion?.estado === 'aprobada' || data.verificacion?.estado === 'verificado' || data.isVerified);

          prosList.push({
            id: docSnap.id,
            name: data.name || data.verificacion?.nombre || 'Profesional',
            nameEs: data.name || data.verificacion?.nombre || 'Profesional',
            nameEn: data.name || data.verificacion?.nombre || 'Professional',
            specEs: catObj ? catObj.labelEs : (data.especialidad || data.verificacion?.especialidad || 'Servicios Integrales'),
            specEn: catObj ? catObj.labelEn : (data.especialidad || data.verificacion?.especialidad || 'General services'),
            category: data.category || data.especialidad || data.verificacion?.especialidad || '',
            especialidad: data.especialidad || data.verificacion?.especialidad || data.category || '',
            rating: Number(data.rating) || 5.0,
            reviews: data.reviewCount || data.reviews || 0,
            location: finalLoc,
            sector: data.sector || data.verificacion?.sector || '',
            municipio: data.municipio || data.ciudad || data.city || data.verificacion?.municipio || '',
            provincia: data.provincia || data.verificacion?.provincia || '',
            direccion: data.direccion || data.verificacion?.direccion || '',
            verificacion: data.verificacion || null,
            isVerified,
            isPostulated,
            experience: (data.experience && !['nuevo', 'verificado'].includes(String(data.experience).trim().toLowerCase())) ? data.experience : (data.verificacion?.experiencia || ''),
            avatar: (data.name || 'P').substring(0, 2).toUpperCase(),
            avail: data.profileComplete && data.available !== false,
            img: data.photoURL || data.verificacion?.docs?.selfie || null,
            photoURL: data.photoURL || data.verificacion?.docs?.selfie || null,
            currentPlan: data.currentPlan || data.planName || data.plan || data.planId || data.planType || data.tipoPlan || data.subscription?.planName || data.subscription?.plan || data.membership || data.verificacion?.plan || null,
            planName: data.planName || data.currentPlan || data.subscription?.planName || data.verificacion?.plan || data.plan || null,
            contracts: data.contracts || 0,
            badge: isPostulated ? '🚀 NUEVO POSTULANTE' : (isVerified ? '🛡️ VERIFICADO' : null)
          })
        })

        const elitePros = prosList.filter(p => Number(p.rating || 0) >= 4.9).sort((a, b) => b.reviews - a.reviews);
        const finalFeatured = elitePros;

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
    }, (err) => {
      console.error("Error onSnapshot in Home: ", err)
    })

    return () => unsubscribe()
  }, [])

  // Hook para historias de 24h activas en tiempo real
  const { stories: allStories, getProStoryData } = useStories()
  const [storyViewerOpen, setStoryViewerOpen] = useState(false)
  const [activeStoryIndex, setActiveStoryIndex] = useState(0)

  const handleOpenStoryViewer = (index) => {
    setActiveStoryIndex(index)
    setStoryViewerOpen(true)
  }

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

  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    const search = typeof window !== 'undefined' ? (window.location.search || '') : '';
    const hash = typeof window !== 'undefined' ? (window.location.hash || '') : '';
    if (search.includes('comprar-plan') || hash.includes('comprar-plan') || hash.includes('planes')) {
      setShowPlanModal(true);
    }
  }, []);

  const openWebPlanPage = (e, planId = null) => {
    if (e) {
      if (e.stopPropagation) e.stopPropagation();
      if (e.preventDefault) e.preventDefault();
    }
    const uid = encodeURIComponent(userData?.uid || userData?.id || '');
    const name = encodeURIComponent(userData?.name || userData?.verificacion?.nombre || '');
    const email = encodeURIComponent(userData?.email || userData?.verificacion?.correo || '');
    const phone = encodeURIComponent(userData?.phone || userData?.verificacion?.telefono || '');
    const cedula = encodeURIComponent(userData?.cedula || userData?.verificacion?.cedula || '');
    const category = encodeURIComponent(userData?.category || userData?.especialidad || '');
    const planParam = planId ? `&plan=${encodeURIComponent(planId)}` : '';

    const webUrl = `https://www.listopatron.com.do/?comprar-plan=true&uid=${uid}&name=${name}&email=${email}&phone=${phone}&cedula=${cedula}&category=${category}${planParam}`;
    try {
      if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
        window.open(webUrl, '_system');
        return;
      }
    } catch (err) {
      console.error("Native open error:", err);
    }
    window.open(webUrl, '_blank');
  };

  const toggleAvailability = async () => {
    if (!profileComplete) {
      alert(lang === 'es' ? "Debes completar tu perfil para poder activarte y recibir pedidos." : "You must complete your profile to become active and receive orders.");
      return;
    }
    if (isExpired) {
      alert(lang === 'es' 
        ? "Tu cuenta está inactiva. Por favor actualízala en nuestra web para poder ponerte en línea." 
        : "Your account is inactive. Please update it on our website to go online.");
      openWebPlanPage();
      return;
    }
    const currentAvail = userData?.available !== false;
    if (!currentAvail && (userData?.contracts || 0) <= 0) {
      alert(lang === 'es' 
        ? "No tienes contratos disponibles. Para cambiar o adquirir un plan, ingresa a nuestra plataforma web." 
        : "No contracts available. To change or purchase a plan, please visit our website.");
      openWebPlanPage();
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
      </div>

      {/* ── BOTÓN / PANEL SOCIO "¡HOLA, SOCIO!" (UBICADO DEBAJO DEL PANEL DE HISTORIAS DE ARRIBA) ── */}
      {isPro && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', margin: '10px 16px 14px' }}>
          <div 
            style={{ 
              padding: '16px 18px', 
              background: 'linear-gradient(135deg, #ffffff 0%, #fff7f0 100%)', 
              borderRadius: '20px', 
              boxShadow: '0 8px 24px rgba(242, 96, 0, 0.12)', 
              border: '1.5px solid rgba(242, 96, 0, 0.18)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #FF7A1A, #F26000, #E65100)' }} />

             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 {/* Foto de Perfil del Usuario colocada donde estaba la manita 👋 */}
                 <div 
                   onClick={() => {
                     if (isPro || userRole === 'pro' || userData?.type === 'pro') {
                       navigate('proProfile', userData)
                     } else {
                       navigate('profile')
                     }
                   }}
                   style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                   title={lang === 'es' ? 'Ver mi perfil' : 'View my profile'}
                 >
                   <img 
                     src={userData?.profilePhoto || userData?.photoURL || logoListo} 
                     alt="Perfil" 
                     style={{ 
                       width: '42px', 
                       height: '42px', 
                       borderRadius: '50%', 
                       objectFit: 'cover', 
                       border: '2.5px solid #F26000', 
                       boxShadow: '0 3px 10px rgba(242, 96, 0, 0.25)',
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
                       width: '20px',
                       height: '20px',
                       borderRadius: '50%',
                       background: 'linear-gradient(135deg, #FF7A1A, #F26000)',
                       display: 'flex',
                       alignItems: 'center',
                       justify: 'center',
                       boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                       cursor: 'pointer',
                       border: '1.5px solid white',
                       zIndex: 21
                     }}
                     title={lang === 'es' ? 'Ir a mensajes' : 'Go to chat'}
                   >
                     <span style={{ fontSize: '10px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       💬
                     </span>
                     {totalUnreadMessages > 0 && (
                       <span 
                         style={{ 
                           position: 'absolute', 
                           top: '-5px', 
                           right: '-5px', 
                           background: '#EF4444', 
                           color: 'white', 
                           fontSize: '8px', 
                           fontWeight: '900', 
                           borderRadius: '7px', 
                           padding: '1px 4px', 
                           border: '1px solid white'
                         }}
                       >
                         {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                       </span>
                     )}
                   </div>
                 </div>

                 <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#1A1A2E' }}>¡Hola, Socio!</h2>
                 <span style={{ fontSize: '10px', fontWeight: '800', background: 'rgba(242, 96, 0, 0.12)', color: '#F26000', padding: '3px 8px', borderRadius: '12px', border: '1px solid rgba(242, 96, 0, 0.25)' }}>
                   ⭐ PANEL PRO
                 </span>
               </div>

               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span style={{ fontSize: '11px', fontWeight: '700', color: isAvailable ? '#16A34A' : '#64748B' }}>
                   {isAvailable ? '🟢 En línea' : '⚫ Desconectado'}
                 </span>
                 <div 
                   onClick={toggleAvailability}
                   style={{ 
                     width: '50px', height: '28px', borderRadius: '14px', 
                     background: isAvailable ? (isLowContracts && showLowContractWarning ? '#EF4444' : 'linear-gradient(135deg, #22C55E, #16A34A)') : '#CBD5E1', 
                     position: 'relative', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                     opacity: profileComplete ? 1 : 0.6,
                     boxShadow: isAvailable ? '0 2px 8px rgba(34, 197, 94, 0.35)' : 'none'
                   }}
                 >
                   <div style={{
                     width: '22px', height: '22px', borderRadius: '50%', background: 'white',
                     position: 'absolute', top: '3px', left: isAvailable ? '25px' : '3px',
                     transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                   }} />
                 </div>
               </div>
             </div>
             
             {!profileComplete ? (
               <div 
                 onClick={() => {
                   navigate('profile', { screen: 'verification' });
                   openWebPlanPage();
                 }} 
                 className="warning-pulse-banner"
                 style={{ padding: '12px 14px', background: '#FEF2F2', borderRadius: '14px', border: '1.5px solid #FECACA', marginTop: '8px', cursor: 'pointer' }}
               >
                 <p style={{ margin: '0 0 4px', fontSize: '12.5px', color: '#991B1B', fontWeight: 'bold' }}>
                   ⚠️ Tu perfil está incompleto (presiona aquí para verificar).
                 </p>
                 <p style={{ margin: 0, fontSize: '11.5px', color: '#B91C1C', lineHeight: 1.4 }}>
                   No puedes recibir pedidos. Cuando termines de completar tu perfil y verificación, actívate.
                 </p>
               </div>
             ) : (
                 <div 
                   onClick={(e) => openWebPlanPage(e)}
                   className={(isExpired || !isAvailable || (isAvailable && isLowContracts && showLowContractWarning)) ? "warning-pulse-banner" : ""}
                  style={{ 
                    background: (isExpired || !isAvailable || (isAvailable && isLowContracts && showLowContractWarning)) ? '#FEF2F2' : 'rgba(34, 197, 94, 0.08)', 
                    padding: '10px 14px', 
                    borderRadius: '12px', 
                    border: `1.5px solid ${(isExpired || !isAvailable || (isAvailable && isLowContracts && showLowContractWarning)) ? '#FECACA' : 'rgba(34, 197, 94, 0.2)'}`, 
                    marginTop: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: (isExpired || !isAvailable || (isAvailable && isLowContracts && showLowContractWarning)) ? '0 2px 8px rgba(220, 38, 38, 0.12)' : 'none'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  title={lang === 'es' ? 'Haz clic para ir a nuestra plataforma web y adquirir tu plan' : 'Click to open web platform'}
                >
                  <p style={{ 
                    color: (isExpired || !isAvailable || (isAvailable && isLowContracts && showLowContractWarning)) ? '#B91C1C' : (isAvailable ? '#15803D' : '#64748B'), 
                    fontSize: '12.5px', 
                    margin: 0, 
                    fontWeight: '700'
                  }}>
                    {isExpired
                      ? '🔴 Perfil inactivo. Actualízalo en nuestra web.'
                      : (isAvailable 
                          ? (isLowContracts && showLowContractWarning
                              ? (isNative 
                                  ? '🔴 Solo te queda un contrato. Para adquirir o mejorar tu plan, ingresa a nuestra plataforma web.'
                                  : '🔴 Solo te queda un contrato. Adquiere tu plan en nuestra web para recibir clientes.')
                              : '🟢 Estás visible para clientes cercanos. ¡Listo para recibir solicitudes!') 
                          : '⚫ Estás en modo ausente. Actívate cuando desees recibir solicitudes.')}
                  </p>
                </div>
              )}
          </div>
        </div>
      )}

      {/* ── SECCIÓN DESPLEGABLE DE EMERGENCIAS (ACTIVADA DESDE EL CÍRCULO SIRENA BOMBERO EN LA BARRA SUPERIOR) ── */}
      {isProblemsExpanded && (
        <div 
          className="emergency-floating-banner"
          style={{
            margin: '10px 16px 14px',
            background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1706 60%, #991B1B 100%)',
            borderRadius: '20px',
            border: '2px solid #EF4444',
            boxShadow: '0 8px 30px rgba(239, 68, 68, 0.35)',
            overflow: 'hidden',
            animation: 'pwaBannerSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {/* Banner Header animado interactivo */}
          <div 
            className="emergency-banner-header"
            onClick={() => setIsProblemsExpanded(false)}
            title="Toca para ocultar emergencias"
            style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <span className="emergency-siren-anim" style={{ fontSize: '26px' }}>🚨</span>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <h2 style={{ fontSize: '16.5px', fontWeight: '900', color: '#FFFFFF', margin: 0, lineHeight: 1.2, textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                  {lang === 'es' ? '¿Qué problema tienes hoy?' : 'What problem do you have today?'}
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: '#FFD700', fontWeight: '700' }}>
                  {lang === 'es' ? 'Toca tu emergencia para conectar al instante' : 'Tap your emergency to connect instantly'}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsProblemsExpanded(false);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Contenedor desplegado de emergencias */}
          <div className="emergency-grid-container expanded">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {REAL_PROBLEMS.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => navigate('search', { catToSelect: prob.id })}
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7F2 100%)',
                    borderRadius: '16px',
                    padding: '14px 12px',
                    border: '1.5px solid rgba(242, 96, 0, 0.2)',
                    boxShadow: '0 4px 14px rgba(242, 96, 0, 0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    transition: 'transform 0.15s ease, boxShadow 0.15s ease'
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '28px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{prob.icon}</span>
                      <span style={{ fontSize: '9px', fontWeight: '900', background: '#FEF3EC', color: '#F26000', border: '1px solid rgba(242, 96, 0, 0.3)', padding: '2px 7px', borderRadius: '10px' }}>
                        {prob.tag}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '13.5px', fontWeight: '900', color: '#1A1A2E', margin: '0 0 4px', lineHeight: 1.25 }}>
                      "{lang === 'es' ? prob.labelEs : prob.labelEn}"
                    </h3>
                    <p style={{ fontSize: '11px', color: '#64748B', margin: 0, fontWeight: '600' }}>
                      {prob.descEs}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed rgba(242, 96, 0, 0.15)' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#F26000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⚡ Contactar socio
                    </span>
                    <span style={{ fontSize: '14px', color: '#F26000', fontWeight: 'bold' }}>›</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SECCIÓN PROFESIONALES DESTACADOS (NUESTRO VIP) ── */}
      <VIPSection 
        realVipPros={featuredProsToUse} 
        lang={lang} 
        navigate={navigate} 
        sectionTitle={lang === 'es' ? '🌟 Profesionales Destacados' : '🌟 Featured Professionals'}
        sectionSub={null}
        getProStoryData={getProStoryData}
        onOpenStory={handleOpenStoryViewer}
        userData={userData}
      />

      {/* ── CINTA / ANUNCIO LARGO Y FINO INVITANDO A LA TIENDA WEB (DEBAJO DE PROFESIONALES DESTACADOS) ── */}
      <div 
        className="store-ribbon-banner"
        onClick={() => window.open('https://listopatron.com.do/?page=shop', '_blank')}
        title={lang === 'es' ? 'Visitar la Tienda Web de Listo Patrón' : 'Visit Listo Patrón Web Store'}
        style={{ marginTop: '0px', marginBottom: '0px' }}
      >
        <div className="store-ribbon-content">
          <span className="store-ribbon-icon">🛍️</span>
          <div className="store-ribbon-text-group">
            <p className="store-ribbon-title">
              {lang === 'es' ? <>Equípate en nuestra tienda <strong>Listo Patrón</strong></> : <>Equip yourself at <strong>Listo Patrón</strong> Store</>}
            </p>
            <p className="store-ribbon-sub">
              {lang === 'es' ? 'Herramientas, equipos e insumos de seguridad con envío rápido a todo el país' : 'Tools, safety gear & supplies with fast nationwide shipping'}
            </p>
          </div>
        </div>
        <button className="store-ribbon-btn">
          🛒 {lang === 'es' ? 'Visitar Tienda ›' : 'Visit Store ›'}
        </button>
      </div>

      {/* ── LO QUE DICEN NUESTROS CLIENTES (CARRUSEL 20 RESEÑAS) ── */}
      <TestimonialsCarousel lang={lang} navigate={navigate} />

      {/* ── ABARROTES Y SERVICIOS CON ENTREGA HOY (2X2 GRID) ── */}
      <section className="amz-bento-section">
        <div className="amz-bento-header">
          <h2 className="amz-bento-title">
            🛍️ {lang === 'es' ? 'Abarrotes y servicios con entrega hoy' : 'Same day services'}
          </h2>
          <button className="hp-see-all amz-see-all" onClick={() => navigate('search')}>
            {lang === 'es' ? 'Ver todo ›' : 'See all ›'}
          </button>
        </div>
        <div className="amz-bento-grid">
          <div className="amz-bento-item" onClick={() => navigate('search', { catToSelect: 'mecanico' })}>
            <div className="amz-bento-img-wrap">
              <span className="amz-bento-item-tag" style={{ background: '#CC0C39' }}>🔥 MÁS VENDIDO</span>
              <span className="bento-listo-badge">Listo</span>
              <img src={mecanico1} alt="Mecánico" className="amz-bento-img" />
            </div>
            <p className="amz-bento-item-title">{lang === 'es' ? 'Diagnóstico Vehicular' : 'Auto Diagnostic'}</p>
            <p className="amz-bento-item-sub">🤝 {lang === 'es' ? 'A convenir' : 'To agree'}</p>
          </div>

          <div className="amz-bento-item" onClick={() => navigate('search', { catToSelect: 'electricista' })}>
            <div className="amz-bento-img-wrap">
              <span className="amz-bento-item-tag" style={{ background: '#DC2626' }}>⚡ 24/7 URGENTE</span>
              <span className="bento-listo-badge">Listo</span>
              <img src={electrica1} alt="Electricista" className="amz-bento-img" />
            </div>
            <p className="amz-bento-item-title">{lang === 'es' ? 'Instalación Eléctrica' : 'Electrical Install'}</p>
            <p className="amz-bento-item-sub">🤝 {lang === 'es' ? 'A convenir' : 'To agree'}</p>
          </div>

          <div className="amz-bento-item" onClick={() => navigate('search', { catToSelect: 'plomero' })}>
            <div className="amz-bento-img-wrap">
              <span className="amz-bento-item-tag" style={{ background: '#B91C1C' }}>🛡️ GARANTIZADO</span>
              <span className="bento-listo-badge">Listo</span>
              <img src={plomero} alt="Plomero" className="amz-bento-img" />
            </div>
            <p className="amz-bento-item-title">{lang === 'es' ? 'Reparación de Tubería' : 'Pipe Repair'}</p>
            <p className="amz-bento-item-sub">🤝 {lang === 'es' ? 'A convenir' : 'To agree'}</p>
          </div>

          <div className="amz-bento-item" onClick={() => navigate('search', { catToSelect: 'cerrajero' })}>
            <div className="amz-bento-img-wrap">
              <span className="bento-listo-badge">Listo</span>
              <img src={cerrajero1} alt="Cerrajero" className="amz-bento-img" />
            </div>
            <p className="amz-bento-item-title">{lang === 'es' ? 'Apertura de Puertas' : 'Door Opening'}</p>
            <p className="amz-bento-item-sub">🤝 {lang === 'es' ? 'A convenir' : 'To agree'}</p>
          </div>
        </div>
      </section>

      {/* ── SECCIONES DE SERVICIOS POR OFICIO (MECÁNICO, ELECTRICISTA, PLOMERO, REFRIGERACIÓN, ETC.) ── */}
      {sections.map((sec, idx) => {
        const amzThemes = [
          { bg: '#FFFFFF', color: '#1E3A8A', card: '#FFF' }, // Mecánico
          { bg: '#FFFBEB', color: '#92400E', card: '#FFF' }, // Electricista
          { bg: '#FFFFFF', color: '#1E3A8A', card: '#FFF' }, // Plomero
          { bg: '#F0F9FF', color: '#0369A1', card: '#FFF' }, // Refrigeración y A/C
          { bg: '#FAF5FF', color: '#4C1D95', card: '#FFF' }, // Cerrajero
          { bg: '#F0FDF4', color: '#166534', card: '#FFF' }, // Pintor
          { bg: '#FFF8F3', color: '#C2410C', card: '#FFF' }, // Jardinero
          { bg: '#FDF4FF', color: '#831843', card: '#FFF' }, // Niñera
        ];
        const theme = amzThemes[idx % amzThemes.length];

        // 1. Filtrar SOLO profesionales que corresponden exactamente a esta profesión/oficio
        const matchingPros = (allProsToUse || [])
          .filter(p => matchesCategorySlug(p, sec.id))
          .sort((a, b) => {
            // A) Profesionales con foto real verificada primero
            const aPhoto = Boolean(a.img || a.photoURL);
            const bPhoto = Boolean(b.img || b.photoURL);
            if (aPhoto && !bPhoto) return -1;
            if (!aPhoto && bPhoto) return 1;
            // B) Verificados primero
            if (a.isVerified && !b.isVerified) return -1;
            if (!a.isVerified && b.isVerified) return 1;
            // C) Nuevos postulantes
            if (a.isPostulated && !b.isPostulated) return -1;
            if (!a.isPostulated && b.isPostulated) return 1;
            // D) Mejor calificación
            return (Number(b.rating) || 5.0) - (Number(a.rating) || 5.0);
          });

        // 2. Control de fotos únicas para evitar repeticiones en la misma fila
        const stockPool = [
          ...(sec.services || []).map(s => s.img).filter(Boolean),
          sec.image
        ].filter(Boolean);
        const usedImgsInRow = new Set();

        return (
          <section key={sec.id} className="hp-service-section reveal" style={{ background: theme.bg, margin: '6px 0', padding: '8px 0' }}>
            <div className="hp-sec-header amz-sec-header">
              <h2 className="hp-sec-title amz-sec-title" style={{ color: theme.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {sec.image ? <img src={sec.image} alt={sec.titleEs} style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> : sec.icon} 
                {lang === 'es' ? sec.titleEs : sec.titleEn}
                {matchingPros.length > 0 && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    background: 'rgba(0,0,0,0.06)',
                    color: theme.color,
                    padding: '2px 7px',
                    borderRadius: '12px'
                  }}>
                    {matchingPros.length} {lang === 'es' ? (matchingPros.length === 1 ? 'pro' : 'pros') : 'pros'}
                  </span>
                )}
              </h2>
              <button className="hp-see-all amz-see-all" style={{ color: theme.color }} onClick={() => navigate('search', { catToSelect: sec.id })}>
                {lang === 'es' ? 'Ver todo ›' : 'See all ›'}
              </button>
            </div>
            <div className="hp-service-cards amz-cards-scroll">
              {/* Profesionales reales que coinciden y aparecen según se van postulando */}
              {matchingPros.map((pro) => {
                let cardImg = null;
                const rawPhoto = pro.img || pro.photoURL;

                // Si el profesional tiene su propia foto real y no está duplicada en la fila
                if (rawPhoto && !usedImgsInRow.has(rawPhoto)) {
                  cardImg = rawPhoto;
                  usedImgsInRow.add(rawPhoto);
                }

                // Si no tiene foto real, buscar una foto de stock de la categoría que no se haya usado en esta fila
                if (!cardImg) {
                  const availableStock = stockPool.find(img => !usedImgsInRow.has(img));
                  if (availableStock) {
                    cardImg = availableStock;
                    usedImgsInRow.add(availableStock);
                  }
                }

                return (
                  <div 
                    key={`pro-${pro.id}`} 
                    className="hp-svc-card amz-bento-card" 
                    style={{ background: theme.card }} 
                    onClick={() => navigate('booking', { professional: pro })}
                  >
                    <div className="hp-svc-img-wrap" style={{ position: 'relative' }}>
                      <span 
                        className="hp-svc-tag" 
                        style={{ 
                          background: pro.isPostulated ? '#2563EB' : (pro.isVerified ? '#16A34A' : '#EA580C') 
                        }}
                      >
                        {pro.badge || (pro.isPostulated ? '🚀 NUEVO' : (pro.isVerified ? '🛡️ VERIFICADO' : '⭐ PRO'))}
                      </span>
                      <span className="bento-listo-badge">Listo</span>
                      {cardImg ? (
                        <img 
                          src={cardImg} 
                          alt={pro.nameEs || pro.name} 
                          className="hp-svc-img"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                          color: '#FFF',
                          userSelect: 'none'
                        }}>
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #F26000, #FF8534)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '22px',
                            fontWeight: '900',
                            color: '#FFF',
                            boxShadow: '0 4px 14px rgba(242,96,0,0.4)',
                            marginBottom: '6px'
                          }}>
                            {(pro.nameEs || pro.name || 'P').substring(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: '800', opacity: 0.85, letterSpacing: '0.5px' }}>
                            {sec.icon} {lang === 'es' ? 'PROFESIONAL' : 'PROFESSIONAL'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="hp-svc-info">
                      <p className="hp-svc-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pro.nameEs || pro.name}
                        </span>
                        {pro.isVerified && <span title="Verificado" style={{ color: '#10B981', fontSize: '13px', flexShrink: 0 }}>✓</span>}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                        <p className="hp-svc-price" style={{ margin: 0 }}>
                          {lang === 'es' ? 'A convenir' : 'To agree'}
                        </p>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#B45309', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          ⭐ {(Number(pro.rating) || 5.0).toFixed(1)}
                        </span>
                      </div>
                      {pro.location && (
                        <p style={{ margin: '3px 0 0', fontSize: '10.5px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          📍 {pro.location}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Si hay menos de 2 profesionales en la categoría, completar con tarjetas de servicio demo sin repetir fotos */}
              {(matchingPros.length < 2 ? sec.services.filter(s => !usedImgsInRow.has(s.img)).slice(0, 2 - matchingPros.length) : []).map((s, i) => {
                usedImgsInRow.add(s.img);
                return (
                  <div key={`demo-${i}`} className="hp-svc-card amz-bento-card" style={{ background: theme.card }} onClick={() => navigate('booking', { specialty: sec.id })}>
                    <div className="hp-svc-img-wrap">
                      {s.tag && <span className="hp-svc-tag">{s.tag}</span>}
                      {s.showListoBadge && <span className="bento-listo-badge">Listo</span>}
                      <img src={s.img} alt={s.nameEs} className="hp-svc-img" />
                    </div>
                    <div className="hp-svc-info">
                      <p className="hp-svc-name">{lang === 'es' ? s.nameEs : s.nameEn}</p>
                      <p className="hp-svc-price">{s.price}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}



          <section ref={allProsRef} className={`all-pros-section${allProsVisible ? ' reveal' : ''}`} style={{ marginTop: 0, paddingTop: '2px' }}>
            <div className="hp-sec-header" style={{ marginTop: 0, marginBottom: 4 }}>
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
                filteredPros.map((pro, i) => {
                  const sData = getProStoryData(pro)
                  const hasStory = Boolean(sData && sData.stories && sData.stories.length > 0)

                  return (
                    <div key={i} className="pro-list-card" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => navigate('booking', { professional: pro })}>
                      <div className="pro-list-img-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={pro.img || pro.photoURL} alt={pro.nameEs} className="pro-list-img" />
                        <div className="listo-brand-watermark">
                          <img src={logoListo} alt="Pedidos Listo" className="listo-brand-watermark-img" />
                        </div>
                        
                        {hasStory && (
                          <div 
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              zIndex: 10,
                              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
                            }}
                          >
                            <StoryAvatar 
                              pro={pro}
                              src={pro.img || pro.photoURL}
                              alt={pro.nameEs}
                              size={54}
                              storyData={sData}
                              onOpenStory={handleOpenStoryViewer}
                              fallbackAvatar={pro.avatar || (pro.nameEs || 'P').charAt(0)}
                            />
                          </div>
                        )}
                        <span className={`pro-avail-dot${pro.avail ? ' online' : ''}`} />
                        {i % 4 === 0 && <span className="cat-flash-badge" style={{top: '-8px', left: '-8px', animation: 'ecom-pop 1s infinite alternate'}}>⚡ {lang === 'es' ? 'RÁPIDO' : 'FAST'}</span>}
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
                  )
                })
              ) : (
                <div style={{ padding: '40px 20px', color: 'var(--gray)', fontSize: '15px', textAlign: 'center', gridColumn: '1 / -1' }}>
                  {lang === 'es' ? '🔍 No se encontraron profesionales en esta categoría.' : '🔍 No professionals found in this category.'}
                </div>
              )}
            </div>
          </section>

          {/* ── CINTA OFICIAL DE PEDIDOS LISTO (AL FINAL DE TODOS LOS PROFESIONALES) ── */}
          <div 
            className="pedidos-ribbon-banner"
            onClick={() => {
              const isAdmin = Boolean(userData?.email === 'listopatron.app@gmail.com' || userData?.role === 'admin' || userData?.isAdmin === true);
              if (isAdmin) {
                navigate('mandame');
              } else {
                alert('🚀 Pedidos Listo estará disponible muy pronto.');
              }
            }}
            title={lang === 'es' ? 'Ir a Pedidos Listo - Delivery y Mandados' : 'Go to Pedidos Listo - Delivery & Errands'}
          >
            <div className="pedidos-ribbon-shimmer" />
            <div className="pedidos-ribbon-content">
              <div className="pedidos-ribbon-brand-wrap">
                <span className="pedidos-ribbon-icon">🛵</span>
                <img 
                  src={pedidosListo2Img} 
                  alt="Pedidos Listo" 
                  className="pedidos-ribbon-logo-img" 
                />
              </div>
              <div className="pedidos-ribbon-text-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p className="pedidos-ribbon-title" style={{ margin: 0 }}>
                    {lang === 'es' ? (
                      <>Envíos y mandados express con <strong>Pedidos Listo</strong></>
                    ) : (
                      <>Express delivery & errands with <strong>Pedidos Listo</strong></>
                    )}
                  </p>
                  <span style={{
                    background: '#FFD700',
                    color: '#1A1A2E',
                    fontSize: '9.5px',
                    fontWeight: '900',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    letterSpacing: '0.5px'
                  }}>
                    🚀 PRÓXIMAMENTE
                  </span>
                </div>
                <p className="pedidos-ribbon-sub">
                  {lang === 'es' 
                    ? 'Comida, compras, farmacia y envíos en minutos a tu puerta' 
                    : 'Food, shopping, pharmacy & deliveries to your door in minutes'}
                </p>
              </div>
            </div>
            <button 
              className="pedidos-ribbon-btn"
              onClick={(e) => {
                e.stopPropagation();
                const isAdmin = Boolean(userData?.email === 'listopatron.app@gmail.com' || userData?.role === 'admin' || userData?.isAdmin === true);
                if (isAdmin) {
                  navigate('mandame');
                } else {
                  alert('🚀 Pedidos Listo estará disponible muy pronto.');
                }
              }}
            >
              {(userData?.email === 'listopatron.app@gmail.com' || userData?.role === 'admin')
                ? (lang === 'es' ? '👑 Modo Admin ›' : '👑 Admin Mode ›')
                : (lang === 'es' ? '🔒 Próximamente ›' : '🔒 Coming Soon ›')}
            </button>
          </div>

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


      {/* Floating Lucky Wheel FAB — Se muestra ÚNICAMENTE para profesionales cuando tienen giros ganados por 4 o 5 estrellas */}
      {(isPro && (userData?.spinsAvailable || 0) > 0) && (
        <button 
          className="lucky-wheel-fab" 
          onClick={() => setShowLuckyWheel(true)}
        >
          <span style={{ fontSize: '18px' }}>🎰</span>
          <span>{lang === 'es' ? 'Tómbola' : 'Lucky Wheel'} ({(userData?.spinsAvailable || 0)} {lang === 'es' ? 'giros' : 'spins'})</span>
        </button>
      )}

      {/* Modal de la Ruleta de la Suerte Pedidos Listo */}
      <LuckyWheelModal 
        isOpen={showLuckyWheel} 
        onClose={() => setShowLuckyWheel(false)} 
        lang={lang} 
        wheelProgress={userData?.wheelProgress || 0}
        completedContracts={userData?.completedContracts || userData?.contracts || 0}
        onClaimReward={handleClaimReward} 
      />
      {/* Modal de Selección de Plan Profesional */}
      <PlanSelectionModal 
        isOpen={showPlanModal} 
        onClose={() => setShowPlanModal(false)} 
        onSelectPlan={(plan) => {
          alert(`Has seleccionado el ${plan.name} (${plan.price}). Por favor comunícate con la administración de Pedidos Listo o realiza tu transferencia para activar tus contratos.`);
          setShowPlanModal(false);
        }} 
      />

      {/* Modal de Cotización Flash Express 3 Pasos */}
      {showSolicitudExpress && (
        <SolicitudExpressModal 
          lang={lang} 
          onClose={() => setShowSolicitudExpress(false)} 
          userProfile={userData} 
        />
      )}

      {/* Modal Visor de Historias en pantalla completa para profesional seleccionado */}
      <HistoriasViewerModal
        isOpen={storyViewerOpen}
        onClose={() => setStoryViewerOpen(false)}
        stories={allStories}
        initialIndex={activeStoryIndex}
        userData={userData}
        onHirePro={(proId) => {
          const proObj = (allProsToUse || []).find(p => p.id === proId) || { id: proId };
          navigate('proProfile', proObj);
        }}
        navigate={navigate}
      />

      {/* Modal de Ofertas Relámpago (se activa ÚNICAMENTE al hacer clic en el botón de la cinta) */}
      <LightningOfferBannerModal 
        isOpen={showFlashOfferModal} 
        onClose={() => setShowFlashOfferModal(false)} 
        navigate={navigate} 
        lang={lang} 
      />

    </div>
  )
}