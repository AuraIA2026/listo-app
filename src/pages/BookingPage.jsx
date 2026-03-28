import { collection, addDoc, serverTimestamp, getDoc, doc, increment, updateDoc } from 'firebase/firestore'
import './BookingPage.css'

import { bookingTxt }                         from './bookingTexts'
import { avatarColors, timeSlots, busySlots } from './bookingData'
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

  const [notes,     setNotes]     = useState('')
  const [urgency,   setUrgency]   = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [errorMsg,  setErrorMsg]  = useState('')

  const canNext1 = (selectedDay !== null && selectedTime !== null) || isEmergency
  const canNext2 = address.trim().length > 0 || addressCoords !== null

  const handleConfirmOrder = async () => {
    if (!auth.currentUser) { setErrorMsg('Debes iniciar sesión para hacer una reserva.'); return }
    setLoading(true); setErrorMsg('')
    try {
      // Validar contratos del profesional
      let proSnap = null;
      if (pro.id !== 'unknown' && pro.id !== 'desconocido') {
        const proRef = doc(db, 'users', pro.id)
        proSnap = await getDoc(proRef)
        if (proSnap.exists()) {
          const proData = proSnap.data()
          const currentContracts = proData.contracts || 0
          if (currentContracts <= 0) {
            setErrorMsg(lang === 'es' ? 'Este profesional ya no tiene turnos disponibles actualmente.' : 'This professional has no available slots.')
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
        clientPhone:    userData?.phone || '',          // ← teléfono del cliente
        proId:          pro.id || 'desconocido',
        proName:        pro.name || pro.nameEs || '',
        proSpecialty:   pro.category || pro.specEs || '',
        proAvatar:      pro.avatar || '',
        proPhotoURL:    pro.photoURL || pro.img || null,
        proPhone:       pro.phone || '',                // ← teléfono del profesional
        dateToken:  isEmergency ? (lang==='es'?'Hoy mismo':'Today') : `${days[selectedDay]?.dayName} ${days[selectedDay]?.dayNum}`,
        timeToken:  isEmergency ? (lang==='es'?'Lo antes posible (ASAP)':'ASAP') : selectedTime,
        clientAddress:  address,
        address:        address,
        coords:     addressCoords ? { lat: addressCoords.lat, lng: addressCoords.lng } : null,
        serviceDesc:notes,
        notes:      notes,
        urgencyToken: urgency,
        price:        pro.price || '',
        status:       'pending',
        rated:        false,
        createdAt:    serverTimestamp(),
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
        icon:      '💼',
        createdAt: serverTimestamp(),
      })

      if (proSnap && proSnap.exists()) {
        const currentContracts = proSnap.data().contracts || 0
        const proRef = doc(db, 'users', pro.id)
        await updateDoc(proRef, {
          contracts: increment(-1),
          contractsUsed: increment(1)
        })
        if (currentContracts - 1 === 1) {
          await addDoc(collection(db, 'notificaciones'), {
            userId: pro.id,
            type: 'low_contracts',
            title: '⚠️ Contratos Bajos',
            text: '¡Solo te queda 1 contrato disponible! Renueva tu plan para seguir recibiendo pedidos.',
            read: false,
            icon: '📄',
            createdAt: serverTimestamp()
          })
        }
      }

      setConfirmed(true)
    } catch (error) {
      console.error('Error creando orden: ', error)
      setErrorMsg('Error al guardar la orden. Intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ── Pantalla de éxito ─────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="booking-page">
        <div className="booking-success fade-up">
          <div className="success-icon">✓</div>
          <h2 className="success-title">{lang === 'es' ? '¡Reserva enviada!' : 'Request sent!'}</h2>
          <p className="success-sub">{lang === 'es' ? 'Tu solicitud fue enviada al profesional' : 'Your request was sent to the professional'}</p>

          <div className="success-card">
            <div className="success-pro">
              <div className="success-avatar" style={{ background: avatarColors[0] }}>{pro.avatar}</div>
              <div>
                <div className="success-name">{pro.name}</div>
                <div className="success-date">
                  {isEmergency ? (lang==='es'?'🚨 Lo antes posible':'🚨 ASAP') : `${days[selectedDay]?.dayName} ${days[selectedDay]?.dayNum} · ${selectedTime}`}
                </div>
              </div>
            </div>
            <div className="eta-box" style={{ background: '#FFF3EC', borderColor: '#FFD580', textAlign: 'center', padding: '16px' }}>
              <span className="eta-label" style={{ color: '#F26000', fontSize: '13px', letterSpacing: '0.5px' }}>
                {lang === 'es' ? '⏳ ESPERANDO RESPUESTA DEL PROFESIONAL...' : '⏳ WAITING FOR PROFESSIONAL...'}
              </span>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#666' }}>
                {lang === 'es' ? 'Te enviaremos una notificación cuando acepte el pedido.' : 'We will notify you when the order is accepted.'}
              </p>
            </div>
          </div>

          <div className="success-actions">
            <button className="btn-track" style={{ background: '#1A1A2E' }} onClick={() => navigate('orders')}>
              📋 {lang === 'es' ? 'Ver mis pedidos' : 'View my orders'}
            </button>
            <button className="btn-new" onClick={() => {
              setConfirmed(false); setStep(1); setSelectedDay(null)
              setSelectedTime(null); setAddress(''); setNotes(''); setUrgency(0)
            }}>{T.newBooking}</button>
          </div>
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
              <button className="emergency-clean-btn" onClick={() => {
                setIsEmergency(true)
                setUrgency(2)
                setStep(2)
              }}>
                <span style={{ display: 'block', fontSize: '15px', fontWeight: '600', opacity: 0.9, marginBottom: '6px' }}>
                  {lang==='es'?'Si es una Emergencia pulsa aquí 👇':'If it is an Emergency click here 👇'}
                </span>
                <span style={{ display: 'block', fontSize: '24px' }}>
                  {lang==='es'?'EMERGENCIA':'EMERGENCY'}
                </span>
              </button>
            </div>
            
            <div className="or-divider">{lang==='es'?'O selecciona tu horario':'Or schedule a time'}</div>

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
            {selectedDay !== null && (
              <div className="time-grid fade-up">
                <p className="time-label">{T.selectTime}</p>
                <div className="time-slots">
                  {timeSlots.map(t => {
                    const isBusy = busySlots.includes(t)
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
                    <div style={{ padding:'40px 0', textAlign:'center', color:'#F26000', fontWeight:'bold' }}>📍 Extrayendo tu ubicación actual...</div>
                  ) : mapCenter ? (
                    <>
                      <p className="map-picker-hint">📌 Puntero en tu ubicación. Toca el mapa para moverlo si es incorrecta.</p>
                      <MapContainer center={mapCenter} zoom={15} style={{ height:'200px', width:'100%', borderRadius:'12px', zIndex:0 }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                        <MapCenterUpdater center={mapCenter} />
                        <MapSelector onLocationSelect={handleMapSelect} />
                        {addressCoords && <Marker position={addressCoords} icon={customIcon} />}
                      </MapContainer>
                      {addressCoords && <p className="map-picker-selected">✅ Ubicación registrada ({addressCoords.lat.toFixed(4)}, {addressCoords.lng.toFixed(4)})</p>}
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
            <div className="summary-card">
              <h3 className="summary-title">{T.summary}</h3>
              <div className="summary-row"><span className="summary-label">{T.professional}</span><span className="summary-value">{pro.name}</span></div>
              <div className="summary-row"><span className="summary-label">{T.date}</span><span className="summary-value">{isEmergency ? (lang==='es'?'Hoy mismo':'Today') : `${days[selectedDay]?.dayName} ${days[selectedDay]?.dayNum}`}</span></div>
              <div className="summary-row"><span className="summary-label">{T.time}</span><span className="summary-value">{isEmergency ? (lang==='es'?'Lo antes posible':'ASAP') : selectedTime}</span></div>
              <div className="summary-row"><span className="summary-label">📍</span><span className="summary-value">{address}</span></div>
              {notes && <div className="summary-row"><span className="summary-label">📝</span><span className="summary-value notes-val">{notes}</span></div>}
              <div className="summary-divider" />
              <div className="summary-price-row">
                <span className="summary-price-label">Precio del Servicio</span>
                <span className="summary-price" style={{ fontSize:'15px', color:'#008F39' }}>A acordar</span>
              </div>
              <p className="price-note" style={{ fontSize:'12px', color:'#666', marginTop:'6px' }}>
                💡 En Listo no cobramos tarifas fijas. Discute y acuerda el precio directamente con tu profesional a través del chat o al ser visitado.
              </p>
            </div>
            <div className="step-nav">
              {errorMsg && <p style={{ color:'red', marginBottom:10 }}>{errorMsg}</p>}
              <button className="btn-back" disabled={loading} onClick={() => setStep(2)}>{T.back}</button>
              <button className="btn-confirm" disabled={loading} onClick={handleConfirmOrder}>
                {loading ? 'Procesando...' : `✓ ${T.confirm}`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}