import { useState, useEffect, useRef } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, deleteDoc,
         addDoc, serverTimestamp, orderBy, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import './OrdersPage.css'
import { ReportModal } from './ChatPage'

const txt = {
  es: {
    title:   'Mis Pedidos',
    active:  'Activos',
    history: 'Historial',
    status: {
      pending:   'Pendiente',
      accepted:  'Aceptado',
      onway:     'En camino',
      arrived:   'Llegó al lugar',
      trato:     'Trato hecho',
      working:   'Trabajando',
      done:      'Completado',
      cancelled: 'Cancelado',
    },
    track:             'Seguir en mapa',
    tratoHecho:        '✅ Trato hecho',
    listo:             '✅ ¡Listo Patrón!',
    review:            '⭐ Calificar',
    rebook:            '↩ Repetir',
    decline:           '✖ Rechazar',
    empty:             'No tienes pedidos aún',
    emptySub:          'Reserva tu primer servicio',
    reviewTitle:       'Califica a tu profesional',
    reviewSub:         '¿Cómo fue el servicio?',
    reviewSend:        'Enviar reseña',
    reviewPlaceholder: 'Escribe un comentario (opcional)...',
    rated:             'Calificado',
    newOrderAlert:     '🤝 ¡Tienes un contrato nuevo!',
    newOrderDesc:      'Un cliente quiere contratar tus servicios',
    viewDetails:       'Ver detalles',
  },
  en: {
    title:   'My Orders',
    active:  'Active',
    history: 'History',
    status: {
      pending:   'Pending',
      accepted:  'Accepted',
      onway:     'On the way',
      arrived:   'Arrived',
      trato:     'Deal made',
      working:   'Working',
      done:      'Completed',
      cancelled: 'Cancelled',
    },
    track:             'Track on map',
    tratoHecho:        '✅ Deal made',
    listo:             '✅ Done Boss!',
    review:            '⭐ Review',
    rebook:            '↩ Rebook',
    decline:           '✖ Decline',
    empty:             'No orders yet',
    emptySub:          'Book your first service',
    reviewTitle:       'Rate your professional',
    reviewSub:         'How was the service?',
    reviewPlaceholder: 'Write a comment (optional)...',
    rated:             'Reviewed',
    newOrderAlert:     '🤝 New contract!',
    newOrderDesc:      'A client wants to hire your services',
    viewDetails:       'View details',
  },
}

const avatarColors = ['#F26000', '#C24D00', '#FF8533', '#7A3000', '#FFB380']

const statusColor = (s) => ({
  pending:   '#F59E0B',
  accepted:  '#8B5CF6',
  onway:     '#3B82F6',
  arrived:   '#F26000',
  trato:     '#059669',
  working:   '#0EA5E9',
  done:      '#10B981',
  cancelled: '#EF4444',
})[s] || '#999'

const nextStatus = {
  pending:  'accepted',
  accepted: 'onway',
  onway:    'arrived',
  arrived:  'trato',
  trato:    'working',
  working:  'done',
}

const PROGRESS_STEPS  = ['pending', 'onway', 'arrived', 'trato', 'working', 'done']
const PROGRESS_LABELS = {
  es: ['Pendiente','Camino','Llegó','Trato','Trabajando','Listo'],
  en: ['Pending','On way','Arrived','Deal','Working','Done'],
}

