import { useState, useEffect, useRef, useMemo } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, deleteDoc,
         addDoc, serverTimestamp, orderBy, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import './OrdersPage.css'
import { ReportModal } from './ChatPage'
import CallModal from '../components/CallModal'
import FloatingChat from '../components/FloatingChat'
import ReciboDigitalModal from '../components/ReciboDigitalModal'
import MantenimientoPreventivoModal from '../components/MantenimientoPreventivoModal'
import { BUSINESS_TYPES } from '../data/businessTypes'

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
    listo:             '✅ ¡Pedidos Listo!',
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
    emptyCta:          '🔍 Buscar profesional',
    rebookSame:        '↩ Repetir con este profesional',
    confirmCancelTitle:'¿Cancelar este pedido?',
    confirmDeclineTitle:'¿Rechazar este pedido?',
    confirmCancelSub:  'Esta acción no se puede deshacer.',
    reasonLabel:       'Motivo (opcional)',
    reasons:           ['Ya no lo necesito', 'Tarda demasiado', 'Encontré otra opción', 'Me equivoqué al pedir', 'Otro'],
    yesCancel:         'Sí, cancelar',
    keep:              'No, mantener',
    arrivesIn:         'Llega en',
    arrivingNow:       'Llegando en cualquier momento',
    filters:           { all:'Todos', done:'Completados', cancelled:'Cancelados', service:'Servicios', delivery:'Delivery' },
    noFilterResults:   'No hay pedidos en este filtro',
    statMonth:         'Pedidos este mes',
    statSpent:         'Total gastado',
    statToRate:        'Por calificar',
    statToday:         'Ganado hoy',
    statWeek:          'Esta semana',
    statJobs:          'Trabajos listos',
    statusChanged:     'Tu pedido cambió a',
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
    reviewSend:        'Send review',
    reviewPlaceholder: 'Write a comment (optional)...',
    rated:             'Reviewed',
    newOrderAlert:     '🤝 New contract!',
    newOrderDesc:      'A client wants to hire your services',
    viewDetails:       'View details',
    emptyCta:          '🔍 Find a professional',
    rebookSame:        '↩ Rebook this professional',
    confirmCancelTitle:'Cancel this order?',
    confirmDeclineTitle:'Decline this order?',
    confirmCancelSub:  'This action cannot be undone.',
    reasonLabel:       'Reason (optional)',
    reasons:           ['No longer needed', 'Taking too long', 'Found another option', 'Ordered by mistake', 'Other'],
    yesCancel:         'Yes, cancel',
    keep:              'No, keep it',
    arrivesIn:         'Arrives in',
    arrivingNow:       'Arriving any moment',
    filters:           { all:'All', done:'Completed', cancelled:'Cancelled', service:'Services', delivery:'Delivery' },
    noFilterResults:   'No orders in this filter',
    statMonth:         'Orders this month',
    statSpent:         'Total spent',
    statToRate:        'To review',
    statToday:         'Earned today',
    statWeek:          'This week',
    statJobs:          'Jobs done',
    statusChanged:     'Your order is now',
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

const PROGRESS_STEPS  = ['pending', 'accepted', 'onway', 'arrived', 'trato', 'working', 'done']
const PROGRESS_LABELS = {
  es: ['Pendiente','Aceptado','Camino','Llegó','Trato','Trabajo','Listo'],
  en: ['Pending','Accepted','On way','Arrived','Deal','Working','Done'],
}
// 'confirmado' es un alias legado de 'accepted'
const stepIndex = (status) => PROGRESS_STEPS.indexOf(status === 'confirmado' ? 'accepted' : status)

// Pagos que ya cuentan como hechos / que permiten calificar
const PAID_STATUSES   = ['approved', 'pending_cash', 'paid', 'verifying']
const RATEABLE_PAYS   = ['approved', 'pending_cash', 'paid']

const parseAmount = (o) => {
  if (o.total) return Number(o.total) || 0
  const n = Number(String(o.price || '').replace(/[^\d.]/g, ''))
  return isNaN(n) ? 0 : n
}
const orderMs = (o) => (o.createdAt?.seconds ? o.createdAt.seconds * 1000 : 0)
const isDeliveryOrder = (o) => o.type === 'delivery' || o.fulfillmentType === 'pickup'

/* ── Confeti de celebración ── */
function Confetti({ onDone }) {
  const pieces = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    dur: 2.2 + Math.random() * 1.4,
    color: ['#F26000', '#FFC107', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'][i % 6],
    rot: Math.random() * 360,
    size: 6 + Math.random() * 6,
  })), [])
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  useEffect(() => { const t = setTimeout(() => doneRef.current(), 3800); return () => clearTimeout(t) }, [])
  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((p, i) => (
        <span key={i} className="confetti-piece" style={{
          left: `${p.left}%`, background: p.color, width: p.size, height: p.size * 0.45,
          animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, transform: `rotate(${p.rot}deg)`,
        }} />
      ))}
    </div>
  )
}

/* ── Cuenta regresiva real de llegada ── */
function EtaCountdown({ order, lang, T }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(id) }, [])
  const mins = Number(order.estimatedTime)
  const base = order.acceptedAt?.seconds ? order.acceptedAt.seconds * 1000
             : order.updatedAt?.seconds ? order.updatedAt.seconds * 1000
             : orderMs(order)
  if (!mins || !base || !['accepted', 'confirmado', 'onway'].includes(order.status)) {
    const waiting = order.status === 'pending'
    return (
      <div className="oc-eta neutral">
        <span className="oc-eta-icon">{waiting ? '⏳' : '🚚'}</span>
        <p>{waiting
          ? (lang === 'es' ? 'Esperando que el profesional acepte...' : 'Waiting for the professional to accept...')
          : (lang === 'es' ? 'Pedido en curso' : 'Order in progress')}</p>
      </div>
    )
  }
  const left = Math.ceil((base + mins * 60000 - now) / 60000)
  const pct  = Math.max(0, Math.min(100, 100 - (left / mins) * 100))
  return (
    <div className="oc-eta">
      <span className="oc-eta-icon">🛵</span>
      <div style={{ flex: 1 }}>
        <p>{left > 0 ? <>{T.arrivesIn} <strong>{left} min</strong></> : T.arrivingNow}</p>
        <div className="oc-eta-bar"><div style={{ width: `${pct}%` }} /></div>
      </div>
    </div>
  )
}

