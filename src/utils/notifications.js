// Helper para Notificaciones Push, Sonidos de Alerta & Haptic Feedback en Listo Patrón
const APP_LOGO_ICON = '/logo-mamey.png';

let sharedAudioCtx = null;

/**
 * Obtiene o inicializa el AudioContext compartido (Web Audio API)
 */
const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

/**
 * Desbloquea el AudioContext en el primer gesto del usuario (click / touch)
 */
export const unlockAudioContext = () => {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  } catch (e) {}
};

if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    unlockAudioContext();
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
  };
  window.addEventListener('click', handleFirstInteraction, { passive: true });
  window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
  window.addEventListener('keydown', handleFirstInteraction, { passive: true });
}

/**
 * Reproduce un tono sintetizado (Web Audio API) que NO depende de archivos mp3 externos
 * y funciona 100% offline y sin riesgo de 404 o retrasos de red.
 * Tipos: 'msg' (2 tonos), 'order' (arpegio mayor 3 tonos), 'done' (triunfal 4 tonos), 'alert'
 */
export const playSynthesizedTone = (type = 'msg') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const now = ctx.currentTime;
    let notes = [];

    if (type === 'order') {
      // Arpegio mayor alegre C5 -> E5 -> G5 (Nuevo pedido / contrato)
      notes = [
        { freq: 523.25, time: 0.00, dur: 0.12 },
        { freq: 659.25, time: 0.12, dur: 0.12 },
        { freq: 783.99, time: 0.24, dur: 0.30 }
      ];
    } else if (type === 'done') {
      // Fanfarria de victoria C5 -> E5 -> G5 -> C6 (Trabajo completado)
      notes = [
        { freq: 523.25, time: 0.00, dur: 0.10 },
        { freq: 659.25, time: 0.10, dur: 0.10 },
        { freq: 783.99, time: 0.20, dur: 0.12 },
        { freq: 1046.50, time: 0.32, dur: 0.35 }
      ];
    } else if (type === 'alert') {
      // Doble tono de atención aguda
      notes = [
        { freq: 880.00, time: 0.00, dur: 0.14 },
        { freq: 880.00, time: 0.20, dur: 0.25 }
      ];
    } else {
      // 'msg': Chime agradable de mensaje entrante D5 -> A5
      notes = [
        { freq: 587.33, time: 0.00, dur: 0.11 },
        { freq: 880.00, time: 0.11, dur: 0.28 }
      ];
    }

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Envolvente suave estilo campana
      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.28, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });

    return true;
  } catch (err) {
    console.warn('Error en playSynthesizedTone:', err);
    return false;
  }
};

/**
 * Reproduce el sonido de alerta según la categoría configurada por el usuario
 * Categorías: 'order' | 'msg' | 'system' | 'done' | 'app'
 */
export const playNotificationChime = (category = 'msg') => {
  const keyMap = {
    order: 'listo_sound_order',
    msg: 'listo_sound_msg',
    system: 'listo_sound_system',
    done: 'listo_sound_done',
    app: 'listo_sound_app',
  };

  const storageKey = keyMap[category] || 'listo_sound_notif';
  const pref = typeof window !== 'undefined' ? (localStorage.getItem(storageKey) || localStorage.getItem('listo_sound_notif')) : null;

  // Si el usuario silenció esta categoría específica
  if (pref === 'silencio' || pref === 'none' || pref === 'off') {
    return;
  }

  // 1. Vibración háptica en teléfonos móviles
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (category === 'order') {
        navigator.vibrate([200, 100, 200, 100, 300]);
      } else {
        navigator.vibrate([150, 70, 150]);
      }
    }
  } catch (e) {}

  // 2. Si el usuario seleccionó un tono sintetizado nativo
  if (pref && pref.startsWith('synth_')) {
    playSynthesizedTone(pref.replace('synth_', ''));
    return;
  }

  // 3. Si el usuario eligió un archivo de audio específico en disco
  if (pref && !pref.startsWith('synth_')) {
    try {
      const audio = new Audio(`/audio/${pref}.mp3`);
      audio.volume = category === 'order' ? 0.75 : 0.6;
      audio.play().catch(() => {
        playSynthesizedTone(category === 'order' ? 'order' : (category === 'done' ? 'done' : 'msg'));
      });
      return;
    } catch (e) {}
  }

  // 4. Default inteligente: sintetizador nativo + audio por defecto
  const defaultSynth = category === 'order' ? 'order' : (category === 'done' ? 'done' : 'msg');
  playSynthesizedTone(defaultSynth);

  try {
    const defaultFile = category === 'order' ? 'new_contract_v3' : 'notification_v3';
    const audio = new Audio(`/audio/${defaultFile}.mp3`);
    audio.volume = category === 'order' ? 0.75 : 0.6;
    audio.play().catch(() => {});
  } catch (e) {}
};

/**
 * Consulta el estado actual de los permisos de notificación
 */
export const getNotificationPermission = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

/**
 * Solicita permisos de notificación al usuario
 */
export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones de escritorio.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Confirmación auditiva al activar
        playNotificationChime('msg');
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Error solicitando permisos de notificación:', e);
      return false;
    }
  }

  return false;
};

/**
 * Envía una notificación emergente push al navegador / PWA
 */
export const sendBrowserNotification = async (title, options = {}) => {
  // Alerta auditiva y háptica
  playNotificationChime(options.soundType || (options.type === 'order' ? 'order' : 'msg'));

  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
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
    // En móviles Android (Chrome / PWA), new Notification() requiere Service Worker
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.showNotification) {
          await reg.showNotification(title, notifOptions);
        }
      }
    } catch (swErr) {
      console.log('Error enviando notificación vía SW:', swErr);
    }
  }
};
