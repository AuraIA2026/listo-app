// src/hooks/useDeliveryOnline.js
// 🛵 Hook que publica la ubicación GPS en tiempo real del delivery en Firestore
// Se activa cuando el usuario tiene role/type === 'delivery'
// Actualiza la colección `drivers_online` cada vez que el GPS cambia

import { useEffect, useRef, useState } from 'react';
import { doc, setDoc, updateDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * @param {object} userData  — datos del usuario desde useUserData()
 * @param {boolean} enabled  — true para activar tracking (el delivery lo controla con un toggle)
 */
export function useDeliveryOnline(userData, enabled = false) {
  const watchRef   = useRef(null);
  const docRef     = useRef(null);
  const [pos, setPos] = useState(null);
  const [error, setError] = useState(null);

  const uid = userData?.uid;
  const isDelivery = (
    userData?.type === 'delivery' ||
    userData?.role === 'delivery' ||
    userData?.category === 'Delivery' ||
    userData?.especialidad === 'Delivery'
  );

  useEffect(() => {
    if (!uid || !isDelivery) return;
    docRef.current = doc(db, 'drivers_online', uid);
  }, [uid, isDelivery]);

  useEffect(() => {
    if (!uid || !isDelivery || !enabled) {
      // Si se desactiva: marcar offline en Firestore
      if (docRef.current && uid) {
        updateDoc(docRef.current, { online: false }).catch(() => {});
      }
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setError('GPS no disponible en este dispositivo');
      return;
    }

    // Publicar presencia inicial inmediatamente
    setDoc(docRef.current, {
      uid,
      name:    userData?.name    || userData?.displayName || 'Delivery',
      phone:   userData?.phone   || userData?.telefono    || '',
      vehicle: userData?.vehicle || userData?.vehiculo    || 'Motor',
      plate:   userData?.plate   || userData?.placa       || '',
      photo:   userData?.photoURL || userData?.foto       || '',
      rating:  String(userData?.rating  || '5.0'),
      trips:   Number(userData?.trips   || 0),
      online:  true,
      lat:     null,
      lng:     null,
      updatedAt: serverTimestamp(),
    }, { merge: true }).catch(console.warn);

    // Empezar a escuchar GPS
    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;
        setPos({ lat, lng });
        setError(null);

        // Actualizar posición en Firestore (merge para no sobreescribir otros campos)
        updateDoc(docRef.current, {
          lat,
          lng,
          accuracy: Math.round(accuracy),
          online:   true,
          updatedAt: serverTimestamp(),
        }).catch(console.warn);
      },
      (err) => {
        console.warn('GPS error:', err.message);
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge:         5000,   // máximo 5s de caché
        timeout:            15000,
      }
    );

    // Limpieza al desmontar o desactivar
    return () => {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
      if (docRef.current) {
        updateDoc(docRef.current, { online: false }).catch(() => {});
      }
    };
  }, [uid, isDelivery, enabled]);

  return { pos, error, isDelivery };
}
