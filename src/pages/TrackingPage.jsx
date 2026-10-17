import { useState, useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { collection, addDoc, serverTimestamp, doc, updateDoc, onSnapshot, orderBy, query, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { Capacitor } from '@capacitor/core'
import { registerPlugin } from '@capacitor/core'
const BackgroundGeolocation = registerPlugin('BackgroundGeolocation')
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './TrackingPage.css'
import vanImg from '../assets/van_topdown.png'
import motoListoImg from '../assets/moto_pedidos_listo_topdown.png'
import { ReportModal } from './ChatPage'
import CallModal from '../components/CallModal'
import FloatingChat from '../components/FloatingChat'
import ImprevistoModal from '../components/ImprevistoModal'
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendarUtils'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  shadowUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  iconRetinaUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  iconSize: [0, 0], shadowSize: [0, 0],
})

const clientIcon = L.divIcon({
  className: '',
  html: `<div class="map-marker client-marker"><div class="marker-pulse" style="inset:-6px"></div><div class="marker-icon">🏠</div></div>`,
  iconSize: [40, 40], iconAnchor: [20, 20],
})
const createVanIcon = (imgSrc) => L.divIcon({
  className: 'leaflet-van-icon',
  html: `
    <div class="van-marker-container">
      <div class="van-marker-pulse"></div>
      <img src="${imgSrc}" alt="van" class="van-marker-img" />
    </div>
  `,
  iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -22],
})
const createWorkerIcon = () => L.divIcon({
  className: 'leaflet-worker-icon',
  html: `<div style="background:white;border-radius:50%;padding:4px;border:2px solid #F26000;box-shadow:0 4px 12px rgba(242,96,0,0.4);display:flex;align-items:center;justify-content:center;overflow:hidden;width:50px;height:50px;"><span style="font-size:28px;line-height:1;animation:workerFloat 2s ease-in-out infinite alternate;">👨‍🔧</span></div>`,
  iconSize: [60, 60], iconAnchor: [30, 30], popupAnchor: [0, -30],
})

/* ── Moto de delivery Pedidos Listo: 8 poses según el rumbo (color mamey) ── */
const MAMEY = '#FF6B00', MAMEY_DARK = '#C2410C'
const MOTO_SIDE_SVG = `
<svg viewBox="0 0 64 48" width="56" height="42" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="45" rx="24" ry="2.5" fill="rgba(0,0,0,0.25)"/>
  <circle cx="14" cy="37" r="7" fill="#1F2937"/><circle cx="14" cy="37" r="3" fill="#9CA3AF"/>
  <circle cx="50" cy="37" r="7" fill="#1F2937"/><circle cx="50" cy="37" r="3" fill="#9CA3AF"/>
  <path d="M9 31 L21 26 L41 26 L49 20 L56 30 L47 34 L19 34 Z" fill="${MAMEY}" stroke="${MAMEY_DARK}" stroke-width="1.2"/>
  <line x1="49" y1="20" x2="52" y2="14" stroke="#334155" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="56" cy="27" r="2.2" fill="#FDE047"/>
  <rect x="3" y="11" width="19" height="15" rx="3" fill="${MAMEY}" stroke="${MAMEY_DARK}" stroke-width="1.2"/>
  <text x="12.5" y="22" font-size="9" font-weight="900" fill="#fff" text-anchor="middle" font-family="Arial">L</text>
  <path d="M28 27 L32 16 L40 16 L44 26 Z" fill="#334155"/>
  <line x1="40" y1="18" x2="50" y2="16" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
  <circle cx="36" cy="10" r="6.5" fill="${MAMEY}" stroke="${MAMEY_DARK}" stroke-width="1.2"/>
  <path d="M37 7.5 h5 a1.5 1.5 0 0 1 0 5 h-5 Z" fill="#1E293B"/>
</svg>`
const MOTO_FRONT_SVG = `
<svg viewBox="0 0 48 64" width="40" height="54" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="24" cy="61" rx="14" ry="2.5" fill="rgba(0,0,0,0.25)"/>
  <rect x="19" y="44" width="10" height="17" rx="5" fill="#1F2937"/>
  <path d="M12 30 Q24 24 36 30 L33 48 Q24 52 15 48 Z" fill="${MAMEY}" stroke="${MAMEY_DARK}" stroke-width="1.2"/>
  <circle cx="24" cy="39" r="4" fill="#FDE047" stroke="#CA8A04" stroke-width="1"/>
  <line x1="6" y1="28" x2="42" y2="28" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
  <circle cx="5" cy="24" r="2.5" fill="#94A3B8"/><circle cx="43" cy="24" r="2.5" fill="#94A3B8"/>
  <path d="M15 28 L17 16 L31 16 L33 28 Z" fill="#334155"/>
  <circle cx="24" cy="10" r="8" fill="${MAMEY}" stroke="${MAMEY_DARK}" stroke-width="1.2"/>
  <rect x="18" y="8" width="12" height="5" rx="2.5" fill="#1E293B"/>
</svg>`
const MOTO_BACK_SVG = `
<svg viewBox="0 0 48 64" width="40" height="54" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="24" cy="61" rx="14" ry="2.5" fill="rgba(0,0,0,0.25)"/>
  <rect x="19" y="46" width="10" height="15" rx="5" fill="#1F2937"/>
  <path d="M14 40 L34 40 L31 50 L17 50 Z" fill="${MAMEY}" stroke="${MAMEY_DARK}" stroke-width="1.2"/>
  <rect x="19" y="43" width="10" height="3" rx="1.5" fill="#EF4444"/>
  <line x1="6" y1="27" x2="42" y2="27" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
  <circle cx="24" cy="9" r="7.5" fill="${MAMEY}" stroke="${MAMEY_DARK}" stroke-width="1.2"/>
  <rect x="9" y="16" width="30" height="25" rx="4" fill="${MAMEY}" stroke="${MAMEY_DARK}" stroke-width="1.4"/>
  <rect x="9" y="22" width="30" height="3" fill="${MAMEY_DARK}"/>
  <text x="24" y="36" font-size="8" font-weight="900" fill="#fff" text-anchor="middle" font-family="Arial">LISTO</text>
</svg>`

