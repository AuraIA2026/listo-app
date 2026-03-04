import { useState } from 'react'
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

// Mapa de especialidad -> foto
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

const initialOrders = [
  { id: 1, pro: 'Carlos Méndez', specialty: 'Mecánico',  avatar: 'CM', date: 'Hoy, 3:00 PM',    price: 'RD$800',   status: 'onway',   icon: '🔧', rated: false },
  { id: 2, pro: 'Carmen Díaz',   specialty: 'Limpieza',  avatar: 'CD', date: 'Mañana, 9:00 AM', price: 'RD$1,200', status: 'pending', icon: '🧹', rated: false },
]

const initialHistory = [
  { id: 3, pro: 'Ana Rodríguez', specialty: 'Electricista', avatar: 'AR', date: '20 Feb 2026', price: 'RD$950',   status: 'done',      icon: '⚡', rated: true  },
  { id: 4, pro: 'Pedro Sánchez', specialty: 'Plomero',      avatar: 'PS', date: '15 Feb 2026', price: 'RD$750',   status: 'done',      icon: '🔩', rated: false },
  { id: 5, pro: 'Luis García',   specialty: 'Pintor',       avatar: 'LG', date: '10 Feb 2026', price: 'RD$2,500', status: 'cancelled', icon: '🎨', rated: false },
]

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

// Componente de avatar con foto o iniciales como fallback
function ProAvatar({ specialty, avatar, color, size = 44 }) {
  const [imgError, setImgError] = useState(false)
  const photo = specialtyPhoto[specialty]

  if (photo && !imgError) {
    return (
      <img
        src={photo}
        alt={specialty}
        onError={() => setImgError(true)}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div className="oc-avatar" style={{ background: color, width: size, height: size }}>
      {avatar}
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

export default function OrdersPage({ lang = 'es', navigate }) {
  const T = txt[lang]
  const [orders,      setOrders]      = useState(initialOrders)
  const [history,     setHistory]     = useState(initialHistory)
  const [reviewOrder, setReviewOrder] = useState(null)

  const activeOrders  = orders.filter(o => o.status !== 'done' && o.status !== 'cancelled')
  const pendingReview = [...orders, ...history].filter(o => o.status === 'done' && !o.rated)

  const advanceStatus = (id) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o
      const next = nextStatus[o.status]
      if (!next) return o
      if (next === 'done') {
        setTimeout(() => {
          setOrders(p => p.filter(x => x.id !== id))
          setHistory(p => [{ ...o, status: 'done' }, ...p])
        }, 800)
      }
      return { ...o, status: next }
    }))
  }

  const handleReviewSubmit = (id, stars, comment) => {
    setOrders(prev  => prev.map(o  => o.id === id ? { ...o, rated: true } : o))
    setHistory(prev => prev.map(o  => o.id === id ? { ...o, rated: true } : o))
    setReviewOrder(null)
  }

  const renderActions = (o) => (
    <div className="oc-actions">
      {o.status === 'onway' && (
        <button className="oc-btn track" onClick={() => navigate('tracking', o)}>
          📍 {T.track}
        </button>
      )}
      {o.status === 'arrived' && (
        <button className="oc-btn trato" onClick={() => advanceStatus(o.id)}>
          {T.tratoHecho}
        </button>
      )}
      {o.status === 'working' && (
        <button className="oc-btn listo" onClick={() => advanceStatus(o.id)}>
          {T.listo}
        </button>
      )}
      {o.status === 'done' && !o.rated && (
        <button className="oc-btn review" onClick={() => setReviewOrder(o)}>
          {T.review}
        </button>
      )}
      {o.status === 'done' && o.rated && (
        <span className="oc-rated">⭐ {T.rated}</span>
      )}
    </div>
  )

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1 className="orders-title">{T.title}</h1>
        {pendingReview.length > 0 && (
          <span className="orders-badge">{pendingReview.length}</span>
        )}
      </div>

      {activeOrders.length > 0 && (
        <section className="orders-section">
          <h2 className="orders-section-title">⚡ {T.active}</h2>
          {activeOrders.map((o, i) => (
            <div key={o.id} className="order-card active-card">
              <div className="oc-top">
                <ProAvatar specialty={o.specialty} avatar={o.avatar} color={avatarColors[i % avatarColors.length]} />
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
              <ProAvatar specialty={o.specialty} avatar={o.avatar} color={avatarColors[(i + 2) % avatarColors.length]} />
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

      <div style={{ height: 80 }} />
    </div>
  )
}