import { useState, useEffect } from 'react';
import { getNotificationPermission, requestNotificationPermission, playNotificationChime } from '../utils/notifications';

export default function NotificationPermissionBanner({ lang = 'es' }) {
  const [visible, setVisible] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    // Solo mostrar si el navegador soporta notificaciones y el usuario aún no ha decidido
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const dismissed = localStorage.getItem('listo_notif_prompt_dismissed');
      if (Notification.permission === 'default' && !dismissed) {
        // Breve retardo para no interferir con la carga inicial
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleActivate = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setActivated(true);
      playNotificationChime('msg');
      setTimeout(() => setVisible(false), 2200);
    } else {
      setVisible(false);
    }
    localStorage.setItem('listo_notif_prompt_dismissed', 'true');
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('listo_notif_prompt_dismissed', 'true');
  };

  if (!visible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '480px',
        zIndex: 99999,
        background: activated 
          ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' 
          : 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)',
        border: activated ? '2px solid #10B981' : '2px solid #F26000',
        borderRadius: '18px',
        padding: '12px 14px',
        boxShadow: '0 12px 36px rgba(242, 96, 0, 0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        animation: 'pwaBannerSlideUp 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: activated ? '#10B981' : '#F26000',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          flexShrink: 0,
          boxShadow: '0 3px 8px rgba(0,0,0,0.15)'
        }}>
          {activated ? '✅' : '🔔'}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: activated ? '#065F46' : '#1A1A2E' }}>
            {activated 
              ? (lang === 'es' ? '¡Notificaciones activadas!' : 'Notifications active!') 
              : (lang === 'es' ? '¡Activa tus notificaciones!' : 'Turn on notifications!')}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: activated ? '#047857' : '#64748B', lineHeight: 1.3 }}>
            {activated 
              ? (lang === 'es' ? 'Te avisaremos con sonido cuando tengas mensajes o pedidos.' : 'We will alert you with sound on messages and orders.')
              : (lang === 'es' ? 'Recibe avisos sonoros al instante de tus pedidos y mensajes.' : 'Get instant sound alerts for your orders and messages.')}
          </p>
        </div>
      </div>

      {!activated ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={handleActivate}
            style={{
              background: 'linear-gradient(135deg, #F26000 0%, #EA580C 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 12px',
              fontWeight: 900,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(242, 96, 0, 0.35)',
              whiteSpace: 'nowrap'
            }}
          >
            {lang === 'es' ? 'Activar' : 'Allow'}
          </button>
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '6px'
            }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}
