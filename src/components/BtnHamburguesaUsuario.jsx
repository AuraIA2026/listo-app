import { useState } from 'react'

/* ─── DATOS MOCK ─── */
const mockUser = {
  name: 'María González',
  city: 'Santo Domingo',
  rating: 4.8,
  totalServices: 12,
  photo: null,
  pendingServices: 2,
  completedServices: 8,
  cancelledServices: 2,
  addresses: ['🏠 Casa — Calle Duarte #45', '💼 Trabajo — Av. Winston Churchill'],
  favorites: [
    { icon: '⚡', name: 'Carlos Eléctrico', spec: 'Electricista', rating: 4.9 },
    { icon: '🔩', name: 'José Plomero',     spec: 'Plomero',      rating: 4.8 },
    { icon: '🔧', name: 'Pedro Mecánico',   spec: 'Mecánico',     rating: 5.0 },
  ],
  notifications: [
    { icon: '✅', text: 'Carlos aceptó tu solicitud',     time: 'Hace 5 min' },
    { icon: '🚗', text: 'El profesional va en camino',    time: 'Hace 20 min' },
    { icon: '🎉', text: 'Servicio completado con éxito',  time: 'Ayer' },
    { icon: '🎟', text: 'Nueva promoción disponible',     time: 'Hace 2 días' },
  ],
}

/* ─── TOGGLE SWITCH ─── */
function Toggle({ checked, onChange }) {
  return (
    <label style={{ position: 'relative', width: '46px', height: '26px', flexShrink: 0, cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '26px', transition: 'background .3s',
        background: checked ? '#F26000' : '#ccc',
      }}>
        <span style={{
          position: 'absolute', width: '20px', height: '20px', background: '#fff',
          borderRadius: '50%', top: '3px', left: checked ? '23px' : '3px',
          transition: 'left .3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </span>
    </label>
  )
}

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

/* ─── BOTÓN ACCIÓN ─── */
function ActionBtn({ onClick, children, danger }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '12px 14px', border: danger ? 'none' : '1.5px solid #EAECF0',
      borderRadius: '10px', background: danger ? '#FFEBEE' : '#F8F9FB',
      color: danger ? '#C62828' : '#333', fontSize: '14px', fontWeight: '600',
      cursor: 'pointer', textAlign: 'left', marginBottom: '8px', display: 'block',
    }}>{children}</button>
  )
}

