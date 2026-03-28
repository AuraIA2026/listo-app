import { useState, useEffect } from 'react'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './ClientProfilePage.css'

const txt = {
  es: {
    memberSince: 'Miembro desde',
    orders: 'Pedidos',
    reviews: 'Reseñas dadas',
    address: 'Dirección',
    noAddress: 'Sin dirección guardada',
    noOrders: 'Aún no tienes pedidos',
    noOrdersSub: 'Cuando hagas tu primer pedido aparecerá aquí',
    noReviews: 'Aún no has dado reseñas',
    noReviewsSub: 'Tus reseñas a profesionales aparecerán aquí',
    activeClient: 'Cliente activo',
    verifiedClient: 'Cliente verificado',
    ordersTab: 'Pedidos',
    reviewsTab: 'Reseñas',
    infoTab: 'Información',
    editProfile: 'Editar perfil',
    phone: 'Teléfono',
    email: 'Correo',
    joined: 'Se unió en',
    totalSpent: 'Total gastado',
    favoriteService: 'Servicio favorito',
    noFavorite: 'Sin datos aún',
  },
  en: {
    memberSince: 'Member since',
    orders: 'Orders',
    reviews: 'Reviews given',
    address: 'Address',
    noAddress: 'No address saved',
    noOrders: 'No orders yet',
    noOrdersSub: 'Your first order will appear here',
    noReviews: 'No reviews yet',
    noReviewsSub: 'Your reviews to professionals will appear here',
    activeClient: 'Active client',
    verifiedClient: 'Verified client',
    ordersTab: 'Orders',
    reviewsTab: 'Reviews',
    infoTab: 'Info',
    editProfile: 'Edit profile',
    phone: 'Phone',
    email: 'Email',
    joined: 'Joined',
    totalSpent: 'Total spent',
    favoriteService: 'Favorite service',
    noFavorite: 'No data yet',
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatDate = (createdAt) => {
  if (!createdAt) return '—'
  try {
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt)
    return date.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' })
  } catch { return '—' }
}

const avatarColors = ['#F26000','#C24D00','#FF8533','#3B82F6','#10B981','#8B5CF6']

export default function ClientProfilePage({ lang = 'es', navigate, userData, onEditProfile }) {
  const T = txt[lang]
  const [activeTab, setActiveTab] = useState('info')
  const [orders,    setOrders]    = useState([])
  const [reviews,   setReviews]   = useState([])
  const [loading,   setLoading]   = useState(true)

  const displayName  = userData?.name  || 'Usuario'
  const displayEmail = userData?.email || ''
  const displayPhone = userData?.phone || ''
  const initials     = getInitials(displayName)
  const memberSince  = formatDate(userData?.createdAt)
  const photoURL     = userData?.photoURL || null
  const address      = userData?.address  || null
  const avatarColor  = avatarColors[displayName.charCodeAt(0) % avatarColors.length]
  const isPro        = userData?.type === 'pro' || userData?.role === 'professional' || userData?.verificacion?.estado === 'aprobada'

  // Cargar pedidos y reseñas reales de Firestore
  useEffect(() => {
    if (!userData?.uid) { setLoading(false); return }
    const loadData = async () => {
      try {
        // Pedidos dependiendo del rol
        const field = isPro ? 'proId' : 'clientId'
        const pedidosQ = query(collection(db, 'orders'), where(field, '==', userData.uid))
        const pedidosSnap = await getDocs(pedidosQ)
        const pedidosList = pedidosSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        
        // Ordenar por las más recientes primero
        pedidosList.sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
        
        setOrders(pedidosList)

        // Reseñas 
        const reviewsList = pedidosList.filter(o => o.rated === true)
        setReviews(reviewsList)
      } catch (err) {
        console.error('Error cargando datos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [userData?.uid])

  const statusColor = (status) => {
    if (['completed', 'done'].includes(status)) return { bg: '#DCFCE7', color: '#16A34A', label: '✅ Completado' }
    if (['accepted', 'onway', 'arrived', 'working', 'trato'].includes(status)) return { bg: '#FEF3C7', color: '#D97706', label: '🚗 Activo' }
    if (status === 'pending') return { bg: '#EFF6FF', color: '#2563EB', label: '⏳ Pendiente' }
    if (['rejected', 'declined', 'canceled'].includes(status)) return { bg: '#FEE2E2', color: '#DC2626', label: '❌ Cancelado' }
    return { bg: '#F3F4F6', color: '#6B7280', label: status || 'Desconocido' }
  }

  return (
    <div className="client-profile-page">

      {/* COVER */}
      <div className="client-cover">
        <button className="client-back-btn" onClick={() => navigate('profile')}>‹</button>
        <div className="client-cover-gradient" />
      </div>

      {/* INFO PRINCIPAL */}
      <div className="client-info-section">
        <div className="client-avatar-wrap">
          <div className="client-avatar-large" style={photoURL ? { padding:0, overflow:'hidden' } : { background: avatarColor }}>
            {photoURL
              ? <img src={photoURL} alt="perfil" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <span>{initials}</span>
            }
          </div>
        </div>
        <div className="client-info-main">
          <div className="client-name-row">
            <h1 className="client-name">{displayName}</h1>
          </div>
          {displayEmail && <p className="client-email">✉️ {displayEmail}</p>}
          {displayPhone && <p className="client-phone">📞 {displayPhone}</p>}
          <div className="client-badges">
            <span className="client-badge active">🟢 {T.activeClient}</span>
            <span className="client-badge verified">✓ {T.verifiedClient}</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="client-stats-row">
        <div className="client-stat">
          <span className="client-stat-num">{orders.length}</span>
          <span className="client-stat-label">{T.orders}</span>
        </div>
        <div className="client-stat-divider" />
        <div className="client-stat">
          <span className="client-stat-num">{reviews.length}</span>
          <span className="client-stat-label">{isPro ? (lang==='es' ? 'Reseñas' : 'Reviews') : T.reviews}</span>
        </div>
        {isPro && (
          <>
            <div className="client-stat-divider" />
            <div className="client-stat">
              <span className="client-stat-num" style={{ color: '#F26000' }}>{userData?.contracts || 0}</span>
              <span className="client-stat-label">{lang==='es' ? 'Contratos' : 'Contracts'}</span>
            </div>
          </>
        )}
        <div className="client-stat-divider" />
        <div className="client-stat">
          <span className="client-stat-num">{memberSince}</span>
          <span className="client-stat-label">{T.memberSince}</span>
        </div>
      </div>

      {/* BOTON EDITAR */}
      <div style={{ padding: '0 16px 16px' }}>
        <button className="client-edit-btn" onClick={() => onEditProfile ? onEditProfile() : navigate('profile')}>
          ✏️ {T.editProfile}
        </button>
      </div>

      {/* TABS */}
      <div className="client-tabs">
        {['info','orders','reviews'].map(tab => (
          <button key={tab} className={`client-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'info'    && `ℹ️ ${T.infoTab}`}
            {tab === 'orders'  && `📋 ${T.ordersTab} (${orders.length})`}
            {tab === 'reviews' && `⭐ ${T.reviewsTab} (${reviews.length})`}
          </button>
        ))}
      </div>

      <div className="client-tab-content">

        {/* TAB INFO */}
        {activeTab === 'info' && (
          <div className="client-info-cards">
            <div className="info-card">
              <div className="info-card-title">👤 Datos personales</div>
              <InfoRow icon="✉️" label={T.email}  value={displayEmail || '—'} />
              <InfoRow icon="📞" label={T.phone}  value={displayPhone || '—'} />
              <InfoRow icon="📅" label={T.joined} value={memberSince} />
            </div>

            <div className="info-card">
              <div className="info-card-title">📍 {T.address}</div>
              {address ? (
                <>
                  <InfoRow icon="🏠" label="Dirección" value={address.direccion || '—'} />
                  <InfoRow icon="🏙️" label="Sector"    value={address.sector    || '—'} />
                  <InfoRow icon="📮" label="Municipio" value={address.municipio  || '—'} />
                </>
              ) : (
                <div className="info-empty">
                  <span>📍</span>
                  <p>{T.noAddress}</p>
                </div>
              )}
            </div>

            <div className="info-card">
              <div className="info-card-title">📊 Estadísticas</div>
              <InfoRow icon="🛒" label={T.orders}          value={`${orders.length} pedidos`} />
              <InfoRow icon="⭐" label={T.reviews}         value={`${reviews.length} reseñas`} />
              <InfoRow icon="🔧" label={T.favoriteService} value={T.noFavorite} />
            </div>
          </div>
        )}

        {/* TAB PEDIDOS */}
        {activeTab === 'orders' && (
          <div className="client-orders-list">
            {loading ? (
              <div className="tab-loading">⏳ Cargando pedidos...</div>
            ) : orders.length === 0 ? (
              <div className="tab-empty">
                <span>📋</span>
                <p>{T.noOrders}</p>
                <small>{T.noOrdersSub}</small>
              </div>
            ) : (
              orders.map(order => {
                const st = statusColor(order.status)
                return (
                  <div key={order.id} className="order-card">
                    <div className="order-card-top">
                      <div className="order-icon">{isPro ? '👤' : '🔧'}</div>
                      <div className="order-info">
                        <p className="order-title">{order.proSpecialty || 'Servicio'}</p>
                        <p className="order-pro">
                          {isPro 
                            ? `👤 ${order.clientName || 'Cliente'}`
                            : `👷 ${order.proName || 'Profesional'}`}
                        </p>
                        <p className="order-date">📅 {order.dateToken || '—'}</p>
                      </div>
                      <div>
                        <span className="order-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                        {order.price && <p className="order-price">💰 RD${order.price}</p>}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* TAB RESEÑAS */}
        {activeTab === 'reviews' && (
          <div className="client-reviews-list">
            {loading ? (
              <div className="tab-loading">⏳ Cargando reseñas...</div>
            ) : reviews.length === 0 ? (
              <div className="tab-empty">
                <span>⭐</span>
                <p>{T.noReviews}</p>
                <small>{T.noReviewsSub}</small>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="review-card-client">
                  <div className="review-card-top">
                    <div className="review-pro-icon">{isPro ? '👤' : '👷'}</div>
                    <div className="review-card-info">
                      <p className="review-pro-name">
                        {isPro 
                          ? (review.reviewerName || review.clientName || 'Cliente')
                          : (review.proName || 'Profesional')}
                      </p>
                      <p className="review-service">{review.proSpecialty || '—'}</p>
                    </div>
                    <div className="review-stars">
                      {[1,2,3,4,5].map(n => (
                        <span key={n} style={{ color: n <= (review.ratingScore || 0) ? '#FFB800' : '#DDD', fontSize:14 }}>★</span>
                      ))}
                    </div>
                  </div>
                  {review.ratingComment && <p className="review-comment-text">{review.ratingComment}</p>}
                  <p className="review-date-text">{review.dateToken || '—'}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      <div style={{ height: 80 }} />
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="info-row">
      <span className="info-row-icon">{icon}</span>
      <span className="info-row-label">{label}</span>
      <span className="info-row-value">{value}</span>
    </div>
  )
}