const isPaymentNotif  = (text = '') => {
  const t = text.toLowerCase()
  return t.includes('pago') || t.includes('payment') || t.includes('procede') || t.includes('proceed')
}
const isNewOrderNotif = (n) => n.type === 'new_order' || n.title === '¡Nuevo Pedido!'
const deleteNotifsByOrderId = async (orderId, notifs) => {
  const toDelete = notifs.filter(n => n.orderId === orderId)
  await Promise.all(toDelete.map(n => deleteDoc(doc(db, 'notificaciones', n.id)).catch(() => {})))
}
const getChatId = (uid1, uid2) => uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`

// ─── Sonido de mensaje — igual al que le gusta al usuario ─────────────────
const playChatMsgSound = () => {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    audio.volume = 0.5
    audio.loop   = false
    audio.play().catch(() => {})
    // Cortar a 1.5s para que suene como tono corto de notificación
    setTimeout(() => { try { audio.pause(); audio.currentTime = 0 } catch(e) {} }, 1500)
  } catch(e) {}
}

/* ─────────────────────────────────────────────
   WORKING TIMER — diseño 3D profesional
───────────────────────────────────────────── */
function WorkingTimer({ startedAt, lang, isPro, onFinish }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const base = startedAt?.seconds ? startedAt.seconds * 1000
                 : startedAt ? new Date(startedAt).getTime()
                 : Date.now()
    const tick = () => setElapsed(Math.floor((Date.now() - base) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  const hrs     = Math.floor(elapsed / 3600)
  const mins    = Math.floor((elapsed % 3600) / 60)
  const secs    = elapsed % 60
  const fmt     = (n) => String(n).padStart(2, '0')
  const timeStr = hrs > 0
    ? `${fmt(hrs)}:${fmt(mins)}:${fmt(secs)}`
    : `${fmt(mins)}:${fmt(secs)}`

  const barColor = elapsed < 3600 ? '#10B981' : elapsed < 7200 ? '#F59E0B' : '#EF4444'
  const glowColor = elapsed < 3600 ? 'rgba(16,185,129,0.6)' : elapsed < 7200 ? 'rgba(245,158,11,0.6)' : 'rgba(239,68,68,0.6)'
  const barDur   = elapsed < 3600 ? '3s' : elapsed < 7200 ? '2s' : '1s'
  const label    = elapsed < 3600
    ? (lang==='es'?'EN PROGRESO':'IN PROGRESS')
    : elapsed < 7200
    ? (lang==='es'?'TIEMPO CORRIENDO':'TIME RUNNING')
    : (lang==='es'?'TIEMPO EXTENDIDO':'EXTENDED TIME')

  return (
    <>
      <style>{`
        @keyframes timerSlide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes timerPulse {
          0%,100% { box-shadow: 0 0 0 0 ${glowColor}; }
          50%      { box-shadow: 0 0 0 8px transparent; }
        }
        @keyframes timerFlicker {
          0%,100% { opacity:1; }
          92%     { opacity:1; }
          93%     { opacity:0.7; }
          94%     { opacity:1; }
        }
        @keyframes dotBlink {
          0%,100% { opacity:1; }
          50%     { opacity:0.2; }
        }
      `}</style>

      {isPro ? (
        /* ── PRO: botón compacto 3D ── */
        <button
          onClick={onFinish}
          style={{
            width:'100%', padding:'0', borderRadius:14, border:'none',
            cursor:'pointer', marginBottom:8, overflow:'hidden',
            background:'transparent',
            boxShadow:'0 6px 0 #C24D00, 0 8px 20px rgba(242,96,0,0.4)',
            transform:'translateY(0)',
            transition:'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseDown={e => { e.currentTarget.style.transform='translateY(4px)'; e.currentTarget.style.boxShadow='0 2px 0 #C24D00, 0 4px 10px rgba(242,96,0,0.3)' }}
          onMouseUp={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 0 #C24D00, 0 8px 20px rgba(242,96,0,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 0 #C24D00, 0 8px 20px rgba(242,96,0,0.4)' }}
        >
          <div style={{
            background:'linear-gradient(135deg, #F26000 0%, #C24D00 100%)',
            padding:'11px 16px',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
            position:'relative', overflow:'hidden',
          }}>
            {/* Barra deslizante de fondo */}
            <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
              <div style={{
                position:'absolute', top:0, left:0, width:'35%', height:'100%',
                background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation:`timerSlide ${barDur} linear infinite`,
              }} />
            </div>
            {/* Izquierda: icono + texto */}
            <div style={{ display:'flex', alignItems:'center', gap:8, zIndex:1 }}>
              <div style={{
                width:32, height:32, borderRadius:8,
                background:'rgba(255,255,255,0.2)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:16, flexShrink:0,
                boxShadow:`0 2px 8px ${glowColor}`,
              }}>📋</div>
              <div style={{ textAlign:'left' }}>
                <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.7)', fontWeight:600, letterSpacing:1, textTransform:'uppercase' }}>
                  {lang==='es'?'Orden activa':'Active order'}
                </p>
                <p style={{ margin:0, fontSize:13, color:'#fff', fontWeight:800 }}>
                  {lang==='es'?'Ver detalles →':'View details →'}
                </p>
              </div>
            </div>
            {/* Derecha: timer */}
            <div style={{
              display:'flex', flexDirection:'column', alignItems:'center',
              background:'rgba(255,255,255,0.18)', borderRadius:10,
              padding:'6px 12px', zIndex:1, flexShrink:0,
              border:'1px solid rgba(255,255,255,0.3)',
              animation:'timerPulse 2s ease infinite',
            }}>
              <span style={{
                fontSize:11, color:'#fff', fontWeight:700,
                letterSpacing:2, textTransform:'uppercase',
              }}>{label}</span>
              <span style={{
                fontSize:20, fontWeight:900, color:'#fff',
                fontVariantNumeric:'tabular-nums', letterSpacing:2,
                fontFamily:'monospace',
                animation:'timerFlicker 4s ease infinite',
              }}>{timeStr}</span>
              <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:2 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:'#fff', animation:'dotBlink 1s ease infinite' }}/>
                <span style={{ fontSize:9, color:'#fff', fontWeight:700, letterSpacing:1 }}>LIVE</span>
              </div>
            </div>
          </div>
        </button>
      ) : (
        /* ── CLIENTE: tarjeta compacta con timer 3D ── */
        <div style={{
          borderRadius:14, overflow:'hidden', marginBottom:8,
          background:'linear-gradient(135deg, #F26000 0%, #C24D00 100%)',
          boxShadow:'0 6px 0 #C24D00, 0 8px 20px rgba(242,96,0,0.35)',
        }}>
          {/* Barra top */}
          <div style={{ height:3, background:'rgba(255,255,255,0.2)', overflow:'hidden' }}>
            <div style={{
              height:'100%', width:'35%',
              background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              animation:`timerSlide ${barDur} linear infinite`,
            }} />
          </div>
          <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
            {/* Icono */}
            <div style={{
              width:40, height:40, borderRadius:10, flexShrink:0,
              background:'rgba(255,255,255,0.15)',
              border:'1px solid rgba(255,255,255,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
            }}>🔧</div>
            {/* Texto */}
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:0, fontSize:12, fontWeight:800, color:'#fff' }}>
                {lang==='es'?'El profesional está trabajando':'Professional is working'}
              </p>
              <p style={{ margin:'2px 0 0', fontSize:10, color:'rgba(255,255,255,0.7)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {lang==='es'?'Recibirás una notificación al terminar':'You\'ll be notified when done'}
              </p>
            </div>
            {/* Timer */}
            <div style={{
              display:'flex', flexDirection:'column', alignItems:'center',
              background:'rgba(255,255,255,0.18)', borderRadius:10,
              padding:'5px 10px', flexShrink:0,
              border:'1px solid rgba(255,255,255,0.3)',
              animation:'timerPulse 2s ease infinite',
            }}>
              <span style={{ fontSize:9, color:'#fff', fontWeight:700, letterSpacing:1.5, textTransform:'uppercase' }}>
                {label}
              </span>
              <span style={{
                fontSize:18, fontWeight:900, color:'#fff',
                fontVariantNumeric:'tabular-nums', letterSpacing:2,
                fontFamily:'monospace',
                animation:'timerFlicker 4s ease infinite',
              }}>{timeStr}</span>
              <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                <div style={{ width:4, height:4, borderRadius:'50%', background:'#fff', animation:'dotBlink 1s ease infinite' }}/>
                <span style={{ fontSize:8, color:'#fff', fontWeight:700, letterSpacing:1 }}>LIVE</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


/* ─────────────────────────────────────────────
   MODAL DE LLAMADA
───────────────────────────────────────────── */
function CallModal({ name, phone, lang, onClose }) {
  const clean    = (phone || '').replace(/[\s\-()]/g, '')
  const waNumber = clean.startsWith('+') ? clean.replace('+', '') : `1${clean}`
  return (
    <>
      <style>{`@keyframes callModalIn{from{transform:translateX(-50%) translateY(30px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}`}</style>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.1)', zIndex:5000 }} />
      <div style={{
        position:'fixed', bottom:40, left:'50%', transform:'translateX(-50%)',
        width:'calc(100% - 48px)', maxWidth:360, background:'#fff', borderRadius:24,
        padding:'28px 24px 20px', zIndex:5001, boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
        animation:'callModalIn .3s cubic-bezier(.32,1.2,.5,1)', textAlign:'center',
      }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'#F26000', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:24, margin:'0 auto 12px', boxShadow:'0 4px 16px rgba(242,96,0,0.3)' }}>
          {(name||'?').substring(0,2).toUpperCase()}
        </div>
        <h3 style={{ margin:'0 0 4px', fontSize:18, fontWeight:900, color:'#1A1A2E' }}>{name}</h3>
        <p style={{ margin:'0 0 24px', fontSize:13, color:'#999' }}>{phone || (lang==='es'?'Sin número registrado':'No phone registered')}</p>
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

/* ─────────────────────────────────────────────
   FLOATING CHAT
───────────────────────────────────────────── */
function FloatingChat({ otherUid, otherName, otherColor = '#F26000', otherPhone = null, lang, onClose }) {
  const me       = auth.currentUser
  const chatId   = me && otherUid ? getChatId(me.uid, otherUid) : null
  const initials = (otherName || '?').substring(0, 2).toUpperCase()

  const [messages,  setMessages]  = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping,  setIsTyping]  = useState(false)
  const [showCall,  setShowCall]  = useState(false)
  const [showReport, setShowReport] = useState(false)

  const messagesEndRef = useRef(null)
  const typingTimer    = useRef(null)
  const seenMsgIds     = useRef(new Set())  // persiste entre renders
  const isFirstLoad    = useRef(true)       // primera entrega no suena



  // Crear chat si no existe
  useEffect(() => {
    if (!chatId || !me || !otherUid) return
    getDoc(doc(db, 'chats', chatId)).then(snap => {
      if (!snap.exists()) {
        setDoc(doc(db, 'chats', chatId), {
          members: [me.uid, otherUid], lastMsg: '', updatedAt: serverTimestamp(),
          unreadCount: { [me.uid]: 0, [otherUid]: 0 },
          typing: { [me.uid]: false, [otherUid]: false },
        }).catch(() => {})
      }
    }).catch(() => {})
  }, [chatId]) // eslint-disable-line

  // Escuchar mensajes
  useEffect(() => {
    if (!chatId) return
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))

      if (isFirstLoad.current) {
        // Primera entrega: marcar todos como vistos, NO sonar
        msgs.forEach(m => seenMsgIds.current.add(m.id))
        isFirstLoad.current = false
      } else {
        // Entregas siguientes: sonar solo en mensajes nuevos del OTRO
        msgs.forEach(m => {
          if (!seenMsgIds.current.has(m.id)) {
            seenMsgIds.current.add(m.id)
            if (m.senderId !== me?.uid) {
              playChatMsgSound()
            }
          }
        })
      }

      setMessages(msgs)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
      updateDoc(doc(db, 'chats', chatId), { [`unreadCount.${me?.uid}`]: 0 }).catch(() => {})
    })
    return () => unsub()
  }, [chatId]) // eslint-disable-line

  // Typing del otro
  useEffect(() => {
    if (!chatId || !otherUid) return
    const unsub = onSnapshot(doc(db, 'chats', chatId), snap => {
      setIsTyping(snap.data()?.typing?.[otherUid] === true)
    })
    return () => unsub()
  }, [chatId, otherUid])

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
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid #f0f0f0', flexShrink:0 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background:otherColor, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:15, flexShrink:0 }}>{initials}</div>
          <div style={{ flex:1 }}>
            <p style={{ margin:0, fontWeight:800, fontSize:15, color:'#1A1A2E' }}>{otherName}</p>
            <p style={{ margin:0, fontSize:12, fontWeight:600, color: isTyping?'#F26000':'#22C55E' }}>{isTyping?'✍️ Escribiendo...':'● En línea'}</p>
          </div>
          <button onClick={() => setShowReport(true)} style={{ width:38, height:38, borderRadius:'50%', background:'#FEE2E2', border:'none', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, cursor:'pointer', flexShrink:0 }} title="Reportar / Bloquear">⚠️</button>
          <button onClick={() => setShowCall(true)} style={{ width:38, height:38, borderRadius:'50%', background:otherPhone?'#FFF3EC':'#f5f5f5', border:otherPhone?'1px solid #FFD4B0':'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, cursor:'pointer', opacity:otherPhone?1:0.45 }}>📞</button>
          <button onClick={onClose} style={{ width:38, height:38, borderRadius:'50%', background:'#f5f5f5', border:'none', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        {/* Mensajes */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 16px', display:'flex', flexDirection:'column', gap:8 }}>
          {messages.length === 0 && (
            <div style={{ textAlign:'center', margin:'auto', color:'#999', fontSize:13 }}>
              <p style={{ fontSize:32, margin:'0 0 8px' }}>👋</p>
              <p style={{ margin:0 }}>{lang==='es'?`Inicia la conversación con ${otherName}`:`Start the conversation`}</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.senderId === me?.uid
            return (
              <div key={msg.id} style={{ display:'flex', justifyContent:isMe?'flex-end':'flex-start', gap:8 }}>
                {!isMe && <div style={{ width:26, height:26, borderRadius:'50%', background:otherColor, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:10, flexShrink:0, marginTop:2 }}>{initials}</div>}
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
              <div style={{ width:26, height:26, borderRadius:'50%', background:otherColor, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10, fontWeight:700 }}>{initials}</div>
              <div style={{ background:'#F5F5F5', borderRadius:'18px 18px 18px 4px', padding:'10px 14px', display:'flex', gap:4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#999', animation:`typingDot 1.2s ease ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px 24px', borderTop:'1px solid #f0f0f0', flexShrink:0 }}>
          <input type="text" value={inputText} onChange={handleInput} onKeyDown={handleKey}
            placeholder={lang==='es'?'Escribe un mensaje...':'Type a message...'}
            style={{ flex:1, padding:'11px 16px', borderRadius:24, border:'1.5px solid #e0e0e0', fontSize:14, outline:'none', background:'#FAFAFA', color:'#1A1A2E' }} />
          <button onClick={sendMessage} disabled={!inputText.trim()} style={{ width:44, height:44, borderRadius:'50%', border:'none', background:inputText.trim()?'#F26000':'#e0e0e0', color:'#fff', fontSize:18, cursor:inputText.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s', flexShrink:0 }}>➤</button>
        </div>
      </div>
      {showCall && <CallModal name={otherName} phone={otherPhone} lang={lang} onClose={() => setShowCall(false)} />}
      {showReport && <ReportModal lang={lang} otherUser={{ uid: otherUid, name: otherName }} onClose={() => setShowReport(false)} />}
    </>
  )
}

/* ─────────────────────────────────────────────
   MODAL NOTIFICACIONES
───────────────────────────────────────────── */
function NotificacionesModal({ onClose, notifs, lang, onMarkAllRead, navigate, orders, onOpenOrder }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:2000, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:'480px', background:'#fff', borderRadius:'24px 24px 0 0', padding:'16px 20px 40px', animation:'slideUp .3s cubic-bezier(.32,1.2,.5,1)', maxHeight:'75vh', display:'flex', flexDirection:'column' }}>
        <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
        <div style={{ width:40, height:4, background:'#ddd', borderRadius:2, margin:'0 auto 16px', flexShrink:0 }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexShrink:0 }}>
          <h3 style={{ fontSize:18, fontWeight:900, color:'#1A1A2E', margin:0 }}>🔔 Notificaciones</h3>
          {notifs.some(n => !n.read) && <button onClick={onMarkAllRead} style={{ background:'none', border:'none', color:'#F26000', fontSize:12, fontWeight:700, cursor:'pointer' }}>✓ Marcar todas como leídas</button>}
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {notifs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 20px' }}>
              <p style={{ fontSize:40, margin:'0 0 10px' }}>🔔</p>
              <p style={{ fontSize:15, fontWeight:700, color:'#1A1A2E', margin:'0 0 6px' }}>{lang==='es'?'No tienes notificaciones':'No notifications yet'}</p>
            </div>
          ) : notifs.map((n, i) => {
            const isPago = isPaymentNotif(n.text), isNuevoPedido = isNewOrderNotif(n)
            const relatedOrder = n.orderId ? orders.find(o => o.id===n.orderId) : orders.find(o => o.status==='done'&&o.paymentStatus!=='approved'&&o.paymentStatus!=='pending_cash')
            const isClickable = (isPago&&relatedOrder)||(isNuevoPedido&&n.orderId)
            const handleClick = async () => {
              try { await updateDoc(doc(db,'notificaciones',n.id), { read:true }) } catch(e) {}
              if (isPago&&relatedOrder) { onClose(); navigate('payment', { ...relatedOrder, orderId:relatedOrder.id }) }
              else if (isNuevoPedido&&n.orderId) { onClose(); onOpenOrder(n.orderId) }
            }
            return (
              <div key={i} onClick={isClickable?handleClick:undefined} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:12, borderRadius:12, marginBottom:8, background:n.read?'#fff':'#FFF3EC', border:n.read?'1px solid #f0f0f0':'1px solid #FFD580', cursor:isClickable?'pointer':'default', transition:'transform 0.15s' }}
                onMouseEnter={e => { if (isClickable) e.currentTarget.style.transform='scale(1.01)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='scale(1)' }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{n.icon||'🔔'}</span>
                <div style={{ flex:1 }}>
                  <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:n.read?600:800, color:'#1A1A2E' }}>{n.text}</p>
                  <p style={{ margin:0, fontSize:11, color:'#999' }}>{n.time}</p>
                  {isNuevoPedido&&n.orderId && <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:6, background:'#F26000', color:'white', borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:700 }}>📋 {lang==='es'?'Ver pedido →':'View order →'}</div>}
                  {isPago&&relatedOrder && <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:6, background:'#10B981', color:'white', borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:700 }}>💳 {lang==='es'?'Ir al Pago →':'Go to Payment →'}</div>}
                </div>
                {!n.read && <div style={{ width:8, height:8, borderRadius:'50%', background:'#F26000', flexShrink:0, marginTop:4 }} />}
              </div>
            )
          })}
        </div>
        <button onClick={onClose} style={{ width:'100%', background:'none', border:'none', color:'#999', fontSize:13, fontWeight:600, marginTop:14, cursor:'pointer', flexShrink:0 }}>{lang==='es'?'Cerrar':'Close'}</button>
      </div>
    </div>
  )
}

