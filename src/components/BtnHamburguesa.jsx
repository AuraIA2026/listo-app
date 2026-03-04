import { useState, useEffect, useRef } from 'react'
import './BtnHamburguesa.css'

/* ─── DATOS DE EJEMPLO ──────────────────────────────────────── */
const mockPro = {
  name: 'Carlos Méndez',
  specialty: 'Mecánico Automotriz',
  rating: 4.9,
  city: 'Santo Domingo',
  planStatus: 'active',
  contracts: 13,
  completedJobs: 47,
  requests: 62,
  pendingJobs: 3,
  photo: null,
  approved: true,
}

/* ─── PLANES ─── */
const planes = [
  {
    id: 'standard', num: '1', emoji: '🔹', nombre: 'Plan Estándar', contratos: '5 contratos',
    precio: 'RD$500', colorKey: 'standard', badge: 'BÁSICO',
    titulo: 'Plan Estándar — Empieza a crecer',
    subtitulo: 'El primer paso para conseguir más clientes.',
    descripcion: 'Con 5 contratos disponibles puedes comenzar a postularte y demostrar tu talento. Ideal para profesionales que están iniciando en la plataforma.',
    beneficios: ['✅ 5 contratos listos para usar', '✅ Aparece en búsquedas básicas', '✅ +3 contratos gratis al suscribirte'],
    cta: '¡El mejor punto de partida para construir tu reputación en Listo!',
  },
  {
    id: 'gold', num: '2', emoji: '🥇', nombre: 'Pack Gold', contratos: '10 contratos',
    precio: 'RD$1,000', colorKey: 'gold', badge: 'POPULAR',
    titulo: 'Pack Gold — El más popular',
    subtitulo: 'El favorito de los profesionales que quieren crecer rápido.',
    descripcion: 'Da el salto y consigue 10 contratos adicionales para postularte a los mejores proyectos.',
    beneficios: ['⚡ 10 contratos listos para usar', '⚡ Mayor visibilidad en búsquedas', '⚡ Más chances de cerrar ventas'],
    cta: '¡El plan más elegido por profesionales exitosos en Listo!',
  },
  {
    id: 'platinum', num: '3', emoji: '🥈', nombre: 'Pack Platinum', contratos: '15 contratos',
    precio: 'RD$1,500', colorKey: 'platinum', badge: 'ACTIVO',
    titulo: 'Pack Platinum — Para gente activa',
    subtitulo: 'Para los que no se detienen.',
    descripcion: 'Con 15 contratos disponibles puedes postularte sin pausas y mantener un flujo constante de nuevos clientes.',
    beneficios: ['🔥 15 contratos de alto valor', '🔥 Flujo constante de postulaciones', '🔥 Crecimiento sostenido garantizado'],
    cta: 'Para profesionales que entienden que más oportunidades = más ingresos.',
  },
  {
    id: 'vip', num: '4', emoji: '💎', nombre: 'VIP Ilimitado', contratos: '∞ contratos',
    precio: 'RD$2,000/mes', colorKey: 'vip', badge: 'ÉLITE',
    titulo: 'VIP Ilimitado — Sin techo',
    subtitulo: 'Sin límites. Sin restricciones. Máximo potencial.',
    descripcion: 'Postúlate a contratos ilimitados cada mes. Cero restricciones, máxima exposición, prioridad absoluta.',
    beneficios: ['🚀 Postulaciones ilimitadas cada mes', '🚀 Prioridad en resultados de búsqueda', '🚀 Ventaja competitiva absoluta'],
    cta: 'Si tu negocio son tus servicios, no puedes permitirte límites.',
  },
]

