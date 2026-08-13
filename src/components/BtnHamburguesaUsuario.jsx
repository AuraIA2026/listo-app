import { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth'
import { useUserData } from '../useUserData'


/* ─── ACCORDION UTILITARIO ─── */
function Accordion({ title, children, open, onToggle }) {
  return (
    <div className="uu-accordion">
      <button className="uu-acc-header" onClick={onToggle}>
        <span>{title}</span>
        <span className="uu-acc-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="uu-acc-body">{children}</div>}
    </div>
  )
}

/* ─── COMPONENTE PRINCIPAL ─── */
export default function BtnHamburguesaUsuario({ onClose, navigate, lang = 'es', userRole, activeView, setActiveView }) {
  const { userData, loading, getInitials, profileComplete } = useUserData()
  const [open, setOpen] = useState(null)
  const [coupon, setCoupon] = useState('')
  const [couponOk, setCouponOk] = useState(false)

  const auth = getAuth()

  const toggle = (s) => setOpen(prev => prev === s ? null : s)

  const applyCoupon = () => {
    if (!coupon.trim()) return
    setCouponOk(true)
    setTimeout(() => {
      setCoupon('')
      setCouponOk(false)
    }, 2000)
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      onClose()
      navigate('login')
    } catch (e) {
      console.error('Error logout:', e)
    }
  }

  // Direcciones reales del usuario
  const displayAddrs = []
  if (userData?.city) displayAddrs.push(userData.city)
  if (userData?.sector) displayAddrs.push(userData.sector)

  if (loading) return null

  const isProApproved = userRole === 'pro'

  return (
    <div className="uu-container">
      <style>{`
        .uu-container { position: fixed; inset: 0; z-index: 1000; font-family: 'Outfit', sans-serif; }
        .uu-overlay { position: absolute; inset: 0; background: rgba(26,26,46,0.4); backdrop-filter: blur(8px); z-index: 1; }
        .uu-panel { position: absolute; bottom: 0; left: 0; right: 0; background: #FFF9F6; border-radius: 32px 32px 0 0; box-shadow: 0 -10px 40px rgba(0,0,0,0.15); max-height: 92vh; display: flex; flexDirection: column; animation: slideUp 0.3s ease-out; z-index: 2; }
        .uu-handle { width: 44px; height: 5px; background: #E0D5D0; border-radius: 3px; margin: 12px auto 8px; }
        .uu-close { position: absolute; top: 16px; right: 20px; border: none; background: #F5EAE6; color: #7A6962; width: 32px; height: 32px; border-radius: 50%; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .uu-scroll { overflow-y: auto; padding: 12px 0 44px; flex: 1; }
        .uu-user-box { display: flex; align-items: center; gap: 14px; padding: 12px 24px 20px; border-bottom: 1px solid #F5EAE6; margin-bottom: 14px; }
        .uu-avatar { width: 56px; height: 56px; border-radius: 50%; background: #F26000; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; fontSize: 20px; border: 3px solid white; box-shadow: 0 4px 12px rgba(242,96,0,0.18); object-fit: cover; }
        .uu-user-info { flex: 1; text-align: left; }
        .uu-name { font-size: 18px; fontWeight: 800; color: #1A1A2E; margin: 0; }
        .uu-role { font-size: 12px; color: #777; margin: 2px 0 0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        
        /* Filas de Navegación */
        .uu-row-item { display: flex; align-items: center; gap: 14px; padding: 13px 24px; cursor: pointer; transition: background 0.2s; text-align: left; }
        .uu-row-item:hover { background: #FFF0E6; }
        .uu-row-icon { font-size: 18px; }
        .uu-row-text { font-size: 15px; font-weight: 700; color: #1A1A2E; flex: 1; }
        
        /* Acordeones */
        .uu-accordion { background: white; border-radius: 18px; margin: 6px 20px; border: 1.5px solid #F5EAE6; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.01); }
        .uu-acc-header { width: 100%; padding: 14px 20px; background: none; border: none; display: flex; justify-content: space-between; align-items: center; font-family: inherit; font-size: 14.5px; font-weight: 800; color: #1A1A2E; cursor: pointer; }
        .uu-acc-arrow { font-size: 10px; color: #A08F87; }
        .uu-acc-body { padding: 0 20px 18px; border-top: 1.5px solid #FFF5F2; background: #FFFDFD; text-align: left; }
        
        /* Botones de acción inferior */
        .uu-bottom-btn { background: #F26000; color: white; border: none; borderRadius: 16px; padding: 16px; fontSize: 16px; fontWeight: 900; width: calc(100% - 40px); margin: 20px 20px 0; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 8px 24px rgba(242,96,0,0.22); transition: transform 0.1s; }
        .uu-bottom-btn:active { transform: scale(0.97); }
        .uu-logout-btn { display: flex; align-items: center; justify-content: center; gap: 8px; background: none; border: none; color: #DC2626; font-size: 14.5px; font-weight: 800; cursor: pointer; margin: 16px auto 0; padding: 10px 24px; border-radius: 12px; }
        .uu-logout-btn:hover { background: #FEE2E2; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes pulseGuide { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>

      <div className="uu-overlay" onClick={onClose} />
      <div className="uu-panel" onClick={e => e.stopPropagation()}>
        <div className="uu-handle" />
        <button className="uu-close" onClick={onClose}>✕</button>

        <div className="uu-scroll">
          {/* Header de Usuario */}
          <div className="uu-user-box">
            {userData?.profilePhoto || userData?.photoURL ? (
              <img src={userData.profilePhoto || userData.photoURL} alt="Avatar" className="uu-avatar" />
            ) : (
              <div className="uu-avatar">{getInitials(userData?.name || '')}</div>
            )}
            <div className="uu-user-info">
              <h4 className="uu-name">{userData?.name || 'Cliente'}</h4>
              <p className="uu-role">
                {isProApproved ? (userData?.rating && userData?.reviews && userData?.reviews > 0 ? `⭐ ${Number(userData.rating).toFixed(1)} (Socio)` : `Socio`) : (lang === 'es' ? 'Cliente' : 'Client')}
              </p>
            </div>
          </div>

          <div className="uu-row-item" onClick={() => { if(navigate) navigate('trabajo'); onClose(); }}>
            <span className="uu-row-icon">🕒</span>
            <span className="uu-row-text">{lang === 'es' ? 'Historial de solicitudes' : 'Request history'}</span>
          </div>

          <div className="uu-row-item" onClick={() => { 
            if (isProApproved) {
              localStorage.setItem('listo_active_view', 'pro')
              setActiveView('pro')
            } else {
              if (!profileComplete) {
                if (navigate) navigate('profile')
              } else {
                if (navigate) navigate('profile', { screen: 'verification' })
              }
            }
            onClose(); 
          }}>
            <span className="uu-row-icon">📄</span>
            <span className="uu-row-text">
              {lang === 'es' ? 'Contratos' : 'Contracts'}
              {isProApproved && userData?.contracts !== undefined && (
                <strong style={{ marginLeft: '8px', color: '#F26000' }}>({userData.contracts})</strong>
              )}
            </span>
          </div>

          {/* Acordeón de Direcciones */}
          <Accordion title={lang === 'es' ? '📌 Mis direcciones' : '📌 My addresses'} open={open === 'direcciones'} onToggle={() => toggle('direcciones')}>
            {displayAddrs.length > 0
              ? displayAddrs.map((a, i) => (
                <div key={i} style={{
                  background: '#FFF8F3', borderRadius: '10px', padding: '12px',
                  marginBottom: '8px', fontSize: '13px', color: '#333', fontWeight: '600',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>{a}</span>
                  <button style={{ background: 'none', border: 'none', color: '#F26000', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>✏️</button>
                </div>
              ))
              : <p style={{ fontSize: 13, color: '#999', margin: '0 0 12px' }}>{lang === 'es' ? 'No tienes direcciones guardadas' : 'No saved addresses'}</p>
            }
            <button style={{
              width: '100%', background: '#F26000', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', marginTop: '4px',
            }}>{lang === 'es' ? '➕ Agregar nueva dirección' : '➕ Add new address'}</button>
          </Accordion>

          <div className="uu-row-item" onClick={() => { if(navigate) navigate('notificaciones'); onClose(); }}>
            <span className="uu-row-icon">🔔</span>
            <span className="uu-row-text">{lang === 'es' ? 'Notificaciones' : 'Notifications'}</span>
          </div>

          <div className="uu-row-item" onClick={() => { if(navigate) navigate('profile'); onClose(); }}>
            <span className="uu-row-icon">⚙️</span>
            <span className="uu-row-text">{lang === 'es' ? 'Configuración' : 'Settings'}</span>
          </div>

          <div className="uu-row-item" onClick={() => window.open('https://wa.me/18099090455', '_system')}>
            <span className="uu-row-icon">💬</span>
            <span className="uu-row-text">{lang === 'es' ? 'Soporte y Ayuda' : 'Support and Help'}</span>
          </div>

          {/* Botón de Acción Principal (inDrive Modo Conductor/Postulación) */}
          {isProApproved ? (
            <button 
              className="uu-bottom-btn" 
              onClick={() => {
                localStorage.setItem('listo_active_view', 'pro')
                setActiveView('pro')
                onClose()
              }}
            >
              💼 {lang === 'es' ? 'Modo Profesional' : 'Professional Mode'}
            </button>
          ) : (
            <button 
              className="uu-bottom-btn" 
              onClick={() => {
                if (!profileComplete) {
                  if (navigate) navigate('profile')
                } else {
                  if (navigate) navigate('profile', { screen: 'verification' })
                }
                onClose()
              }}
            >
              💼 {lang === 'es' ? 'Trabajar como Profesional' : 'Work as a Professional'}
            </button>
          )}

          {/* Cerrar Sesión */}
          <button className="uu-logout-btn" onClick={handleLogout}>
            🚪 {lang === 'es' ? 'Cerrar Sesión' : 'Log Out'}
          </button>
        </div>
      </div>
    </div>
  )
}