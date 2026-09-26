import { useState, useEffect, useRef } from 'react'
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { CATEGORIES, FILTERS, ALL_SUBCATEGORIES, PROVINCES_LIST } from '../categories'
import LocalesCarrusel from '../locales/LocalesCarrusel'  // ✅ importado
import VIPSection, { isProVip } from '../components/VIPSection'
import HistoriasCarrusel from '../components/HistoriasCarrusel'
import HistoriasViewerModal from '../components/HistoriasViewerModal'
import StoryAvatar from '../components/StoryAvatar'
import { useStories } from '../hooks/useStories'
import ProPlanAlertWidget from '../components/ProPlanAlertWidget'
import PlanSelectionModal from '../components/PlanSelectionModal'
import EstimadorPreciosModal from '../components/EstimadorPreciosModal'
import SolicitudExpressModal from '../components/SolicitudExpressModal'
import CalculadoraMaterialesModal from '../components/CalculadoraMaterialesModal'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import recomendarIcon from '../assets/icons/recomendar.png'
import opinionesIcon from '../assets/icons/opiniones.png'
import compartirIcon from '../assets/icons/compartir.png'
import './SearchPage.css'

const customProIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3203/3203071.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
})

const txt = {
  es: {
    title:       'Buscar servicios',
    search:      '¿Qué necesitas?',
    available:   'Disponible',
    busy:        'Ocupado',
    book:        'Contratar',
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
  es: [
    '¡Tu opinión manda! Califica con estrellas a los profesionales para ayudar a otros a elegir siempre lo mejor.',
    '¿Buscas al mejor? Revisa las reseñas y calificaciones antes de contratar. ¡Tu satisfacción es lo primero!',
    'Contratar un profesional nunca fue tan fácil. ¡Encuentra el que necesitas y agenda en segundos!',
  ],
  en: [
    'Your voice matters! Rate professionals with stars to help everyone choose the best.',
    'Looking for the best? Check reviews and ratings before hiring. Your satisfaction comes first!',
    'Hiring a professional has never been easier. Find who you need and book in seconds!',
  ],
}

// ── Banner de Creación VIP ──────────────────────────────────────
function VipShopEntryBanner({ navigate, userRole, userData }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const planName = String(userData?.currentPlan || userData?.planId || userData?.plan || '').toLowerCase()
  const isVipPro = userRole === 'pro' && planName.includes('vip')

  return (
    <div className="vip-entry-banner" style={{ margin: '0 16px 16px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 14, overflow: 'hidden', color: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🏬</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#FFD700', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {isVipPro ? 'Configura tu Local VIP' : 'Explora los Locales VIP'}
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#ccc', fontWeight: 600 }}>
              {isVipPro ? 'Destaca entre la competencia' : 'Visita locales comerciales exclusivos'}
            </p>
          </div>
        </div>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s', fontSize: 14, color: '#FFD700' }}>▼</span>
      </div>
      
      {isOpen && (
        <div style={{ padding: '0 16px 16px', animation: 'vip-slide-in 0.3s' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <ul style={{ margin: '0 0 10px', paddingLeft: 20, fontSize: 13, lineHeight: 1.6, color: '#ddd' }}>
              <li>Menú de servicios detallado</li>
              <li>Fotos reales de trabajos realizados</li>
              <li>Atrae mucha más clientela segura</li>
            </ul>
            {isVipPro ? (
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#FFD700', textAlign: 'center', background: 'rgba(255,215,0,0.1)', padding: '6px', borderRadius: '6px' }}>Tu Suscripción VIP está Activa</p>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: '#ccc', textAlign: 'center', fontStyle: 'italic' }}>
                Exclusivo para profesionales con Plan VIP
              </p>
            )}
          </div>
          <button 
            style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a1a2e', fontSize: 15, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,165,0,0.4)' }}
            onClick={() => {
              if (isVipPro) {
                const q = query(collection(db, 'locales'), where('proId', '==', userData.uid))
                getDocs(q).then(snap => {
                  if (!snap.empty) {
                    navigate('editarLocal', { id: snap.docs[0].id, ...snap.docs[0].data() })
                  } else {
                    navigate('crearLocal')
                  }
                }).catch(err => {
                  console.error("Error fetching local:", err)
                  navigate('crearLocal')
                })
              } else {
                navigate('locales')
              }
            }}
          >
            {isVipPro ? '🚀 Configurar mi Local VIP Ahora' : '🛍️ Entrar al Directorio de Locales VIP'}
          </button>
        </div>
      )}
    </div>
  )
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
          position: absolute; font-size: 10px; color: #fff;
          opacity: 0.3; animation: listo-shimmer 2s ease-in-out infinite;
          pointer-events: none;
        }
        .listo-promo-star {
          font-size: 28px; flex-shrink: 0; margin-top: 4px;
          animation: listo-starPop 2s ease-in-out infinite, listo-starFloat 3s ease-in-out infinite;
          filter: drop-shadow(0 0 6px rgba(255,220,0,0.8));
        }
        .listo-promo-body { flex: 1; min-height: 58px; position: relative; }
        .listo-promo-msg  { animation: listo-fadeSlide 5s ease-in-out forwards; }
        .listo-mini-stars { display: flex; gap: 2px; margin-bottom: 4px; }
        .listo-mini-star  { font-size: 11px; animation: listo-shimmer 1.5s ease-in-out infinite; }
        .listo-promo-text {
          margin: 0; font-size: 13px; font-weight: 500; color: #fff;
          line-height: 1.5; text-shadow: 0 1px 3px rgba(0,0,0,0.2);
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
function ProDelMes({ lang, navigate, userRole }) {
  const [proDelMes,      setProDelMes]      = useState(null)
  const [totalEstrellas, setTotalEstrellas] = useState(0)
  const [resenas,        setResenas]        = useState([])
  const [resenaIdx,      setResenaIdx]      = useState(0)
  const [loading,        setLoading]        = useState(true)
  const resenaTimer = useRef(null)

  const [mes] = useState(() => {
    const now = new Date()
    // El "Profesional del Mes" corresponde al mes anterior al actual
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return new Intl.DateTimeFormat(lang === 'es' ? 'es-DO' : 'en-US', { month: 'long', year: 'numeric' }).format(prevMonthDate)
  })

  useEffect(() => {
    const calcularProDelMes = async () => {
      try {
        const now = new Date()
        
        // Rango de fechas del mes anterior completo
        const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const finMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

        const inicioTs = Math.floor(inicioMesAnterior.getTime() / 1000)
        const finTs = Math.floor(finMesAnterior.getTime() / 1000)

        const q = query(collection(db, 'orders'), where('rated', '==', true))
        const snapshot = await getDocs(q)

        const conteo = {}

        snapshot.forEach(docSnap => {
          const d = docSnap.data()
          const createdTs = d.createdAt?.seconds || 0
          
          // Filtrar estrictamente solo las reseñas dejadas el mes anterior
          if (createdTs < inicioTs || createdTs > finTs) return

          const proId = d.proId || d.professionalId
          if (!proId) return

          if (!conteo[proId]) {
            conteo[proId] = {
              id:           proId,
              nombre:       d.proName || d.professionalName || 'Profesional',
              foto:         d.proPhoto || d.professionalPhoto || d.proPhotoURL || null,
              especialidad: d.proSpecialty || d.specialty || 'Servicios',
              estrellas:    0,
              contratos:    0,
              resenas:      [],
            }
          }
          conteo[proId].estrellas += (d.ratingScore || 5)
          conteo[proId].contratos += 1

          if (d.ratingComment?.trim()) {
            conteo[proId].resenas.push({
              clientName:  d.clientName  || d.reviewerName || 'Cliente',
              clientPhoto: d.clientPhoto || d.reviewerPhoto || null,
              comment:     d.ratingComment,
              score:       d.ratingScore || 5,
            })
          }
        })

        const lista = Object.values(conteo)

        if (lista.length === 0) {
          // Si NADIE en toda la plataforma recibió reseñas el mes pasado,
          // no mostramos el cuadro de Profesional del Mes (es un lujo real).
          setProDelMes(null)
          return
        } else {
          lista.sort((a, b) => b.estrellas - a.estrellas)
          const ganador = lista[0]

          try {
            const userSnap = await getDoc(doc(db, 'users', ganador.id))
            if (userSnap.exists()) {
              const userData = userSnap.data()
              ganador.foto =
                userData.photoURL     ||
                userData.photo        ||
                userData.profilePhoto ||
                userData.avatar       ||
                ganador.foto          ||
                null
            }
          } catch (e) {}

          ganador.avatar = ganador.nombre.substring(0, 2).toUpperCase()
          setProDelMes(ganador)
          setTotalEstrellas(ganador.estrellas)
          setResenas(ganador.resenas.slice(0, 5))
        }
      } catch (e) {
        console.error('Error calculando pro del mes:', e)
      } finally {
        setLoading(false)
      }
    }
    calcularProDelMes()
  }, [])

  useEffect(() => {
    if (resenas.length <= 2) return
    resenaTimer.current = setInterval(() => {
      setResenaIdx(i => (i + 1) % resenas.length)
    }, 3500)
    return () => clearInterval(resenaTimer.current)
  }, [resenas])

  if (loading || !proDelMes) return null

  const avatarBg = avatarColors[
    Array.from(proDelMes.id || 'pro').reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length
  ]
  const clientAvatarBg = (name) =>
    avatarColors[Array.from(name || 'c').reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length]

  const visibles = resenas.length === 0 ? [] :
    [resenas[resenaIdx % resenas.length], resenas[(resenaIdx + 1) % resenas.length]].filter(Boolean)

  return (
    <>
      <style>{`
        @keyframes pdm-shine {
          0%   { left: -80%; }
          100% { left: 130%; }
        }
        @keyframes pdm-crown {
          0%,100% { transform: translateY(0) rotate(-5deg) scale(1); }
          50%      { transform: translateY(-6px) rotate(6deg) scale(1.18); }
        }
        @keyframes pdm-glow {
          0%,100% { box-shadow: 0 6px 28px rgba(255,180,0,0.4), 0 2px 8px rgba(0,0,0,0.1); }
          50%      { box-shadow: 0 10px 40px rgba(255,180,0,0.7), 0 2px 8px rgba(0,0,0,0.1); }
        }
        @keyframes pdm-badge-pop {
          0%  { transform: scale(0.7); opacity: 0; }
          70% { transform: scale(1.1); }
          100%{ transform: scale(1);   opacity: 1; }
        }
        @keyframes pdm-star-spin {
          0%,100% { transform: rotate(0deg) scale(1); }
          50%     { transform: rotate(22deg) scale(1.3); }
        }
        @keyframes pdm-resena-in {
          0%   { opacity: 0; transform: translateX(10px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .pdm-wrapper { margin: 0 16px 20px; border-radius: 20px; overflow: hidden; animation: pdm-glow 2.5s ease-in-out infinite; }
        .pdm-header { background: linear-gradient(135deg, #0f0c29, #1c1c50, #24243e); padding: 11px 16px; display: flex; align-items: center; gap: 8px; position: relative; }
        .pdm-header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #FFD700, #FFA500, #FFD700, transparent); }
        .pdm-crown { font-size: 24px; animation: pdm-crown 2s ease-in-out infinite; filter: drop-shadow(0 0 12px rgba(255,215,0,1)); }
        .pdm-header-text { flex: 1; }
        .pdm-label { font-size: 10px; font-weight: 800; color: #FFD700; text-transform: uppercase; letter-spacing: 0.12em; margin: 0; }
        .pdm-mes { font-size: 14px; font-weight: 800; color: #fff; margin: 0; text-transform: capitalize; }
        .pdm-trophy { font-size: 22px; filter: drop-shadow(0 0 8px rgba(255,215,0,0.9)); }
        .pdm-body { background: linear-gradient(160deg, #fffbf0, #fff8e1); padding: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; position: relative; overflow: hidden; }
        .pdm-shine { position: absolute; top: 0; left: -80%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent); transform: skewX(-15deg); animation: pdm-shine 3.5s ease-in-out infinite; pointer-events: none; }
        .pdm-divider { position: absolute; top: 14px; bottom: 14px; left: 50%; width: 1px; background: linear-gradient(to bottom, transparent, #FFD70055, #FFA50055, transparent); }
        .pdm-left { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 5px; }
        .pdm-photo-wrap { position: relative; margin-bottom: 2px; }
        .pdm-photo { width: 78px; height: 78px; border-radius: 50%; object-fit: cover; border: 3px solid #FFD700; box-shadow: 0 0 0 4px rgba(255,215,0,0.2), 0 4px 16px rgba(255,150,0,0.25); }
        .pdm-avatar { width: 78px; height: 78px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 800; color: #fff; border: 3px solid #FFD700; box-shadow: 0 0 0 4px rgba(255,215,0,0.2), 0 4px 16px rgba(255,150,0,0.25); }
        .pdm-badge { position: absolute; bottom: -2px; right: -2px; background: linear-gradient(135deg, #FFD700, #FFA500); border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid #fff; animation: pdm-badge-pop 0.5s ease-out forwards, pdm-star-spin 3s ease-in-out 0.5s infinite; }
        .pdm-nombre {
          font-size: 14px;
          font-weight: 800;
          color: #1a1a2e;
          margin: 0;
          white-space: normal;
          word-break: break-word;
        }
        .pdm-spec { font-size: 11px; color: #999; margin: 0; }
        .pdm-stars-row { display: flex; align-items: center; gap: 4px; justify-content: center; }
        .pdm-stars { color: #FFD700; font-size: 12px; letter-spacing: 1px; }
        .pdm-star-count { font-size: 11px; font-weight: 800; color: #F26000; background: rgba(242,96,0,0.1); padding: 1px 7px; border-radius: 20px; }
        .pdm-contratos { font-size: 11px; color: #999; margin: 0; }
        .pdm-btn { background: linear-gradient(135deg, #F26000, #C94E00); color: #fff; border: none; border-radius: 22px; padding: 7px 12px; font-size: 12px; font-weight: 800; cursor: pointer; width: 100%; box-shadow: 0 3px 10px rgba(242,96,0,0.3); transition: transform 0.1s; margin-top: 2px; }
        .pdm-btn:active { transform: scale(0.96); }
        .pdm-right { display: flex; flex-direction: column; gap: 6px; overflow: hidden; }
        .pdm-resenas-title { font-size: 11px; font-weight: 800; color: #1a1a2e; text-transform: uppercase; letter-spacing: 0.06em; margin: 0; }
        .pdm-resena-card { background: #fff; border-radius: 10px; padding: 8px 9px; border-left: 3px solid #FFD700; box-shadow: 0 2px 8px rgba(0,0,0,0.05); animation: pdm-resena-in 0.35s ease-out forwards; display: flex; gap: 7px; align-items: flex-start; }
        .pdm-client-photo { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid #FFD700; }
        .pdm-client-avatar { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; flex-shrink: 0; border: 2px solid #FFD700; }
        .pdm-resena-content { flex: 1; min-width: 0; }
        .pdm-client-name {
          font-size: 11px;
          font-weight: 800;
          color: #1a1a2e;
          margin: 0 0 1px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: normal;
          word-break: break-word;
        }
        .pdm-resena-stars { color: #FFD700; font-size: 9px; letter-spacing: 0.5px; }
        .pdm-resena-text { font-size: 10px; color: #666; margin: 2px 0 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pdm-resena-empty { font-size: 11px; color: #bbb; text-align: center; padding: 16px 4px; }
        .pdm-dots { display: flex; gap: 4px; justify-content: center; margin-top: 2px; }
        .pdm-dot { width: 5px; height: 5px; border-radius: 50%; background: #ddd; border: none; padding: 0; cursor: pointer; transition: background 0.2s, transform 0.2s; }
        .pdm-dot.active { background: #FFD700; transform: scale(1.3); }
      `}</style>

      <div className="pdm-wrapper">
        <div className="pdm-header">
          <span className="pdm-crown">👑</span>
          <div className="pdm-header-text">
            <p className="pdm-label">{lang === 'es' ? 'Profesional del Mes' : 'Professional of the Month'}</p>
            <p className="pdm-mes">{mes}</p>
          </div>
          <span className="pdm-trophy">🏆</span>
        </div>

        <div className="pdm-body">
          <div className="pdm-shine" />
          <div className="pdm-divider" />

          <div className="pdm-left">
            <div className="pdm-photo-wrap">
              {proDelMes.foto
                ? <img src={proDelMes.foto} alt={proDelMes.nombre} className="pdm-photo" />
                : <div className="pdm-avatar" style={{ background: avatarBg }}>{proDelMes.avatar}</div>
              }
              <span className="pdm-badge">⭐</span>
            </div>
            <p className="pdm-nombre">{proDelMes.nombre}</p>
            <p className="pdm-spec">
              {(() => {
                const specStr = (proDelMes.especialidad || '').toLowerCase();
                const subCat = ALL_SUBCATEGORIES.find(s => s.id === specStr || s.labelEs?.toLowerCase() === specStr);
                const mainCat = CATEGORIES.find(c => c.id === specStr || c.labelEs?.toLowerCase() === specStr);
                const imgUrl = subCat?.image || mainCat?.image;
                if (imgUrl) return <img src={imgUrl} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '4px' }} />;
                return subCat?.icon || mainCat?.icon || '🔧 ';
              })()}
              {proDelMes.especialidad}
            </p>
            <div className="pdm-stars-row">
              <span className="pdm-stars">★★★★★</span>
              <span className="pdm-star-count">{totalEstrellas}⭐</span>
            </div>
            <p className="pdm-contratos">
              ✅ {proDelMes.contratos} {lang === 'es' ? 'contratos' : 'contracts'}
            </p>
            <button className="pdm-btn" onClick={() => navigate('booking', proDelMes)}>
              {lang === 'es' ? '🤝 Contratar' : '🤝 Hire'}
            </button>
          </div>

          <div className="pdm-right">
            <p className="pdm-resenas-title">
              {lang === 'es' ? '💬 Lo que dicen' : '💬 Reviews'}
            </p>

            {resenas.length === 0 ? (
              <div className="pdm-resena-empty">
                {lang === 'es' ? 'Sin reseñas aún este mes' : 'No reviews yet this month'}
              </div>
            ) : (
              <>
                {visibles.map((r, i) => (
                  <div key={`${resenaIdx}-${i}`} className="pdm-resena-card">
                    {r.clientPhoto
                      ? <img src={r.clientPhoto} alt={r.clientName} className="pdm-client-photo" />
                      : <div className="pdm-client-avatar" style={{ background: clientAvatarBg(r.clientName) }}>
                          {(r.clientName || 'C').charAt(0).toUpperCase()}
                        </div>
                    }
                    <div className="pdm-resena-content">
                      <p className="pdm-client-name">{r.clientName}</p>
                      <div className="pdm-resena-stars">
                        {'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}
                      </div>
                      <p className="pdm-resena-text">"{r.comment}"</p>
                    </div>
                  </div>
                ))}

                {resenas.length > 2 && (
                  <div className="pdm-dots">
                    {resenas.map((_, i) => (
                      <button
                        key={i}
                        className={`pdm-dot${i === resenaIdx % resenas.length ? ' active' : ''}`}
                        onClick={() => {
                          clearInterval(resenaTimer.current)
                          setResenaIdx(i)
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function SearchPage({ lang = 'es', navigate, initialCategory = 'all', initialProvince = 'all', userRole = 'client', userData }) {
  const [activeCategory,    setActiveCategory]    = useState(initialCategory || 'all')
  const [activeSubcategory, setActiveSubcategory] = useState('all')
  const [openCategory,      setOpenCategory]      = useState(null)
  const [activeProvince,    setActiveProvince]    = useState(initialProvince || 'all')
  const [showPlanModal,     setShowPlanModal]     = useState(false)
  const [showEstimadorModal, setShowEstimadorModal] = useState(false)
  const [showSolicitudExpress, setShowSolicitudExpress] = useState(false)
  const [showCalcModal,     setShowCalcModal]     = useState(false)
  const [viewMode,           setViewMode]          = useState('list') // 'list' | 'map'
  
  // Hook para historias de 24h activas en tiempo real
  const { stories: allStories, getProStoryData } = useStories()
  const [storyViewerOpen, setStoryViewerOpen] = useState(false)
  const [activeStoryIndex, setActiveStoryIndex] = useState(0)

  const handleOpenStoryViewer = (index) => {
    setActiveStoryIndex(index)
    setStoryViewerOpen(true)
  }
  
  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory)
    }
    if (initialProvince) {
      setActiveProvince(initialProvince)
    }
  }, [initialCategory, initialProvince])
  const [search,            setSearch]            = useState('')
  const [quickFilter,       setQuickFilter]       = useState('all')
  const [sortBy,            setSortBy]            = useState('all')
  const [professionals,     setProfessionals]     = useState([])
  const [loading,           setLoading]           = useState(true)

  const [likedPros, setLikedPros] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('listo_liked_pros') || '{}')
    } catch {
      return {}
    }
  })
  const [sharingPro, setSharingPro] = useState(null)
  const [showCopyAlert, setShowCopyAlert] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)

  const handleShare = async (pro, e) => {
    e.stopPropagation()
    const shareText = lang === 'es'
      ? `¡Te recomiendo a ${pro.name} (${pro.category}) en Listo!`
      : `I recommend ${pro.name} (${pro.category}) on Listo!`
    const shareUrl = `${window.location.origin}/proProfile/${pro.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Listo App',
          text: `${shareText}\n`,
          url: shareUrl
        })
      } catch (err) {
        console.log('Share failed or cancelled:', err)
      }
    } else {
      const fullText = `${shareText} Contrátalo aquí: ${shareUrl}`
      if (navigator.clipboard) {
        navigator.clipboard.writeText(fullText)
          .then(() => {
            setToastMessage(lang === 'es' ? '¡Enlace de perfil copiado!' : 'Profile link copied!')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
          })
          .catch(err => {
            console.error('Could not copy text: ', err)
          })
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = fullText
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          setToastMessage(lang === 'es' ? '¡Enlace de perfil copiado!' : 'Profile link copied!')
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
        } catch (err) {
          console.error('Fallback copy failed: ', err)
        }
        document.body.removeChild(textArea)
      }
    }
  }

  const toggleLike = (proId, e) => {
    e.stopPropagation()
    setLikedPros(prev => {
      const isNowLiked = !prev[proId]
      const next = { ...prev, [proId]: isNowLiked }
      localStorage.setItem('listo_liked_pros', JSON.stringify(next))

      if (isNowLiked) {
        try {
          const proObj = (prosToDisplay || []).find(p => (p.id || p.uid) === proId) || {}
          const cName = userData?.name || userData?.displayName || 'Un cliente'
          const pName = proObj.nameEs || proObj.name || proObj.nameEn || 'un profesional'
          const sEs   = proObj.specEs || proObj.category || 'Servicio'
          const cty   = userData?.ciudad || userData?.municipio || proObj.location || 'Santo Domingo'

          addDoc(collection(db, 'likes'), {
            clientName: cName,
            proId: proId,
            proName: pName,
            specEs: sEs,
            city: cty,
            createdAt: serverTimestamp()
          }).catch(err => console.log('Error adding like doc:', err))
        } catch (err) {
          console.log('Error logging like:', err)
        }
      }

      return next
    })
  }

  const getLikeCount = (pro) => {
    const proId = pro.id || pro.uid || ''
    const seed = Array.from(proId).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const baseLikes = ((seed % 40) + 12) + (pro.reviews || 0) * 8
    return likedPros[proId] ? baseLikes + 1 : baseLikes
  }

  const T = txt[lang]

  const searchPlaceholders = lang === 'es' 
    ? ['¿Buscas a un plomero?', '¿Necesitas un electricista?', 'O quizás un mecánico...', 'Encuentra soluciones aquí'] 
    : ['Looking for a plumber?', 'Need an electrician?', 'Maybe a mechanic...', 'Find solutions here'];
  const [phIdx, setPhIdx] = useState(0);
  const [prevPhIdx, setPrevPhIdx] = useState(null);

  useEffect(() => {
    const t = setInterval(() => {
      setPhIdx(curr => {
        setPrevPhIdx(curr);
        return (curr + 1) % searchPlaceholders.length;
      });
    }, 3500);
    return () => clearInterval(t);
  }, [lang, searchPlaceholders.length]);

  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true)
      try {
        const isProComplete = (d) => {
          if (!d) return false;
          const vf = d.verificacion || {};
          const vfDocs = vf.docs || {};
          const hasFront = Boolean(vfDocs.cedulaFrontal || d.cedulaFrontal);
          const hasBack  = Boolean(vfDocs.cedulaTrasera || d.cedulaTrasera);
          const hasSelfie = Boolean(vfDocs.selfie || d.selfie);
          const hasConducta = Boolean(vfDocs.buenaConducta || d.buenaConducta);
          const hasProf = Boolean(d.category || vf.especialidad || d.especialidad);
          const hasAllDocs = hasFront && hasBack && hasSelfie && hasConducta && hasProf;
          const isApproved = vf.estado === 'aprobada' || vf.estado === 'verificado' || d.approved === true;
          return Boolean(hasAllDocs && isApproved);
        };

        const q = query(collection(db, 'users'), where('type', '==', 'pro'))
        const querySnapshot = await getDocs(q)
        const prosList = []
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data()

          // ─ Filtro estricto: Solo mostrar si completó el perfil y tiene plan activo o contratos
          const isComplete = isProComplete(data)
          const hasPlan = Boolean(data.planStatus === 'active')
          const hasContracts = Boolean(data.contracts && data.contracts > 0)
          if (!isComplete || (!hasPlan && !hasContracts)) return;

          const reviewsCount = Number(data.reviews || data.reviewsCount || data.numReviews || 0);
          const realRating = reviewsCount > 0 ? Number(data.rating || 0) : 0.0;

          prosList.push({
            id:         docSnap.id,
            name:       data.name       || 'Sin nombre',
            category:   data.category   || data.especialidad || data.verificacion?.especialidad || '',
            rating:     realRating,
            reviews:    reviewsCount,
            location:   data.verificacion?.municipio || data.verificacion?.provincia || data.city || data.location || 'República Dominicana',
            experience: data.experience || '1 año',
            avatar:     (data.name || 'P').substring(0, 2).toUpperCase(),
            available:  data.available !== false,
            photoURL:   data.photoURL   || null,
            phone:      data.phone      || null,
            currentPlan: data.currentPlan || data.planId || data.plan || 'basico',
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
      setActiveCategory('all'); setActiveSubcategory('all'); setOpenCategory(null); return
    }
    if (openCategory === catId) { setOpenCategory(null) }
    else { setOpenCategory(catId); setActiveCategory(catId); setActiveSubcategory('all') }
  }

  const handleSubcategoryClick = (subId) => { setActiveSubcategory(subId); setOpenCategory(null) }

  const getMappedProCatId = (catString) => {
    if (!catString) return 'all'
    const cleanStr = catString.toLowerCase()
    const allSubs = CATEGORIES.flatMap(c => c.subcategories)
    const foundSub = allSubs.find(s => s.id === cleanStr || s.labelEn.toLowerCase() === cleanStr)
    if (foundSub) return foundSub.id
    const foundMain = CATEGORIES.find(c => c.id === cleanStr || c.labelEn.toLowerCase() === cleanStr)
    if (foundMain) return foundMain.id
    return catString
  }

  const currentCat = CATEGORIES.find(c => c.id === activeCategory)

  const filtered = professionals
    .filter(p => {
      if (userData?.blockedUsers?.includes(p.id)) return false
      
      const mappedCat  = getMappedProCatId(p.category)
      const isSubInMain = currentCat && currentCat.subcategories.some(s => s.id === mappedCat)
      const matchCat   = activeCategory === 'all' || mappedCat === activeCategory || mappedCat === activeSubcategory || isSubInMain
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase())
      
      const matchProvince = activeProvince === 'all' || 
        p.location.toLowerCase().includes(activeProvince.toLowerCase()) ||
        (p.verificacion?.provincia && p.verificacion.provincia.toLowerCase().includes(activeProvince.toLowerCase())) ||
        (p.verificacion?.municipio && p.verificacion.municipio.toLowerCase().includes(activeProvince.toLowerCase()))
      
      let matchPill = true
      if (quickFilter === 'available') matchPill = p.available === true
      if (quickFilter === 'topRated' || quickFilter === 'stars45') matchPill = Number(p.rating || 0) >= 4.5
      if (quickFilter === 'premium') matchPill = (p.currentPlan || '').toLowerCase().includes('vip') || (p.currentPlan || '').toLowerCase().includes('platinum') || (p.currentPlan || '').toLowerCase().includes('elite')

      return matchCat && matchSearch && matchPill && matchProvince
    })
    .sort((a, b) => {
      if (quickFilter === 'mostHired' || sortBy === 'mostHired') {
        const jobsA = (a.contractsUsed || 0) + (a.reviews || 0)
        const jobsB = (b.contractsUsed || 0) + (b.reviews || 0)
        return jobsB - jobsA
      }
      if (quickFilter === 'stars45' || quickFilter === 'topRated' || sortBy === 'topRated') {
        return (b.rating || 0) - (a.rating || 0)
      }
      if (quickFilter === 'nearest' || sortBy === 'nearest') {
        if (activeProvince !== 'all') {
          const matchA = a.location.toLowerCase().includes(activeProvince.toLowerCase()) ? 1 : 0
          const matchB = b.location.toLowerCase().includes(activeProvince.toLowerCase()) ? 1 : 0
          if (matchA !== matchB) return matchB - matchA
        }
        return a.location.localeCompare(b.location)
      }
      return (b.rating || 0) - (a.rating || 0)
    })

  const vipProsList = professionals
    .filter(p => isProVip(p) && Number(p.reviews || 0) > 0 && Number(p.rating || 0) >= 4.9)
    .map(p => ({
      ...p,
      nameEs: p.name,
      nameEn: p.name,
      specEs: p.category,
      specEn: p.category,
      img: p.photoURL || p.img
    }))

  return (
    <div className="services-page">

      <div className="search-header">
        <h1 className="search-title">{T.title}</h1>
        <div className="search-bar" style={{ position: 'relative' }}>
          <span className="search-icon">🔍</span>
          {search.length === 0 && (
            <div className="search-placeholder-container">
              {prevPhIdx !== null && prevPhIdx !== phIdx && (
                <span className="search-placeholder-text slide-out" key={`out-${prevPhIdx}`}>
                  {searchPlaceholders[prevPhIdx]}
                </span>
              )}
              <span className="search-placeholder-text slide-in" key={`in-${phIdx}`}>
                {searchPlaceholders[phIdx]}
              </span>
            </div>
          )}
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} style={{ zIndex: 2 }} />
          {search && <button className="search-clear" onClick={() => setSearch('')} style={{ zIndex: 3 }}>✕</button>}
        </div>
      </div>

      {/* ── CARRUSEL DE HISTORIAS DE TRABAJOS REALIZADOS (STORIES 24H) ── */}
      <HistoriasCarrusel 
        userData={userData} 
        isPro={userRole === 'pro'} 
        onHirePro={(proId) => { 
          const proObj = (professionals || []).find(p => p.id === proId) || { id: proId }; 
          navigate('proProfile', proObj); 
        }} 
      />

      {/* ── CARRUSEL ÉPICO VIP DE PROFESIONALES DESTACADOS (ENCIMA DEL CUADRO MAMEY) ── */}
      <VIPSection 
        realVipPros={vipProsList} 
        lang={lang} 
        navigate={navigate} 
        sectionTitle={lang === 'es' ? '👑 NUESTROS VIP' : '👑 OUR VIPs'}
        sectionSub={lang === 'es' ? 'Profesionales preparados para cumplir todas tus necesidades' : 'Professionals ready to fulfill all your needs'}
        showSeeAll={false}
        strictVipOnly={true}
        getProStoryData={getProStoryData}
        onOpenStory={handleOpenStoryViewer}
      />

      <PromoBanner lang={lang} userRole={userRole} />
      <ProDelMes lang={lang} navigate={navigate} userRole={userRole} />

      {/* ── ALERTA INTELIGENTE DE PLAN Y CONTRATOS PARA PROFESIONALES ── */}
      <ProPlanAlertWidget userData={userData} onOpenPlanModal={() => setShowPlanModal(true)} />

      <div className="pill-filters" style={{ display: 'flex', gap: '8px', overflowX: 'auto', alignItems: 'center' }}>
        <button className={`pill-btn ${quickFilter === 'all' ? 'active' : ''}`} onClick={() => setQuickFilter('all')}>
          🌐 {lang === 'es' ? 'Todos' : 'All'}
        </button>
        <button className={`pill-btn ${quickFilter === 'stars45' ? 'active' : ''}`} onClick={() => setQuickFilter('stars45')}>
          🌟 {lang === 'es' ? '4.5+ Estrellas' : '4.5+ Stars'}
        </button>
        <button className={`pill-btn ${quickFilter === 'mostHired' ? 'active' : ''}`} onClick={() => setQuickFilter('mostHired')}>
          🔥 {lang === 'es' ? 'Más contratados' : 'Most hired'}
        </button>
        <button className={`pill-btn ${quickFilter === 'nearest' ? 'active' : ''}`} onClick={() => setQuickFilter('nearest')}>
          📍 {lang === 'es' ? 'Más cercanos' : 'Nearest'}
        </button>
        <button className={`pill-btn ${quickFilter === 'available' ? 'active' : ''}`} onClick={() => setQuickFilter('available')}>
          ⚡ {lang === 'es' ? 'Disponibles' : 'Available'}
        </button>
        <button className={`pill-btn ${quickFilter === 'premium' ? 'active' : ''}`} onClick={() => setQuickFilter('premium')}>
          💎 {lang === 'es' ? 'Premium' : 'Premium'}
        </button>
        <button className="pill-btn" onClick={() => setShowEstimadorModal(true)} style={{ background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0', fontWeight: '800' }}>
          📊 {lang === 'es' ? 'Precios RD$' : 'RD$ Prices'}
        </button>
        <button className="pill-btn" onClick={() => setShowCalcModal(true)} style={{ background: '#F0FDF4', color: '#059669', borderColor: '#BBF7D0', fontWeight: '900' }}>
          🧰 {lang === 'es' ? 'Calculadora RD$' : 'Calculator RD$'}
        </button>
        <button className="pill-btn" onClick={() => setShowSolicitudExpress(true)} style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', color: '#C2410C', borderColor: '#FDBA74', fontWeight: '900' }}>
          ⚡ {lang === 'es' ? 'Cotización Flash' : 'Flash Quote'}
        </button>
        <button className="pill-btn" onClick={() => setViewMode(v => v === 'list' ? 'map' : 'list')} style={{ background: viewMode==='map' ? '#F26000' : '#1E293B', color: '#fff', border: 'none', fontWeight: '800' }}>
          {viewMode === 'list' ? '🗺️ Mapa GPS' : '📋 Lista'}
        </button>
      </div>

      {/* ── FILTRO POR PROVINCIA Y SECTOR (UBICACIÓN EXACTA) ── */}
      <div className="province-filters-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px 14px', scrollbarWidth: 'none' }}>
        {PROVINCES_LIST.map(prov => (
          <button 
            key={prov.id} 
            className={`pill-btn ${activeProvince === prov.id ? 'active' : ''}`}
            onClick={() => setActiveProvince(prov.id)}
            style={{
              whiteSpace: 'nowrap',
              padding: '7px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '800',
              border: activeProvince === prov.id ? 'none' : '1.5px solid #E2E8F0',
              background: activeProvince === prov.id ? '#1E293B' : '#FFFFFF',
              color: activeProvince === prov.id ? '#FFFFFF' : '#475569',
              boxShadow: activeProvince === prov.id ? '0 4px 12px rgba(30, 41, 59, 0.25)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            {lang === 'es' ? prov.labelEs : prov.labelEn}
          </button>
        ))}
      </div>

      <div className="categories-wrapper">
        <div className="categories-scroll">
          <button className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => handleCategoryClick('all')}>
            <span className="cat-icon">✦</span> {T.allCats}
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat.id} className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => handleCategoryClick(cat.id)}>
              <span className="cat-icon">
                {cat.image ? <img src={cat.image} alt={cat.labelEs} style={{ width: '16px', height: '16px', objectFit: 'contain', verticalAlign: 'middle' }} /> : cat.icon}
              </span>
              {lang === 'es' ? cat.labelEs : cat.labelEn}
            </button>
          ))}
        </div>
        {currentCat && currentCat.subcategories && currentCat.subcategories.length > 0 && (
          <div className="subcategories-scroll">
            <button className={`sub-pill ${activeSubcategory === 'all' ? 'active' : ''}`} onClick={() => handleSubcategoryClick('all')}>
              ✓ Todas en {lang === 'es' ? currentCat.labelEs : currentCat.labelEn}
            </button>
            {currentCat.subcategories.map(sub => (
              <button key={sub.id} className={`sub-pill ${activeSubcategory === sub.id ? 'active' : ''}`} onClick={() => handleSubcategoryClick(sub.id)}>
                <span>{sub.image ? <img src={sub.image} alt={sub.labelEs} style={{ width: '16px', height: '16px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '4px' }} /> : sub.icon}</span> {lang === 'es' ? sub.labelEs : sub.labelEn}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="results-bar">
        {!loading && <span className="results-count">{filtered.length} {T.results}</span>}
      </div>

      {viewMode === 'map' ? (
        <div style={{ margin: '0 16px 20px', height: '450px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', border: '2px solid #F26000' }}>
          <MapContainer center={[18.7357, -70.1627]} zoom={9} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filtered.map(pro => {
              const lat = pro.coords?.lat || 18.4861 + (Math.random() * 0.1 - 0.05)
              const lng = pro.coords?.lng || -69.9312 + (Math.random() * 0.1 - 0.05)
              return (
                <Marker key={pro.id} position={[lat, lng]} icon={customProIcon}>
                  <Popup>
                    <div style={{ textAlign: 'center', padding: '6px' }}>
                      <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '800', color: '#1A1A2E' }}>{pro.name}</h4>
                      <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#F26000', fontWeight: '700' }}>{pro.category}</p>
                      <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#64748B' }}>📍 {pro.location}</p>
                      <button 
                        onClick={() => navigate('proProfile', pro)}
                        style={{ background: '#F26000', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        Ver Perfil →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      ) : loading ? (
        <div className="professionals-grid">
          {[1,2,3,4,5,6,7,8].map(n => (
            <div key={n} className="skeleton-card pro-card-skel">
              <div className="sk-photo" />
              <div className="sk-body-vertical">
                <div className="sk-line w-80" />
                <div className="sk-line w-50" />
                <div className="sk-line w-60 mt-2" />
                <div className="sk-line w-100 mt-auto" style={{ height: '36px', borderRadius: '12px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="professionals-grid">
          {filtered.map((pro, i) => {
          const mappedCat = getMappedProCatId(pro.category)
          const allSubs   = CATEGORIES.flatMap(c => c.subcategories)
          const subCat    = allSubs.find(s => s.id === mappedCat)
          const mainCat   = CATEGORIES.find(c => c.id === mappedCat || c.subcategories.some(s => s.id === mappedCat))
          const isTopRated = Number(pro.rating || 0) >= 4.8;
          
          const planStr = (pro.currentPlan || '').toLowerCase()
          const isVip = planStr.includes('vip') || planStr.includes('elite') || planStr.includes('ilimitado')
          const isPlatinum = planStr.includes('platinum') || planStr.includes('platino')
          const isPremium = isVip || isPlatinum

          if (isPremium) {
            const sData = getProStoryData(pro)
            const hasStory = Boolean(sData && sData.stories && sData.stories.length > 0)

            return (
              <div key={pro.id} className="pro-card-premium" style={{ animationDelay:`${i * 0.06}s` }} onClick={() => navigate('proProfile', pro)}>
                <div className="premium-photo-wrap" style={{ position: 'relative' }}>
                  {isPlatinum && <div className="premium-badges-top">
                    <span className="premium-amz-badge" style={{background: 'linear-gradient(135deg, #B0BEC5, #78909C)'}}>💎 Selección Platinum</span>
                    <span className="premium-amz-badge badge-urgent" style={{background: '#E11D48'}}>🔥 Alta demanda</span>
                  </div>}
                  {isVip && <div className="premium-badges-top">
                    <span className="premium-amz-badge" style={{background: 'linear-gradient(135deg, #FF6B00, #FF3D00)'}}>✨ Exclusivo VIP</span>
                    <span className="premium-amz-badge badge-urgent" style={{background: '#E11D48'}}>⚡ Responde al instante</span>
                  </div>}
                  
                  <img 
                    src={pro.photoURL || pro.img} 
                    alt={pro.name} 
                    className="premium-photo" 
                  />

                  {hasStory && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 12,
                        filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))'
                      }}
                    >
                      <StoryAvatar 
                        pro={pro}
                        src={pro.photoURL || pro.img}
                        alt={pro.name}
                        size={110}
                        storyData={sData}
                        onOpenStory={handleOpenStoryViewer}
                        fallbackAvatar={pro.avatar || (pro.name || 'P').charAt(0)}
                      />
                    </div>
                  )}

                  {pro.rating && pro.rating > 0 && pro.reviews > 0 && (
                    <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(26, 26, 46, 0.85)', backdropFilter: 'blur(4px)', borderRadius: '8px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', border: '1.5px solid #FFD700', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', zIndex: 10 }}>
                      <span style={{ fontSize: '11px', color: '#FFD700', fontWeight: 'bold' }}>⭐</span>
                      <span style={{ fontSize: '11px', color: 'white', fontWeight: '900' }}>{Number(pro.rating).toFixed(1)}</span>
                    </div>
                  )}
                  <span className={`status-badge ${pro.available ? 'avail' : 'busy'}`} style={{ bottom: '16px', fontSize: '12px', padding: '6px 14px' }}>
                    {pro.available ? T.available : T.busy}
                  </span>
                </div>
                <div className="card-interaction-row" onClick={(e) => e.stopPropagation()}>
                  <button className={`interaction-btn ${likedPros[pro.id] ? 'active' : ''}`} onClick={(e) => toggleLike(pro.id, e)}>
                    <img src={recomendarIcon} alt="Recomendar" className="interaction-icon" />
                    <span className="interaction-label">{lang === 'es' ? 'Recomendar' : 'Recommend'} {getLikeCount(pro) > 0 && `(${getLikeCount(pro)})`}</span>
                  </button>
                  <button className="interaction-btn" onClick={(e) => { e.stopPropagation(); navigate('proProfile', { ...pro, autoWriteReview: true }); }}>
                    <img src={opinionesIcon} alt="Opiniones" className="interaction-icon" />
                    <span className="interaction-label">{lang === 'es' ? 'Opiniones' : 'Reviews'}</span>
                  </button>
                  <button className="interaction-btn" onClick={(e) => handleShare(pro, e)}>
                    <img src={compartirIcon} alt="Compartir" className="interaction-icon" />
                    <span className="interaction-label">{lang === 'es' ? 'Compartir' : 'Share'}</span>
                  </button>
                </div>
                
                <div className="premium-title-row">
                  <div>
                    <h3 className="premium-name">{pro.name}</h3>
                    <p className="premium-cat">
                      {(subCat?.image || mainCat?.image) ? <img src={subCat?.image || mainCat?.image} style={{ width: '16px', height: '16px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '4px' }} alt="" /> : (subCat?.icon || mainCat?.icon || '🔧')} 
                      {lang === 'es' ? (subCat?.labelEs || mainCat?.labelEs || pro.category) : (subCat?.labelEn || mainCat?.labelEn || pro.category)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="pro-location" style={{ margin: 0, fontSize: '13px' }}>📍 {pro.location}</p>
                    <p style={{ margin: '6px 0 0', color: '#B12704', fontWeight: '900', fontSize: '15px' }}>{lang === 'es' ? 'Precios a convenir' : 'Fixed prices'}</p>
                  </div>
                </div>

                <div className="premium-rating-row">
                  <span className="premium-stars">{'★'.repeat(Math.round(pro.rating || 0))}{'☆'.repeat(5 - Math.round(pro.rating || 0))}</span>
                  <span className="premium-rating-text">{Number(pro.rating || 0).toFixed(1)} ({pro.reviews || 0} {lang==='es'?'valoraciones':'ratings'})</span>
                </div>

                <div className="premium-stats">
                  <p>🔥 {pro.contracts || 0} <span>{lang==='es'?'contratados el mes pasado':'hired last month'}</span></p>
                </div>

                {pro.reviews > 0 && (
                  <div className="premium-review-box">
                    <span className="premium-quote-icon">💬</span>
                    <p className="premium-review-text">
                      <strong>¡Excelente trabajo!</strong> "El mejor {lang==='es' ? (subCat?.labelEs || mainCat?.labelEs || pro.category) : 'profesional'} que he contratado."
                    </p>
                  </div>
                )}

                <div className="premium-actions">
                  <button className="premium-btn-profile" onClick={(e) => { e.stopPropagation(); navigate('proProfile', pro); }}>
                    👤 {T.profile}
                  </button>
                  <button className="premium-btn-book" onClick={(e) => { e.stopPropagation(); navigate('booking', pro); }} style={{ background: isVip ? 'linear-gradient(135deg, #FF6B00, #FF3D00)' : 'linear-gradient(135deg, #B0BEC5, #78909C)', boxShadow: isVip ? '0 4px 15px rgba(255, 107, 0, 0.4)' : '0 4px 15px rgba(120, 144, 156, 0.4)' }}>
                    {isVip ? '✨' : '💎'} {lang === 'es' ? 'Contratar' : 'Hire'}
                  </button>
                </div>
              </div>
            )
          }

          const sDataStd = getProStoryData(pro)
          const hasStoryStd = Boolean(sDataStd && sDataStd.stories && sDataStd.stories.length > 0)

          return (
            <div key={pro.id} className={`pro-card ${isTopRated ? 'top-rated' : ''}`} style={{ animationDelay:`${i * 0.06}s` }}>
              <div className="card-photo" style={{ position: 'relative' }}>
                <img 
                  src={pro.photoURL || pro.img} 
                  alt={pro.name} 
                  className="pro-photo" 
                />

                {hasStoryStd && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 5,
                      filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
                    }}
                  >
                    <StoryAvatar 
                      pro={pro}
                      src={pro.photoURL || pro.img}
                      alt={pro.name}
                      size={76}
                      storyData={sDataStd}
                      onOpenStory={handleOpenStoryViewer}
                      fallbackAvatar={pro.avatar || (pro.name || 'P').charAt(0)}
                    />
                  </div>
                )}

                {pro.rating && pro.rating > 0 && pro.reviews > 0 && (
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(26, 26, 46, 0.85)', backdropFilter: 'blur(4px)', borderRadius: '8px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', border: '1.5px solid #FFD700', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', zIndex: 10 }}>
                    <span style={{ fontSize: '11px', color: '#FFD700', fontWeight: 'bold' }}>⭐</span>
                    <span style={{ fontSize: '11px', color: 'white', fontWeight: '900' }}>{Number(pro.rating).toFixed(1)}</span>
                  </div>
                )}
                <span className={`status-badge ${pro.available ? 'avail' : 'busy'}`}>
                  {pro.available ? T.available : T.busy}
                </span>
              </div>
              <div className="card-interaction-row" onClick={(e) => e.stopPropagation()}>
                <button className={`interaction-btn ${likedPros[pro.id] ? 'active' : ''}`} onClick={(e) => toggleLike(pro.id, e)}>
                  <img src={recomendarIcon} alt="Recomendar" className="interaction-icon" />
                  <span className="interaction-label">{lang === 'es' ? 'Recomendar' : 'Recommend'} {getLikeCount(pro) > 0 && `(${getLikeCount(pro)})`}</span>
                </button>
                <button className="interaction-btn" onClick={(e) => { e.stopPropagation(); navigate('proProfile', { ...pro, autoWriteReview: true }); }}>
                  <img src={opinionesIcon} alt="Opiniones" className="interaction-icon" />
                  <span className="interaction-label">{lang === 'es' ? 'Opiniones' : 'Reviews'}</span>
                </button>
                <button className="interaction-btn" onClick={(e) => handleShare(pro, e)}>
                  <img src={compartirIcon} alt="Compartir" className="interaction-icon" />
                  <span className="interaction-label">{lang === 'es' ? 'Compartir' : 'Share'}</span>
                </button>
              </div>
              <div className="card-body">
                <h3 className="pro-name">{pro.name}</h3>
                <p className="pro-cat">
                  {(subCat?.image || mainCat?.image) ? <img src={subCat?.image || mainCat?.image} style={{ width: '16px', height: '16px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '4px' }} alt="" /> : (subCat?.icon || mainCat?.icon || '🔧')}{' '}
                  {lang === 'es' ? (subCat?.labelEs || mainCat?.labelEs || pro.category) : (subCat?.labelEn || mainCat?.labelEn || pro.category)}
                  {(() => {
                    const planStr = (pro.currentPlan || '').toLowerCase();
                    if (planStr.includes('vip') || planStr.includes('elite') || planStr.includes('ilimitado')) return <span style={{marginLeft: '6px', fontSize: '10px', textTransform: 'uppercase', background: 'linear-gradient(135deg, #FF6B00, #FF3D00)', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: '900', boxShadow: '0 2px 8px rgba(255,107,0,0.4)', textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>✨ VIP</span>;
                    if (planStr.includes('gold')) return <span style={{marginLeft: '6px', fontSize: '10px', textTransform: 'uppercase', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a1a2e', padding: '2px 8px', borderRadius: '6px', fontWeight: '900', boxShadow: '0 2px 8px rgba(255,215,0,0.4)'}}>⭐ GOLD</span>;
                    if (planStr.includes('platinum') || planStr.includes('platino')) return <span style={{marginLeft: '6px', fontSize: '10px', textTransform: 'uppercase', background: 'linear-gradient(135deg, #B0BEC5, #78909C)', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: '900', boxShadow: '0 2px 8px rgba(120,144,156,0.4)'}}>💎 PLATINUM</span>;
                    return null;
                  })()}
                </p>
                <p className="pro-location">📍 {pro.location}</p>
                <div className="pro-meta">
                  <span className="pro-rating">★ {Number(pro.rating || 0).toFixed(1)} <em>({pro.reviews || 0} {T.reviews})</em></span>
                  <span className="pro-exp">⏱ {pro.experience || 'Nuevo'}</span>
                </div>
              </div>
              <div className="card-footer">
                <span className="pro-exp-badge" style={{ color:'#666', fontSize:'13px', fontWeight:'600', padding:'4px 8px', background:'#eee', borderRadius:'6px' }}>
                  🤝 Precio a convenir
                </span>
                <div className="card-actions">
                  <button className="btn-profile" onClick={() => navigate('proProfile', pro)}>👤 {T.profile}</button>
                  {(() => {
                    const plan = (pro.currentPlan || '').toLowerCase();
                    const isGold = plan.includes('gold');
                    const isPlatinum = plan.includes('platinum') || plan.includes('platino');
                    const isVip = plan.includes('vip') || plan.includes('elite') || plan.includes('ilimitado');

                    let btnClass = 'btn-book';
                    let btnIcon = '';
                    if (isVip) {
                      btnClass += ' vip-plan';
                      btnIcon = <span className="anim-icon">💎</span>;
                    } else if (isPlatinum) {
                      btnClass += ' platinum-plan';
                      btnIcon = <span className="anim-icon">💎</span>;
                    } else if (isGold) {
                      btnClass += ' gold-plan';
                      btnIcon = <span className="anim-icon">⭐</span>;
                    }
                    
                    return (
                      <button className={btnClass} onClick={() => navigate('booking', pro)}>
                        {btnIcon && <span style={{marginRight: '4px'}}>{btnIcon}</span>}
                        {T.book}
                      </button>
                    )
                  })()}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state"><span>🔍</span><p>{T.empty}</p></div>
      )}

      {showToast && (
        <div className="toast-notification">
          <span>📋</span> {toastMessage}
        </div>
      )}

      <div style={{ height: 80 }} />

      {/* Modal de Renovación de Plan para Profesional */}
      <PlanSelectionModal 
        isOpen={showPlanModal} 
        onClose={() => setShowPlanModal(false)} 
        proInfo={userData} 
      />

      {/* Modal de Estimador de Precios en RD$ */}
      <EstimadorPreciosModal 
        isOpen={showEstimadorModal} 
        onClose={() => setShowEstimadorModal(false)} 
        lang={lang}
        onSelectCategory={(cat) => setSearch(cat)}
      />

      {/* Modal de Solicitud Cotización Flash 3 Pasos */}
      {showSolicitudExpress && (
        <SolicitudExpressModal 
          lang={lang} 
          onClose={() => setShowSolicitudExpress(false)} 
          userProfile={userData} 
        />
      )}

      {/* Modal de Calculadora de Materiales en RD$ */}
      {showCalcModal && (
        <CalculadoraMaterialesModal
          lang={lang}
          onClose={() => setShowCalcModal(false)}
          navigate={navigate}
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
          const proObj = (professionals || []).find(p => p.id === proId) || { id: proId };
          navigate('proProfile', proObj);
        }}
        navigate={navigate}
      />
    </div>
  )
}