// ═══════════════════════════════════════════════════════════════
//  usePushNotifications.js
//  Hook que:
//   1. Pide permiso de notificaciones al usuario (1 sola vez)
//   2. Obtiene el FCM token del dispositivo
//   3. Lo guarda en Firestore → users/{uid}.fcmToken
//   4. Lo actualiza si cambia (token refresh)
//   5. Escucha mensajes en primer plano y los muestra como toast
// ═══════════════════════════════════════════════════════════════
import { useEffect, useRef } from 'react'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

// ────────────────────────────────────────────────────────────────
//  VAPID KEY PÚBLICA (Web Push Certificate)
//  Cómo obtenerla:
//    1. Ve a https://console.firebase.google.com
//    2. Abre el proyecto listoapp-52b46
//    3. Configuración del proyecto (⚙️) → Cloud Messaging
//    4. Sección "Certificados push web" → "Generar par de claves"
//    5. Copia la "Clave pública" y pégala aquí:
// ────────────────────────────────────────────────────────────────
const VAPID_KEY = 'PEGA_AQUI_TU_VAPID_KEY_PUBLICA'

async function saveTokenToFirestore(token) {
  const uid = auth.currentUser?.uid
  if (!uid || !token) return
  try {
    await updateDoc(doc(db, 'users', uid), { fcmToken: token, fcmUpdatedAt: new Date().toISOString() })
    console.log('[FCM] Token guardado en Firestore ✅')
  } catch (e) {
    console.warn('[FCM] No se pudo guardar el token:', e)
  }
}

export function usePushNotifications({ onForegroundMessage } = {}) {
  const messagingRef = useRef(null)
  const unsubRef     = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      // Solo en web (no en Capacitor nativo) y si el navegador lo soporta
      if (typeof window === 'undefined') return
      const supported = await isSupported().catch(() => false)
      if (!supported) {
        console.log('[FCM] Firebase Messaging no soportado en este navegador.')
        return
      }

      // Esperar a que el usuario esté autenticado
      const uid = auth.currentUser?.uid
      if (!uid) return

      // Pedir permiso si no se ha dado
      const permission = await Notification.requestPermission().catch(() => 'denied')
      if (permission !== 'granted') {
        console.log('[FCM] Permiso de notificaciones denegado.')
        return
      }

      try {
        const messaging = getMessaging()
        if (cancelled) return
        messagingRef.current = messaging

        // Registrar el service worker de FCM
        const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })

        // Obtener el token
        const token = await getToken(messaging, {
          vapidKey:            VAPID_KEY,
          serviceWorkerRegistration: swReg,
        })

        if (!cancelled && token) {
          console.log('[FCM] Token obtenido:', token.slice(0, 20) + '...')
          await saveTokenToFirestore(token)
        }

        // Escuchar mensajes en primer plano (app abierta)
        unsubRef.current = onMessage(messaging, (payload) => {
          console.log('[FCM] Mensaje en foreground:', payload)
          if (onForegroundMessage) onForegroundMessage(payload)
        })

      } catch (err) {
        if (!cancelled) console.warn('[FCM] Error inicializando push:', err)
      }
    }

    init()

    return () => {
      cancelled = true
      if (unsubRef.current) unsubRef.current()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser?.uid])
}