/* ── Confirmación de cancelar / rechazar ── */
function ConfirmCancelModal({ T, isPro, onConfirm, onClose }) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <div className="review-overlay" onClick={onClose}>
      <div className="review-modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
        <button className="review-close" onClick={onClose}>✕</button>
        <div className="cancel-icon">⚠️</div>
        <h3 className="review-title">{isPro ? T.confirmDeclineTitle : T.confirmCancelTitle}</h3>
        <p className="review-sub" style={{ marginBottom: 16 }}>{T.confirmCancelSub}</p>
        <p className="cancel-reason-label">{T.reasonLabel}</p>
        <div className="cancel-reasons">
          {T.reasons.map(r => (
            <button key={r} className={`cancel-chip ${reason === r ? 'on' : ''}`} onClick={() => setReason(reason === r ? '' : r)}>{r}</button>
          ))}
        </div>
        <button className="cancel-confirm-btn" disabled={busy} onClick={async () => { setBusy(true); await onConfirm(reason) }}>
          {busy ? '...' : T.yesCancel}
        </button>
        <button className="cancel-keep-btn" onClick={onClose}>{T.keep}</button>
      </div>
    </div>
  )
}

/* ── Skeleton de carga ── */
function OrderSkeleton() {
  return (
    <div className="order-card skeleton-card">
      <div className="oc-top">
        <div className="sk sk-avatar" />
        <div style={{ flex: 1 }}>
          <div className="sk sk-line" style={{ width: '60%' }} />
          <div className="sk sk-line" style={{ width: '40%' }} />
          <div className="sk sk-line" style={{ width: '30%' }} />
        </div>
        <div className="sk sk-pill" />
      </div>
      <div className="sk sk-bar" />
      <div className="sk sk-btn" />
    </div>
  )
}

const isPaymentNotif  = (text = '') => {
  const t = String(text || '').toLowerCase()
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
    const selectedSound = localStorage.getItem('listo_sound_notif') || 'notification_v3';
    const audio = new Audio(`/audio/${selectedSound}.mp3`)
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
    <div style={{ '--glow': glowColor, '--bar': barColor }}>
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
    </div>
  )
}