// 0=N 1=NE 2=E 3=SE 4=S 5=SO 6=O 7=NO  (N = se aleja hacia arriba del mapa → se ve de espalda)
const MOTO_POSES = [
  { svg: MOTO_BACK_SVG,  t: '' },
  { svg: MOTO_SIDE_SVG,  t: 'rotate(-28deg)' },
  { svg: MOTO_SIDE_SVG,  t: '' },
  { svg: MOTO_SIDE_SVG,  t: 'rotate(28deg)' },
  { svg: MOTO_FRONT_SVG, t: '' },
  { svg: MOTO_SIDE_SVG,  t: 'scaleX(-1) rotate(28deg)' },
  { svg: MOTO_SIDE_SVG,  t: 'scaleX(-1)' },
  { svg: MOTO_SIDE_SVG,  t: 'scaleX(-1) rotate(-28deg)' },
]
const bearingToSector = (b) => Math.round(((b % 360) + 360) % 360 / 45) % 8
const motoPoseHtml = (sector) => {
  const p = MOTO_POSES[sector] || MOTO_POSES[2]
  return `<div style="transform:${p.t};transition:transform .3s ease;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 3px 4px rgba(0,0,0,.3))">${p.svg}</div>`
}

const createMotoIcon = (sector = 2) => L.divIcon({
  className: 'leaflet-moto-icon',
  html: `
    <div class="moto-marker-container" style="position:relative;width:60px;height:60px;display:flex;align-items:center;justify-content:center">
      <div class="moto-marker-pulse" style="background:rgba(255,107,0,0.25)"></div>
      <div class="moto-pose" data-sector="${sector}" style="position:relative;z-index:2">${motoPoseHtml(sector)}</div>
    </div>
  `,
  iconSize: [60, 60], iconAnchor: [30, 30], popupAnchor: [0, -30],
})

const CLIENT_POS    = [18.4745, -69.9310]
const PRO_START     = [18.4920, -69.9050]
const PRO_WAYPOINTS = [
  [18.4920, -69.9050],[18.4870, -69.9120],[18.4820, -69.9180],
  [18.4780, -69.9230],[18.4760, -69.9270],[18.4750, -69.9290],[18.4745, -69.9310],
]
const RETREAT_WAYPOINTS = [
  [18.4745, -69.9310],[18.4760, -69.9280],[18.4790, -69.9240],
  [18.4830, -69.9180],[18.4880, -69.9110],[18.4930, -69.9040],[18.5000, -69.8950],
]

