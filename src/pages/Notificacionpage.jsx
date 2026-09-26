import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './notificacionpage.css';

const SAMPLE_FLASH_OFFERS = [
  {
    id: 'off-1',
    title: '🔥 15% OFF en Instalación de Sheetrock / Shirrok',
    proName: 'Carlos Méndez',
    proSpecialty: 'Sheetrock / Shirrok',
    proAvatar: 'CM',
    location: 'Santo Domingo',
    originalPrice: 'RD$ 1,000/m²',
    offerPrice: 'RD$ 850/m²',
    sticker: '🔥 Oferta 15% OFF',
    expiresText: 'Expira en 4h 30m',
    proId: 'pro-sheetrock-1'
  },
  {
    id: 'off-2',
    title: '⚡ Mantenimiento Preventivo A/C Inverter',
    proName: 'Alexis Rivas',
    proSpecialty: 'Refrigeración',
    proAvatar: 'AR',
    location: 'Santiago',
    originalPrice: 'RD$ 1,500',
    offerPrice: 'RD$ 1,100',
    sticker: '⚡ Disponible Hoy',
    expiresText: 'Expira en 6h 15m',
    proId: 'pro-refri-2'
  },
  {
    id: 'off-3',
    title: '🎁 20% Descuento en Revisión de Cortocircuitos',
    proName: 'Roberto Gómez',
    proSpecialty: 'Electricidad',
    proAvatar: 'RG',
    location: 'Bávaro / Punta Cana',
    originalPrice: 'RD$ 2,000',
    offerPrice: 'RD$ 1,600',
    sticker: '🎁 Descuento Especial',
    expiresText: 'Expira hoy a las 11:59 PM',
    proId: 'pro-elec-3'
  },
  {
    id: 'off-4',
    title: '⭐ Destape de Inodoro o Fregadero con Garantía 24h',
    proName: 'José Almonte',
    proSpecialty: 'Plomería',
    proAvatar: 'JA',
    location: 'Santo Domingo Este',
    originalPrice: 'RD$ 1,800',
    offerPrice: 'RD$ 1,350',
    sticker: '⭐ Trabajo Garantizado',
    expiresText: 'Expira en 8h 00m',
    proId: 'pro-plom-4'
  }
];

