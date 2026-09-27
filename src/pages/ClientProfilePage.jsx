import { useState, useEffect } from 'react'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './ClientProfilePage.css'
import MantenimientoPreventivoModal from '../components/MantenimientoPreventivoModal'
import StoryAvatar from '../components/StoryAvatar'
import HistoriasViewerModal from '../components/HistoriasViewerModal'
import { useStories } from '../hooks/useStories'

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
  const [showMantenimientoModal, setShowMantenimientoModal] = useState(false)
  const [showStoryViewer, setShowStoryViewer] = useState(false)

  const { getProStoryData } = useStories()
  const clientStoryData = getProStoryData(userData)

  // ── DIRECCIONES GUARDADAS (CASA, OFICINA, CASA DE MAMÁ) ──
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem('listo_saved_addresses')
      if (stored) return JSON.parse(stored)
    } catch(e) {}
    return [
      { label: 'Casa', icon: '🏠', address: 'Santiago, D.N. (República Dominicana)' },
      { label: 'Oficina', icon: '🏢', address: 'Av. 27 de Febrero, Santo Domingo' },
      { label: 'Casa de Mamá', icon: '👵', address: 'La Vega Centro, República Dominicana' }
    ]
  })

  const handleAddSavedAddress = () => {
    const label = prompt(lang === 'es' ? 'Nombre para guardar esta dirección (Ej. Casa, Trabajo, Playa):' : 'Label (e.g. Home, Work):', 'Mi Ubicación')
    if (!label || !label.trim()) return
    const addr = prompt(lang === 'es' ? 'Dirección completa:' : 'Full address:')
    if (!addr || !addr.trim()) return
    
    const newLoc = { label: label.trim(), icon: '📍', address: addr.trim() }
    const updated = [...savedAddresses, newLoc]
    setSavedAddresses(updated)
    try { localStorage.setItem('listo_saved_addresses', JSON.stringify(updated)) } catch(e) {}
  }

  const handleDeleteSavedAddress = (idxToDelete) => {
    const updated = savedAddresses.filter((_, idx) => idx !== idxToDelete)
    setSavedAddresses(updated)
    try { localStorage.setItem('listo_saved_addresses', JSON.stringify(updated)) } catch(e) {}
  }

  // Extraer profesionales únicos previamente contratados para Re-contratación Rápida
  const completedOrders = orders.filter(o => ['done', 'completed', 'finalizado', 'accepted'].includes(o.status))
  const uniquePros = []
  const seenProIds = new Set()
  completedOrders.forEach(o => {
    const pId = o.proId
    if (pId && pId !== 'desconocido' && !seenProIds.has(pId)) {
      seenProIds.add(pId)
      uniquePros.push({
        id: pId,
        name: o.proName || 'Profesional',
        spec: o.proSpecialty || 'Especialista',
        photo: o.proPhotoURL || o.photoURL,
        avatar: o.proAvatar || (o.proName || 'P').charAt(0).toUpperCase()
      })
    }
  })

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
        <div className="client-avatar-wrap" onClick={clientStoryData?.stories?.length > 0 ? () => setShowStoryViewer(true) : undefined} style={{ cursor: clientStoryData?.stories?.length > 0 ? 'pointer' : 'default' }}>
          <StoryAvatar
            pro={userData}
            src={photoURL}
            alt={displayName}
            size={96}
            storyData={clientStoryData}
            onOpenStory={() => setShowStoryViewer(true)}
            fallbackAvatar={initials}
          />
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

      {/* BOTON EDITAR & BOTON AGENDA MANTENIMIENTO */}
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="client-edit-btn" onClick={() => onEditProfile ? onEditProfile() : navigate('profile')}>
          ✏️ {T.editProfile}
        </button>

        <button 
          onClick={() => setShowMantenimientoModal(true)} 
          style={{ 
            width: '100%', 
            padding: '12px 16px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', 
            border: '1.5px solid #FDBA74', 
            color: '#C2410C', 
            fontWeight: 900, 
            fontSize: '14px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            boxShadow: '0 4px 12px rgba(242, 96, 0, 0.12)' 
          }}
        >
          📅 {lang === 'es' ? 'Mi Agenda de Mantenimiento Preventivo' : 'My Maintenance Schedule'}
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
            {/* 1. DATOS PERSONALES */}
            <div className="info-card">
              <div className="info-card-title">👤 Datos personales</div>
              <InfoRow icon="✉️" label={T.email}  value={displayEmail || '—'} />
              <InfoRow icon="📞" label={T.phone}  value={displayPhone || '—'} />
              <InfoRow icon="📅" label={T.joined} value={memberSince} />
            </div>

            {/* 2. DIRECCIONES GUARDADAS (CASA, OFICINA, CASA DE MAMÁ) */}
            <div className="info-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div className="info-card-title" style={{ margin: 0 }}>🏠 Mis Direcciones Guardadas</div>
                <button
                  type="button"
                  onClick={handleAddSavedAddress}
                  style={{
                    background: '#F26000',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>➕</span>
                  <span>Agregar</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedAddresses.map((loc, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '20px' }}>{loc.icon || '📍'}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#1E293B' }}>{loc.label}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {loc.address}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedAddress(idx)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px 8px', fontSize: '14px' }}
                      title="Eliminar dirección"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. RE-CONTRATACIÓN RÁPIDA 1-CLIC */}
            <div className="info-card" style={{ padding: '16px' }}>
              <div className="info-card-title" style={{ marginBottom: '12px' }}>🔄 Re-contratación Rápida 1-Clic</div>
              {uniquePros.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {uniquePros.map((pro) => (
                    <div
                      key={pro.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #FFF7F2 0%, #FFFFFF 100%)',
                        border: '1.5px solid rgba(242, 96, 0, 0.2)',
                        boxShadow: '0 2px 8px rgba(242, 96, 0, 0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        {pro.photo ? (
                          <img src={pro.photo} alt={pro.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F26000' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F26000', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {pro.avatar}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: '#1A1A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {pro.name}
                          </p>
                          <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            ⚡ {pro.spec}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const proToBook = {
                            id: pro.id,
                            name: pro.name,
                            nameEs: pro.name,
                            category: pro.spec,
                            specEs: pro.spec,
                            photoURL: pro.photo,
                            img: pro.photo,
                            avatar: pro.avatar
                          }
                          navigate('booking', { professional: proToBook })
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #F26000 0%, #FF7A1A 100%)',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '7px 12px',
                          fontSize: '11.5px',
                          fontWeight: '900',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(242, 96, 0, 0.3)',
                          flexShrink: 0
                        }}
                      >
                        ⚡ Contratar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 10px', color: '#94A3B8', fontSize: '12px' }}>
                  <span>🔄</span>
                  <p style={{ margin: '4px 0 0' }}>{lang === 'es' ? 'Cuando contrates a un profesional aparecerá aquí para re-contratarlo en 1-clic.' : 'Your hired pros will appear here for 1-click rebooking.'}</p>
                </div>
              )}
            </div>

            {/* 4. ESTADÍSTICAS */}
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

      {showMantenimientoModal && (
        <MantenimientoPreventivoModal
          lang={lang}
          onClose={() => setShowMantenimientoModal(false)}
          navigate={navigate}
          userProfile={userData}
        />
      )}

      {showStoryViewer && clientStoryData?.stories?.length > 0 && (
        <HistoriasViewerModal
          isOpen={showStoryViewer}
          onClose={() => setShowStoryViewer(false)}
          stories={clientStoryData.stories}
          initialIndex={clientStoryData.firstIndex || 0}
          userData={userData}
          navigate={navigate}
        />
      )}

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