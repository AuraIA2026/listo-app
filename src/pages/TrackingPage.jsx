import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { collection, addDoc, serverTimestamp, doc, updateDoc, onSnapshot, orderBy, query, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { db, auth } from '../firebase'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './TrackingPage.css'
import vanImg from '../assets/van.png'
import { ReportModal } from './ChatPage'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  shadowUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  iconRetinaUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  iconSize: [0, 0], shadowSize: [0, 0],
})

const clientIcon = L.divIcon({
  className: '',
  html: `<div class="map-marker client-marker"><div class="marker-pulse"></div><div class="marker-icon">🏠</div></div>`,
  iconSize: [48, 48], iconAnchor: [24, 48],
})
const createVanIcon = (imgSrc) => L.divIcon({
  className: 'leaflet-van-icon',
  html: `<img src="${imgSrc}" alt="van" style="width:64px;height:64px;object-fit:contain;display:block;filter:drop-shadow(0 4px 8px rgba(242,96,0,0.5));" />`,
  iconSize: [64, 64], iconAnchor: [32, 32], popupAnchor: [0, -32],
})
const createWorkerIcon = () => L.divIcon({
  className: 'leaflet-worker-icon',
  html: `<div style="background:white;border-radius:50%;padding:4px;border:2px solid #F26000;box-shadow:0 4px 12px rgba(242,96,0,0.4);display:flex;align-items:center;justify-content:center;overflow:hidden;width:50px;height:50px;"><span style="font-size:28px;line-height:1;animation:workerFloat 2s ease-in-out infinite alternate;">👨‍🔧</span></div>`,
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
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    audio.volume = 0.5; audio.loop = false
    audio.play().catch(() => {})
    setTimeout(() => { try { audio.pause(); audio.currentTime = 0 } catch(e) {} }, 1500)
  } catch(e) {}
}

function lerp(a, b, t) { return a + (b - a) * t }