/* ─────────────────────────────────────────────
   MODAL NOTIFICACIONES
───────────────────────────────────────────── */
function NotificacionesModal({ onClose, notifs, lang, onMarkAllRead, navigate, orders, onOpenOrder }) {
  const [selectedNotif, setSelectedNotif] = useState(null)

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000000, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
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
            const isReview = n.type === 'new_review' || (n.text || '').toLowerCase().includes('estrella')
            const isPhotoRejection = (n.title && n.title.includes('Tu foto no fue aprobada')) || (n.text && n.text.includes('foto'))
            // Buscar relatedOrder relajando el filtro para incluir cualquier orden válida que coincida con orderId
            const relatedOrder = n.orderId ? orders.find(o => o.id===n.orderId) : null
            const isPaid = relatedOrder && ['approved', 'pending_cash', 'paid', 'verifying'].includes(relatedOrder.paymentStatus)
            
            let displayText = n.text
            if (isPago && isPaid) {
              displayText = lang === 'es'
                ? `${relatedOrder.proName || relatedOrder.pro || 'El profesional'} ha terminado el trabajo. ¡Pago realizado!`
                : `${relatedOrder.proName || relatedOrder.pro || 'The professional'} finished the job. Payment completed!`
            }

            const isClickable = true
            const handleClick = async () => {
              try { await updateDoc(doc(db,'notificaciones',n.id), { read:true }) } catch(e) {}
              
              if (isPhotoRejection) {
                onClose();
                navigate('profile');
              }
              else if (isNuevoPedido && n.orderId) { 
                onClose(); onOpenOrder(n.orderId) 
              }
              else if (isReview) { 
                onClose(); navigate('profile') 
              }
              else if (isPago && relatedOrder) { 
                onClose(); 
                if (isPaid) {
                  if (!relatedOrder.rated) {
                    navigate('workdone', { ...relatedOrder, orderId:relatedOrder.id })
                  } else {
                    navigate('orders')
                  }
                } else {
                  navigate('payment', { ...relatedOrder, orderId:relatedOrder.id }) 
                }
              }
              else if (relatedOrder) {
                onClose(); 
                if (relatedOrder.status === 'done' && !['approved', 'pending_cash', 'paid', 'verifying'].includes(relatedOrder.paymentStatus)) {
                  navigate('payment', { ...relatedOrder, orderId:relatedOrder.id })
                } else {
                  navigate('tracking', { ...relatedOrder })
                }
              } else {
                setSelectedNotif(n);
              }
            }
            return (
              <div key={i} onClick={handleClick} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:12, borderRadius:12, marginBottom:8, background:n.read?'#fff':'#FFF3EC', border:n.read?'1px solid #f0f0f0':'1px solid #FFD580', cursor:'pointer', transition:'transform 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='scale(1.01)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='scale(1)' }}>
                <div style={{ position: 'relative', width: 42, height: 42, borderRadius: '50%', background: '#FFF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: '1px solid #FFD580' }}>
                  <span>{n.icon||'🔔'}</span>
                  <img src="/logo-mamey.png" alt="Pedidos Listo" style={{ position: 'absolute', bottom: -2, right: -2, width: 17, height: 17, borderRadius: '50%', border: '1.5px solid #fff', objectFit: 'cover', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
                </div>
                <div style={{ flex:1 }}>
                  {n.title && <p style={{ margin:'0 0 4px', fontSize:14, fontWeight:800, color:'#991B1B' }}>{n.title}</p>}
                  <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:n.read?600:800, color:'#1A1A2E', whiteSpace:'pre-line', lineHeight:1.5 }}>{displayText}</p>
                  <p style={{ margin:0, fontSize:11, color:'#999' }}>{n.time}</p>
                  {isPhotoRejection && (
                    <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:6, background:'linear-gradient(135deg, #F26000, #EF4444)', color:'white', borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:700 }}>
                      📷 Subir Nueva Foto / Editar Perfil →
                    </div>
                  )}
                  {isNuevoPedido&&n.orderId && <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:6, background:'#F26000', color:'white', borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:700 }}>📋 {lang==='es'?'Ver pedido →':'View order →'}</div>}
                  {isPago && relatedOrder && (
                    isPaid ? (
                      <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:6, background:'#94A3B8', color:'white', borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:700 }}>
                        ✓ {lang==='es'?'Pago realizado':'Payment completed'}
                      </div>
                    ) : (
                      <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:6, background:'#10B981', color:'white', borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:700 }}>
                        💳 {lang==='es'?'Ir al Pago →':'Go to Payment →'}
                      </div>
                    )
                  )}
                </div>
                {!n.read && <div style={{ width:8, height:8, borderRadius:'50%', background:'#F26000', flexShrink:0, marginTop:4 }} />}
              </div>
            )
          })}
        </div>
        <button onClick={onClose} style={{ width:'100%', background:'none', border:'none', color:'#999', fontSize:13, fontWeight:600, marginTop:14, cursor:'pointer', flexShrink:0 }}>{lang==='es'?'Cerrar':'Close'}</button>
      </div>

      {/* Sub-Modal para mostrar mensaje largo si se selecciona */}
      {selectedNotif && (
        <div onClick={() => setSelectedNotif(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000005, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:20, padding:24, width:'100%', maxWidth:420, display:'flex', flexDirection:'column', gap:14 }}>
            <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:'#1A1A2E' }}>{selectedNotif.title || 'Notificación'}</h3>
            <div style={{ background:'#F8FAFC', padding:14, borderRadius:12, fontSize:14, lineHeight:1.6, whiteSpace:'pre-line', color:'#334155' }}>
              {selectedNotif.text}
            </div>
            <button onClick={() => setSelectedNotif(null)} style={{ padding:12, borderRadius:12, background:'#F26000', color:'white', border:'none', fontWeight:700, cursor:'pointer' }}>
              Entendido ✓
            </button>
          </div>
        </div>
      )}
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
  const receiptUrl = order.receiptUrl || order.voucherUrl || order.comprobanteUrl || order.receipt;
  const isPdf = receiptUrl && (receiptUrl.toLowerCase().includes('.pdf') || receiptUrl.startsWith('data:application/pdf'));

  return (
    <div className="review-overlay" onClick={onClose} style={{ zIndex: 1000000 }}>
      <div className="review-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, width: '92%' }}>
        <button className="review-close" onClick={onClose}>✕</button>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <span style={{ fontSize:40 }}>{order.paymentMethod==='transfer'?'🏦':'💵'}</span>
          <h3 style={{ margin:'8px 0', fontSize:18, fontWeight:900, color:'#1A1A2E' }}>
            {lang==='es' ? (order.paymentMethod==='transfer' ? 'Validar Transferencia' : 'Pago en Efectivo') : 'Payment Verification'}
          </h3>
          <p style={{ margin:0, fontSize:16, fontWeight:800, color:'#F26000' }}>{order.price || 'RD$0'}</p>
        </div>
        <div style={{ background:'#FAFAFA', borderRadius:16, padding:16, marginBottom:20, border:'1px solid #E2E8F0' }}>
          {order.paymentMethod==='transfer' ? (
            <>
              <p style={{ fontSize:13, color:'#555', margin:'0 0 6px' }}><strong>Titular que transfirió:</strong> {order.depositorName || 'No especificado'}</p>
              <p style={{ fontSize:13, color:'#555', margin:'0 0 10px' }}><strong>Banco receptor:</strong> {order.depositBank || 'No especificado'}</p>
              
              {receiptUrl ? (
                <div style={{ marginTop: 10, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: '#334155', fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <span>📸 Comprobante de Pago Adjunto:</span>
                  </p>
                  {isPdf ? (
                    <a 
                      href={receiptUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#EFF6FF', color: '#1D4ED8', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none', border: '1px solid #BFDBFE' }}
                    >
                      📄 Abrir Comprobante PDF ↗
                    </a>
                  ) : (
                    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '2px solid #CBD5E1', background: '#0F172A', maxHeight: 250 }}>
                      <img 
                        src={receiptUrl} 
                        alt="Comprobante" 
                        style={{ width: '100%', maxHeight: 250, objectFit: 'contain', display: 'block', cursor: 'pointer' }}
                        onClick={() => window.open(receiptUrl, '_blank')}
                      />
                    </div>
                  )}
                  <small style={{ fontSize: 11, color: '#64748B', display: 'block', marginTop: 6 }}>
                    {lang==='es' ? '💡 Toca la foto para verla en tamaño completo ↗' : 'Click to view full size'}
                  </small>
                </div>
              ) : (
                <div style={{ width:'100%', padding:'12px', background:'#FEE2E2', borderRadius:10, color:'#991B1B', fontSize:12, textAlign:'center', marginTop:10, fontWeight: 600 }}>
                  ⚠️ No se adjuntó foto de comprobante
                </div>
              )}
            </>
          ) : (
            <>
              <p style={{ fontSize:13, color:'#555', margin:'0 0 6px' }}><strong>Método de pago:</strong> 💵 Efectivo en mano</p>
              <p style={{ fontSize:13, color:'#555', margin:'0 0 6px' }}><strong>Monto a cobrar:</strong> {order.price}</p>
              <div style={{ marginTop: 8, padding: 10, background: '#ECFDF5', borderRadius: 10, color: '#065F46', fontSize: 12, lineHeight: 1.4 }}>
                💡 El cliente seleccionó pagar directamente en mano en efectivo. Confirma cuando recibas el dinero.
              </div>
            </>
          )}
        </div>
        <button style={{ width:'100%', padding:14, borderRadius:12, background:'#10B981', color:'white', border:'none', fontWeight:800, fontSize:15, cursor:'pointer', boxShadow:'0 4px 14px rgba(16,185,129,0.35)' }} onClick={()=>onApprove(order.id)}>
          {lang==='es'?'Validar y Completar Trabajo ✅':'Approve & Complete ✅'}
        </button>
      </div>
    </div>
  )
}

