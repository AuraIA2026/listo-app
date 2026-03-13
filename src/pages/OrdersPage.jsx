import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import './OrdersPage.css'

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
    track:              'Seguir en mapa',
    tratoHecho:         '✅ Trato hecho',
    listo:              '🎉 ¡Listo!',
    review:             '⭐ Calificar',
    rebook:             '↩ Repetir',
    empty:              'No tienes pedidos aún',
    emptySub:           'Reserva tu primer servicio',
    reviewTitle:        'Califica a tu profesional',
    reviewSub:          '¿Cómo fue el servicio?',
    reviewSend:         'Enviar reseña',
    reviewPlaceholder:  'Escribe un comentario (opcional)...',
    rated:              'Calificado',
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
    track:              'Track on map',
    tratoHecho:         '✅ Deal made',
    listo:              '🎉 Done!',
    review:             '⭐ Review',
    rebook:             '↩ Rebook',
    empty:              'No orders yet',
    emptySub:           'Book your first service',
    reviewTitle:        'Rate your professional',
    reviewSub:          'How was the service?',
    reviewSend:         'Send review',
    reviewPlaceholder:  'Write a comment (optional)...',
    rated:              'Reviewed',
  },
}

const avatarColors = ['#F26000', '#C24D00', '#FF8533', '#7A3000', '#FFB380']

// Mapa de especialidad -> foto (Opcional, de respaldo por si el pro no tiene foto subida)
const specialtyPhoto = {
  'Mecánico':     '/src/assets/pros/Mecanico.jpg',
  'Mechanic':     '/src/assets/pros/Mecanico.jpg',
  'Limpieza':     '/src/assets/pros/Niñera.jpg',
  'Cleaning':     '/src/assets/pros/Niñera.jpg',
  'Electricista': '/src/assets/pros/Electricista.jpg',
  'Electrician':  '/src/assets/pros/Electricista.jpg',
  'Plomero':      '/src/assets/pros/Plomero.jpg',
  'Plumber':      '/src/assets/pros/Plomero.jpg',
  'Pintor':       '/src/assets/pros/Pintor.jpg',
  'Painter':      '/src/assets/pros/Pintor.jpg',
  'Jardinero':    '/src/assets/pros/Jardinero.jpg',
  'Cerrajero':    '/src/assets/pros/Cerrajero.jpg',
}

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
const PROGRESS_LABELS = { es: ['Pendiente','Camino','Llegó','Trato','Trabajando','Listo'], en: ['Pending','On way','Arrived','Deal','Working','Done'] }

/* ── MODAL NOTIFICACIONES ── */
function NotificacionesModal({ onClose, notifs, lang, onMarkAllRead }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '480px', background: '#fff',
        borderRadius: '24px 24px 0 0', padding: '16px 20px 40px',
        animation: 'slideUp .3s cubic-bezier(.32,1.2,.5,1)',
        maxHeight: '75vh', display: 'flex', flexDirection: 'column',
      }}>
        <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

        {/* Handle */}
        <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '0 auto 16px', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1A2E', margin: 0 }}>
            🔔 Notificaciones
          </h3>
          {notifs.some(n => !n.read) && (
            <button onClick={onMarkAllRead} style={{
              background: 'none', border: 'none', color: '#F26000',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            }}>
              ✓ Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Lista */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {notifs.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: '40px', margin: '0 0 10px' }}>🔔</p>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A2E', margin: '0 0 6px' }}>
                  {lang === 'es' ? 'No tienes notificaciones' : 'No notifications yet'}
                </p>
                <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
                  {lang === 'es' ? 'Te avisaremos cuando haya novedades' : "We'll notify you when there's news"}
                </p>
              </div>
            )
            : notifs.map((n, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '12px', borderRadius: '12px', marginBottom: '8px',
                background: n.read ? '#fff' : '#FFF3EC',
                border: n.read ? '1px solid #f0f0f0' : '1px solid #FFD580',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{n.icon || '🔔'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: n.read ? '600' : '800', color: '#1A1A2E' }}>
                    {n.text}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>{n.time}</p>
                </div>
                {!n.read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F26000', flexShrink: 0, marginTop: '4px' }} />
                )}
              </div>
            ))
          }
        </div>

        <button onClick={onClose} style={{
          width: '100%', background: 'none', border: 'none', color: '#999',
          fontSize: '13px', fontWeight: '600', marginTop: '14px', cursor: 'pointer', flexShrink: 0,
        }}>
          {lang === 'es' ? 'Cerrar' : 'Close'}
        </button>
      </div>
    </div>
  )
}

