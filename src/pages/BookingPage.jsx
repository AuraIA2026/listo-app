import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp, getDoc, doc, increment, updateDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore'
import { auth, db } from '../firebase'
import './BookingPage.css'

import { bookingTxt }                         from './bookingTexts'
import { avatarColors, timeSlots }            from './bookingData'
import { getDays }                            from './bookingUtils'

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3203/3203071.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
})

function MapSelector({ onLocationSelect }) {
  useMapEvents({ click(e) { onLocationSelect(e.latlng) } })
  return null
}

function MapCenterUpdater({ center }) {
  const map = useMap()
  useEffect(() => { if (center) map.setView(center, map.getZoom()) }, [center, map])
  return null
}

export default function BookingPage({ lang = 'es', navigate, professional, userData }) {
  const T    = bookingTxt[lang]
  const days = getDays(lang)

  const pro = professional || {
    id:       'unknown',
    name:     'Carlos Méndez',
    category: 'mechanic',
    avatar:   'CM',
    rating:   4.9,
    location: 'Santo Domingo',
  }

  const [step,          setStep]          = useState(1)
  const [selectedDay,   setSelectedDay]   = useState(null)
  const [selectedTime,  setSelectedTime]  = useState(null)
  const [address,       setAddress]       = useState('')
  const [addressCoords, setAddressCoords] = useState(null)
  const [isEmergency,   setIsEmergency]   = useState(false)
  const [showMap,       setShowMap]       = useState(false)
  const [mapCenter,     setMapCenter]     = useState(null)
  const [mapLoading,    setMapLoading]    = useState(false)
  
  // Real-time slots
  const [realBusySlots, setRealBusySlots] = useState([])

  // Radar Booking state
  const [confirmedOrder, setConfirmedOrder] = useState(null)

  useEffect(() => {
    if (showMap && !addressCoords && navigator.geolocation) {
      setMapLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setAddressCoords({ lat: latitude, lng: longitude })
          setMapCenter([latitude, longitude])
          setMapLoading(false)
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            const data = await res.json()
            if (data?.display_name) setAddress(data.display_name)
          } catch (err) { console.error('Error reverse geocoding', err) }
        },
        () => { setMapCenter([18.7357, -70.1627]); setMapLoading(false) },
        { enableHighAccuracy: true }
      )
    } else if (showMap && !mapCenter) {
      setMapCenter([18.7357, -70.1627])
    }
  }, [showMap]) // eslint-disable-line

  const handleMapSelect = async (latlng) => {
    setAddressCoords(latlng)
    setMapCenter([latlng.lat, latlng.lng])
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
      const data = await res.json()
      if (data?.display_name) setAddress(data.display_name)
    } catch (err) { console.error('Error manual map reverse geocoding', err) }
  }

  // ── Listener para Bloqueo de Horarios Dinámicos ──
  useEffect(() => {
    if (selectedDay === null || pro.id === 'unknown' || pro.id === 'desconocido') {
      setRealBusySlots([])
      return
    }
    const currentDayToken = `${days[selectedDay]?.dayName} ${days[selectedDay]?.dayNum}`
    const q = query(collection(db, 'orders'), where('proId', '==', pro.id))
    
    // Obtenemos los turnos en vivo.
    const unsubscribe = onSnapshot(q, (snap) => {
      const busyTimes = []
      snap.forEach(docSnap => {
        const d = docSnap.data()
        // Solo bloqueamos turnos del mismo día que estén pedientes o aceptados/en curso
        if (d.dateToken === currentDayToken && ['pending', 'accepted', 'onway', 'working'].includes(d.status)) {
          if (d.timeToken && d.timeToken !== 'Lo antes posible (ASAP)' && d.timeToken !== 'ASAP') {
            busyTimes.push(d.timeToken)
          }
        }
      })
      setRealBusySlots(busyTimes)
      // Si el turno que eligió mágicamente se ocupa antes de avanzar, lo quitamos
      if (busyTimes.includes(selectedTime)) setSelectedTime(null)
    })
    return () => unsubscribe()
  }, [selectedDay, pro.id]) // eslint-disable-line

  const [notes,     setNotes]     = useState('')
  const [urgency,   setUrgency]   = useState(0)
  const [loading,   setLoading]   = useState(false)
  const [errorMsg,  setErrorMsg]  = useState('')

  const canNext1 = (selectedDay !== null && selectedTime !== null) || isEmergency
  const canNext2 = address.trim().length > 0 || addressCoords !== null

  const handleConfirmOrder = async () => {
    if (!auth.currentUser) { setErrorMsg('Debes iniciar sesión para hacer una reserva.'); return }
    setLoading(true); setErrorMsg('')
    try {
      let proSnap = null;
      if (pro.id !== 'unknown' && pro.id !== 'desconocido') {
        const proRef = doc(db, 'users', pro.id)
        proSnap = await getDoc(proRef)
        if (proSnap.exists()) {
          const proData = proSnap.data()
          const currentContracts = proData.contracts || 0
          if (currentContracts <= 0) {
            setErrorMsg(lang === 'es' ? 'Este profesional ya no tiene turnos disponibles.' : 'This professional has no available slots.')
            setLoading(false)
            return
          }
        }
      }

      const orderData = {
        clientId:       auth.currentUser.uid,
        clientEmail:    auth.currentUser.email,
        clientName:     userData?.name || auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        clientPhotoURL: userData?.photoURL || auth.currentUser.photoURL || null,
        clientPhone:    userData?.phone || '',
        proId:          pro.id || 'desconocido',
        proName:        pro.name || pro.nameEs || '',
        proSpecialty:   pro.category || pro.specEs || '',
        proAvatar:      pro.avatar || '',
        proPhotoURL:    pro.photoURL || pro.img || null,
        proPhone:       pro.phone || '',
        dateToken:      isEmergency ? (lang==='es'?'Hoy mismo':'Today') : `${days[selectedDay]?.dayName} ${days[selectedDay]?.dayNum}`,
        timeToken:      isEmergency ? (lang==='es'?'Lo antes posible (ASAP)':'ASAP') : selectedTime,
        clientAddress:  address,
        address:        address,
        coords:         addressCoords ? { lat: addressCoords.lat, lng: addressCoords.lng } : null,
        serviceDesc:    notes,
        notes:          notes,
        urgencyToken:   urgency,
        price:          pro.price || '',
        status:         'pending',
        rated:          false,
        createdAt:      serverTimestamp(),
      }

      const newOrderInfo = await addDoc(collection(db, 'orders'), orderData)

      await addDoc(collection(db, 'notificaciones'), {
        userId:  pro.id || 'desconocido',
        orderId: newOrderInfo.id,
        type:    'new_order',
        title:   lang === 'es' ? '¡Nuevo Pedido!' : 'New Request!',
        text:    lang === 'es'
          ? `${orderData.clientName} ha solicitado tus servicios para el ${orderData.dateToken} a las ${orderData.timeToken}.`
          : `${orderData.clientName} requested your service for ${orderData.dateToken} at ${orderData.timeToken}.`,
        read:      false,
        icon:      '🚨',
        createdAt: serverTimestamp(),
      })

      if (proSnap && proSnap.exists()) {
        const currentContracts = proSnap.data().contracts || 0
        const proRef = doc(db, 'users', pro.id)
        await updateDoc(proRef, {
          contracts: increment(-1),
          contractsUsed: increment(1)
        })
      }

      // ── Activar Radar en Tiempo Real ──
      setConfirmedOrder({ ...orderData, id: newOrderInfo.id })
    } catch (error) {
      console.error('Error creando orden: ', error)
      setErrorMsg('Error al guardar la orden. Intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ── Listener del Radar ──
  useEffect(() => {
    if (!confirmedOrder) return
    const unsub = onSnapshot(doc(db, 'orders', confirmedOrder.id), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data()
        if (d.status === 'accepted' || d.status === 'onway') {
          // El profesional aceptó de su lado, cerramos radar y saltamos a tracking.
          setTimeout(() => {
            if (navigate) navigate('tracking', { ...confirmedOrder, status: d.status })
          }, 800)
        } else if (d.status === 'cancelled') {
          setErrorMsg(lang === 'es' ? 'El profesional declinó el pedido por el momento.' : 'Professional declined the order.')
          setConfirmedOrder(null)
        }
      }
    })
    return () => unsub()
  }, [confirmedOrder, navigate, lang])

  // ── Pantalla de Radar de Búsqueda ─────────────────────────────────────────
  if (confirmedOrder) {
    return (
      <div className="booking-page radar-mode">
        <div className="radar-container fade-up">
          <h2 className="radar-title">{lang === 'es' ? 'Localizando profesional...' : 'Locating professional...'}</h2>
          <p className="radar-sub">{lang === 'es' ? 'Esperando confirmación en tiempo real' : 'Waiting real-time confirmation'}</p>
          
          <div className="radar-animation-box">
            <div className="radar-ring r1"></div>
            <div className="radar-ring r2"></div>
            <div className="radar-ring r3"></div>
            <div className="radar-center-avatar" style={{ background: avatarColors[0] }}>
              {pro.avatar}
            </div>
            
            <div className="floating-info-card">
              <span className="live-pill">● LIVE</span>
              <h4>{pro.name}</h4>
              <p>{isEmergency ? (lang==='es'?'🚨 Prioridad alta':'🚨 High priority') : `${confirmedOrder.timeToken}`}</p>
            </div>
          </div>
          
          <div className="eta-box glass-eta">
            <span className="eta-label">⏳ {lang === 'es' ? 'VERIFICANDO DISPONIBILIDAD...' : 'VERIFYING AVAILABILITY...'}</span>
            <p className="eta-subtext">{lang === 'es' ? 'En cuanto acepte, irás directo al mapa.' : 'Once accepted, you will jump directly to the map.'}</p>
          </div>

          <button className="btn-cancel-radar" onClick={() => {
            updateDoc(doc(db, 'orders', confirmedOrder.id), { status: 'cancelled' }).catch(()=>{})
            setConfirmedOrder(null)
            setStep(1)
          }}>
            ✕ {lang === 'es' ? 'Cancelar búsqueda' : 'Cancel search'}
          </button>
        </div>
      </div>
    )
  }

  // ── Layout principal ──────────────────────────────────────────────────────
  return (
    <div className="booking-page">
      <div className="booking-container fade-up">

        <div className="booking-header">
          <button className="back-btn" onClick={() => navigate && navigate('services')}>←</button>
          <div className="booking-pro-pill">
            <div className="bp-avatar" style={{ background: avatarColors[0] }}>{pro.avatar}</div>
            <span className="bp-name">{pro.name}</span>
          </div>
        </div>

        <div className="steps-bar">
          {T.steps.map((s, i) => (
            <div key={i} className={`step-item ${step > i+1 ? 'done' : ''} ${step === i+1 ? 'active' : ''}`}>
              <div className="step-circle">{step > i+1 ? '✓' : i+1}</div>
              <span className="step-label">{s}</span>
              {i < T.steps.length-1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {/* ── Paso 1: Fecha y hora ── */}
        {step === 1 && (
          <div className="step-content fade-up">
            <h2 className="step-title">{T.step1}</h2>

            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <button className="emergency-clean-btn pulse-glow" onClick={() => {
                setIsEmergency(true)
                setSelectedDay(null)
                setSelectedTime(null)
                setUrgency(2)
                setStep(2) // Salto directo sin forzar día
              }}>
                <span className="emergency-hint">
                  {lang==='es'?'¿Lo necesitas ahora mismo? 👇':'Do you need it right now? 👇'}
                </span>
                <span className="emergency-text">
                  {lang==='es'?'SOLICITAR AHORA':'REQUEST NOW'}
                </span>
              </button>
            </div>
            
            <div className="or-divider">{lang==='es'?'O agenda un horario':'Or schedule a time'}</div>

            <div className="date-scroll">
              {days.map((d, i) => (
                <button key={i} className={`day-card ${selectedDay===i && !isEmergency ? 'selected':''} ${d.isToday?'today':''}`} onClick={() => { setSelectedDay(i); setIsEmergency(false) }}>
                  <span className="day-name">{d.dayName}</span>
                  <span className="day-num">{d.dayNum}</span>
                  <span className="day-month">{d.month}</span>
                  {d.isToday && <span className="today-dot" />}
                </button>
              ))}
            </div>
            {selectedDay !== null && !isEmergency && (
              <div className="time-grid fade-up">
                <p className="time-label">{T.selectTime} <span className="live-status">● En vivo</span></p>
                <div className="time-slots">
                  {timeSlots.map(t => {
                    const isBusy = realBusySlots.includes(t)
                    return (
                      <button key={t} className={`time-slot ${selectedTime===t && !isEmergency ? 'selected':''} ${isBusy?'busy':''}`} onClick={() => { if(!isBusy) { setSelectedTime(t); setIsEmergency(false) } }}>
                        {t}
                        {isBusy && <span className="busy-tag">{lang==='es'?'Ocupado':'Busy'}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="step-nav">
              <button className="btn-next" disabled={!canNext1} onClick={() => setStep(2)}>{T.next} →</button>
            </div>
          </div>
        )}

        {/* ── Paso 2: Detalles ── */}
        {step === 2 && (
          <div className="step-content fade-up">
            <h2 className="step-title">{T.step2}</h2>
            <div className="detail-field">
              <label>📍 {T.address}</label>
              <div style={{ display:'flex', gap:'8px', marginBottom:'10px' }}>
                <input type="text" placeholder={T.addressPlaceholder} value={address} onChange={e => setAddress(e.target.value)} style={{ flex:1 }} />
                <button className="btn-map-toggle" onClick={() => setShowMap(!showMap)} title="Marcar ubicación en el mapa">🗺️ Mapa</button>
              </div>
              {showMap && (
                <div className="map-picker-container fade-up">
                  {mapLoading ? (
                    <div style={{ padding:'40px 0', textAlign:'center', color:'#F26000', fontWeight:'bold' }}>📍 Buscando ubicación por GPS...</div>
                  ) : mapCenter ? (
                    <>
                      <p className="map-picker-hint">📌 Tu ubicación exacta.</p>
                      <MapContainer center={mapCenter} zoom={16} style={{ height:'220px', width:'100%', borderRadius:'16px', zIndex:0, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                        <MapCenterUpdater center={mapCenter} />
                        <MapSelector onLocationSelect={handleMapSelect} />
                        {addressCoords && <Marker position={addressCoords} icon={customIcon} />}
                      </MapContainer>
                      {addressCoords && <p className="map-picker-selected" style={{ color: '#059669', background: '#ECFDF5', padding: '8px', borderRadius: '8px', marginTop: '10px' }}>✅ GPS Fijado</p>}
                    </>
                  ) : null}
                </div>
              )}
            </div>
            <div className="detail-field">
              <label>⚡ {T.urgency}</label>
              <div className="urgency-group">
                {T.urgencyOpts.map((opt, i) => (
                  <button key={i} className={`urgency-btn ${urgency===i?'selected':''}`} onClick={() => setUrgency(i)}>
                    {[['🕐','⚡','🚨'][i]]} {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="detail-field">
              <label>📝 {T.notes}</label>
              <textarea placeholder={T.notesPlaceholder} value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </div>
            <div className="step-nav">
              <button className="btn-back" onClick={() => setStep(1)}>{T.back}</button>
              <button className="btn-next" disabled={!canNext2} onClick={() => setStep(3)}>{T.next} →</button>
            </div>
          </div>
        )}

        {/* ── Paso 3: Confirmar ── */}
        {step === 3 && (
          <div className="step-content fade-up">
            <h2 className="step-title">{T.step3}</h2>
            <div className="summary-card glass-summary">
              <h3 className="summary-title">{T.summary}</h3>
              <div className="summary-row"><span className="summary-label">{T.professional}</span><span className="summary-value">{pro.name}</span></div>
              <div className="summary-row"><span className="summary-label">{T.date}</span><span className="summary-value" style={isEmergency?{color:'#EF4444', fontWeight:800}:{}}>{isEmergency ? (lang==='es'?'🚨 Hoy mismo':'🚨 Today') : `${days[selectedDay]?.dayName} ${days[selectedDay]?.dayNum}`}</span></div>
              <div className="summary-row"><span className="summary-label">{T.time}</span><span className="summary-value" style={isEmergency?{color:'#EF4444', fontWeight:800}:{}}>{isEmergency ? (lang==='es'?'🔥 Lo antes posible':'🔥 ASAP') : selectedTime}</span></div>
              <div className="summary-row"><span className="summary-label">📍</span><span className="summary-value">{address}</span></div>
              {notes && <div className="summary-row"><span className="summary-label">📝</span><span className="summary-value notes-val">{notes}</span></div>}
              <div className="summary-divider" />
              <div className="summary-price-row">
                <span className="summary-price-label">Precio del Servicio</span>
                <span className="summary-price" style={{ fontSize:'15px', color:'#10B981' }}>A acordar</span>
              </div>
              <p className="price-note" style={{ fontSize:'12px', color:'#64748B', marginTop:'8px' }}>
                💡 En Listo Patrón no cobramos tarifas fijas. Discute el precio directo con el profesional.
              </p>
            </div>

            {/* ── TRUST BADGES E-COMMERCE ── */}
            <div className="booking-trust-badges fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="trust-badge">
                <span className="trust-icon" style={{ background: '#FFF3EC', color: '#F26000' }}>🔒</span>
                <div>
                  <h4>{lang === 'es' ? 'Reserva Segura' : 'Secure Booking'}</h4>
                  <p>{lang === 'es' ? 'Paga al terminar.' : 'Pay when done.'}</p>
                </div>
              </div>
              <div className="trust-badge">
                <span className="trust-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>🛡️</span>
                <div>
                  <h4>{lang === 'es' ? 'Garantía Listo Patrón' : 'Listo Patrón Guarantee'}</h4>
                  <p>{lang === 'es' ? 'Cobertura antiproblemas.' : 'Covered against issues.'}</p>
                </div>
              </div>
            </div>

            <div className="step-nav">
              {errorMsg && <div style={{ width: '100%', padding: '12px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', borderRadius: '12px', marginBottom: '16px', textAlign: 'center', fontWeight: 'bold' }}>{errorMsg}</div>}
              <button className="btn-back" disabled={loading} onClick={() => setStep(2)}>{T.back}</button>
              <button className="btn-confirm radar-btn" disabled={loading} onClick={handleConfirmOrder}>
                {loading ? 'Conectando...' : `✓ ${lang==='es'?'Confirmar e Iniciar Radar':'Confirm & Start Radar'}`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}