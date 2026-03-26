import { useState, useEffect, useRef } from 'react'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { CATEGORIES, FILTERS } from '../categories'
import LocalesCarrusel from '../locales/LocalesCarrusel'  // ✅ importado
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
function VipShopEntryBanner({ navigate, userRole }) {
  const [isOpen, setIsOpen] = useState(false)
  if (userRole !== 'pro') return null

  return (
    <div className="vip-entry-banner" style={{ margin: '0 16px 16px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 14, overflow: 'hidden', color: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🏬</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#FFD700', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Crea tu Local VIP</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#ccc', fontWeight: 600 }}>Destaca entre la competencia</p>
          </div>
        </div>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s', fontSize: 14, color: '#FFD700' }}>▼</span>
      </div>
      
      {isOpen && (
        <div style={{ padding: '0 16px 16px', animation: 'vip-slide-in 0.3s' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <ul style={{ margin: '0 0 10px', paddingLeft: 20, fontSize: 13, lineHeight: 1.6, color: '#ddd' }}>
              <li>Menú de servicios detallado</li>
              <li>Tus redes sociales y WhatsApp</li>
              <li>Atrae mucha más clientela</li>
            </ul>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#FFD700', textAlign: 'center', background: 'rgba(255,215,0,0.1)', padding: '6px', borderRadius: '6px' }}>Suscripción: RD$ 10,000 / mes</p>
          </div>
          <button 
            style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a1a2e', fontSize: 15, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,165,0,0.4)' }}
            onClick={() => navigate('crearLocal')}
          >
            🚀 Configurar mi Tienda Ahora
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
    return new Intl.DateTimeFormat(lang === 'es' ? 'es-DO' : 'en-US', { month: 'long', year: 'numeric' }).format(now)
  })

  useEffect(() => {
    const calcularProDelMes = async () => {
      try {
        const now = new Date()
        const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)
        const inicioMesTs = Math.floor(inicioMes.getTime() / 1000)

        const q = query(collection(db, 'orders'), where('rated', '==', true))
        const snapshot = await getDocs(q)

        const conteo = {}

        snapshot.forEach(docSnap => {
          const d = docSnap.data()
          const createdTs = d.createdAt?.seconds || 0
          if (createdTs < inicioMesTs) return

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
          const qPros = query(collection(db, 'users'), where('type', '==', 'pro'))
          const snapPros = await getDocs(qPros)
          let mejor = null
          snapPros.forEach(docSnap => {
            const d = docSnap.data()
            if (!mejor || (d.rating || 0) > (mejor.rating || 0)) mejor = { id: docSnap.id, ...d }
          })
          if (mejor) {
            setProDelMes({
              id:           mejor.id,
              nombre:       mejor.name || 'Profesional',
              foto:         mejor.photoURL || mejor.photo || mejor.profilePhoto || mejor.avatar || null,
              especialidad: mejor.category || 'Servicios',
              estrellas:    Math.round((mejor.rating || 5) * (mejor.reviews || 1)),
              contratos:    mejor.reviews || 0,
              avatar:       (mejor.name || 'P').substring(0, 2).toUpperCase(),
            })
            setTotalEstrellas(Math.round((mejor.rating || 5) * (mejor.reviews || 1)))
            setResenas([])
          }
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
        .pdm-nombre { font-size: 14px; font-weight: 800; color: #1a1a2e; margin: 0; }
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
        .pdm-client-name { font-size: 11px; font-weight: 800; color: #1a1a2e; margin: 0 0 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
            <p className="pdm-spec">🔧 {proDelMes.especialidad}</p>
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

export default function SearchPage({ lang = 'es', navigate, initialCategory = 'all', userRole = 'client' }) {
  const [activeCategory,    setActiveCategory]    = useState('all')
  const [activeSubcategory, setActiveSubcategory] = useState('all')
  const [openCategory,      setOpenCategory]      = useState(null)
  const [search,            setSearch]            = useState('')
  const [onlyAvailable,     setOnlyAvailable]     = useState(false)
  const [sortBy,            setSortBy]            = useState('all')
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
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data()
          prosList.push({
            id:         docSnap.id,
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
      const mappedCat  = getMappedProCatId(p.category)
      const isSubInMain = currentCat && currentCat.subcategories.some(s => s.id === mappedCat)
      const matchCat   = activeCategory === 'all' || mappedCat === activeCategory || mappedCat === activeSubcategory || isSubInMain
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase())
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

      <div className="search-header">
        <h1 className="search-title">{T.title}</h1>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder={T.search} value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      <VipShopEntryBanner navigate={navigate} userRole={userRole} />
      <PromoBanner lang={lang} userRole={userRole} />

      {/* ✅ Carrusel de Locales VIP — aparece automáticamente si hay locales */}
      <LocalesCarrusel lang={lang} navigate={navigate} />

      <ProDelMes lang={lang} navigate={navigate} userRole={userRole} />

      <div className="quick-filters" style={{ padding:'0 16px', display:'flex', justifyContent:'flex-end', marginBottom:'8px' }}>
        <label className="avail-toggle">
          <input type="checkbox" checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)} />
          <span className="toggle-track" />
          <span className="toggle-label">{T.filterAvail}</span>
        </label>
      </div>

      <div className="categories-wrapper">
        <div className="categories-scroll">
          <button className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => handleCategoryClick('all')}>
            <span className="cat-icon">✦</span> {T.allCats}
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat.id} className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => handleCategoryClick(cat.id)}>
              <span className="cat-icon">{cat.icon}</span>
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
                <span>{sub.icon}</span> {lang === 'es' ? sub.labelEs : sub.labelEn}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="results-bar">
        {loading
          ? <span className="results-count">Cargando...</span>
          : <span className="results-count">{filtered.length} {T.results}</span>
        }
      </div>

      <div className="professionals-grid">
        {filtered.map((pro, i) => {
          const mappedCat = getMappedProCatId(pro.category)
          const allSubs   = CATEGORIES.flatMap(c => c.subcategories)
          const subCat    = allSubs.find(s => s.id === mappedCat)
          const mainCat   = CATEGORIES.find(c => c.id === mappedCat || c.subcategories.some(s => s.id === mappedCat))
          return (
            <div key={pro.id} className="pro-card" style={{ animationDelay:`${i * 0.06}s` }}>
              <div className="card-photo">
                {pro.photoURL
                  ? <img src={pro.photoURL} alt={pro.name} className="pro-photo" />
                  : <div className="pro-avatar-big" style={{ background: avatarColors[(Array.from(pro.id).reduce((acc, char) => acc + char.charCodeAt(0), 0)) % avatarColors.length] }}>{pro.avatar}</div>
                }
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
                  <button className="btn-profile" onClick={() => navigate('proProfile', pro)}>👤 {T.profile}</button>
                  <button className="btn-book"    onClick={() => navigate('booking', pro)}>{T.book}</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="empty-state"><span>🔍</span><p>{T.empty}</p></div>
      )}

      <div style={{ height: 80 }} />
    </div>
  )
}