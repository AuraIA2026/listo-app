// Helper para Notificaciones Push & Navegador de Pedidos Listo

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

export const sendBrowserNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const notifOptions = {
      body: options.body || 'Nueva actualización en Pedidos Listo',
      icon: options.icon || '/icons/icon-192.png',
      badge: options.badge || '/icons/icon-192.png',
      tag: options.tag || 'listo-notification',
      renotify: true,
      data: { url: options.url || '/' },
      ...options
    };

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
    console.log('Error enviando notificacion:', err);
  }
};