/* ─── PALETAS ─── */
const palettes = {
  standard: {
    primary: '#2E7D32',
    gradient: 'linear-gradient(145deg, #66BB6A 0%, #388E3C 40%, #2E7D32 70%, #4CAF50 100%)',
    shadow: 'rgba(46,125,50,0.55)', shine: 'rgba(165,214,167,0.65)',
    light: '#E8F5E9', btn3d: '#1B5E20', badgeBg: '#1B5E20',
    glow: '0 0 22px rgba(46,125,50,0.65), 0 0 44px rgba(46,125,50,0.3)',
  },
  gold: {
    primary: '#D4A017',
    gradient: 'linear-gradient(145deg, #F5C842 0%, #D4940A 40%, #B8780A 70%, #E8B832 100%)',
    shadow: 'rgba(212,160,23,0.55)', shine: 'rgba(255,240,160,0.65)',
    light: '#FFF8E0', btn3d: '#9A6E08', badgeBg: '#7A4D00',
    glow: '0 0 22px rgba(212,160,23,0.65), 0 0 44px rgba(212,160,23,0.3)',
  },
  platinum: {
    primary: '#7A8FA8',
    gradient: 'linear-gradient(145deg, #C8D4E0 0%, #8E9BAF 40%, #6B7A8D 70%, #B0BEC8 100%)',
    shadow: 'rgba(110,130,155,0.55)', shine: 'rgba(220,230,240,0.75)',
    light: '#F0F2F6', btn3d: '#4A5C70', badgeBg: '#3A5068',
    glow: '0 0 20px rgba(122,143,168,0.6), 0 0 40px rgba(122,143,168,0.25)',
  },
  vip: {
    primary: '#F26000',
    gradient: 'linear-gradient(145deg, #FF8C42 0%, #F26000 35%, #C94E00 65%, #FF7020 100%)',
    shadow: 'rgba(242,96,0,0.6)', shine: 'rgba(255,200,140,0.55)',
    light: '#FFF0E6', btn3d: '#A03800', badgeBg: '#6B1D00',
    glow: '0 0 24px rgba(242,96,0,0.7), 0 0 52px rgba(242,96,0,0.35)',
  },
}

/* ─── BOTÓN 3D ─── */
function Btn3D({ onClick, bg, shadow, children, secondary }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)} onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        width: '100%', padding: secondary ? '13px' : '16px',
        background: secondary ? 'linear-gradient(145deg,#F0F0F0,#D8D8D8)' : bg,
        color: secondary ? '#777' : 'white', border: 'none', borderRadius: '16px',
        fontSize: secondary ? '14px' : '16px', fontWeight: '900', cursor: 'pointer',
        boxShadow: pressed
          ? `0 2px 0 ${secondary ? '#B0B0B0' : shadow}`
          : `0 6px 0 ${secondary ? '#B0B0B0' : shadow}, 0 8px 24px ${secondary ? '#B0B0B0' : shadow}44`,
        transform: pressed ? 'translateY(4px)' : 'translateY(0)',
        transition: 'transform 0.08s, box-shadow 0.08s', marginBottom: '10px',
      }}
    >{children}</button>
  )
}

/* ─── TARJETA 3D ─── */
function PlanCard3D({ plan, onSelect }) {
  const [hover, setHover] = useState(false)
  const pal = palettes[plan.colorKey]
  const isVip = plan.colorKey === 'vip'
  return (
    <div
      onClick={() => onSelect(plan)}
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
        boxShadow: hover ? pal.glow : `inset 0 1px 0 ${pal.shine}`, transition: 'box-shadow 0.3s',
      }}>
        <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: '38%', background: `linear-gradient(180deg,${pal.shine} 0%,transparent 100%)`, borderRadius: '0 0 50% 50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '8px', right: '8px', background: pal.badgeBg, color: 'white', fontSize: '7px', fontWeight: '900', letterSpacing: '0.5px', padding: '2px 6px', borderRadius: '5px' }}>{plan.badge}</div>
        <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.18)', color: 'rgba(255,255,255,0.9)', width: '20px', height: '20px', borderRadius: '50%', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{plan.num}</div>
        <div style={{ marginTop: '12px', position: 'relative' }}>
          <span style={{ fontSize: '32px', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))' }}>{plan.emoji}</span>
          {isVip && <>
            <span style={{ position: 'absolute', top: '-8px', right: '-13px', fontSize: '13px', animation: 'twinkle 0.8s ease-in-out infinite alternate' }}>✨</span>
            <span style={{ position: 'absolute', bottom: '-5px', left: '-11px', fontSize: '11px', animation: 'twinkle 1.2s ease-in-out infinite alternate' }}>⭐</span>
          </>}
        </div>
        <p style={{ fontSize: '12px', fontWeight: '800', color: 'white', margin: '6px 0 0', textShadow: '0 1px 4px rgba(0,0,0,0.4)', textAlign: 'center', lineHeight: 1.2 }}>{plan.nombre}</p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: '600' }}>{plan.contratos}</p>
        <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: '8px', padding: '4px 10px', marginTop: '5px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <p style={{ fontSize: '13px', fontWeight: '900', color: 'white', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{plan.precio}</p>
        </div>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', letterSpacing: '0.5px' }}>TAP PARA VER →</p>
      </div>
    </div>
  )
}

