import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './notificacionpage.css';

export default function NotificacionPage({ lang, navigate, userData }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

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
        // Incluir todas las notificaciones de la app (ofertas, anuncios del sistema, avisos) excepto chats directos
        if (data.type !== 'message') {
          items.push({ id: docSnap.id, ...data });
        }
      });
      // Sort newer first (handles Firestore Timestamp, ISO string or date field)
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

  const handleMarkAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, 'notificaciones', notifId), { read: true });
    } catch(e) {
      console.error(e);
    }
  };

  const handleDelete = async (notifId) => {
    try {
      await deleteDoc(doc(db, 'notificaciones', notifId));
    } catch(e) {
      console.error(e);
    }
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

  if (loading) {
    return (
      <div className="notifications-page loading">
        <div className="spinner"></div>
        <p>{lang === 'es' ? 'Cargando bandeja...' : 'Loading inbox...'}</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="header-top">
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
             <button onClick={() => navigate('home')} style={{background:'none', border:'none', color:'#333', fontSize:'24px', cursor:'pointer'}}>←</button>
             <h1>{lang === 'es' ? 'Notificaciones' : 'Notifications'}</h1>
          </div>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={handleMarkAllRead}>
            {lang === 'es' ? 'Marcar todas como leídas' : 'Mark all as read'}
          </button>
        )}
      </div>

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
            <span style={{fontSize:'48px', display:'block', marginBottom:'16px'}}>📭</span>
            <p>{filter === 'unread' 
              ? (lang === 'es' ? 'No tienes mensajes o avisos nuevos.' : 'No new messages or notifications.')
              : (lang === 'es' ? 'Tu bandeja está vacía.' : 'Your inbox is empty.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}