function ReviewModal({ order, lang, onClose, onSubmit }) {
  const T = txt[lang]
  const [stars, setStars] = useState(0), [hover, setHover] = useState(0), [comment, setComment] = useState('')
  return (
    <div className="review-overlay" onClick={onClose}>
      <div className="review-modal" onClick={e => e.stopPropagation()}>
        <button className="review-close" onClick={onClose}>✕</button>
        <h3 className="review-title">{T.reviewTitle}</h3>
        <p className="review-pro-name">{order.pro}</p>
        <p className="review-sub">{T.reviewSub}</p>
        <div className="review-stars">{[1,2,3,4,5].map(s => <button key={s} className={`review-star ${s<=(hover||stars)?'active':''}`} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)} onClick={()=>setStars(s)}>★</button>)}</div>
        <textarea className="review-comment" placeholder={T.reviewPlaceholder} value={comment} onChange={e=>setComment(e.target.value)} rows={3} />
        <button className="review-submit" disabled={stars===0} onClick={()=>onSubmit(order.id,stars,comment)}>{T.reviewSend}</button>
      </div>
    </div>
  )
}

function ReceiptModal({ order, lang, onClose, onApprove }) {
  return (
    <div className="review-overlay" onClick={onClose}>
      <div className="review-modal" onClick={e => e.stopPropagation()}>
        <button className="review-close" onClick={onClose}>✕</button>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <span style={{ fontSize:40 }}>{order.paymentMethod==='card'?'💳':'🏦'}</span>
          <h3 style={{ margin:'8px 0', fontSize:18, fontWeight:900, color:'#1A1A2E' }}>{lang==='es'?'Pago Recibido':'Payment Received'}</h3>
          <p style={{ margin:0, fontSize:14, color:'#666' }}>{order.price}</p>
        </div>
        <div style={{ background:'#FAFAFA', borderRadius:12, padding:16, marginBottom:20, border:'1px solid #eee' }}>
          {order.paymentMethod==='transfer'
            ? <><p style={{ fontSize:13, color:'#555', margin:'0 0 8px' }}><strong>Depositante:</strong> {order.depositorName||'No especificado'}</p><p style={{ fontSize:13, color:'#555', margin:'0 0 8px' }}><strong>Banco:</strong> {order.depositBank||'No especificado'}</p><div style={{ width:'100%', height:140, background:'#eee', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#999', fontSize:12, marginTop:12 }}>[Foto de Comprobante Adjunta]</div></>
            : <><p style={{ fontSize:13, color:'#555', margin:'0 0 8px' }}><strong>Pasarela:</strong> AZUL Card Services</p><p style={{ fontSize:13, color:'#555', margin:'0 0 8px' }}><strong>Estado:</strong> Aprobado Digitalmente</p><div style={{ marginTop:12, padding:8, background:'#E3F2FD', borderRadius:6, color:'#1976D2', fontSize:12, fontWeight:'bold', textAlign:'center' }}>Transacción Segura Verificada</div></>
          }
        </div>
        <button style={{ width:'100%', padding:14, borderRadius:12, background:'#10B981', color:'white', border:'none', fontWeight:700, fontSize:15, cursor:'pointer' }} onClick={()=>onApprove(order.id)}>
          {lang==='es'?'Validar y Completar Trabajo ✅':'Approve & Complete ✅'}
        </button>
      </div>
    </div>
  )
}

export function OrderDetailsModal({ order, lang, onClose, onAccept, onDecline }) {
  const isEs = lang==='es'
  return (
    <div className="review-overlay" onClick={onClose} style={{ zIndex:3000 }}>
      <div className="review-modal order-details-modal" onClick={e => e.stopPropagation()}>
        <button className="review-close" onClick={onClose}>✕</button>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          {order.photoURL ? <img src={order.photoURL} alt="Client" style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', margin:'0 auto 12px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }} /> : <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg, #F26000, #FF8533)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:'bold', margin:'0 auto 12px', boxShadow:'0 4px 12px rgba(242,96,0,0.3)' }}>{order.avatar}</div>}
          <h3 style={{ fontSize:22, fontWeight:900, color:'#1A1A2E', margin:'0 0 4px', fontFamily:'var(--font-display)' }}>{order.pro}</h3>
          <p style={{ fontSize:14, color:'#666', margin:0 }}>📍 {order.clientAddress||order.address||(isEs?'Dirección no especificada':'Address not specified')}</p>
        </div>
        <div style={{ background:'#FAFAFA', borderRadius:16, padding:16, marginBottom:24, border:'1px solid #EEE' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12, paddingBottom:12, borderBottom:'1px dashed #DDD' }}><span style={{ fontSize:13, color:'#666', fontWeight:600 }}>{isEs?'Especialidad':'Specialty'}</span><span style={{ fontSize:14, color:'#1A1A2E', fontWeight:800 }}>{order.specialty}</span></div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12, paddingBottom:12, borderBottom:'1px dashed #DDD' }}><span style={{ fontSize:13, color:'#666', fontWeight:600 }}>{isEs?'Fecha/Hora':'Date/Time'}</span><span style={{ fontSize:14, color:'#1A1A2E', fontWeight:800 }}>{order.date}</span></div>
          {order.urgencyToken !== undefined && (
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12, paddingBottom:12, borderBottom:'1px dashed #DDD' }}>
              <span style={{ fontSize:13, color:'#666', fontWeight:600 }}>{isEs?'Urgencia':'Urgency'}</span>
              <span style={{ fontSize:14, color:order.urgencyToken===2?'#E31837':order.urgencyToken===1?'#F59E0B':'#10B981', fontWeight:800 }}>
                {order.urgencyToken===2 ? (isEs?'🚨 ¡Urgente!':'🚨 Urgent!') : order.urgencyToken===1 ? (isEs?'⚡ Rápido':'⚡ Fast') : (isEs?'🕐 Normal':'🕐 Normal')}
              </span>
            </div>
          )}
          {(order.serviceDesc || order.notes) && <div style={{ marginTop:12 }}><span style={{ fontSize:13, color:'#666', fontWeight:600, display:'block', marginBottom:4 }}>{isEs?'Descripción':'Description'}</span><p style={{ fontSize:13, color:'#1A1A2E', margin:0, lineHeight:1.5, background:'#FFF3EC', padding:10, borderRadius:8, borderLeft:'3px solid #F26000' }}>{order.serviceDesc || order.notes}</p></div>}
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={()=>onDecline(order.id)} style={{ flex:1, padding:16, borderRadius:14, background:'#FFF0F0', color:'#E31837', border:'none', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'var(--font-display)' }} onMouseEnter={e=>e.currentTarget.style.background='#FEE2E2'} onMouseLeave={e=>e.currentTarget.style.background='#FFF0F0'}>{isEs?'✖ Rechazar':'✖ Decline'}</button>
          <button onClick={()=>onAccept(order.id)} style={{ flex:1, padding:16, borderRadius:14, background:'var(--mamey)', color:'white', border:'none', fontWeight:800, fontSize:15, cursor:'pointer', boxShadow:'0 4px 16px rgba(242,96,0,0.3)', fontFamily:'var(--font-display)' }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>{isEs?'✅ Aceptar Pedido':'✅ Accept Order'}</button>
        </div>
      </div>
    </div>
  )
}