function ReviewModal({ order, lang, onClose, onSubmit }) {
  const T = txt[lang]
  const [stars,   setStars]   = useState(0)
  const [hover,   setHover]   = useState(0)
  const [comment, setComment] = useState('')

  return (
    <div className="review-overlay" onClick={onClose}>
      <div className="review-modal" onClick={e => e.stopPropagation()}>
        <button className="review-close" onClick={onClose}>✕</button>
        <ProAvatar specialty={order.specialty} avatar={order.avatar} color={avatarColors[0]} size={64} />
        <h3 className="review-title">{T.reviewTitle}</h3>
        <p className="review-pro-name">{order.pro}</p>
        <p className="review-sub">{T.reviewSub}</p>
        <div className="review-stars">
          {[1,2,3,4,5].map(s => (
            <button
              key={s}
              className={`review-star ${s <= (hover || stars) ? 'active' : ''}`}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setStars(s)}
            >★</button>
          ))}
        </div>
        <textarea
          className="review-comment"
          placeholder={T.reviewPlaceholder}
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
        />
        <button
          className="review-submit"
          disabled={stars === 0}
          onClick={() => onSubmit(order.id, stars, comment)}
        >
          {T.reviewSend}
        </button>
      </div>
    </div>
  )
}

export default function OrdersPage({ lang = 'es', navigate, userData, userRole }) {
  const T = txt[lang]
  const [orders,      setOrders]      = useState([])
  const [history,     setHistory]     = useState([])
  const [reviewOrder, setReviewOrder] = useState(null)
  const [loading,     setLoading]     = useState(true)

  // Estados Notificaciones
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifs, setNotifs]         = useState([])
  const [unread, setUnread]         = useState(0)

  useEffect(() => {
    if (!auth.currentUser || !userRole) {
      setLoading(false)
      return
    }
    const uid = auth.currentUser.uid
    // Si es pro busca proId, si es user/client busca clientId
    const fieldType = userRole === 'pro' ? 'proId' : 'clientId'
    
    const q = query(collection(db, 'orders'), where(fieldType, '==', uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const active = []
      const past = []
      snapshot.forEach(docSnap => {
        const d = docSnap.data()
        // Formateemos a la estructura que espera la vista
        const orderData = {
          id: docSnap.id,
          pro: userRole === 'pro' ? (d.clientEmail || 'Cliente') : (d.proName || 'Profesional'),
          specialty: d.proSpecialty || 'Servicio',
          avatar: userRole === 'pro' ? '👤' : (d.proAvatar || 'P'),
          photoURL: userRole === 'pro' ? null : d.proPhotoURL,
          date: `${d.dateToken} - ${d.timeToken}`,
          price: d.price || 'RD$0',
          status: d.status || 'pending',
          icon: '🔧',
          rated: d.rated || false,
          ...d
        }
        
        if (orderData.status === 'done' || orderData.status === 'cancelled') {
          past.push(orderData)
        } else {
          active.push(orderData)
        }
      })
      // Ordenar por fecha cronológicamente usando 'createdAt' si existe
      active.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      past.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))

      setOrders(active)
      setHistory(past)
      setLoading(false)
    }, (error) => {
      console.error("Error al escuchar orders", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userRole])

  // Efecto Notificaciones Generales
  useEffect(() => {
    if (!auth.currentUser) return
    const q = query(
      collection(db, 'notificaciones'),
      where('userId', '==', auth.currentUser.uid)
    )
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setNotifs(data)
      setUnread(data.filter(n => !n.read).length)
    })
    return () => unsub()
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(
        notifs.filter(n => !n.read).map(n =>
          updateDoc(doc(db, 'notificaciones', n.id), { read: true })
        )
      )
    } catch (e) {
      console.error("Error marcando leídas:", e)
    }
  }

  const activeOrders  = orders // Las orders canceladas/hechas ya fueron movidas al arreglo history en el snapshot
  const pendingReview = [...activeOrders, ...history].filter(o => o.status === 'done' && !o.rated)

  const advanceStatus = async (id, currentStatus) => {
    const next = nextStatus[currentStatus]
    if (!next) return
    try {
      await updateDoc(doc(db, 'orders', id), { status: next })
    } catch(e) {
      console.error("Error updating status: ", e)
    }
  }

  const handleReviewSubmit = async (id, stars, comment) => {
    try {
      await updateDoc(doc(db, 'orders', id), { rated: true, ratingScore: stars, ratingComment: comment })
      setReviewOrder(null)
    } catch(e) {
       console.error("Error submitting review: ", e)
    }
  }

  const renderActions = (o) => {
    // Solo el pro avanza estados como "En camino", "Llego", "Trabajando", "Listo"
    // El cliente podría cancelar si esta pendiente, por simplicidad dejaremos la UI
    // que asume quien aprueba o adelanta
    
    return (
      <div className="oc-actions">
        {o.status === 'onway' && userRole === 'pro' && (
           <button className="oc-btn trato" onClick={() => advanceStatus(o.id, o.status)}>
              {T.status.arrived}
           </button>
        )}
        {o.status === 'onway' && userRole !== 'pro' && (
          <button className="oc-btn track" onClick={() => navigate('tracking', o)}>
            📍 {T.track}
          </button>
        )}
        {o.status === 'arrived' && userRole === 'pro' && (
          <button className="oc-btn trato" onClick={() => advanceStatus(o.id, o.status)}>
            {T.tratoHecho}
          </button>
        )}
        {o.status === 'trato' && userRole === 'pro' && (
          <button className="oc-btn track" onClick={() => advanceStatus(o.id, o.status)}>
             {T.status.working}
          </button>
        )}
        {o.status === 'working' && userRole === 'pro' && (
          <button className="oc-btn listo" onClick={() => advanceStatus(o.id, o.status)}>
            {T.listo}
          </button>
        )}
        
        {/* El cliente o Pro aceptan la orden nueva */}
        {o.status === 'pending' && userRole === 'pro' && (
           <button className="oc-btn listo" onClick={() => advanceStatus(o.id, o.status)}>
             Aceptar Servicio
           </button>
        )}

        {/* Solo cliente o usuario deja review */}
        {o.status === 'done' && !o.rated && userRole !== 'pro' && (
          <button className="oc-btn review" onClick={() => setReviewOrder(o)}>
            {T.review}
          </button>
        )}
        {o.status === 'done' && o.rated && (
          <span className="oc-rated">⭐ {T.rated}</span>
        )}
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="orders-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 className="orders-title" style={{ margin: 0 }}>{T.title}</h1>
          {pendingReview.length > 0 && userRole !== 'pro' && (
            <span className="orders-badge">{pendingReview.length}</span>
          )}
        </div>

        {/* Campana de Notificaciones condicional */}
        {(notifs.length > 0 || unread > 0) && (
          <button
            onClick={() => setShowNotifs(true)}
            style={{
              position: 'relative', background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '6px'
            }}
          >
            <span style={{ fontSize: '26px' }}>🔔</span>
            {unread > 0 && (
              <div style={{
                position: 'absolute', top: '2px', right: '0px',
                background: '#F26000', color: '#fff',
                fontSize: '10px', fontWeight: '900',
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff',
              }}>
                {unread > 9 ? '9+' : unread}
              </div>
            )}
          </button>
        )}
      </div>

      {loading && <p style={{textAlign: 'center', marginTop: 30, color: '#666'}}>Cargando pedidos...</p>}

      {!loading && activeOrders.length === 0 && history.length === 0 && (
         <div className="empty-state" style={{marginTop: 50}}>
           <span style={{fontSize: 40}}>📋</span>
           <p style={{marginTop: 10}}>{T.empty}</p>
         </div>
      )}

      {activeOrders.length > 0 && (
        <section className="orders-section">
          <h2 className="orders-section-title">⚡ {T.active}</h2>
          {activeOrders.map((o, i) => (
            <div key={o.id} className="order-card active-card">
              <div className="oc-top">
                {o.photoURL ? (
                    <img src={o.photoURL} alt={o.specialty} style={{width:44, height:44, borderRadius:'50%', objectFit:'cover', flexShrink:0}}/>
                ) : (
                    <div className="oc-avatar" style={{ background: avatarColors[i % avatarColors.length], width:44, height:44 }}>
                       {o.avatar}
                    </div>
                )}
                <div className="oc-info">
                  <p className="oc-name">{o.pro}</p>
                  <p className="oc-spec">{o.icon} {o.specialty}</p>
                  <p className="oc-date">📅 {o.date}</p>
                </div>
                <div className="oc-right">
                  <span className="oc-status" style={{ color: statusColor(o.status), background: statusColor(o.status) + '18' }}>
                    {T.status[o.status]}
                  </span>
                  <p className="oc-price">{o.price}</p>
                </div>
              </div>

              <div className="order-progress">
                {PROGRESS_STEPS.map((s, idx, arr) => (
                  <div key={s} className="op-step">
                    <div className={`op-dot ${PROGRESS_STEPS.indexOf(o.status) >= idx ? 'done' : ''}`} />
                    {idx < arr.length - 1 && (
                      <div className={`op-line ${PROGRESS_STEPS.indexOf(o.status) > idx ? 'done' : ''}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="order-progress-labels">
                {PROGRESS_LABELS[lang].map((l, idx) => (
                  <span key={idx} className="op-label">{l}</span>
                ))}
              </div>

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
                {o.photoURL ? (
                    <img src={o.photoURL} alt={o.specialty} style={{width:44, height:44, borderRadius:'50%', objectFit:'cover', flexShrink:0}}/>
                ) : (
                    <div className="oc-avatar" style={{ background: avatarColors[(i+2) % avatarColors.length], width:44, height:44 }}>
                       {o.avatar}
                    </div>
                )}
              <div className="oc-info">
                <p className="oc-name">{o.pro}</p>
                <p className="oc-spec">{o.icon} {o.specialty}</p>
                <p className="oc-date">📅 {o.date}</p>
              </div>
              <div className="oc-right">
                <span className="oc-status" style={{ color: statusColor(o.status), background: statusColor(o.status) + '18' }}>
                  {T.status[o.status]}
                </span>
                <p className="oc-price">{o.price}</p>
              </div>
            </div>
            <div className="oc-actions">
              {o.status === 'done' && !o.rated && (
                <button className="oc-btn review" onClick={() => setReviewOrder(o)}>
                  {T.review}
                </button>
              )}
              {o.status === 'done' && o.rated && (
                <span className="oc-rated">⭐ {T.rated}</span>
              )}
              {o.status !== 'cancelled' && (
                <button className="oc-btn rebook" onClick={() => navigate('search')}>
                  {T.rebook}
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          lang={lang}
          onClose={() => setReviewOrder(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

      {/* Modal Notificaciones */}
      {showNotifs && (
        <NotificacionesModal
          onClose={() => setShowNotifs(false)}
          notifs={notifs}
          lang={lang}
          onMarkAllRead={handleMarkAllRead}
        />
      )}

      <div style={{ height: 80 }} />
    </div>
  )
}