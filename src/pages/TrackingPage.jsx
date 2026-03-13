import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './TrackingPage.css'
import vanImg from '../assets/van.png'

// Remove ALL default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  shadowUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  iconRetinaUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  iconSize: [0, 0],
  shadowSize: [0, 0],
})

const clientIcon = L.divIcon({
  className: '',
  html: `<div class="map-marker client-marker">
    <div class="marker-pulse"></div>
    <div class="marker-icon">🏠</div>
  </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
})

const createVanIcon = (imgSrc) => L.divIcon({
  className: 'leaflet-van-icon',
  html: `<img src="${imgSrc}" alt="van" style="width:64px;height:64px;object-fit:contain;display:block;filter:drop-shadow(0 4px 8px rgba(242,96,0,0.5));" />`,
  iconSize: [64, 64],
  iconAnchor: [32, 32],
  popupAnchor: [0, -32],
})

const createWorkerIcon = () => L.divIcon({
  className: 'leaflet-worker-icon',
  html: `<div style="background: white; border-radius: 50%; padding: 4px; border: 2px solid #F26000; box-shadow: 0 4px 12px rgba(242,96,0,0.4); display: flex; align-items: center; justify-content: center; overflow: hidden; width: 50px; height: 50px;">
           <span style="font-size: 28px; line-height: 1; animation: workerFloat 2s ease-in-out infinite alternate;">👨‍🔧</span>
         </div>`,
  iconSize: [60, 60],
  iconAnchor: [30, 30],
  popupAnchor: [0, -30],
})

const CLIENT_POS    = [18.4745, -69.9310]
const PRO_START     = [18.4920, -69.9050]
const PRO_WAYPOINTS = [
  [18.4920, -69.9050],
  [18.4870, -69.9120],
  [18.4820, -69.9180],
  [18.4780, -69.9230],
  [18.4760, -69.9270],
  [18.4750, -69.9290],
  [18.4745, -69.9310],
]

const RETREAT_WAYPOINTS = [
  [18.4745, -69.9310],
  [18.4760, -69.9280],
  [18.4790, -69.9240],
  [18.4830, -69.9180],
  [18.4880, -69.9110],
  [18.4930, -69.9040],
  [18.5000, -69.8950],
]

function lerp(a, b, t) { return a + (b - a) * t }

function SmoothMarker({ targetPos, icon, children, visible = true }) {
  const markerRef    = useRef(null)
  const currentPos   = useRef(targetPos)
  const animFrameRef = useRef(null)
  const startTimeRef = useRef(null)
  const fromPos      = useRef(targetPos)
  const DURATION     = 2500

  useEffect(() => {
    fromPos.current      = [...currentPos.current]
    startTimeRef.current = null
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const t       = Math.min(elapsed / DURATION, 1)
      const eased   = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      const lat     = lerp(fromPos.current[0], targetPos[0], eased)
      const lng     = lerp(fromPos.current[1], targetPos[1], eased)
      currentPos.current = [lat, lng]
      if (markerRef.current) markerRef.current.setLatLng([lat, lng])
      if (t < 1) animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [targetPos[0], targetPos[1]])

  if (!visible) return null

  return (
    <Marker ref={markerRef} position={currentPos.current} icon={icon}>
      {children}
    </Marker>
  )
}

function WorkingAnimation({ lang }) {
  return (
    <div className="working-anim-wrap">
      <div className="working-scene professional-scene" style={{width: 'auto', height: '140px'}}>
        <div 
          className="professional-worker-emoji"
          style={{fontSize: '90px', animation: 'workerFloat 2.5s ease-in-out infinite alternate'}}
        >
          👨‍🔧
        </div>
        <div className="sparks">
          <span className="spark s1">✦</span>
          <span className="spark s2">★</span>
          <span className="spark s3">✦</span>
        </div>
      </div>
      {/* Eliminado el texto redundante que repetía Trabajando abajo del muñequito */}
    </div>
  )
}

function VanRetreatAnimation({ lang }) {
  return (
    <div className="van-retreat-wrap">
      <div className="van-retreat-scene">
        <div className="retreat-dust">
          <span className="dust d1">·</span>
          <span className="dust d2">·</span>
          <span className="dust d3">·</span>
        </div>
      </div>
      <p className="retreat-label">{lang === 'es' ? 'El profesional se está retirando...' : 'Professional is leaving...'}</p>
    </div>
  )
}

function TratoScreen({ lang, proName, onAccept, onDecline }) {
  return (
    <div className="trato-screen fade-up">
      <div className="trato-icon">🤝</div>
      <h3 className="trato-title">{lang === 'es' ? '¿Cerramos el trato?' : 'Close the deal?'}</h3>
      <p className="trato-sub">
        {lang === 'es'
          ? `${proName} está en tu ubicación y listo para trabajar`
          : `${proName} is at your location and ready to work`}
      </p>
      <div className="trato-buttons">
        <button className="trato-btn accept" onClick={onAccept}>
          ✅ {lang === 'es' ? 'Trato hecho' : 'Deal made'}
        </button>
        <button className="trato-btn decline" onClick={onDecline}>
          ❌ {lang === 'es' ? 'Declinado' : 'Declined'}
        </button>
      </div>
    </div>
  )
}

export default function TrackingPage({ lang = 'es', navigate, professional }) {
  const pro = professional || {
    name: 'Carlos Méndez',
    avatar: 'CM',
    color: '#F26000',
    category: '🔧 Mecánico',
    rating: 4.9,
    phone: '+1 (809) 555-0123',
  }

  const [proPos,        setProPos]        = useState(PRO_START)
  const [waypointIdx,   setWaypointIdx]   = useState(0)
  const [eta,           setEta]           = useState(18)
  const [status,        setStatus]        = useState('on_way')
  const [workStatus,    setWorkStatus]    = useState('tracking')
  // routeSoFar = línea gris (ya recorrido)
  const [routeSoFar,    setRouteSoFar]    = useState([PRO_START])
  // remainingRoute = línea mamey (por recorrer) — empieza con todo el camino
  const [remainingRoute, setRemainingRoute] = useState(PRO_WAYPOINTS)
  const [mapCenter]                       = useState([18.4832, -69.9180])
  const [vanVisible,    setVanVisible]    = useState(true)
  const [retreatIdx,    setRetreatIdx]    = useState(0)
  const intervalRef                       = useRef(null)
  const vanIcon                           = useRef(null)
  if (!vanIcon.current) vanIcon.current = createVanIcon(vanImg)
  
  const workerIcon                        = useRef(null)
  if (!workerIcon.current) workerIcon.current = createWorkerIcon()

  // Animación de llegada — la línea mamey va desapareciendo según avanza
  useEffect(() => {
    if (workStatus !== 'tracking') return
    intervalRef.current = setInterval(() => {
      setWaypointIdx(prev => {
        const next = prev + 1
        if (next >= PRO_WAYPOINTS.length) {
          clearInterval(intervalRef.current)
          setStatus('arrived')
          setEta(0)
          setWorkStatus('awaiting_deal')
          // Van llega exactamente al destino
          setProPos(CLIENT_POS)
          setRouteSoFar(PRO_WAYPOINTS)
          setRemainingRoute([]) // línea mamey desaparece completamente
          return prev
        }
        const newPos = PRO_WAYPOINTS[next]
        setProPos(newPos)
        // Línea gris crece (recorrido)
        setRouteSoFar(PRO_WAYPOINTS.slice(0, next + 1))
        // Línea mamey se acorta (lo que falta)
        setRemainingRoute(PRO_WAYPOINTS.slice(next))
        setEta(e => Math.max(0, e - Math.floor(18 / PRO_WAYPOINTS.length)))
        if (next === PRO_WAYPOINTS.length - 2) setStatus('arriving')
        return next
      })
    }, 3000)
    return () => clearInterval(intervalRef.current)
  }, [workStatus])

  // Animación de retirada
  useEffect(() => {
    if (workStatus !== 'retreating') return
    const interval = setInterval(() => {
      setRetreatIdx(prev => {
        const next = prev + 1
        if (next >= RETREAT_WAYPOINTS.length) {
          clearInterval(interval)
          setVanVisible(false)
          setWorkStatus('declined_done')
          return prev
        }
        setProPos(RETREAT_WAYPOINTS[next])
        setRemainingRoute(RETREAT_WAYPOINTS.slice(next))
        return next
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [workStatus])

  const handleAccept = () => setWorkStatus('working')

  const handleDecline = () => {
    setWorkStatus('retreating')
    setRetreatIdx(0)
    setProPos(RETREAT_WAYPOINTS[0])
    setRemainingRoute(RETREAT_WAYPOINTS)
  }

  const statusInfo = {
    on_way:   { label: lang === 'es' ? 'En camino'  : 'On the way', color: '#F26000', icon: '🚐' },
    arriving: { label: lang === 'es' ? '¡Llegando!' : 'Arriving!',  color: '#FF8533', icon: '⚡' },
    arrived:  { label: lang === 'es' ? '¡Llegó!'    : 'Arrived!',   color: '#3DBA74', icon: '✅' },
  }

  const current = statusInfo[status] || statusInfo['on_way']

  const getStatusIcon = () => {
    if (workStatus === 'working')       return '🔧'
    if (workStatus === 'awaiting_deal') return '🤝'
    if (workStatus === 'retreating')    return '🚐'
    if (workStatus === 'declined_done') return '❌'
    if (workStatus === 'done')          return '🎉'
    return current.icon
  }

  const getStatusColor = () => {
    if (workStatus === 'working')       return '#0EA5E9'
    if (workStatus === 'awaiting_deal') return '#059669'
    if (workStatus === 'retreating')    return '#EF4444'
    if (workStatus === 'declined_done') return '#EF4444'
    if (workStatus === 'done')          return '#10B981'
    return current.color
  }

  const getStatusLabel = () => {
    if (workStatus === 'working')       return lang === 'es' ? '🔧 Trabajando'          : '🔧 Working'
    if (workStatus === 'awaiting_deal') return lang === 'es' ? '🤝 ¿Cerramos el trato?' : '🤝 Close the deal?'
    if (workStatus === 'retreating')    return lang === 'es' ? '🚐 Retirándose...'       : '🚐 Leaving...'
    if (workStatus === 'declined_done') return lang === 'es' ? '❌ Trato declinado'      : '❌ Deal declined'
    if (workStatus === 'done')          return lang === 'es' ? '🎉 ¡Trabajo completado!' : '🎉 Work completed!'
    return current.label
  }

  const getStatusDesc = () => {
    if (workStatus === 'working')       return lang === 'es' ? 'Realizando la labor acordada en tu ubicación'    : 'Performing the agreed service'
    if (workStatus === 'awaiting_deal') return lang === 'es' ? `${pro.name} ha llegado, confirma el trato`     : `${pro.name} arrived, confirm the deal`
    if (workStatus === 'retreating')    return lang === 'es' ? 'El profesional está saliendo de tu ubicación'  : 'Professional is leaving your location'
    if (workStatus === 'declined_done') return lang === 'es' ? 'El trato fue declinado. La van se retiró.'     : 'Deal was declined. The van left.'
    if (workStatus === 'done')          return lang === 'es' ? '¡El servicio fue completado exitosamente!'     : 'Service completed successfully!'
    if (status === 'arrived')           return lang === 'es' ? `${pro.name} ha llegado a tu ubicación`         : `${pro.name} has arrived`
    if (status === 'arriving')          return lang === 'es' ? '¡Tu profesional está a la vuelta!'             : 'Just around the corner!'
    return lang === 'es' ? `${pro.name} está en camino` : `${pro.name} is on the way`
  }

  const flowSteps = [
    { key: 'confirmed', labelEs: 'Confirmado', labelEn: 'Confirmed' },
    { key: 'onway',     labelEs: 'En camino',  labelEn: 'On the way' },
    { key: 'arrived',   labelEs: 'Llegó',      labelEn: 'Arrived' },
    { key: 'trato',     labelEs: 'Trato',      labelEn: 'Deal' },
    { key: 'working',   labelEs: 'Trabajando', labelEn: 'Working' },
    { key: 'done',      labelEs: 'Listo',      labelEn: 'Done' },
  ]

  const currentFlowIdx = () => {
    if (workStatus === 'done')          return 5
    if (workStatus === 'working')       return 4
    if (workStatus === 'awaiting_deal') return 3
    if (status === 'arrived')           return 2
    if (status === 'arriving')          return 1
    return 1
  }

  return (
    <div className="tracking-page">
      <div className="tracking-header">
        <button className="tracking-back" onClick={() => navigate('orders')}>←</button>
        <div>
          <h2 className="tracking-title">{lang === 'es' ? 'Seguimiento en vivo' : 'Live tracking'}</h2>
          <p className="tracking-sub">{lang === 'es' ? 'Actualizado en tiempo real' : 'Updated in real time'}</p>
        </div>
        <div className="tracking-live-badge">
          <span className="live-dot" />
          LIVE
        </div>
      </div>

      <div className="tracking-map-wrap">
        <MapContainer
          center={mapCenter}
          zoom={14}
          className="tracking-map"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Línea gris — recorrido ya hecho */}
          {routeSoFar.length > 1 && (
            <Polyline
              positions={routeSoFar}
              pathOptions={{ color: '#BBBBBB', weight: 4, opacity: 0.5, dashArray: '8 4' }}
            />
          )}

          {/* Línea mamey — tramo que falta, se acorta según avanza */}
          {remainingRoute.length > 1 && (
            <Polyline
              positions={remainingRoute}
              pathOptions={{
                color: workStatus === 'retreating' ? '#EF4444' : '#F26000',
                weight: 5,
                opacity: 0.85
              }}
            />
          )}

          {/* Ícono destino (casa) — siempre visible */}
          <Marker position={CLIENT_POS} icon={clientIcon}>
            <Popup>{lang === 'es' ? 'Tu ubicación' : 'Your location'}</Popup>
          </Marker>

          {/* Van u Obrero — cuando llega queda encima del destino */}
          {vanVisible && (
            <SmoothMarker targetPos={proPos} icon={workStatus === 'working' ? workerIcon.current : vanIcon.current} visible={vanVisible}>
              <Popup>{pro.name}</Popup>
            </SmoothMarker>
          )}
        </MapContainer>

        {workStatus === 'tracking' && (
          <div className="map-eta-pill" style={{ background: getStatusColor() + '22', borderColor: getStatusColor() + '44' }}>
            <span className="eta-icon">{getStatusIcon()}</span>
            <span className="eta-text" style={{ color: getStatusColor() }}>
              {status === 'arrived' ? getStatusLabel() : `${eta} min`}
            </span>
          </div>
        )}
      </div>

      <div className="tracking-card">
        <div className={`tracking-status-bar ${workStatus === 'working' ? 'status-bar-working' : ''}`} style={workStatus === 'working' ? {} : { background: getStatusColor() + '15', borderColor: getStatusColor() + '30' }}>
          <span className="status-icon">{getStatusIcon()}</span>
          <div style={{ flex: 1 }}>
            <p className="status-label" style={{ color: getStatusColor() }}>{getStatusLabel()}</p>
            <p className="status-desc">{getStatusDesc()}</p>
          </div>
          {workStatus === 'tracking' && status !== 'arrived' && (
            <div className="eta-countdown">
              <span className="eta-number">{eta}</span>
              <span className="eta-unit">min</span>
            </div>
          )}
        </div>

        {workStatus === 'awaiting_deal' && (
          <TratoScreen lang={lang} proName={pro.name} onAccept={handleAccept} onDecline={handleDecline} />
        )}
        {workStatus === 'working' && <WorkingAnimation lang={lang} />}
        {workStatus === 'retreating' && <VanRetreatAnimation lang={lang} />}

        {workStatus === 'declined_done' && (
          <div className="declined-screen fade-up">
            <div className="declined-icon">❌</div>
            <p className="declined-title">{lang === 'es' ? 'Trato declinado' : 'Deal declined'}</p>
            <p className="declined-sub">{lang === 'es' ? 'La van de Listo se ha retirado de tu ubicación.' : 'The Listo van has left your location.'}</p>
            <button className="declined-btn" onClick={() => navigate('search')}>
              {lang === 'es' ? 'Buscar otro profesional' : 'Find another professional'}
            </button>
          </div>
        )}

        {!['awaiting_deal', 'declined_done'].includes(workStatus) && (
          <>
            <div className="tracking-pro-info">
              <div className="tracking-pro-left">
                <div className="tracking-avatar" style={{ background: pro.color }}>{pro.avatar}</div>
                <div>
                  <p className="tracking-pro-name">{pro.name}</p>
                  <p className="tracking-pro-cat">{pro.category}</p>
                  <div className="tracking-pro-rating">
                    ★ {pro.rating}
                    <span className="tracking-verified">✓ {lang === 'es' ? 'Verificado' : 'Verified'}</span>
                  </div>
                </div>
              </div>
              <div className="tracking-pro-actions">
                <button className="track-action-btn call" onClick={() => window.open(`tel:${pro.phone}`)}>📞</button>
                <button className="track-action-btn chat" onClick={() => navigate('chat', pro)}>💬</button>
              </div>
            </div>

            <div className="tracking-steps">
              {flowSteps.map((step, i) => (
                <div key={step.key} className={`track-step ${currentFlowIdx() >= i ? 'done' : ''}`}>
                  <div className="track-step-dot" />
                  {i < flowSteps.length - 1 && <div className="track-step-line" />}
                  <span className="track-step-label">{lang === 'es' ? step.labelEs : step.labelEn}</span>
                </div>
              ))}
            </div>

            {workStatus === 'working' && (
              <button className="tracking-flow-btn done-btn" onClick={() => setWorkStatus('done')}>
                🎉 {lang === 'es' ? '¡Listo! Trabajo terminado' : 'Done! Work finished'}
              </button>
            )}

            {workStatus === 'done' && (
              <div className="tracking-done-actions">
                <button className="tracking-flow-btn pay-btn" onClick={() => navigate('payment', pro)}>
                  💳 {lang === 'es' ? 'Pagar ahora' : 'Pay now'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}