/* ─── MODAL DETALLE PLAN ─── */
function PlanModal({ plan, onClose, onConfirm }) {
  const pal = palettes[plan.colorKey]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(7px)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '28px 28px 0 0', padding: '12px 22px 44px', width: '100%', maxWidth: '480px', maxHeight: '92vh', overflowY: 'auto', animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: '40px', height: '4px', background: '#E0E0E0', borderRadius: '2px', margin: '0 auto 18px' }} />
        <div style={{ background: pal.gradient, borderRadius: '20px', padding: '22px 20px', marginBottom: '20px', position: 'relative', overflow: 'hidden', boxShadow: `0 8px 32px ${pal.shadow}` }}>
          <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: '35%', background: `linear-gradient(180deg,${pal.shine} 0%,transparent 100%)`, borderRadius: '0 0 50% 50%', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '50px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}>{plan.emoji}</span>
            <div>
              <div style={{ background: 'rgba(0,0,0,0.18)', display: 'inline-block', color: 'rgba(255,255,255,0.95)', fontSize: '10px', fontWeight: '900', letterSpacing: '1px', padding: '2px 8px', borderRadius: '6px', marginBottom: '6px' }}>{plan.badge}</div>
              <h2 style={{ fontSize: '19px', fontWeight: '900', color: 'white', margin: '0 0 4px', textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>{plan.titulo}</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{plan.subtitulo}</p>
            </div>
          </div>
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '10px', padding: '6px 14px' }}>
              <span style={{ color: 'white', fontWeight: '900', fontSize: '18px' }}>{plan.precio}</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: '600' }}>{plan.contratos}</span>
          </div>
        </div>
        <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.75, margin: '0 0 18px' }}>{plan.descripcion}</p>
        <div style={{ background: pal.light, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1.5px solid ${pal.primary}22` }}>
          <p style={{ fontSize: '11px', fontWeight: '900', color: '#1C1C1C', letterSpacing: '0.8px', margin: '0 0 10px', textTransform: 'uppercase' }}>¿QUÉ INCLUYE?</p>
          {plan.beneficios.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: i < plan.beneficios.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
              <span style={{ fontSize: '14px' }}>{b}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '13px', fontWeight: '700', fontStyle: 'italic', color: pal.primary, textAlign: 'center', margin: '0 0 22px', lineHeight: 1.5 }}>"{plan.cta}"</p>
        <Btn3D onClick={onConfirm} bg={pal.gradient} shadow={pal.btn3d}>💎 Postularme al {plan.nombre}</Btn3D>
        <Btn3D onClick={onClose} secondary>🤔 Lo pensaré más tarde</Btn3D>
      </div>
    </div>
  )
}

/* ─── MODAL CONFIRMACIÓN ─── */
function ConfirmModal({ plan, onClose }) {
  const pal = palettes[plan.colorKey]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(7px)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '28px', padding: '40px 28px', width: '100%', maxWidth: '360px', textAlign: 'center', animation: 'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '64px', marginBottom: '14px' }}>✅</div>
        <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#1C1C1C', margin: '0 0 10px' }}>¡Solicitud enviada!</h3>
        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7, margin: '0 0 28px' }}>
          Un asesor de <strong>Listo</strong> te contactará pronto para activar tu <strong style={{ color: pal.primary }}>{plan.nombre}</strong>.
        </p>
        <Btn3D onClick={onClose} bg={pal.gradient} shadow={pal.btn3d}>Entendido 👍</Btn3D>
      </div>
    </div>
  )
}

/* ─── SECCIÓN PAGO ─── */
function PaymentSection({ plan, onBack, onConfirm }) {
  const pal = palettes[plan.colorKey]
  const [copied, setCopied] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const banks = [
    { name: 'Banreservas', account: '9607282472', holder: 'Julio de Jesús Francisco' },
    { name: 'Banco Popular', account: '746424456', holder: 'Julio de Jesús Francisco' },
  ]
  const copy = (text, idx) => { navigator.clipboard.writeText(text); setCopied(idx); setTimeout(() => setCopied(null), 2000) }
  return (
    <div className="pp-payment">
      <button className="pp-back-btn" onClick={onBack}>← Volver a planes</button>
      <h3 className="pp-pay-title">💳 Activar {plan.nombre}</h3>
      <p className="pp-pay-price" style={{ color: pal.primary }}>{plan.precio}</p>
      <p className="pp-pay-sub">📦 Total inicial: <strong>{plan.contratos} + 🎁 3 gratis</strong></p>
      <p className="pp-pay-inst">🏦 Realiza el depósito a:</p>
      {banks.map((b, i) => (
        <div key={i} className="pp-bank-card">
          <p className="pp-bank-name">🏦 {b.name}</p>
          <p className="pp-bank-acc">Cuenta: <strong>{b.account}</strong></p>
          <p className="pp-bank-holder">Titular: {b.holder}</p>
          <button className="pp-copy-btn" style={{ background: pal.primary }} onClick={() => copy(b.account, i)}>
            {copied === i ? '✅ Copiado' : '📋 Copiar número'}
          </button>
        </div>
      ))}
      <p className="pp-pay-inst" style={{ marginTop: 20 }}>📤 Enviar comprobante:</p>
      <div className="pp-send-options">
        <label className="pp-send-opt">
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => { setUploaded(true); setTimeout(() => onConfirm(), 800) }} />
          <span>📎 {uploaded ? '✅ Foto subida' : 'Subir foto del depósito'}</span>
        </label>
        <a className="pp-send-opt" href="https://wa.me/18099090455" target="_blank" rel="noreferrer">📲 WhatsApp: 809-909-0455</a>
        <a className="pp-send-opt" href="mailto:listopatron.app@gmail.com">📧 listopatron.app@gmail.com</a>
      </div>
      <div className="pp-pay-note">
        🔁 Tu estado cambiará a <strong>🟡 Pago en revisión</strong> al enviar el comprobante, y a <strong>🟢 Plan activo</strong> cuando el admin apruebe.
      </div>
    </div>
  )
}

/* ─── STATUS BADGE ─── */
function StatusBadge({ status }) {
  const map = {
    active:   { label: '🟢 Activo',           cls: 'status-active' },
    review:   { label: '🟡 Pago en revisión', cls: 'status-review' },
    inactive: { label: '🔴 Inactivo',          cls: 'status-inactive' },
  }
  const s = map[status] || map.inactive
  return <span className={`status-badge ${s.cls}`}>{s.label}</span>
}

/* ─── COMPONENTE PRINCIPAL ─── */
// ↓ Se añadió initialOpenSection='plans' como prop nuevo
export default function BtnHamburguesa({ onClose, pro = mockPro, initialOpenSection = 'plans' }) {
  const [section, setSection]         = useState('main')
  const [planDetalle, setPlanDetalle] = useState(null)
  const [confirmed, setConfirmed]     = useState(null)
  const [available, setAvailable]     = useState(true)

  // ↓ CAMBIO CLAVE: usa initialOpenSection en lugar de 'plans' fijo
  const [openSection, setOpenSection] = useState(initialOpenSection)

  const scrollRef = useRef(null)
  const planesRef = useRef(null)

  // Si se abre desde el VIPBanner, hace scroll automático a la sección de planes
  useEffect(() => {
    if (initialOpenSection === 'plans') {
      setTimeout(() => {
        if (planesRef.current && scrollRef.current) {
          scrollRef.current.scrollTop = planesRef.current.offsetTop - 10
        }
      }, 400)
    }
  }, [])

  const toggle = (s) => setOpenSection(prev => prev === s ? null : s)

  const ApplyForm = () => (
    <div className="pp-apply">
      <h3 className="pp-sec-title">📝 Postularse como Profesional</h3>
      {['Nombre completo', 'Especialidad', 'Teléfono', 'Ciudad', 'Años de experiencia'].map((f, i) => (
        <input key={i} className="pp-input" placeholder={f} />
      ))}
      <textarea className="pp-input pp-textarea" placeholder="Descripción" rows={3} />
      <label className="pp-file-label">📄 Subir cédula<input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} /></label>
      <label className="pp-file-label">🏅 Subir certificaciones<input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} /></label>
      <button className="pp-submit-btn">👉 Enviar Solicitud</button>
    </div>
  )

  const Stats = () => (
    <div className="pp-stats">
      <h3 className="pp-sec-title">📊 Mi Rendimiento</h3>
      <div className="pp-stats-grid">
        {[
          { icon: '📦', label: 'Contratos disponibles', val: pro.contracts },
          { icon: '📈', label: 'Trabajos completados',  val: pro.completedJobs },
          { icon: '⭐', label: 'Calificación promedio',  val: pro.rating },
          { icon: '📩', label: 'Solicitudes recibidas', val: pro.requests },
          { icon: '📌', label: 'Trabajos pendientes',   val: pro.pendingJobs },
        ].map((s, i) => (
          <div key={i} className="pp-stat-card">
            <span className="pp-stat-icon">{s.icon}</span>
            <span className="pp-stat-val">{s.val}</span>
            <span className="pp-stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes twinkle  { 0%{opacity:.3;transform:scale(.7) rotate(-10deg)} 100%{opacity:1;transform:scale(1.2) rotate(10deg)} }
        @keyframes slideUp  { from{transform:translateY(60px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes bounceIn { 0%{transform:scale(.6);opacity:0} 100%{transform:scale(1);opacity:1} }
      `}</style>

      <div className="pp-overlay" onClick={onClose}>
        <div className="pp-panel" onClick={e => e.stopPropagation()}>
          <div className="pp-handle" />
          <button className="pp-close" onClick={onClose}>✕</button>

          <div className="pp-scroll" ref={scrollRef}>

            {section === 'payment' && planDetalle ? (
              <PaymentSection plan={planDetalle} onBack={() => { setSection('main'); setPlanDetalle(null) }} onConfirm={() => setConfirmed(planDetalle)} />

            ) : section === 'apply' ? (
              <>
                <ApplyForm />
                <button className="pp-back-btn" onClick={() => setSection('main')}>← Volver</button>
              </>

            ) : section === 'stats' ? (
              <>
                <Stats />
                <button className="pp-back-btn" onClick={() => setSection('main')}>← Volver</button>
              </>

            ) : (
              <>
                {/* ══ 1. PERFIL — se oculta si viene del banner ══ */}
                {initialOpenSection !== 'plans' && (
                  <div className="pp-profile">
                    <div className="pp-avatar">
                      {pro.photo ? <img src={pro.photo} alt={pro.name} /> : <span>{pro.name.charAt(0)}</span>}
                    </div>
                    <div className="pp-profile-info">
                      <p className="pp-name">{pro.name}</p>
                      <p className="pp-spec">{pro.specialty}</p>
                      <p className="pp-meta">⭐ {pro.rating} &nbsp;|&nbsp; 📍 {pro.city}</p>
                      <StatusBadge status={pro.planStatus} />
                    </div>
                    <button className="pp-edit-btn">✏️ Editar</button>
                  </div>
                )}

                {/* ══ 2. PLANES 3D ══ */}
                <div className="pp-accordion" ref={planesRef}>
                  <button className="pp-acc-header" onClick={() => toggle('plans')}>
                    <span>👑 Planes para Profesionales</span>
                    <span className="pp-acc-arrow">{openSection === 'plans' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'plans' && (
                    <div className="pp-acc-body">
                      <p className="pp-plans-hint">Toca un plan para ver los detalles y activarlo.</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                        {planes.map((p, i) => (
                          <PlanCard3D key={i} plan={p} onSelect={selected => setPlanDetalle(selected)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ══ 3. BONOS ══ */}
                <div className="pp-accordion">
                  <button className="pp-acc-header" onClick={() => toggle('bonos')}>
                    <span>🎁 Bonos y Créditos Extra</span>
                    <span className="pp-acc-arrow">{openSection === 'bonos' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'bonos' && (
                    <div className="pp-acc-body">
                      {[
                        { icon: '⭐', text: '5 estrellas en una reseña', val: '+1 contrato' },
                        { icon: '📄', text: 'Perfil 100% completo',      val: '+2 contratos' },
                        { icon: '👥', text: 'Referido confirmado',        val: '+3 contratos' },
                      ].map((b, i) => (
                        <div key={i} className="pp-bono-item">
                          <span className="pp-bono-icon">{b.icon}</span>
                          <span className="pp-bono-text">{b.text}</span>
                          <span className="pp-bono-val">{b.val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ══ 4. RENDIMIENTO ══ */}
                <div className="pp-accordion">
                  <button className="pp-acc-header" onClick={() => toggle('stats')}>
                    <span>📊 Mi Rendimiento</span>
                    <span className="pp-acc-arrow">{openSection === 'stats' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'stats' && (
                    <div className="pp-acc-body">
                      <div className="pp-stats-mini">
                        {[
                          { icon: '📦', label: 'Contratos',    val: pro.contracts },
                          { icon: '📈', label: 'Completados',  val: pro.completedJobs },
                          { icon: '⭐', label: 'Calificación', val: pro.rating },
                          { icon: '📩', label: 'Solicitudes',  val: pro.requests },
                          { icon: '📌', label: 'Pendientes',   val: pro.pendingJobs },
                        ].map((s, i) => (
                          <div key={i} className="pp-stat-mini">
                            <span className="pp-stat-icon">{s.icon}</span>
                            <span className="pp-stat-val">{s.val}</span>
                            <span className="pp-stat-label">{s.label}</span>
                          </div>
                        ))}
                      </div>
                      <button className="pp-stats-btn" onClick={() => setSection('stats')}>👉 Ver estadísticas completas</button>
                    </div>
                  )}
                </div>

                {/* ══ 5. POSTULARSE (solo si no aprobado) ══ */}
                {!pro.approved && (
                  <div className="pp-accordion">
                    <button className="pp-acc-header" onClick={() => toggle('apply')}>
                      <span>📝 Postularse como Profesional</span>
                      <span className="pp-acc-arrow">{openSection === 'apply' ? '▲' : '▼'}</span>
                    </button>
                    {openSection === 'apply' && (
                      <div className="pp-acc-body">
                        <button className="pp-stats-btn" onClick={() => setSection('apply')}>👉 Abrir formulario</button>
                      </div>
                    )}
                  </div>
                )}

                {/* ══ 6. CONFIGURACIÓN ══ */}
                <div className="pp-accordion">
                  <button className="pp-acc-header" onClick={() => toggle('config')}>
                    <span>⚙️ Configuración</span>
                    <span className="pp-acc-arrow">{openSection === 'config' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'config' && (
                    <div className="pp-acc-body">
                      <div className="pp-config-row">
                        <span>🟢 Disponibilidad</span>
                        <label className="pp-toggle">
                          <input type="checkbox" checked={available} onChange={() => setAvailable(!available)} />
                          <span className="pp-toggle-slider" />
                        </label>
                      </div>
                      {['🔑 Cambiar contraseña', '✏️ Editar información personal'].map((item, i) => (
                        <button key={i} className="pp-config-btn">{item}</button>
                      ))}
                      <button className="pp-logout-btn">🚪 Cerrar sesión</button>
                    </div>
                  )}
                </div>

                <div style={{ height: 30 }} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL DETALLE PLAN ── */}
      {planDetalle && section !== 'payment' && !confirmed && (
        <PlanModal
          plan={planDetalle}
          onClose={() => setPlanDetalle(null)}
          onConfirm={() => { setSection('payment') }}
        />
      )}

      {/* ── MODAL CONFIRMACIÓN ── */}
      {confirmed && (
        <ConfirmModal
          plan={confirmed}
          onClose={() => {
            setConfirmed(null)
            setPlanDetalle(null)
            setSection('main')
            setOpenSection('plans')
          }}
        />
      )}
    </>
  )
}