export function ExoticOrderNotification({ order, lang, onClick, onClose }) {
  return (
    <div className="exotic-notif-container" onClick={onClick}>
      <div className="exotic-notif-glow"></div>
      <div className="exotic-notif-content">
        <button className="exotic-notif-close" onClick={e => { e.stopPropagation(); onClose() }}>✕</button>
        <div className="exotic-notif-icon-wrap"><div className="exotic-notif-pulse"></div><span className="exotic-notif-icon">🤝</span></div>
        <div className="exotic-notif-text">
          <h4 className="exotic-title">{txt[lang]?.newOrderAlert||'🤝 ¡Tienes un contrato nuevo!'}</h4>
          <p className="exotic-desc">{txt[lang]?.newOrderDesc||'Un cliente quiere contratar tus servicios'}</p>
          <div className="exotic-user">
            <span className="exotic-avatar" style={{ background:avatarColors[0] }}>{order.avatar}</span>
            <span className="exotic-name">{order.pro}</span>
            <span className="exotic-action">{txt[lang]?.viewDetails||'Ver detalles'} →</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ORDERS PAGE
───────────────────────────────────────────── */
export default function OrdersPage({ lang = 'es', navigate, userData, userRole }) {
  const T = txt[lang]
  const [orders,         setOrders]         = useState([])
  const [history,        setHistory]        = useState([])
  const [reviewOrder,    setReviewOrder]    = useState(null)
  const [verifyingOrder, setVerifyingOrder] = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [detailsOrder,   setDetailsOrder]   = useState(null)
  const [showNotifs,     setShowNotifs]     = useState(false)
  const [notifs,         setNotifs]         = useState([])
  const [unread,         setUnread]         = useState(0)
  const [chatTarget,     setChatTarget]     = useState(null)
  const [workDoneOrder,  setWorkDoneOrder]  = useState(null)  // modal Listo Patrón

  useEffect(() => {
    if (!auth.currentUser || !userRole) { setLoading(false); return }
    const uid = auth.currentUser.uid
    const fieldType = userRole === 'pro' ? 'proId' : 'clientId'
    const q = query(collection(db, 'orders'), where(fieldType, '==', uid))
    const unsub = onSnapshot(q, (snapshot) => {
      const active = [], past = []
      snapshot.forEach(docSnap => {
        const d = docSnap.data()
        const o = {
          id:         docSnap.id,
          pro:        userRole==='pro' ? (d.clientName||d.clientEmail||'Cliente') : (d.proName||'Profesional'),
          specialty:  d.proSpecialty||'Servicio',
          avatar:     userRole==='pro' ? (d.clientName?d.clientName.substring(0,2).toUpperCase():'👤') : (d.proAvatar||'P'),
          photoURL:   userRole==='pro' ? (d.clientPhotoURL||null) : d.proPhotoURL,
          date:       `${d.dateToken} - ${d.timeToken}`,
          price:      d.price||'RD$0',
          status:     d.status||'pending',
          icon:       '🔧',
          rated:      d.rated||false,
          otherUid:   userRole==='pro' ? d.clientId  : d.proId,
          otherPhone: userRole==='pro' ? (d.clientPhone||null) : (d.proPhone||null),
          ...d,
        }
        if (o.status==='done'||o.status==='cancelled') past.push(o)
        else active.push(o)
      })
      active.sort((a,b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))
      past.sort((a,b)   => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))
      setOrders(active); setHistory(past); setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [userRole])

  useEffect(() => {
    if (!auth.currentUser) return
    const q = query(collection(db, 'notificaciones'), where('userId', '==', auth.currentUser.uid))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id:d.id, ...d.data() })).sort((a,b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))
      setNotifs(data); setUnread(data.filter(n => !n.read).length)
    })
    return () => unsub()
  }, [])

  const handleMarkAllRead = async () => {
    await Promise.all(notifs.filter(n => !n.read).map(n => updateDoc(doc(db,'notificaciones',n.id), { read:true }).catch(()=>{})))
  }

  const handleOpenOrderFromNotif = async (orderId) => {
    try {
      const snap = await getDoc(doc(db, 'orders', orderId))
      if (snap.exists()) {
        const d = snap.data()
        setDetailsOrder({ id:snap.id, pro:d.clientName||d.clientEmail||'Cliente', specialty:d.proSpecialty||'Servicio', avatar:d.clientName?d.clientName.substring(0,2).toUpperCase():'👤', photoURL:d.clientPhotoURL||null, date:`${d.dateToken} - ${d.timeToken}`, clientAddress:d.clientAddress||d.address||'', serviceDesc:d.serviceDesc||d.notes||'', ...d })
      }
    } catch(e) { console.error(e) }
  }

  const advanceStatus = async (id, currentStatus, overrideNext = null) => {
    const next = overrideNext || nextStatus[currentStatus]
    if (!next) return
    const extraFields = next === 'working' ? { workingStartedAt: serverTimestamp() } : {}
    await updateDoc(doc(db, 'orders', id), { status:next, ...extraFields }).catch(e => console.error(e))
  }

  const handleAccept = async (id) => {
    await updateDoc(doc(db, 'orders', id), { status:'accepted' }).catch(()=>{})
    await deleteNotifsByOrderId(id, notifs)
    setDetailsOrder(null)
    if (detailsOrder) navigate('tracking', { ...detailsOrder, status:'accepted' })
  }

  const handleDecline = async (id) => {
    await updateDoc(doc(db, 'orders', id), { status:'cancelled' }).catch(()=>{})
    await deleteNotifsByOrderId(id, notifs)
    setDetailsOrder(null)
  }

  const handleReviewSubmit = async (id, stars, comment) => {
    await updateDoc(doc(db, 'orders', id), { rated:true, ratingScore:stars, ratingComment:comment, reviewerName:userData?.name||'Cliente', moderated:false }).catch(()=>{})
    const order = allOrders.find(o => o.id === id)
    if (order && order.proId) {
      import('firebase/firestore').then(({ addDoc, collection, serverTimestamp }) => {
        addDoc(collection(db, 'notificaciones'), {
          userId:    order.proId,
          orderId:   id,
          type:      'new_review',
          title:     lang==='es' ? '⭐ ¡Nueva Reseña!' : '⭐ New Review!',
          text:      lang==='es' ? `Te han calificado con ${stars} estrellas.` : `You received a ${stars} star rating.`,
          read:      false,
          icon:      '⭐',
          createdAt: serverTimestamp()
        }).catch(console.error);
      });
    }
    setReviewOrder(null)
  }

  const handlePaymentApprove = async (id) => {
    await updateDoc(doc(db, 'orders', id), { paymentStatus:'approved', status:'done' }).catch(()=>{})
    setVerifyingOrder(null)
  }

  const openChat = (o) => setChatTarget({ uid:o.otherUid, name:o.pro, color:avatarColors[0], phone:o.otherPhone })

  const allOrders     = [...orders, ...history]
  const pendingReview = allOrders.filter(o => o.status==='done' && !o.rated)

  // Marcar trabajo como terminado + notificar al cliente
  const handleWorkDone = async (o) => {
    try {
      await updateDoc(doc(db, 'orders', o.id), { status: 'done' })
      if (o.clientId) {
        await addDoc(collection(db, 'notificaciones'), {
          userId:    o.clientId,
          orderId:   o.id,
          type:      'job_done',
          title:     lang==='es' ? '🎉 ¡Trabajo Terminado!' : '🎉 Work Done!',
          text:      lang==='es' ? `${o.proName||'El profesional'} ha terminado el trabajo. ¡Procede con el pago!` : `${o.proName||'The professional'} finished the job. Proceed with payment!`,
          read:      false,
          icon:      '✅',
          createdAt: serverTimestamp(),
        })
      }
      setWorkDoneOrder(null)
    } catch(e) { console.error(e) }
  }

  const renderActions = (o) => (
    <div className="oc-actions">
      {o.status==='onway'   && userRole==='pro'  && <button className="oc-btn trato" onClick={()=>advanceStatus(o.id,o.status)}>{T.status.arrived}</button>}
      {['accepted', 'onway', 'arrived', 'trato', 'working'].includes(o.status) && userRole!=='pro' && <button className="oc-btn track" onClick={()=>navigate('tracking',o)}>📍 {T.track}</button>}
      {o.status==='arrived' && userRole==='pro'  && <button className="oc-btn trato" onClick={()=>advanceStatus(o.id,o.status)}>{T.tratoHecho}</button>}
      {o.status==='trato'   && userRole==='pro'  && <button className="oc-btn track" onClick={()=>advanceStatus(o.id,o.status)}>{T.status.working}</button>}
      {o.status==='working' && userRole==='pro'  && (
        <WorkingTimer
          startedAt={o.workingStartedAt || o.updatedAt || o.createdAt}
          lang={lang}
          isPro={true}
          onFinish={() => setWorkDoneOrder(o)}
        />
      )}
      {o.status==='working' && userRole!=='pro'  && (
        <WorkingTimer
          startedAt={o.workingStartedAt || o.updatedAt || o.createdAt}
          lang={lang}
          isPro={false}
          onFinish={null}
        />
      )}
      {o.status==='pending' && userRole==='pro' && (
        <div style={{ display:'flex', gap:8, width:'100%' }}>
          <button className="oc-btn decline" onClick={()=>advanceStatus(o.id,o.status,'cancelled')} style={{ flex:1, background:'#FFF0F0', color:'#E31837', border:'1px solid currentColor' }}>{T.decline}</button>
          <button className="oc-btn listo"   onClick={()=>advanceStatus(o.id,o.status)} style={{ flex:1 }}>Aceptar Servicio</button>
        </div>
      )}
      {!['done', 'cancelled', 'working'].includes(o.status) && userRole!=='pro' && (
        <button className="oc-btn decline" onClick={()=>advanceStatus(o.id,o.status,'cancelled')} style={{ width:'100%', background:'#F26000', color:'#FFFFFF', border:'none', marginTop: 4, fontWeight:'bold', boxShadow:'0 4px 10px rgba(242,96,0,0.3)' }}>{lang==='es'?'Cancelar Pedido':'Cancel Order'}</button>
      )}
      {['accepted','onway','arrived','trato','working'].includes(o.status) && o.otherUid && (
        <button className="oc-btn track" style={{ background:'#FFF3EC', color:'#F26000', border:'1px solid #FFD4B0' }} onClick={()=>openChat(o)}>
          💬 {lang==='es'?'Abrir chat':'Open chat'}
        </button>
      )}
      {o.paymentStatus==='verifying' && userRole==='pro' && (
        <button className="oc-btn trato" onClick={()=>setVerifyingOrder(o)} style={{ background:'#ECFDF5', color:'#10B981', borderColor:'#A7F3D0', fontWeight:'bold' }}>👁️ Ver Recibo (Pago)</button>
      )}
      {o.status==='done' && userRole!=='pro' && o.paymentStatus!=='approved' && o.paymentStatus!=='pending_cash' && (
        <button className="oc-btn listo" style={{ background:'#10B981', boxShadow:'0 4px 14px rgba(16,185,129,0.35)', marginBottom:8 }} onClick={()=>navigate('payment', { ...o, orderId:o.id })}>
          💳 {lang==='es'?'Proceder al Pago':'Proceed to Payment'}
        </button>
      )}
      {o.status==='done' && !o.rated && userRole!=='pro' && (o.paymentStatus==='approved'||o.paymentStatus==='pending_cash') && <button className="oc-btn review" onClick={()=>setReviewOrder(o)}>{T.review}</button>}
      {o.status==='done' && o.rated && <span className="oc-rated">⭐ {T.rated}</span>}
    </div>
  )

  return (
    <div className="orders-page">
      <div className="orders-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <h1 className="orders-title" style={{ margin:0 }}>{T.title}</h1>
          {pendingReview.length>0 && userRole!=='pro' && <span className="orders-badge">{pendingReview.length}</span>}
        </div>
        {(notifs.length>0||unread>0) && (
          <button onClick={()=>setShowNotifs(true)} style={{ position:'relative', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:6 }}>
            <span style={{ fontSize:26 }}>🔔</span>
            {unread>0 && <div style={{ position:'absolute', top:2, right:0, background:'#F26000', color:'#fff', fontSize:10, fontWeight:900, width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff' }}>{unread>9?'9+':unread}</div>}
          </button>
        )}
      </div>
      {loading && <p style={{ textAlign:'center', marginTop:30, color:'#666' }}>Cargando pedidos...</p>}
      {!loading && orders.length===0 && history.length===0 && (
        <div className="empty-state" style={{ marginTop:50 }}><span style={{ fontSize:40 }}>📋</span><p style={{ marginTop:10 }}>{T.empty}</p></div>
      )}
      {orders.length>0 && (
        <section className="orders-section">
          <h2 className="orders-section-title">⚡ {T.active}</h2>
          {orders.map((o, i) => (
            <div key={o.id} className="order-card active-card">
              <div className="oc-top">
                {o.photoURL ? <img src={o.photoURL} alt={o.specialty} style={{ width:44,height:44,borderRadius:'50%',objectFit:'cover',flexShrink:0 }}/> : <div className="oc-avatar" style={{ background:avatarColors[i%avatarColors.length],width:44,height:44 }}>{o.avatar}</div>}
                <div className="oc-info"><p className="oc-name">{o.pro}</p><p className="oc-spec">{o.icon} {o.specialty}</p><p className="oc-date">📅 {o.date}</p></div>
                <div className="oc-right"><span className="oc-status" style={{ color:statusColor(o.status),background:statusColor(o.status)+'18' }}>{T.status[o.status]}</span><p className="oc-price">{o.price}</p></div>
              </div>
              <div className="order-progress">
                {PROGRESS_STEPS.map((s, idx, arr) => (
                  <div key={s} className="op-step">
                    <div className={`op-dot ${PROGRESS_STEPS.indexOf(o.status)>=idx?'done':''}`} />
                    {idx<arr.length-1 && <div className={`op-line ${PROGRESS_STEPS.indexOf(o.status)>idx?'done':''}`} />}
                  </div>
                ))}
              </div>
              <div className="order-progress-labels">{PROGRESS_LABELS[lang].map((l, idx) => <span key={idx} className="op-label">{l}</span>)}</div>
              {renderActions(o)}
            </div>
          ))}
        </section>
      )}
      <section className="orders-section">
        <h2 className="orders-section-title">🕐 {T.history}</h2>
        {history.map((o, i) => (
          <div key={o.id} className="order-card">
            <div className="oc-top">
              {o.photoURL ? <img src={o.photoURL} alt={o.specialty} style={{ width:44,height:44,borderRadius:'50%',objectFit:'cover',flexShrink:0 }}/> : <div className="oc-avatar" style={{ background:avatarColors[(i+2)%avatarColors.length],width:44,height:44 }}>{o.avatar}</div>}
              <div className="oc-info"><p className="oc-name">{o.pro}</p><p className="oc-spec">{o.icon} {o.specialty}</p><p className="oc-date">📅 {o.date}</p></div>
              <div className="oc-right"><span className="oc-status" style={{ color:statusColor(o.status),background:statusColor(o.status)+'18' }}>{T.status[o.status]}</span><p className="oc-price">{o.price}</p></div>
            </div>
            <div className="oc-actions">
              {o.status==='done' && userRole!=='pro' && o.paymentStatus!=='approved' && o.paymentStatus!=='pending_cash' && (
                <button className="oc-btn listo" style={{ background:'#10B981',boxShadow:'0 4px 14px rgba(16,185,129,0.35)',marginBottom:8 }} onClick={()=>navigate('payment', { ...o, orderId:o.id })}>
                  💳 {lang==='es'?'Proceder al Pago':'Proceed to Payment'}
                </button>
              )}
              {o.status==='done' && !o.rated && userRole!=='pro' && (o.paymentStatus==='approved'||o.paymentStatus==='pending_cash') && <button className="oc-btn review" onClick={()=>setReviewOrder(o)}>{T.review}</button>}
              {o.status==='done' && o.rated && <span className="oc-rated">⭐ {T.rated}</span>}
              {o.status!=='cancelled' && userRole !== 'pro' && <button className="oc-btn rebook" onClick={()=>navigate('search')}>{T.rebook}</button>}
            </div>
            
            {/* ── VISUALIZAR RESEÑA ── */}
            {o.rated && o.ratingScore && (
              <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: '#FAFAFA', border: '1px solid #EFEFEF', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>
                    {userRole === 'pro' ? `Calificación de ${o.clientName || 'Cliente'}` : 'Tu Calificación'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 14, letterSpacing: 2 }}>{'⭐'.repeat(o.ratingScore)}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#F26000' }}>{o.ratingScore}.0</span>
                  </div>
                </div>
                {o.ratingComment && (
                  <p style={{ margin: 0, marginTop: 4, fontSize: 13, color: '#666', fontStyle: 'italic', lineHeight: 1.4 }}>
                    "{o.ratingComment}"
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </section>
      {reviewOrder    && <ReviewModal    order={reviewOrder}    lang={lang} onClose={()=>setReviewOrder(null)}    onSubmit={handleReviewSubmit} />}
      {verifyingOrder && <ReceiptModal   order={verifyingOrder} lang={lang} onClose={()=>setVerifyingOrder(null)} onApprove={handlePaymentApprove} />}
      {detailsOrder   && <OrderDetailsModal order={detailsOrder} lang={lang} onClose={()=>setDetailsOrder(null)} onAccept={handleAccept} onDecline={handleDecline} />}
      {showNotifs     && <NotificacionesModal onClose={()=>setShowNotifs(false)} notifs={notifs} lang={lang} onMarkAllRead={handleMarkAllRead} navigate={navigate} orders={allOrders} onOpenOrder={handleOpenOrderFromNotif} /> }

      {/* ── Modal Listo Patrón (pro) ── */}
      {workDoneOrder && (
        <div className="review-overlay" onClick={()=>setWorkDoneOrder(null)} style={{ zIndex:3000 }}>
          <div className="review-modal" onClick={e=>e.stopPropagation()} style={{ textAlign:'center' }}>
            <button className="review-close" onClick={()=>setWorkDoneOrder(null)}>✕</button>
            <div style={{ fontSize:56, margin:'0 0 12px' }}>🔧</div>
            <h3 style={{ fontSize:20, fontWeight:900, color:'#1A1A2E', margin:'0 0 6px' }}>
              {lang==='es' ? '¿Terminaste el trabajo?' : 'Did you finish the job?'}
            </h3>
            <p style={{ fontSize:13, color:'#666', margin:'0 0 8px' }}>{workDoneOrder.pro}</p>
            <p style={{ fontSize:12, color:'#999', margin:'0 0 24px' }}>
              {lang==='es' ? 'Al confirmar le llegará una notificación al cliente para proceder con el pago.' : 'The client will be notified to proceed with payment.'}
            </p>
            <button
              onClick={()=>handleWorkDone(workDoneOrder)}
              style={{ width:'100%', padding:16, borderRadius:14, background:'#F26000', color:'#fff', border:'none', fontWeight:900, fontSize:17, cursor:'pointer', boxShadow:'0 4px 16px rgba(242,96,0,0.35)', marginBottom:12 }}
            >
              ✅ {lang==='es' ? '¡Listo Patrón!' : 'Done Boss!'}
            </button>
            <button onClick={()=>setWorkDoneOrder(null)} style={{ width:'100%', padding:14, borderRadius:14, background:'#f5f5f5', border:'none', color:'#666', fontWeight:700, fontSize:14, cursor:'pointer' }}>
              {lang==='es' ? 'Seguir trabajando' : 'Keep working'}
            </button>
          </div>
        </div>
      )}
      {chatTarget && chatTarget.uid && (
        <FloatingChat otherUid={chatTarget.uid} otherName={chatTarget.name} otherColor={chatTarget.color} otherPhone={chatTarget.phone} lang={lang} onClose={()=>setChatTarget(null)} />
      )}
      <div style={{ height:80 }} />
    </div>
  )
}