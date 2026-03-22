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

/* ─── PLANES DE MUESTRA PARA USUARIOS ─── */
const planes = [
  { id: 'standard', num: '1', emoji: '🔹', nombre: 'Plan Estándar', contratos: '5 contratos', precio: 'RD$500', colorKey: 'standard', badge: 'BÁSICO' },
  { id: 'gold', num: '2', emoji: '🥇', nombre: 'Pack Gold', contratos: '10 contratos', precio: 'RD$1,000', colorKey: 'gold', badge: 'POPULAR' },
  { id: 'platinum', num: '3', emoji: '🥈', nombre: 'Pack Platinum', contratos: '15 contratos', precio: 'RD$1,500', colorKey: 'platinum', badge: 'ACTIVO' },
  { id: 'vip', num: '4', emoji: '💎', nombre: 'VIP Ilimitado', contratos: '∞ contratos', precio: 'RD$2,000/mes', colorKey: 'vip', badge: 'ÉLITE' },
]

const palettes = {
  standard: { primary: '#2E7D32', gradient: 'linear-gradient(145deg, #66BB6A 0%, #388E3C 40%, #2E7D32 70%, #4CAF50 100%)', shadow: 'rgba(46,125,50,0.55)', shine: 'rgba(165,214,167,0.65)', badgeBg: '#1B5E20' },
  gold: { primary: '#D4A017', gradient: 'linear-gradient(145deg, #F5C842 0%, #D4940A 40%, #B8780A 70%, #E8B832 100%)', shadow: 'rgba(212,160,23,0.55)', shine: 'rgba(255,240,160,0.65)', badgeBg: '#7A4D00' },
  platinum: { primary: '#7A8FA8', gradient: 'linear-gradient(145deg, #C8D4E0 0%, #8E9BAF 40%, #6B7A8D 70%, #B0BEC8 100%)', shadow: 'rgba(110,130,155,0.55)', shine: 'rgba(220,230,240,0.75)', badgeBg: '#3A5068' },
  vip: { primary: '#F26000', gradient: 'linear-gradient(145deg, #FF8C42 0%, #F26000 35%, #C94E00 65%, #FF7020 100%)', shadow: 'rgba(242,96,0,0.6)', shine: 'rgba(255,200,140,0.55)', badgeBg: '#6B1D00' },
}

function PlanCardPreview({ plan, onClick }) {
  const [hover, setHover] = useState(false)
  const pal = palettes[plan.colorKey]
  const isVip = plan.colorKey === 'vip'
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', cursor: 'pointer',
        transform: hover ? 'translateY(-7px) scale(1.05)' : 'translateY(0) scale(1)',
        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        filter: hover ? `drop-shadow(0 14px 28px ${pal.shadow})` : `drop-shadow(0 5px 12px ${pal.shadow})`,
      }}
    >
      <div style={{ position: 'absolute', bottom: '-7px', left: '7px', right: '-2px', height: '100%', borderRadius: '18px', background: pal.primary, opacity: 0.28, filter: 'blur(5px)', zIndex: 0 }} />
      <div style={{
        position: 'relative', zIndex: 1, background: pal.gradient, borderRadius: '18px',
        padding: '18px 10px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
        border: `1.5px solid ${pal.shine}`, minHeight: '158px', overflow: 'hidden',
        boxShadow: hover ? `0 0 22px ${pal.shadow}` : `inset 0 1px 0 ${pal.shine}`, transition: 'box-shadow 0.3s',
      }}>
        <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: '38%', background: `linear-gradient(180deg,${pal.shine} 0%,transparent 100%)`, borderRadius: '0 0 50% 50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '8px', right: '8px', background: pal.badgeBg, color: 'white', fontSize: '7px', fontWeight: '900', letterSpacing: '0.5px', padding: '2px 6px', borderRadius: '5px' }}>{plan.badge}</div>
        <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.18)', color: 'rgba(255,255,255,0.9)', width: '20px', height: '20px', borderRadius: '50%', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{plan.num}</div>
        <div style={{ marginTop: '12px', position: 'relative' }}>
          <span style={{ fontSize: '32px', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))' }}>{plan.emoji}</span>
          {isVip && <span style={{ position: 'absolute', top: '-8px', right: '-13px', fontSize: '13px', animation: 'twinkle 0.8s ease-in-out infinite alternate' }}>✨</span>}
        </div>
        <p style={{ fontSize: '12px', fontWeight: '800', color: 'white', margin: '6px 0 0', textShadow: '0 1px 4px rgba(0,0,0,0.4)', textAlign: 'center', lineHeight: 1.2 }}>{plan.nombre}</p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: '600' }}>{plan.contratos}</p>
        <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: '8px', padding: '4px 10px', marginTop: '5px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <p style={{ fontSize: '13px', fontWeight: '900', color: 'white', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{plan.precio}</p>
        </div>
      </div>
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

            {/* ── 7. POSTULARSE COMO PROFESIONAL ── */}
            <Accordion title="💼 Postularse (Ver Planes)" open={open === 'postularse'} onToggle={() => toggle('postularse')}>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', lineHeight: 1.5 }}>
                {lang === 'es' 
                  ? 'Selecciona un plan para iniciar tu postulación. Te guiaremos en la verificación de tus documentos para comenzar a ganar dinero.' 
                  : 'Select a plan to start your application. We will prompt you to verify your identity to begin earning money.'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                {planes.map((p, i) => (
                  <PlanCardPreview 
                    key={i} 
                    plan={p} 
                    onClick={() => {
                      if(navigate) navigate('verificacion')
                      onClose()
                    }} 
                  />
                ))}
              </div>
            </Accordion>

            <div style={{ height: 20 }} />
          </div>
        </div>
      </div>
    </>
  )
}