// ═══════════════════════════════════════════════════════════════
//  firebase-messaging-sw.js  —  Pedidos Listo FCM Service Worker
//  DEBE estar en /public/ para que el navegador lo encuentre en /
// ═══════════════════════════════════════════════════════════════
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyB4z90F946H6BP6hyq8gAv--RLirXdBtYE",
  authDomain:        "listoapp-52b46.firebaseapp.com",
  projectId:         "listoapp-52b46",
  storageBucket:     "listoapp-52b46.firebasestorage.app",
  messagingSenderId: "43690567000",
  appId:             "1:43690567000:web:d7486d9eb1f4aaedf6b12d",
});

const messaging = firebase.messaging();

// ── Notificaciones en segundo plano (app cerrada / tab en background) ──
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Mensaje en background recibido:', payload);

  const { title, body } = payload.notification || {};
  const data = payload.data || {};

  const notifTitle = title || data.title || '🔔 Pedidos Listo';
  const appLogoUrl = '/logo-mamey.png';
  const notifOptions = {
    body:    body || data.body || 'Tienes una nueva notificación en Pedidos Listo.',
    icon:    data.icon || data.senderPhoto || appLogoUrl,
    badge:   appLogoUrl,
    image:   data.image || undefined,
    vibrate: [200, 100, 200, 100, 300],
    tag:     data.type ? `${data.type}-${data.orderId || data.chatId || ''}` : 'listo-notif',
    renotify: true,
    requireInteraction: data.type === 'new_order',
    data: {
      url:     data.url     || '/',
      type:    data.type    || '',
      orderId: data.orderId || '',
      chatId:  data.chatId  || '',
    },
    actions: [
      { action: 'open',    title: '📲 Ver ahora' },
      { action: 'dismiss', title: 'Cerrar'       },
    ],
  };

  self.registration.showNotification(notifTitle, notifOptions);
});

// ── Clic en la notificación ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data    = event.notification.data || {};
  const action  = event.action;
  if (action === 'dismiss') return;

  // Construir la URL de destino según el tipo
  let targetUrl = '/';
  if (data.type === 'new_order' || data.type === 'job_done')  targetUrl = '/?page=orders';
  if (data.type === 'new_review')                              targetUrl = '/?page=profile';
  if (data.type === 'chat_message' && data.chatId)             targetUrl = `/?page=orders`;
  if (data.type === 'payment_received')                        targetUrl = '/?page=orders';
  if (data.url && data.url !== '/')                            targetUrl = data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si la app ya está abierta, enfocarla y navegar
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(targetUrl);
          return;
        }
      }
      // Si no hay ventana abierta, abrirla
      if (clients.openWindow) clients.openWindow(targetUrl);
    })
  );
});
