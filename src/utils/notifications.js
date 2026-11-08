// Helper para Notificaciones Push & Navegador de Pedidos Listo (Estilo WhatsApp con Logo Oficial)
const APP_LOGO_ICON = '/logo-mamey.png';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones de escritorio.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendBrowserNotification = async (title, options = {}) => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(options.vibrate || [200, 100, 200]);
    }
  } catch (e) { }

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notifOptions = {
    body: options.body || 'Nueva actualización en Listo Patrón',
    icon: options.icon || APP_LOGO_ICON,
    badge: options.badge || APP_LOGO_ICON,
    image: options.image || undefined,
    vibrate: options.vibrate || [200, 100, 200],
    tag: options.tag || `listo-notif-${Date.now()}`,
    renotify: true,
    requireInteraction: options.requireInteraction ?? false,
    data: { url: options.url || '/', ...(options.data || {}) },
    ...options
  };

  try {
    const notif = new Notification(title, notifOptions);

    notif.onclick = (e) => {
      e.preventDefault();
      window.focus();
      if (options.url && window.location.pathname !== options.url) {
        window.location.href = options.url;
      }
      notif.close();
    };
  } catch (err) {
    // En móviles Android (Chrome / PWA), new Notification() requiere usar el Service Worker
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.showNotification) {
          await reg.showNotification(title, notifOptions);
        }
      }
    } catch (swErr) {
      console.log('Error enviando notificacion via SW:', swErr);
    }
  }
};
