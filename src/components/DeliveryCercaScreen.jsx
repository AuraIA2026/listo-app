import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// 🛵 Pantalla "Delivery Cerca" (estilo Uber) para el comercio
// - Muestra en un mapa los deliverys en línea alrededor del local (colección `drivers_online`)
// - Permite solicitar un delivery cercano para un pedido
// - Permite activar "Delivery Propio" y registrar los motoristas de la casa

const MAMEY = '#ff6b00';
const FALLBACK_POS = [19.4517, -70.6970]; // Santiago, RD
const RADIUS_KM = 3;

const distKm = (a, b) => {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const storeIcon = L.divIcon({
  className: 'dc-store-icon',
  html: `<div style="position:relative;width:54px;height:54px;display:flex;align-items:center;justify-content:center">
    <div style="position:absolute;inset:0;border-radius:50%;background:rgba(255,107,0,.25);animation:dcPulse 1.8s infinite"></div>
    <div style="width:38px;height:38px;border-radius:50%;background:#0f172a;border:3px solid ${MAMEY};display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 4px 14px rgba(0,0,0,.4)">🏪</div>
  </div>`,
  iconSize: [54, 54], iconAnchor: [27, 27]
});

const driverIcon = (selected, own) => L.divIcon({
  className: 'dc-driver-icon',
  html: `<div style="width:${selected ? 46 : 38}px;height:${selected ? 46 : 38}px;border-radius:50%;background:${own ? '#0ea5e9' : MAMEY};border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:${selected ? 22 : 18}px;box-shadow:0 4px 12px rgba(0,0,0,.35);transition:all .2s">🛵</div>`,
  iconSize: [selected ? 46 : 38, selected ? 46 : 38], iconAnchor: [selected ? 23 : 19, selected ? 23 : 19]
});

function FlyTo({ pos }) {
  const map = useMap();
  useEffect(() => { if (pos) map.flyTo(pos, 15, { duration: 0.8 }); }, [pos?.[0], pos?.[1]]);
  return null;
}

// Deliverys de demostración (solo si todavía no hay ninguno conectado en la red)
const makeDemoDrivers = (center) => {
  const names = ['Kelvin Santos', 'Rafael Gómez', 'Yeison Pérez', 'Luis Almonte', 'Carlos Tavárez', 'Junior Reyes'];
  return names.map((name, i) => {
    const ang = (i / names.length) * Math.PI * 2 + 0.4;
    const r = 0.003 + (i % 3) * 0.004;
    return {
      id: 'demo-' + i, name, demo: true,
      lat: center[0] + Math.sin(ang) * r, lng: center[1] + Math.cos(ang) * r,
      vehicle: i % 2 ? 'Moto Honda CG' : 'Moto Yamaha', plate: 'K' + (482100 + i * 37),
      rating: (4.6 + (i % 4) * 0.1).toFixed(1), trips: 120 + i * 53
    };
  });
};

export default function DeliveryCercaScreen({ open, onClose, userData, storeName, orders = [], onOwnDeliveryChange, showToast }) {
  const [storePos, setStorePos] = useState(null);
  const [liveDrivers, setLiveDrivers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('red'); // 'red' | 'propio'
  const [ownEnabled, setOwnEnabled] = useState(false);
  const [ownDrivers, setOwnDrivers] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [orderForRequest, setOrderForRequest] = useState('');
  const [requesting, setRequesting] = useState(false);
  const uid = userData?.uid;

  // Ubicación del local (GPS del dispositivo del comercio)
  useEffect(() => {
    if (!open) return;
    if (userData?.storeCoords?.lat) { setStorePos([userData.storeCoords.lat, userData.storeCoords.lng]); return; }
    if (!navigator.geolocation) { setStorePos(FALLBACK_POS); return; }
    navigator.geolocation.getCurrentPosition(
      p => setStorePos([p.coords.latitude, p.coords.longitude]),
      () => setStorePos(FALLBACK_POS),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [open]);

  // Deliverys en línea en tiempo real
  useEffect(() => {
    if (!open) return;
    const q = query(collection(db, 'drivers_online'), where('online', '==', true));
    const unsub = onSnapshot(q, snap => {
      setLiveDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => typeof d.lat === 'number' && typeof d.lng === 'number'));
    }, err => console.warn('drivers_online:', err));
    return () => unsub();
  }, [open]);

  // Configuración de delivery propio
  useEffect(() => {
    if (!open || !uid) return;
    getDoc(doc(db, 'users', uid)).then(s => {
      const od = s.data()?.ownDelivery || {};
      setOwnEnabled(!!od.enabled);
      setOwnDrivers(Array.isArray(od.drivers) ? od.drivers : []);
    }).catch(() => {});
  }, [open, uid]);

  const saveOwn = async (enabled, drivers) => {
    setOwnEnabled(enabled); setOwnDrivers(drivers);
    onOwnDeliveryChange && onOwnDeliveryChange(enabled);
    if (!uid) return;
    try { await setDoc(doc(db, 'users', uid), { ownDelivery: { enabled, drivers } }, { merge: true }); }
    catch (e) { console.warn('ownDelivery save:', e); }
  };

  const center = storePos || FALLBACK_POS;
  const isDemo = liveDrivers.length === 0;
  const drivers = useMemo(() => {
    const list = isDemo ? makeDemoDrivers(center) : liveDrivers;
    return list
      .map(d => ({ ...d, km: distKm(center, [d.lat, d.lng]) }))
      .filter(d => d.km <= RADIUS_KM)
      .sort((a, b) => a.km - b.km);
  }, [liveDrivers, center[0], center[1], isDemo]);

  const pendingOrders = orders.filter(o => ['new', 'cooking', 'ready'].includes(o.status) && o.fulfillmentType !== 'pickup');
  const atDoor = drivers.filter(d => d.km <= 0.15).length;

  const requestDriver = async (driver) => {
    if (!orderForRequest) { showToast?.('Elige primero el pedido que llevará el delivery'); return; }
    setRequesting(true);
    try {
      await addDoc(collection(db, 'delivery_requests'), {
        driverId: driver.id, driverName: driver.name, storeId: uid || null, storeName,
        orderId: orderForRequest, storeCoords: { lat: center[0], lng: center[1] },
        status: 'pending', demo: !!driver.demo, createdAt: serverTimestamp()
      });
      if (!driver.demo) {
        await addDoc(collection(db, 'notificaciones'), {
          userId: driver.id, type: 'delivery_request', icon: '🛵', read: false,
          title: '🛵 ¡Nuevo viaje disponible!',
          text: `${storeName} te solicita para llevar un pedido. Estás a ${(driver.km * 1000).toFixed(0)} m.`,
          createdAt: serverTimestamp()
        });
      }
      showToast?.(`🛵 Solicitud enviada a ${driver.name}`);
      setSelected(null);
    } catch (e) { console.warn(e); showToast?.('No se pudo enviar la solicitud'); }
    setRequesting(false);
  };

  if (!open) return null;

  const pill = (active) => ({
    flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', fontWeight: 900, fontSize: 13, cursor: 'pointer',
    background: active ? MAMEY : 'rgba(255,255,255,0.06)', color: active ? '#fff' : '#94a3b8', transition: 'all .2s'
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: '#0a0e1a', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>
      <style>{`@keyframes dcPulse{0%{transform:scale(.6);opacity:1}100%{transform:scale(1.6);opacity:0}} .dc-store-icon,.dc-driver-icon{background:none!important;border:none!important}`}</style>

      {/* MAPA */}
      <div style={{ position: 'relative', flex: tab === 'red' ? '1 1 55%' : '0 0 34%', minHeight: 220, transition: 'flex .3s' }}>
        <MapContainer center={center} zoom={15} zoomControl={false} style={{ width: '100%', height: '100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap &copy; CARTO" />
          <FlyTo pos={selected ? [selected.lat, selected.lng] : storePos} />
          <Circle center={center} radius={RADIUS_KM * 1000} pathOptions={{ color: MAMEY, weight: 1.5, fillColor: MAMEY, fillOpacity: 0.05, dashArray: '6 6' }} />
          <Circle center={center} radius={150} pathOptions={{ color: '#22c55e', weight: 1, fillColor: '#22c55e', fillOpacity: 0.12 }} />
          <Marker position={center} icon={storeIcon} />
          {tab === 'red' && drivers.map(d => (
            <Marker key={d.id} position={[d.lat, d.lng]} icon={driverIcon(selected?.id === d.id)} eventHandlers={{ click: () => setSelected(d) }} />
          ))}
        </MapContainer>

        {/* Header flotante */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1000, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button id="dc-close" onClick={onClose} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: '#0f172a', color: '#fff', fontSize: 20, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,.35)' }}>←</button>
          <div style={{ flex: 1, background: 'rgba(15,23,42,.92)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '8px 14px', color: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,.35)' }}>
            <div style={{ fontWeight: 900, fontSize: 15 }}>🛵 Delivery Cerca</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{storeName} • radio {RADIUS_KM} km</div>
          </div>
        </div>

        {tab === 'red' && (
          <div style={{ position: 'absolute', bottom: 14, left: 12, zIndex: 1000, display: 'flex', gap: 8 }}>
            <span style={{ background: '#0f172a', color: '#fff', padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 900, boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}>🟠 {drivers.length} cerca</span>
            <span style={{ background: '#16a34a', color: '#fff', padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 900, boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}>🟢 {atDoor} frente al local</span>
          </div>
        )}
      </div>

      {/* PANEL INFERIOR */}
      <div style={{ flex: '1 1 45%', background: '#0f172a', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -18, zIndex: 1001, padding: '10px 16px 24px', overflowY: 'auto', boxShadow: '0 -8px 30px rgba(0,0,0,.4)' }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: '#334155', margin: '0 auto 12px' }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button id="dc-tab-red" style={pill(tab === 'red')} onClick={() => setTab('red')}>🛵 Red Listo</button>
          <button id="dc-tab-propio" style={pill(tab === 'propio')} onClick={() => { setTab('propio'); setSelected(null); }}>🏪 Delivery Propio</button>
        </div>

        {tab === 'red' && (
          <>
            {ownEnabled && (
              <div style={{ background: 'rgba(14,165,233,.12)', border: '1px solid #0ea5e9', color: '#7dd3fc', borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                ℹ️ Tienes activado Delivery Propio. Igual puedes pedir un delivery de la red cuando lo necesites.
              </div>
            )}
            {isDemo && (
              <div style={{ background: 'rgba(255,183,3,.1)', border: '1px dashed #ffb703', color: '#ffb703', borderRadius: 12, padding: 10, fontSize: 11.5, fontWeight: 700, marginBottom: 12 }}>
                Vista de demostración: todavía no hay deliverys conectados en tu zona.
              </div>
            )}

            <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 800 }}>Pedido a enviar</label>
            <select id="dc-order-select" value={orderForRequest} onChange={e => setOrderForRequest(e.target.value)}
              style={{ width: '100%', margin: '6px 0 14px', padding: 12, borderRadius: 12, background: '#1e293b', color: '#fff', border: '1px solid #334155', fontWeight: 700 }}>
              <option value="">— Elegir pedido —</option>
              {pendingOrders.map(o => <option key={o.id} value={o.id}>#{o.orderId || o.id} • {o.customerName || 'Cliente'} • RD$ {o.total || 0}</option>)}
            </select>

            {selected && (
              <div style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)', border: `2px solid ${MAMEY}`, borderRadius: 18, padding: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: MAMEY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, overflow: 'hidden' }}>
                    {selected.photo ? <img src={selected.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛵'}
                  </div>
                  <div style={{ flex: 1, color: '#fff' }}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>{selected.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{selected.vehicle || 'Motor'} {selected.plate ? `• ${selected.plate}` : ''}</div>
                    <div style={{ fontSize: 12, color: '#ffb703', fontWeight: 800 }}>⭐ {selected.rating || '5.0'} {selected.trips ? `• ${selected.trips} viajes` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right', color: '#fff' }}>
                    <div style={{ fontWeight: 900, fontSize: 18, color: MAMEY }}>{selected.km < 1 ? `${Math.round(selected.km * 1000)} m` : `${selected.km.toFixed(1)} km`}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>~{Math.max(1, Math.round(selected.km / 0.4))} min</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button id="dc-request" disabled={requesting} onClick={() => requestDriver(selected)}
                    style={{ flex: 1, padding: 13, borderRadius: 14, border: 'none', background: `linear-gradient(135deg,${MAMEY},#ff8533)`, color: '#fff', fontWeight: 900, fontSize: 14, cursor: 'pointer', opacity: requesting ? .6 : 1 }}>
                    {requesting ? 'Enviando…' : '🛵 Solicitar este delivery'}
                  </button>
                  {selected.phone && <a href={`tel:${selected.phone}`} style={{ padding: '13px 16px', borderRadius: 14, background: '#1e293b', color: '#fff', textDecoration: 'none', fontWeight: 900 }}>📞</a>}
                </div>
              </div>
            )}

            <div style={{ fontSize: 13, color: '#fff', fontWeight: 900, marginBottom: 8 }}>Deliverys disponibles</div>
            {drivers.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13, padding: 20, textAlign: 'center' }}>No hay deliverys en {RADIUS_KM} km ahora mismo.</div>}
            {drivers.map(d => (
              <button key={d.id} onClick={() => setSelected(d)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginBottom: 8, borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  background: selected?.id === d.id ? 'rgba(255,107,0,.12)' : '#1e293b', border: selected?.id === d.id ? `1.5px solid ${MAMEY}` : '1.5px solid transparent' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: MAMEY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>🛵</div>
                <div style={{ flex: 1, color: '#fff' }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{d.name}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>⭐ {d.rating || '5.0'} • {d.vehicle || 'Motor'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, color: d.km <= 0.15 ? '#22c55e' : MAMEY, fontSize: 14 }}>{d.km < 1 ? `${Math.round(d.km * 1000)} m` : `${d.km.toFixed(1)} km`}</div>
                  {d.km <= 0.15 && <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 900 }}>FRENTE AL LOCAL</div>}
                </div>
              </button>
            ))}
          </>
        )}

        {tab === 'propio' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b', borderRadius: 16, padding: 14, marginBottom: 14 }}>
              <div style={{ color: '#fff' }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>🏪 Usar mi delivery propio</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Tus pedidos saldrán con tus motoristas de la casa</div>
              </div>
              <button id="dc-own-toggle" onClick={() => saveOwn(!ownEnabled, ownDrivers)}
                style={{ width: 58, height: 32, borderRadius: 20, border: 'none', cursor: 'pointer', position: 'relative', background: ownEnabled ? '#22c55e' : '#475569', transition: 'all .2s' }}>
                <span style={{ position: 'absolute', top: 3, left: ownEnabled ? 29 : 3, width: 26, height: 26, borderRadius: '50%', background: '#fff', transition: 'all .2s' }} />
              </button>
            </div>

            <div style={{ fontSize: 13, color: '#fff', fontWeight: 900, marginBottom: 8 }}>Mis motoristas</div>
            {ownDrivers.length === 0 && <div style={{ color: '#94a3b8', fontSize: 12.5, marginBottom: 10 }}>Todavía no has agregado motoristas.</div>}
            {ownDrivers.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginBottom: 8, borderRadius: 14, background: '#1e293b' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>🛵</div>
                <div style={{ flex: 1, color: '#fff' }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{d.name}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{d.phone}</div>
                </div>
                {d.phone && <a href={`https://wa.me/${String(d.phone).replace(/\D/g, '').replace(/^(\d{10})$/, '1$1')}`} target="_blank" rel="noreferrer" style={{ padding: '8px 10px', borderRadius: 10, background: '#16a34a', color: '#fff', textDecoration: 'none', fontWeight: 900, fontSize: 12 }}>WhatsApp</a>}
                <button onClick={() => saveOwn(ownEnabled, ownDrivers.filter((_, j) => j !== i))} style={{ padding: '8px 10px', borderRadius: 10, border: 'none', background: 'rgba(239,68,68,.15)', color: '#f87171', fontWeight: 900, cursor: 'pointer' }}>✕</button>
              </div>
            ))}

            <div style={{ background: '#1e293b', borderRadius: 16, padding: 14, marginTop: 6 }}>
              <div style={{ color: '#fff', fontWeight: 900, fontSize: 13, marginBottom: 8 }}>➕ Agregar motorista</div>
              <input id="dc-own-name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre"
                style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 12, border: '1px solid #334155', background: '#0f172a', color: '#fff', marginBottom: 8 }} />
              <input id="dc-own-phone" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Teléfono (809...)" inputMode="tel"
                style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 12, border: '1px solid #334155', background: '#0f172a', color: '#fff', marginBottom: 10 }} />
              <button id="dc-own-add" onClick={() => {
                if (!newName.trim()) return;
                saveOwn(ownEnabled, [...ownDrivers, { name: newName.trim(), phone: newPhone.trim() }]);
                setNewName(''); setNewPhone('');
              }} style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${MAMEY},#ff8533)`, color: '#fff', fontWeight: 900, cursor: 'pointer' }}>
                Guardar motorista
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
