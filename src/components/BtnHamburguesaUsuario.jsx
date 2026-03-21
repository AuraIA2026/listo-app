import { useState } from 'react'
import { useUserData } from '../useUserData'

/* ─── ACCORDION ─── */
function Accordion({ title, open, onToggle, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', marginBottom: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <button onClick={onToggle} style={{
        width: '100%', background: 'none', border: 'none', padding: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: '14px', fontWeight: '700', color: '#1A1A2E', cursor: 'pointer', textAlign: 'left',
      }}>
        <span>{title}</span>
        <span style={{ fontSize: '11px', color: '#F26000' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  )
}


/* ─── COMPONENTE PRINCIPAL ─── */
export default function BtnHamburguesaUsuario({ onClose, navigate, lang = 'es' }) {
  const { userData, loading, user, getInitials, profileComplete } = useUserData()

  const [open, setOpen]       = useState('solicitudes')
  const [coupon, setCoupon]   = useState('')
  const [couponOk, setCouponOk] = useState(false)

  const toggle = s => setOpen(prev => prev === s ? null : s)

  const applyCoupon = () => {
    if (coupon.trim()) setCouponOk(true)
  }

  // Datos reales del usuario o fallbacks
  const displayName    = userData?.name     || user?.displayName || 'Usuario'
  const displayCity    = userData?.city     || 'Santo Domingo'
  const displayRating  = userData?.rating   || '—'
  const displayPhoto   = userData?.photoURL || user?.photoURL || null
  const displayTotal   = userData?.totalServices        || 0
  const displayPending = userData?.pendingServices      || 0
  const displayDone    = userData?.completedServices    || 0
  const displayCancel  = userData?.cancelledServices    || 0
  const displayAddrs   = userData?.addresses            || []
  const displayFavs    = userData?.favorites            || []

  return (
    <>
      <style>{`
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes pulseGuide { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(242,96,0,0); } 50% { transform: scale(1.05); box-shadow: 0 0 12px rgba(242,96,0,0.6); } }
        .uu-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* OVERLAY */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 1000, display: 'flex', alignItems: 'flex-end',
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width: '100%', height: '95vh', background: '#F5F7FA',
          borderRadius: '24px 24px 0 0', display: 'flex', flexDirection: 'column',
          animation: 'slideUp .3s cubic-bezier(.32,1.2,.5,1)', overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Handle */}
          <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '12px auto 4px', flexShrink: 0 }} />
          <button onClick={onClose} style={{
            position: 'absolute', top: '16px', right: '16px', background: '#eee',
            border: 'none', borderRadius: '50%', width: '32px', height: '32px',
            fontSize: '14px', cursor: 'pointer', color: '#555', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>

          {/* SCROLL */}
          <div className="uu-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 30px', scrollbarWidth: 'none' }}>

            {/* ── ENCABEZADO DE BIENVENIDA MÁS LIGERO ── */}
            <div style={{
              background: '#fff', borderRadius: '16px', padding: '16px 20px',
              marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <span style={{ fontSize: '24px' }}>👋</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 2px' }}>
                  {lang === 'es' ? '¡Hola' : 'Hello'}, {loading ? '...' : displayName.split(' ')[0]}!
                </p>
                <p style={{ fontSize: '11px', color: '#777', margin: 0 }}>
                  {lang === 'es' ? '¿Qué necesitas hacer hoy?' : 'What do you need today?'}
                </p>
              </div>
              {!profileComplete && (
                <button 
                  onClick={() => { if(navigate) navigate('profile'); onClose(); }} 
                  style={{
                    background: '#F26000', color: '#FFF', border: 'none', padding: '8px 10px',
                    borderRadius: '8px', fontSize: '11px', fontWeight: '900', cursor: 'pointer',
                    animation: 'pulseGuide 1.5s infinite', whiteSpace: 'nowrap'
                  }}>
                  ✏️ {lang === 'es' ? 'Completar perfil' : 'Complete profile'}
                </button>
              )}
            </div>

            {/* ══ 2. MIS SOLICITUDES ══ */}
            <Accordion title="🏠 Mis Solicitudes" open={open === 'solicitudes'} onToggle={() => toggle('solicitudes')}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                {[
                  { icon: '🕒', label: 'En proceso', val: displayPending, color: '#F57F17' },
                  { icon: '✅', label: 'Completados', val: displayDone,    color: '#2E7D32' },
                  { icon: '❌', label: 'Cancelados',  val: displayCancel,  color: '#C62828' },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: '#FFF8F3', borderRadius: '12px', padding: '10px 6px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  }}>
                    <span style={{ fontSize: '20px' }}>{s.icon}</span>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: s.color }}>{s.val}</span>
                    <span style={{ fontSize: '10px', color: '#777', textAlign: 'center', fontWeight: '600' }}>{s.label}</span>
                  </div>
                ))}
              </div>
              <button style={{
                width: '100%', background: '#F26000', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: '800', cursor: 'pointer',
              }} onClick={() => { if(navigate) navigate('orders'); onClose(); }}>📅 Ver historial detallado</button>
            </Accordion>

            {/* ══ 3. MIS DIRECCIONES ══ */}
            <Accordion title="📌 Mis Direcciones" open={open === 'direcciones'} onToggle={() => toggle('direcciones')}>
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
                : <p style={{ fontSize: 13, color: '#999', margin: '0 0 12px' }}>No tienes direcciones guardadas</p>
              }
              <button style={{
                width: '100%', background: '#F26000', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', marginTop: '4px',
              }}>➕ Agregar nueva dirección</button>
            </Accordion>

            {/* ══ 4. MÉTODOS DE PAGO ══ */}
            <Accordion title="💳 Métodos de Pago" open={open === 'pago'} onToggle={() => toggle('pago')}>
              {[
                { icon: '💵', label: 'Efectivo',      active: true },
                { icon: '🏦', label: 'Transferencia', active: false },
                { icon: '💳', label: 'Tarjeta',       active: false },
              ].map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px', background: m.active ? '#FFF3EC' : '#F8F9FB',
                  border: m.active ? '1.5px solid #F26000' : '1.5px solid #EAECF0',
                  borderRadius: '10px', marginBottom: '8px',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{m.icon} {m.label}</span>
                  {m.active && <span style={{ fontSize: '11px', fontWeight: '800', color: '#F26000' }}>⭐ Preferido</span>}
                </div>
              ))}
            </Accordion>

            {/* ══ 5. MIS FAVORITOS ══ */}
            <Accordion title="⭐ Mis Favoritos" open={open === 'favoritos'} onToggle={() => toggle('favoritos')}>
              {displayFavs.length > 0
                ? displayFavs.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: '#FFF8F3', borderRadius: '10px', padding: '12px', marginBottom: '8px',
                  }}>
                    <span style={{ fontSize: '24px' }}>{f.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#1A1A2E' }}>{f.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#777' }}>{f.spec} · ⭐ {f.rating}</p>
                    </div>
                    <button style={{
                      background: '#F26000', color: '#fff', border: 'none',
                      borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                    }}>Ver perfil</button>
                  </div>
                ))
                : <p style={{ fontSize: 13, color: '#999' }}>No tienes favoritos aún</p>
              }
            </Accordion>

            {/* ══ 6. PROMOCIONES ══ */}
            <Accordion title="🎁 Promociones y Cupones" open={open === 'promos'} onToggle={() => toggle('promos')}>
              <div style={{
                background: 'linear-gradient(135deg,#1C1C1C,#3A1500)', borderRadius: '14px',
                padding: '14px', marginBottom: '12px', color: 'white',
              }}>
                <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '800' }}>🎟 Invita un amigo</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Gana <strong style={{ color: '#F26000' }}>RD$100</strong> en descuento por cada referido</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={coupon} onChange={e => setCoupon(e.target.value)}
                  placeholder="Código de cupón"
                  style={{
                    flex: 1, background: '#F8F9FB', border: '1.5px solid #EAECF0',
                    borderRadius: '10px', padding: '10px 12px', fontSize: '13px', outline: 'none',
                  }}
                />
                <button onClick={applyCoupon} style={{
                  background: '#F26000', color: '#fff', border: 'none',
                  borderRadius: '10px', padding: '10px 14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer',
                }}>
                  {couponOk ? '✅' : 'Aplicar'}
                </button>
              </div>
            </Accordion>

            {/* ══ 7. POSTULARSE COMO PROFESIONAL ══ */}
            <div style={{
              background: 'linear-gradient(135deg,#1C1C1C 0%,#3A1500 55%,#F26000 100%)',
              borderRadius: '16px', padding: '16px', marginBottom: '10px',
              display: 'flex', alignItems: 'center', gap: '12px',
              animation: profileComplete ? 'pulseGuide 2s infinite' : 'none'
            }}>
              <span style={{ fontSize: '28px' }}>💼</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 2px', color: 'white', fontSize: '13px', fontWeight: '800' }}>¿Quieres ganar dinero?</p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>Postúlate como profesional en Listo</p>
              </div>
              <button style={{
                background: '#F26000', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer',
              }}>👉 Aplicar</button>
            </div>

            <div style={{ height: 20 }} />
          </div>
        </div>
      </div>
    </>
  )
}