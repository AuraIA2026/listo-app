// src/components/DeliveryDashboard.jsx
// 🛵 Panel del motorista — aparece cuando el usuario tiene role = 'delivery'
// Muestra toggle ON/OFF, GPS en vivo, solicitudes entrantes y datos del perfil

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useDeliveryOnline } from '../hooks/useDeliveryOnline';

const MAMEY = '#FF6000';

export default function DeliveryDashboard({ userData, navigate }) {
  const [enabled, setEnabled]       = useState(false);
  const [requests, setRequests]     = useState([]);
  const { pos, error, isDelivery }  = useDeliveryOnline(userData, enabled);

  const uid = userData?.uid;

  // Escuchar solicitudes de viaje en tiempo real
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'delivery_requests'),
      where('driverId', '==', uid),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(q, snap => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, [uid]);

  const acceptRequest = async (req) => {
    await updateDoc(doc(db, 'delivery_requests', req.id), {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
    }).catch(console.warn);
    // Ir a la pantalla de tracking si existe
    if (navigate) navigate('tracking', { id: req.orderId, proId: uid });
  };

  const declineRequest = async (req) => {
    await updateDoc(doc(db, 'delivery_requests', req.id), {
      status: 'declined',
    }).catch(console.warn);
  };

  if (!isDelivery) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontSize: 40 }}>🛵</p>
        <p style={{ fontWeight: 700 }}>Esta pantalla es solo para perfiles de Delivery.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#fff', fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <div style={{ background: '#0f172a', padding: '20px 20px 16px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: MAMEY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, overflow: 'hidden', flexShrink: 0 }}>
            {userData?.photoURL ? <img src={userData.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛵'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 17 }}>{userData?.name || 'Delivery'}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{userData?.vehicle || userData?.vehiculo || 'Motor'} • {userData?.plate || userData?.placa || 'Sin placa'}</div>
            <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>⭐ {userData?.rating || '5.0'} • {userData?.trips || 0} viajes</div>
          </div>
        </div>
      </div>

      {/* TOGGLE EN LÍNEA */}
      <div style={{ margin: '20px 16px 0', background: '#0f172a', borderRadius: 20, padding: 20, border: enabled ? `2px solid ${MAMEY}` : '2px solid #1e293b', transition: 'border .3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: enabled ? '#fff' : '#94a3b8' }}>
              {enabled ? '🟢 En línea' : '🔴 Fuera de línea'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              {enabled ? 'Los comercios pueden verte en el mapa' : 'Actívate para recibir viajes'}
            </div>
          </div>
          {/* Toggle */}
          <button
            id="delivery-toggle"
            onClick={() => setEnabled(v => !v)}
            style={{
              width: 64, height: 34, borderRadius: 20, border: 'none', cursor: 'pointer', position: 'relative',
              background: enabled ? MAMEY : '#334155', transition: 'background .3s',
            }}
          >
            <span style={{
              position: 'absolute', top: 4, left: enabled ? 34 : 4,
              width: 26, height: 26, borderRadius: '50%', background: '#fff', transition: 'left .3s',
              boxShadow: '0 2px 6px rgba(0,0,0,.3)',
            }} />
          </button>
        </div>

        {/* GPS STATUS */}
        {enabled && (
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 12, background: pos ? 'rgba(34,197,94,.1)' : 'rgba(251,191,36,.1)', border: `1px solid ${pos ? '#22c55e' : '#fbbf24'}` }}>
            {pos ? (
              <div style={{ fontSize: 12, color: '#86efac', fontWeight: 700 }}>
                📍 GPS activo — Lat: {pos.lat.toFixed(5)}, Lng: {pos.lng.toFixed(5)}
              </div>
            ) : error ? (
              <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 700 }}>⚠️ GPS: {error}</div>
            ) : (
              <div style={{ fontSize: 12, color: '#fde68a', fontWeight: 700 }}>⏳ Obteniendo ubicación GPS...</div>
            )}
          </div>
        )}
      </div>

      {/* SOLICITUDES PENDIENTES */}
      <div style={{ margin: '20px 16px 0' }}>
        <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 10, color: '#fff' }}>
          🔔 Solicitudes de viaje
          {requests.length > 0 && (
            <span style={{ marginLeft: 8, background: MAMEY, color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 12 }}>
              {requests.length}
            </span>
          )}
        </div>

        {requests.length === 0 ? (
          <div style={{ background: '#0f172a', borderRadius: 16, padding: 24, textAlign: 'center', border: '1px dashed #1e293b' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>
              {enabled ? 'Esperando solicitudes...' : 'Actívate para recibir solicitudes'}
            </div>
          </div>
        ) : requests.map(req => (
          <div key={req.id} style={{ background: '#0f172a', border: `2px solid ${MAMEY}`, borderRadius: 18, padding: 16, marginBottom: 12 }}>
            {/* Animación de alerta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28, animation: 'pulse 1s infinite' }}>🛵</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: MAMEY }}>¡Nueva solicitud!</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{req.storeName}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 14 }}>
              Pedido #{req.orderId?.toString().slice(-6) || req.id.slice(-6)}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => declineRequest(req)}
                style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: 'rgba(239,68,68,.15)', color: '#f87171', fontWeight: 900, cursor: 'pointer', fontSize: 14 }}
              >
                ✕ Rechazar
              </button>
              <button
                id="delivery-accept"
                onClick={() => acceptRequest(req)}
                style={{ flex: 2, padding: 12, borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${MAMEY},#ff8533)`, color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: 14, boxShadow: `0 4px 14px rgba(255,96,0,.4)` }}
              >
                ✅ Aceptar viaje
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* STATS */}
      <div style={{ margin: '20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { label: 'Viajes hoy', value: '0', icon: '🚀' },
          { label: 'Ganancias hoy', value: 'RD$ 0', icon: '💰' },
          { label: 'Calificación', value: userData?.rating || '5.0', icon: '⭐' },
          { label: 'Total viajes', value: userData?.trips || 0, icon: '🏁' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#0f172a', borderRadius: 16, padding: '16px 14px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }`}</style>
    </div>
  );
}