export default function NotificacionPage({ lang = 'es', navigate, userData }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('promos'); // 'promos' | 'notifs'
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [realStoriesOffers, setRealStoriesOffers] = useState([]);

  // Escuchar notificaciones del usuario
  useEffect(() => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    const targetIds = userData.email === 'listopatron.app@gmail.com' ? [userData.uid, 'admin'] : [userData.uid];
    const q = query(
      collection(db, 'notificaciones'),
      where('userId', 'in', targetIds)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.type !== 'message') {
          items.push({ id: docSnap.id, ...data });
        }
      });
      items.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.date ? new Date(a.date) : new Date(0));
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.date ? new Date(b.date) : new Date(0));
        return dateB - dateA;
      });
      setNotifications(items);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notificaciones:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  // Escuchar historias de profesionales con sticker de oferta activa
  useEffect(() => {
    const qStories = query(collection(db, 'historias'));
    const unsub = onSnapshot(qStories, (snap) => {
      const list = [];
      const now = Date.now();
      snap.forEach(docSnap => {
        const d = docSnap.data();
        const isApproved = d.status === 'approved' || d.moderated === true;
        let expiresTime = 0;
        if (d.expiresAt) {
          expiresTime = new Date(d.expiresAt).getTime();
        } else if (d.createdAt) {
          expiresTime = new Date(d.createdAt).getTime() + (24 * 60 * 60 * 1000);
        }

        if (isApproved && expiresTime > now && d.offerSticker) {
          list.push({
            id: docSnap.id,
            title: d.caption || 'Oferta especial de trabajo',
            proName: d.proName || 'Profesional Verificado',
            proSpecialty: d.proCategory || 'Servicio Especializado',
            proAvatar: d.proAvatar || (d.proName ? d.proName.substring(0, 2).toUpperCase() : 'PRO'),
            location: d.city || d.location || 'República Dominicana',
            sticker: d.offerSticker,
            expiresText: 'Expira hoy',
            proId: d.proId || d.proUid || docSnap.id,
            imageUrl: d.imageUrl || d.videoUrl
          });
        }
      });
      setRealStoriesOffers(list);
    }, (err) => console.log('Error fetching story offers:', err));

    return () => unsub();
  }, []);

  const handleMarkAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, 'notificaciones', notifId), { read: true });
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (notifId) => {
    try {
      await deleteDoc(doc(db, 'notificaciones', notifId));
    } catch(e) { console.error(e); }
  };

  const handleMarkAllRead = async () => {
    const unreads = notifications.filter(n => !n.read);
    unreads.forEach(async (notif) => {
      try {
        await updateDoc(doc(db, 'notificaciones', notif.id), { read: true });
      } catch(e) {}
    });
  };

  const filteredNotifs = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatDate = (item) => {
    if (!item) return '';
    let date = null;
    if (item.createdAt?.toDate) {
      date = item.createdAt.toDate();
    } else if (item.date) {
      date = new Date(item.date);
    }
    if (!date || isNaN(date.getTime())) return lang === 'es' ? 'Reciente' : 'Recent';
    return date.toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
  };

  const getNotifIcon = (notif) => {
    if (notif.icon) return notif.icon;
    switch (notif.type) {
      case 'promo': case 'offer': return '🏷️';
      case 'system': case 'app_notif': return '📢';
      case 'reward': return '🎰';
      case 'order_status': case 'new_order': case 'job_done': return '📦';
      default: return '🔔';
    }
  };

  const allOffers = [...realStoriesOffers, ...SAMPLE_FLASH_OFFERS];

  if (loading) {
    return (
      <div className="notifications-page loading">
        <div className="spinner"></div>
        <p>{lang === 'es' ? 'Cargando centro de promociones...' : 'Loading promotions...'}</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', color: '#1A1A2E', fontSize: '24px', cursor: 'pointer' }}>←</button>
            <h1>{lang === 'es' ? 'Centro de Promociones' : 'Deals & Notifications'}</h1>
          </div>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        
        {/* Selector de Pestañas: Ofertas vs Notificaciones */}
        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '14px', padding: '4px', marginTop: '12px' }}>
          <button
            onClick={() => setActiveTab('promos')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'promos' ? 'linear-gradient(135deg, #F26000, #EF4444)' : 'transparent',
              color: activeTab === 'promos' ? '#FFF' : '#64748B',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            🏷️ {lang === 'es' ? 'Ofertas del Día (Flash)' : 'Flash Deals'}
          </button>
          <button
            onClick={() => setActiveTab('notifs')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'notifs' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'notifs' ? '#1A1A2E' : '#64748B',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: activeTab === 'notifs' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            🔔 {lang === 'es' ? 'Avisos' : 'Notifs'} {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {/* ── TAB 1: CENTRO DE OFERTAS Y PROMOCIONES DEL DÍA ── */}
      {activeTab === 'promos' && (
        <div className="notifications-list" style={{ gap: '16px' }}>
          <div style={{ background: '#FFF3EC', border: '1px solid #FFD4B0', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🔥</span>
            <div>
              <p style={{ margin: 0, fontWeight: '800', fontSize: '14px', color: '#C24D00' }}>
                {lang === 'es' ? 'Ofertas Flash de Profesionales Verificados' : 'Verified Professionals Flash Deals'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#9A3412', lineHeight: 1.4 }}>
                {lang === 'es' ? 'Descuentos de 24 horas válidos para contrataciones agendadas hoy.' : '24-hour discounts valid for bookings scheduled today.'}
              </p>
            </div>
          </div>

          {allOffers.map((deal) => (
            <div 
              key={deal.id} 
              className="notification-card"
              style={{
                borderRadius: '20px',
                borderLeft: '5px solid #F26000',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ background: 'linear-gradient(135deg, #EF4444, #F26000)', color: '#FFF', fontSize: '11px', fontWeight: '900', padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.3px', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}>
                  {deal.sticker || '🔥 Oferta Flash'}
                </span>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#D97706', background: '#FEF3C7', padding: '3px 8px', borderRadius: '10px' }}>
                  ⏳ {deal.expiresText}
                </span>
              </div>

              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: '#1A1A2E' }}>
                  {deal.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ fontWeight: '700', color: '#1E293B' }}>👤 {deal.proName}</span>
                  <span>•</span>
                  <span>🛠️ {deal.proSpecialty}</span>
                  <span>•</span>
                  <span>📍 {deal.location}</span>
                </div>
              </div>

              {deal.offerPrice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: '12px', fontWeight: '600' }}>
                    {deal.originalPrice}
                  </span>
                  <span style={{ color: '#10B981', fontSize: '16px', fontWeight: '900' }}>
                    {deal.offerPrice}
                  </span>
                  <span style={{ fontSize: '11px', color: '#059669', background: '#ECFDF5', padding: '2px 6px', borderRadius: '6px', fontWeight: '800', marginLeft: 'auto' }}>
                    ✅ {lang === 'es' ? 'Descuento Aplicado' : 'Discount Applied'}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => navigate('booking', { id: deal.proId, name: deal.proName, category: deal.proSpecialty, location: deal.location, price: deal.offerPrice })}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #F26000, #C24D00)',
                    color: '#FFF',
                    fontWeight: 'bold',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(242,96,0,0.3)'
                  }}
                >
                  📅 {lang === 'es' ? 'Contratar con esta Oferta' : 'Book with Deal'}
                </button>
                <button
                  onClick={() => navigate('proProfile', { id: deal.proId, name: deal.proName, category: deal.proSpecialty, location: deal.location })}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    background: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  👤 {lang === 'es' ? 'Perfil' : 'Profile'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 2: AVISOS Y NOTIFICACIONES TRADICIONALES ── */}
      {activeTab === 'notifs' && (
        <>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {lang === 'es' ? 'Todas' : 'All'}
            </button>
            <button 
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              {lang === 'es' ? 'No leídas' : 'Unread'}
            </button>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={handleMarkAllRead} style={{ width: 'auto', padding: '6px 14px', fontSize: '12px' }}>
                ✓ {lang === 'es' ? 'Leídas' : 'Read all'}
              </button>
            )}
          </div>

          <div className="notifications-list">
            {filteredNotifs.length > 0 ? (
              filteredNotifs.map((notif) => (
                <div key={notif.id} className={`notification-card ${!notif.read ? 'unread' : ''}`}>
                  <div className="notification-content">
                    <div className="notification-header">
                      <span className="notification-icon">
                         {getNotifIcon(notif)}
                      </span>
                      <div className="notification-text-wrapper">
                        {notif.title && <p className="notification-title" style={{ margin: '0 0 4px 0', fontWeight: '800', fontSize: '15px', color: '#1a1a2e' }}>{notif.title}</p>}
                        <p className="notification-text">{notif.text}</p>
                        <span className="notification-time">{formatDate(notif)}</span>
                      </div>
                    </div>
                    {!notif.read && <div className="unread-indicator"></div>}
                  </div>
                  
                  <div className="notification-actions">
                    {!notif.read && (
                      <button className="action-btn read-btn" onClick={() => handleMarkAsRead(notif.id)} title={lang==='es'?'Marcar leída':'Mark read'}>
                        ✓
                      </button>
                    )}
                    <button className="action-btn delete-btn" onClick={() => handleDelete(notif.id)} title={lang==='es'?'Eliminar':'Delete'}>
                      ✕
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📭</span>
                <p>{filter === 'unread' 
                  ? (lang === 'es' ? 'No tienes mensajes o avisos nuevos.' : 'No new messages or notifications.')
                  : (lang === 'es' ? 'Tu bandeja de avisos está vacía.' : 'Your inbox is empty.')}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}