export function OrderDetailsModal({ order, lang, onClose, onAccept, onDecline }) {
  const isEs = lang==='es'
  const isSameDayOrUrgent = order.date?.includes('Hoy') || order.date?.includes('Today') || order.date?.includes('ASAP') || order.urgencyToken > 0;
  const [eta, setEta] = useState(isSameDayOrUrgent ? 15 : 0)

  return (
    <div className="review-overlay" onClick={onClose} style={{ zIndex:1000000 }}>
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
        {isSameDayOrUrgent && (
          <div style={{ marginBottom: 20, padding: '0 10px' }}>
            <p style={{ fontSize: 13, color: '#666', fontWeight: 600, margin: '0 0 10px', textAlign: 'center' }}>
              {isEs ? '¿En qué tiempo llegarías al lugar?' : 'Estimated Arrival Time'}
            </p>
            <input 
              type="range" 
              min="5" 
              max="120" 
              step="5" 
              value={eta} 
              onChange={(e) => setEta(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--mamey)', height: 6 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>5m</span>
              <span style={{ fontSize: 22, color: 'var(--mamey)', fontWeight: 900, fontFamily: 'var(--font-display)' }}>{eta} <span style={{ fontSize: 14 }}>min</span></span>
              <span style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>2h</span>
            </div>
          </div>
        )}
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={()=>onDecline(order.id)} style={{ flex:1, padding:16, borderRadius:14, background:'#FFF0F0', color:'#E31837', border:'none', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'var(--font-display)' }} onMouseEnter={e=>e.currentTarget.style.background='#FEE2E2'} onMouseLeave={e=>e.currentTarget.style.background='#FFF0F0'}>{isEs?'✖ Rechazar':'✖ Decline'}</button>
          <button onClick={()=>onAccept(order.id, eta)} style={{ flex:1, padding:16, borderRadius:14, background:'var(--mamey)', color:'white', border:'none', fontWeight:800, fontSize:15, cursor:'pointer', boxShadow:'0 4px 16px rgba(242,96,0,0.3)', fontFamily:'var(--font-display)' }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>{isEs?'✅ Aceptar Pedido':'✅ Accept Order'}</button>
        </div>
      </div>
    </div>
  )
}

export function ExoticOrderNotification({ order, lang, onClick, onClose }) {
  return (
    <div className="exotic-notif-container" onClick={onClick} style={{ zIndex: 999999, top: 'max(calc(env(safe-area-inset-top, 0px) + 14px), 14px)' }}>
      <div className="exotic-notif-glow"></div>
      <div className="exotic-notif-content" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10, padding: '14px 16px', background: 'rgba(20, 20, 35, 0.96)', color: '#fff', border: '1.5px solid rgba(242, 96, 0, 0.65)', borderRadius: 20 }}>
        {/* Cabecera estilo WhatsApp con el logo oficial de la app */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <img src="/logo-mamey.png" alt="Pedidos Listo" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.4)' }} />
            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.6px', color: '#FF8533', textTransform: 'uppercase' }}>PEDIDOS LISTO</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>• {lang === 'es' ? 'ahora' : 'now'}</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onClose() }}
            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 26, height: 26, borderRadius: '50%', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Cuerpo principal con Avatar + Insignia del Logo de la App estilo WhatsApp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
            <div className="exotic-notif-pulse" style={{ background: '#F26000' }}></div>
            {order.photoURL ? (
              <img src={order.photoURL} alt={order.pro} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #F26000', position: 'relative', zIndex: 2 }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #F26000, #FF8533)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, fontWeight: 900, border: '2px solid #fff', position: 'relative', zIndex: 2 }}>
                {order.avatar || '🤝'}
              </div>
            )}
            <img
              src="/logo-mamey.png"
              alt="App Logo"
              style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%', border: '2px solid #141423', objectFit: 'cover', zIndex: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 900, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {txt[lang]?.newOrderAlert || '🤝 ¡Tienes un contrato nuevo!'}
            </h4>
            <p style={{ margin: '0 0 6px', fontSize: 13, color: '#E2E8F0', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ color: '#FFB380' }}>{order.pro}</strong> • {order.specialty || (txt[lang]?.newOrderDesc || 'Solicita tus servicios')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(242, 96, 0, 0.18)', border: '1px solid rgba(242, 96, 0, 0.4)', padding: '6px 12px', borderRadius: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#FFD4B0' }}>
                📍 {order.clientAddress || order.address || (lang === 'es' ? 'Toque para responder' : 'Tap to respond')}
              </span>
              <span style={{ fontSize: 12, fontWeight: 900, color: '#FF8533', marginLeft: 8, flexShrink: 0 }}>
                {txt[lang]?.viewDetails || 'Ver detalles'} →
              </span>
            </div>
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
  const [workDoneOrder,  setWorkDoneOrder]  = useState(null)  // modal Pedidos Listo
  const [reciboModalOrder, setReciboModalOrder] = useState(null)
  const [showMantenimientoModal, setShowMantenimientoModal] = useState(false)
  const [cancelTarget,   setCancelTarget]   = useState(null)   // pedido a cancelar/rechazar
  const [historyFilter,  setHistoryFilter]  = useState('all')
  const [celebrate,      setCelebrate]      = useState(false)
  const [changedIds,     setChangedIds]     = useState([])     // tarjetas que acaban de cambiar de estado
  const [toast,          setToast]          = useState(null)
  const prevStatusRef = useRef(null)

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
          pro:        userRole==='pro' ? (d.clientName||d.clientEmail||'Cliente') : (d.storeName || d.proName || 'Profesional'),
          specialty:  d.fulfillmentType === 'pickup' ? '🛍️ Retiro en el Local (Mostrador)' : (d.driverType === 'own' ? '🏪 Delivery Propio del Restaurante' : (d.proSpecialty || (d.type === 'delivery' ? 'Delivery Express 🛵' : 'Servicio'))),
          avatar:     userRole==='pro' ? (d.clientName?d.clientName.substring(0,2).toUpperCase():'👤') : (d.type === 'delivery' ? '🍔' : (d.proAvatar||'P')),
          photoURL:   userRole==='pro' ? (d.clientPhotoURL||null) : d.proPhotoURL,
          date:       `${d.dateToken || 'Hoy'} - ${d.timeToken || '15-25 min'}`,
          price:      d.total ? (`RD$ ${Number(d.total).toLocaleString()}`) : (d.price || 'RD$0'),
          status:     d.status||'pending',
          icon:       d.fulfillmentType === 'pickup' ? '🛍️' : (d.type === 'delivery' ? (d.driverType === 'own' ? '🏪' : '🛵') : '🔧'),
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

      // ── Detectar cambios de estado en vivo (sonido, vibración, confeti) ──
      const all = [...active, ...past]
      const prev = prevStatusRef.current
      if (prev) {
        const changed = all.filter(o => prev[o.id] && prev[o.id] !== o.status)
        if (changed.length) {
          playChatMsgSound()
          try { navigator.vibrate && navigator.vibrate([120, 60, 120]) } catch(e) {}
          if (changed.some(o => o.status === 'done')) setCelebrate(true)
          const ids = changed.map(o => o.id)
          setChangedIds(ids)
          setTimeout(() => setChangedIds([]), 1600)
          const c = changed[0]
          setToast(`${txt[lang].statusChanged}: ${txt[lang].status[c.status] || c.status}`)
          setTimeout(() => setToast(null), 3200)
        }
      }
      prevStatusRef.current = Object.fromEntries(all.map(o => [o.id, o.status]))

      setOrders(active); setHistory(past); setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [userRole, lang])

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

  const handleAccept = async (id, eta) => {
    await updateDoc(doc(db, 'orders', id), { status:'accepted', estimatedTime: eta || 15, acceptedAt: serverTimestamp() }).catch(()=>{})
    await deleteNotifsByOrderId(id, notifs)
    setDetailsOrder(null)
    if (detailsOrder) navigate('tracking', { ...detailsOrder, status:'accepted', estimatedTime: eta || 15 })
  }

  // Rechazar desde el modal de detalles → pasa por la confirmación
  const handleDecline = (id) => {
    const o = [...orders, ...history].find(x => x.id === id) || detailsOrder
    setDetailsOrder(null)
    setCancelTarget(o || { id })
  }

  const confirmCancel = async (reason) => {
    const o = cancelTarget
    if (!o) return
    await updateDoc(doc(db, 'orders', o.id), {
      status: 'cancelled',
      cancelReason: reason || null,
      cancelledBy: userRole === 'pro' ? 'pro' : 'client',
      cancelledAt: serverTimestamp(),
    }).catch(()=>{})
    await deleteNotifsByOrderId(o.id, notifs)
    setCancelTarget(null)
  }

  // Repetir con el mismo profesional
  const rebookSamePro = (o) => {
    if (!o.proId || o.type === 'delivery') { navigate('search'); return }
    navigate('booking', {
      id:       o.proId,
      name:     o.proName || o.pro,
      category: o.proSpecialty || o.specialty,
      avatar:   o.proAvatar || (o.proName || 'P').substring(0, 2).toUpperCase(),
      photoURL: o.proPhotoURL || null,
      phone:    o.proPhone || '',
      price:    o.price || '',
    })
  }

  const handleReviewSubmit = async (id, stars, comment) => {
    await updateDoc(doc(db, 'orders', id), { rated:true, ratingScore:stars, ratingComment:comment, reviewerName:userData?.name||'Cliente', moderated:false }).catch(()=>{})
    const order = allOrders.find(o => o.id === id)
    if (order && order.proId) {
      if (stars >= 4) {
        import('firebase/firestore').then(({ updateDoc, doc, increment }) => {
          updateDoc(doc(db, 'users', order.proId), {
            has5StarContract: true,
            completed5StarCount: increment(1)
          }).catch(console.error);
        });
      }
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
  const pendingReview = allOrders.filter(o => o.status==='done' && !o.rated && RATEABLE_PAYS.includes(o.paymentStatus))

  // ── Resumen superior ──
  const stats = useMemo(() => {
    const now = new Date()
    const startDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const startWeek  = startDay - ((now.getDay() + 6) % 7) * 86400000
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const done = history.filter(o => o.status === 'done')
    const sum = (arr) => arr.reduce((s, o) => s + parseAmount(o), 0)
    return {
      month: [...orders, ...history].filter(o => orderMs(o) >= startMonth && o.status !== 'cancelled').length,
      spent: sum(done),
      today: sum(done.filter(o => orderMs(o) >= startDay)),
      week:  sum(done.filter(o => orderMs(o) >= startWeek)),
      jobs:  done.length,
    }
  }, [orders, history])
  const money = (n) => `RD$ ${Math.round(n).toLocaleString()}`

  // ── Filtro del historial ──
  const filteredHistory = history.filter(o => {
    switch (historyFilter) {
      case 'done':      return o.status === 'done'
      case 'cancelled': return o.status === 'cancelled'
      case 'service':   return !isDeliveryOrder(o)
      case 'delivery':  return isDeliveryOrder(o)
      default:          return true
    }
  })

  // Marcar trabajo como terminado + generar factura oficial y notificar al cliente
  const handleWorkDone = async (o) => {
    try {
      const invoiceNo = `LP-${o.id ? o.id.substring(0, 8).toUpperCase() : Math.floor(100000 + Math.random() * 900000)}`
      const nowStr = new Date().toISOString()

      await updateDoc(doc(db, 'orders', o.id), { 
        status: 'done',
        invoiceNo: invoiceNo,
        invoiceDate: nowStr,
        facturaGenerada: true
      })

      if (o.clientId) {
        await addDoc(collection(db, 'notificaciones'), {
          userId:    o.clientId,
          orderId:   o.id,
          type:      'job_done',
          title:     lang==='es' ? '🎉 ¡Listo Patrón! Factura de Servicio' : '🎉 Done Boss! Service Invoice',
          text:      lang==='es' 
            ? `${o.proName||'El profesional'} ha terminado el trabajo. Tu factura oficial Nº ${invoiceNo} ha sido generada por un monto de ${o.price||'RD$0'}. ¡Toca aquí para ver tu factura y coordinar el pago!` 
            : `${o.proName||'The professional'} finished the job. Your official invoice Nº ${invoiceNo} has been generated.`,
          read:      false,
          icon:      '🧾',
          invoiceNo: invoiceNo,
          createdAt: serverTimestamp(),
        })
      }
      setWorkDoneOrder(null)
    } catch(e) { console.error(e) }
  }

  // ── Helper: botón "Ver Local/Restaurante/Tienda" según tipo de orden ──
  const getStoreBtn = (o) => {
    if (userRole === 'pro') return null
    const localId = o.storeId || o.proId || null
    if (!localId) return null

    // Detectar el tipo de comercio por campo storeCategory o por tipo de orden
    const cat = o.storeCategory || o.storeType || null
    const bizType = cat && BUSINESS_TYPES[cat] ? BUSINESS_TYPES[cat] : null

    let icon, label
    if (bizType) {
      // Usar el visitLabel definido en businessTypes.js
      label = lang === 'es' ? bizType.visitLabel : bizType.visitLabel
      // Icono basado en el emoji del label del tipo
      const labelEmoji = bizType.label.match(/^(\S+)/)?.[1] || '🏬'
      icon = labelEmoji
    } else {
      // Fallback por tipo de orden
      const isPickup     = o.fulfillmentType === 'pickup'
      const isRestaurant = o.type === 'delivery'
      if (isPickup)        { icon = '🏪'; label = lang==='es' ? 'Ver Tienda'      : 'View Store' }
      else if (isRestaurant){ icon = '🍽️'; label = lang==='es' ? 'Ver Restaurante' : 'View Restaurant' }
      else                  { icon = '🏬'; label = lang==='es' ? 'Ver Local'       : 'View Store' }
    }

    return (
      <button
        className="oc-btn track"
        style={{ background:'#F0FDF4', color:'#15803D', border:'1.5px solid #86EFAC', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%', marginTop:4 }}
        onClick={() => navigate('localDetalle', {
          id:       localId,
          name:     o.storeName || o.proName || o.pro,
          category: cat || (o.type === 'delivery' ? 'restaurante' : 'local'),
          address:  o.storeAddress || o.clientAddress || '',
          photoURL: o.storePhotoURL || o.proPhotoURL || null,
          ...(o.storeId ? { storeId: o.storeId } : {})
        })}
      >
        {icon} {label}
      </button>
    )
  }

  const renderActions = (o) => (
    <div className="oc-actions">
      {['pending', 'confirmado', 'accepted', 'onway', 'arrived', 'trato'].includes(o.status) && (
        <button className="oc-btn track" onClick={()=>navigate('tracking',o)} style={{ width: '100%', marginBottom: 8 }}>📍 {T.track}</button>
      )}
      {o.status==='onway'   && userRole==='pro'  && <button className="oc-btn trato" onClick={()=>advanceStatus(o.id,o.status)}>{T.status.arrived}</button>}
      {o.status==='arrived' && userRole==='pro'  && <button className="oc-btn trato" onClick={()=>advanceStatus(o.id,o.status)}>{T.tratoHecho}</button>}
      {o.status==='trato'   && userRole==='pro'  && <button className="oc-btn track" onClick={()=>advanceStatus(o.id,o.status)}>{T.status.working}</button>}
      {o.status==='working' && (
        <>
          <button className="oc-btn track" onClick={()=>navigate('tracking',o)} style={{ width: '100%', marginBottom: 8, background: '#FFF3EC', color: '#F26000', border: '1px solid currentColor' }}>📍 {T.track}</button>
          {userRole === 'pro' ? (
            <WorkingTimer
              startedAt={o.workingStartedAt || o.updatedAt || o.createdAt}
              lang={lang}
              isPro={true}
              onFinish={() => setWorkDoneOrder(o)}
            />
          ) : (
            <WorkingTimer
              startedAt={o.workingStartedAt || o.updatedAt || o.createdAt}
              lang={lang}
              isPro={false}
              onFinish={null}
            />
          )}
        </>
      )}
      {o.status==='pending' && userRole==='pro' && (
        <div style={{ display:'flex', gap:8, width:'100%' }}>
          <button className="oc-btn decline" onClick={()=>setCancelTarget(o)} style={{ flex:1, background:'#FFF0F0', color:'#E31837', border:'1px solid currentColor' }}>{T.decline}</button>
          <button className="oc-btn listo"   onClick={() => setDetailsOrder(o)} style={{ flex:1 }}>{lang==='es'?'Aceptar Servicio':'Accept Service'}</button>
        </div>
      )}
      {!['done', 'cancelled', 'working'].includes(o.status) && userRole!=='pro' && (
        <button className="oc-btn cancel-outline" onClick={()=>setCancelTarget(o)} style={{ width:'100%', marginTop: 4 }}>{lang==='es'?'Cancelar Pedido':'Cancel Order'}</button>
      )}
      {['accepted','onway','arrived','trato','working'].includes(o.status) && o.otherUid && (
        <button className="oc-btn track" style={{ background:'#FFF3EC', color:'#F26000', border:'1px solid #FFD4B0' }} onClick={()=>openChat(o)}>
          💬 {lang==='es'?'Abrir chat':'Open chat'}
        </button>
      )}
      {o.paymentStatus==='verifying' && userRole==='pro' && (
        <button className="oc-btn trato" onClick={()=>setVerifyingOrder(o)} style={{ background:'#ECFDF5', color:'#10B981', borderColor:'#A7F3D0', fontWeight:'bold' }}>👁️ Ver Recibo (Pago)</button>
      )}
      {o.status==='done' && userRole!=='pro' && (
        PAID_STATUSES.includes(o.paymentStatus) ? (
          <button className="oc-btn listo" style={{ background:'#94A3B8', cursor:'not-allowed', marginBottom:8 }} disabled>
            💳 {lang==='es'?'Trabajo Pago':'Work Paid'}
          </button>
        ) : (
          <button className="oc-btn listo" style={{ background:'#10B981', boxShadow:'0 4px 14px rgba(16,185,129,0.35)', marginBottom:8 }} onClick={()=>navigate('payment', { ...o, orderId:o.id })}>
            💳 {lang==='es'?'Proceder al Pago':'Proceed to Payment'}
          </button>
        )
      )}
      {o.status==='done' && (
        <button 
          className="oc-btn track" 
          style={{ background:'#FFF7ED', color:'#C2410C', border:'1.5px solid #FDBA74', marginTop:4, width:'100%', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
          onClick={()=>setReciboModalOrder(o)}
        >
          🧾 {lang==='es'?'Ver Factura Oficial: Listo Patrón':'View Official Invoice: Listo Patrón'}
        </button>
      )}
      {o.status==='done' && !o.rated && userRole!=='pro' && RATEABLE_PAYS.includes(o.paymentStatus) && <button className="oc-btn review" onClick={()=>setReviewOrder(o)}>{T.review}</button>}
      {o.status==='done' && o.rated && <span className="oc-rated">⭐ {T.rated}</span>}
      {getStoreBtn(o)}
    </div>
  )

  return (
    <div className="orders-page">
      <header className="orders-header">
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <h1 className="orders-title">{T.title}</h1>
          {pendingReview.length>0 && userRole!=='pro' && <span className="orders-badge" title={T.statToRate}>{pendingReview.length}</span>}
        </div>
        <button id="orders-bell-btn" className={`orders-bell ${unread > 0 ? 'ringing' : ''}`} onClick={() => setShowNotifs(true)} aria-label="Notificaciones">
          🔔
          {unread > 0 && <span className="orders-bell-count">{unread > 9 ? '9+' : unread}</span>}
        </button>
      </header>

      {/* ── Resumen ── */}
      {!loading && (orders.length > 0 || history.length > 0) && (
        <div className="orders-stats">
          {userRole === 'pro' ? (
            <>
              <div className="stat-card s1"><span>💰</span><strong>{money(stats.today)}</strong><small>{T.statToday}</small></div>
              <div className="stat-card s2"><span>📈</span><strong>{money(stats.week)}</strong><small>{T.statWeek}</small></div>
              <div className="stat-card s3"><span>✅</span><strong>{stats.jobs}</strong><small>{T.statJobs}</small></div>
            </>
          ) : (
            <>
              <div className="stat-card s1"><span>📦</span><strong>{stats.month}</strong><small>{T.statMonth}</small></div>
              <div className="stat-card s2"><span>💳</span><strong>{money(stats.spent)}</strong><small>{T.statSpent}</small></div>
              <div className="stat-card s3"><span>⭐</span><strong>{pendingReview.length}</strong><small>{T.statToRate}</small></div>
            </>
          )}
        </div>
      )}

      {loading && (
        <section className="orders-section">
          <OrderSkeleton /><OrderSkeleton /><OrderSkeleton />
        </section>
      )}
      {!loading && orders.length===0 && history.length===0 && (
        <div className="empty-state fancy">
          <div className="empty-illus"><span>📋</span></div>
          <h2 className="empty-title">{T.empty}</h2>
          <p className="empty-sub">{T.emptySub}</p>
          {userRole !== 'pro' && (
            <button id="orders-empty-cta" className="empty-cta" onClick={() => navigate('search')}>{T.emptyCta}</button>
          )}
        </div>
      )}
      {orders.length>0 && (
        <section className="orders-section">
          <h2 className="orders-section-title">⚡ {T.active} <span className="live-dot" /></h2>
          {orders.map((o, i) => (
            <div key={o.id} className={`order-card active-card card-enter ${changedIds.includes(o.id) ? 'status-changed' : ''}`} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="oc-top">
                {o.photoURL ? <img src={o.photoURL} alt={o.specialty} style={{ width:44,height:44,borderRadius:'50%',objectFit:'cover',flexShrink:0 }}/> : <div className="oc-avatar" style={{ background:avatarColors[i%avatarColors.length],width:44,height:44 }}>{o.avatar}</div>}
                <div className="oc-info"><p className="oc-name">{o.pro}</p><p className="oc-spec">{o.icon} {o.specialty}</p><p className="oc-date">📅 {o.date}</p></div>
                <div className="oc-right"><span className="oc-status" style={{ color:statusColor(o.status),background:statusColor(o.status)+'18' }}>{T.status[o.status] || o.status || 'Pendiente'}</span><p className="oc-price">{o.price || (o.total ? `RD$ ${o.total}` : '')}</p></div>
              </div>

              {o.pinOTP && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', color: '#FFF', padding: '8px 14px', borderRadius: '12px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800' }}>
                    <span>🔒 PIN DE ENTREGA:</span>
                    <span style={{ color: '#FDE047', fontFamily: 'monospace', letterSpacing: '2px', fontSize: '15px', fontWeight: '900' }}>{o.pinOTP}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#C7D2FE' }}>
                    {o.fulfillmentType === 'pickup' ? 'Díselo al cajero al retirar' : 'Díselo al repartidor'}
                  </span>
                </div>
              )}

              {o.items && o.items.length > 0 && (
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '10px 14px', marginTop: '8px', border: '1px solid #E2E8F0' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>🛍️ Productos del Pedido:</p>
                  {o.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#1E293B', marginBottom: '3px' }}>
                      <span>{it.qty || 1}x {it.name}</span>
                      <span style={{ fontWeight: '700' }}>RD$ {((it.price || 0) * (it.qty || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                  {o.deliveryAddress && (
                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: o.fulfillmentType === 'pickup' ? '#047857' : '#64748B', borderTop: '1px dashed #CBD5E1', paddingTop: '4px', fontWeight: o.fulfillmentType === 'pickup' ? 800 : 500 }}>
                      {o.fulfillmentType === 'pickup' ? `🛍️ Retiro en el Local: ${o.storeName || 'Mostrador del Restaurante'}` : `📍 Entrega: ${o.deliveryAddress}`}
                    </p>
                  )}
                </div>
              )}

              <div className="order-progress">
                {PROGRESS_STEPS.map((s, idx, arr) => {
                  const isDone = stepIndex(o.status) > idx;
                  const isActive = stepIndex(o.status) === idx;
                  const dotClass = isDone ? 'done' : (isActive ? 'active-step' : '');
                  return (
                    <div key={s} className="op-step">
                      <div className={`op-dot ${dotClass}`} />
                      {idx<arr.length-1 && <div className={`op-line ${isDone ? 'done' : ''}`} />}
                    </div>
                  );
                })}
              </div>
              <div className="order-progress-labels">
                {PROGRESS_LABELS[lang].map((l, idx) => {
                  const isActive = stepIndex(o.status) === idx;
                  return <span key={idx} className={`op-label ${isActive ? 'on' : ''}`}>{l}</span>;
                })}
              </div>

              {o.status !== 'working' && <EtaCountdown order={o} lang={lang} T={T} />}
              {renderActions(o)}
            </div>
          ))}
        </section>
      )}
      {history.length > 0 && (
      <section className="orders-section">
        <h2 className="orders-section-title">🕐 {T.history}</h2>
        <div className="history-filters" role="tablist">
          {Object.entries(T.filters).map(([key, label]) => (
            <button key={key} id={`orders-filter-${key}`} role="tab" aria-selected={historyFilter === key}
              className={`hf-chip ${historyFilter === key ? 'on' : ''}`} onClick={() => setHistoryFilter(key)}>
              {label}
            </button>
          ))}
        </div>
        {filteredHistory.length === 0 && <p className="hf-empty">{T.noFilterResults}</p>}
        {filteredHistory.map((o, i) => (
          <div key={o.id} className={`order-card card-enter ${o.status === 'cancelled' ? 'is-cancelled' : ''} ${changedIds.includes(o.id) ? 'status-changed' : ''}`} style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
            <div className="oc-top">
              {o.photoURL ? <img src={o.photoURL} alt={o.specialty} style={{ width:44,height:44,borderRadius:'50%',objectFit:'cover',flexShrink:0 }}/> : <div className="oc-avatar" style={{ background:avatarColors[(i+2)%avatarColors.length],width:44,height:44 }}>{o.avatar}</div>}
              <div className="oc-info"><p className="oc-name">{o.pro}</p><p className="oc-spec">{o.icon} {o.specialty}</p><p className="oc-date">📅 {o.date}</p></div>
              <div className="oc-right"><span className="oc-status" style={{ color:statusColor(o.status),background:statusColor(o.status)+'18' }}>{T.status[o.status] || o.status || 'Completado'}</span><p className="oc-price">{o.price}</p></div>
            </div>
            <div className="oc-actions">
              {o.status==='done' && userRole!=='pro' && (
                PAID_STATUSES.includes(o.paymentStatus) ? (
                  <button className="oc-btn listo" style={{ background:'#94A3B8', cursor:'not-allowed', marginBottom:8 }} disabled>
                    💳 {lang==='es'?'Trabajo Pago':'Work Paid'}
                  </button>
                ) : (
                  <button className="oc-btn listo" style={{ background:'#10B981',boxShadow:'0 4px 14px rgba(16,185,129,0.35)',marginBottom:8 }} onClick={()=>navigate('payment', { ...o, orderId:o.id })}>
                    💳 {lang==='es'?'Proceder al Pago':'Proceed to Payment'}
                  </button>
                )
              )}
              {o.status==='done' && !o.rated && userRole!=='pro' && RATEABLE_PAYS.includes(o.paymentStatus) && <button className="oc-btn review" onClick={()=>setReviewOrder(o)}>{T.review}</button>}
              {o.status==='done' && o.rated && <span className="oc-rated">⭐ {T.rated}</span>}
              {o.status==='done' && userRole !== 'pro' && (
                <button className="oc-btn track" style={{ background:'#FFF7ED', color:'#C2410C', border:'1px solid #FFEDD5', marginTop:4, fontWeight:'bold' }} onClick={()=>setShowMantenimientoModal(true)}>
                  📅 {lang==='es'?'Agenda Preventiva':'Preventive Schedule'}
                </button>
              )}
              {o.status==='done' && (
                <button 
                  className="oc-btn track" 
                  style={{ background:'#FFF7ED', color:'#C2410C', border:'1.5px solid #FDBA74', marginTop:4, width:'100%', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
                  onClick={()=>setReciboModalOrder(o)}
                >
                  🧾 {lang==='es'?'Ver Factura Oficial: Listo Patrón':'View Official Invoice: Listo Patrón'}
                </button>
              )}
              {userRole !== 'pro' && (
                <button className="oc-btn rebook" onClick={()=>rebookSamePro(o)}>
                  {o.proId && o.type !== 'delivery' ? T.rebookSame : T.rebook}
                </button>
              )}
              {getStoreBtn(o)}
            </div>
            
            {/* ── VISUALIZAR RESEÑA ── */}
            {o.rated && o.ratingScore && (
              <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: '#FAFAFA', border: '1px solid #EFEFEF', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>
                    {userRole === 'pro' ? `Calificación de ${o.clientName || 'Cliente'}` : 'Tu Calificación'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 14, letterSpacing: 2 }}>{'⭐'.repeat(Math.max(0, Math.min(5, Math.floor(o.ratingScore || 0))))}</span>
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
      )}
      {reviewOrder    && <ReviewModal    order={reviewOrder}    lang={lang} onClose={()=>setReviewOrder(null)}    onSubmit={handleReviewSubmit} />}
      {cancelTarget   && <ConfirmCancelModal T={T} isPro={userRole==='pro'} onConfirm={confirmCancel} onClose={()=>setCancelTarget(null)} />}
      {showNotifs && (
        <NotificacionesModal
          onClose={() => setShowNotifs(false)}
          notifs={notifs}
          lang={lang}
          onMarkAllRead={handleMarkAllRead}
          navigate={navigate}
          orders={allOrders}
          onOpenOrder={handleOpenOrderFromNotif}
        />
      )}
      {celebrate && <Confetti onDone={() => setCelebrate(false)} />}
      {toast && <div className="orders-toast" role="status">🔔 {toast}</div>}
      {verifyingOrder && <ReceiptModal   order={verifyingOrder} lang={lang} onClose={()=>setVerifyingOrder(null)} onApprove={handlePaymentApprove} />}
      {detailsOrder   && <OrderDetailsModal order={detailsOrder} lang={lang} onClose={()=>setDetailsOrder(null)} onAccept={handleAccept} onDecline={handleDecline} />}


      {/* ── Modal Pedidos Listo (pro) ── */}
      {workDoneOrder && (
        <div className="review-overlay" onClick={()=>setWorkDoneOrder(null)} style={{ zIndex:1000000 }}>
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
              onClick={async ()=>{ await handleWorkDone(workDoneOrder); setCelebrate(true) }}
              style={{ width:'100%', padding:16, borderRadius:14, background:'#F26000', color:'#fff', border:'none', fontWeight:900, fontSize:17, cursor:'pointer', boxShadow:'0 4px 16px rgba(242,96,0,0.35)', marginBottom:12 }}
            >
              ✅ {lang==='es' ? '¡Pedidos Listo!' : 'Done Boss!'}
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
      {reciboModalOrder && (
        <ReciboDigitalModal
          order={reciboModalOrder}
          orderData={reciboModalOrder}
          lang={lang}
          onClose={() => setReciboModalOrder(null)}
        />
      )}
      {showMantenimientoModal && (
        <MantenimientoPreventivoModal
          lang={lang}
          onClose={() => setShowMantenimientoModal(false)}
          navigate={navigate}
          userProfile={userData}
        />
      )}
      <div style={{ height:80 }} />
    </div>
  )
}