/* ─── COMPONENTE PRINCIPAL ─── */
export default function BtnHamburguesaUsuario({ onClose, user = mockUser }) {
  const [open, setOpen]           = useState('solicitudes')
  const [notifOn, setNotifOn]     = useState(true)
  const [promoOn, setPromoOn]     = useState(true)
  const [coupon, setCoupon]       = useState('')
  const [couponOk, setCouponOk]   = useState(false)

  const toggle = s => setOpen(prev => prev === s ? null : s)

  const applyCoupon = () => {
    if (coupon.trim()) setCouponOk(true)
  }

  return (
    <>
      <style>{`
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
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

            {/* ══ 1. PERFIL ══ */}
            <div style={{
              background: '#fff', borderRadius: '20px', padding: '16px',
              marginBottom: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
              display: 'flex', alignItems: 'flex-start', gap: '14px',
            }}>
              <div style={{
                width: '68px', height: '68px', borderRadius: '16px', flexShrink: 0,
                background: 'linear-gradient(135deg,#F26000,#FF8C42)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '28px', fontWeight: '800',
                border: '3px solid #FFD580',
              }}>
                {user.photo ? <img src={user.photo} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 2px' }}>{user.name}</p>
                <p style={{ fontSize: '12px', color: '#F26000', fontWeight: '600', margin: '0 0 3px' }}>📍 {user.city}</p>
                <p style={{ fontSize: '11px', color: '#777', margin: '0 0 6px' }}>⭐ {user.rating} · {user.totalServices} servicios solicitados</p>
                <span style={{ background: '#FFF3EC', color: '#F26000', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>👤 Usuario</span>
              </div>
              <button style={{
                background: '#FFF3E0', border: '1.5px solid #F26000', color: '#F26000',
                borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
              }}>✏️ Editar</button>
            </div>

            {/* ══ 2. MIS SOLICITUDES ══ */}
            <Accordion title="🏠 Mis Solicitudes" open={open === 'solicitudes'} onToggle={() => toggle('solicitudes')}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                {[
                  { icon: '🕒', label: 'En proceso', val: user.pendingServices,   color: '#F57F17' },
                  { icon: '✅', label: 'Completados', val: user.completedServices, color: '#2E7D32' },
                  { icon: '❌', label: 'Cancelados',  val: user.cancelledServices, color: '#C62828' },
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
              }}>📅 Ver historial detallado</button>
            </Accordion>

            {/* ══ 3. MIS DIRECCIONES ══ */}
            <Accordion title="📌 Mis Direcciones" open={open === 'direcciones'} onToggle={() => toggle('direcciones')}>
              {user.addresses.map((a, i) => (
                <div key={i} style={{
                  background: '#FFF8F3', borderRadius: '10px', padding: '12px',
                  marginBottom: '8px', fontSize: '13px', color: '#333', fontWeight: '600',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>{a}</span>
                  <button style={{ background: 'none', border: 'none', color: '#F26000', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>✏️</button>
                </div>
              ))}
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
              {user.favorites.map((f, i) => (
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

            {/* ══ 7. SOPORTE ══ */}
            <Accordion title="📢 Soporte" open={open === 'soporte'} onToggle={() => toggle('soporte')}>
              <ActionBtn>🐛 Reportar un problema</ActionBtn>
              <ActionBtn>⭐ Calificar un servicio</ActionBtn>
              <ActionBtn>❓ Centro de ayuda</ActionBtn>
              <a href="https://wa.me/18099090455" target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                <ActionBtn>📲 WhatsApp: 809-909-0455</ActionBtn>
              </a>
              <a href="mailto:listopatron.app@gmail.com" style={{ display: 'block', textDecoration: 'none' }}>
                <ActionBtn>📧 listopatron.app@gmail.com</ActionBtn>
              </a>
            </Accordion>

            {/* ══ 8. NOTIFICACIONES ══ */}
            <Accordion title="🔔 Notificaciones" open={open === 'notifs'} onToggle={() => toggle('notifs')}>
              {user.notifications.map((n, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 0', borderBottom: i < user.notifications.length - 1 ? '1px solid #F1F3F6' : 'none',
                }}>
                  <span style={{ fontSize: '20px' }}>{n.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' }}>{n.text}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </Accordion>

            {/* ══ 9. CONFIGURACIÓN ══ */}
            <Accordion title="⚙️ Configuración" open={open === 'config'} onToggle={() => toggle('config')}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F3F6', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>🔔 Notificaciones</span>
                <Toggle checked={notifOn} onChange={() => setNotifOn(!notifOn)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F3F6', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>🎁 Promociones</span>
                <Toggle checked={promoOn} onChange={() => setPromoOn(!promoOn)} />
              </div>
              <ActionBtn>🔑 Cambiar contraseña</ActionBtn>
              <ActionBtn>🌐 Idioma</ActionBtn>
              <ActionBtn danger>🗑 Eliminar cuenta</ActionBtn>
              <button style={{
                width: '100%', background: '#FFEBEE', border: 'none', borderRadius: '10px',
                padding: '12px 14px', fontSize: '14px', fontWeight: '700', color: '#C62828',
                cursor: 'pointer', textAlign: 'left',
              }}>🚪 Cerrar sesión</button>
            </Accordion>

            {/* ══ 10. POSTULARSE COMO PROFESIONAL ══ */}
            <div style={{
              background: 'linear-gradient(135deg,#1C1C1C 0%,#3A1500 55%,#F26000 100%)',
              borderRadius: '16px', padding: '16px', marginBottom: '10px',
              display: 'flex', alignItems: 'center', gap: '12px',
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