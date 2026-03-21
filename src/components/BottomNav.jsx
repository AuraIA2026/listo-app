import { useState } from 'react'
import './BottomNav.css'
import { useUserData } from '../useUserData'
import icInicio  from '../assets/icons/inicio.png'
import icBuscar  from '../assets/icons/buscar.png'
import icPedidos from '../assets/icons/pedidos.png'
import icPerfil  from '../assets/icons/perfil.png'

const IconTrabajoListo = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="13" cy="13" r="11"
      fill={active ? '#F26000' : 'none'}
      stroke={active ? '#F26000' : '#BBBBBB'}
      strokeWidth="2"
    />
    <path d="M7.5 13.5L11 17L18.5 9.5"
      stroke={active ? 'white' : '#BBBBBB'}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const tabs = [
  { id: 'home',     labelEs: 'Inicio',        labelEn: 'Home',     icon: icInicio,  type: 'img' },
  { id: 'search',   labelEs: 'Buscar',        labelEn: 'Search',   icon: icBuscar,  type: 'img' },
  { id: 'workdone', labelEs: 'Trabajo\nListo', labelEn: 'Work\nDone', type: 'svg' },
  { id: 'orders',   labelEs: 'Pedidos',       labelEn: 'Orders',   icon: icPedidos, type: 'img' },
  { id: 'profile',  labelEs: 'Perfil',        labelEn: 'Profile',  icon: icPerfil,  type: 'img' },
]

/* ── MODAL SUBIR FOTOS (solo profesional) ── */
function SubirFotosModal({ onClose, lang }) {
  const [fotos, setFotos]       = useState([null, null, null])
  const [enviado, setEnviado]   = useState(false)
  const [descripcion, setDesc]  = useState('')

  const handleFoto = (idx, file) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setFotos(prev => { const n = [...prev]; n[idx] = url; return n })
  }

  const handleEnviar = () => {
    if (fotos.every(f => f === null)) return
    setEnviado(true)
    setTimeout(() => { setEnviado(false); onClose() }, 2000)
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '480px', background: '#fff',
        borderRadius: '24px 24px 0 0', padding: '16px 20px 40px',
        animation: 'slideUp .3s cubic-bezier(.32,1.2,.5,1)',
      }}>
        <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

        {/* Handle */}
        <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '0 auto 16px' }} />

        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1A2E', margin: '0 0 4px' }}>
          📸 Subir fotos del trabajo
        </h3>
        <p style={{ fontSize: '13px', color: '#999', margin: '0 0 20px' }}>
          Sube hasta 3 fotos del trabajo realizado
        </p>

        {/* 3 slots de fotos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {fotos.map((foto, i) => (
            <label key={i} style={{
              aspectRatio: '1', borderRadius: '14px', overflow: 'hidden',
              border: foto ? 'none' : '2px dashed #F26000',
              background: foto ? 'none' : '#FFF3EC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
            }}>
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => handleFoto(i, e.target.files[0])} />
              {foto
                ? <img src={foto} alt={`foto ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '28px', margin: 0 }}>📷</p>
                    <p style={{ fontSize: '11px', color: '#F26000', fontWeight: '700', margin: 0 }}>Foto {i+1}</p>
                  </div>
              }
            </label>
          ))}
        </div>

        {/* Descripción */}
        <textarea
          value={descripcion}
          onChange={e => setDesc(e.target.value)}
          placeholder="Describe brevemente el trabajo realizado..."
          rows={3}
          style={{
            width: '100%', background: '#F8F9FB', border: '1.5px solid #EAECF0',
            borderRadius: '12px', padding: '12px', fontSize: '13px', color: '#333',
            resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: '14px',
            fontFamily: 'inherit',
          }}
        />

        {/* Botón enviar */}
        {enviado
          ? <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: '800', color: '#2E7D32', padding: '14px' }}>
              ✅ ¡Fotos enviadas correctamente!
            </div>
          : <button onClick={handleEnviar} style={{
              width: '100%', background: 'linear-gradient(135deg,#F26000,#FF8C42)',
              color: '#fff', border: 'none', borderRadius: '14px', padding: '15px',
              fontSize: '15px', fontWeight: '900', cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(242,96,0,0.35)',
            }}>
              📤 Enviar fotos del trabajo
            </button>
        }

        <button onClick={onClose} style={{
          width: '100%', background: 'none', border: 'none', color: '#999',
          fontSize: '13px', fontWeight: '600', marginTop: '10px', cursor: 'pointer',
        }}>Cancelar</button>
      </div>
    </div>
  )
}

/* ── BOTTOM NAV ── */
export default function BottomNav({ currentPage, navigate, lang = 'es', userRole = 'client' }) {
  const { userData, profileComplete } = useUserData()

  const activeTab =
    currentPage === 'home'     ? 'home'     :
    currentPage === 'search'   ? 'search'   :
    currentPage === 'workdone' ? 'workdone' :
    currentPage === 'orders'   ? 'orders'   :
    currentPage === 'profile'  ? 'profile'  : 'home'

  const handleTab = (id) => {
    // Si presiona Trabajo Listo, que vaya natural a WorkDonePage sin depender del viejo modal.
    navigate(id)
  }

  return (
    <>
      <style>{`
        @keyframes floatTipBottom { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes pulseGuide { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(242,96,0,0); } 50% { transform: scale(1.05); box-shadow: 0 0 12px rgba(242,96,0,0.6); } }
      `}</style>
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            const label = lang === 'es' ? tab.labelEs : tab.labelEn
            return (
              <button
                key={tab.id}
                className={`nav-tab ${isActive ? 'active' : ''}`}
                onClick={() => handleTab(tab.id)}
                style={{ 
                  position: 'relative',
                  animation: (tab.id === 'profile' && userData && !profileComplete) ? 'pulseGuide 1.5s infinite' : 'none' 
                }}
              >
                {/* TOOLTIP DINÁMICO PARA PERFIL */}
                {tab.id === 'profile' && userData && !profileComplete && (
                  <div style={{
                    position: 'absolute', bottom: '115%', right: '-5px', background: '#F26000', color: '#FFF',
                    padding: '6px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800',
                    whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(242,96,0,0.4)',
                    animation: 'floatTipBottom 2s ease-in-out infinite', zIndex: 100
                  }}>
                    <div style={{
                      position: 'absolute', bottom: '-4px', right: '15px', width: '10px', height: '10px',
                      background: '#F26000', transform: 'rotate(45deg)'
                    }} />
                    ⚠️ {lang === 'es' ? 'Completa tu perfil' : 'Complete profile'}
                  </div>
                )}
                {isActive && <div className="nav-tab-pill" />}
                <span className="nav-icon">
                  {tab.type === 'svg'
                    ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill={isActive ? '#F26000' : 'none'} stroke={isActive ? '#F26000' : '#888'} strokeWidth="1.5"/>
                        <path d="M7 12l3.5 3.5L18 8" stroke={isActive ? '#FFF' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )
                    : <img src={tab.icon} alt={tab.labelEs} className={`nav-icon-img ${isActive ? 'active' : ''}`} />
                  }
                </span>
                <span className="nav-label" style={{ whiteSpace: 'pre-line', lineHeight: '1.1' }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}