function SmoothMarker({ targetPos, icon, children, visible = true }) {
  const markerRef = useRef(null), currentPos = useRef(targetPos)
  const animFrameRef = useRef(null), startTimeRef = useRef(null), fromPos = useRef(targetPos)
  useEffect(() => {
    fromPos.current = [...currentPos.current]; startTimeRef.current = null
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    const animate = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts
      const t = Math.min((ts - startTimeRef.current) / 2500, 1)
      const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t
      const lat = lerp(fromPos.current[0], targetPos[0], e)
      const lng = lerp(fromPos.current[1], targetPos[1], e)
      currentPos.current = [lat, lng]
      if (markerRef.current) markerRef.current.setLatLng([lat, lng])
      if (t < 1) animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [targetPos[0], targetPos[1]]) // eslint-disable-line
  if (!visible) return null
  return <Marker ref={markerRef} position={currentPos.current} icon={icon}>{children}</Marker>
}

/* ── Modal llamada ─────────────────────────────────────────────────────────── */
function CallModal({ name, phone, lang, onClose }) {
  const clean    = (phone || '').replace(/[\s\-()]/g, '')
  const waNumber = clean.startsWith('+') ? clean.replace('+', '') : `1${clean}`
  return (
    <>
      <style>{`@keyframes callModalIn{from{transform:translateX(-50%) translateY(30px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}`}</style>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.1)', zIndex:5000 }} />
      <div style={{ position:'fixed', bottom:40, left:'50%', transform:'translateX(-50%)', width:'calc(100% - 48px)', maxWidth:360, background:'#fff', borderRadius:24, padding:'28px 24px 20px', zIndex:5001, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', animation:'callModalIn .3s cubic-bezier(.32,1.2,.5,1)', textAlign:'center' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'#F26000', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:24, margin:'0 auto 12px', boxShadow:'0 4px 16px rgba(242,96,0,0.3)' }}>{(name||'?').substring(0,2).toUpperCase()}</div>
        <h3 style={{ margin:'0 0 4px', fontSize:18, fontWeight:900, color:'#1A1A2E' }}>{name}</h3>
        <p style={{ margin:'0 0 24px', fontSize:13, color:'#999' }}>{phone||(lang==='es'?'Sin número registrado':'No phone registered')}</p>
        {phone ? (
          <div style={{ display:'flex', gap:12, marginBottom:16 }}>
            <a href={`tel:${clean}`} onClick={onClose} style={{ flex:1, padding:'14px 8px', borderRadius:16, background:'#F26000', color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', gap:6, textDecoration:'none', fontWeight:700, fontSize:13, boxShadow:'0 4px 16px rgba(242,96,0,0.3)' }}>
              <span style={{ fontSize:28 }}>📞</span>{lang==='es'?'Llamada directa':'Direct call'}
            </a>
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" onClick={onClose} style={{ flex:1, padding:'14px 8px', borderRadius:16, background:'#25D366', color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', gap:6, textDecoration:'none', fontWeight:700, fontSize:13, boxShadow:'0 4px 16px rgba(37,211,102,0.3)' }}>
              <span style={{ fontSize:28 }}>💬</span>WhatsApp
            </a>
          </div>
        ) : (
          <div style={{ padding:16, background:'#FFF3EC', borderRadius:12, marginBottom:16 }}>
            <p style={{ margin:0, fontSize:13, color:'#F26000', fontWeight:600 }}>{lang==='es'?'Este usuario no tiene número de teléfono registrado.':'This user has no registered phone number.'}</p>
          </div>
        )}
        <button onClick={onClose} style={{ width:'100%', padding:14, borderRadius:14, background:'#F5F5F5', border:'none', color:'#666', fontWeight:700, fontSize:14, cursor:'pointer' }}>{lang==='es'?'Cancelar':'Cancel'}</button>
      </div>
    </>
  )
}

/* ── Chat flotante ─────────────────────────────────────────────────────────── */
function FloatingChat({ pro, lang, onClose }) {
  const me      = auth.currentUser
  const otherId = pro?.uid || pro?.proId || pro?.clientId || null
  const chatId  = me && otherId ? getChatId(me.uid, otherId) : null
  const initials = (pro?.name || '?').substring(0, 2).toUpperCase()

  const [messages,  setMessages]  = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping,  setIsTyping]  = useState(false)
  const [showCall,  setShowCall]  = useState(false)
  const [showReport, setShowReport] = useState(false)

  const messagesEndRef = useRef(null)
  const typingTimer    = useRef(null)
  const seenMsgIds     = useRef(new Set())
  const isFirstLoad    = useRef(true)

  useEffect(() => {
    if (!chatId || !me || !otherId) return
    getDoc(doc(db, 'chats', chatId)).then(snap => {
      if (!snap.exists()) {
        setDoc(doc(db, 'chats', chatId), {
          members: [me.uid, otherId], lastMsg: '', updatedAt: serverTimestamp(),
          unreadCount: { [me.uid]: 0, [otherId]: 0 },
          typing: { [me.uid]: false, [otherId]: false },
        }).catch(() => {})
      }
    }).catch(() => {})
  }, [chatId]) // eslint-disable-line

  useEffect(() => {
    if (!chatId) return
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      if (isFirstLoad.current) {
        msgs.forEach(m => seenMsgIds.current.add(m.id))
        isFirstLoad.current = false
      } else {
        msgs.forEach(m => {
          if (!seenMsgIds.current.has(m.id)) {
            seenMsgIds.current.add(m.id)
            if (m.senderId !== me?.uid) playChatMsgSound()
          }
        })
      }
      setMessages(msgs)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
      updateDoc(doc(db, 'chats', chatId), { [`unreadCount.${me?.uid}`]: 0 }).catch(() => {})
    })
    return () => unsub()
  }, [chatId]) // eslint-disable-line

  useEffect(() => {
    if (!chatId || !otherId) return
    const unsub = onSnapshot(doc(db, 'chats', chatId), snap => {
      setIsTyping(snap.data()?.typing?.[otherId] === true)
    })
    return () => unsub()
  }, [chatId, otherId])

  const sendMessage = async () => {
    if (!inputText.trim() || !chatId || !me) return
    const text = inputText.trim()
    setInputText('')
    updateDoc(doc(db, 'chats', chatId), { [`typing.${me.uid}`]: false }).catch(() => {})
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text, senderId: me.uid, createdAt: serverTimestamp(), status: 'sent',
    }).catch(() => {})
    await updateDoc(doc(db, 'chats', chatId), { lastMsg: text, updatedAt: serverTimestamp() }).catch(() => {})
  }

  const handleDeleteMessage = async (msgId) => {
    if (window.confirm(lang === 'es' ? '¿Borrar este mensaje?' : 'Delete this message?')) {
      await deleteDoc(doc(db, 'chats', chatId, 'messages', msgId)).catch(() => {})
    }
  }

  const handleInput = (e) => {
    setInputText(e.target.value)
    if (!chatId || !me) return
    updateDoc(doc(db, 'chats', chatId), { [`typing.${me.uid}`]: true }).catch(() => {})
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      updateDoc(doc(db, 'chats', chatId), { [`typing.${me.uid}`]: false }).catch(() => {})
    }, 2000)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const fmtTime = (ts) => {
    if (!ts) return ''
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts)
      if (isNaN(d.getTime())) return ''
      return d.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
    } catch(e) {
      return ''
    }
  }

  return (
    <>
      <style>{`
        @keyframes chatSlideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes typingDot { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      `}</style>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.1)', zIndex:4000 }} />
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, height:'50vh', background:'#fff', borderRadius:'24px 24px 0 0', boxShadow:'0 -8px 40px rgba(0,0,0,0.25)', zIndex:4001, display:'flex', flexDirection:'column', animation:'chatSlideUp .35s cubic-bezier(.32,1.2,.5,1)' }}>
        <div style={{ width:40, height:4, background:'#ddd', borderRadius:2, margin:'12px auto 0', flexShrink:0 }} />
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid #f0f0f0', flexShrink:0 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', background:pro?.color||'#F26000', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:15, flexShrink:0 }}>{initials}</div>
          <div style={{ flex:1 }}>
            <p style={{ margin:0, fontWeight:800, fontSize:15, color:'#1A1A2E' }}>{pro?.name||'Usuario'}</p>
            <p style={{ margin:0, fontSize:12, color:isTyping?'#F26000':'#22C55E', fontWeight:600 }}>{isTyping?'✍️ Escribiendo...':'● En línea'}</p>
          </div>
          <button onClick={() => setShowReport(true)} style={{ width:38, height:38, borderRadius:'50%', background:'#FEE2E2', border:'none', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, cursor:'pointer', flexShrink:0 }} title="Reportar / Bloquear">⚠️</button>
          <button onClick={() => setShowCall(true)} style={{ width:38, height:38, borderRadius:'50%', background:pro?.phone?'#FFF3EC':'#f5f5f5', border:pro?.phone?'1px solid #FFD4B0':'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, cursor:'pointer', opacity:pro?.phone?1:0.4 }}>📞</button>
          <button onClick={onClose} style={{ width:38, height:38, borderRadius:'50%', background:'#f5f5f5', border:'none', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'12px 16px', display:'flex', flexDirection:'column', gap:8 }}>
          {messages.length === 0 && (
            <div style={{ textAlign:'center', margin:'auto', color:'#999', fontSize:13 }}>
              <p style={{ fontSize:32, margin:'0 0 8px' }}>👋</p>
              <p style={{ margin:0 }}>Inicia la conversación</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.senderId === me?.uid
            return (
              <div key={msg.id} style={{ display:'flex', justifyContent:isMe?'flex-end':'flex-start', gap:8 }}>
                {!isMe && <div style={{ width:26, height:26, borderRadius:'50%', background:pro?.color||'#F26000', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:10, flexShrink:0, marginTop:2 }}>{initials}</div>}
                <div style={{ maxWidth:'72%', padding:'9px 13px', borderRadius:isMe?'18px 18px 4px 18px':'18px 18px 18px 4px', background:isMe?'#F26000':'#F5F5F5', color:isMe?'#fff':'#1A1A2E', fontSize:14, lineHeight:1.4 }}>
                  <p style={{ margin:0 }}>{msg.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: 4 }}>
                    {isMe && (
                      <span 
                        onClick={() => handleDeleteMessage(msg.id)} 
                        style={{ cursor: 'pointer', fontSize: 13, opacity: 0.9, marginRight: 4 }}
                        title={lang === 'es' ? 'Borrar mensaje' : 'Delete message'}
                      >🗑️</span>
                    )}
                    <span style={{ fontSize:10, opacity:0.7 }}>{fmtTime(msg.createdAt)} {isMe&&'✓✓'}</span>
                  </div>
                </div>
              </div>
            )
          })}
          {isTyping && (
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:pro?.color||'#F26000', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10, fontWeight:700 }}>{initials}</div>
              <div style={{ background:'#F5F5F5', borderRadius:'18px 18px 18px 4px', padding:'10px 14px', display:'flex', gap:4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#999', animation:`typingDot 1.2s ease ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px 20px', borderTop:'1px solid #f0f0f0', flexShrink:0 }}>
          <input type="text" value={inputText} onChange={handleInput} onKeyDown={handleKey}
            placeholder={lang==='es'?'Escribe un mensaje...':'Type a message...'}
            style={{ flex:1, padding:'11px 16px', borderRadius:24, border:'1.5px solid #e0e0e0', fontSize:14, outline:'none', background:'#FAFAFA', color:'#1A1A2E' }} />
          <button onClick={sendMessage} disabled={!inputText.trim()} style={{ width:44, height:44, borderRadius:'50%', border:'none', background:inputText.trim()?'#F26000':'#e0e0e0', color:'#fff', fontSize:18, cursor:inputText.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s', flexShrink:0 }}>➤</button>
        </div>
      </div>
      {showCall && <CallModal name={pro?.name} phone={pro?.phone} lang={lang} onClose={() => setShowCall(false)} />}
      {showReport && <ReportModal lang={lang} otherUser={pro} onClose={() => setShowReport(false)} />}
    </>
  )
}

/* ── Componentes de estado ─────────────────────────────────────────────────── */
function WorkingAnimation() {
  return (
    <div className="working-anim-wrap">
      <div className="working-scene professional-scene" style={{ width:'auto', height:'140px' }}>
        <div className="professional-worker-emoji" style={{ fontSize:'90px', animation:'workerFloat 2.5s ease-in-out infinite alternate' }}>👨‍🔧</div>
        <div className="sparks"><span className="spark s1">✦</span><span className="spark s2">★</span><span className="spark s3">✦</span></div>
      </div>
    </div>
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

/* ── Página principal ──────────────────────────────────────────────────────── */
export default function TrackingPage({ lang = 'es', navigate, professional, userRole }) {
  const targetName = professional?.clientName || professional?.pro || professional?.proName || professional?.name || 'Cliente/Profesional'
  const targetAvT  = professional?.clientName?.substring(0,2).toUpperCase() || professional?.avatar || '👤'
  const targetCat  = professional?.specialty || professional?.proSpecialty || professional?.category || 'Servicio'

  const pro = {
    name:     targetName,
    avatar:   targetAvT,
    color:    professional?.color    || '#F26000',
    category: targetCat,
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

  const [eta,            setEta]            = useState(18)
  const [status,         setStatus]         = useState('on_way')
  const [workStatus,     setWorkStatus]     = useState('tracking')
  const [vanVisible,     setVanVisible]     = useState(true)
  const [showChat,       setShowChat]       = useState(false)

  // Audio llegada
  const arrivingAudioRef    = useRef(null)
  const arrivingSoundPlayed = useRef(false)
  const arrivingTimerRef    = useRef(null)

  const playArrivingSound = () => {
    if (arrivingSoundPlayed.current) return
    arrivingSoundPlayed.current = true
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
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

  const vanIcon    = useRef(null); if (!vanIcon.current)    vanIcon.current    = createVanIcon(vanImg)
  const workerIcon = useRef(null); if (!workerIcon.current) workerIcon.current = createWorkerIcon()
  const intervalRef = useRef(null)

  // Sincronizar con el documento de la orden en Firestore
  useEffect(() => {
    if (!professional?.id) return
    const unsub = onSnapshot(doc(db, 'orders', professional.id), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data()
        if (d.status === 'working') setWorkStatus('working')
        if (d.status === 'done') setWorkStatus('done')
        if (d.status === 'cancelled') setWorkStatus('declined_done')
        if (d.status === 'arrived') { setStatus('arrived'); setWorkStatus('awaiting_deal'); stopArrivingSound() }
        
        // Use real GPS coordinates if available
        if (d.proCoords) setProPos([d.proCoords.lat, d.proCoords.lng])
      }
    })
    return () => unsub()
  }, [professional?.id])

  // GPS Tracking Real para el Profesional
  useEffect(() => {
    if (userRole !== 'pro' || !professional?.id || workStatus !== 'tracking' || status === 'arrived') return
    
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
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
      return () => navigator.geolocation.clearWatch(watchId)
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
    setRemainingRoute(RETREAT_WAYPOINTS)
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

  const flowSteps = [
    { key:'confirmed', labelEs:'Confirmado', labelEn:'Confirmed' },
    { key:'onway',     labelEs:'En camino',  labelEn:'On the way' },
    { key:'arrived',   labelEs:'Llegó',      labelEn:'Arrived' },
    { key:'trato',     labelEs:'Acuerdo',    labelEn:'Agreement' },
    { key:'working',   labelEs:'Trabajando', labelEn:'Working' },
    { key:'done',      labelEs:'Listo',      labelEn:'Done' },
  ]
  const currentFlowIdx = () => workStatus==='done'?5:workStatus==='working'?4:workStatus==='awaiting_deal'?3:status==='arrived'?2:1

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
        <MapContainer center={mapCenter} zoom={14} className="tracking-map" zoomControl={false} attributionControl={false}>
          <MapResizer />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={clientLoc} icon={clientIcon}><Popup>{lang==='es'?'Tu ubicación':'Your location'}</Popup></Marker>
          {vanVisible && <SmoothMarker targetPos={proPos} icon={workStatus==='working'?workerIcon.current:vanIcon.current} visible={vanVisible}><Popup>{pro.name}</Popup></SmoothMarker>}
        </MapContainer>
        {workStatus==='tracking' && (
          <div className="map-eta-pill" style={{ background:getStatusColor()+'22', borderColor:getStatusColor()+'44' }}>
            <span className="eta-icon">{getStatusIcon()}</span>
            <span className="eta-text" style={{ color:getStatusColor() }}>{status==='arrived'?getStatusLabel():`${eta} min`}</span>
          </div>
        )}
      </div>

      <div className="tracking-card">
        <div className={`tracking-status-bar ${workStatus==='working'?'status-bar-working':''}`}
          style={workStatus==='working'?{}:{ background:getStatusColor()+'15', borderColor:getStatusColor()+'30' }}>
          <span className="status-icon">{getStatusIcon()}</span>
          <div style={{ flex:1 }}>
            <p className="status-label" style={{ color:getStatusColor() }}>{getStatusLabel()}</p>
            <p className="status-desc">{getStatusDesc()}</p>
          </div>
          {workStatus==='tracking' && status!=='arrived' && (
            <div className="eta-countdown"><span className="eta-number">{eta}</span><span className="eta-unit">min</span></div>
          )}
        </div>

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
              <div className="tracking-pro-actions">
                <button className="track-action-btn call" onClick={() => setShowChat(true)} style={{ opacity: pro.phone ? 1 : 0.4 }}>📞</button>
                <button className="track-action-btn chat" onClick={() => setShowChat(true)}>💬</button>
              </div>
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
              <div style={{ marginTop: 16 }}>
                <button onClick={async () => {
                  try { await updateDoc(doc(db, 'orders', professional.id), { status: 'arrived' }) } catch(e) {}
                  setStatus('arrived'); setWorkStatus('awaiting_deal'); stopArrivingSound()
                }} style={{ width:'100%', padding:16, borderRadius:16, border:'none', background:'#F26000', color:'#fff', fontWeight:900, fontSize:16, boxShadow:'0 8px 30px rgba(242,96,0,0.4)', cursor:'pointer', animation: 'timerPulse 2s infinite' }}>✅ {lang==='es'?'Llegué a la ubicación':'I arrived'}</button>
              </div>
            )}

            {/* ── Trabajando: pro ve info, usuario ve info ── */}
            {workStatus==='working' && (
              <div className="tracking-info-box" style={{ background:'#F0FDF4', padding:16, borderRadius:12, textAlign:'center', border:'1px dashed #34D399' }}>
                <p style={{ margin:0, fontSize:14, color:'#065F46', fontWeight:700 }}>
                  {userRole==='pro'
                    ? (lang==='es'?'🔧 Cuando termines ve a Pedidos → Ver orden activa → ¡Listo Patrón!':'🔧 When done go to Orders → View active order → Done Boss!')
                    : (lang==='es'?'🔧 El profesional está trabajando. Te notificaremos cuando termine.':'🔧 Professional is working. We will notify you when done.')
                  }
                </p>
              </div>
            )}

            {workStatus==='done' && userRole==='user' && (
              <div className="tracking-done-actions">
                <button className="tracking-flow-btn pay-btn" onClick={() => navigate('payment', professional)}>
                  💳 {lang==='es'?'Pagar ahora':'Pay now'}
                </button>
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

      {showChat && <FloatingChat pro={pro} lang={lang} onClose={() => setShowChat(false)} />}
    </div>
  )
}