const getChatId = (uid1, uid2) => uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`

const playChatMsgSound = () => {
  try {
    const selectedSound = localStorage.getItem('listo_sound_notif') || 'notification_v3';
    const audio = new Audio(`/audio/${selectedSound}.mp3`)
    audio.volume = 0.5; audio.loop = false
    audio.play().catch(() => {})
    setTimeout(() => { try { audio.pause(); audio.currentTime = 0 } catch(e) {} }, 1500)
  } catch(e) {}
}

function lerp(a, b, t) { return a + (b - a) * t }

function getDistanceInMeters(coord1, coord2) {
  if (!coord1 || !coord2) return Infinity
  const [lat1, lon1] = coord1
  const [lat2, lon2] = coord2
  const R = 6371e3 // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function SmoothMarker({ targetPos, icon, children, visible = true, isVan = false, faceTarget = null }) {
  const markerRef = useRef(null), currentPos = useRef(targetPos)
  const animFrameRef = useRef(null), startTimeRef = useRef(null), fromPos = useRef(targetPos)
  const rotationRef = useRef(null)

  const getBearing = (lat1, lng1, lat2, lng2) => {
    const y = Math.sin((lng2 - lng1)*Math.PI/180) * Math.cos(lat2*Math.PI/180)
    const x = Math.cos(lat1*Math.PI/180) * Math.sin(lat2*Math.PI/180) -
              Math.sin(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.cos((lng2 - lng1)*Math.PI/180)
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
  }

  // Aplica la orientación: moto → cambia de pose (8 vistas); van → rota la imagen
  const applyHeading = () => {
    if (!markerRef.current || rotationRef.current == null) return
    const el = markerRef.current.getElement()
    if (!el) return
    const pose = el.querySelector('.moto-pose')
    if (pose) {
      const sector = bearingToSector(rotationRef.current)
      if (pose.dataset.sector !== String(sector)) {
        pose.dataset.sector = String(sector)
        pose.innerHTML = motoPoseHtml(sector)
      }
      return
    }
    const img = el.querySelector('.moto-marker-img, .van-marker-img')
    if (img) img.style.transform = `rotate(${rotationRef.current}deg)`
  }

  useEffect(() => {
    fromPos.current = [...currentPos.current]; startTimeRef.current = null
    const moved = getDistanceInMeters(fromPos.current, targetPos) > 2
    if (moved) {
      // Rumbo real del movimiento
      rotationRef.current = getBearing(fromPos.current[0], fromPos.current[1], targetPos[0], targetPos[1])
    } else if (faceTarget && getDistanceInMeters(targetPos, faceTarget) > 2) {
      // Sin movimiento: mirar hacia el destino del pedido
      rotationRef.current = getBearing(targetPos[0], targetPos[1], faceTarget[0], faceTarget[1])
    }
    applyHeading()
    
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    const animate = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts
      const t = Math.min((ts - startTimeRef.current) / 2500, 1)
      const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t
      const lat = lerp(fromPos.current[0], targetPos[0], e)
      const lng = lerp(fromPos.current[1], targetPos[1], e)
      currentPos.current = [lat, lng]
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
        applyHeading()
      }
      if (t < 1) animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [targetPos[0], targetPos[1], faceTarget?.[0], faceTarget?.[1]]) // eslint-disable-line

  useEffect(() => {
    if (rotationRef.current == null && faceTarget) {
      rotationRef.current = getBearing(targetPos[0], targetPos[1], faceTarget[0], faceTarget[1])
    }
    const id = setTimeout(applyHeading, 50) // esperar a que Leaflet cree el elemento
    return () => clearTimeout(id)
  }, [icon]) // eslint-disable-line
  
  if (!visible) return null
  // eslint-disable-next-line react-hooks/refs
  return <Marker ref={markerRef} position={currentPos.current} icon={icon}>{children}</Marker>
}

/* ── Componentes de estado ─────────────────────────────────────────────────── */
function WorkingAnimation({ lang }) {
  const marqueeText = lang === 'es' ? 'TRABAJANDO • ' : 'WORKING • '
  const repeatedMarquee = Array(8).fill(marqueeText).join('')

  return (
    <>
      <style>{`
        @keyframes workingPulse {
          0% { transform: scale(0.96); opacity: 0.85; text-shadow: 0 0 4px rgba(255,255,255,0.4); }
          100% { transform: scale(1.04); opacity: 1; text-shadow: 0 0 16px rgba(255,255,255,0.8), 0 0 24px rgba(255,255,255,0.4); }
        }
        @keyframes marqueeScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .working-marquee-track {
          position: absolute;
          top: 35%;
          left: 0;
          width: 200%;
          display: flex;
          overflow: hidden;
          white-space: nowrap;
          pointer-events: none;
          z-index: 1;
          opacity: 0.12;
        }
        .working-marquee-content {
          display: flex;
          flex-shrink: 0;
          font-size: 48px;
          font-weight: 900;
          color: #fff;
          letter-spacing: 4px;
          animation: marqueeScroll 15s linear infinite;
        }
      `}</style>
      <div className="working-anim-wrap">
        <div className="working-marquee-track">
          <div className="working-marquee-content">{repeatedMarquee}{repeatedMarquee}</div>
        </div>
        <div className="working-scene professional-scene" style={{ width:'auto', height:'140px' }}>
          <div className="professional-worker-emoji" style={{ fontSize:'90px', animation:'workerFloat 2.5s ease-in-out infinite alternate' }}>👨‍🔧</div>
          <div className="sparks"><span className="spark s1">✦</span><span className="spark s2">★</span><span className="spark s3">✦</span></div>
        </div>
        <div style={{
          marginTop: '12px',
          color: '#fff',
          fontWeight: 900,
          fontSize: '22px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          animation: 'workingPulse 1.5s ease-in-out infinite alternate',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔧 {lang === 'es' ? 'TRABAJANDO' : 'WORKING'}
        </div>
      </div>
    </>
  )
}
function VanRetreatAnimation({ lang }) {
  return (
    <div className="van-retreat-wrap">
      <div className="van-retreat-scene"><div className="retreat-dust"><span className="dust d1">·</span><span className="dust d2">·</span><span className="dust d3">·</span></div></div>
      <p className="retreat-label">{lang==='es'?'El profesional se está retirando...':'Professional is leaving...'}</p>
    </div>
  )
}

/* ── TratoScreen — SOLO para el PRO ─────────────────────────────────────────
   El cliente ya no ve botones aquí, solo el pro confirma el trato
───────────────────────────────────────────────────────────────────────────── */
function TratoScreenPro({ lang, proName, onAccept, onDecline }) {
  const safeName = proName && proName !== 'undefined' ? proName : (lang==='es'?'El profesional':'The professional')
  return (
    <div className="trato-screen fade-up">
      <div className="trato-icon">🤝</div>
      <h3 className="trato-title">{lang==='es'?'¿Cerramos el trato?':'Close the deal?'}</h3>
      <p className="trato-sub">{lang==='es'?`Confirma que acordaste el trabajo con el cliente`:`Confirm you agreed on the job with the client`}</p>
      <div className="trato-buttons">
        <button className="trato-btn accept" onClick={onAccept}>✅ {lang==='es'?'Trato hecho':'Deal made'}</button>
        <button className="trato-btn decline" onClick={onDecline}>❌ {lang==='es'?'Declinado':'Declined'}</button>
      </div>
    </div>
  )
}

function TratoScreenUser({ lang, proName }) {
  const safeName = proName && proName !== 'undefined' ? proName : (lang==='es'?'El profesional':'The professional')
  return (
    <div className="trato-screen fade-up">
      <div className="trato-icon">⏳</div>
      <h3 className="trato-title" style={{ fontSize:18 }}>
        {lang==='es'?'Esperando confirmación del profesional':'Waiting for professional confirmation'}
      </h3>
      <p className="trato-sub">
        {lang==='es'
          ? `${safeName} está acordando los detalles del trabajo contigo`
          : `${safeName} is agreeing on the job details with you`}
      </p>
    </div>
  )
}

/* ── Efecto de Resize para el Mapa al abrir Teclado/Chat ─────────────── */
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const interval = setInterval(() => { map.invalidateSize() }, 300)
    return () => clearInterval(interval)
  }, [map])
  return null
}

/* ── Efecto de Cámara Inteligente Estilo Uber ─────────────── */
function MapBoundsFitter({ pos1, pos2 }) {
  const map = useMap()
  useEffect(() => {
    if (pos1 && pos2) {
      if (pos1[0] === pos2[0] && pos1[1] === pos2[1]) return
      try {
        const bounds = L.latLngBounds([pos1, pos2])
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true, duration: 1 })
      } catch (e) {}
    }
  }, [map, pos1[0], pos1[1], pos2[0], pos2[1]])
  return null
}

/* ── Página principal ──────────────────────────────────────────────────────── */
export default function TrackingPage({ lang = 'es', navigate, professional, userRole }) {
  const targetName = professional?.clientName || professional?.pro || professional?.proName || professional?.name || 'Cliente/Profesional'
  const targetAvT  = professional?.clientName?.substring(0,2).toUpperCase() || professional?.avatar || '👤'
  const targetCat  = professional?.specialty || professional?.proSpecialty || professional?.category || 'Servicio'

  const isDelivery = professional?.type === 'delivery' || 
                     professional?.type === 'pedidos_listo' || 
                     Boolean(professional?.items && professional?.items.length > 0) || 
                     Boolean(professional?.storeName || professional?.commerceName || professional?.storeId)
  const pinOTP = professional?.pinOTP || professional?.otp || '4821'
  // 🛍️ El cliente pasa a buscar al local: no hay repartidor ni moto
  const isPickup = isDelivery && (professional?.fulfillmentType === 'pickup' || professional?.orderType === 'pickup' || professional?.driverType === 'pickup')
  const deliveryAddress = professional?.deliveryAddress || professional?.address || 'Dirección de entrega'
  const deliveryNotes = professional?.deliveryNotes || professional?.notes || ''
  const items = professional?.items || []
  const orderTotal = professional?.total ? `RD$ ${Number(professional.total).toLocaleString()}` : (professional?.price || 'RD$ 0')
  const paymentMethod = professional?.paymentMethod || 'efectivo'
  const tipAmount = professional?.tipAmount || 0

  const pro = {
    name:     targetName,
    avatar:   targetAvT,
    color:    professional?.color    || '#F26000',
    category: isDelivery 
      ? (professional?.storeName ? `🛵 Delivery Pedidos Listo (${professional.storeName})` : '🛵 Repartidor Pedidos Listo') 
      : targetCat,
    rating:   professional?.rating   || 5.0,
    phone:    professional?.phone    || professional?.clientPhone || professional?.proPhone || null,
    uid:      userRole === 'pro' ? (professional?.clientId || professional?.otherUid) : (professional?.proId || professional?.otherUid || professional?.uid),
  }

  const fallbackClientPos = [18.4745, -69.9310] // S.D. solo si falla todo
  const cPos = professional?.coords && professional.coords.lat ? [professional.coords.lat, professional.coords.lng] : fallbackClientPos
  const pPos = professional?.proCoords && professional.proCoords.lat ? [professional.proCoords.lat, professional.proCoords.lng] : [cPos[0] + 0.005, cPos[1]]

  const [clientLoc,      setClientLoc]      = useState(cPos)
  const [proPos,         setProPos]         = useState(pPos)
  const [mapCenter,      setMapCenter]      = useState(cPos)

  const [eta,            setEta]            = useState(professional?.estimatedTime || 15)
  const [status,         setStatus]         = useState('on_way')
  const [workStatus,     setWorkStatus]     = useState('tracking')
  const [vanVisible,     setVanVisible]     = useState(true)
  const [showChat,       setShowChat]       = useState(false)
  const [showArrivingAlert, setShowArrivingAlert] = useState(false)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(professional?.paymentStatus || null)
  // Estado real del pedido controlado por el comercio (Comandera): pending → cooking → ready → completed
  const [orderStatus, setOrderStatus] = useState(professional?.status || 'pending')
  const [showImprevistoModal, setShowImprevistoModal] = useState(false)

  // Audio llegada y notificación
  const arrivingAudioRef    = useRef(null)
  const arrivingSoundPlayed = useRef(false)
  const arrivingTimerRef    = useRef(null)
  const notificationSent    = useRef(false)

  const playArrivingSound = () => {
    if (arrivingSoundPlayed.current) return
    arrivingSoundPlayed.current = true
    try {
      const selectedSound = localStorage.getItem('listo_sound_notif') || 'notification_v3';
      const audio = new Audio(`/audio/${selectedSound}.mp3`)
      audio.volume = 0.7; audio.loop = true
      audio.play().catch(() => {})
      arrivingAudioRef.current = audio
      arrivingTimerRef.current = setTimeout(() => stopArrivingSound(), 30000)
    } catch (e) {}
  }
  const stopArrivingSound = () => {
    if (arrivingTimerRef.current) { clearTimeout(arrivingTimerRef.current); arrivingTimerRef.current = null }
    if (arrivingAudioRef.current) { arrivingAudioRef.current.pause(); arrivingAudioRef.current.currentTime = 0; arrivingAudioRef.current = null }
  }
  useEffect(() => { return () => stopArrivingSound() }, [])

  const vanIcon    = useMemo(() => createVanIcon(vanImg), [])
  const workerIcon = useMemo(() => createWorkerIcon(), [])
  const motoIcon   = useMemo(() => createMotoIcon(), [])
  const intervalRef = useRef(null)

  // Sincronizar con el documento de la orden en Firestore
  useEffect(() => {
    if (!professional?.id) return
    const unsub = onSnapshot(doc(db, 'orders', professional.id), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data()
        if (d.status) setOrderStatus(d.status)
        if (d.status === 'working') setWorkStatus('working')
        if (d.status === 'done') setWorkStatus('done')
        if (d.status === 'cancelled') setWorkStatus('declined_done')
        if (d.status === 'arrived') { setStatus('arrived'); setWorkStatus('awaiting_deal'); stopArrivingSound() }
        if (d.estimatedTime !== undefined) setEta(d.estimatedTime)
        if (d.paymentStatus !== undefined) setPaymentStatus(d.paymentStatus)
        
        // Use real GPS coordinates if available
        if (d.proCoords) setProPos([d.proCoords.lat, d.proCoords.lng])
      }
    })
    return () => unsub()
  }, [professional?.id])

  // Alerta y notificación cuando el profesional está a menos de 30 metros del cliente
  useEffect(() => {
    if (!isPickup && userRole !== 'pro' && workStatus === 'tracking' && status !== 'arrived') {
      const distance = getDistanceInMeters(clientLoc, proPos)
      if (distance > 0 && distance <= 30) {
        if (!alertDismissed) {
          setShowArrivingAlert(true)
          playArrivingSound()
          
          // Guardar notificación en la base de datos (solo una vez)
          if (!notificationSent.current && professional?.id) {
            notificationSent.current = true
            addDoc(collection(db, 'notificaciones'), {
              userId: auth.currentUser?.uid || 'unknown',
              orderId: professional.id,
              type: 'pro_arriving',
              title: lang === 'es' ? '🚐 ¡Tu profesional está muy cerca!' : '🚐 Your professional is very close!',
              text: lang === 'es' 
                ? `${pro.name} está a menos de 30 metros de tu ubicación.` 
                : `${pro.name} is less than 30 meters away from your location.`,
              read: false,
              icon: '🚐',
              createdAt: serverTimestamp(),
            }).catch(() => {})
          }
        }
      } else {
        setShowArrivingAlert(false)
        setAlertDismissed(false) // Reiniciar cuando el profesional se aleje
      }
    } else {
      setShowArrivingAlert(false)
    }
  }, [clientLoc, proPos, userRole, workStatus, status, alertDismissed, professional, lang, pro.name])

  // GPS Tracking Real para el Profesional (Soporta Segundo Plano en Native)
  useEffect(() => {
    if (userRole !== 'pro' || !professional?.id || workStatus !== 'tracking' || status === 'arrived') return
    
    let watcherId = null

    const startTracking = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          watcherId = await BackgroundGeolocation.addWatcher(
            {
              backgroundMessage: "Tracking activo en camino al cliente.",
              backgroundTitle: "Pedidos Listo - En camino",
              requestPermissions: true,
              stale: false,
              distanceFilter: 10
            },
            (location, error) => {
              if (error) return console.error('BgGeo Error:', error)
              if (!location) return
              const { latitude, longitude } = location
              setProPos([latitude, longitude])
              updateDoc(doc(db, 'orders', professional.id), {
                proCoords: { lat: latitude, lng: longitude }
              }).catch(()=>{})
            }
          )
        } catch (e) {
          console.error("No se pudo iniciar background geolocation", e)
        }
      } else if (navigator.geolocation) {
        watcherId = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords
            setProPos([latitude, longitude])
            updateDoc(doc(db, 'orders', professional.id), {
              proCoords: { lat: latitude, lng: longitude }
            }).catch(()=>{})
          },
          (err) => console.error("GPS Error:", err),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        )
      }
    }

    startTracking()

    return () => {
      if (watcherId !== null) {
        if (Capacitor.isNativePlatform()) {
          BackgroundGeolocation.removeWatcher({ id: watcherId }).catch(()=>{})
        } else if (navigator.geolocation) {
          navigator.geolocation.clearWatch(watcherId)
        }
      }
    }
  }, [userRole, professional?.id, workStatus, status])

  useEffect(() => {
    if (workStatus !== 'retreating') return
    
    // Generar ruta de retirada dinámica basada en la ubicación del cliente
    // Para no teletransportarse a Santo Domingo si están en otra ciudad
    const dynamicRetreatWaypoints = [
      clientLoc,
      [clientLoc[0] + 0.0015, clientLoc[1] + 0.003],
      [clientLoc[0] + 0.0045, clientLoc[1] + 0.007],
      [clientLoc[0] + 0.0085, clientLoc[1] + 0.012],
      [clientLoc[0] + 0.0135, clientLoc[1] + 0.019],
      [clientLoc[0] + 0.0200, clientLoc[1] + 0.028],
    ]

    let idx = 0
    const interval = setInterval(() => {
      idx += 1
      if (idx >= dynamicRetreatWaypoints.length) { clearInterval(interval); setVanVisible(false); setWorkStatus('declined_done'); return }
      setProPos(dynamicRetreatWaypoints[idx])
    }, 1500)
    return () => clearInterval(interval)
  }, [workStatus, clientLoc])

  // ── PRO confirma trato → notifica al cliente ──────────────────────────────
  const [tratoConfirming, setTratoConfirming] = useState(false)

  const handleAccept = async () => {
    stopArrivingSound()
    setTratoConfirming(true) // inicia animación
    setWorkStatus('working')  // cambia estado — cliente ve WorkingAnimation

    try {
      if (professional?.id) {
        await updateDoc(doc(db, 'orders', professional.id), {
          status: 'working',
          workingStartedAt: serverTimestamp(),
        })
      }
      if (professional?.clientId) {
        await addDoc(collection(db, 'notificaciones'), {
          userId:    professional.clientId,
          orderId:   professional?.id || 'unknown',
          type:      'trato_confirmed',
          title:     lang === 'es' ? '🤝 ¡Trato Confirmado!' : '🤝 Deal Confirmed!',
          text:      lang === 'es'
            ? `${pro.name} confirmó el trato y ya está trabajando en tu solicitud.`
            : `${pro.name} confirmed the deal and is already working on your request.`,
          read:      false,
          icon:      '🔧',
          createdAt: serverTimestamp(),
        })
      }
    } catch(e) { console.error(e) }

    // Esperar animación y navegar a pedidos
    setTimeout(() => navigate('orders'), 1200)
  }


  const handleDecline = () => {
    stopArrivingSound()
    setWorkStatus('retreating')
    setProPos(RETREAT_WAYPOINTS[0])
  }

  const statusInfo = {
    on_way:   { label: userRole==='pro' ? (lang==='es'?'En ruta':'En route') : (lang==='es'?'En camino':'On the way'),   color:'#F26000', icon:'🚐' },
    arriving: { label: lang==='es'?'¡Llegando!':'Arriving!',   color:'#FF8533', icon:'⚡' },
    arrived:  { label: lang==='es'?'¡Llegó!':'Arrived!',       color:'#3DBA74', icon:'✅' },
  }
  const current        = statusInfo[status] || statusInfo['on_way']
  const getStatusIcon  = () => ({ working:'🔧', awaiting_deal:'🤝', retreating:'🚐', declined_done:'❌', done:'🎉' }[workStatus] || current.icon)
  const getStatusColor = () => ({ working:'#0EA5E9', awaiting_deal:'#059669', retreating:'#EF4444', declined_done:'#EF4444', done:'#10B981' }[workStatus] || current.color)
  const getStatusLabel = () => ({
    working:       lang==='es'?'🔧 Trabajando':'🔧 Working',
    awaiting_deal: lang==='es'?'🤝 Cerrando trato...':'🤝 Closing deal...',
    retreating:    lang==='es'?'🚐 Retirándose...':'🚐 Leaving...',
    declined_done: lang==='es'?'❌ Trato declinado':'❌ Deal declined',
    done:          lang==='es'?'🎉 ¡Trabajo completado!':'🎉 Work completed!',
  }[workStatus] || current.label)

  const getStatusDesc = () => {
    const n = pro.name && pro.name !== 'undefined' ? pro.name : (lang==='es'?'El profesional':'The professional')
    return ({
      working:       userRole==='pro' ? (lang==='es'?'Trabajando en el área':'Working on site') : (lang==='es'?'Realizando la labor acordada en tu ubicación':'Performing the agreed service'),
      awaiting_deal: userRole==='pro'
        ? (lang==='es'?'Confirma el trato para comenzar a trabajar':'Confirm the deal to start working')
        : (lang==='es'?`${n} está acordando los detalles del trabajo`:`${n} is closing the deal`),
      retreating:    userRole==='pro' ? (lang==='es'?'Te retiras del lugar':'Leaving the location') : (lang==='es'?'El profesional está saliendo de tu ubicación':'Professional is leaving your location'),
      declined_done: userRole==='pro' ? (lang==='es'?'Trato declinado. Van retirándose.':'Deal declined. Van retreating.') : (lang==='es'?'El trato fue declinado. La van se retiró.':'Deal was declined. The van left.'),
      done:          lang==='es'?'¡El servicio fue completado exitosamente!':'Service completed successfully!',
    }[workStatus] || (
      status==='arrived'  ? (userRole==='pro' ? (lang==='es'?'Llegaste a la ubicación del cliente':'You arrived at the client location') : (lang==='es'?`${n} ha llegado a tu ubicación`:`${n} has arrived`)) :
      status==='arriving' ? (userRole==='pro' ? (lang==='es'?'Tú estás llegando al destino':'You are arriving at the destination') : (lang==='es'?'¡Tu profesional está a la vuelta!':'Just around the corner!')) :
      (userRole==='pro' ? (lang==='es'?`Te diriges hacia la ubicación de ${n}`:`Heading to ${n}'s location`) : (lang==='es'?`${n} está en camino`:`${n} is on the way`))
    ))
  }

  const flowSteps = isDelivery ? [
    { key:'confirmed', labelEs:'Confirmado', labelEn:'Confirmed' },
    { key:'preparing', labelEs:'En preparación', labelEn:'Preparing' },
    { key:'onway',     labelEs: isPickup ? 'Listo para retirar 🛍️' : 'En camino 🛵', labelEn: isPickup ? 'Ready for pickup 🛍️' : 'On the way 🛵' },
    { key:'done',      labelEs: isPickup ? 'Retirado 🎉' : 'Entregado 🎉', labelEn: isPickup ? 'Picked up 🎉' : 'Delivered 🎉' },
  ] : [
    { key:'confirmed', labelEs:'Confirmado', labelEn:'Confirmed' },
    { key:'onway',     labelEs:'En camino',  labelEn:'On the way' },
    { key:'arrived',   labelEs:'Llegó',      labelEn:'Arrived' },
    { key:'trato',     labelEs:'Acuerdo',    labelEn:'Agreement' },
    { key:'working',   labelEs:'Trabajando', labelEn:'Working' },
    { key:'done',      labelEs:'Listo',      labelEn:'Done' },
  ]
  // Paso del delivery según lo que marca el comercio (no avanza solo)
  const deliveryStep = (() => {
    const s = (orderStatus || '').toLowerCase()
    if (['completed', 'done', 'delivered', 'entregado'].includes(s)) return 3
    if (['ready', 'on_way', 'onway', 'picked_up', 'en_camino', 'dispatched'].includes(s)) return 2
    if (['cooking', 'preparing', 'accepted', 'en_preparacion'].includes(s)) return 1
    return 0
  })()
  const riderOnTheWay = !isDelivery || (deliveryStep === 2 && !isPickup)

  const currentFlowIdx = () => {
    if (isDelivery) return deliveryStep
    return workStatus==='done'?5:workStatus==='working'?4:workStatus==='awaiting_deal'?3:status==='arrived'?2:1
  }

  return (
    <div className="tracking-page">
      <div className="tracking-header">
        <button className="tracking-back" onClick={() => navigate('orders')}>←</button>
        <div>
          <h2 className="tracking-title">{lang==='es'?'Seguimiento en vivo':'Live tracking'}</h2>
          <p className="tracking-sub">{lang==='es'?'Actualizado en tiempo real':'Updated in real time'}</p>
        </div>
        <div className="tracking-live-badge"><span className="live-dot" />LIVE</div>
      </div>

      <div className="tracking-map-wrap">
        {showArrivingAlert && (
          <div className="arriving-alert-box">
            <span className="arriving-alert-bell">🔔</span>
            <div style={{ flex: 1 }}>
              <p className="arriving-alert-title">
                <span className="arriving-alert-dot" />
                {lang === 'es' ? '¡REPARTIDOR CERCA!' : 'RIDER NEARBY!'}
              </p>
              <p className="arriving-alert-desc">
                {lang === 'es' ? 'El repartidor está a menos de 30 metros de tu ubicación.' : 'The rider is less than 30 meters away.'}
              </p>
            </div>
            <button 
              className="arriving-alert-close"
              onClick={() => { setAlertDismissed(true); stopArrivingSound(); }}
            >
              ✕
            </button>
          </div>
        )}
        <MapContainer center={mapCenter} zoom={14} className="tracking-map" zoomControl={false} attributionControl={false}>
          <MapResizer />
          <MapBoundsFitter pos1={clientLoc} pos2={proPos} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={clientLoc} icon={clientIcon}><Popup>{lang==='es'?'Tu ubicación':'Your location'}</Popup></Marker>
          {vanVisible && riderOnTheWay && <SmoothMarker targetPos={proPos} icon={isDelivery ? motoIcon : (workStatus==='working'?workerIcon:vanIcon)} visible={vanVisible} isVan={!isDelivery && workStatus!=='working'} faceTarget={workStatus==='retreating' ? null : clientLoc}><Popup>{pro.name}</Popup></SmoothMarker>}
          {workStatus === 'tracking' && riderOnTheWay && (
            <Polyline 
              positions={[proPos, clientLoc]} 
              color="#F26000" 
              weight={4} 
              opacity={0.85} 
              dashArray="8, 12" 
              lineCap="round"
            />
          )}
        </MapContainer>
        {/* ETA solo se muestra en la tarjeta de estado (no duplicado sobre el mapa) */}
      </div>

      <div className="tracking-card">
        {workStatus !== 'working' && (
          <div className="tracking-status-bar"
            style={{ background:getStatusColor()+'15', borderColor:getStatusColor()+'30' }}>
            <span className="status-icon">{isPickup ? '🛍️' : isDelivery ? '🛵' : getStatusIcon()}</span>
            <div style={{ flex:1 }}>
              <p className="status-label" style={{ color:getStatusColor() }}>{isPickup
                ? ['⏳ Esperando que el comercio acepte', '👨‍🍳 Tu pedido se está preparando', '🛍️ ¡Listo para retirar!', '🎉 ¡Pedido Retirado!'][deliveryStep]
                : isDelivery ? (lang==='es'
                ? ['⏳ Esperando que el comercio acepte', '👨‍🍳 Tu pedido se está preparando', '🛵 Repartidor en Camino', '🎉 ¡Pedido Entregado!'][deliveryStep]
                : ['⏳ Waiting for the store', '👨‍🍳 Preparing your order', '🛵 Rider on the way', '🎉 Delivered!'][deliveryStep]) : getStatusLabel()}</p>
              <p className="status-desc">{isPickup
                ? [`${professional?.storeName || 'El comercio'} recibió tu pedido`, `Te avisaremos cuando esté listo en el mostrador`, `Pasa por ${professional?.storeName || 'el local'} y da tu PIN en caja`, 'Gracias por pedir con Pedidos Listo'][deliveryStep]
                : isDelivery ? (lang==='es'
                ? [`${professional?.storeName || 'El comercio'} recibió tu pedido y lo confirmará en breve`, `${professional?.storeName || 'El comercio'} está preparando tu pedido`, `Tu pedido va en camino con ${pro.name}`, 'Gracias por pedir con Pedidos Listo'][deliveryStep]
                : ['The store will confirm shortly', 'The store is preparing your order', `On the way with ${pro.name}`, 'Thanks for ordering'][deliveryStep]) : getStatusDesc()}</p>
            </div>
            {workStatus==='tracking' && status!=='arrived' && riderOnTheWay && (
              <div className="eta-countdown"><span className="eta-number">{eta}</span><span className="eta-unit">min</span></div>
            )}
          </div>
        )}

        {/* ── PEDIDOS YA: PIN DE SEGURIDAD ── */}
        {isDelivery && (
          <div style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
            color: '#FFFFFF',
            borderRadius: '18px',
            padding: '14px 18px',
            margin: '14px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(30, 27, 75, 0.25)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', color: '#A5B4FC' }}>
                <span>🔒 PIN DE SEGURIDAD</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#E0E7FF' }}>
                {isPickup ? 'Dile este PIN en caja al retirar tu pedido' : 'Dile este PIN al repartidor al recibir tu pedido'}
              </p>
            </div>
            <div style={{
              background: '#FFFFFF',
              color: '#1E1B4B',
              padding: '6px 16px',
              borderRadius: '12px',
              fontSize: '22px',
              fontWeight: '900',
              letterSpacing: '3px',
              fontFamily: 'monospace',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              {pinOTP}
            </div>
          </div>
        )}

        {/* ── DETALLE DE PRODUCTOS & DIRECCIÓN ── */}
        {isDelivery && (
          <div style={{
            background: '#F8FAFC',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '14px',
            border: '1.5px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748B', textTransform: 'uppercase' }}>
                {isPickup ? '🛍️ Retiro en el Local' : '📍 Entrega en Domicilio'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '800', background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '10px' }}>
                {paymentMethod === 'efectivo' ? '💵 Efectivo' : paymentMethod === 'tarjeta' ? '💳 Tarjeta' : '🏦 Transferencia'}
              </span>
            </div>

            <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: '800', color: '#1E293B' }}>
              {deliveryAddress}
            </p>
            {deliveryNotes && (
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748B' }}>
                📝 {deliveryNotes}
              </p>
            )}

            {items.length > 0 && (
              <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '8px', marginTop: '8px' }}>
                {items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#334155', marginBottom: '3px' }}>
                    <span>{it.qty || 1}x {it.name}</span>
                    <span style={{ fontWeight: '700' }}>RD$ {((it.price || 0) * (it.qty || 1)).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '900', color: 'var(--mamey)', marginTop: '8px', borderTop: '1px solid #E2E8F0', paddingTop: '6px' }}>
                  <span>Total Pedido:</span>
                  <span>{orderTotal}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Trato: PRO ve botones, CLIENTE solo mensaje ── */}
        {(workStatus==='awaiting_deal' || tratoConfirming) && userRole==='pro' && (
          <div style={{ transition:'all 1.1s cubic-bezier(.4,0,.2,1)', transform:tratoConfirming?'scale(0.05) translateY(200px)':'scale(1) translateY(0)', opacity:tratoConfirming?0:1, transformOrigin:'center bottom' }}><TratoScreenPro lang={lang} proName={pro.name} onAccept={handleAccept} onDecline={handleDecline} /></div>
        )}
        {workStatus==='awaiting_deal' && userRole!=='pro' && (
          <TratoScreenUser lang={lang} proName={pro.name} />
        )}

        {workStatus==='working'    && <WorkingAnimation lang={lang} />}
        {workStatus==='retreating' && <VanRetreatAnimation lang={lang} />}

        {workStatus==='declined_done' && (
          <div className="declined-screen fade-up">
            <div className="declined-icon">❌</div>
            <p className="declined-title">{lang==='es'?'Trato declinado':'Deal declined'}</p>
            <p className="declined-sub">{lang==='es'?'La van de Listo se ha retirado de tu ubicación.':'The Listo van has left your location.'}</p>
            <button className="declined-btn" onClick={() => navigate('search')}>{lang==='es'?'Buscar otro profesional':'Find another professional'}</button>
          </div>
        )}

        {!['declined_done'].includes(workStatus) && (
          <>
            <div className="tracking-pro-info">
              <div className="tracking-pro-left">
                <div className="tracking-avatar" style={{ background:pro.color }}>{pro.avatar}</div>
                <div>
                  <p className="tracking-pro-name">{pro.name}</p>
                  <p className="tracking-pro-cat">{userRole==='pro' ? (lang==='es'?'Cliente':'Client') : pro.category}</p>
                  {userRole !== 'pro' && <div className="tracking-pro-rating">★ {pro.rating}<span className="tracking-verified">✓ {lang==='es'?'Verificado':'Verified'}</span></div>}
                </div>
              </div>
              <div className="tracking-pro-actions" style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="track-action-btn" 
                  onClick={() => {
                    const url = getGoogleCalendarUrl({
                      title: `Servicio con ${pro.name} (${pro.category})`,
                      description: `Cita de servicio reservada en Pedidos Listo con ${pro.name}.`,
                      location: 'República Dominicana'
                    })
                    window.open(url, '_blank')
                  }}
                  title="Guardar en Google Calendar"
                  style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
                >
                  📅
                </button>
                <button 
                  className="track-action-btn" 
                  onClick={() => setShowImprevistoModal(true)}
                  title="Asistencia & Garantía 24/7"
                  style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', fontWeight: 'bold' }}
                >
                  🛡️
                </button>
                <button className="track-action-btn call" onClick={() => setShowChat(true)} style={{ opacity: pro.phone ? 1 : 0.4 }}>📞</button>
                <button className="track-action-btn chat" onClick={() => setShowChat(true)}>💬</button>
              </div>
            </div>

            {/* Banner de Garantía & Asistencia 24/7 */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF1F2 100%)',
                border: '1.5px solid #FECACA',
                borderRadius: '16px',
                padding: '12px 14px',
                margin: '14px 0 10px',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🛡️</span>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#991B1B' }}>
                    {lang === 'es' ? 'Soporte & Mediación 24/7' : '24/7 Support & Mediation'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#7F1D1D' }}>
                    {lang === 'es' ? 'Asistencia en vivo ante cualquier imprevisto' : 'Live assistance for any situation'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImprevistoModal(true)}
                style={{
                  background: '#DC2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)',
                  whiteSpace: 'nowrap'
                }}
              >
                🚨 {lang === 'es' ? 'Reportar' : 'Report'}
              </button>
            </div>

            <div className="tracking-steps">
              {flowSteps.map((step, i) => (
                <div key={step.key} className={`track-step ${currentFlowIdx()>=i?'done':''}`}>
                  <div className="track-step-dot" />
                  {i<flowSteps.length-1 && <div className="track-step-line" />}
                  <span className="track-step-label">{lang==='es'?step.labelEs:step.labelEn}</span>
                </div>
              ))}
            </div>

            {/* ── Acciones de tracking para el Pro ── */}
            {workStatus==='tracking' && userRole==='pro' && status !== 'arrived' && (
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <button onClick={async () => {
                   let nextEta = eta + 10;
                   if (nextEta > 90) nextEta = 10;
                   setEta(nextEta);
                   try { await updateDoc(doc(db, 'orders', professional.id), { estimatedTime: nextEta }) } catch {}
                }} style={{ padding:'14px 10px', borderRadius:14, border:'2px solid #F26000', background:'transparent', color:'#F26000', fontWeight:800, fontSize:14, cursor:'pointer', transition:'all 0.2s', minWidth: 90 }}>⏱️ {lang==='es'?'+10m':'+10m'}</button>
                
                <button onClick={async () => {
                   try { await updateDoc(doc(db, 'orders', professional.id), { status: 'arrived' }) } catch {}
                   setStatus('arrived'); setWorkStatus('awaiting_deal'); stopArrivingSound()
                }} style={{ flex:1, padding:14, borderRadius:14, border:'none', background:'#F26000', color:'#fff', fontWeight:900, fontSize:15, boxShadow:'0 8px 30px rgba(242,96,0,0.4)', cursor:'pointer', animation: 'timerPulse 2s infinite' }}>✅ {lang==='es'?'¡Llegué a la ubicación!':'I arrived!'}</button>
              </div>
            )}

            {/* ── Trabajando: pro ve info, usuario ve info ── */}
            {workStatus==='working' && (
              <div className="tracking-info-box" style={{ background:'#F0FDF4', padding:16, borderRadius:12, textAlign:'center', border:'1px dashed #34D399' }}>
                <p style={{ margin:0, fontSize:14, color:'#065F46', fontWeight:700 }}>
                  {userRole==='pro'
                    ? (lang==='es'?'🔧 Cuando termines ve a Pedidos → Ver orden activa → ¡Pedidos Listo!':'🔧 When done go to Orders → View active order → Done Boss!')
                    : (lang==='es'?'🔧 El profesional está trabajando. Te notificaremos cuando termine.':'🔧 Professional is working. We will notify you when done.')
                  }
                </p>
              </div>
            )}

            {workStatus==='done' && userRole==='user' && (
              <div className="tracking-done-actions">
                {['approved', 'pending_cash', 'paid', 'verifying'].includes(paymentStatus) ? (
                  <button className="tracking-flow-btn pay-btn" style={{ background: '#94A3B8', cursor: 'not-allowed' }} disabled>
                    💳 {lang==='es'?'Trabajo Pago':'Work Paid'}
                  </button>
                ) : (
                  <button className="tracking-flow-btn pay-btn" onClick={() => navigate('payment', professional)}>
                    💳 {lang==='es'?'Pagar ahora':'Pay now'}
                  </button>
                )}
              </div>
            )}

            {workStatus==='done' && userRole==='pro' && (
              <div className="tracking-done-actions">
                <div className="tracking-info-box" style={{ background:'#ECFDF5', padding:16, borderRadius:12, textAlign:'center', border:'1px dashed #34D399', color:'#065F46' }}>
                  <p style={{ margin:0, fontSize:15, fontWeight:'bold' }}>{lang==='es'?'🎉 ¡Trabajo Completado!':'🎉 Work Completed!'}</p>
                  <p style={{ margin:'4px 0 0', fontSize:13 }}>{lang==='es'?'Esperando que el cliente realice el pago.':'Waiting for client to process payment.'}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showChat && (
        <FloatingChat 
          otherUid={pro.uid} 
          otherName={pro.name} 
          otherColor={pro.color} 
          otherPhone={pro.phone} 
          lang={lang} 
          onClose={() => setShowChat(false)} 
          zIndex={5000}
        />
      )}

      {showImprevistoModal && (
        <ImprevistoModal 
          lang={lang} 
          onClose={() => setShowImprevistoModal(false)} 
          orderInfo={professional} 
          proName={pro.name} 
        />
      )}
    </div>
  )
}